// CMS values (links, images, iframes) come from the database. Only allow
// schemes that can't execute script — never javascript:, data:, vbscript: etc.
export function safeHref(url: string | null | undefined, fallback = '#'): string {
  if (!url) return fallback;
  const u = url.trim();
  return /^(https?:\/\/|mailto:|\/(?!\/)|#)/i.test(u) ? u : fallback;
}

const SPLINE_HOSTS = /^https:\/\/(my|prod)\.spline\.design\//;
export function safeSplineUrl(url: string, fallback: string): string {
  return SPLINE_HOSTS.test(url.trim()) ? url.trim() : fallback;
}
