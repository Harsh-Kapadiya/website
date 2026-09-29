const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

/** Loads GA4 once. No-op when VITE_GA_MEASUREMENT_ID isn't set. */
export function initAnalytics() {
  if (!GA_ID) return;
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
  document.head.appendChild(script);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // gtag.js expects the real `arguments` object, not an array.
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  // Page views are sent manually on every route change (this is an SPA).
  window.gtag('config', GA_ID, { send_page_view: false });
}

export function trackPageView() {
  if (!GA_ID || !window.gtag) return;
  window.gtag('event', 'page_view', {
    page_path: location.pathname + location.search,
    page_title: document.title,
    page_location: location.href,
  });
}

export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (!GA_ID || !window.gtag) return;
  window.gtag('event', name, params);
}
