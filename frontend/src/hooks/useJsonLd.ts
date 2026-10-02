import { useEffect } from 'react';
import { ssr } from '@/lib/ssr';

/** Injects one schema.org JSON-LD block into <head>, replaced when data changes. */
export function useJsonLd(id: string, data: object | null) {
  const json = data ? JSON.stringify(data) : '';
  if (ssr.active && json) ssr.jsonld.set(id, json);
  useEffect(() => {
    if (!json) return;
    const el = document.createElement('script');
    el.type = 'application/ld+json';
    el.id = `jsonld-${id}`;
    el.text = json; // .text, not innerHTML — never parsed as HTML
    document.getElementById(el.id)?.remove(); // also replaces the pre-rendered copy
    document.head.appendChild(el);
    return () => el.remove();
  }, [id, json]);
}
