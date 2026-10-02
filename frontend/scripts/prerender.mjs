// Writes a finished HTML file for every URL in dist/sitemap.xml (so the
// sitemap and the pre-rendered pages can never disagree). Anything else
// (e.g. a case study added after this build) is served dist/spa.html and
// rendered in the browser exactly as before.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

const dist = path.resolve(here, '../dist');
const ssrDir = path.resolve(here, '../dist-ssr');
const { render } = await import(new URL('../dist-ssr/entry-server.js', import.meta.url));

const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
fs.writeFileSync(path.join(dist, 'spa.html'), template);

// Site-wide defaults in index.html that each page replaces with its own.
const PAGE_TAGS = /\n\s*<(title>[^<]*<\/title|meta (name|property)="(description|og:title|og:description|og:url|og:image|twitter:title|twitter:description|twitter:image)"[^>]*|link rel="canonical"[^>]*)>/g;
const base = template.replace(PAGE_TAGS, '');

const sitemap = fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8');
const urls = [...sitemap.matchAll(/<loc>https?:\/\/[^/<]+(\/[^<]*)<\/loc>/g)].map((m) => m[1]);
if (!urls.length) throw new Error('prerender: no URLs found in sitemap.xml');

for (const url of urls) {
  const { html, head, data } = await render(url);
  const page = base
    .replace('</head>', `  ${head}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${html}</div>\n    <script id="ssr-data" type="application/json">${data}</script>`);
  const file = path.join(dist, url, 'index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, page);
}

fs.rmSync(ssrDir, { recursive: true, force: true });
console.log(`prerender: ${urls.length} pages → ${urls.join(' ')}`);
