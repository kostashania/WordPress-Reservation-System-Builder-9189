import React from 'react';
import { motion } from 'framer-motion';

const PreviewSection = ({ settings }) => {
  const getAnimationProps = () => {
    switch (settings.animation) {
      case 'fadeIn':
        return { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.8 } };
      case 'slideUp':
        return { initial: { opacity: 0, y: 50 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8 } };
      case 'slideDown':
        return { initial: { opacity: 0, y: -50 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8 } };
      case 'zoomIn':
        return { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.8 } };
      default:
        return {};
    }
  };

  const getShadowClass = () => {
    switch (settings.shadow) {
      case 'small': return 'shadow-sm';
      case 'medium': return 'shadow-md';
      case 'large': return 'shadow-lg';
      default: return '';
    }
  };

  const getPaddingClass = () => {
    switch (settings.padding) {
      case 'small': return 'p-6';
      case 'medium': return 'p-8';
      case 'large': return 'p-12';
      default: return 'p-8';
    }
  };

  const getButtonSizeClass = () => {
    switch (settings.buttonSize) {
      case 'small': return 'px-4 py-2 text-sm';
      case 'medium': return 'px-6 py-3 text-base';
      case 'large': return 'px-8 py-4 text-lg';
      default: return 'px-6 py-3 text-base';
    }
  };

  const getButtonStyleClass = () => {
    const baseClass = getButtonSizeClass();
    switch (settings.buttonStyle) {
      case 'modern':
        return `${baseClass} font-semibold rounded-lg transition-all duration-200 hover:transform hover:scale-105`;
      case 'classic':
        return `${baseClass} font-medium rounded border-2 transition-all duration-200`;
      case 'minimal':
        return `${baseClass} font-medium rounded-none border-b-2 bg-transparent transition-all duration-200`;
      case 'gradient':
        return `${baseClass} font-semibold rounded-lg bg-gradient-to-r transition-all duration-200`;
      case 'outline':
        return `${baseClass} font-medium rounded-lg border-2 bg-transparent transition-all duration-200`;
      default:
        return `${baseClass} font-semibold rounded-lg transition-all duration-200`;
    }
  };

  const sectionStyle = {
    backgroundColor: settings.backgroundType === 'color' ? settings.backgroundColor : 'transparent',
    backgroundImage: settings.backgroundType === 'image' ? `url(${settings.backgroundImage})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    textAlign: settings.alignment,
    maxWidth: settings.maxWidth,
    borderRadius: `${settings.borderRadius}px`,
    position: 'relative'
  };

  const overlayStyle = settings.backgroundType === 'image' && settings.backgroundOverlay ? {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: settings.overlayColor,
    opacity: settings.overlayOpacity,
    borderRadius: `${settings.borderRadius}px`
  } : {};

  const buttonStyle = {
    backgroundColor: settings.buttonStyle === 'outline' ? 'transparent' : settings.buttonColor,
    color: settings.buttonStyle === 'outline' ? settings.buttonColor : settings.buttonTextColor,
    borderColor: settings.buttonColor,
    borderRadius: `${settings.buttonRadius}px`
  };

  // Count visible form fields
  const visibleFields = [
    settings.showDatePicker,
    settings.showTimePicker,
    settings.showGuestCount,
    true, // name field (always shown)
    true, // email field (always shown)
    true  // phone field (always shown)
  ].filter(Boolean).length;

  const getFormLayoutClass = () => {
    switch (settings.formStyle) {
      case 'inline':
        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4';
      case 'stacked':
        return 'flex flex-col space-y-4';
      case 'grid':
        return 'grid grid-cols-1 md:grid-cols-2 gap-4';
      default:
        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4';
    }
  };

  const renderFormFields = () => {
    const fields = [];
    
    // First row - Reservation details
    if (settings.showDatePicker) {
      fields.push(
        <div key="date" className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
          <input 
            type="date" 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
          />
        </div>
      );
    }

    if (settings.showTimePicker) {
      fields.push(
        <div key="time" className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
          <input 
            type="time" 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
          />
        </div>
      );
    }

    if (settings.showGuestCount) {
      fields.push(
        <div key="guests" className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-2">Guests</label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>1</option>
            <option>2</option>
            <option>3</option>
            <option>4</option>
            <option>5+</option>
          </select>
        </div>
      );
    }

    // Contact Information
    fields.push(
      <div key="name" className="w-full">
        <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
        <input 
          type="text" 
          placeholder="Your name" 
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
        />
      </div>
    );

    fields.push(
      <div key="email" className="w-full">
        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
        <input 
          type="email" 
          placeholder="your@email.com" 
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
        />
      </div>
    );

    fields.push(
      <div key="phone" className="w-full">
        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
        <input 
          type="tel" 
          placeholder="(123) 456-7890" 
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
        />
      </div>
    );

    // Special Requests for stacked layout
    if (settings.showSpecialRequests && settings.formStyle === 'stacked') {
      fields.push(
        <div key="special" className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests</label>
          <textarea 
            rows="3" 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
            placeholder="Any special requests or dietary requirements..." 
          />
        </div>
      );
    }

    return fields;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Preview</h3>
        <div className="text-sm text-gray-500">
          This is how your section will look on the website
        </div>
      </div>

      <div className="bg-gray-100 p-8 rounded-lg overflow-auto">
        <div className="flex justify-center">
          <motion.div
            {...getAnimationProps()}
            style={sectionStyle}
            className={`relative ${getShadowClass()} ${getPaddingClass()} mx-auto w-full`}
          >
            {settings.backgroundType === 'image' && settings.backgroundOverlay && (
              <div style={overlayStyle}></div>
            )}
            
            <div className="relative z-10">
              <h2 
                className="text-3xl font-bold mb-4" 
                style={{ color: settings.titleColor }}
              >
                {settings.title}
              </h2>
              
              <p 
                className="text-lg mb-8" 
                style={{ color: settings.subtitleColor }}
              >
                {settings.subtitle}
              </p>

              <div className="mb-8">
                {/* Form Layout Based on Style */}
                {settings.formStyle === 'stacked' ? (
                  <div className="flex flex-col space-y-4">
                    {renderFormFields()}
                  </div>
                ) : settings.formStyle === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderFormFields()}
                  </div>
                ) : (
                  // Inline layout - organized in logical rows
                  <div className="space-y-4">
                    {/* First Row - Reservation Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {settings.showDatePicker && (
                        <div className="w-full">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                          <input 
                            type="date" 
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                          />
                        </div>
                      )}
                      
                      {settings.showTimePicker && (
                        <div className="w-full">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                          <input 
                            type="time" 
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                          />
                        </div>
                      )}
                      
                      {settings.showGuestCount && (
                        <div className="w-full">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Guests</label>
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option>1</option>
                            <option>2</option>
                            <option>3</option>
                            <option>4</option>
                            <option>5+</option>
                          </select>
                        </div>
                      )}
                      
                      {/* If only 1-2 fields in first row, add Name here */}
                      {([settings.showDatePicker, settings.showTimePicker, settings.showGuestCount].filter(Boolean).length <= 2) && (
                        <div className="w-full">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                          <input 
                            type="text" 
                            placeholder="Your name" 
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                          />
                        </div>
                      )}
                    </div>

                    {/* Second Row - Contact Information */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Only show Name here if not already shown above */}
                      {([settings.showDatePicker, settings.showTimePicker, settings.showGuestCount].filter(Boolean).length > 2) && (
                        <div className="w-full">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                          <input 
                            type="text" 
                            placeholder="Your name" 
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                          />
                        </div>
                      )}
                      
                      <div className="w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input 
                          type="email" 
                          placeholder="your@email.com" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        />
                      </div>
                      
                      <div className="w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                        <input 
                          type="tel" 
                          placeholder="(123) 456-7890" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="mt-6 flex justify-center">
                  <button
                    style={buttonStyle}
                    className={getButtonStyleClass()}
                  >
                    {settings.buttonText}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Layout Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="text-sm text-blue-800">
          <strong>Layout:</strong> {settings.formStyle} • 
          <strong> Fields:</strong> {visibleFields} visible • 
          <strong> Responsive:</strong> Organized in logical rows
        </div>
      </div>
    </div>
  );
};

export default PreviewSection;