# Harsh Kapadiya — Portfolio

A full-stack personal portfolio: a dark, motion-heavy React site, an Express
API that stores contact/review submissions and emails you about them, a
Supabase (Postgres) database, and a standalone admin panel at `/admin-panel`
that edits every piece of site content without touching code.

**Live:** <https://harsh-kapadiya.vercel.app> · admin at `/admin-panel`

| Piece | Stack | Hosted on |
|---|---|---|
| `frontend/` — public site | React 18, TypeScript, Vite 6, Tailwind v4, `motion`, React Router | Vercel |
| `admin-panel/` — content editor | Same stack, separate app, served at `/admin-panel` | Vercel (same project) |
| `backend/` — form API | Node 22, Express 5, Helmet; email via Resend API (Nodemailer SMTP locally) | Render |
| `supabase/schema.sql` — database | Postgres + Row Level Security + Supabase Auth | Supabase |

---

## Contents

1. [Architecture](#architecture)
2. [Repository layout](#repository-layout)
3. [Features](#features)
4. [Performance on phones](#performance-on-phones)
5. [SEO & conversion checklist — where each item lives](#seo--conversion-checklist)
6. [Security hardening (audit remediation)](#security-hardening)
7. [Environment variables](#environment-variables)
8. [Run it locally](#run-it-locally)
9. [Deploy: Supabase → Render → Vercel](#deploy)
10. [Register the site on Google Search Console](#google-search-console)
11. [Google sign-in for the admin panel](#google-sign-in)
12. [Using the admin panel](#using-the-admin-panel)
13. [Tests](#tests)
14. [Troubleshooting](#troubleshooting)
15. [Known limits & next steps](#known-limits--next-steps)

---

## Architecture

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/architecture-dark.png">
  <img alt="Architecture: visitors load the pre-rendered site from Vercel, which reads content from Supabase; contact and review forms POST to the Express API on Render, which inserts rows with the secret key and emails the owner through Resend; the owner signs in to the admin panel on Vercel and edits content in Supabase under admin-only row-level security; on every deploy the Vercel build reads Supabase and writes one HTML file per sitemap URL." src="docs/architecture-light.png">
</picture>

**Interactive version:** download and open [`docs/architecture.html`](docs/architecture.html)
in a browser — hover a box to trace its connections; every box links to the
source lines it describes. It was generated with Archify from
[`docs/architecture.archify.json`](docs/architecture.archify.json); edit that file
and re-render when the architecture changes.

- **Frontend and admin panel talk to Supabase directly** with the public
  *publishable* key. That's safe because Row Level Security decides what each
  request may do: anyone can read site content; only users listed in the
  `admins` table can change it.
- **The backend exists for exactly two jobs** that must not happen in a
  browser: inserting contact messages and reviews with the *secret* key, and
  emailing you when they arrive.
- **The admin panel is its own app** (own `package.json`, own auth session),
  built with `base: '/admin-panel/'` and copied into the frontend's build
  output at deploy time — one Vercel project, one domain, two apps.
- **Every page is pre-rendered on deploy.** The Vercel build renders each URL
  in `sitemap.xml` to real HTML with live Supabase rows, so link previews and
  AI crawlers (which don't run JavaScript) see each page's own title, image and
  text. In the browser the React app takes over and refreshes the data live.

---

## Repository layout

```
WEBSITE/
├── vercel.json               Vercel build + routing + security headers (repo root!)
├── docs/                     Architecture diagram (PNG light/dark, interactive HTML, Archify source)
├── supabase/
│   └── schema.sql            Tables, RLS, constraints, seed data. Safe to re-run.
├── backend/
│   ├── src/index.js          Config checks, CORS, rate limits, routes, health
│   ├── src/validate.js       Strict input validation for both forms
│   ├── src/mailer.js         Plain-text notification emails (Resend API, SMTP fallback)
│   └── test/                 node:test suites — validation + mailer (npm test)
├── frontend/
│   ├── index.html            Default meta, Open Graph, Twitter tags
│   ├── vite.config.ts        Generates robots.txt + sitemap.xml at build
│   ├── scripts/prerender.mjs Writes one HTML file per sitemap URL after the build
│   ├── public/               og-image.png (1200×630), favicon.svg, img/hero-poster.webp
│   └── src/
│       ├── entry-server.tsx  Build-time renderer used by prerender.mjs
│       ├── pages/            One per route (Home, Work, CaseStudy, Services,
│       │                     About, Resume, Contact, Feedback, ThankYou, NotFound)
│       ├── components/       Sections + Navbar, Footer, Breadcrumbs, SiteSchema,
│       │                     StickyMobileCta, ResponseTime, Honeypot, interactions/
│       ├── hooks/            useContentBlocks, useTable, usePageMeta, useJsonLd
│       └── lib/              supabaseClient (read-only query client), api,
│                             analytics, safeUrl, fallbacks, ssr (pre-render state)
└── admin-panel/
    └── src/
        ├── hooks/useAdminAuth.ts    Shared auth state (password + Google)
        ├── pages/                   LoginPage, DashboardPage (all tabs)
        └── components/              TableEditor, ContentBlocksEditor,
                                     FeedbackModeration, ContactInbox, ResumeFileEditor
```

### Routes

| Path | Page | Indexed |
|---|---|---|
| `/` | Hero, featured work, services, reviews, skills, CTA | ✅ |
| `/work` | All projects | ✅ |
| `/work/:slug` | Case study for one project | ✅ (every slug is in the sitemap) |
| `/services` | Services + skills | ✅ |
| `/about` | Bio, stats, clients, reviews | ✅ |
| `/resume` | Timeline + PDF download | ✅ |
| `/contact` | Contact form | ✅ |
| `/feedback` | Leave a review | ✅ |
| `/thank-you` | Shown after either form | ❌ `noindex` |
| anything else | Custom 404 | ❌ `noindex` |
| `/admin-panel/*` | Admin app | ❌ blocked in robots.txt + `noindex` |

---

## Features

**Design & interaction** — Spline 3D hero on desktop with a still poster on
phones (both editable), magnetic buttons,
3D tilt cards with cursor glare, trailing custom cursor (desktop only),
cursor-spotlight service rows, right-to-left review marquee that pauses on
hover, glow-on-hover skills grid. All motion respects `prefers-reduced-motion`.

**Everything editable** — nav links, brand name, all copy, hero 3D scene,
projects + case studies, services, skills, tech pills, stats, clients,
social links, resume entries and PDF, response-time promise. Only section
headings live in code. With Supabase unconfigured the site falls back to
built-in starter content so it never renders blank.

**Forms** — contact and review forms post to the backend, which validates,
stores, and emails you. Both redirect to `/thank-you` and fire a Google
Analytics conversion event.

---

## Performance on phones

| What a phone downloads | Before | Now |
|---|---|---|
| Hero 3D scene (Spline) | ~2.2 MB of JavaScript in 58 requests + a WebGL loop running nonstop | a 19 KB still image (`img/hero-poster.webp`) |
| Site JavaScript | 598 KB (176 KB gzipped) | ~390 KB (~123 KB gzipped) |

- `Hero.tsx` loads the live 3D only on desktops (`min-width: 768px`, a mouse,
  no reduced-motion or data-saver), and only after the page has finished
  loading. Everyone else gets the poster. Change it in admin → *Page copy →
  hero → poster_url*; if you change the Spline scene, export a matching image.
- The public site only reads tables, so it ships Supabase's small query client
  (`@supabase/postgrest-js`) instead of the full `supabase-js` (auth, storage,
  realtime). The admin panel still uses `supabase-js` for sign-in.
- Below-the-fold images use `loading="lazy"`. Real-world numbers: Vercel →
  *Speed Insights* (already installed).

---

## SEO & conversion checklist

| # | Item | Where / how |
|---|---|---|
| 1 | Custom 404 page | `pages/NotFoundPage.tsx` — links to Home/Work/Services/Contact, `noindex`. Unknown case-study slugs render it too. |
| 2 | Call to action above the fold | `Hero.tsx` — "Hire me" + "View my work". On mobile the CTA row is moved directly under the headline (`order-first`) so it's visible without scrolling (verified at 390×844). |
| 3 | Internal links | Footer link row on every page; "View all work" / "See all services"; every service row links to Contact; About → Work + Resume; case-study prev/next; 404 and thank-you suggestions. |
| 4 | Thank-you page | `pages/ThankYouPage.tsx` — different copy for contact vs review; suggests next pages; `noindex`. |
| 5 | Breadcrumbs | `Breadcrumbs.tsx` — on every inner page, plus `BreadcrumbList` structured data. |
| 6 | Case studies | `pages/CaseStudyPage.tsx` at `/work/:slug` — overview / challenge / solution / results, gallery, live link, prev/next, `CreativeWork` schema. Filled in via admin → *Case studies*. |
| 7 | Response-time promise | `ResponseTime.tsx` — hero pill, contact details, under the submit button, CTA banners, sticky CTA, thank-you page. One setting: *Page copy → home / contact → response_time*. |
| 8 | Sticky mobile CTA | `StickyMobileCta.tsx` — appears after 500 px of scroll on phones, hidden on `/contact` and `/thank-you`; footer has extra bottom padding so it never covers content. |
| 9 | robots.txt | Generated at build by `vite.config.ts` — allows everything except `/admin-panel/` and `/thank-you`, points to the sitemap. |
| 10 | Unique page titles | `usePageMeta` per page, e.g. "Luminary — case study — Harsh Kapadiya". |
| 11 | Meta descriptions | Same hook — a unique, hand-written description per page; case studies use their overview. Also sets canonical URL and `robots`. |
| 12 | Social share images | `public/og-image.png` (1200×630) + Open Graph / Twitter tags; case studies use their cover image. Pre-rendered into each page's HTML, so WhatsApp/LinkedIn/X previews are per page. |
| 13 | Real reviews | `Testimonials.tsx` shows **only approved rows** from the `feedback` table — no placeholder quotes anywhere. With zero approved reviews the section doesn't render. Collect them via `/feedback`, approve in admin → *Reviews*. |
| 14 | Alt text on images | Descriptive alt on every image (projects, portrait, avatars, galleries); decorative icons are `aria-hidden`; the 3D iframe is marked decorative. Verified: zero images without alt on any page. |
| 15 | Local schema | `SiteSchema.tsx` — `Person` + `ProfessionalService` (with address from *home / contact → location*) + `WebSite`, built from live CMS content. |
| 16 | Google Analytics | `lib/analytics.ts` — GA4 loads only when `VITE_GA_MEASUREMENT_ID` is set; sends a `page_view` on every route change (SPA-aware) plus `generate_lead`, `submit_review` and `cta_click` events. |

Also: `sitemap.xml` generated at build (includes every case-study slug pulled
from Supabase), canonical URLs, exactly one `<h1>` per page, skip-to-content
link, visible focus rings, labelled form fields.

**Pre-rendering** (`scripts/prerender.mjs` + `src/entry-server.tsx`): after
`vite build`, every URL in the sitemap is rendered to `dist/<path>/index.html`
with its own `<title>`, description, canonical, Open Graph/Twitter tags,
JSON-LD and page text, plus the rows it used (so the first paint in the
browser already shows real content). Anything not in the sitemap (`/thank-you`,
a case study added after the last deploy, unknown URLs) is served
`dist/spa.html` and rendered in the browser as before. Check it on the live
site with `view-source:https://harsh-kapadiya.vercel.app/work/luminary`.

**Search Console verification:** set `VITE_GOOGLE_SITE_VERIFICATION` and every
page carries Google's verification tag — see
[Register the site on Google Search Console](#google-search-console).

---

## Security hardening

Findings from the September 2026 security audit that are fixed in this code:

| Audit ID | Fix |
|---|---|
| SEC-01 Outdated Nodemailer | Nodemailer **10.0.12**, Node ≥ 22, lockfiles committed; file/URL access disabled in the transport. Production email goes through Resend's HTTPS API (Render's free tier blocks SMTP). |
| SEC-02 Anonymous privileged writes | Routes write only fixed, whitelisted columns; strict validation; honeypot; per-IP **and** global rate limits; 16 KB body limit. |
| SEC-03 CORS fails open | Fails **closed**: in production the server refuses to start without `ALLOWED_ORIGINS`; unknown origins get no CORS headers. |
| SEC-04 Rate limiting | Separate per-route per-IP limits (5 / 15 min) + a global cap (100 / 15 min); `429` with `Retry-After`; `trust proxy` set for Render. |
| SEC-05 Raw DB errors to clients | Clients only see stable codes (`SUBMISSION_FAILED`, …) and a `requestId`; details go to structured server logs. |
| SEC-06 Permissive validation | `validate.js`: unknown fields rejected, exact max lengths, trimming, NFC normalization, control-character handling. |
| SEC-07 replyTo reaches mail parser | Emails must pass the WHATWG `<input type=email>` rule before Nodemailer sees them (no quotes, comments, CR/LF, address literals); plain-text emails only. |
| AUTH-01 SECURITY DEFINER | `is_admin()` pins `search_path = ''`, is schema-qualified, and is executable by `authenticated` only. |
| AUTH-02 DB-enforced authorization | Every write policy is `to authenticated` + `is_admin()`. Tested: anon and signed-in non-admins are rejected on every table. |
| DB-01 Seeds not idempotent | Natural unique keys on every seeded table → `ON CONFLICT` actually works. Verified by running the schema twice: identical row counts. Never overwrites admin edits. |
| DB-02 `updated_at` stale | Trigger keeps it current. |
| DB-04 API access on new projects | Supabase stopped exposing new tables to the API by default (new projects from 30 May 2026, existing ones from 30 Oct 2026), so `schema.sql` grants read access to `anon` (public tables only) and full access to `authenticated` / `service_role`; RLS still decides which rows. Tested: anon can't see the inbox or unapproved reviews. |
| DB-03 Weak constraints | CHECK constraints for enums, lengths, slugs and URL schemes (blocks `javascript:` links). |
| OPS-01 Health lies | `/api/health` = liveness; `/api/ready` returns **503** if the database is unreachable. |
| OPS-02 Missing secrets | Startup fails in production if Supabase config or origins are missing. |
| OPS-04 Proxy IPs | `app.set('trust proxy', 1)` for Render (override with `TRUST_PROXY_HOPS`). |
| HTTP-01 Headers | Helmet on the API; `nosniff`, `Referrer-Policy`, `X-Frame-Options: DENY`, `Permissions-Policy` on the site via `vercel.json`. |
| ARCH-02 Root manifest | The stray root `package.json` is gone. |
| SUP-01 Key naming | Accepts Supabase's new names (`SUPABASE_SECRET_KEY`, publishable key) and the legacy ones. |
| XSS-01 Dangerous URL sinks | Every CMS link goes through `safeHref` (http(s)/mailto/relative only); the 3D iframe only accepts `spline.design` URLs; no `dangerouslySetInnerHTML`. |

Deliberately **not** done yet (see [next steps](#known-limits--next-steps)):
Redis-backed rate limiting (single Render instance doesn't need it), an email
retry queue (every submission is also in the admin inbox), CAPTCHA, and a CSP
header.

---

## Environment variables

Each app has its **own** `.env` (copy its `.env.example`). Deployment
platforms never read your local `.env` — set the same values in the Render
and Vercel dashboards.

### `backend/.env` → Render → Environment

| Key | Required | Value |
|---|---|---|
| `SUPABASE_URL` | ✅ | Supabase → Project Settings → API → Project URL |
| `SUPABASE_SECRET_KEY` | ✅ | Supabase → API Keys → **Secret** key (`sb_secret_…`). Legacy `SUPABASE_SERVICE_ROLE_KEY` also works. **Backend only.** |
| `ALLOWED_ORIGINS` | ✅ | Comma-separated site origins, e.g. `https://your-site.vercel.app,http://localhost:5173,http://localhost:5174` |
| `OWNER_EMAIL` | for email | Where notifications go |
| `RESEND_API_KEY` | for email on Render | **Render's free tier blocks SMTP**, so use [Resend](https://resend.com) (free): sign up **with the same address as `OWNER_EMAIL`** → API Keys → create. When set, SMTP is ignored. |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` | local / paid Render only | Gmail: `smtp.gmail.com`, `587`, your address, a 16-character **App Password** (Google Account → Security → 2-Step Verification → App passwords), your address |
| `NODE_ENV` | local only | Set `development` locally. Anything else (including unset, e.g. on Render) is treated as production. |
| `PORT` | — | Render sets it; locally defaults to `8787` |

### `frontend/.env` → Vercel → Environment Variables

| Key | Value |
|---|---|
| `VITE_SUPABASE_URL` | Same Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase → API Keys → **Publishable** key (`sb_publishable_…`). `VITE_SUPABASE_PUBLISHABLE_KEY` also accepted. |
| `VITE_API_URL` | Your Render URL, e.g. `https://website-xxxx.onrender.com` (no trailing slash) |
| `VITE_SITE_URL` | Optional on Vercel (its production URL is picked up automatically). Set it for a custom domain. Used in canonical tags, sitemap, robots.txt, share previews |
| `VITE_GA_MEASUREMENT_ID` | `G-XXXXXXXXXX` from GA4 → Admin → Data streams. Optional. |
| `VITE_GOOGLE_SITE_VERIFICATION` | Google Search Console → Add property → URL prefix → HTML tag → the `content="…"` value. Optional; adds the verification tag to every page. |

### `admin-panel/.env`

| Key | Value |
|---|---|
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Same as frontend |
| `VITE_SITE_URL` | Public site URL (sidebar "View site" link) |

On Vercel both apps build in one job, so **one set of Vercel variables covers both**.

> **Golden rule:** publishable key → frontend & admin panel. Secret key →
> backend only. Never put the secret key in any `VITE_` variable.

---

## Run it locally

Requires Node 22+.

```bash
# 1. Database: create a Supabase project, run supabase/schema.sql in SQL Editor.

# 2. Backend (terminal 1)
cd backend && npm install && cp .env.example .env   # fill it in
npm run dev                                         # http://localhost:8787

# 3. Frontend (terminal 2)
cd frontend && npm install && cp .env.example .env
npm run dev                                         # http://localhost:5173

# 4. Admin panel (terminal 3)
cd admin-panel && npm install && cp .env.example .env
npm run dev                                         # http://localhost:5174
```

Check the backend: `http://localhost:8787/api/ready` → `{"ready":true}`.

---

## Deploy

Do it in this order — each step needs a value from the previous one.

### 1. Supabase (database)

1. [supabase.com](https://supabase.com) → **New project**.
2. **SQL Editor → New query** → paste all of `supabase/schema.sql` → **Run**.
3. **Authentication → Users → Add user → Create new user** — your email and
   a password you choose.
4. Click the user, copy its **User UID**, then in the SQL Editor:
   ```sql
   insert into public.admins (id) values ('paste-the-uid-here');
   ```
5. **Project Settings → API / API Keys** — copy the Project URL, the
   **Publishable** key and the **Secret** key.

### 2. Render (backend)

1. Push the repo to GitHub. Render and Vercel deploy the default branch, `main`.
2. Render → **New → Web Service** → pick the repo.
3. **Root Directory:** `backend` · **Build Command:** `npm ci` ·
   **Start Command:** `npm start`.
4. **Environment:** add the backend variables above. For `ALLOWED_ORIGINS`
   use `http://localhost:5173` for now — you'll add the Vercel URL in step 4.
5. **Advanced → Health Check Path:** `/api/ready`.
6. Deploy, then open `https://<your-service>.onrender.com/api/ready` →
   `{"ready":true}`.

The free tier sleeps when idle; the first request after a nap takes 30–60 s.

### 3. Vercel (frontend + admin panel)

`vercel.json` at the repo root already contains the install command, build
command, output folder, `/admin-panel` routing and security headers — you
don't type any of them.

1. Vercel → **Add New → Project** → import the repo.
2. **Root Directory:** leave it as the repo root (`./`). **Framework
   Preset:** *Other*. Leave build/output settings untouched — `vercel.json`
   overrides them.
3. **Environment Variables:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`,
   `VITE_API_URL` (Render URL), optionally `VITE_SITE_URL` (only for a custom
   domain), `VITE_GA_MEASUREMENT_ID` and `VITE_GOOGLE_SITE_VERIFICATION`.
4. **Deploy.** Check both `https://<site>/` and `https://<site>/admin-panel/`.

### 4. Connect them

1. Render → Environment → set `ALLOWED_ORIGINS` to your real site, e.g.
   `https://your-site.vercel.app,http://localhost:5173,http://localhost:5174`
   → save (auto-redeploys). **Skipping this is the #1 cause of "form works
   locally but not live".**
2. Supabase → **Authentication → URL Configuration**: set **Site URL** to
   your site and add `https://<site>/admin-panel/` to **Redirect URLs**.
3. If you add a custom domain later, update `VITE_SITE_URL` (Vercel),
   `ALLOWED_ORIGINS` (Render), and the Supabase URLs, then redeploy.

### 5. Smoke test

- [ ] Submit the contact form → lands on `/thank-you`, email arrives, row appears in admin → *Inbox*.
- [ ] Submit a review → approve it in admin → *Reviews* → "What clients say" appears on the home page.
- [ ] Edit any text in admin → *Page copy* → refresh the site → it changed.
- [ ] Open `/sitemap.xml` and `/robots.txt`.
- [ ] Paste your URL into [opengraph.xyz](https://www.opengraph.xyz) to check the share preview.
- [ ] Run [Google's Rich Results Test](https://search.google.com/test/rich-results) on the home page and a case study.
- [ ] `view-source:` a case study URL — its own title and the page text are in the raw HTML (pre-rendering works).
- [ ] [Register the site on Google Search Console](#google-search-console) and submit the sitemap.

---

## Google Search Console

Search Console is how you tell Google the site exists, prove you own it, and
see which pages are indexed and what people search to find you. Do this once,
after the site is deployed with pre-rendering.

1. Open [Google Search Console](https://search.google.com/search-console) and
   sign in with the Google account that should own the site.
2. **Add property** → choose **URL prefix** (not *Domain* — a Domain property
   needs DNS records, and you don't control `vercel.app`'s DNS). Enter exactly
   `https://harsh-kapadiya.vercel.app/` → **Continue**.
3. Under *Other verification methods*, open **HTML tag**. It shows a line like
   `<meta name="google-site-verification" content="AbC123…" />`. Copy **only**
   the `content` value (`AbC123…`). Leave this tab open.
4. **Vercel** → your project → **Settings → Environment Variables** → add
   `VITE_GOOGLE_SITE_VERIFICATION` = that value, for **Production** → Save.
5. **Deployments** → latest → **⋯ → Redeploy**. Variables are read at build
   time, so the tag only appears after a redeploy.
6. Check it's live: open `view-source:https://harsh-kapadiya.vercel.app/` and
   search the page for `google-site-verification`.
7. Back in Search Console → **Verify** → "Ownership verified". Keep the
   variable set forever; removing it un-verifies the property.
8. Left menu → **Sitemaps** → under *Add a new sitemap* type `sitemap.xml`
   (the box already shows the site URL) → **Submit**. It should report
   *Success* and the number of discovered pages (one per sitemap URL).
9. Top search bar (**URL inspection**) → paste the home page URL → **Request
   indexing**. Repeat for `/work` and your strongest case study; Google limits
   these requests per day, and the sitemap covers the rest.
10. Come back after a few days: **Indexing → Pages** shows what's indexed
    ("Discovered – currently not indexed" is normal for a new site), and
    **Performance** shows searches, clicks and positions.

**Bing too (optional, 2 minutes):** [Bing Webmaster Tools](https://www.bing.com/webmasters)
→ sign in → **Import** your site from Google Search Console. Bing's index also
feeds other search engines.

**Shortcut:** if GA4 (`VITE_GA_MEASUREMENT_ID`) is already live and you're an
admin of that GA property with the same Google account, step 3 can use the
**Google Analytics** method instead of the HTML tag.

**Custom domain later?** Add it as a new property (a *Domain* property via a
DNS TXT record works then), set `VITE_SITE_URL` on Vercel, redeploy, and submit
the sitemap again.

---

## Google sign-in

1. **Google Cloud Console → APIs & Services → Credentials → Create
   credentials → OAuth client ID** → *Web application*.
2. **Authorized redirect URI:** copy it from Supabase → Authentication →
   Providers → Google (it looks like `https://<ref>.supabase.co/auth/v1/callback`).
3. Supabase → Authentication → Providers → **Google** → enable → paste the
   Client ID and Client Secret.
4. Make sure `https://<site>/admin-panel/` is in Supabase's **Redirect URLs**
   (Deploy step 4.2) — and `http://localhost:5174/` for local testing.

**Gotcha:** your first Google sign-in creates a *new* Supabase user with a
new UID, so it's correctly refused with "isn't an admin yet". Add that UID:

```sql
select id, email from auth.users;                 -- find your Google email
insert into public.admins (id) values ('that-uid');
```

---

## Using the admin panel

`https://<site>/admin-panel/` · locally `http://localhost:5174`

| Tab | What it edits |
|---|---|
| Page copy | All text: hero, about, contact details, **response-time promise**, **location** (local schema), hero 3D scene URL, brand name |
| Case studies | Projects: title, slug, cover image, category, year, live link, card size, overview / challenge / solution / results, gallery |
| Services · Skills · Tech stack · Stats · Clients | The matching sections |
| Nav links · Social links | Navbar + footer; social URLs also feed structured data |
| Resume items · Resume file | Timeline entries and the PDF download button |
| Reviews | Approve / unpublish / delete client reviews |
| Inbox | Contact messages — mark read, delete |

Every list has an **Order** field. Image and link fields must be full
`https://` URLs (the database rejects anything else). For images, upload to
Supabase **Storage** (public bucket) and paste the public URL.

**Before launch, replace starter content:** the Unsplash stock photos and the
sample projects. Stats and "Trusted by" clients start empty and stay hidden
until you add real ones.

---

## Tests

```bash
cd backend && npm test          # 9 tests: hostile emails, oversized fields, unknown
                                # keys, ratings, control chars, Resend mailer
cd frontend && npm run build    # typecheck + build + sitemap/robots + pre-render
cd admin-panel && npm run build # typecheck + build
```

Verified before this release: the schema was run twice against Postgres 16
with a Supabase auth shim (identical row counts; RLS checked as anon,
non-admin and admin); the backend was exercised for CORS, 400/413/429/500
paths and fail-fast startup; and 88 browser checks ran against the
production build (unique titles/descriptions, one `<h1>` per page,
canonicals, breadcrumbs, JSON-LD, alt text, 404s, both form → thank-you
flows, GA events, mobile above-the-fold CTA, sticky CTA, admin routing,
no Spline download on phones, pre-rendered HTML with JavaScript off, no
duplicate meta tags after the app loads).

---

## Troubleshooting

| Symptom | Cause / fix |
|---|---|
| Form says "The form isn't connected yet" | `VITE_API_URL` missing in Vercel (or local `frontend/.env`). Redeploy after adding. |
| Form fails only on the live site | `ALLOWED_ORIGINS` on Render doesn't contain your exact site origin (scheme + domain, no trailing slash). |
| Render service won't start: "refusing to start, missing …" | Working as intended — add the named variables. |
| `/api/ready` returns 503 | Wrong `SUPABASE_URL` / secret key, or the schema hasn't been run. |
| Admin edits don't appear on the site | `VITE_SUPABASE_URL` / key missing in **Vercel**, so the site is showing starter content. |
| Admin: "Supabase isn't connected" | Same variables missing for the admin build (on Vercel both apps share them). Key must be named `VITE_SUPABASE_ANON_KEY` or `VITE_SUPABASE_PUBLISHABLE_KEY`. |
| Admin: "isn't an admin yet" | The signed-in user's UID isn't in `public.admins` — see Deploy 1.4 / Google gotcha. |
| Google sign-in returns to the wrong page or errors | `https://<site>/admin-panel/` missing from Supabase Redirect URLs. |
| No emails | Check Render logs for `notification failed`. On Render use `RESEND_API_KEY`, and the Resend account must be the `OWNER_EMAIL` address (without a verified domain Resend only delivers to its own account email). Locally with Gmail SMTP, use an App Password. |
| "What clients say" doesn't show | Correct — it only appears once at least one review is approved. |
| Vercel build error 127 / script not found | Root Directory must be the repo root so `vercel.json` is used. |
| Local `.env` changes ignored | Restart the dev server — Vite and Node read `.env` only at startup. |
| `view-source:` of a page shows an empty `<div id="root">` | That URL wasn't pre-rendered: it isn't in `sitemap.xml` (e.g. added after the last deploy) — redeploy. The page still works for visitors. |
| Search Console: verification fails | Redeploy after setting `VITE_GOOGLE_SITE_VERIFICATION`, and make sure the property URL is exactly `https://harsh-kapadiya.vercel.app/`. |

---

## Known limits & next steps

- **Pre-rendered pages update on deploy.** Every URL in the sitemap is
  pre-rendered to HTML at build time (`scripts/prerender.mjs`), so link previews
  and AI crawlers see each page's own title, image and text. Visitors always get
  live data; the HTML snapshot crawlers read refreshes on the next deploy (Vercel
  → Deployments → Redeploy after big content edits, or wire a Vercel Deploy Hook).
  A case study added after a deploy still works, rendered in the browser.
- **Reviews:** the system only ever shows genuine, approved reviews. Send
  `/feedback` to past clients. Review rich-snippet stars are intentionally not
  added — Google ignores self-published reviews for a person's own services.
- **Rate limiting** is per-process. If you ever run more than one Render
  instance, switch to a Redis store (Upstash + `rate-limit-redis`).
- **Email delivery** has no retry queue; failures are logged and every
  submission is still in the admin inbox.
- **Bundle size:** the site JS is ~123 KB gzipped (mostly React, React Router
  and `motion`). Route-level code splitting would save little — pages share
  most components.
- **Content Security Policy:** not set yet — would need an allow-list for
  Supabase, Spline, Google Fonts, GA and your image hosts.
