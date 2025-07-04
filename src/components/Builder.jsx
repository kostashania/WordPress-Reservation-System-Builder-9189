import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import CustomizationPanel from './CustomizationPanel';
import PreviewSection from './PreviewSection';
import HtmlExporter from './HtmlExporter';

const { FiArrowLeft, FiSave, FiCode, FiEye, FiSettings } = FiIcons;

const Builder = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('customize');
  const [sectionName, setSectionName] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
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
  });

  useEffect(() => {
    if (id) {
      loadSection(id);
    }
  }, [id]);

  const loadSection = (sectionId) => {
    try {
      console.log('Loading section with ID:', sectionId);
      
      const savedSections = localStorage.getItem('reservationSections');
      if (savedSections) {
        const sections = JSON.parse(savedSections);
        console.log('All sections:', sections);
        
        const section = sections.find(s => s.id === parseInt(sectionId) || s.id === sectionId);
        console.log('Found section:', section);
        
        if (section) {
          setSectionName(section.name);
          setSettings(section.settings || settings);
        } else {
          console.log('Section not found');
        }
      } else {
        console.log('No sections found in localStorage');
      }
    } catch (error) {
      console.error('Error loading section:', error);
    }
  };

  const saveSection = () => {
    if (!sectionName.trim()) {
      alert('Please enter a section name');
      return;
    }

    console.log('Starting save process...');
    console.log('Section name:', sectionName);
    console.log('User:', user);
    console.log('Settings:', settings);

    setIsSaving(true);
    
    try {
      const timestamp = new Date().toISOString();
      
      // Create section data
      const sectionData = {
        id: id ? (typeof id === 'string' ? parseInt(id) : id) : Date.now(),
        name: sectionName,
        settings: settings,
        user_id: user.id,
        userId: user.id, // Keep both for compatibility
        created_at: id ? undefined : timestamp,
        updated_at: timestamp,
        createdAt: id ? undefined : timestamp,
        updatedAt: timestamp,
        isActive: true
      };

      console.log('Section data to save:', sectionData);

      // Get existing sections
      const savedSections = localStorage.getItem('reservationSections');
      let sections = savedSections ? JSON.parse(savedSections) : [];
      
      console.log('Existing sections:', sections);

      if (id) {
        // Update existing section
        const index = sections.findIndex(s => s.id === parseInt(id) || s.id === id);
        if (index !== -1) {
          // Keep the original created_at date
          sectionData.created_at = sections[index].created_at;
          sectionData.createdAt = sections[index].createdAt;
          sections[index] = sectionData;
          console.log('Updated existing section at index:', index);
        } else {
          // Section not found, add as new
          sections.push(sectionData);
          console.log('Section not found, added as new');
        }
      } else {
        // Add new section
        sections.push(sectionData);
        console.log('Added new section');
      }

      // Save to localStorage
      localStorage.setItem('reservationSections', JSON.stringify(sections));
      console.log('Saved to localStorage');

      // Verify save
      const verification = localStorage.getItem('reservationSections');
      const verifiedSections = JSON.parse(verification);
      console.log('Verification - sections after save:', verifiedSections);

      setTimeout(() => {
        setShowSaveModal(false);
        setIsSaving(false);
        alert(`Section "${sectionName}" saved successfully!`);
        navigate('/dashboard');
      }, 500);
      
    } catch (error) {
      console.error('Error saving section:', error);
      alert('Error saving section: ' + error.message);
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'customize', label: 'Customize', icon: FiSettings },
    { id: 'preview', label: 'Preview', icon: FiEye },
    { id: 'export', label: 'Export HTML', icon: FiCode }
  ];

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
              <h1 className="text-xl font-semibold text-gray-900">
                {id ? 'Edit Section' : 'Create New Section'}
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowSaveModal(true)}
                disabled={isSaving}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <SafeIcon icon={FiSave} className="h-4 w-4" />
                <span>{isSaving ? 'Saving...' : 'Save'}</span>
              </button>
            </div>
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
        {activeTab === 'customize' && (
          <CustomizationPanel
            settings={settings}
            onSettingsChange={setSettings}
          />
        )}

        {activeTab === 'preview' && (
          <PreviewSection settings={settings} />
        )}

        {activeTab === 'export' && (
          <HtmlExporter settings={settings} />
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
              disabled={isSaving}
              autoFocus
            />
            <div className="flex space-x-3">
              <button
                onClick={() => setShowSaveModal(false)}
                disabled={isSaving}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={saveSection}
                disabled={isSaving || !sectionName.trim()}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Builder;