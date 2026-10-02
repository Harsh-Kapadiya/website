import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ssr, type Tag } from '@/lib/ssr';

const SITE_NAME = 'Harsh Kapadiya';
// Always set at build time by vite.config.ts (VITE_SITE_URL, else Vercel's production URL).
export const SITE_URL = (import.meta.env.VITE_SITE_URL as string).replace(/\/$/, '');
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;

/** Finds <tag attr=value ...> in <head> (creating it if missing) and sets one attribute. */
function upsert([tag, match, attr, value]: Tag) {
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
 * page. The build pre-renders them into each page's HTML (for link previews
 * and crawlers that don't run JavaScript); the browser keeps them in sync
 * as visitors navigate.
 */
export function usePageMeta({ title, description, image, noindex = false }: { title: string; description: string; image?: string; noindex?: boolean }) {
  const { pathname } = useLocation();
  const fullTitle = title ? `${title} — ${SITE_NAME}` : `${SITE_NAME} — Designer & Developer`;
  const url = `${SITE_URL}${pathname === '/' ? '/' : pathname.replace(/\/$/, '')}`;
  const img = image || DEFAULT_IMAGE;
  const tags: Tag[] = [
    ['meta', { name: 'description' }, 'content', description],
    ['meta', { name: 'robots' }, 'content', noindex ? 'noindex, follow' : 'index, follow'],
    ['link', { rel: 'canonical' }, 'href', url],
    ['meta', { property: 'og:title' }, 'content', fullTitle],
    ['meta', { property: 'og:description' }, 'content', description],
    ['meta', { property: 'og:url' }, 'content', url],
    ['meta', { property: 'og:image' }, 'content', img],
    ['meta', { name: 'twitter:title' }, 'content', fullTitle],
    ['meta', { name: 'twitter:description' }, 'content', description],
    ['meta', { name: 'twitter:image' }, 'content', img],
  ];
  if (ssr.active) ssr.meta = { title: fullTitle, tags };

  useEffect(() => {
    document.title = fullTitle;
    tags.forEach(upsert);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullTitle, description, url, img, noindex]);
}
