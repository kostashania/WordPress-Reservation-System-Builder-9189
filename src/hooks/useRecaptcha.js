import { useEffect, useState, useCallback } from 'react';

const useRecaptcha = (siteKey) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!siteKey) {
      setError('reCAPTCHA site key is required');
      return;
    }

    // Check if reCAPTCHA script is already loaded
    if (window.grecaptcha && window.grecaptcha.ready) {
      window.grecaptcha.ready(() => {
        setIsLoaded(true);
      });
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.defer = true;

    // Handle successful load
    script.onload = () => {
      if (window.grecaptcha && window.grecaptcha.ready) {
        window.grecaptcha.ready(() => {
          setIsLoaded(true);
          setError(null);
        });
      } else {
        setError('reCAPTCHA failed to initialize');
      }
    };

    // Handle load error
    script.onerror = () => {
      setError('Failed to load reCAPTCHA script');
    };

    // Add script to document
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      try {
        const existingScript = document.querySelector(`script[src*="recaptcha"][src*="${siteKey}"]`);
        if (existingScript && existingScript.parentNode) {
          existingScript.parentNode.removeChild(existingScript);
        }
      } catch (e) {
        console.warn('Error cleaning up reCAPTCHA script:', e);
      }
    };
  }, [siteKey]);

  const executeRecaptcha = useCallback(async (action = 'submit') => {
    if (!isLoaded) {
      throw new Error('reCAPTCHA not loaded yet');
    }

    if (!window.grecaptcha || !window.grecaptcha.execute) {
      throw new Error('reCAPTCHA not available');
    }

    try {
      const token = await window.grecaptcha.execute(siteKey, { action });
      return token;
    } catch (error) {
      console.error('reCAPTCHA execution failed:', error);
      throw new Error('reCAPTCHA execution failed');
    }
  }, [isLoaded, siteKey]);

  return { 
    isLoaded, 
    error, 
    executeRecaptcha 
  };
};

export default useRecaptcha;