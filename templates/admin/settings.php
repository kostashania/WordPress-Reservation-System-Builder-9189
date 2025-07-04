<?php defined('ABSPATH') or die('Direct access not allowed'); ?>

<div class="wrap">
    <h1><?php _e('Table Reservation Settings', 'table-reservation'); ?></h1>
    
    <form method="post" action="">
        <?php wp_nonce_field('table_reservation_settings', 'table_reservation_settings_nonce'); ?>
        
        <table class="form-table">
            <tbody>
                <!-- Form Content Settings -->
                <tr>
                    <th scope="row" colspan="2">
                        <h2><?php _e('Form Content', 'table-reservation'); ?></h2>
                    </th>
                </tr>
                
                <tr>
                    <th scope="row">
                        <label for="form_title"><?php _e('Form Title', 'table-reservation'); ?></label>
                    </th>
                    <td>
                        <input type="text" 
                               id="form_title" 
                               name="form_title" 
                               value="<?php echo esc_attr($settings['form_title'] ?? ''); ?>" 
                               class="regular-text" />
                    </td>
                </tr>
                
                <tr>
                    <th scope="row">
                        <label for="form_subtitle"><?php _e('Form Subtitle', 'table-reservation'); ?></label>
                    </th>
                    <td>
                        <input type="text" 
                               id="form_subtitle" 
                               name="form_subtitle" 
                               value="<?php echo esc_attr($settings['form_subtitle'] ?? ''); ?>" 
                               class="regular-text" />
                    </td>
                </tr>
                
                <tr>
                    <th scope="row">
                        <label for="button_text"><?php _e('Button Text', 'table-reservation'); ?></label>
                    </th>
                    <td>
                        <input type="text" 
                               id="button_text" 
                               name="button_text" 
                               value="<?php echo esc_attr($settings['button_text'] ?? ''); ?>" 
                               class="regular-text" />
                    </td>
                </tr>
                
                <tr>
                    <th scope="row">
                        <label for="success_message"><?php _e('Success Message', 'table-reservation'); ?></label>
                    </th>
                    <td>
                        <textarea id="success_message" 
                                  name="success_message" 
                                  rows="3" 
                                  class="large-text"><?php echo esc_textarea($settings['success_message'] ?? ''); ?></textarea>
                        <p class="description"><?php _e('Message shown after successful reservation submission.', 'table-reservation'); ?></p>
                    </td>
                </tr>
                
                <!-- reCAPTCHA Settings -->
                <tr>
                    <th scope="row" colspan="2">
                        <h2><?php _e('reCAPTCHA v3 Settings', 'table-reservation'); ?></h2>
                        <p><?php _e('Get your keys from', 'table-reservation'); ?> <a href="https://www.google.com/recaptcha/admin" target="_blank">Google reCAPTCHA</a></p>
                    </th>
                </tr>
                
                <tr>
                    <th scope="row">
                        <label for="enable_recaptcha"><?php _e('Enable reCAPTCHA', 'table-reservation'); ?></label>
                    </th>
                    <td>
                        <label>
                            <input type="checkbox" 
                                   id="enable_recaptcha" 
                                   name="enable_recaptcha" 
                                   value="1" 
                                   <?php checked(!empty($settings['enable_recaptcha'])); ?> />
                            <?php _e('Enable reCAPTCHA v3 spam protection', 'table-reservation'); ?>
                        </label>
                    </td>
                </tr>
                
                <tr>
                    <th scope="row">
                        <label for="recaptcha_site_key"><?php _e('Site Key', 'table-reservation'); ?></label>
                    </th>
                    <td>
                        <input type="text" 
                               id="recaptcha_site_key" 
                               name="recaptcha_site_key" 
                               value="<?php echo esc_attr($settings['recaptcha_site_key'] ?? ''); ?>" 
                               class="regular-text" />
                    </td>
                </tr>
                
                <tr>
                    <th scope="row">
                        <label for="recaptcha_secret_key"><?php _e('Secret Key', 'table-reservation'); ?></label>
                    </th>
                    <td>
                        <input type="text" 
                               id="recaptcha_secret_key" 
                               name="recaptcha_secret_key" 
                               value="<?php echo esc_attr($settings['recaptcha_secret_key'] ?? ''); ?>" 
                               class="regular-text" />
                    </td>
                </tr>
                
                <tr>
                    <th scope="row">
                        <label for="recaptcha_threshold"><?php _e('Score Threshold', 'table-reservation'); ?></label>
                    </th>
                    <td>
                        <input type="number" 
                               id="recaptcha_threshold" 
                               name="recaptcha_threshold" 
                               value="<?php echo esc_attr($settings['recaptcha_threshold'] ?? 0.5); ?>" 
                               min="0.1" 
                               max="0.9" 
                               step="0.1" 
                               class="small-text" />
                        <p class="description"><?php _e('Minimum score required (0.1-0.9). Lower scores indicate bot traffic.', 'table-reservation'); ?></p>
                    </td>
                </tr>
                
                <!-- Email Settings -->
                <tr>
                    <th scope="row" colspan="2">
                        <h2><?php _e('Email Notification Settings', 'table-reservation'); ?></h2>
                    </th>
                </tr>
                
                <tr>
                    <th scope="row">
                        <label for="enable_email_notifications"><?php _e('Enable Email Notifications', 'table-reservation'); ?></label>
                    </th>
                    <td>
                        <label>
                            <input type="checkbox" 
                                   id="enable_email_notifications" 
                                   name="enable_email_notifications" 
                                   value="1" 
                                   <?php checked(!empty($settings['enable_email_notifications'])); ?> />
                            <?php _e('Send email notifications for new reservations', 'table-reservation'); ?>
                        </label>
                    </td>
                </tr>
                
                <tr>
                    <th scope="row">
                        <label for="notification_emails"><?php _e('Notification Emails', 'table-reservation'); ?></label>
                    </th>
                    <td>
                        <textarea id="notification_emails" 
                                  name="notification_emails" 
                                  rows="3" 
                                  class="large-text"><?php echo esc_textarea($settings['notification_emails'] ?? ''); ?></textarea>
                        <p class="description"><?php _e('Enter email addresses (one per line) to receive reservation notifications.', 'table-reservation'); ?></p>
                    </td>
                </tr>
                
                <tr>
                    <th scope="row">
                        <label for="from_name"><?php _e('From Name', 'table-reservation'); ?></label>
                    </th>
                    <td>
                        <input type="text" 
                               id="from_name" 
                               name="from_name" 
                               value="<?php echo esc_attr($settings['from_name'] ?? ''); ?>" 
                               class="regular-text" />
                    </td>
                </tr>
                
                <tr>
                    <th scope="row">
                        <label for="from_email"><?php _e('From Email', 'table-reservation'); ?></label>
                    </th>
                    <td>
                        <input type="email" 
                               id="from_email" 
                               name="from_email" 
                               value="<?php echo esc_attr($settings['from_email'] ?? ''); ?>" 
                               class="regular-text" />
                    </td>
                </tr>
                
                <!-- Form Field Settings -->
                <tr>
                    <th scope="row" colspan="2">
                        <h2><?php _e('Form Field Settings', 'table-reservation'); ?></h2>
                    </th>
                </tr>
                
                <tr>
                    <th scope="row"><?php _e('Required Fields', 'table-reservation'); ?></th>
                    <td>
                        <fieldset>
                            <label>
                                <input type="checkbox" 
                                       name="show_date_picker" 
                                       value="1" 
                                       <?php checked(!empty($settings['show_date_picker'])); ?> />
                                <?php _e('Date Picker', 'table-reservation'); ?>
                            </label><br>
                            
                            <label>
                                <input type="checkbox" 
                                       name="show_time_picker" 
                                       value="1" 
                                       <?php checked(!empty($settings['show_time_picker'])); ?> />
                                <?php _e('Time Picker', 'table-reservation'); ?>
                            </label><br>
                            
                            <label>
                                <input type="checkbox" 
                                       name="show_guest_count" 
                                       value="1" 
                                       <?php checked(!empty($settings['show_guest_count'])); ?> />
                                <?php _e('Guest Count', 'table-reservation'); ?>
                            </label><br>
                            
                            <label>
                                <input type="checkbox" 
                                       name="show_special_requests" 
                                       value="1" 
                                       <?php checked(!empty($settings['show_special_requests'])); ?> />
                                <?php _e('Special Requests', 'table-reservation'); ?>
                            </label><br>
                            
                            <label>
                                <input type="checkbox" 
                                       name="require_phone" 
                                       value="1" 
                                       <?php checked(!empty($settings['require_phone'])); ?> />
                                <?php _e('Require Phone Number', 'table-reservation'); ?>
                            </label>
                        </fieldset>
                    </td>
                </tr>
                
                <tr>
                    <th scope="row">
                        <label for="max_guests"><?php _e('Maximum Guests', 'table-reservation'); ?></label>
                    </th>
                    <td>
                        <input type="number" 
                               id="max_guests" 
                               name="max_guests" 
                               value="<?php echo esc_attr($settings['max_guests'] ?? 12); ?>" 
                               min="1" 
                               max="50" 
                               class="small-text" />
                    </td>
                </tr>
                
                <!-- Styling Settings -->
                <tr>
                    <th scope="row" colspan="2">
                        <h2><?php _e('Styling Settings', 'table-reservation'); ?></h2>
                    </th>
                </tr>
                
                <tr>
                    <th scope="row">
                        <label for="form_style"><?php _e('Form Style', 'table-reservation'); ?></label>
                    </th>
                    <td>
                        <select id="form_style" name="form_style">
                            <option value="modern" <?php selected($settings['form_style'] ?? 'modern', 'modern'); ?>><?php _e('Modern', 'table-reservation'); ?></option>
                            <option value="minimal" <?php selected($settings['form_style'] ?? 'modern', 'minimal'); ?>><?php _e('Minimal', 'table-reservation'); ?></option>
                            <option value="classic" <?php selected($settings['form_style'] ?? 'modern', 'classic'); ?>><?php _e('Classic', 'table-reservation'); ?></option>
                        </select>
                    </td>
                </tr>
                
                <tr>
                    <th scope="row">
                        <label for="color_scheme"><?php _e('Color Scheme', 'table-reservation'); ?></label>
                    </th>
                    <td>
                        <select id="color_scheme" name="color_scheme">
                            <option value="blue" <?php selected($settings['color_scheme'] ?? 'blue', 'blue'); ?>><?php _e('Blue', 'table-reservation'); ?></option>
                            <option value="green" <?php selected($settings['color_scheme'] ?? 'blue', 'green'); ?>><?php _e('Green', 'table-reservation'); ?></option>
                            <option value="orange" <?php selected($settings['color_scheme'] ?? 'blue', 'orange'); ?>><?php _e('Orange', 'table-reservation'); ?></option>
                        </select>
                    </td>
                </tr>
            </tbody>
        </table>
        
        <?php submit_button(); ?>
    </form>
    
    <div class="postbox" style="margin-top: 20px;">
        <h3 class="hndle"><?php _e('Shortcode Usage', 'table-reservation'); ?></h3>
        <div class="inside">
            <p><?php _e('Use these shortcodes to display reservation forms and lists:', 'table-reservation'); ?></p>
            <ul>
                <li><code>[table_reservation_form]</code> - <?php _e('Display the reservation form', 'table-reservation'); ?></li>
                <li><code>[table_reservation_list limit="10"]</code> - <?php _e('Display recent reservations', 'table-reservation'); ?></li>
                <li><code>[table_reservation_calendar]</code> - <?php _e('Display reservation calendar', 'table-reservation'); ?></li>
            </ul>
            
            <h4><?php _e('Shortcode Attributes', 'table-reservation'); ?></h4>
            <p><?php _e('You can customize the form with these attributes:', 'table-reservation'); ?></p>
            <ul>
                <li><code>title="Custom Title"</code></li>
                <li><code>subtitle="Custom Subtitle"</code></li>
                <li><code>button_text="Reserve Now"</code></li>
                <li><code>color_scheme="green"</code></li>
                <li><code>max_guests="8"</code></li>
                <li><code>show_date="true"</code></li>
                <li><code>show_time="true"</code></li>
                <li><code>show_guests="true"</code></li>
                <li><code>show_special_requests="true"</code></li>
            </ul>
            
            <h4><?php _e('Example', 'table-reservation'); ?></h4>
            <code>[table_reservation_form title="Book Your Table" color_scheme="green" max_guests="6"]</code>
        </div>
    </div>
</div>