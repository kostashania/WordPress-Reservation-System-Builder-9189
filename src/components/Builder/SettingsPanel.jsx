import React, { useState } from 'react';
import { FiType, FiImage, FiMousePointer, FiLayout, FiEdit3 } from 'react-icons/fi';

const SettingsPanel = ({ settings, onSettingsChange }) => {
  const [activeSection, setActiveSection] = useState('content');

  const updateSetting = (key, value) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  const sections = [
    { id: 'content', label: 'Content', icon: FiType },
    { id: 'background', label: 'Background', icon: FiImage },
    { id: 'button', label: 'Button', icon: FiMousePointer },
    { id: 'layout', label: 'Layout', icon: FiLayout },
    { id: 'form', label: 'Form', icon: FiEdit3 }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-900">Settings</h3>
          </div>
          <div className="p-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeSection === section.id
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <section.icon className="h-4 w-4" />
                <span className="text-sm font-medium">{section.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="lg:col-span-3">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            {activeSection === 'content' && (
              <ContentSettings settings={settings} updateSetting={updateSetting} />
            )}
            {activeSection === 'background' && (
              <BackgroundSettings settings={settings} updateSetting={updateSetting} />
            )}
            {activeSection === 'button' && (
              <ButtonSettings settings={settings} updateSetting={updateSetting} />
            )}
            {activeSection === 'layout' && (
              <LayoutSettings settings={settings} updateSetting={updateSetting} />
            )}
            {activeSection === 'form' && (
              <FormSettings settings={settings} updateSetting={updateSetting} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ContentSettings = ({ settings, updateSetting }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-semibold text-gray-900">Content</h3>
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
        <input
          type="text"
          value={settings.title}
          onChange={(e) => updateSetting('title', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
        <input
          type="text"
          value={settings.subtitle}
          onChange={(e) => updateSetting('subtitle', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
        <input
          type="text"
          value={settings.buttonText}
          onChange={(e) => updateSetting('buttonText', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Title Color</label>
          <input
            type="color"
            value={settings.titleColor}
            onChange={(e) => updateSetting('titleColor', e.target.value)}
            className="w-full h-10 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle Color</label>
          <input
            type="color"
            value={settings.subtitleColor}
            onChange={(e) => updateSetting('subtitleColor', e.target.value)}
            className="w-full h-10 border border-gray-300 rounded-lg"
          />
        </div>
      </div>
    </div>
  </div>
);

const BackgroundSettings = ({ settings, updateSetting }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-semibold text-gray-900">Background</h3>
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Background Type</label>
        <select
          value={settings.backgroundType}
          onChange={(e) => updateSetting('backgroundType', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="color">Solid Color</option>
          <option value="image">Image</option>
        </select>
      </div>
      {settings.backgroundType === 'color' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
          <input
            type="color"
            value={settings.backgroundColor}
            onChange={(e) => updateSetting('backgroundColor', e.target.value)}
            className="w-full h-10 border border-gray-300 rounded-lg"
          />
        </div>
      )}
      {settings.backgroundType === 'image' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
          <input
            type="url"
            value={settings.backgroundImage}
            onChange={(e) => updateSetting('backgroundImage', e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}
    </div>
  </div>
);

const ButtonSettings = ({ settings, updateSetting }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-semibold text-gray-900">Button</h3>
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Button Style</label>
        <select
          value={settings.buttonStyle}
          onChange={(e) => updateSetting('buttonStyle', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="modern">Modern</option>
          <option value="classic">Classic</option>
          <option value="minimal">Minimal</option>
          <option value="outline">Outline</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Button Size</label>
        <select
          value={settings.buttonSize}
          onChange={(e) => updateSetting('buttonSize', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Button Color</label>
          <input
            type="color"
            value={settings.buttonColor}
            onChange={(e) => updateSetting('buttonColor', e.target.value)}
            className="w-full h-10 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
          <input
            type="color"
            value={settings.buttonTextColor}
            onChange={(e) => updateSetting('buttonTextColor', e.target.value)}
            className="w-full h-10 border border-gray-300 rounded-lg"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Border Radius: {settings.buttonRadius}px
        </label>
        <input
          type="range"
          min="0"
          max="50"
          value={settings.buttonRadius}
          onChange={(e) => updateSetting('buttonRadius', parseInt(e.target.value))}
          className="w-full"
        />
      </div>
    </div>
  </div>
);

const LayoutSettings = ({ settings, updateSetting }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-semibold text-gray-900">Layout</h3>
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Alignment</label>
        <select
          value={settings.alignment}
          onChange={(e) => updateSetting('alignment', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Padding</label>
        <select
          value={settings.padding}
          onChange={(e) => updateSetting('padding', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Max Width</label>
        <input
          type="text"
          value={settings.maxWidth}
          onChange={(e) => updateSetting('maxWidth', e.target.value)}
          placeholder="800px"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  </div>
);

const FormSettings = ({ settings, updateSetting }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-semibold text-gray-900">Form Fields</h3>
    <div className="space-y-4">
      <div className="space-y-3">
        <h4 className="font-medium text-gray-800">Show Fields</h4>
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.showDatePicker}
              onChange={(e) => updateSetting('showDatePicker', e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Date Picker</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.showTimePicker}
              onChange={(e) => updateSetting('showTimePicker', e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Time Picker</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.showGuestCount}
              onChange={(e) => updateSetting('showGuestCount', e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Guest Count</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.showSpecialRequests}
              onChange={(e) => updateSetting('showSpecialRequests', e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Special Requests</span>
          </label>
        </div>
      </div>
    </div>
  </div>
);

export default SettingsPanel;