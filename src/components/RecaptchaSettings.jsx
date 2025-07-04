import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiShield, FiEye, FiEyeOff, FiInfo, FiCheck, FiX, FiExternalLink } = FiIcons;

const RecaptchaSettings = ({ settings, updateSetting }) => {
  const [showSiteKey, setShowSiteKey] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  const testRecaptcha = async () => {
    if (!settings.recaptchaSiteKey) {
      setTestResult({ success: false, message: 'Please enter a site key first' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      // Remove any existing reCAPTCHA scripts
      const existingScripts = document.querySelectorAll('script[src*="recaptcha"]');
      existingScripts.forEach(script => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      });

      // Create and load new script
      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?render=${settings.recaptchaSiteKey}`;
      script.async = true;
      
      script.onload = () => {
        if (window.grecaptcha && window.grecaptcha.ready) {
          window.grecaptcha.ready(() => {
            setTestResult({ 
              success: true, 
              message: 'reCAPTCHA loaded successfully! Site key is valid.' 
            });
            setIsTesting(false);
          });
        } else {
          setTestResult({ 
            success: false, 
            message: 'reCAPTCHA script loaded but failed to initialize.' 
          });
          setIsTesting(false);
        }
      };

      script.onerror = () => {
        setTestResult({ 
          success: false, 
          message: 'Failed to load reCAPTCHA. Please check your site key and internet connection.' 
        });
        setIsTesting(false);
      };

      document.head.appendChild(script);

      // Timeout after 10 seconds
      setTimeout(() => {
        if (isTesting) {
          setTestResult({ 
            success: false, 
            message: 'Test timeout. Please check your site key and try again.' 
          });
          setIsTesting(false);
        }
      }, 10000);

    } catch (error) {
      setTestResult({ 
        success: false, 
        message: 'Error testing reCAPTCHA: ' + error.message 
      });
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <SafeIcon icon={FiShield} className="h-6 w-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">reCAPTCHA v3 Settings</h3>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <SafeIcon icon={FiInfo} className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">About reCAPTCHA v3</h4>
            <p className="text-sm text-blue-800 mt-1">
              reCAPTCHA v3 runs in the background and provides a score (0.0-1.0) based on user interactions. 
              No user interaction required - it's completely invisible!
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="enableRecaptcha"
            checked={settings.enableRecaptcha || false}
            onChange={(e) => updateSetting('enableRecaptcha', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="enableRecaptcha" className="text-sm font-medium text-gray-700">
            Enable reCAPTCHA v3 Protection
          </label>
        </div>

        {settings.enableRecaptcha && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-4"
          >
            {/* Site Key */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                reCAPTCHA Site Key (Public)
              </label>
              <div className="relative">
                <input
                  type={showSiteKey ? 'text' : 'password'}
                  value={settings.recaptchaSiteKey || ''}
                  onChange={(e) => updateSetting('recaptchaSiteKey', e.target.value)}
                  placeholder="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowSiteKey(!showSiteKey)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <SafeIcon 
                    icon={showSiteKey ? FiEyeOff : FiEye} 
                    className="h-4 w-4 text-gray-400" 
                  />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                This key is used in your HTML code and is visible to users
              </p>
            </div>

            {/* Secret Key */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                reCAPTCHA Secret Key (Private)
              </label>
              <div className="relative">
                <input
                  type={showSecretKey ? 'text' : 'password'}
                  value={settings.recaptchaSecretKey || ''}
                  onChange={(e) => updateSetting('recaptchaSecretKey', e.target.value)}
                  placeholder="6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe"
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowSecretKey(!showSecretKey)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <SafeIcon 
                    icon={showSecretKey ? FiEyeOff : FiEye} 
                    className="h-4 w-4 text-gray-400" 
                  />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                This key is used for server-side verification and should be kept private
              </p>
            </div>

            {/* Score Threshold */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Score Threshold
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.1"
                  value={settings.recaptchaThreshold || 0.5}
                  onChange={(e) => updateSetting('recaptchaThreshold', parseFloat(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm font-medium text-gray-700 min-w-[3rem]">
                  {settings.recaptchaThreshold || 0.5}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Lower scores indicate bot traffic. Recommended: 0.5 (moderate) to 0.7 (strict)
              </p>
            </div>

            {/* Action Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Action Name
              </label>
              <input
                type="text"
                value={settings.recaptchaAction || 'reservation'}
                onChange={(e) => updateSetting('recaptchaAction', e.target.value)}
                placeholder="reservation"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Action name for this form (helps with analytics)
              </p>
            </div>

            {/* Test Button */}
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={testRecaptcha}
                disabled={isTesting}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isTesting ? 'Testing...' : 'Test reCAPTCHA'}
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
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-800 mb-2">Setup Instructions:</h4>
        <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
          <li>
            Go to{' '}
            <a 
              href="https://www.google.com/recaptcha/admin" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-600 hover:underline inline-flex items-center"
            >
              Google reCAPTCHA Admin Console
              <SafeIcon icon={FiExternalLink} className="h-3 w-3 ml-1" />
            </a>
          </li>
          <li>Click "+" to create a new site</li>
          <li>Choose "reCAPTCHA v3" as the type</li>
          <li>Add your domain(s) to the domain list</li>
          <li>Copy the Site Key and Secret Key</li>
          <li>Paste them in the fields above</li>
          <li>Test the configuration using the test button</li>
        </ol>
      </div>

      {/* Demo Keys Info */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-medium text-green-800 mb-2">Demo Keys (For Testing):</h4>
        <div className="text-sm text-green-700 space-y-1">
          <p><strong>Site Key:</strong> 6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI</p>
          <p><strong>Secret Key:</strong> 6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe</p>
          <p className="text-xs mt-2">These are Google's test keys and will always pass validation. Replace with your own keys for production.</p>
        </div>
      </div>

      {/* Server-side Verification Info */}
      {settings.enableRecaptcha && settings.recaptchaSecretKey && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-800 mb-2">Server-side Verification</h4>
          <p className="text-sm text-gray-600 mb-3">
            The exported HTML will include JavaScript to verify the reCAPTCHA token. 
            For production use, implement server-side verification:
          </p>
          <div className="bg-gray-800 rounded p-3 overflow-x-auto">
            <code className="text-green-400 text-xs">
              {`// PHP Example
$recaptcha_secret = '${settings.recaptchaSecretKey}';
$recaptcha_response = $_POST['g-recaptcha-response'];
$url = 'https://www.google.com/recaptcha/api/siteverify';
$data = [
  'secret' => $recaptcha_secret,
  'response' => $recaptcha_response
];
$response = json_decode(file_get_contents($url, false, stream_context_create([
  'http' => ['method' => 'POST', 'content' => http_build_query($data)]
])));
if ($response->success && $response->score >= ${settings.recaptchaThreshold || 0.5}) {
  // Valid submission
}`}
            </code>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecaptchaSettings;