<?php
defined('ABSPATH') or die('Direct access not allowed');

class TableReservationDatabase {
    
    const TABLE_NAME = 'table_reservations';
    
    public static function create_tables() {
        global $wpdb;
        
        $table_name = $wpdb->prefix . self::TABLE_NAME;
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE $table_name (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            reservation_date date NOT NULL,
            reservation_time time NOT NULL,
            guest_count smallint(5) unsigned NOT NULL,
            customer_name varchar(100) NOT NULL,
            customer_email varchar(100) NOT NULL,
            customer_phone varchar(20) NOT NULL,
            special_requests text,
            status varchar(20) DEFAULT 'pending',
            recaptcha_score decimal(3,2) DEFAULT NULL,
            ip_address varchar(45),
            user_agent text,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY reservation_date (reservation_date),
            KEY status (status),
            KEY customer_email (customer_email),
            KEY created_at (created_at)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
        
        // Update database version
        update_option('table_reservation_db_version', TABLE_RESERVATION_VERSION);
    }
    
    public static function drop_tables() {
        global $wpdb;
        $table_name = $wpdb->prefix . self::TABLE_NAME;
        $wpdb->query("DROP TABLE IF EXISTS $table_name");
    }
    
    public static function insert_reservation($data) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . self::TABLE_NAME;
        
        $insert_data = array(
            'reservation_date' => sanitize_text_field($data['reservation_date']),
            'reservation_time' => sanitize_text_field($data['reservation_time']),
            'guest_count' => intval($data['guest_count']),
            'customer_name' => sanitize_text_field($data['customer_name']),
            'customer_email' => sanitize_email($data['customer_email']),
            'customer_phone' => sanitize_text_field($data['customer_phone']),
            'special_requests' => sanitize_textarea_field($data['special_requests'] ?? ''),
            'status' => 'pending',
            'recaptcha_score' => isset($data['recaptcha_score']) ? floatval($data['recaptcha_score']) : null,
            'ip_address' => self::get_client_ip(),
            'user_agent' => sanitize_text_field($_SERVER['HTTP_USER_AGENT'] ?? '')
        );
        
        $format = array('%s', '%s', '%d', '%s', '%s', '%s', '%s', '%s', '%f', '%s', '%s');
        
        $result = $wpdb->insert($table_name, $insert_data, $format);
        
        if ($result === false) {
            error_log('Table Reservation DB Error: ' . $wpdb->last_error);
            return false;
        }
        
        return $wpdb->insert_id;
    }
    
    public static function get_reservations($args = array()) {
        global $wpdb;
        
        $defaults = array(
            'limit' => 20,
            'offset' => 0,
            'status' => null,
            'date_from' => null,
            'date_to' => null,
            'orderby' => 'created_at',
            'order' => 'DESC'
        );
        
        $args = wp_parse_args($args, $defaults);
        $table_name = $wpdb->prefix . self::TABLE_NAME;
        
        $where_conditions = array('1=1');
        $where_values = array();
        
        if ($args['status']) {
            $where_conditions[] = 'status = %s';
            $where_values[] = $args['status'];
        }
        
        if ($args['date_from']) {
            $where_conditions[] = 'reservation_date >= %s';
            $where_values[] = $args['date_from'];
        }
        
        if ($args['date_to']) {
            $where_conditions[] = 'reservation_date <= %s';
            $where_values[] = $args['date_to'];
        }
        
        $where_clause = implode(' AND ', $where_conditions);
        
        $sql = "SELECT * FROM $table_name WHERE $where_clause ORDER BY {$args['orderby']} {$args['order']} LIMIT %d OFFSET %d";
        $where_values[] = intval($args['limit']);
        $where_values[] = intval($args['offset']);
        
        if (!empty($where_values)) {
            $sql = $wpdb->prepare($sql, $where_values);
        }
        
        return $wpdb->get_results($sql, ARRAY_A);
    }
    
    public static function get_reservation($id) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . self::TABLE_NAME;
        
        return $wpdb->get_row(
            $wpdb->prepare("SELECT * FROM $table_name WHERE id = %d", $id),
            ARRAY_A
        );
    }
    
    public static function update_reservation_status($id, $status) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . self::TABLE_NAME;
        
        return $wpdb->update(
            $table_name,
            array('status' => $status),
            array('id' => $id),
            array('%s'),
            array('%d')
        );
    }
    
    public static function delete_reservation($id) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . self::TABLE_NAME;
        
        return $wpdb->delete(
            $table_name,
            array('id' => $id),
            array('%d')
        );
    }
    
    public static function get_stats() {
        global $wpdb;
        
        $table_name = $wpdb->prefix . self::TABLE_NAME;
        
        $stats = array();
        
        // Total reservations
        $stats['total'] = $wpdb->get_var("SELECT COUNT(*) FROM $table_name");
        
        // Pending reservations
        $stats['pending'] = $wpdb->get_var(
            $wpdb->prepare("SELECT COUNT(*) FROM $table_name WHERE status = %s", 'pending')
        );
        
        // Confirmed reservations
        $stats['confirmed'] = $wpdb->get_var(
            $wpdb->prepare("SELECT COUNT(*) FROM $table_name WHERE status = %s", 'confirmed')
        );
        
        // This month's reservations
        $stats['this_month'] = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COUNT(*) FROM $table_name WHERE MONTH(created_at) = %d AND YEAR(created_at) = %d",
                date('n'),
                date('Y')
            )
        );
        
        // Today's reservations
        $stats['today'] = $wpdb->get_var(
            $wpdb->prepare("SELECT COUNT(*) FROM $table_name WHERE DATE(reservation_date) = %s", date('Y-m-d'))
        );
        
        return $stats;
    }
    
    private static function get_client_ip() {
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