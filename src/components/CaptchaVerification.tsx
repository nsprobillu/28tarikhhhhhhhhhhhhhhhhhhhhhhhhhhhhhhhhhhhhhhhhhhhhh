// src/components/CaptchaVerification.tsx
import React, { useEffect, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';

interface CaptchaVerificationProps {
  siteKey: string;
  onVerify: (response: string) => void;
  className?: string;
}

export function CaptchaVerification({ siteKey, onVerify, className = '' }: CaptchaVerificationProps) {
  const captchaRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);
  const [isVerified, setIsVerified] = useState(false);

  // Custom verification handler that updates local state
  const handleVerification = (response: string) => {
    setIsVerified(true);
    onVerify(response);
  };

  useEffect(() => {
    // Load the reCAPTCHA script if it's not already loaded
    if (!window.grecaptcha) {
      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?render=explicit`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
      };
    }

    // Ensure the script has loaded before trying to render the captcha
    const renderCaptcha = () => {
      if (window.grecaptcha && window.grecaptcha.render && captchaRef.current && !isVerified) {
        // Reset if already rendered
        if (widgetIdRef.current !== null) {
          window.grecaptcha.reset(widgetIdRef.current);
        } else {
          // Render new captcha
          try {
            widgetIdRef.current = window.grecaptcha.render(captchaRef.current, {
              sitekey: siteKey,
              callback: handleVerification, // Use our custom handler
              'expired-callback': () => {
                setIsVerified(false);
                console.log('Captcha expired');
              },
              'error-callback': () => {
                setIsVerified(false);
                console.error('Captcha error');
              }
            });
          } catch (error) {
            console.error('Error rendering captcha:', error);
          }
        }
      } else {
        // If grecaptcha is not available yet, try again in 100ms
        setTimeout(renderCaptcha, 100);
      }
    };

    // Start the rendering process
    if (!isVerified) {
      if (window.grecaptcha?.render) {
        renderCaptcha();
      } else {
        window.onload = renderCaptcha;
      }
    }

    return () => {
      // Cleanup
      if (typeof window !== 'undefined' && window.onload === renderCaptcha) {
        window.onload = null;
      }
    };
  }, [siteKey, onVerify, isVerified]);

  const handleRefresh = () => {
    if (window.grecaptcha && widgetIdRef.current !== null) {
      setIsVerified(false);
      window.grecaptcha.reset(widgetIdRef.current);
    }
  };

  // If verified, just show the success message
  if (isVerified) {
    return (
      <div className={`captcha-container ${className}`}>
        <div className="mt-3 p-2 bg-green-50 rounded-lg text-sm text-green-700 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          CAPTCHA verified successfully. You can now create the email.
        </div>
      </div>
    );
  }

  // Otherwise, show the CAPTCHA widget
  return (
    <div className={`captcha-container ${className}`}>
      <div className="flex flex-col items-center">
        <div ref={captchaRef} className="mb-4"></div>
        <button
          type="button"
          onClick={handleRefresh}
          className="flex items-center text-[#4A90E2] hover:text-[#357ABD] transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          Refresh CAPTCHA
        </button>
      </div>
    </div>
  );
}

// Add global type declaration for the grecaptcha object
declare global {
  interface Window {
    grecaptcha: {
      render: (
        container: HTMLElement | string,
        parameters: {
          sitekey: string;
          callback?: (response: string) => void;
          'expired-callback'?: () => void;
          'error-callback'?: () => void;
        }
      ) => number;
      reset: (widgetId: number) => void;
      execute: (widgetId: number) => void;
      ready: (callback: () => void) => void;
    };
    onload: (() => void) | null;
  }
}
