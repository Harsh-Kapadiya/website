import { Link } from 'react-router-dom';
import { useTable } from '@/hooks/useTable';
import { useContentBlocks } from '@/hooks/useContentBlocks';
import { NAV_LINKS, SOCIALS, type NavLink, type SocialLink } from '@/lib/fallbacks';
import { safeHref } from '@/lib/safeUrl';

export function Footer() {
  const { data: socials } = useTable<SocialLink>('social_links', SOCIALS);
  const { data: links } = useTable<NavLink>('nav_links', NAV_LINKS);
  const { get } = useContentBlocks('global');

  return (
    // Extra bottom padding on mobile so the sticky CTA never covers the footer.
    <footer className="bg-[#0a0a0a] px-6 md:px-12 pt-12 pb-32 md:pb-10 border-t border-white/5">
      <div className="max-w-[1400px] mx-auto">
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-3 mb-8 pb-8 border-b border-white/5">
          <Link to="/" className="text-white/40 hover:text-white text-[0.8125rem] transition-colors">Home</Link>
          {links.map((l) => (
            <Link key={l.id} to={l.path} className="text-white/40 hover:text-white text-[0.8125rem] transition-colors">
              {l.label}
            </Link>
          ))}
          <Link to="/feedback" className="text-white/40 hover:text-white text-[0.8125rem] transition-colors">Leave feedback</Link>
        </nav>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <Link to="/" aria-label="Home" className="text-white text-[1.1rem] font-semibold tracking-[-0.02em]">
            {get('brand', 'logo_text', 'HK.')}
          </Link>
          <p className="text-white/40 text-[0.8125rem]">
            © {new Date().getFullYear()} {get('brand', 'copyright_name', 'Harsh Kapadiya')}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {socials.map((s) => (
              <a key={s.id} href={safeHref(s.url)} target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white text-[0.8125rem] transition-colors">
                {s.platform}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
