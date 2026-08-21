import { motion } from 'motion/react';
import { ArrowDownRight, Code2, Terminal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useContentBlocks } from '@/hooks/useContentBlocks';
import { useTable } from '@/hooks/useTable';
import { Magnetic } from './interactions/Magnetic';

type TechItem = { id: string; label: string };
const fallbackTech: TechItem[] = [
  { id: '1', label: 'React' },
  { id: '2', label: 'TypeScript' },
  { id: '3', label: 'Next.js' },
  { id: '4', label: 'Node.js' },
  { id: '5', label: 'Tailwind' },
];

export function Hero() {
  const { get } = useContentBlocks('home');
  const { data: tech } = useTable<TechItem>('tech_stack', fallbackTech);
  const splineUrl = get('hero', 'spline_url', 'https://my.spline.design/boxeshover-1zjS3MSNd4kulP7aZNJbuZkL/');

  return (
    <section className="relative min-h-screen bg-[#0a0a0a] flex flex-col justify-end overflow-hidden px-8 md:px-12 pb-20 pt-32">
      {/* 3D scene — Spline, editable from admin panel (Page copy → home / hero → spline_url) */}
      <div className="absolute inset-0 w-full h-full">
        <iframe
          src={splineUrl}
          frameBorder="0"
          width="100%"
          height="100%"
          title="Interactive 3D scene"
          loading="lazy"
          style={{ display: 'block', opacity: 0.9 }}
        />
      </div>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, #0a0a0a 30%, rgba(10,10,10,0.55) 65%, rgba(10,10,10,0.1) 100%)',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(to right, rgba(10,10,10,0.75) 0%, transparent 60%)' }}
      />

      <div className="relative z-10 max-w-[1400px] w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex items-center gap-3 mb-12"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-white/40" style={{ fontSize: '0.8125rem' }}>
            {get('hero', 'badge_text', 'Available for freelance & full-time roles')}
          </span>
          <span
            className="hidden md:flex items-center gap-1.5 ml-4 px-3 py-1 rounded-full border border-white/10 text-white/30"
            style={{ fontSize: '0.75rem' }}
          >
            <Terminal size={11} />
            {get('hero', 'badge_pill', 'Open to remote')}
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="text-white leading-[0.92] tracking-tight mb-10"
          style={{ fontSize: 'clamp(3.2rem, 9vw, 9rem)', fontWeight: 500, letterSpacing: '-0.04em' }}
        >
          Building fast,
          <br />
          <span className="text-white/25 italic" style={{ fontWeight: 300 }}>
            beautiful
          </span>{' '}
          apps
          <br />
          for the web.
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8"
        >
          <div className="space-y-5">
            <p className="text-white/40 max-w-sm leading-relaxed" style={{ fontSize: '0.9375rem' }}>
              {get(
                'hero',
                'bio',
                'Full-stack web developer specializing in React, TypeScript & Node.js. I turn complex problems into clean, performant products.'
              )}
            </p>
            <div className="flex flex-wrap gap-2">
              {tech.map((item) => (
                <span
                  key={item.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 text-white/35"
                  style={{ fontSize: '0.75rem' }}
                >
                  <Code2 size={10} />
                  {item.label}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <Link
              to="/work"
              data-cursor="hover"
              className="group flex items-center gap-2 text-white hover:text-white/60 transition-colors duration-300"
              style={{ fontSize: '0.9375rem' }}
            >
              {get('hero', 'cta_primary', 'View my work')}
              <ArrowDownRight size={16} className="group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform duration-300" />
            </Link>
            <Magnetic strength={0.4}>
              <Link
                to="/contact"
                className="px-6 py-3 rounded-full bg-white text-[#0a0a0a] hover:bg-white/85 transition-colors duration-300 inline-block"
                style={{ fontSize: '0.875rem', fontWeight: 500 }}
              >
                {get('hero', 'cta_secondary', 'Hire me')}
              </Link>
            </Magnetic>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-10 right-12 flex-col items-center gap-2 hidden md:flex z-10"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          className="w-px h-12 bg-gradient-to-b from-transparent to-white/30"
        />
        <span className="text-white/25 rotate-90 origin-center" style={{ fontSize: '0.625rem', letterSpacing: '0.15em' }}>
          SCROLL
        </span>
      </motion.div>
    </section>
  );
}
