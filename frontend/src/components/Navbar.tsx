import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import { Magnetic } from './interactions/Magnetic';
import { useTable } from '@/hooks/useTable';
import { useContentBlocks } from '@/hooks/useContentBlocks';
import { NAV_LINKS, type NavLink } from '@/lib/fallbacks';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const { data: links } = useTable<NavLink>('nav_links', NAV_LINKS);
  const { get } = useContentBlocks('global');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <>
      <motion.nav
        aria-label="Main"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled || menuOpen ? 'bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5' : ''}`}
      >
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex items-center justify-between h-20">
          <Link to="/" aria-label="Home" className="text-white text-[1.1rem] font-semibold tracking-[-0.02em]">
            {get('brand', 'logo_text', 'HK.')}
          </Link>

          <div className="hidden md:flex items-center gap-10">
            {links.map((link) => (
              <RouterNavLink
                key={link.id}
                to={link.path}
                className={({ isActive }) =>
                  `relative group/nav text-sm transition-colors duration-300 ${isActive ? 'text-white' : 'text-white/50 hover:text-white'}`
                }
              >
                {link.label}
                <span className="absolute left-0 -bottom-1.5 h-px w-full bg-white scale-x-0 origin-left transition-transform duration-300 ease-out group-hover/nav:scale-x-100" />
              </RouterNavLink>
            ))}
            <Magnetic strength={0.35}>
              <Link to="/contact" className="inline-block px-5 py-2.5 rounded-full bg-white text-[#0a0a0a] text-sm font-medium hover:bg-white/90 transition-colors">
                Get in touch
              </Link>
            </Magnetic>
          </div>

          <button className="md:hidden flex flex-col gap-1.5 p-3 -mr-3" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu" aria-expanded={menuOpen}>
            <span className={`block w-6 h-px bg-white transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
            <span className={`block w-6 h-px bg-white transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-6 h-px bg-white transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-[#0a0a0a] flex flex-col items-center justify-center gap-8 md:hidden"
          >
            {[...links, { id: 'feedback', label: 'Leave feedback', path: '/feedback' }].map((link, i) => (
              <motion.div key={link.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <Link to={link.path} className="text-white text-3xl font-medium hover:text-white/60 transition-colors">
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
