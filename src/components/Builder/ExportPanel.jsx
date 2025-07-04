import React, { useState } from 'react';
import { FiCopy, FiDownload, FiCheck } from 'react-icons/fi';

const ExportPanel = ({ settings }) => {
  const [copied, setCopied] = useState(false);

  const generateHtml = () => {
    const getShadowClass = () => {
      switch (settings.shadow) {
        case 'small': return 'box-shadow: 0 1px 3px rgba(0,0,0,0.12);';
        case 'medium': return 'box-shadow: 0 4px 6px rgba(0,0,0,0.1);';
        case 'large': return 'box-shadow: 0 10px 15px rgba(0,0,0,0.1);';
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

    const sectionStyle = `
      background-color: ${settings.backgroundType === 'color' ? settings.backgroundColor : 'transparent'};
      ${settings.backgroundType === 'image' ? `background-image: url(${settings.backgroundImage}); background-size: cover; background-position: center;` : ''}
      text-align: ${settings.alignment};
      max-width: ${settings.maxWidth};
      border-radius: ${settings.borderRadius}px;
      padding: ${getPadding()};
      margin: 0 auto;
      ${getShadowClass()}
    `;

    const buttonStyle = `
      background-color: ${settings.buttonStyle === 'outline' ? 'transparent' : settings.buttonColor};
      color: ${settings.buttonStyle === 'outline' ? settings.buttonColor : settings.buttonTextColor};
      border: ${settings.buttonStyle === 'outline' ? `2px solid ${settings.buttonColor}` : 'none'};
      border-radius: ${settings.buttonRadius}px;
      ${getButtonSize()}
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
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
            <option value="6+">6+</option>
          </select>
        </div>
      `);
    }

    return `
<!-- Table Reservation Section -->
<div style="${sectionStyle}">
  <h2 style="color: ${settings.titleColor}; font-size: 32px; font-weight: bold; margin-bottom: 16px;">
    ${settings.title}
  </h2>
  <p style="color: ${settings.subtitleColor}; font-size: 18px; margin-bottom: 32px;">
    ${settings.subtitle}
  </p>
  
  <form method="POST" action="#" onsubmit="return handleFormSubmit(event)">
    <div style="display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 32px;">
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
    
    ${settings.showSpecialRequests ? `
    <div style="margin-bottom: 32px;">
      <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">Special Requests</label>
      <textarea name="special_requests" rows="3" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 16px; resize: vertical;" placeholder="Any special requests..."></textarea>
    </div>
    ` : ''}
    
    <button type="submit" style="${buttonStyle}" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
      ${settings.buttonText}
    </button>
  </form>
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
function handleFormSubmit(event) {
  event.preventDefault();
  
  // Get form data
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData);
  
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
            {copied ? <FiCheck className="h-4 w-4" /> : <FiCopy className="h-4 w-4" />}
            <span>{copied ? 'Copied!' : 'Copy HTML'}</span>
          </button>
          <button
            onClick={downloadHtml}
            className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <FiDownload className="h-4 w-4" />
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
        <h4 className="font-semibold text-blue-900 mb-2">How to use:</h4>
        <ol className="list-decimal list-inside space-y-1 text-blue-800 text-sm">
          <li>Copy the HTML code above</li>
          <li>Paste it into your website or WordPress page</li>
          <li>Customize the form submission handler as needed</li>
          <li>Test the form on your website</li>
        </ol>
      </div>
    </div>
  );
};

export default ExportPanel;