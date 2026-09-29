import { useContentBlocks } from '@/hooks/useContentBlocks';
import { useTable } from '@/hooks/useTable';
import { useJsonLd } from '@/hooks/useJsonLd';
import { SITE_URL } from '@/hooks/usePageMeta';
import { SOCIALS, type SocialLink } from '@/lib/fallbacks';

/** schema.org Person + local ProfessionalService + WebSite, built from live CMS content. */
export function SiteSchema() {
  const { get } = useContentBlocks('home');
  const { data: socials } = useTable<SocialLink>('social_links', SOCIALS);

  const name = get('about', 'name', 'Harsh Kapadiya');
  const email = get('contact', 'email', 'harsh2021800@gmail.com');
  const [locality, ...rest] = get('contact', 'location', 'Haryana, India').split(',').map((s) => s.trim());
  const sameAs = socials.map((s) => s.url).filter((u) => /^https?:\/\//.test(u));

  useJsonLd('site', {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `${SITE_URL}/#person`,
        name,
        jobTitle: 'Designer & Developer',
        url: SITE_URL,
        email: `mailto:${email}`,
        image: new URL(get('about', 'photo_url', '/img/harsh.jpg'), SITE_URL).href, // schema.org needs an absolute URL
        ...(sameAs.length ? { sameAs } : {}),
      },
      {
        '@type': 'ProfessionalService',
        '@id': `${SITE_URL}/#business`,
        name: `${name} — Design & Development`,
        url: SITE_URL,
        image: `${SITE_URL}/og-image.png`,
        email,
        founder: { '@id': `${SITE_URL}/#person` },
        address: { '@type': 'PostalAddress', addressLocality: locality, ...(rest.length ? { addressCountry: rest[rest.length - 1] } : {}) },
        areaServed: 'Worldwide',
      },
      { '@type': 'WebSite', '@id': `${SITE_URL}/#website`, url: SITE_URL, name, publisher: { '@id': `${SITE_URL}/#person` } },
    ],
  });
  return null;
}
