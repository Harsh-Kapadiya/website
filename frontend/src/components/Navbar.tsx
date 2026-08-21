import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, NavLink as RouterNavLink } from 'react-router-dom';
import { Magnetic } from './interactions/Magnetic';
import { useTable } from '@/hooks/useTable';
import { useContentBlocks } from '@/hooks/useContentBlocks';

type NavLink = { id: string; label: string; path: string };

const fallbackLinks: NavLink[] = [
  { id: '1', label: 'Work', path: '/work' },
  { id: '2', label: 'Services', path: '/services' },
  { id: '3', label: 'About', path: '/about' },
  { id: '4', label: 'Resume', path: '/resume' },
  { id: '5', label: 'Contact', path: '/contact' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: links } = useTable<NavLink>('nav_links', fallbackLinks);
  const { get } = useContentBlocks('global');
  const logoText = get('brand', 'logo_text', 'HK.');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5' : ''
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-8 md:px-12 flex items-center justify-between h-20">
          <Link
            to="/"
            data-cursor="hover"
            className="text-white tracking-tight"
            style={{ fontSize: '1.1rem', fontWeight: 600, letterSpacing: '-0.02em' }}
          >
            {logoText}
          </Link>

          <div className="hidden md:flex items-center gap-10">
            {links.map((link) => (
              <RouterNavLink
                key={link.id}
                to={link.path}
                data-cursor="hover"
                className={({ isActive }) =>
                  `relative group/nav transition-colors duration-300 ${
                    isActive ? 'text-white' : 'text-white/50 hover:text-white'
                  }`
                }
                style={{ fontSize: '0.875rem', fontWeight: 400 }}
              >
                {link.label}
                <span className="absolute left-0 -bottom-1.5 h-px w-full bg-white scale-x-0 origin-left transition-transform duration-300 ease-out group-hover/nav:scale-x-100" />
              </RouterNavLink>
            ))}
            <Magnetic strength={0.35}>
              <Link
                to="/contact"
                className="px-5 py-2.5 rounded-full bg-white text-[#0a0a0a] hover:bg-white/90 transition-colors duration-300 inline-block"
                style={{ fontSize: '0.875rem', fontWeight: 500 }}
              >
                Get in touch
              </Link>
            </Magnetic>
          </div>

          <button
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`block w-6 h-px bg-white transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-6 h-px bg-white transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-6 h-px bg-white transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
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
            className="fixed inset-0 z-40 bg-[#0a0a0a] flex flex-col items-center justify-center gap-10 md:hidden"
          >
            {links.map((link, i) => (
              <motion.div
                key={link.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                <Link
                  to={link.path}
                  className="text-white hover:text-white/60 transition-colors"
                  style={{ fontSize: '2rem', fontWeight: 500 }}
                  onClick={() => setMenuOpen(false)}
                >
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
