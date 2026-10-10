import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { Breadcrumbs, useCrumbs } from './Breadcrumbs';
import { StickyMobileCta } from './StickyMobileCta';
import { ChatWidget } from './ChatWidget';
import { ChatBoundary } from './ChatBoundary';
import { SiteSchema } from './SiteSchema';
import { CustomCursor } from './interactions/CustomCursor';
import { trackPageView } from '@/lib/analytics';

export function Layout() {
  const { pathname } = useLocation();
  const hasCrumbs = Boolean(useCrumbs());

  useEffect(() => {
    window.scrollTo(0, 0);
    // Runs after the page's own effects, so document.title is already the new page's.
    trackPageView();
  }, [pathname]);

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:bg-white focus:text-black focus:px-4 focus:py-2 focus:rounded-full">
        Skip to content
      </a>
      <CustomCursor />
      <SiteSchema />
      <Navbar />
      <Breadcrumbs />
      {/* Inner pages sit under the breadcrumb bar, so their first section needs less top padding. */}
      <main id="main" className={hasCrumbs ? '[&>section:first-of-type]:pt-12' : ''}>
        <Outlet />
      </main>
      <Footer />
      <StickyMobileCta />
      <ChatBoundary>
        <ChatWidget />
      </ChatBoundary>
    </div>
  );
}
