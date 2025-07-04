<?php
defined('ABSPATH') or die('Direct access not allowed');

class TableReservationShortcodes {
    
    public function __construct() {
        add_shortcode('table_reservation_form', array($this, 'reservation_form_shortcode'));
        add_shortcode('table_reservation_list', array($this, 'reservation_list_shortcode'));
        add_shortcode('table_reservation_calendar', array($this, 'reservation_calendar_shortcode'));
    }
    
    public function reservation_form_shortcode($atts) {
        $atts = shortcode_atts(array(
            'style' => '',
            'title' => '',
            'subtitle' => '',
            'button_text' => '',
            'success_message' => '',
            'show_date' => 'true',
            'show_time' => 'true',
            'show_guests' => 'true',
            'show_special_requests' => 'true',
            'max_guests' => '',
            'color_scheme' => '',
            'form_id' => 'table-reservation-form-' . rand(1000, 9999)
        ), $atts);
        
        // Get settings
        $settings = get_option('table_reservation_settings', array());
        
        // Override settings with shortcode attributes
        if (!empty($atts['title'])) {
            $settings['form_title'] = $atts['title'];
        }
        if (!empty($atts['subtitle'])) {
            $settings['form_subtitle'] = $atts['subtitle'];
        }
        if (!empty($atts['button_text'])) {
            $settings['button_text'] = $atts['button_text'];
        }
        if (!empty($atts['success_message'])) {
            $settings['success_message'] = $atts['success_message'];
        }
        if (!empty($atts['max_guests'])) {
            $settings['max_guests'] = intval($atts['max_guests']);
        }
        if (!empty($atts['color_scheme'])) {
            $settings['color_scheme'] = $atts['color_scheme'];
        }
        
        // Boolean attributes
        $settings['show_date_picker'] = $atts['show_date'] === 'true';
        $settings['show_time_picker'] = $atts['show_time'] === 'true';
        $settings['show_guest_count'] = $atts['show_guests'] === 'true';
        $settings['show_special_requests'] = $atts['show_special_requests'] === 'true';
        
        ob_start();
        include TABLE_RESERVATION_PLUGIN_DIR . 'templates/public/reservation-form.php';
        return ob_get_clean();
    }
    
    public function reservation_list_shortcode($atts) {
        $atts = shortcode_atts(array(
            'limit' => 10,
            'status' => '',
            'show_details' => 'false',
            'date_from' => '',
            'date_to' => ''
        ), $atts);
        
        $args = array(
            'limit' => intval($atts['limit'])
        );
        
        if (!empty($atts['status'])) {
            $args['status'] = sanitize_text_field($atts['status']);
        }
        
        if (!empty($atts['date_from'])) {
            $args['date_from'] = sanitize_text_field($atts['date_from']);
        }
        
        if (!empty($atts['date_to'])) {
            $args['date_to'] = sanitize_text_field($atts['date_to']);
        }
        
        $reservations = TableReservationDatabase::get_reservations($args);
        $show_details = $atts['show_details'] === 'true';
        
        ob_start();
        include TABLE_RESERVATION_PLUGIN_DIR . 'templates/public/reservation-list.php';
        return ob_get_clean();
    }
    
    public function reservation_calendar_shortcode($atts) {
        $atts = shortcode_atts(array(
            'month' => date('Y-m'),
            'view' => 'month'
        ), $atts);
        
        $month = sanitize_text_field($atts['month']);
        $view = sanitize_text_field($atts['view']);
        
        // Get reservations for the month
        $args = array(
            'date_from' => $month . '-01',
            'date_to' => date('Y-m-t', strtotime($month . '-01')),
            'limit' => 1000
        );
        
        $reservations = TableReservationDatabase::get_reservations($args);
        
        ob_start();
        include TABLE_RESERVATION_PLUGIN_DIR . 'templates/public/reservation-calendar.php';
        return ob_get_clean();
    }
}