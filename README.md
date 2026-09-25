# Harsh Kapadiya — Portfolio

A full-stack personal portfolio site: a dark, motion-heavy multipage React
frontend, an Express API for contact/feedback with email notifications, a
Supabase (Postgres) database, and a standalone admin panel for managing
every piece of site content — no code changes needed to update copy,
projects, testimonials, or the resume.

**Live:**

- Site: https://website-ten-dun-87.vercel.app/
- Backend API: https://website-fm7t.onrender.com
- Admin panel: `<site-url>/admin-panel/`

---

## Table of contents

1. [Architecture](#architecture)
2. [Tech stack](#tech-stack)
3. [Repository structure](#repository-structure)
4. [Features](#features)
5. [Local setup](#local-setup)
6. [Environment variables](#environment-variables)
7. [Database schema](#database-schema)
8. [Admin panel](#admin-panel)
9. [SEO & conversion features](#seo--conversion-features)
10. [Deployment](#deployment)
11. [Scripts](#scripts)
12. [Troubleshooting](#troubleshooting)

---

## Architecture

Four independent pieces, each deployed on its own:

```
┌─────────────────┐        ┌──────────────────┐
│   frontend/      │◄──────►│                   │
│  (public site)   │        │    Supabase       │
└─────────────────┘        │  (Postgres + RLS   │
┌─────────────────┐        │   + Auth)          │
│  admin-panel/     │◄──────►│                   │
│  (CMS, at         │        └──────────────────┘
│  /admin-panel)    │                 ▲
└─────────────────┘                 │
┌─────────────────┐                 │
│   backend/         │─────────────────┘
│  (Express API)    │
└─────────────────┘
         │
         ▼
   Email (SMTP) on every
   contact/feedback submission
```

**Why this split:**

- `frontend` and `admin-panel` both talk to Supabase **directly** using the
  public anon key — fast, no backend round-trip, safe because Row Level
  Security (RLS) policies (not key secrecy) control who can write what.
- `backend` exists only for the two things that shouldn't happen straight
  from the browser: inserting contact/feedback submissions using the
  privileged service-role key, and sending an email notification when one
  comes in.
- `admin-panel` is a fully separate app (own `package.json`, own build) —
  not routes bolted onto the public site — so it has its own auth session
  and can be deployed/secured independently, while still living at
  `/admin-panel` on the same domain via a nested static build (see
  [Deployment](#deployment)).

---

## Tech stack

| Layer      | Technology                                                                                |
| ---------- | ----------------------------------------------------------------------------------------- |
| Frontend   | React 18, TypeScript, Vite, Tailwind CSS v4, `motion` (Framer Motion), `react-router-dom` |
| Backend    | Node.js, Express, Nodemailer                                                              |
| Database   | Supabase (Postgres, Row Level Security, Supabase Auth)                                    |
| Admin auth | Supabase Auth — email/password **and** Google OAuth                                       |
| 3D         | Spline (embedded, URL admin-editable)                                                     |
| Analytics  | Google Analytics 4 (`gtag.js`, SPA-aware)                                                 |
| Hosting    | Vercel (frontend + admin-panel), Render (backend)                                         |
| Email      | SMTP via Nodemailer (Gmail App Password or any SMTP provider)                             |

---

## Repository structure

```
WEBSITE/
├── frontend/                 Public site
│   ├── public/
│   │   ├── robots.txt         Allows crawling, blocks /admin-panel
│   │   ├── sitemap.xml
│   │   └── _redirects         Netlify SPA fallback (per-app)
│   ├── vercel.json            Vercel SPA fallback (per-app)
│   └── src/
│       ├── components/        Hero, Work, Services, About, Resume,
│       │                       Testimonials, Skills, Contact, FeedbackForm,
│       │                       Navbar, Footer, Breadcrumbs, PersonSchema,
│       │                       StickyMobileCta, CtaBanner, PageHeader,
│       │                       Layout, interactions/ (Magnetic, TiltCard,
│       │                       CustomCursor, HoverLink)
│       ├── pages/              One file per route (see Routes below)
│       ├── hooks/              useTable, useContentBlocks, usePageMeta
│       └── lib/                supabaseClient, api (backend calls), analytics
│
├── backend/                   Express API
│   └── src/
│       ├── index.js            App entry — CORS, routes, health check
│       ├── routes/             contact.js, feedback.js
│       ├── lib/                 supabaseAdmin.js (service-role client), mailer.js
│       └── middleware/          rateLimit.js
│
├── admin-panel/                Standalone CMS app
│   └── src/
│       ├── pages/               LoginPage, DashboardPage
│       ├── components/          TableEditor (generic CRUD), ContentBlocksEditor,
│       │                        FeedbackModeration, ContactInbox, ResumeFileEditor,
│       │                        RequireAdmin
│       └── hooks/                useAdminAuth
│
├── supabase/
│   └── schema.sql              Full DB schema — tables, RLS policies, seed data
│
├── scripts/
│   └── build-all.sh            Builds frontend + admin-panel, nests admin
│                                 build inside frontend/dist/admin-panel
│
└── README.md                   This file
```

### Routes (frontend)

| Path          | Page                                                                       |
| ------------- | -------------------------------------------------------------------------- |
| `/`           | Home — Hero, Work (compact), Services (compact), Testimonials, Skills, CTA |
| `/work`       | Full project grid                                                          |
| `/work/:slug` | Case study detail page (only for projects with a `slug`)                   |
| `/services`   | Full services list                                                         |
| `/about`      | Bio, stats, trusted-by clients                                             |
| `/resume`     | Experience / education / skills timeline + download                        |
| `/contact`    | Contact form + info                                                        |
| `/feedback`   | Client feedback submission form                                            |
| `/thank-you`  | Post-submission confirmation                                               |
| `*`           | Custom 404                                                                 |

---

## Features

**Design & interaction**

- Dark, editorial aesthetic; Spline 3D scene in the hero (admin-editable URL)
- Magnetic buttons, 3D tilt cards with cursor-glare, trailing custom cursor,
  animated underline nav links, cursor-spotlight service rows
- Right-to-left auto-scrolling testimonials marquee (seamless loop, pauses
  on hover, edge-fade mask, respects `prefers-reduced-motion`)
- Glow-on-hover skills grid

**Content management (nothing hardcoded except headings)**

- Every text field, nav link, project, service, stat, client, social link,
  and resume entry is pulled from Supabase with a hardcoded fallback, so the
  site never looks broken before content's been added
- Admin panel has a tab per content type, generic add/edit/delete forms

**Forms**

- Contact form → Express → Supabase (service role) → email notification
  (reply-to set to the sender)
- Feedback form → same pattern, saved as unapproved until admin reviews it
- Testimonials section shows only approved feedback, and **disappears
  entirely** with zero approved entries
- Both forms redirect to a dedicated `/thank-you` page on success

**SEO & conversion** — see [dedicated section](#seo--conversion-features) below

---

## Local setup

Each app is independent — install and run separately.

```bash
# 1. Database (once)
#    Create a Supabase project, then run supabase/schema.sql in
#    Project → SQL Editor.

# 2. Backend
cd backend
npm install
cp .env.example .env    # fill in — see Environment variables below
npm run dev              # http://localhost:8787

# 3. Frontend (separate terminal)
cd frontend
npm install
cp .env.example .env
npm run dev              # http://localhost:5173

# 4. Admin panel (separate terminal)
cd admin-panel
npm install
cp .env.example .env
npm run dev              # http://localhost:5174
```

Make yourself an admin (required before you can log into `admin-panel`):

```sql
-- After creating your user in Supabase → Authentication → Users → Add user
insert into public.admins (id) values ('paste-that-users-uuid-here');
```

---

## Environment variables

### `frontend/.env`

| Key                      | Value                                                       | Required?                                        |
| ------------------------ | ----------------------------------------------------------- | ------------------------------------------------ |
| `VITE_SUPABASE_URL`      | Supabase → Settings → API → Project URL                     | Optional — falls back to default copy without it |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Settings → API → `anon public` / Publishable key | Optional (same as above)                         |
| `VITE_API_URL`           | Your backend's URL (`http://localhost:8787` locally)        | Required for Contact/Feedback forms to work      |
| `VITE_GA_MEASUREMENT_ID` | Google Analytics 4 Measurement ID (`G-XXXXXXX`)             | Optional — analytics no-ops without it           |

### `backend/.env`

| Key                                                                 | Value                                                                                                                                          |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `PORT`                                                              | `8787` (Render overrides this automatically in production)                                                                                     |
| `SUPABASE_URL`                                                      | Same Project URL as frontend                                                                                                                   |
| `SUPABASE_SERVICE_ROLE_KEY`                                         | Supabase → Settings → API → `service_role` **secret** key — never expose this client-side                                                      |
| `ALLOWED_ORIGINS`                                                   | Comma-separated list of every origin allowed to call this API (your Vercel URL + localhost ports)                                              |
| `OWNER_EMAIL`                                                       | Where contact/feedback notifications are sent                                                                                                  |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` | Your email provider's SMTP details — for Gmail: host `smtp.gmail.com`, port `587`, and a 16-character **App Password**, not your real password |

### `admin-panel/.env`

| Key                      | Value                                                |
| ------------------------ | ---------------------------------------------------- |
| `VITE_SUPABASE_URL`      | Same as frontend                                     |
| `VITE_SUPABASE_ANON_KEY` | Same as frontend                                     |
| `VITE_SITE_URL`          | Public site URL, powers the "View site" sidebar link |

**Golden rule:** anon/publishable key → frontend & admin-panel. service*role
key → backend only, never committed, never in a `VITE*`-prefixed variable.

---

## Database schema

Defined in `supabase/schema.sql`, fully idempotent (safe to re-run any time
after changes — every `CREATE TABLE`/`POLICY` is guarded).

| Table                          | Purpose                                                                                                             |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| `admins`                       | Which Supabase Auth users are allowed into the admin panel                                                          |
| `nav_links`                    | Navbar/footer navigation, admin-editable order and labels                                                           |
| `content_blocks`               | Freeform page copy — `(page, section, key) → value`                                                                 |
| `tech_stack`, `skills`         | Hero tech pills / Skills grid                                                                                       |
| `services`                     | Services & expertise list                                                                                           |
| `projects`                     | Work grid — includes optional case-study fields (`slug`, `overview`, `challenge`, `solution`, `results`, `gallery`) |
| `stats`, `clients`             | About page stats grid + trusted-by logos                                                                            |
| `social_links`                 | Footer/contact social links                                                                                         |
| `resume_items`, `resume_files` | Resume timeline + downloadable PDF                                                                                  |
| `feedback`                     | Client testimonials — public insert via backend only, admin approves before it's public                             |
| `contact_messages`             | Contact form submissions — admin-only read                                                                          |

Row Level Security is on for every table. Public read access is granted
per-table where content should be visible to visitors; all writes require
`is_admin()` (checks the `admins` table) except `feedback` and
`contact_messages`, which only the backend's service-role key can insert
into.

---

## Admin panel

Standalone app, deployed at `/admin-panel` on the same domain as the main
site (not a subdomain — see [Deployment](#deployment)).

**Login:** email/password or "Continue with Google." Either way, being a
valid Supabase user isn't sufficient — only accounts whose UUID is present
in `public.admins` get past the login screen. A valid-but-non-admin session
is signed back out automatically with a clear error.

**Google OAuth setup** (one-time, two dashboard steps, no code):

1. Google Cloud Console → Credentials → Create OAuth 2.0 Client ID (Web
   application) → add the redirect URI Supabase gives you in step 2.
2. Supabase → Authentication → Providers → Google → paste in the Client ID
   and Secret from step 1.

Gotcha: the first Google sign-in creates a **new** Supabase user (different
UUID than any email/password admin account) — add that UUID to `admins`
too after the first (expected) "not an admin" rejection.

**Tabs:** Page copy · Nav links · Tech stack · Skills · Services · Projects
· Stats · Clients · Social links · Resume items · Resume file · Feedback ·
Inbox.

---

## SEO & conversion features

| Feature                                | Where                                                                                                                                           |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Custom 404 page                        | `NotFoundPage.tsx`                                                                                                                              |
| Above-the-fold CTA                     | Hero's primary + secondary CTA both render in the first viewport (`min-h-screen` + bottom-anchored content)                                     |
| Internal linking                       | Footer nav row, breadcrumbs, "View all work/services" links, case-study cross-links                                                             |
| Thank-you page                         | `/thank-you`, both forms redirect here on success                                                                                               |
| Breadcrumbs                            | `Breadcrumbs.tsx` — visual trail + `BreadcrumbList` JSON-LD                                                                                     |
| Case studies                           | `/work/:slug` — overview/challenge/solution/results + gallery, for projects with case-study fields filled in                                    |
| Response time promise                  | Content block `home/contact/response_time`, shown as a trust badge on Contact                                                                   |
| Sticky mobile CTA                      | `StickyMobileCta.tsx` — appears after scroll, mobile only, hidden on `/contact`                                                                 |
| `robots.txt`                           | Allows all crawling, blocks `/admin-panel/`, points to sitemap                                                                                  |
| Unique page titles + meta descriptions | `usePageMeta` hook, called per-page — necessary because this is a client-rendered SPA and would otherwise share one static `<title>` everywhere |
| Social share images (OG/Twitter tags)  | Static site-wide tags in `index.html` (see note below)                                                                                          |
| Real reviews                           | **Not a code feature** — use the built `/feedback` → admin-approval flow with genuine client submissions                                        |
| Alt text                               | Descriptive `alt` on every project/testimonial image                                                                                            |
| Local/structured schema                | `PersonSchema.tsx` (schema.org `Person`, pulled live from Supabase) + `BreadcrumbList`                                                          |
| Google Analytics                       | `lib/analytics.ts` — `initAnalytics()` on app start, `trackPageView()` on route change, no-ops without `VITE_GA_MEASUREMENT_ID`                 |

**SPA limitation, honestly stated:** true per-page dynamic Open Graph images
(different share preview per project/page) would require server-side
rendering or prerendering, which this project doesn't use. `usePageMeta`
updates the live DOM after React renders — good enough for Googlebot (which
executes JavaScript), but raw social-share crawlers that only read the
initial HTML will see `index.html`'s site-wide defaults. The `og:image`
referenced in `index.html` (`/og-image.png`) needs a real 1200×630 image
added to `frontend/public/` — it's not included by default.

---

## Deployment

**Backend → Render**

1. New → Web Service → connect the GitHub repo
2. **Root Directory:** `backend` · Build Command: `npm install` · Start
   Command: `npm start`
3. Add every var from `backend/.env.example` in the Environment tab
4. Deploy → copy the resulting URL → verify `/api/health` returns
   `{"ok":true,"supabaseConnected":true}`
5. Render's free tier spins down on inactivity — first request after idle
   can take 30–60s to wake up. Expected, not a bug.

**Frontend + admin-panel → Vercel (one project, path-based)**

Deployed together so `admin-panel` lives at `/admin-panel` on the same
domain rather than a separate URL.

1. New Project → import the repo
2. **Root Directory:** repo root (not `frontend/`) — Vercel needs to see
   `frontend/`, `admin-panel/`, and `scripts/` together
3. **Build Command** — inline (a separate shell script file can 404 in
   Vercel's build environment depending on Root Directory resolution;
   inlining sidesteps it entirely):
   ```bash
   npm install --prefix frontend && npm install --prefix admin-panel && npm run build --prefix frontend && npm run build --prefix admin-panel && rm -rf frontend/dist/admin-panel && cp -r admin-panel/dist frontend/dist/admin-panel
   ```
4. **Output Directory:** `frontend/dist`
5. Environment variables (covers both apps, since they build in the same
   job): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL`
   (→ your Render backend URL)
6. Deploy → verify the root site loads **and** `/admin-panel/` loads the
   admin login
7. **Go back to Render** and update `ALLOWED_ORIGINS` to include this real
   Vercel URL, then redeploy. Skipping this step is the single most common
   cause of "the contact form doesn't work in production" — it's a CORS
   rejection, not a bug in the form itself.

`frontend/vercel.json` and `frontend/public/_redirects` already handle the
SPA fallback routing (a direct link to `/admin-panel/login` won't 404 on
refresh) — nothing extra to configure for that part.

---

## Scripts

| Command                  | Where          | What it does                                                                                                               |
| ------------------------ | -------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`            | any app folder | Local dev server                                                                                                           |
| `npm run build`          | any app folder | Production build                                                                                                           |
| `./scripts/build-all.sh` | repo root      | Builds frontend + admin-panel, nests admin build inside `frontend/dist/admin-panel` for local testing of the merged output |

---

## Troubleshooting

**"Backend isn't connected yet" / "Server is not connected to Supabase
yet"** — almost always a missing or unread `.env` file. Each of the three
apps needs its **own** `.env` (not just `.env.example`), even when values
are duplicated across them. Vite/Node only read `.env` at process startup
— restart the dev server after any edit.

**Admin panel edits don't show up on the live site** — check
`frontend`'s deployed environment variables (Vercel dashboard, not just
local `.env` — deployment platforms never read gitignored local files).
Without `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` set there, the site
silently falls back to default content; the admin writes are real, the
frontend just isn't reading Supabase in production.

**Contact/feedback form fails only in production** — check `ALLOWED_ORIGINS`
on Render includes your actual Vercel URL. This is a CORS rejection, not a
bug in the form.

**Login says "not an admin" despite correct credentials** — valid Supabase
credentials aren't sufficient; the user's UUID must also be a row in
`public.admins`. Check `select id, email from auth.users;` then
`select * from admins;` to confirm the UUID actually matches, and confirm
the `"self read own admin row"` RLS policy exists (added after the initial
schema — re-run `supabase/schema.sql` if your database predates it).

**`VITE_SUPABASE_PUBLISHABLE_KEY` vs `VITE_SUPABASE_ANON_KEY`** — Supabase's
newer dashboard UI calls it "Publishable key," but the codebase expects the
variable name `VITE_SUPABASE_ANON_KEY`. Same value, must be renamed.

**Vercel build fails with exit 127** — Root Directory isn't actually set to
the repo root, so `scripts/build-all.sh` doesn't exist at the path Vercel's
running from. Use the inlined Build Command from the
[Deployment](#deployment) section instead of the script path.
