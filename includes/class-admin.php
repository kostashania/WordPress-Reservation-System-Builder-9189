<?php
defined('ABSPATH') or die('Direct access not allowed');

class TableReservationAdmin {
    
    public function __construct() {
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'register_settings'));
        add_action('admin_notices', array($this, 'admin_notices'));
    }
    
    public function add_admin_menu() {
        // Main menu page
        add_menu_page(
            __('Table Reservations', 'table-reservation'),
            __('Reservations', 'table-reservation'),
            'manage_options',
            'table-reservations',
            array($this, 'reservations_page'),
            'dashicons-calendar-alt',
            30
        );
        
        // Submenu pages
        add_submenu_page(
            'table-reservations',
            __('All Reservations', 'table-reservation'),
            __('All Reservations', 'table-reservation'),
            'manage_options',
            'table-reservations',
            array($this, 'reservations_page')
        );
        
        add_submenu_page(
            'table-reservations',
            __('Settings', 'table-reservation'),
            __('Settings', 'table-reservation'),
            'manage_options',
            'table-reservation-settings',
            array($this, 'settings_page')
        );
        
        add_submenu_page(
            'table-reservations',
            __('Form Builder', 'table-reservation'),
            __('Form Builder', 'table-reservation'),
            'manage_options',
            'table-reservation-builder',
            array($this, 'builder_page')
        );
    }
    
    public function register_settings() {
        register_setting('table_reservation_settings', 'table_reservation_settings', array($this, 'sanitize_settings'));
    }
    
    public function sanitize_settings($input) {
        $sanitized = array();
        
        // Form content
        $sanitized['form_title'] = sanitize_text_field($input['form_title'] ?? '');
        $sanitized['form_subtitle'] = sanitize_text_field($input['form_subtitle'] ?? '');
        $sanitized['button_text'] = sanitize_text_field($input['button_text'] ?? '');
        $sanitized['success_message'] = sanitize_textarea_field($input['success_message'] ?? '');
        
        // reCAPTCHA settings
        $sanitized['enable_recaptcha'] = !empty($input['enable_recaptcha']);
        $sanitized['recaptcha_site_key'] = sanitize_text_field($input['recaptcha_site_key'] ?? '');
        $sanitized['recaptcha_secret_key'] = sanitize_text_field($input['recaptcha_secret_key'] ?? '');
        $sanitized['recaptcha_threshold'] = floatval($input['recaptcha_threshold'] ?? 0.5);
        
        // Email settings
        $sanitized['enable_email_notifications'] = !empty($input['enable_email_notifications']);
        $sanitized['notification_emails'] = sanitize_textarea_field($input['notification_emails'] ?? '');
        $sanitized['from_name'] = sanitize_text_field($input['from_name'] ?? '');
        $sanitized['from_email'] = sanitize_email($input['from_email'] ?? '');
        $sanitized['email_subject'] = sanitize_text_field($input['email_subject'] ?? '');
        
        // Form settings
        $sanitized['show_date_picker'] = !empty($input['show_date_picker']);
        $sanitized['show_time_picker'] = !empty($input['show_time_picker']);
        $sanitized['show_guest_count'] = !empty($input['show_guest_count']);
        $sanitized['show_special_requests'] = !empty($input['show_special_requests']);
        $sanitized['require_phone'] = !empty($input['require_phone']);
        $sanitized['max_guests'] = intval($input['max_guests'] ?? 12);
        
        // Styling
        $sanitized['form_style'] = sanitize_text_field($input['form_style'] ?? 'modern');
        $sanitized['color_scheme'] = sanitize_text_field($input['color_scheme'] ?? 'blue');
        $sanitized['button_color'] = sanitize_hex_color($input['button_color'] ?? '#3b82f6');
        $sanitized['background_color'] = sanitize_hex_color($input['background_color'] ?? '#ffffff');
        
        return $sanitized;
    }
    
    public function reservations_page() {
        $action = $_GET['action'] ?? 'list';
        $reservation_id = $_GET['id'] ?? null;
        
        switch ($action) {
            case 'view':
                $this->view_reservation($reservation_id);
                break;
            case 'edit':
                $this->edit_reservation($reservation_id);
                break;
            case 'delete':
                $this->delete_reservation($reservation_id);
                break;
            default:
                $this->list_reservations();
                break;
        }
    }
    
    private function list_reservations() {
        // Handle bulk actions
        if (isset($_POST['action']) && $_POST['action'] !== '-1') {
            $this->handle_bulk_actions();
        }
        
        // Get reservations
        $page = $_GET['paged'] ?? 1;
        $per_page = 20;
        $offset = ($page - 1) * $per_page;
        
        $args = array(
            'limit' => $per_page,
            'offset' => $offset
        );
        
        // Add filters
        if (!empty($_GET['status'])) {
            $args['status'] = sanitize_text_field($_GET['status']);
        }
        
        if (!empty($_GET['date_from'])) {
            $args['date_from'] = sanitize_text_field($_GET['date_from']);
        }
        
        if (!empty($_GET['date_to'])) {
            $args['date_to'] = sanitize_text_field($_GET['date_to']);
        }
        
        $reservations = TableReservationDatabase::get_reservations($args);
        $stats = TableReservationDatabase::get_stats();
        
        include TABLE_RESERVATION_PLUGIN_DIR . 'templates/admin/reservations-list.php';
    }
    
    private function view_reservation($id) {
        $reservation = TableReservationDatabase::get_reservation($id);
        
        if (!$reservation) {
            wp_die(__('Reservation not found.', 'table-reservation'));
        }
        
        include TABLE_RESERVATION_PLUGIN_DIR . 'templates/admin/reservation-view.php';
    }
    
    private function handle_bulk_actions() {
        if (!wp_verify_nonce($_POST['_wpnonce'], 'bulk-reservations')) {
            wp_die(__('Security check failed.', 'table-reservation'));
        }
        
        $action = $_POST['action'];
        $reservation_ids = $_POST['reservation'] ?? array();
        
        if (empty($reservation_ids)) {
            return;
        }
        
        $count = 0;
        foreach ($reservation_ids as $id) {
            switch ($action) {
                case 'confirm':
                    if (TableReservationDatabase::update_reservation_status($id, 'confirmed')) {
                        $count++;
                    }
                    break;
                case 'cancel':
                    if (TableReservationDatabase::update_reservation_status($id, 'cancelled')) {
                        $count++;
                    }
                    break;
                case 'delete':
                    if (TableReservationDatabase::delete_reservation($id)) {
                        $count++;
                    }
                    break;
            }
        }
        
        $message = sprintf(
            _n('%d reservation updated.', '%d reservations updated.', $count, 'table-reservation'),
            $count
        );
        
        add_settings_error('table_reservation_messages', 'bulk_action', $message, 'success');
    }
    
    public function settings_page() {
        if (isset($_POST['submit'])) {
            update_option('table_reservation_settings', $this->sanitize_settings($_POST));
            add_settings_error('table_reservation_messages', 'settings_saved', __('Settings saved.', 'table-reservation'), 'success');
        }
        
        $settings = get_option('table_reservation_settings', array());
        include TABLE_RESERVATION_PLUGIN_DIR . 'templates/admin/settings.php';
    }
    
    public function builder_page() {
        $settings = get_option('table_reservation_settings', array());
        include TABLE_RESERVATION_PLUGIN_DIR . 'templates/admin/form-builder.php';
    }
    
    public function admin_notices() {
        settings_errors('table_reservation_messages');
    }
}