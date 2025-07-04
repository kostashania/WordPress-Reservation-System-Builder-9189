import React, { useState } from 'react'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../common/SafeIcon'
import { downloadPlugin } from '../utils/pluginGenerator'

const { FiDownload, FiX, FiEye, FiEyeOff, FiSettings, FiMail, FiShield } = FiIcons

const PluginDownloadModal = ({ section, onClose, isOpen }) => {
  const [userSettings, setUserSettings] = useState({
    // reCAPTCHA Settings
    recaptchaSiteKey: '',
    recaptchaSecretKey: '',
    
    // Email Settings
    notificationEmails: '',
    fromEmail: '',
    fromName: '',
    
    // SMTP Settings (optional)
    smtpHost: '',
    smtpPort: 587,
    smtpUsername: '',
    smtpPassword: '',
    smtpSecure: true
  })
  
  const [showPasswords, setShowPasswords] = useState({
    recaptchaSecret: false,
    smtpPassword: false
  })
  
  const [isDownloading, setIsDownloading] = useState(false)
  const [activeTab, setActiveTab] = useState('recaptcha')

  const handleInputChange = (field, value) => {
    setUserSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      await downloadPlugin(section, userSettings)
      
      // Track download in Supabase
      await trackPluginDownload(section.id, userSettings)
      
      onClose()
    } catch (error) {
      console.error('Download failed:', error)
      alert('Download failed. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  const trackPluginDownload = async (sectionId, config) => {
    try {
      const { data, error } = await supabase
        .from('table_reservation.plugin_downloads')
        .insert({
          section_id: sectionId,
          user_id: section.user_id,
          plugin_config: {
            ...config,
            // Remove sensitive data from tracking
            recaptchaSecretKey: config.recaptchaSecretKey ? '[CONFIGURED]' : '',
            smtpPassword: config.smtpPassword ? '[CONFIGURED]' : ''
          }
        })
      
      if (error) throw error
    } catch (err) {
      console.error('Error tracking download:', err)
    }
  }

  const tabs = [
    { id: 'recaptcha', label: 'reCAPTCHA v3', icon: FiShield },
    { id: 'email', label: 'Email Setup', icon: FiMail },
    { id: 'advanced', label: 'Advanced', icon: FiSettings }
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <SafeIcon icon={FiDownload} className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Download WordPress Plugin</h2>
              <p className="text-sm text-gray-600">{section.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <SafeIcon icon={FiX} className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Sidebar */}
          <div className="lg:w-64 border-r border-gray-200">
            <div className="p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <SafeIcon icon={tab.icon} className="h-4 w-4" />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto max-h-[60vh]">
            {activeTab === 'recaptcha' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">reCAPTCHA v3 Protection</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Add spam protection to your forms. Get your keys from{' '}
                    <a 
                      href="https://www.google.com/recaptcha/admin" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Google reCAPTCHA
                    </a>
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Site Key (Public)
                    </label>
                    <input
                      type="text"
                      value={userSettings.recaptchaSiteKey}
                      onChange={(e) => handleInputChange('recaptchaSiteKey', e.target.value)}
                      placeholder="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      This key is visible in your HTML code
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Secret Key (Private)
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.recaptchaSecret ? 'text' : 'password'}
                        value={userSettings.recaptchaSecretKey}
                        onChange={(e) => handleInputChange('recaptchaSecretKey', e.target.value)}
                        placeholder="6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe"
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, recaptchaSecret: !prev.recaptchaSecret }))}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        <SafeIcon 
                          icon={showPasswords.recaptchaSecret ? FiEyeOff : FiEye} 
                          className="h-4 w-4 text-gray-400" 
                        />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Keep this key secure - used for server-side verification
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Demo Keys Available</h4>
                  <p className="text-sm text-blue-800">
                    You can use Google's test keys for development. Replace with your own keys for production use.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'email' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Notifications</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Configure automatic email notifications for new reservations.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notification Email Addresses
                    </label>
                    <textarea
                      value={userSettings.notificationEmails}
                      onChange={(e) => handleInputChange('notificationEmails', e.target.value)}
                      placeholder="admin@restaurant.com&#10;manager@restaurant.com&#10;reservations@restaurant.com"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter email addresses (one per line) that should receive reservation notifications
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        From Name
                      </label>
                      <input
                        type="text"
                        value={userSettings.fromName}
                        onChange={(e) => handleInputChange('fromName', e.target.value)}
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
                        value={userSettings.fromEmail}
                        onChange={(e) => handleInputChange('fromEmail', e.target.value)}
                        placeholder="noreply@restaurant.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 mb-2">WordPress Email Setup</h4>
                  <p className="text-sm text-yellow-700">
                    The plugin will use WordPress's built-in wp_mail() function. For reliable delivery, 
                    consider configuring SMTP settings in the Advanced tab or using an email plugin.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'advanced' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Advanced SMTP Settings</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Optional: Configure SMTP for reliable email delivery. Leave blank to use WordPress defaults.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SMTP Host
                      </label>
                      <input
                        type="text"
                        value={userSettings.smtpHost}
                        onChange={(e) => handleInputChange('smtpHost', e.target.value)}
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
                        value={userSettings.smtpPort}
                        onChange={(e) => handleInputChange('smtpPort', parseInt(e.target.value))}
                        placeholder="587"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SMTP Username
                    </label>
                    <input
                      type="text"
                      value={userSettings.smtpUsername}
                      onChange={(e) => handleInputChange('smtpUsername', e.target.value)}
                      placeholder="your-email@gmail.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SMTP Password / App Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.smtpPassword ? 'text' : 'password'}
                        value={userSettings.smtpPassword}
                        onChange={(e) => handleInputChange('smtpPassword', e.target.value)}
                        placeholder="your-app-password"
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, smtpPassword: !prev.smtpPassword }))}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        <SafeIcon 
                          icon={showPasswords.smtpPassword ? FiEyeOff : FiEye} 
                          className="h-4 w-4 text-gray-400" 
                        />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      For Gmail, use an App Password instead of your regular password
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="smtpSecure"
                      checked={userSettings.smtpSecure}
                      onChange={(e) => handleInputChange('smtpSecure', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="smtpSecure" className="text-sm text-gray-700">
                      Use TLS/SSL encryption
                    </label>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-2">Common SMTP Providers</h4>
                  <div className="text-sm text-green-700 space-y-1">
                    <p><strong>Gmail:</strong> smtp.gmail.com, Port: 587, TLS: Yes</p>
                    <p><strong>Outlook:</strong> smtp-mail.outlook.com, Port: 587, TLS: Yes</p>
                    <p><strong>SendGrid:</strong> smtp.sendgrid.net, Port: 587, TLS: Yes</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Plugin will be generated with your settings pre-configured
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <SafeIcon icon={FiDownload} className="h-4 w-4" />
                <span>{isDownloading ? 'Generating...' : 'Download Plugin'}</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default PluginDownloadModal