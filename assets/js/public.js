/**
 * Table Reservation Plugin - Public JavaScript
 */

(function($) {
    'use strict';
    
    // Initialize when document is ready
    $(document).ready(function() {
        initTableReservationForms();
    });
    
    function initTableReservationForms() {
        $('.table-reservation-form').each(function() {
            const $form = $(this);
            const formId = $form.attr('id');
            
            // Skip if already initialized
            if ($form.data('tr-initialized')) {
                return;
            }
            
            $form.data('tr-initialized', true);
            
            // Form validation
            setupFormValidation($form);
            
            // Date/time constraints
            setupDateTimeConstraints($form);
            
            // Real-time validation feedback
            setupRealTimeValidation($form);
        });
    }
    
    function setupFormValidation($form) {
        $form.on('submit', function(e) {
            e.preventDefault();
            
            const $submitBtn = $form.find('.reservation-submit-btn');
            const $messages = $form.find('.form-messages');
            
            // Clear previous messages
            $messages.hide().removeClass('success error');
            
            // Validate form
            const validation = validateForm($form);
            if (!validation.isValid) {
                showMessage($messages, validation.message, 'error');
                return;
            }
            
            // Show loading state
            setLoadingState($submitBtn, true);
            
            // Submit form
            submitReservationForm($form, $submitBtn, $messages);
        });
    }
    
    function validateForm($form) {
        const errors = [];
        
        // Required field validation
        $form.find('input[required], select[required], textarea[required]').each(function() {
            const $field = $(this);
            const value = $field.val().trim();
            const fieldName = $field.closest('.form-field').find('label').text().replace('*', '').trim();
            
            if (!value) {
                errors.push(`${fieldName} is required.`);
                $field.addClass('error');
            } else {
                $field.removeClass('error');
            }
        });
        
        // Email validation
        const $email = $form.find('input[type="email"]');
        if ($email.length && $email.val()) {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test($email.val())) {
                errors.push('Please enter a valid email address.');
                $email.addClass('error');
            }
        }
        
        // Phone validation (basic)
        const $phone = $form.find('input[type="tel"]');
        if ($phone.length && $phone.val() && $phone.prop('required')) {
            const phone = $phone.val().replace(/\D/g, '');
            if (phone.length < 10) {
                errors.push('Please enter a valid phone number.');
                $phone.addClass('error');
            }
        }
        
        // Date validation
        const $date = $form.find('input[type="date"]');
        if ($date.length && $date.val()) {
            const selectedDate = new Date($date.val());
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (selectedDate < today) {
                errors.push('Reservation date must be today or in the future.');
                $date.addClass('error');
            }
        }
        
        // Time validation (if date is today)
        const $time = $form.find('input[type="time"]');
        if ($date.length && $time.length && $date.val() && $time.val()) {
            const selectedDate = new Date($date.val());
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (selectedDate.getTime() === today.getTime()) {
                const [hours, minutes] = $time.val().split(':');
                const selectedTime = new Date();
                selectedTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                
                const now = new Date();
                now.setMinutes(now.getMinutes() + 30); // 30 minutes from now
                
                if (selectedTime < now) {
                    errors.push('Reservation time must be at least 30 minutes from now.');
                    $time.addClass('error');
                }
            }
        }
        
        return {
            isValid: errors.length === 0,
            message: errors.join('<br>')
        };
    }
    
    function setupDateTimeConstraints($form) {
        const $dateInput = $form.find('input[type="date"]');
        const $timeInput = $form.find('input[type="time"]');
        
        // Set minimum date to today
        if ($dateInput.length) {
            const today = new Date().toISOString().split('T')[0];
            $dateInput.attr('min', today);
            
            // Set maximum date to 1 year from now
            const maxDate = new Date();
            maxDate.setFullYear(maxDate.getFullYear() + 1);
            $dateInput.attr('max', maxDate.toISOString().split('T')[0]);
        }
        
        // Update time constraints when date changes
        $dateInput.on('change', function() {
            updateTimeConstraints($form);
        });
        
        // Initial time constraints
        updateTimeConstraints($form);
    }
    
    function updateTimeConstraints($form) {
        const $dateInput = $form.find('input[type="date"]');
        const $timeInput = $form.find('input[type="time"]');
        
        if (!$dateInput.length || !$timeInput.length || !$dateInput.val()) {
            return;
        }
        
        const selectedDate = new Date($dateInput.val());
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // If selected date is today, set minimum time
        if (selectedDate.getTime() === today.getTime()) {
            const now = new Date();
            now.setMinutes(now.getMinutes() + 30); // 30 minutes buffer
            
            const minTime = String(now.getHours()).padStart(2, '0') + ':' + 
                          String(now.getMinutes()).padStart(2, '0');
            
            $timeInput.attr('min', minTime);
        } else {
            $timeInput.removeAttr('min');
        }
    }
    
    function setupRealTimeValidation($form) {
        // Remove error class on input
        $form.find('input, select, textarea').on('input change', function() {
            $(this).removeClass('error');
        });
        
        // Email validation on blur
        $form.find('input[type="email"]').on('blur', function() {
            const $email = $(this);
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            
            if ($email.val() && !emailPattern.test($email.val())) {
                $email.addClass('error');
            }
        });
        
        // Phone formatting
        $form.find('input[type="tel"]').on('input', function() {
            let value = $(this).val().replace(/\D/g, '');
            
            if (value.length >= 6) {
                value = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
            } else if (value.length >= 3) {
                value = value.replace(/(\d{3})(\d{0,3})/, '($1) $2');
            }
            
            $(this).val(value);
        });
    }
    
    function submitReservationForm($form, $submitBtn, $messages) {
        const enableRecaptcha = typeof tableReservationAjax !== 'undefined' && 
                               tableReservationAjax.enableRecaptcha && 
                               typeof grecaptcha !== 'undefined';
        
        const submitWithToken = function(recaptchaToken = '') {
            const formData = $form.serialize() + 
                '&action=submit_table_reservation' +
                '&nonce=' + tableReservationAjax.nonce +
                (recaptchaToken ? '&recaptcha_token=' + recaptchaToken : '');
            
            $.ajax({
                url: tableReservationAjax.ajaxUrl,
                type: 'POST',
                data: formData,
                dataType: 'json',
                timeout: 30000,
                success: function(response) {
                    if (response.success) {
                        showMessage($messages, response.data.message, 'success');
                        resetForm($form);
                        
                        // Scroll to success message
                        $('html, body').animate({
                            scrollTop: $messages.offset().top - 100
                        }, 500);
                        
                        // Trigger custom event
                        $form.trigger('reservationSubmitted', [response.data]);
                        
                    } else {
                        showMessage($messages, response.data.message, 'error');
                    }
                },
                error: function(xhr, status, error) {
                    let errorMessage = tableReservationAjax.strings.error;
                    
                    if (status === 'timeout') {
                        errorMessage = 'Request timed out. Please try again.';
                    } else if (xhr.status === 429) {
                        errorMessage = 'Too many requests. Please wait a moment and try again.';
                    } else if (xhr.status >= 500) {
                        errorMessage = 'Server error. Please try again later.';
                    }
                    
                    showMessage($messages, errorMessage, 'error');
                },
                complete: function() {
                    setLoadingState($submitBtn, false);
                }
            });
        };
        
        if (enableRecaptcha && tableReservationAjax.recaptchaSiteKey) {
            grecaptcha.ready(function() {
                grecaptcha.execute(tableReservationAjax.recaptchaSiteKey, {action: 'reservation'})
                    .then(function(token) {
                        submitWithToken(token);
                    })
                    .catch(function(error) {
                        console.error('reCAPTCHA error:', error);
                        // Fallback: submit without reCAPTCHA token
                        submitWithToken();
                    });
            });
        } else {
            submitWithToken();
        }
    }
    
    function setLoadingState($button, loading) {
        if (loading) {
            $button.prop('disabled', true);
            $button.find('.btn-text').hide();
            $button.find('.btn-loading').show();
        } else {
            $button.prop('disabled', false);
            $button.find('.btn-text').show();
            $button.find('.btn-loading').hide();
        }
    }
    
    function showMessage($container, message, type) {
        const className = type === 'success' ? 'success-message' : 'error-message';
        $container.html(`<div class="${className}">${message}</div>`)
                 .removeClass('success error')
                 .addClass(type)
                 .show();
    }
    
    function resetForm($form) {
        $form[0].reset();
        $form.find('.error').removeClass('error');
        
        // Reset date/time constraints
        const today = new Date().toISOString().split('T')[0];
        $form.find('input[type="date"]').attr('min', today);
        $form.find('input[type="time"]').removeAttr('min');
    }
    
    // Utility function to format phone numbers
    window.formatPhoneNumber = function(phone) {
        const cleaned = phone.replace(/\D/g, '');
        const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
        
        if (match) {
            return '(' + match[1] + ') ' + match[2] + '-' + match[3];
        }
        
        return phone;
    };
    
    // Expose functions for external use
    window.TableReservation = {
        init: initTableReservationForms,
        validate: validateForm,
        submit: submitReservationForm
    };
    
})(jQuery);