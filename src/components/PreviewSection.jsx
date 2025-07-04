import React from 'react';
import { motion } from 'framer-motion';

const PreviewSection = ({ settings }) => {
  const getAnimationProps = () => {
    switch (settings.animation) {
      case 'fadeIn':
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: 0.8 }
        };
      case 'slideUp':
        return {
          initial: { opacity: 0, y: 50 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.8 }
        };
      case 'slideDown':
        return {
          initial: { opacity: 0, y: -50 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.8 }
        };
      case 'zoomIn':
        return {
          initial: { opacity: 0, scale: 0.8 },
          animate: { opacity: 1, scale: 1 },
          transition: { duration: 0.8 }
        };
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

  const getFormLayoutClass = () => {
    switch (settings.formStyle) {
      case 'inline': return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-end';
      case 'stacked': return 'flex flex-col space-y-4';
      case 'grid': return 'grid grid-cols-1 md:grid-cols-2 gap-4';
      default: return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-end';
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

  const shouldStack = visibleFields > 4 || settings.formStyle === 'stacked';

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
                <div className={shouldStack ? 'flex flex-col space-y-4' : getFormLayoutClass()}>
                  {/* Form Fields */}
                  {settings.showDatePicker && (
                    <div className="flex-1 min-w-0">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                      <input 
                        type="date" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      />
                    </div>
                  )}
                  
                  {settings.showTimePicker && (
                    <div className="flex-1 min-w-0">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                      <input 
                        type="time" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      />
                    </div>
                  )}
                  
                  {settings.showGuestCount && (
                    <div className="flex-1 min-w-0">
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

                  {/* Contact Information */}
                  <div className="flex-1 min-w-0">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input 
                      type="text" 
                      placeholder="Your name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input 
                      type="email" 
                      placeholder="your@email.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input 
                      type="tel" 
                      placeholder="(123) 456-7890"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>

                  {/* Special Requests for stacked layout */}
                  {settings.showSpecialRequests && shouldStack && (
                    <div className="w-full">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests</label>
                      <textarea 
                        rows="3" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Any special requests or dietary requirements..."
                      />
                    </div>
                  )}
                </div>

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
          <strong>Layout:</strong> {shouldStack ? 'Stacked (responsive)' : 'Grid'} • 
          <strong> Fields:</strong> {visibleFields} visible • 
          <strong> Style:</strong> {settings.formStyle}
        </div>
      </div>
    </div>
  );
};

export default PreviewSection;