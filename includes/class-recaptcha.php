<?php
defined('ABSPATH') or die('Direct access not allowed');

class TableReservationRecaptcha {
    
    const VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';
    
    public function verify_token($token, $secret_key, $threshold = 0.5) {
        if (empty($token) || empty($secret_key)) {
            return array(
                'success' => false,
                'message' => __('reCAPTCHA configuration error.', 'table-reservation'),
                'score' => 0
            );
        }
        
        $response = wp_remote_post(self::VERIFY_URL, array(
            'body' => array(
                'secret' => $secret_key,
                'response' => $token,
                'remoteip' => $this->get_client_ip()
            ),
            'timeout' => 30
        ));
        
        if (is_wp_error($response)) {
            error_log('reCAPTCHA verification error: ' . $response->get_error_message());
            return array(
                'success' => false,
                'message' => __('reCAPTCHA verification failed. Please try again.', 'table-reservation'),
                'score' => 0
            );
        }
        
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        if (!$data || !isset($data['success'])) {
            return array(
                'success' => false,
                'message' => __('reCAPTCHA response invalid.', 'table-reservation'),
                'score' => 0
            );
        }
        
        if (!$data['success']) {
            $error_codes = $data['error-codes'] ?? array();
            error_log('reCAPTCHA verification failed: ' . implode(', ', $error_codes));
            
            return array(
                'success' => false,
                'message' => __('reCAPTCHA verification failed. Please refresh the page and try again.', 'table-reservation'),
                'score' => 0
            );
        }
        
        $score = $data['score'] ?? 0;
        
        if ($score < $threshold) {
            return array(
                'success' => false,
                'message' => __('Security verification failed. Please try again.', 'table-reservation'),
                'score' => $score
            );
        }
        
        return array(
            'success' => true,
            'message' => 'reCAPTCHA verification successful',
            'score' => $score
        );
    }
    
    private function get_client_ip() {
        $ip_keys = array('HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP', 'HTTP_CLIENT_IP', 'REMOTE_ADDR');
        
        foreach ($ip_keys as $key) {
            if (array_key_exists($key, $_SERVER) === true) {
                $ip = $_SERVER[$key];
                if (strpos($ip, ',') !== false) {
                    $ip = explode(',', $ip)[0];
                }
                $ip = trim($ip);
                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                    return $ip;
                }
            }
        }
        
        return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    }
}