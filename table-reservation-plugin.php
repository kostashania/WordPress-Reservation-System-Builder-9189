<?php
/*
Plugin Name: Table Reservation Builder
Plugin URI: https://questera.ai/table-reservation-builder
Description: A complete table reservation system with customizable forms, reCAPTCHA v3, email notifications, and database storage. Built by Questera AI.
Version: 1.0.0
Author: Questera AI
Author URI: https://questera.ai
Text Domain: table-reservation
Domain Path: /languages
License: GPL v2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html
Requires at least: 5.0
Tested up to: 6.4
Requires PHP: 7.4
*/

// Prevent direct access
defined('ABSPATH') or die('Direct access not allowed');

// Define plugin constants
define('TABLE_RESERVATION_VERSION', '1.0.0');
define('TABLE_RESERVATION_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('TABLE_RESERVATION_PLUGIN_URL', plugin_dir_url(__FILE__));
define('TABLE_RESERVATION_PLUGIN_FILE', __FILE__);

// Main plugin class
class TableReservationPlugin {
    
    public function __construct() {
        // Hook into WordPress
        add_action('plugins_loaded', array($this, 'init'));
        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
        register_uninstall_hook(__FILE__, array('TableReservationPlugin', 'uninstall'));
    }
    
    public function init() {
        // Load text domain for translations
        load_plugin_textdomain('table-reservation', false, dirname(plugin_basename(__FILE__)) . '/languages');
        
        // Include required files
        $this->includes();
        
        // Initialize components
        $this->init_hooks();
    }
    
    private function includes() {
        require_once TABLE_RESERVATION_PLUGIN_DIR . 'includes/class-database.php';
        require_once TABLE_RESERVATION_PLUGIN_DIR . 'includes/class-admin.php';
        require_once TABLE_RESERVATION_PLUGIN_DIR . 'includes/class-shortcodes.php';
        require_once TABLE_RESERVATION_PLUGIN_DIR . 'includes/class-form-processor.php';
        require_once TABLE_RESERVATION_PLUGIN_DIR . 'includes/class-email-handler.php';
        require_once TABLE_RESERVATION_PLUGIN_DIR . 'includes/class-recaptcha.php';
    }
    
    private function init_hooks() {
        // Initialize classes
        new TableReservationDatabase();
        new TableReservationAdmin();
        new TableReservationShortcodes();
        new TableReservationFormProcessor();
        
        // Enqueue scripts and styles
        add_action('wp_enqueue_scripts', array($this, 'enqueue_public_scripts'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));
        
        // AJAX handlers
        add_action('wp_ajax_submit_table_reservation', array($this, 'handle_ajax_submission'));
        add_action('wp_ajax_nopriv_submit_table_reservation', array($this, 'handle_ajax_submission'));
    }
    
    public function activate() {
        // Create database tables
        TableReservationDatabase::create_tables();
        
        // Set default options
        $this->set_default_options();
        
        // Flush rewrite rules
        flush_rewrite_rules();
    }
    
    public function deactivate() {
        // Clean up temporary data if needed
        flush_rewrite_rules();
    }
    
    public static function uninstall() {
        // Remove all plugin data if user chooses to delete plugin data
        if (get_option('table_reservation_delete_data_on_uninstall')) {
            // Drop tables
            TableReservationDatabase::drop_tables();
            
            // Delete options
            delete_option('table_reservation_settings');
            delete_option('table_reservation_delete_data_on_uninstall');
        }
    }
    
    private function set_default_options() {
        $default_settings = array(
            'form_title' => __('Reserve Your Table', 'table-reservation'),
            'form_subtitle' => __('Book your perfect dining experience', 'table-reservation'),
            'button_text' => __('Make Reservation', 'table-reservation'),
            'success_message' => __('Thank you! Your reservation request has been submitted. We will contact you soon to confirm.', 'table-reservation'),
            'enable_recaptcha' => false,
            'recaptcha_site_key' => '',
            'recaptcha_secret_key' => '',
            'recaptcha_threshold' => 0.5,
            'enable_email_notifications' => true,
            'notification_emails' => get_option('admin_email'),
            'from_name' => get_bloginfo('name'),
            'from_email' => get_option('admin_email'),
            'form_style' => 'modern',
            'color_scheme' => 'blue',
            'show_date_picker' => true,
            'show_time_picker' => true,
            'show_guest_count' => true,
            'show_special_requests' => true,
            'max_guests' => 12,
            'require_phone' => true,
            'date_format' => 'Y-m-d',
            'time_format' => 'H:i'
        );
        
        add_option('table_reservation_settings', $default_settings);
    }
    
    public function enqueue_public_scripts() {
        // CSS
        wp_enqueue_style(
            'table-reservation-public',
            TABLE_RESERVATION_PLUGIN_URL . 'assets/css/public.css',
            array(),
            TABLE_RESERVATION_VERSION
        );
        
        // JavaScript
        wp_enqueue_script(
            'table-reservation-public',
            TABLE_RESERVATION_PLUGIN_URL . 'assets/js/public.js',
            array('jquery'),
            TABLE_RESERVATION_VERSION,
            true
        );
        
        // Localize script
        $settings = get_option('table_reservation_settings', array());
        wp_localize_script(
            'table-reservation-public',
            'tableReservationAjax',
            array(
                'ajaxUrl' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('table_reservation_nonce'),
                'recaptchaSiteKey' => isset($settings['recaptcha_site_key']) ? $settings['recaptcha_site_key'] : '',
                'enableRecaptcha' => isset($settings['enable_recaptcha']) ? $settings['enable_recaptcha'] : false,
                'strings' => array(
                    'submitting' => __('Submitting...', 'table-reservation'),
                    'error' => __('An error occurred. Please try again.', 'table-reservation')
                )
            )
        );
        
        // Enqueue reCAPTCHA if enabled
        if (!empty($settings['enable_recaptcha']) && !empty($settings['recaptcha_site_key'])) {
            wp_enqueue_script(
                'google-recaptcha',
                'https://www.google.com/recaptcha/api.js?render=' . $settings['recaptcha_site_key'],
                array(),
                null
            );
        }
    }
    
    public function enqueue_admin_scripts($hook) {
        // Only load on our admin pages
        if (strpos($hook, 'table-reservation') === false) {
            return;
        }
        
        wp_enqueue_style(
            'table-reservation-admin',
            TABLE_RESERVATION_PLUGIN_URL . 'assets/css/admin.css',
            array(),
            TABLE_RESERVATION_VERSION
        );
        
        wp_enqueue_script(
            'table-reservation-admin',
            TABLE_RESERVATION_PLUGIN_URL . 'assets/js/admin.js',
            array('jquery'),
            TABLE_RESERVATION_VERSION,
            true
        );
        
        wp_localize_script(
            'table-reservation-admin',
            'tableReservationAdmin',
            array(
                'ajaxUrl' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('table_reservation_admin_nonce')
            )
        );
    }
    
    public function handle_ajax_submission() {
        // Verify nonce
        if (!wp_verify_nonce($_POST['nonce'], 'table_reservation_nonce')) {
            wp_send_json_error(array('message' => __('Security check failed.', 'table-reservation')));
        }
        
        // Process the form
        $processor = new TableReservationFormProcessor();
        $result = $processor->process_submission($_POST);
        
        if ($result['success']) {
            wp_send_json_success($result['data']);
        } else {
            wp_send_json_error($result['data']);
        }
    }
}

// Initialize the plugin
new TableReservationPlugin();