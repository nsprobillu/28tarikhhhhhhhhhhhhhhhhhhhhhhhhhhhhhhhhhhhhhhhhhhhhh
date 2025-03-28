import { useEffect } from 'react';

// Declare global types
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
    google_tag_manager: any;
    clarity: any;
  }
}

// Initialize Google Tag Manager
export const initGTM = () => {
  if (!window.google_tag_manager) {
    (function(w,d,s,l,i) {
      w[l]=w[l]||[];
      w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});
      const f=d.getElementsByTagName(s)[0],
      j=d.createElement(s) as HTMLScriptElement,
      dl=l!='dataLayer'?'&l='+l:'';
      j.async=true;
      j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
      f.parentNode?.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-KLS9CDDD');
  }
};

// Initialize Google Ads tracking with enhanced parameters
export const initGoogleAds = () => {
  if (!window.gtag) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=AW-16869111887`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function() {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', 'AW-16869111887', {
      'conversion_linker': true,
      'cookie_expires': 90 * 24 * 60 * 60, // 90 days
      'allow_enhanced_conversions': true
    });
  }
};

// Track events with enhanced attribution
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  const gclidData = getGclidData();
  const enhancedProperties = {
    ...properties,
    gclid: gclidData?.gclid,
    first_visit: gclidData?.timestamp,
    traffic_source: gclidData?.referrer,
    landing_page: gclidData?.landingPage
  };

  // Track in Clarity
  if (window.clarity) {
    window.clarity("event", eventName, enhancedProperties);
  }

  // Track in Google Analytics with enhanced parameters
  if (window.gtag) {
    window.gtag('event', eventName, {
      ...enhancedProperties,
      event_category: 'User Action',
      non_interaction: false,
      send_to: ['G-57X37HCMGW', 'AW-16869111887']
    });
  }
};

// Set user data with enhanced tracking
export const setUserData = (userId: string, properties?: Record<string, any>) => {
  const gclidData = getGclidData();
  const enhancedProperties = {
    ...properties,
    user_id: userId,
    registration_source: gclidData ? 'google_ads' : 'organic',
    registration_gclid: gclidData?.gclid,
    first_interaction: gclidData?.timestamp
  };

  if (window.clarity) {
    window.clarity("identify", userId, enhancedProperties);
  }

  if (window.gtag) {
    window.gtag('set', 'user_data', enhancedProperties);
    window.gtag('event', 'user_data_set', enhancedProperties);
  }
};

// Track Google Ads conversion with enhanced validation
export const trackGoogleAdsConversion = () => {
  const gclidData = getGclidData();
  if (!gclidData?.gclid) return; // Only track if GCLID exists

  if (window.gtag) {
    const conversionData = {
      send_to: 'AW-16869111887/gVnTCNDHvasaEM_w6Os-',
      value: 1.0,
      currency: 'USD',
      transaction_id: `reg_${Date.now()}`,
      new_customer: true,
      gclid: gclidData.gclid,
      conversion_timestamp: new Date().toISOString(),
      landing_page: gclidData.landingPage,
      user_agent: gclidData.userAgent
    };

    // Send conversion event
    window.gtag('event', 'conversion', conversionData);

    // Send enhanced conversion data
    window.gtag('set', 'user_data', {
      email_address: localStorage.getItem('registration_email'),
      phone_number: null,
      address: null
    });
  }
};

// Enhanced GCLID handling
export const getGclid = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('gclid');
};

// Store GCLID with enhanced metadata
export const storeGclid = () => {
  const gclid = getGclid();
  if (gclid) {
    const metadata = {
      gclid,
      timestamp: Date.now(),
      referrer: document.referrer,
      landingPage: window.location.pathname,
      userAgent: navigator.userAgent,
      sessionId: generateSessionId(),
      visitCount: incrementVisitCount()
    };
    localStorage.setItem('gclid_data', JSON.stringify(metadata));
  }
};

// Get stored GCLID data
export const getGclidData = () => {
  try {
    const data = localStorage.getItem('gclid_data');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error reading GCLID data:', error);
    return null;
  }
};

// Enhanced Google Ads user validation
export const isGoogleAdsUser = (): boolean => {
  try {
    const gclidData = getGclidData();
    if (!gclidData?.gclid || !gclidData?.timestamp) return false;

    // Validate within 24-hour window
    const hoursDiff = (Date.now() - gclidData.timestamp) / (1000 * 60 * 60);
    return hoursDiff < 24;
  } catch (error) {
    console.error('Error validating Google Ads user:', error);
    return false;
  }
};

// Clear GCLID data
export const clearGclid = () => {
  localStorage.removeItem('gclid_data');
};

// Enhanced GCLID tracking hook
export const useGclidTracking = () => {
  useEffect(() => {
    initGTM();
    initGoogleAds();
    storeGclid();
    
    // Track initial page view with enhanced data
    const gclidData = getGclidData();
    trackEvent('page_view', {
      page_title: document.title,
      page_location: window.location.href,
      page_path: window.location.pathname,
      gclid: gclidData?.gclid,
      session_id: gclidData?.sessionId,
      visit_count: gclidData?.visitCount
    });
  }, []);
};

// Utility functions
const generateSessionId = () => {
  return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const incrementVisitCount = (): number => {
  const count = parseInt(localStorage.getItem('visit_count') || '0');
  const newCount = count + 1;
  localStorage.setItem('visit_count', newCount.toString());
  return newCount;
};

// Track registration steps with enhanced data
export const trackRegistrationStep = (step: number, success: boolean = true) => {
  const gclidData = getGclidData();
  trackEvent('registration_step', {
    step_number: step,
    success,
    has_gclid: !!gclidData?.gclid,
    time_since_click: gclidData ? Date.now() - gclidData.timestamp : null,
    session_id: gclidData?.sessionId,
    visit_count: gclidData?.visitCount
  });
};

// Track registration completion with enhanced attribution
export const trackRegistrationComplete = (userId: string) => {
  const gclidData = getGclidData();
  trackEvent('registration_complete', {
    user_id: userId,
    from_google_ads: !!gclidData?.gclid,
    registration_time: new Date().toISOString(),
    time_to_convert: gclidData ? Date.now() - gclidData.timestamp : null,
    landing_page: gclidData?.landingPage,
    session_id: gclidData?.sessionId,
    visit_count: gclidData?.visitCount
  });

  // If from Google Ads, track conversion
  if (gclidData?.gclid) {
    trackGoogleAdsConversion();
  }
};
