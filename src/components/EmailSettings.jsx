import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiMail, FiEye, FiEyeOff, FiInfo, FiCheck, FiX, FiPlus, FiTrash2, FiSend, FiShield, FiZap, FiSettings } = FiIcons;

const EmailSettings = ({ settings, updateSetting }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  const defaultEmailTemplate = `New table reservation request:

Name: {{customer_name}}
Email: {{customer_email}}
Phone: {{customer_phone}}
Date: {{reservation_date}}
Time: {{reservation_time}}
Guests: {{guest_count}}
Special Requests: {{special_requests}}

Please contact the customer to confirm the reservation.`;

  const addEmail = () => {
    if (!newEmail.trim()) return;
    
    const emails = settings.notificationEmails || [];
    if (!emails.includes(newEmail.trim())) {
      updateSetting('notificationEmails', [...emails, newEmail.trim()]);
      setNewEmail('');
    }
  };

  const removeEmail = (emailToRemove) => {
    const emails = settings.notificationEmails || [];
    updateSetting('notificationEmails', emails.filter(email => email !== emailToRemove));
  };

  const testEmailConfiguration = async () => {
    setIsTesting(true);
    setTestResult(null);

    // Simulate email test
    setTimeout(() => {
      if (settings.emailProvider === 'simple') {
        const hasSimpleConfig = settings.simpleEmailService === 'emailjs' 
          ? settings.emailjsServiceId && settings.emailjsTemplateId && settings.emailjsPublicKey
          : settings.webhookUrl;
          
        if (hasSimpleConfig) {
          setTestResult({
            success: true,
            message: `${settings.simpleEmailService === 'emailjs' ? 'EmailJS' : 'Webhook'} configuration looks good! (Demo mode)`
          });
        } else {
          setTestResult({
            success: false,
            message: 'Please complete the configuration'
          });
        }
      } else {
        const hasRequiredFields = settings.smtpHost && settings.smtpPort && settings.smtpUsername && settings.smtpPassword;
        
        if (hasRequiredFields) {
          setTestResult({
            success: true,
            message: 'SMTP configuration test successful! (Demo mode - no actual email sent)'
          });
        } else {
          setTestResult({
            success: false,
            message: 'Please fill in all SMTP configuration fields'
          });
        }
      }
      setIsTesting(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <SafeIcon icon={FiMail} className="h-6 w-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Email Notifications</h3>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <SafeIcon icon={FiInfo} className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">Email Configuration</h4>
            <p className="text-sm text-blue-800 mt-1">
              Configure email settings to receive reservation notifications. Choose between simple setup or advanced SMTP configuration.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Enable Email Notifications */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="enableEmailNotifications"
            checked={settings.enableEmailNotifications || false}
            onChange={(e) => updateSetting('enableEmailNotifications', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="enableEmailNotifications" className="text-sm font-medium text-gray-700">
            Enable Email Notifications
          </label>
        </div>

        {settings.enableEmailNotifications && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-6"
          >
            {/* Email Provider Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Email Setup Method
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  onClick={() => updateSetting('emailProvider', 'simple')}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    settings.emailProvider === 'simple'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <SafeIcon icon={FiZap} className="h-6 w-6 text-green-500" />
                    <div>
                      <h4 className="font-medium text-gray-900">Simple Setup</h4>
                      <p className="text-sm text-gray-600">Easy configuration with EmailJS or webhooks</p>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => updateSetting('emailProvider', 'smtp')}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    settings.emailProvider === 'smtp'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <SafeIcon icon={FiSettings} className="h-6 w-6 text-blue-500" />
                    <div>
                      <h4 className="font-medium text-gray-900">SMTP Setup</h4>
                      <p className="text-sm text-gray-600">Advanced configuration with your email server</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notification Emails */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notification Email Addresses
              </label>
              <div className="space-y-2">
                {(settings.notificationEmails || []).map((email, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                    <SafeIcon icon={FiMail} className="h-4 w-4 text-gray-500" />
                    <span className="flex-1 text-sm text-gray-700">{email}</span>
                    <button
                      onClick={() => removeEmail(email)}
                      className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded"
                    >
                      <SafeIcon icon={FiTrash2} className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <div className="flex space-x-2">
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && addEmail()}
                  />
                  <button
                    onClick={addEmail}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <SafeIcon icon={FiPlus} className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Simple Email Configuration */}
            {settings.emailProvider === 'simple' && (
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-medium text-green-800 mb-4">Simple Email Setup</h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Service
                    </label>
                    <select
                      value={settings.simpleEmailService || 'emailjs'}
                      onChange={(e) => updateSetting('simpleEmailService', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="emailjs">EmailJS (Recommended)</option>
                      <option value="webhook">Custom Webhook</option>
                    </select>
                  </div>

                  {settings.simpleEmailService === 'emailjs' ? (
                    <div className="space-y-4">
                      <div className="bg-blue-50 border border-blue-200 rounded p-3">
                        <p className="text-sm text-blue-800">
                          <strong>EmailJS Setup:</strong> Create a free account at emailjs.com, 
                          create an email service and template, then enter your credentials below.
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Service ID
                          </label>
                          <input
                            type="text"
                            value={settings.emailjsServiceId || ''}
                            onChange={(e) => updateSetting('emailjsServiceId', e.target.value)}
                            placeholder="service_xxxxxxx"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Template ID
                          </label>
                          <input
                            type="text"
                            value={settings.emailjsTemplateId || ''}
                            onChange={(e) => updateSetting('emailjsTemplateId', e.target.value)}
                            placeholder="template_xxxxxxx"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Public Key
                        </label>
                        <input
                          type="text"
                          value={settings.emailjsPublicKey || ''}
                          onChange={(e) => updateSetting('emailjsPublicKey', e.target.value)}
                          placeholder="your_public_key"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Webhook URL
                      </label>
                      <input
                        type="url"
                        value={settings.webhookUrl || ''}
                        onChange={(e) => updateSetting('webhookUrl', e.target.value)}
                        placeholder="https://your-server.com/webhook/reservation"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Your server endpoint that will receive reservation data via POST request
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SMTP Configuration */}
            {settings.emailProvider === 'smtp' && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-800">SMTP Configuration</h4>
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                  >
                    <SafeIcon icon={showAdvanced ? FiEyeOff : FiEye} className="h-4 w-4" />
                    <span>{showAdvanced ? 'Hide Details' : 'Show Details'}</span>
                  </button>
                </div>

                {showAdvanced && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SMTP Host
                      </label>
                      <input
                        type="text"
                        value={settings.smtpHost || ''}
                        onChange={(e) => updateSetting('smtpHost', e.target.value)}
                        placeholder="smtp.gmail.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SMTP Port
                      </label>
                      <input
                        type="number"
                        value={settings.smtpPort || ''}
                        onChange={(e) => updateSetting('smtpPort', e.target.value)}
                        placeholder="587"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Username/Email
                      </label>
                      <input
                        type="email"
                        value={settings.smtpUsername || ''}
                        onChange={(e) => updateSetting('smtpUsername', e.target.value)}
                        placeholder="your-email@gmail.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password/App Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={settings.smtpPassword || ''}
                          onChange={(e) => updateSetting('smtpPassword', e.target.value)}
                          placeholder="your-app-password"
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          <SafeIcon 
                            icon={showPassword ? FiEyeOff : FiEye} 
                            className="h-4 w-4 text-gray-400" 
                          />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        From Name
                      </label>
                      <input
                        type="text"
                        value={settings.smtpFromName || ''}
                        onChange={(e) => updateSetting('smtpFromName', e.target.value)}
                        placeholder="Restaurant Name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        From Email
                      </label>
                      <input
                        type="email"
                        value={settings.smtpFromEmail || ''}
                        onChange={(e) => updateSetting('smtpFromEmail', e.target.value)}
                        placeholder="noreply@restaurant.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                <div className="mt-4 flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="smtpSecure"
                    checked={settings.smtpSecure || false}
                    onChange={(e) => updateSetting('smtpSecure', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="smtpSecure" className="text-sm text-gray-700">
                    Use TLS/SSL encryption
                  </label>
                </div>
              </div>
            )}

            {/* Email Template */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Subject Template
              </label>
              <input
                type="text"
                value={settings.emailSubject || 'New Table Reservation Request'}
                onChange={(e) => updateSetting('emailSubject', e.target.value)}
                placeholder="New Table Reservation Request"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Body Template
              </label>
              <textarea
                value={settings.emailTemplate || defaultEmailTemplate}
                onChange={(e) => updateSetting('emailTemplate', e.target.value)}
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Email template with placeholders..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Use placeholders: {'{'}{'{'} customer_name {'}'}{'}'}, {'{'}{'{'} customer_email {'}'}{'}'}, {'{'}{'{'} customer_phone {'}'}{'}'}, {'{'}{'{'} reservation_date {'}'}{'}'}, {'{'}{'{'} reservation_time {'}'}{'}'}, {'{'}{'{'} guest_count {'}'}{'}'}, {'{'}{'{'} special_requests {'}'}{'}'}
              </p>
            </div>

            {/* Test Email Configuration */}
            <div className="flex items-center space-x-4 pt-4">
              <button
                onClick={testEmailConfiguration}
                disabled={isTesting}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <SafeIcon icon={FiSend} className="h-4 w-4" />
                <span>{isTesting ? 'Testing...' : 'Test Configuration'}</span>
              </button>
              {testResult && (
                <div className={`flex items-center space-x-2 ${testResult.success ? 'text-green-600' : 'text-red-600'}`}>
                  <SafeIcon icon={testResult.success ? FiCheck : FiX} className="h-4 w-4" />
                  <span className="text-sm">{testResult.message}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Setup Instructions */}
      {settings.enableEmailNotifications && settings.emailProvider === 'simple' && settings.simpleEmailService === 'emailjs' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-800 mb-2">EmailJS Setup Instructions:</h4>
          <ol className="text-sm text-green-700 space-y-1 list-decimal list-inside">
            <li>Go to <a href="https://www.emailjs.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">emailjs.com</a> and create a free account</li>
            <li>Create an email service (Gmail, Outlook, etc.)</li>
            <li>Create an email template with variables: customer_name, customer_email, customer_phone, reservation_date, reservation_time, guest_count, special_requests</li>
            <li>Get your Service ID, Template ID, and Public Key</li>
            <li>Enter them in the fields above</li>
          </ol>
        </div>
      )}

      {/* Common SMTP Providers */}
      {settings.enableEmailNotifications && settings.emailProvider === 'smtp' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-800 mb-2">Common SMTP Providers:</h4>
          <div className="text-sm text-yellow-700 space-y-2">
            <div>
              <strong>Gmail:</strong> smtp.gmail.com, Port: 587, TLS: Yes
              <br />
              <span className="text-xs">Note: Use App Password instead of regular password</span>
            </div>
            <div>
              <strong>Outlook/Hotmail:</strong> smtp-mail.outlook.com, Port: 587, TLS: Yes
            </div>
            <div>
              <strong>Yahoo:</strong> smtp.mail.yahoo.com, Port: 587, TLS: Yes
            </div>
            <div>
              <strong>SendGrid:</strong> smtp.sendgrid.net, Port: 587, TLS: Yes
            </div>
          </div>
        </div>
      )}

      {/* Security Notice */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h4 className="font-medium text-red-800 mb-2">Security Best Practices:</h4>
        <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
          <li>For SMTP: Never use your main email password - use App Passwords or dedicated SMTP credentials</li>
          <li>For EmailJS: Free tier has monthly limits, upgrade for production use</li>
          <li>Store credentials securely and never commit them to version control</li>
          <li>Consider using email services like SendGrid, Mailgun, or AWS SES for high-volume production use</li>
        </ul>
      </div>
    </div>
  );
};

export default EmailSettings;