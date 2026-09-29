import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

const STATIC_ROUTES = ['/', '/work', '/services', '/about', '/resume', '/contact', '/feedback'];
const FALLBACK_SLUGS = ['luminary', 'noir-studio', 'velvet', 'forma'];

/**
 * One place that knows the public site URL:
 *  - fills __SITE_URL__ in index.html (canonical, Open Graph, Twitter tags)
 *  - generates robots.txt and sitemap.xml at build time, including a
 *    /work/<slug> entry for every project in Supabase
 */
function seoFiles(env: Record<string, string>): Plugin {
  const site = (env.VITE_SITE_URL || 'https://website-ten-dun-87.vercel.app').replace(/\/$/, '');
  const supabaseKey = env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY;

  return {
    name: 'seo-files',
    transformIndexHtml: (html) => html.replaceAll('__SITE_URL__', site),
    async generateBundle() {
      let slugs = FALLBACK_SLUGS;
      if (env.VITE_SUPABASE_URL && supabaseKey) {
        try {
          const res = await fetch(`${env.VITE_SUPABASE_URL}/rest/v1/projects?select=slug`, {
            headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
          });
          const rows = (await res.json()) as { slug: string }[];
          if (res.ok && Array.isArray(rows) && rows.length) slugs = rows.map((r) => r.slug);
        } catch {
          // Build must never fail because the database is unreachable.
        }
      }

      const urls = [...STATIC_ROUTES, ...slugs.map((s) => `/work/${s}`)];
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source:
          '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
          urls.map((u) => `  <url><loc>${site}${u === '/' ? '/' : u}</loc></url>`).join('\n') +
          '\n</urlset>\n',
      });
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `User-agent: *\nAllow: /\nDisallow: /admin-panel/\nDisallow: /thank-you\n\nSitemap: ${site}/sitemap.xml\n`,
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  return {
    plugins: [react(), tailwindcss(), seoFiles(env)],
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  };
});
