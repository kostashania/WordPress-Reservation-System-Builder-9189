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
    recaptchaAction: 'reservation'
  });

  useEffect(() => {
    if (id) {
      loadSection(id);
    }
  }, [id]);

  const loadSection = (sectionId) => {
    const savedSections = localStorage.getItem('reservationSections');
    if (savedSections) {
      const sections = JSON.parse(savedSections);
      const section = sections.find(s => s.id === parseInt(sectionId));
      if (section) {
        setSectionName(section.name);
        setSettings(section.settings);
      }
    }
  };

  const saveSection = () => {
    if (!sectionName.trim()) {
      alert('Please enter a section name');
      return;
    }

    const savedSections = localStorage.getItem('reservationSections');
    const sections = savedSections ? JSON.parse(savedSections) : [];
    
    const sectionData = {
      id: id ? parseInt(id) : Date.now(),
      name: sectionName,
      settings: settings,
      userId: user.id,
      createdAt: id ? sections.find(s => s.id === parseInt(id))?.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (id) {
      const index = sections.findIndex(s => s.id === parseInt(id));
      if (index !== -1) {
        sections[index] = sectionData;
      }
    } else {
      sections.push(sectionData);
    }

    localStorage.setItem('reservationSections', JSON.stringify(sections));
    setShowSaveModal(false);
    navigate('/dashboard');
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
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <SafeIcon icon={FiSave} className="h-4 w-4" />
                <span>Save</span>
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
            />
            <div className="flex space-x-3">
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveSection}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Save
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Builder;