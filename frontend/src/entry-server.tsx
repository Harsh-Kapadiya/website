// Build-time pre-render: turns one URL into finished HTML (body, <head> tags,
// and the rows it used) so link previews and crawlers that don't run
// JavaScript see the real page. Run by scripts/prerender.mjs after `vite build`.
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import App from './App';
import { ssr } from './lib/ssr';

const attr = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const text = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// Inside <script>, "<" is the only character that can break out (e.g. "</script>").
const script = (json: string) => json.replace(/</g, '\\u003c');

export async function render(url: string) {
  ssr.active = true;
  let html = '';
  // Render, fetch whatever the page asked for, render again with the rows.
  // ponytail: 3 passes covers queries that depend on earlier ones; none do today.
  for (let pass = 0; pass < 3; pass++) {
    ssr.pending.clear();
    ssr.used.clear();
    ssr.jsonld.clear();
    ssr.meta = null;
    html = renderToString(
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    );
    if (!ssr.pending.size) break;
    // A failed query (database unreachable at build time) renders the page's
    // built-in defaults instead of failing the build.
    await Promise.all([...ssr.pending].map(async ([key, run]) => ssr.data.set(key, await run().catch(() => undefined))));
  }

  const head = [
    ...(ssr.meta ? [`<title>${text(ssr.meta.title)}</title>`] : []),
    ...(ssr.meta?.tags ?? []).map(([tag, match, key, value]) =>
      `<${tag} ${Object.entries(match).map(([k, v]) => `${k}="${attr(v)}"`).join(' ')} ${key}="${attr(value)}" />`
    ),
    ...[...ssr.jsonld].map(([id, json]) => `<script type="application/ld+json" id="jsonld-${attr(id)}">${script(json)}</script>`),
  ];
  const rows = Object.fromEntries([...ssr.used].filter((k) => ssr.data.get(k) !== undefined).map((k) => [k, ssr.data.get(k)]));
  return { html, head: head.join('\n    '), data: script(JSON.stringify(rows)) };
}
