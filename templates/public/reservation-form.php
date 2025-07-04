<?php
defined('ABSPATH') or die('Direct access not allowed');

// Get form settings
$form_title = $settings['form_title'] ?? __('Reserve Your Table', 'table-reservation');
$form_subtitle = $settings['form_subtitle'] ?? __('Book your perfect dining experience', 'table-reservation');
$button_text = $settings['button_text'] ?? __('Make Reservation', 'table-reservation');
$max_guests = $settings['max_guests'] ?? 12;
$color_scheme = $settings['color_scheme'] ?? 'blue';
$form_style = $settings['form_style'] ?? 'modern';

// Generate unique form ID
$form_id = $atts['form_id'] ?? 'table-reservation-form-' . rand(1000, 9999);
?>

<div class="table-reservation-wrapper" data-color-scheme="<?php echo esc_attr($color_scheme); ?>" data-style="<?php echo esc_attr($form_style); ?>">
    <div class="table-reservation-container">
        <?php if (!empty($form_title)): ?>
            <h2 class="reservation-title"><?php echo esc_html($form_title); ?></h2>
        <?php endif; ?>
        
        <?php if (!empty($form_subtitle)): ?>
            <p class="reservation-subtitle"><?php echo esc_html($form_subtitle); ?></p>
        <?php endif; ?>
        
        <form id="<?php echo esc_attr($form_id); ?>" class="table-reservation-form" method="post">
            <div class="form-messages" style="display: none;"></div>
            
            <div class="form-section">
                <div class="form-row">
                    <?php if (!empty($settings['show_date_picker'])): ?>
                        <div class="form-field">
                            <label for="reservation_date"><?php _e('Date', 'table-reservation'); ?> <span class="required">*</span></label>
                            <input type="date" 
                                   id="reservation_date" 
                                   name="reservation_date" 
                                   required 
                                   min="<?php echo date('Y-m-d'); ?>"
                                   class="form-control">
                        </div>
                    <?php endif; ?>
                    
                    <?php if (!empty($settings['show_time_picker'])): ?>
                        <div class="form-field">
                            <label for="reservation_time"><?php _e('Time', 'table-reservation'); ?> <span class="required">*</span></label>
                            <input type="time" 
                                   id="reservation_time" 
                                   name="reservation_time" 
                                   required
                                   class="form-control">
                        </div>
                    <?php endif; ?>
                    
                    <?php if (!empty($settings['show_guest_count'])): ?>
                        <div class="form-field">
                            <label for="guest_count"><?php _e('Guests', 'table-reservation'); ?> <span class="required">*</span></label>
                            <select id="guest_count" name="guest_count" required class="form-control">
                                <option value=""><?php _e('Select guests', 'table-reservation'); ?></option>
                                <?php for ($i = 1; $i <= $max_guests; $i++): ?>
                                    <option value="<?php echo $i; ?>">
                                        <?php echo $i; ?><?php echo $i === $max_guests ? '+' : ''; ?>
                                    </option>
                                <?php endfor; ?>
                            </select>
                        </div>
                    <?php endif; ?>
                </div>
            </div>
            
            <div class="form-section">
                <div class="form-row">
                    <div class="form-field">
                        <label for="customer_name"><?php _e('Name', 'table-reservation'); ?> <span class="required">*</span></label>
                        <input type="text" 
                               id="customer_name" 
                               name="customer_name" 
                               required 
                               placeholder="<?php esc_attr_e('Your full name', 'table-reservation'); ?>"
                               class="form-control">
                    </div>
                    
                    <div class="form-field">
                        <label for="customer_email"><?php _e('Email', 'table-reservation'); ?> <span class="required">*</span></label>
                        <input type="email" 
                               id="customer_email" 
                               name="customer_email" 
                               required 
                               placeholder="<?php esc_attr_e('your@email.com', 'table-reservation'); ?>"
                               class="form-control">
                    </div>
                    
                    <div class="form-field">
                        <label for="customer_phone">
                            <?php _e('Phone', 'table-reservation'); ?>
                            <?php if (!empty($settings['require_phone'])): ?>
                                <span class="required">*</span>
                            <?php endif; ?>
                        </label>
                        <input type="tel" 
                               id="customer_phone" 
                               name="customer_phone" 
                               <?php echo !empty($settings['require_phone']) ? 'required' : ''; ?>
                               placeholder="<?php esc_attr_e('(123) 456-7890', 'table-reservation'); ?>"
                               class="form-control">
                    </div>
                </div>
            </div>
            
            <?php if (!empty($settings['show_special_requests'])): ?>
                <div class="form-section">
                    <div class="form-field">
                        <label for="special_requests"><?php _e('Special Requests', 'table-reservation'); ?></label>
                        <textarea id="special_requests" 
                                  name="special_requests" 
                                  rows="3" 
                                  placeholder="<?php esc_attr_e('Any special requests or dietary requirements...', 'table-reservation'); ?>"
                                  class="form-control"></textarea>
                    </div>
                </div>
            <?php endif; ?>
            
            <div class="form-actions">
                <button type="submit" class="reservation-submit-btn">
                    <span class="btn-text"><?php echo esc_html($button_text); ?></span>
                    <span class="btn-loading" style="display: none;">
                        <span class="spinner"></span>
                        <?php _e('Submitting...', 'table-reservation'); ?>
                    </span>
                </button>
            </div>
            
            <?php if (!empty($settings['enable_recaptcha'])): ?>
                <div class="recaptcha-info">
                    <small><?php _e('This site is protected by reCAPTCHA and the Google Privacy Policy and Terms of Service apply.', 'table-reservation'); ?></small>
                </div>
            <?php endif; ?>
        </form>
    </div>
</div>

<script type="text/javascript">
jQuery(document).ready(function($) {
    const formId = '<?php echo esc_js($form_id); ?>';
    const enableRecaptcha = <?php echo !empty($settings['enable_recaptcha']) ? 'true' : 'false'; ?>;
    const recaptchaSiteKey = '<?php echo esc_js($settings['recaptcha_site_key'] ?? ''); ?>';
    
    $('#' + formId).on('submit', function(e) {
        e.preventDefault();
        
        const $form = $(this);
        const $submitBtn = $form.find('.reservation-submit-btn');
        const $messages = $form.find('.form-messages');
        
        // Disable form and show loading
        $submitBtn.prop('disabled', true);
        $submitBtn.find('.btn-text').hide();
        $submitBtn.find('.btn-loading').show();
        $messages.hide().removeClass('success error');
        
        const submitForm = function(recaptchaToken = '') {
            const formData = $form.serialize() + 
                '&action=submit_table_reservation' +
                '&nonce=' + tableReservationAjax.nonce +
                (recaptchaToken ? '&recaptcha_token=' + recaptchaToken : '');
            
            $.ajax({
                url: tableReservationAjax.ajaxUrl,
                type: 'POST',
                data: formData,
                dataType: 'json',
                success: function(response) {
                    if (response.success) {
                        $messages.html('<div class="success-message">' + response.data.message + '</div>')
                                .addClass('success')
                                .show();
                        $form[0].reset();
                    } else {
                        $messages.html('<div class="error-message">' + response.data.message + '</div>')
                                .addClass('error')
                                .show();
                    }
                },
                error: function() {
                    $messages.html('<div class="error-message">' + tableReservationAjax.strings.error + '</div>')
                            .addClass('error')
                            .show();
                },
                complete: function() {
                    $submitBtn.prop('disabled', false);
                    $submitBtn.find('.btn-text').show();
                    $submitBtn.find('.btn-loading').hide();
                }
            });
        };
        
        if (enableRecaptcha && recaptchaSiteKey && typeof grecaptcha !== 'undefined') {
            grecaptcha.ready(function() {
                grecaptcha.execute(recaptchaSiteKey, {action: 'reservation'})
                    .then(function(token) {
                        submitForm(token);
                    })
                    .catch(function(error) {
                        console.error('reCAPTCHA error:', error);
                        submitForm(); // Submit without reCAPTCHA token
                    });
            });
        } else {
            submitForm();
        }
    });
});
</script>