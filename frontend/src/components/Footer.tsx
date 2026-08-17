import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useTable } from '@/hooks/useTable';

type SocialLink = { id: string; platform: string; url: string };

const fallbackSocials: SocialLink[] = [
  { id: '1', platform: 'Twitter', url: '#' },
  { id: '2', platform: 'LinkedIn', url: '#' },
  { id: '3', platform: 'Dribbble', url: '#' },
];

export function Footer() {
  const year = new Date().getFullYear();
  const { data: socials } = useTable<SocialLink>('social_links', fallbackSocials);

  return (
    <footer className="bg-[#0a0a0a] px-8 md:px-12 py-10 border-t border-white/5">
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <Link
          to="/"
          data-cursor="hover"
          className="text-white"
          style={{ fontSize: '1.1rem', fontWeight: 600, letterSpacing: '-0.02em' }}
        >
          HK.
        </Link>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-white/25"
          style={{ fontSize: '0.8125rem' }}
        >
          © {year} Harsh Kapadiya. All rights reserved. ·{' '}
          <Link to="/feedback" className="hover:text-white/60 transition-colors underline underline-offset-4">
            Leave feedback
          </Link>
        </motion.p>

        <div className="flex items-center gap-8">
          {socials.map((s) => (
            <a
              key={s.id}
              href={s.url}
              data-cursor="hover"
              className="text-white/25 hover:text-white/70 transition-colors duration-300"
              style={{ fontSize: '0.8125rem' }}
            >
              {s.platform}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
