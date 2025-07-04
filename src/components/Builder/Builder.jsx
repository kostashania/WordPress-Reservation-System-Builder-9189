import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiSave, FiEye, FiSettings, FiCode } from 'react-icons/fi';
import { DB } from '../../schema/database';
import SettingsPanel from './SettingsPanel';
import PreviewPanel from './PreviewPanel';
import ExportPanel from './ExportPanel';

const Builder = ({ user }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('settings');
  const [sectionName, setSectionName] = useState('');
  const [settings, setSettings] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadSection();
    } else {
      setSettings(DB.getDefaultSettings());
    }
  }, [id]);

  const loadSection = () => {
    const section = DB.getSection(id);
    if (section) {
      setSectionName(section.name);
      setSettings(section.settings);
    } else {
      navigate('/dashboard');
    }
  };

  const handleSave = async () => {
    if (!sectionName.trim()) {
      alert('Please enter a section name');
      return;
    }

    setLoading(true);
    try {
      if (id) {
        // Update existing section
        DB.updateSection(id, {
          name: sectionName,
          settings: settings
        });
      } else {
        // Create new section
        DB.addSection({
          name: sectionName,
          settings: settings
        }, user.id);
      }
      
      setShowSaveModal(false);
      navigate('/dashboard');
    } catch (error) {
      alert('Error saving section');
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = (newSettings) => {
    setSettings(newSettings);
  };

  const tabs = [
    { id: 'settings', label: 'Settings', icon: FiSettings },
    { id: 'preview', label: 'Preview', icon: FiEye },
    { id: 'export', label: 'Export', icon: FiCode }
  ];

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
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
                <FiArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">
                {id ? 'Edit Section' : 'Create New Section'}
              </h1>
            </div>
            <button
              onClick={() => setShowSaveModal(true)}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              <FiSave className="h-4 w-4" />
              <span>Save</span>
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
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'settings' && (
          <SettingsPanel
            settings={settings}
            onSettingsChange={updateSettings}
          />
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
                disabled={loading || !sectionName.trim()}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Builder;