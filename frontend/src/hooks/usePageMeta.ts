import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_NAME = 'Harsh Kapadiya';
export const SITE_URL = ((import.meta.env.VITE_SITE_URL as string | undefined) || window.location.origin).replace(/\/$/, '');
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;

/** Finds <tag attr=value ...> in <head> (creating it if missing) and sets one attribute. */
function upsert(tag: 'meta' | 'link', match: Record<string, string>, attr: string, value: string) {
  const selector = tag + Object.entries(match).map(([k, v]) => `[${k}="${v}"]`).join('');
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement(tag);
    for (const [k, v] of Object.entries(match)) el.setAttribute(k, v);
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

/**
 * Unique <title>, meta description, canonical URL and social-share tags per
 * page. Googlebot runs JavaScript and sees these; link-preview bots that only
 * read raw HTML fall back to the site-wide defaults in index.html.
 */
export function usePageMeta({ title, description, image, noindex = false }: { title: string; description: string; image?: string; noindex?: boolean }) {
  const { pathname } = useLocation();

  useEffect(() => {
    const fullTitle = title ? `${title} — ${SITE_NAME}` : `${SITE_NAME} — Designer & Developer`;
    const url = `${SITE_URL}${pathname === '/' ? '/' : pathname.replace(/\/$/, '')}`;
    const img = image || DEFAULT_IMAGE;

    document.title = fullTitle;
    upsert('meta', { name: 'description' }, 'content', description);
    upsert('meta', { name: 'robots' }, 'content', noindex ? 'noindex, follow' : 'index, follow');
    upsert('link', { rel: 'canonical' }, 'href', url);
    upsert('meta', { property: 'og:title' }, 'content', fullTitle);
    upsert('meta', { property: 'og:description' }, 'content', description);
    upsert('meta', { property: 'og:url' }, 'content', url);
    upsert('meta', { property: 'og:image' }, 'content', img);
    upsert('meta', { name: 'twitter:title' }, 'content', fullTitle);
    upsert('meta', { name: 'twitter:description' }, 'content', description);
    upsert('meta', { name: 'twitter:image' }, 'content', img);
  }, [title, description, image, noindex, pathname]);
}
