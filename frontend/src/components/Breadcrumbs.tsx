import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useJsonLd } from '@/hooks/useJsonLd';
import { SITE_URL } from '@/hooks/usePageMeta';

const LABELS: Record<string, string> = {
  work: 'Work', services: 'Services', about: 'About', resume: 'Resume',
  contact: 'Contact', feedback: 'Feedback', 'thank-you': 'Thank you',
};
const prettify = (slug: string) => slug.split('-').map((w) => w[0]?.toUpperCase() + w.slice(1)).join(' ');

/** Returns the trail for the current URL, or null on home / unknown (404) routes. */
export function useCrumbs() {
  const segments = useLocation().pathname.split('/').filter(Boolean);
  if (!segments.length || !LABELS[segments[0]]) return null;
  return [
    { label: 'Home', path: '/' },
    ...segments.map((s, i) => ({ label: i === 0 ? LABELS[s] : prettify(s), path: '/' + segments.slice(0, i + 1).join('/') })),
  ];
}

export function Breadcrumbs() {
  const crumbs = useCrumbs();

  // BreadcrumbList structured data → Google can show the trail in results.
  useJsonLd(
    'breadcrumbs',
    crumbs && {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.label, item: `${SITE_URL}${c.path}` })),
    }
  );

  if (!crumbs) return null;
  return (
    <nav aria-label="Breadcrumb" className="px-6 md:px-12 pt-28">
      <ol className="max-w-[1400px] mx-auto flex flex-wrap items-center gap-1.5 text-white/40 text-[0.8125rem]">
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <li key={c.path} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight size={13} className="text-white/20" aria-hidden />}
              {last ? (
                <span aria-current="page" className="text-white/70">{c.label}</span>
              ) : (
                <Link to={c.path} className="hover:text-white transition-colors">{c.label}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
