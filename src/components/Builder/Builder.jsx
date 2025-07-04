import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth'
import { useSupabaseSections } from '../../hooks/useSupabaseSections'
import SettingsPanel from './SettingsPanel'
import PreviewPanel from './PreviewPanel'
import ExportPanel from './ExportPanel'

const { FiArrowLeft, FiSave, FiEye, FiSettings, FiCode, FiCloud } = FiIcons

const Builder = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { user } = useSupabaseAuth()
  const { sections, createSection, updateSection } = useSupabaseSections(user?.id)
  
  const [activeTab, setActiveTab] = useState('settings')
  const [sectionName, setSectionName] = useState('')
  const [settings, setSettings] = useState(null)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (id) {
      loadSection()
    } else {
      setSettings(getDefaultSettings())
    }
  }, [id, sections])

  const getDefaultSettings = () => ({
    // Text Settings
    title: 'Reserve Your Table',
    subtitle: 'Book your perfect dining experience',
    buttonText: 'Make Reservation',
    
    // Background Settings
    backgroundType: 'color',
    backgroundColor: '#ffffff',
    backgroundImage: '',
    backgroundOverlay: true,
    overlayColor: '#000000',
    overlayOpacity: 0.5,
    
    // Button Settings
    buttonStyle: 'modern',
    buttonColor: '#3b82f6',
    buttonTextColor: '#ffffff',
    buttonHoverColor: '#2563eb',
    buttonRadius: 8,
    buttonSize: 'medium',
    
    // Text Colors
    titleColor: '#1f2937',
    subtitleColor: '#6b7280',
    
    // Layout Settings
    alignment: 'center',
    padding: 'large',
    maxWidth: '800px',
    
    // Effects
    animation: 'fadeIn',
    shadow: 'medium',
    borderRadius: 12,
    
    // Form Settings
    showDatePicker: true,
    showTimePicker: true,
    showGuestCount: true,
    showSpecialRequests: true,
    formStyle: 'inline',
    
    // reCAPTCHA v3 Settings
    enableRecaptcha: false,
    recaptchaSiteKey: '',
    recaptchaSecretKey: '',
    recaptchaThreshold: 0.5,
    recaptchaAction: 'reservation',
    
    // Email Settings
    enableEmailNotifications: false,
    emailProvider: 'simple',
    notificationEmails: [],
    emailSubject: 'New Table Reservation Request',
    emailTemplate: '',
    
    // SMTP Settings
    smtpHost: '',
    smtpPort: 587,
    smtpUsername: '',
    smtpPassword: '',
    smtpFromName: '',
    smtpFromEmail: '',
    smtpSecure: false,
    
    // Simple Email Settings
    simpleEmailService: 'emailjs',
    emailjsServiceId: '',
    emailjsTemplateId: '',
    emailjsPublicKey: '',
    webhookUrl: ''
  })

  const loadSection = () => {
    if (sections.length > 0) {
      const section = sections.find(s => s.id === id)
      if (section) {
        setSectionName(section.name)
        setSettings(section.settings || getDefaultSettings())
      } else {
        navigate('/dashboard')
      }
    }
  }

  const handleSave = async () => {
    if (!sectionName.trim()) {
      alert('Please enter a section name')
      return
    }

    setIsSaving(true)
    try {
      if (id) {
        // Update existing section
        await updateSection(id, {
          name: sectionName,
          settings: settings
        })
      } else {
        // Create new section
        await createSection({
          name: sectionName,
          settings: settings
        })
      }
      
      setShowSaveModal(false)
      navigate('/dashboard')
    } catch (error) {
      alert('Error saving section: ' + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const updateSettings = (newSettings) => {
    setSettings(newSettings)
  }

  const tabs = [
    { id: 'settings', label: 'Settings', icon: FiSettings },
    { id: 'preview', label: 'Preview', icon: FiEye },
    { id: 'export', label: 'Export', icon: FiCode }
  ]

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <SafeIcon icon={FiArrowLeft} className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {id ? 'Edit Section' : 'Create New Section'}
                </h1>
                <div className="flex items-center space-x-2 mt-1">
                  <SafeIcon icon={FiCloud} className="h-3 w-3 text-blue-500" />
                  <span className="text-xs text-blue-600">Auto-saved to cloud</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowSaveModal(true)}
              disabled={isSaving}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              <SafeIcon icon={FiSave} className="h-4 w-4" />
              <span>{isSaving ? 'Saving...' : 'Save'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <SafeIcon icon={tab.icon} className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'settings' && (
          <SettingsPanel settings={settings} onSettingsChange={updateSettings} />
        )}
        {activeTab === 'preview' && (
          <PreviewPanel settings={settings} />
        )}
        {activeTab === 'export' && (
          <ExportPanel settings={settings} />
        )}
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
          >
            <h3 className="text-lg font-semibold mb-4">Save Section</h3>
            <input
              type="text"
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
              placeholder="Enter section name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              autoFocus
            />
            <div className="flex space-x-3">
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !sectionName.trim()}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default Builder