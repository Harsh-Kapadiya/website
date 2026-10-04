// CMS values (links, images, iframes) come from the database. Only allow
// schemes that can't execute script — never javascript:, data:, vbscript: etc.
export function safeHref(url: string | null | undefined, fallback = '#'): string {
  if (!url) return fallback;
  const u = url.trim();
  return /^(https?:\/\/|mailto:|\/(?!\/)|#)/i.test(u) ? u : fallback;
}

// Images from the CMS. A Google Drive share link opens Drive's viewer page, not the picture,
// so it becomes Google's direct image address (the file must be shared "Anyone with the link").
// Anything that isn't an https:// or site-relative URL (e.g. the admin's "https://" placeholder) → ''.
const DRIVE_FILE_ID = /^https:\/\/drive\.google\.com\/(?:file\/d\/|(?:open|uc)\?(?:[^#]*&)?id=)([\w-]{20,})/;
export function imageUrl(url: string | null | undefined): string {
  const u = (url ?? '').trim();
  const id = DRIVE_FILE_ID.exec(u)?.[1];
  if (id) return `https://lh3.googleusercontent.com/d/${id}=w1920`;
  return /^(https:\/\/[^/\s]+\.[^/\s]+\/?|\/(?!\/))/i.test(u) ? u : '';
}

const SPLINE_HOSTS = /^https:\/\/(my|prod)\.spline\.design\//;
export function safeSplineUrl(url: string, fallback: string): string {
  return SPLINE_HOSTS.test(url.trim()) ? url.trim() : fallback;
}
