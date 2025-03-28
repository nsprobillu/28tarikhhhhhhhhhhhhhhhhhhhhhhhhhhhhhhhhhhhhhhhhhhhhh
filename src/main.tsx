import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Initialize Microsoft Clarity
declare global {
  interface Window {
    clarity: any;
  }
}

// Microsoft Clarity Setup - Modified to prevent multiple initializations
const initClarity = () => {
  // Only initialize if not already loaded
  if (!window.clarity) {
    (function(c, l, a, r, i, t, y) {
      c[a] = c[a] || function() { (c[a].q = c[a].q || []).push(arguments) };
      t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i + "?ref=bw";
      y = l.getElementsByTagName(r)[0]; y.parentNode?.insertBefore(t, y);
    })(window, document, "clarity", "script", "pvycryhg8n");
  }
};

// Initialize Clarity once when the app starts
initClarity();

// Google Analytics (GA4) Setup
(function(w, d, s, l, i) {
  w[l] = w[l] || [];
  w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
  var f = d.getElementsByTagName(s)[0], j = d.createElement(s), dl = l != 'dataLayer' ? '&l=' + l : '';
  j.async = true;
  j.src = 'https://www.googletagmanager.com/gtag/js?id=' + i;
  f.parentNode?.insertBefore(j, f);
})(window, document, 'script', 'dataLayer', 'G-57X37HCMGW');

window.dataLayer = window.dataLayer || [];
function gtag() { window.dataLayer.push(arguments); }
gtag('js', new Date());
gtag('config', 'G-57X37HCMGW');

// Google Tag Manager Setup
(function(w, d, s, l, i){
  w[l] = w[l] || [];
  w[l].push({'gtm.start': new Date().getTime(), event:'gtm.js'});
  var f = d.getElementsByTagName(s)[0],
  j = d.createElement(s), dl = l != 'dataLayer' ? '&l=' + l : '';
  j.async = true;
  j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
  f.parentNode.insertBefore(j, f);
})(window, document, 'script', 'dataLayer', 'GTM-KLS9CDDD');

// Create root and render
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Google Tag Manager (noscript) */}
    <noscript>
      <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KLS9CDDD"
              height="0" width="0" style={{ display: 'none', visibility: 'hidden' }}>
      </iframe>
    </noscript>
    {/* End Google Tag Manager (noscript) */}
    <App />
  </StrictMode>
);