import { useEffect } from 'react';

/** Injects one schema.org JSON-LD block into <head>, replaced when data changes. */
export function useJsonLd(id: string, data: object | null) {
  const json = data ? JSON.stringify(data) : '';
  useEffect(() => {
    if (!json) return;
    const el = document.createElement('script');
    el.type = 'application/ld+json';
    el.id = `jsonld-${id}`;
    el.text = json; // .text, not innerHTML — never parsed as HTML
    document.getElementById(el.id)?.remove();
    document.head.appendChild(el);
    return () => el.remove();
  }, [id, json]);
}
