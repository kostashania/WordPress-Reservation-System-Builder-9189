import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiCopy, FiDownload, FiCheck } = FiIcons;

const HtmlExporter = ({ settings }) => {
  const [copied, setCopied] = useState(false);

  const generateHtml = () => {
    const getShadowClass = () => {
      switch (settings.shadow) {
        case 'small': return 'box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);';
        case 'medium': return 'box-shadow: 0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06);';
        case 'large': return 'box-shadow: 0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05);';
        default: return '';
      }
    };

    const getPadding = () => {
      switch (settings.padding) {
        case 'small': return '24px';
        case 'medium': return '32px';
        case 'large': return '48px';
        default: return '32px';
      }
    };

    const getButtonSize = () => {
      switch (settings.buttonSize) {
        case 'small': return 'padding: 8px 16px; font-size: 14px;';
        case 'medium': return 'padding: 12px 24px; font-size: 16px;';
        case 'large': return 'padding: 16px 32px; font-size: 18px;';
        default: return 'padding: 12px 24px; font-size: 16px;';
      }
    };

    const getButtonStyle = () => {
      const baseStyle = getButtonSize();
      const radius = `border-radius: ${settings.buttonRadius}px;`;
      
      switch (settings.buttonStyle) {
        case 'modern': return `${baseStyle} ${radius} font-weight: 600; transition: all 0.2s; cursor: pointer;`;
        case 'classic': return `${baseStyle} ${radius} font-weight: 500; border: 2px solid ${settings.buttonColor}; transition: all 0.2s; cursor: pointer;`;
        case 'minimal': return `${baseStyle} border-radius: 0; font-weight: 500; border-bottom: 2px solid ${settings.buttonColor}; background: transparent; transition: all 0.2s; cursor: pointer;`;
        case 'gradient': return `${baseStyle} ${radius} font-weight: 600; background: linear-gradient(45deg, ${settings.buttonColor}, ${settings.buttonHoverColor}); transition: all 0.2s; cursor: pointer;`;
        case 'outline': return `${baseStyle} ${radius} font-weight: 500; border: 2px solid ${settings.buttonColor}; background: transparent; transition: all 0.2s; cursor: pointer;`;
        default: return `${baseStyle} ${radius} font-weight: 600; transition: all 0.2s; cursor: pointer;`;
      }
    };

    const getFormLayout = () => {
      switch (settings.formStyle) {
        case 'inline': return 'display: flex; flex-wrap: wrap; gap: 16px; align-items: end;';
        case 'stacked': return 'display: flex; flex-direction: column; gap: 16px;';
        case 'grid': return 'display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;';
        default: return 'display: flex; flex-wrap: wrap; gap: 16px; align-items: end;';
      }
    };

    const sectionStyle = `
      background-color: ${settings.backgroundType === 'color' ? settings.backgroundColor : 'transparent'};
      ${settings.backgroundType === 'image' ? `background-image: url(${settings.backgroundImage}); background-size: cover; background-position: center;` : ''}
      text-align: ${settings.alignment};
      max-width: ${settings.maxWidth};
      border-radius: ${settings.borderRadius}px;
      padding: ${getPadding()};
      margin: 0 auto;
      position: relative;
      ${getShadowClass()}
    `;

    const overlayStyle = settings.backgroundType === 'image' && settings.backgroundOverlay ? `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: ${settings.overlayColor};
      opacity: ${settings.overlayOpacity};
      border-radius: ${settings.borderRadius}px;
    ` : '';

    const buttonStyle = `
      background-color: ${settings.buttonStyle === 'outline' ? 'transparent' : settings.buttonColor};
      color: ${settings.buttonStyle === 'outline' ? settings.buttonColor : settings.buttonTextColor};
      border: ${settings.buttonStyle === 'outline' || settings.buttonStyle === 'classic' ? `2px solid ${settings.buttonColor}` : 'none'};
      ${getButtonStyle()}
    `;

    const formFields = [];
    
    if (settings.showDatePicker) {
      formFields.push(`
        <div style="flex: 1; min-width: 200px;">
          <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">Date</label>
          <input type="date" name="reservation_date" required style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 16px;" />
        </div>
      `);
    }

    if (settings.showTimePicker) {
      formFields.push(`
        <div style="flex: 1; min-width: 150px;">
          <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">Time</label>
          <input type="time" name="reservation_time" required style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 16px;" />
        </div>
      `);
    }

    if (settings.showGuestCount) {
      formFields.push(`
        <div style="flex: 1; min-width: 120px;">
          <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">Guests</label>
          <select name="guest_count" required style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 16px;">
            <option value="">Select guests</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
            <option value="7">7</option>
            <option value="8">8+</option>
          </select>
        </div>
      `);
    }

    if (settings.showSpecialRequests && settings.formStyle === 'stacked') {
      formFields.push(`
        <div style="width: 100%;">
          <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">Special Requests</label>
          <textarea name="special_requests" rows="3" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 16px; resize: vertical;" placeholder="Any special requests or dietary requirements..."></textarea>
        </div>
      `);
    }

    // reCAPTCHA v3 Script and Configuration
    const recaptchaScript = settings.enableRecaptcha ? `
      <script src="https://www.google.com/recaptcha/api.js?render=${settings.recaptchaSiteKey || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'}"></script>
    ` : '';

    const recaptchaValidation = settings.enableRecaptcha ? `
      // reCAPTCHA v3 validation
      async function validateRecaptcha() {
        try {
          const token = await grecaptcha.execute('${settings.recaptchaSiteKey || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'}', {
            action: '${settings.recaptchaAction || 'reservation'}'
          });
          
          // Send token to server for verification
          const response = await fetch('/verify-recaptcha', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              token: token,
              secret: '${settings.recaptchaSecretKey || '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe'}',
              threshold: ${settings.recaptchaThreshold || 0.5}
            })
          });
          
          const result = await response.json();
          return result.success && result.score >= ${settings.recaptchaThreshold || 0.5};
        } catch (error) {
          console.error('reCAPTCHA validation failed:', error);
          return false;
        }
      }
    ` : '';

    return `
<!-- Table Reservation Section with reCAPTCHA v3 -->
${recaptchaScript}
<div style="${sectionStyle}">
  ${settings.backgroundType === 'image' && settings.backgroundOverlay ? `<div style="${overlayStyle}"></div>` : ''}
  <div style="position: relative; z-index: 10;">
    <h2 style="color: ${settings.titleColor}; font-size: 32px; font-weight: bold; margin-bottom: 16px;">
      ${settings.title}
    </h2>
    <p style="color: ${settings.subtitleColor}; font-size: 18px; margin-bottom: 32px;">
      ${settings.subtitle}
    </p>
    
    <form method="POST" action="#" onsubmit="return handleFormSubmit(event)">
      <div style="margin-bottom: 32px;">
        <div style="${getFormLayout()}">
          ${formFields.join('')}
          
          <!-- Contact Information -->
          <div style="flex: 1; min-width: 200px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">Name</label>
            <input type="text" name="customer_name" required style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 16px;" />
          </div>
          
          <div style="flex: 1; min-width: 200px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">Email</label>
            <input type="email" name="customer_email" required style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 16px;" />
          </div>
          
          <div style="flex: 1; min-width: 200px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">Phone</label>
            <input type="tel" name="customer_phone" required style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 16px;" />
          </div>
        </div>
      </div>
      
      <button type="submit" style="${buttonStyle}" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
        ${settings.buttonText}
      </button>
    </form>
  </div>
</div>

<style>
  /* Responsive styles */
  @media (max-width: 768px) {
    .table-reservation-section {
      padding: 24px !important;
    }
    .table-reservation-section h2 {
      font-size: 24px !important;
    }
    .table-reservation-section p {
      font-size: 16px !important;
    }
    .table-reservation-form {
      flex-direction: column !important;
    }
    .table-reservation-form > div {
      min-width: 100% !important;
    }
  }
</style>

<script>
  ${recaptchaValidation}
  
  // Form submission handler
  async function handleFormSubmit(event) {
    event.preventDefault();
    
    ${settings.enableRecaptcha ? `
    // Validate reCAPTCHA v3
    const isValidRecaptcha = await validateRecaptcha();
    if (!isValidRecaptcha) {
      alert('Security verification failed. Please try again.');
      return false;
    }
    ` : ''}
    
    // Get form data
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    
    // You can customize this to send data to your server
    console.log('Reservation data:', data);
    
    // Show success message
    alert('Reservation submitted successfully! We will contact you soon.');
    
    // Reset form
    event.target.reset();
    
    return false;
  }
</script>
    `.trim();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateHtml()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const downloadHtml = () => {
    const html = generateHtml();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'table-reservation-section.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Export HTML</h3>
        <div className="flex space-x-3">
          <button
            onClick={copyToClipboard}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <SafeIcon icon={copied ? FiCheck : FiCopy} className="h-4 w-4" />
            <span>{copied ? 'Copied!' : 'Copy HTML'}</span>
          </button>
          <button
            onClick={downloadHtml}
            className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <SafeIcon icon={FiDownload} className="h-4 w-4" />
            <span>Download</span>
          </button>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg p-4">
        <pre className="text-green-400 text-sm overflow-x-auto">
          <code>{generateHtml()}</code>
        </pre>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">How to use in WordPress:</h4>
        <ol className="list-decimal list-inside space-y-1 text-blue-800 text-sm">
          <li>Copy the HTML code above</li>
          <li>Go to your WordPress post/page editor</li>
          <li>Add an HTML block (or Custom HTML block)</li>
          <li>Paste the code into the HTML block</li>
          <li>Save and publish your page</li>
        </ol>
      </div>

      {settings.enableRecaptcha && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-800 mb-2">reCAPTCHA v3 Integration:</h4>
          <ul className="list-disc list-inside space-y-1 text-green-700 text-sm">
            <li>reCAPTCHA v3 runs automatically in the background</li>
            <li>No user interaction required - completely invisible</li>
            <li>Provides a score (0.0-1.0) based on user behavior</li>
            <li>Form submissions are validated against bot traffic</li>
            <li>Implement server-side verification for production use</li>
          </ul>
        </div>
      )}

      {settings.enableRecaptcha && settings.recaptchaSecretKey && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800 mb-2">Server-side Verification Example:</h4>
          <p className="text-sm text-yellow-700 mb-3">
            Add this PHP code to your server to verify reCAPTCHA v3 tokens:
          </p>
          <div className="bg-gray-800 rounded p-3 overflow-x-auto">
            <code className="text-green-400 text-xs whitespace-pre">
{`<?php
$recaptcha_secret = '${settings.recaptchaSecretKey}';
$recaptcha_token = $_POST['g-recaptcha-response'];

$url = 'https://www.google.com/recaptcha/api/siteverify';
$data = [
    'secret' => $recaptcha_secret,
    'response' => $recaptcha_token
];

$options = [
    'http' => [
        'method' => 'POST',
        'content' => http_build_query($data)
    ]
];

$context = stream_context_create($options);
$response = file_get_contents($url, false, $context);
$result = json_decode($response);

if ($result->success && $result->score >= ${settings.recaptchaThreshold || 0.5}) {
    // Valid submission - process the reservation
    echo "Reservation accepted!";
} else {
    // Invalid submission - reject
    echo "Security verification failed!";
}
?>`}
            </code>
          </div>
        </div>
      )}
    </div>
  );
};

export default HtmlExporter;