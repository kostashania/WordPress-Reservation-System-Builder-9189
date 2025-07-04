<?php
defined('ABSPATH') or die('Direct access not allowed');

class TableReservationEmailHandler {
    
    private $settings;
    
    public function __construct() {
        $this->settings = get_option('table_reservation_settings', array());
    }
    
    public function send_reservation_notification($data, $reservation_id) {
        // Send notification to admin(s)
        $this->send_admin_notification($data, $reservation_id);
        
        // Send confirmation to customer
        $this->send_customer_confirmation($data, $reservation_id);
    }
    
    private function send_admin_notification($data, $reservation_id) {
        $to_emails = $this->parse_email_list($this->settings['notification_emails'] ?? '');
        
        if (empty($to_emails)) {
            return false;
        }
        
        $subject = sprintf(
            __('New Table Reservation Request #%d', 'table-reservation'),
            $reservation_id
        );
        
        $message = $this->build_admin_email_content($data, $reservation_id);
        $headers = $this->get_email_headers();
        
        foreach ($to_emails as $email) {
            wp_mail($email, $subject, $message, $headers);
        }
        
        return true;
    }
    
    private function send_customer_confirmation($data, $reservation_id) {
        if (empty($data['customer_email'])) {
            return false;
        }
        
        $subject = sprintf(
            __('Your Table Reservation Confirmation #%d', 'table-reservation'),
            $reservation_id
        );
        
        $message = $this->build_customer_email_content($data, $reservation_id);
        $headers = $this->get_email_headers();
        
        return wp_mail($data['customer_email'], $subject, $message, $headers);
    }
    
    private function build_admin_email_content($data, $reservation_id) {
        $template = $this->get_admin_email_template();
        
        $placeholders = array(
            '{{reservation_id}}' => $reservation_id,
            '{{customer_name}}' => $data['customer_name'],
            '{{customer_email}}' => $data['customer_email'],
            '{{customer_phone}}' => $data['customer_phone'] ?? 'Not provided',
            '{{reservation_date}}' => $this->format_date($data['reservation_date'] ?? ''),
            '{{reservation_time}}' => $this->format_time($data['reservation_time'] ?? ''),
            '{{guest_count}}' => $data['guest_count'] ?? 'Not specified',
            '{{special_requests}}' => !empty($data['special_requests']) ? $data['special_requests'] : 'None',
            '{{site_name}}' => get_bloginfo('name'),
            '{{site_url}}' => get_site_url(),
            '{{admin_url}}' => admin_url('admin.php?page=table-reservations&action=view&id=' . $reservation_id),
            '{{ip_address}}' => $_SERVER['REMOTE_ADDR'] ?? 'Unknown'
        );
        
        return str_replace(array_keys($placeholders), array_values($placeholders), $template);
    }
    
    private function build_customer_email_content($data, $reservation_id) {
        $template = $this->get_customer_email_template();
        
        $placeholders = array(
            '{{reservation_id}}' => $reservation_id,
            '{{customer_name}}' => $data['customer_name'],
            '{{reservation_date}}' => $this->format_date($data['reservation_date'] ?? ''),
            '{{reservation_time}}' => $this->format_time($data['reservation_time'] ?? ''),
            '{{guest_count}}' => $data['guest_count'] ?? 'Not specified',
            '{{special_requests}}' => !empty($data['special_requests']) ? $data['special_requests'] : 'None',
            '{{site_name}}' => get_bloginfo('name'),
            '{{site_url}}' => get_site_url(),
            '{{contact_email}}' => $this->settings['from_email'] ?? get_option('admin_email'),
            '{{from_name}}' => $this->settings['from_name'] ?? get_bloginfo('name')
        );
        
        return str_replace(array_keys($placeholders), array_values($placeholders), $template);
    }
    
    private function get_admin_email_template() {
        $default_template = "New table reservation request received:

Reservation Details:
- Reservation ID: {{reservation_id}}
- Date: {{reservation_date}}
- Time: {{reservation_time}}
- Number of Guests: {{guest_count}}

Customer Information:
- Name: {{customer_name}}
- Email: {{customer_email}}
- Phone: {{customer_phone}}

Special Requests:
{{special_requests}}

Additional Information:
- IP Address: {{ip_address}}
- Submitted: " . current_time('mysql') . "

To manage this reservation, visit: {{admin_url}}

---
This email was sent automatically from {{site_name}} ({{site_url}})";

        return apply_filters('table_reservation_admin_email_template', $default_template);
    }
    
    private function get_customer_email_template() {
        $default_template = "Dear {{customer_name}},

Thank you for your table reservation request!

Your Reservation Details:
- Reservation ID: {{reservation_id}}
- Date: {{reservation_date}}
- Time: {{reservation_time}}
- Number of Guests: {{guest_count}}

Special Requests:
{{special_requests}}

We will review your request and contact you soon to confirm your reservation.

If you have any questions or need to make changes, please contact us at {{contact_email}}.

Thank you for choosing {{site_name}}!

Best regards,
{{from_name}}

---
{{site_name}}
{{site_url}}";

        return apply_filters('table_reservation_customer_email_template', $default_template);
    }
    
    private function get_email_headers() {
        $from_name = $this->settings['from_name'] ?? get_bloginfo('name');
        $from_email = $this->settings['from_email'] ?? get_option('admin_email');
        
        $headers = array(
            'Content-Type: text/plain; charset=UTF-8',
            sprintf('From: %s <%s>', $from_name, $from_email),
            sprintf('Reply-To: %s <%s>', $from_name, $from_email)
        );
        
        return $headers;
    }
    
    private function parse_email_list($email_string) {
        if (empty($email_string)) {
            return array();
        }
        
        $emails = preg_split('/[\r\n,;]+/', $email_string);
        $valid_emails = array();
        
        foreach ($emails as $email) {
            $email = trim($email);
            if (is_email($email)) {
                $valid_emails[] = $email;
            }
        }
        
        return $valid_emails;
    }
    
    private function format_date($date) {
        if (empty($date)) {
            return 'Not specified';
        }
        
        $date_format = get_option('date_format');
        return date($date_format, strtotime($date));
    }
    
    private function format_time($time) {
        if (empty($time)) {
            return 'Not specified';
        }
        
        $time_format = get_option('time_format');
        return date($time_format, strtotime($time));
    }
}