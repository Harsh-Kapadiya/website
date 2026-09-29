import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { useContentBlocks } from '@/hooks/useContentBlocks';
import { trackEvent } from '@/lib/analytics';

const HIDDEN_ON = ['/contact', '/thank-you'];

/** Mobile-only "Hire me" bar that appears once the hero CTA scrolls away. */
export function StickyMobileCta() {
  const [visible, setVisible] = useState(false);
  const { pathname } = useLocation();
  const { get } = useContentBlocks('home');

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const show = visible && !HIDDEN_ON.includes(pathname);
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="md:hidden fixed bottom-0 inset-x-0 z-40 px-4 pb-4 pt-8 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/95 to-transparent"
        >
          <Link
            to="/contact"
            onClick={() => trackEvent('cta_click', { location: 'sticky_mobile' })}
            className="flex items-center justify-center gap-2 w-full py-4 rounded-full bg-white text-[#0a0a0a] text-[0.9375rem] font-medium"
          >
            {get('hero', 'cta_secondary', 'Hire me')} <ArrowUpRight size={16} aria-hidden />
          </Link>
          <p className="text-center text-white/50 text-xs mt-2">{get('contact', 'response_time', 'I reply within 24 hours')}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
