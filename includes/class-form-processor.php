<?php
defined('ABSPATH') or die('Direct access not allowed');

class TableReservationFormProcessor {
    
    private $settings;
    
    public function __construct() {
        $this->settings = get_option('table_reservation_settings', array());
    }
    
    public function process_submission($data) {
        // Validate nonce
        if (!wp_verify_nonce($data['nonce'], 'table_reservation_nonce')) {
            return array(
                'success' => false,
                'data' => array('message' => __('Security verification failed.', 'table-reservation'))
            );
        }
        
        // Validate reCAPTCHA if enabled
        if (!empty($this->settings['enable_recaptcha'])) {
            $recaptcha_result = $this->verify_recaptcha($data['recaptcha_token'] ?? '');
            if (!$recaptcha_result['success']) {
                return array(
                    'success' => false,
                    'data' => array('message' => $recaptcha_result['message'])
                );
            }
            $data['recaptcha_score'] = $recaptcha_result['score'];
        }
        
        // Validate form data
        $validation_result = $this->validate_form_data($data);
        if (!$validation_result['success']) {
            return $validation_result;
        }
        
        // Additional business logic validation
        $business_validation = $this->validate_business_rules($data);
        if (!$business_validation['success']) {
            return $business_validation;
        }
        
        // Save to database
        $reservation_id = TableReservationDatabase::insert_reservation($data);
        
        if (!$reservation_id) {
            return array(
                'success' => false,
                'data' => array('message' => __('Failed to save reservation. Please try again.', 'table-reservation'))
            );
        }
        
        // Send email notifications
        if (!empty($this->settings['enable_email_notifications'])) {
            $email_handler = new TableReservationEmailHandler();
            $email_handler->send_reservation_notification($data, $reservation_id);
        }
        
        // Trigger action hook for custom integrations
        do_action('table_reservation_submitted', $reservation_id, $data);
        
        return array(
            'success' => true,
            'data' => array(
                'message' => $this->settings['success_message'] ?? __('Thank you! Your reservation request has been submitted.', 'table-reservation'),
                'reservation_id' => $reservation_id
            )
        );
    }
    
    private function verify_recaptcha($token) {
        if (empty($token)) {
            return array(
                'success' => false,
                'message' => __('reCAPTCHA token is missing.', 'table-reservation')
            );
        }
        
        $recaptcha = new TableReservationRecaptcha();
        return $recaptcha->verify_token($token, $this->settings['recaptcha_secret_key'], $this->settings['recaptcha_threshold'] ?? 0.5);
    }
    
    private function validate_form_data($data) {
        $errors = array();
        
        // Required fields
        $required_fields = array(
            'customer_name' => __('Name is required.', 'table-reservation'),
            'customer_email' => __('Email is required.', 'table-reservation')
        );
        
        if (!empty($this->settings['show_date_picker'])) {
            $required_fields['reservation_date'] = __('Reservation date is required.', 'table-reservation');
        }
        
        if (!empty($this->settings['show_time_picker'])) {
            $required_fields['reservation_time'] = __('Reservation time is required.', 'table-reservation');
        }
        
        if (!empty($this->settings['show_guest_count'])) {
            $required_fields['guest_count'] = __('Guest count is required.', 'table-reservation');
        }
        
        if (!empty($this->settings['require_phone'])) {
            $required_fields['customer_phone'] = __('Phone number is required.', 'table-reservation');
        }
        
        foreach ($required_fields as $field => $message) {
            if (empty($data[$field])) {
                $errors[] = $message;
            }
        }
        
        // Validate email format
        if (!empty($data['customer_email']) && !is_email($data['customer_email'])) {
            $errors[] = __('Please enter a valid email address.', 'table-reservation');
        }
        
        // Validate date format and future date
        if (!empty($data['reservation_date'])) {
            $date = DateTime::createFromFormat('Y-m-d', $data['reservation_date']);
            if (!$date || $date->format('Y-m-d') !== $data['reservation_date']) {
                $errors[] = __('Please enter a valid date.', 'table-reservation');
            } elseif ($date < new DateTime('today')) {
                $errors[] = __('Reservation date must be today or in the future.', 'table-reservation');
            }
        }
        
        // Validate time format
        if (!empty($data['reservation_time'])) {
            $time = DateTime::createFromFormat('H:i', $data['reservation_time']);
            if (!$time || $time->format('H:i') !== $data['reservation_time']) {
                $errors[] = __('Please enter a valid time.', 'table-reservation');
            }
        }
        
        // Validate guest count
        if (!empty($data['guest_count'])) {
            $guest_count = intval($data['guest_count']);
            $max_guests = intval($this->settings['max_guests'] ?? 12);
            
            if ($guest_count < 1) {
                $errors[] = __('Guest count must be at least 1.', 'table-reservation');
            } elseif ($guest_count > $max_guests) {
                $errors[] = sprintf(__('Guest count cannot exceed %d.', 'table-reservation'), $max_guests);
            }
        }
        
        // Validate phone number format (basic validation)
        if (!empty($data['customer_phone'])) {
            $phone = preg_replace('/[^\d+\-\(\)\s]/', '', $data['customer_phone']);
            if (strlen($phone) < 10) {
                $errors[] = __('Please enter a valid phone number.', 'table-reservation');
            }
        }
        
        if (!empty($errors)) {
            return array(
                'success' => false,
                'data' => array('message' => implode('<br>', $errors))
            );
        }
        
        return array('success' => true);
    }
    
    private function validate_business_rules($data) {
        // Check for duplicate reservations (same email, date, time within 2 hours)
        if (!empty($data['customer_email']) && !empty($data['reservation_date']) && !empty($data['reservation_time'])) {
            global $wpdb;
            $table_name = $wpdb->prefix . TableReservationDatabase::TABLE_NAME;
            
            $existing = $wpdb->get_var($wpdb->prepare(
                "SELECT COUNT(*) FROM $table_name 
                WHERE customer_email = %s 
                AND reservation_date = %s 
                AND ABS(TIME_TO_SEC(reservation_time) - TIME_TO_SEC(%s)) < 7200 
                AND status IN ('pending', 'confirmed')
                AND created_at > DATE_SUB(NOW(), INTERVAL 1 DAY)",
                $data['customer_email'],
                $data['reservation_date'],
                $data['reservation_time']
            ));
            
            if ($existing > 0) {
                return array(
                    'success' => false,
                    'data' => array('message' => __('You already have a reservation around this time. Please choose a different time or contact us directly.', 'table-reservation'))
                );
            }
        }
        
        // Check for blacklisted IPs or emails (if you want to implement this)
        $ip_address = TableReservationDatabase::get_client_ip();
        
        // Apply custom business rules filter
        $business_rules_result = apply_filters('table_reservation_validate_business_rules', array('success' => true), $data);
        
        return $business_rules_result;
    }
}