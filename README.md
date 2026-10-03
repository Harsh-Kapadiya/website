# Harsh Kapadiya · Portfolio

<p align="center">
  <a href="https://harsh-kapadiya.vercel.app">
    <img src="frontend/public/og-image.png" alt="Harsh Kapadiya Portfolio" width="100%">
  </a>
</p>

<p align="center">
  <strong>Designer · Developer · Creative Thinker</strong>
</p>

<p align="center">
  A modern, motion-driven personal portfolio built with React, TypeScript, Supabase and Express.
  <br />
  Fully content-managed, SEO-ready, pre-rendered, and backed by a dedicated admin panel.
</p>

<p align="center">
  <a href="https://harsh-kapadiya.vercel.app">Live Website</a>
  ·
  <a href="#features">Features</a>
  ·
  <a href="#architecture">Architecture</a>
  ·
  <a href="#local-development">Development</a>
  ·
  <a href="#deployment">Deployment</a>
</p>

<p align="center">

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge\&logo=react\&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge\&logo=typescript\&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge\&logo=vite\&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ECF8E?style=for-the-badge\&logo=supabase\&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?style=for-the-badge\&logo=express\&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Frontend-000000?style=for-the-badge\&logo=vercel\&logoColor=white)

</p>

***

## ✦ Overview

This repository contains the complete production stack behind my personal portfolio.

It is more than a static portfolio website. The project includes:

* **Public portfolio** built with React + TypeScript
* **Standalone admin panel** for managing site content
* **Supabase/Postgres** database with Row Level Security
* **Express API** for contact and review submissions
* **Email notifications** through Resend
* **Pre-rendered pages** for SEO and social sharing
* **Google Analytics** event tracking
* **Responsive motion-driven UI**
* **Security hardening** across the frontend, backend and database

The entire website can be updated from the admin panel without modifying the frontend code.

> **Live:** https://harsh-kapadiya.vercel.app


***

## ✨ Highlights

| Area                    | What it does                                                         |
| ----------------------- | -------------------------------------------------------------------- |
| 🎨 **Interactive UI**   | Motion, 3D hero, magnetic buttons, tilt cards and hover interactions |
| 🧩 **Headless Content** | Site content is managed through Supabase                             |
| 🔐 **Admin Panel**      | Authenticated dashboard for managing every major section             |
| 🚀 **Performance**      | Desktop 3D experience with a lightweight mobile fallback             |
| 🔎 **SEO**              | Pre-rendered HTML, sitemap, canonical URLs, JSON-LD and Open Graph   |
| 📬 **Contact System**   | Validated forms, database storage and email notifications            |
| 🛡️ **Security**        | RLS, rate limiting, validation, CORS hardening and secure headers    |
| 📱 **Responsive**       | Dedicated mobile optimizations and sticky mobile CTA                 |
| 📊 **Analytics**        | GA4 page views and conversion events                                 |

***

# 🏗️ Architecture

```text
                         ┌──────────────────────┐
                         │       Visitor        │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │       Vercel         │
                         │  React + TypeScript  │
                         │    Pre-rendered HTML │
                         └──────────┬───────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
          ┌──────────────────┐             ┌──────────────────┐
          │    Supabase      │             │   Express API    │
          │                  │             │     Render       │
          │ PostgreSQL + RLS │             │                  │
          │ Auth + Storage   │             │ Contact / Review │
          └──────────────────┘             │   + AI chat      │
                                           └────────┬─────────┘
                                                    │
                                     ┌──────────────┴──────────────┐
                                     ▼                             ▼
                           ┌───────────────────┐         ┌──────────────────┐
                           │      Resend       │         │    Claude API    │
                           │ Email Notification│         │ Haiku 4.5 · chat │
                           └───────────────────┘         └──────────────────┘


                         ┌──────────────────────┐
                         │     Admin User       │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │    Admin Panel       │
                         │   /admin-panel/      │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │      Supabase        │
                         │   Admin-only RLS     │
                         └──────────────────────┘
```

### How it works

* The public site reads content from Supabase using the publishable key.
* Row Level Security controls what each user can access.
* The Express backend handles operations that should never expose privileged credentials to the browser.
* Contact and review submissions are validated, stored and forwarded through email.
* The AI chat assistant answers from the site content via Claude; confirmed leads go to the same inbox.
* The admin panel is a separate application served under `/admin-panel/`.
* During deployment, every sitemap URL is pre-rendered into real HTML.
* React takes over in the browser and refreshes content dynamically.

### Architecture source

The repository also contains:

* `docs/architecture-light.png`
* `docs/architecture-dark.png`
* `docs/architecture.html`
* `docs/architecture.archify.json`

The interactive architecture diagram can be opened directly from `docs/architecture.html`.

***

# 📁 Project Structure

```text
WEBSITE/
│
├── vercel.json
│
├── docs/
│   ├── architecture-light.png
│   ├── architecture-dark.png
│   ├── architecture.html
│   └── architecture.archify.json
│
├── supabase/
│   └── schema.sql
│
├── backend/
│   ├── src/
│   │   ├── index.js
│   │   ├── validate.js
│   │   └── mailer.js
│   │
│   └── test/
│
├── frontend/
│   ├── index.html
│   ├── vite.config.ts
│   ├── scripts/
│   │   └── prerender.mjs
│   │
│   ├── public/
│   │   ├── og-image.png
│   │   ├── favicon.svg
│   │   └── img/
│   │       └── hero-poster.webp
│   │
│   └── src/
│       ├── entry-server.tsx
│       ├── pages/
│       ├── components/
│       ├── hooks/
│       └── lib/
│
└── admin-panel/
    └── src/
        ├── hooks/
        ├── pages/
        └── components/
```

***

# 🧭 Routes

| Route            | Purpose                                       | Indexed |
| ---------------- | --------------------------------------------- | :-----: |
| `/`              | Hero, work, services, reviews, skills and CTA |    ✅    |
| `/work`          | All projects                                  |    ✅    |
| `/work/:slug`    | Individual case study                         |    ✅    |
| `/services`      | Services and skills                           |    ✅    |
| `/about`         | Bio, stats, clients and reviews               |    ✅    |
| `/resume`        | Resume timeline and PDF                       |    ✅    |
| `/contact`       | Contact form                                  |    ✅    |
| `/feedback`      | Client review form                            |    ✅    |
| `/thank-you`     | Form confirmation                             |    ✅    |
| `/admin-panel/*` | Admin dashboard                               |    ✅    |

***

# 🎨 Features

## Interactive Design

The portfolio is intentionally designed as an interactive experience rather than a traditional static resume.

* Spline 3D hero on capable desktop devices
* Lightweight poster fallback on mobile
* Magnetic buttons
* 3D tilt cards
* Cursor glare effects
* Custom trailing cursor
* Cursor spotlight interactions
* Animated review marquee
* Hover-based skill interactions
* Reduced-motion support

Motion is automatically reduced when the visitor has enabled:

```text
prefers-reduced-motion
```

***

## 🧩 Fully Editable Content

The admin panel controls the majority of the website content.

### Editable

* Brand name
* Navigation links
* Hero content
* Hero 3D scene
* Hero poster
* Projects
* Case studies
* Services
* Skills
* Technologies
* Statistics
* Clients
* Social links
* Resume entries
* Resume PDF
* Reviews
* Contact information
* Response-time promise
* Location

Only structural section headings remain in code.

If Supabase is unavailable, the website falls back to built-in starter content instead of rendering an empty page.

***

## 📬 Contact & Review System

Both forms follow the same flow:

```text
Visitor
   │
   ▼
Frontend validation
   │
   ▼
Express API
   │
   ├── Validate
   ├── Rate limit
   ├── Store in Supabase
   └── Send email
   │
   ▼
/thank-you
```

Supported:

* Contact submissions
* Client reviews
* Server-side validation
* Honeypot protection
* Rate limiting
* Database storage
* Email notifications
* Google Analytics conversion events

***

## 💬 AI Chat Assistant

A chat button (bottom-right on every page) opens **Harsh's AI assistant**. It answers visitors' questions about Harsh's work, services and experience, and can pass a message to him.

```text
Visitor ──► ChatWidget ──POST /api/chat──► Express API (Render) ──► Claude Haiku 4.5
                                               │
                                               ├── reads the site content from Supabase (cached 5 min)
                                               └── save_lead ──► contact_messages + email to you
```

* **Grounded in your CMS.** Every reply is built only from the site content (copy, services, case studies, resume, approved reviews, socials), so admin-panel edits reach the assistant within 5 minutes — no redeploy.
* **Honest by design.** It says it's an AI assistant, never claims to be Harsh, and never invents prices, timelines, availability or clients — it offers to pass the question on instead.
* **Turns chats into leads.** When a visitor wants to hire Harsh, it asks for name, email and project, repeats them back, and saves them **only after the visitor confirms**. Leads land in admin → *Inbox* marked `[via website chat]`, you get the usual email, and GA4 records `generate_lead` (`location: chat`).
* **Private.** Conversations are not stored or logged — only token counts, for cost tracking. Nothing is kept in the browser either.
* **Cost-capped.** 20 messages per visitor per 15 minutes, `CHAT_DAILY_LIMIT` replies per day overall, short replies (≤ 600 tokens), and the site content is prompt-cached. Rough cost: ₹1–2 per conversation.
* **Graceful.** Opening the chat wakes the Render server (free plan sleeps); a "waking up" note appears if that takes over 1.5 s. Without `ANTHROPIC_API_KEY` the widget shows "offline" and points to the contact page.

**Turn it on**

1. [Claude Console](https://console.anthropic.com) → sign in → **Billing**: add a card and credits; set a **monthly spend limit**.
2. **API Keys → Create Key** → copy it (shown once).
3. Render → your service → **Environment** → add `ANTHROPIC_API_KEY` (and optionally `CHAT_DAILY_LIMIT`) → **Save** (redeploys).
4. Open the site → chat button → ask "What does Harsh do?". Then test a lead: "I want to hire Harsh" → give a test name/email → confirm → check admin → *Inbox* and your email.

Code: `backend/src/chat.js` (validation, knowledge, prompt, tool loop), `/api/chat` in `backend/src/index.js`, `frontend/src/components/ChatWidget.tsx`.

***

# ⚡ Performance

One of the main performance improvements was removing the heavy 3D experience from mobile devices.

| Resource             |  Before |           Current |
| -------------------- | ------: | ----------------: |
| Mobile hero          | ~2.2 MB |            ~19 KB |
| Mobile hero requests |      58 | Lightweight image |
| Site JavaScript      |  598 KB |           ~390 KB |
| Gzipped JavaScript   |  176 KB |           ~123 KB |

### Mobile strategy

The live Spline scene loads only when:

* viewport is at least `768px`
* a mouse is available
* reduced motion is not enabled
* data saver is not active
* the initial page load has completed

Everyone else receives:

```text
hero-poster.webp
```

This keeps the visual identity while avoiding unnecessary WebGL work on phones.

***

# 🔎 SEO

The project includes a dedicated SEO layer rather than relying only on client-side React rendering.

### Included

* Pre-rendered HTML
* Dynamic page titles
* Dynamic meta descriptions
* Canonical URLs
* `robots.txt`
* `sitemap.xml`
* Open Graph metadata
* Twitter metadata
* JSON-LD structured data
* Breadcrumb structured data
* `Person` schema
* `ProfessionalService` schema
* `WebSite` schema
* Descriptive image alt text
* Custom 404 page
* `noindex` confirmation pages
* Google Search Console verification

### Pre-rendering

During the production build:

```text
Vite Build
    │
    ▼
Generate sitemap
    │
    ▼
Render every sitemap URL
    │
    ▼
Write static HTML
    │
    ▼
Vercel deployment
```

Each pre-rendered page receives its own:

* `<title>`
* meta description
* canonical URL
* Open Graph metadata
* Twitter metadata
* JSON-LD
* page content

This means crawlers and social platforms can see meaningful page content without executing JavaScript.

***

# 🛡️ Security

The project went through a security hardening pass covering the frontend, API and database.

### API

* Strict input validation
* Unknown-field rejection
* Request body size limits
* Per-IP rate limiting
* Global rate limiting
* Honeypot protection
* Production CORS allowlist
* Stable client-facing error codes
* Request IDs for debugging
* Secure email parsing
* Helmet security headers

### Database

* Row Level Security
* Admin-only write policies
* `is_admin()` authorization
* Restricted privileged functions
* Database constraints
* Enum validation
* URL scheme validation
* Unique natural keys
* Automatic `updated_at`
* Idempotent seed data

### Frontend

* Safe URL handling
* Restricted Spline iframe URLs
* No `dangerouslySetInnerHTML`
* Security headers through Vercel
* `X-Frame-Options`
* `X-Content-Type-Options`
* `Referrer-Policy`
* `Permissions-Policy`

### Deliberately deferred

These are not currently implemented:

* Redis-backed distributed rate limiting
* Email retry queue
* CAPTCHA
* Content Security Policy

***

# 🔐 Environment Variables

Each application has its own environment configuration.

> **Important:** Never expose the Supabase secret key through a `VITE_` variable.

### Backend

`backend/.env`

| Variable              | Required | Purpose                     |
| --------------------- | :------: | --------------------------- |
| `SUPABASE_URL`        |     ✅    | Supabase project URL        |
| `SUPABASE_SECRET_KEY` |     ✅    | Server-only Supabase secret |
| `ALLOWED_ORIGINS`     |     ✅    | Allowed frontend origins    |
| `OWNER_EMAIL`         |   Email  | Notification recipient      |
| `RESEND_API_KEY`      |   Email  | Production email delivery   |
| `SMTP_HOST`           |   Local  | SMTP server                 |
| `SMTP_PORT`           |   Local  | SMTP port                   |
| `SMTP_USER`           |   Local  | SMTP username               |
| `SMTP_PASS`           |   Local  | SMTP password               |
| `SMTP_FROM`           |   Local  | Sender address              |
| `ANTHROPIC_API_KEY`   |   Chat   | Turns on the AI chat assistant (Claude Console → API Keys) |
| `CHAT_DAILY_LIMIT`    | Optional | Max assistant replies per day, all visitors (default `300`) |
| `CHAT_MODEL`          | Optional | Defaults to `claude-haiku-4-5-20251001` |
| `NODE_ENV`            |   Local  | Development mode            |
| `PORT`                | Optional | Defaults to `8787`          |

### Frontend

`frontend/.env`

| Variable                        | Purpose                         |
| ------------------------------- | ------------------------------- |
| `VITE_SUPABASE_URL`             | Supabase project URL            |
| `VITE_SUPABASE_ANON_KEY`        | Public/publishable Supabase key |
| `VITE_API_URL`                  | Express API URL                 |
| `VITE_SITE_URL`                 | Production/custom domain        |
| `VITE_GA_MEASUREMENT_ID`        | Google Analytics                |
| `VITE_GOOGLE_SITE_VERIFICATION` | Search Console verification     |

### Admin Panel

`admin-panel/.env`

| Variable                 | Purpose                |
| ------------------------ | ---------------------- |
| `VITE_SUPABASE_URL`      | Supabase project URL   |
| `VITE_SUPABASE_ANON_KEY` | Public/publishable key |
| `VITE_SITE_URL`          | Public website URL     |

### Key rule

```text
                    ┌──────────────────────┐
                    │ Publishable Key      │
                    └──────────┬───────────┘
                               │
                    ┌──────────┴───────────┐
                    ▼                      ▼
               Frontend              Admin Panel


                    ┌──────────────────────┐
                    │ Secret Key           │
                    └──────────┬───────────┘
                               │
                               ▼
                           Backend
```

The secret key must never be exposed to the browser.

***

# 💻 Local Development

## Requirements

* Node.js `22+`
* npm
* Supabase project

***

## 1. Database

Create a Supabase project and run:

```text
supabase/schema.sql
```

inside the Supabase SQL Editor.

***

## 2. Backend

```bash
cd backend

npm install

cp .env.example .env
```

Fill in the required environment variables, then:

```bash
npm run dev
```

Backend:

```text
http://localhost:8787
```

Health check:

```text
http://localhost:8787/api/ready
```

Expected:

```json
{
  "ready": true
}
```

***

## 3. Frontend

Open another terminal:

```bash
cd frontend

npm install

cp .env.example .env

npm run dev
```

Frontend:

```text
http://localhost:5173
```

***

## 4. Admin Panel

Open another terminal:

```bash
cd admin-panel

npm install

cp .env.example .env

npm run dev
```

Admin:

```text
http://localhost:5174
```

***

# 🚀 Deployment

The production stack is deployed in three parts:

```text
Supabase
   ↓
Database + Auth
   ↓
Render
   ↓
Express API
   ↓
Vercel
   ↓
Frontend + Admin Panel
```

***

## 1. Supabase

1. Create a new Supabase project.
2. Open **SQL Editor**.
3. Run `supabase/schema.sql`.
4. Create your authentication user.
5. Add the user's UID to:

```sql
insert into public.admins (id)
values ('YOUR_USER_UID');
```

6. Copy:

   * Project URL
   * Publishable key
   * Secret key

***

## 2. Render

Create a new Web Service from the repository.

```text
Root Directory: backend
Build Command: npm ci
Start Command: npm start
Health Check: /api/ready
```

Add the backend environment variables.

After deployment:

```text
https://YOUR-SERVICE.onrender.com/api/ready
```

should return:

```json
{
  "ready": true
}
```

> Render's free tier can sleep when idle, so the first request after inactivity may take 30–60 seconds.

***

## 3. Vercel

Import the repository into Vercel.

Use:

```text
Root Directory: ./
Framework Preset: Other
```

The root `vercel.json` handles the build and routing configuration.

Add the required frontend environment variables and deploy.

Verify:

```text
https://your-site.vercel.app/
https://your-site.vercel.app/admin-panel/
```

***

## 4. Connect Services

Update Render:

```text
ALLOWED_ORIGINS
```

with your production website origin.

Example:

```text
https://your-site.vercel.app,http://localhost:5173,http://localhost:5174
```

Then configure Supabase:

```text
Authentication
   → URL Configuration
   → Site URL
```

and add:

```text
https://your-site.vercel.app/admin-panel/
```

to the allowed redirect URLs.


### Important

The first Google login creates a new Supabase user.

That user's UID must be added to:

```sql
public.admins
```

Example:

```sql
select id, email
from auth.users;

insert into public.admins (id)
values ('GOOGLE_USER_UID');
```

***

# 🎛️ Admin Panel

The admin dashboard is available at:

```text
https://<site>/admin-panel/
```

Locally:

```text
http://localhost:5174
```

### Dashboard sections

| Section          | Controls                                             |
| ---------------- | ---------------------------------------------------- |
| **Page Copy**    | Hero, text, contact details, location, response time |
| **Case Studies** | Projects, galleries, results and metadata            |
| **Services**     | Service sections                                     |
| **Skills**       | Skills and technologies                              |
| **Tech Stack**   | Technology pills                                     |
| **Stats**        | Portfolio statistics                                 |
| **Clients**      | Client information                                   |
| **Navigation**   | Navbar links                                         |
| **Social Links** | Social profiles                                      |
| **Resume**       | Timeline and resume PDF                              |
| **Reviews**      | Approve, unpublish or delete reviews                 |
| **Inbox**        | Contact submissions                                  |

Every sortable list includes an `Order` field.

Image and link fields accept secure `https://` URLs.

***

# 🧹 Before Launch

Replace the starter/demo content before making the website public.

In particular:

* Replace Unsplash images
* Replace sample projects
* Add real project case studies
* Add real statistics
* Add actual clients where applicable
* Add approved genuine reviews
* Upload the final resume
* Configure the production domain

Empty sections remain hidden until real content is added.

***

# 🧪 Tests

### Backend

```bash
cd backend

npm test
```

The backend test suite covers:

* hostile emails
* oversized fields
* unknown keys
* ratings
* control characters
* Resend mailer behavior
* chat payload validation (forged roles, alternation, sizes)
* chat lead flow: saved only on a valid `save_lead` call, errors fed back to the model
* the request sent to Claude (cached system prompt, tool, conversation)

### Frontend

```bash
cd frontend

npm run build
```

This validates:

* TypeScript
* production build
* sitemap
* robots
* pre-rendering

### Admin Panel

```bash
cd admin-panel

npm run build
```

***

# ✅ Verification

The production build was verified for:

* Database schema repeatability
* RLS behavior
* Anonymous access restrictions
* Non-admin authorization
* Admin authorization
* CORS behavior
* `400 / 413 / 429 / 500` API paths
* Startup validation
* Unique page titles
* Meta descriptions
* Canonicals
* Breadcrumbs
* JSON-LD
* Image alt text
* 404 behavior
* Contact flow
* Review flow
* Analytics events
* Mobile CTA
* Sticky CTA
* Admin routing
* Mobile 3D fallback
* Chat assistant: replies, clickable links, lead → GA event, offline state, keyboard (Esc / focus), mobile placement above the sticky CTA
* Pre-rendered HTML
* JavaScript-disabled rendering
* Duplicate metadata prevention

***

# 🛠️ Troubleshooting

| Problem                             | Likely cause                                      |
| ----------------------------------- | ------------------------------------------------- |
| `The form isn't connected yet`      | `VITE_API_URL` is missing                         |
| Form works locally but not live     | `ALLOWED_ORIGINS` is incorrect                    |
| Render refuses to start             | Required environment variable is missing          |
| `/api/ready` returns `503`          | Database/configuration problem                    |
| Admin changes don't appear          | Supabase variables are missing in Vercel          |
| Admin says Supabase isn't connected | Incorrect frontend/admin environment variables    |
| User isn't an admin                 | UID isn't present in `public.admins`              |
| Google login redirects incorrectly  | Admin URL missing from Supabase Redirect URLs     |
| No emails arrive                    | Check Resend configuration and Render logs        |
| Reviews don't appear                | Only approved reviews are displayed               |
| Vercel build fails with `127`       | Root Directory is not the repository root         |
| `.env` changes don't work           | Restart the development server                    |
| Empty HTML from `view-source:`      | Page wasn't included in the last pre-render build |
| Search Console verification fails   | Redeploy after setting verification variable      |
| Chat says "offline"                 | `ANTHROPIC_API_KEY` not set on Render (check `/api/health` → `"chat":true`) |
| Chat: "having trouble right now"    | Render logs → `chat failed`: wrong key, no credits, or spend limit reached |
| Chat: "resting for today"           | `CHAT_DAILY_LIMIT` reached — raise it or wait until tomorrow |
| Chat answer is outdated             | Content is cached for 5 minutes after an admin edit |

***

# 🗺️ Known Limitations & Roadmap

### Current limitations

**Pre-rendering**

Pages in the sitemap are pre-rendered during deployment. Content changes made through the admin panel are immediately visible to visitors through the client application, but the static HTML snapshot is refreshed on the next deployment.

**Rate limiting**

Rate limiting is currently process-based. A multi-instance backend would require a shared store such as Redis.

**Email retries**

Failed email notifications are logged. The submission remains available in the admin inbox, but there is currently no automatic retry queue.

**Content Security Policy**

A CSP has not been added yet because the final allowlist needs to account for:

* Supabase
* Spline
* Google Fonts
* Google Analytics
* Image hosts

### Potential next steps

```text
→ Redis-backed rate limiting
→ Email retry queue
→ CAPTCHA
→ Content Security Policy
→ Optional route-level code splitting
→ Automated deployment hooks for content changes
```

***

# 📊 Tech Stack

### Frontend

* React 18
* TypeScript
* Vite 6
* Tailwind CSS v4
* Motion
* React Router

### Backend

* Node.js 22
* Express 5
* Helmet
* Resend
* Nodemailer

### Database & Authentication

* Supabase
* PostgreSQL
* Supabase Auth
* Row Level Security
* Supabase Storage

### Deployment

* Vercel
* Render
* Supabase

### Analytics & SEO

* Google Analytics 4
* Google Search Console
* JSON-LD
* Open Graph
* Sitemap
* Pre-rendering

***

# 📌 Repository Philosophy

The project follows a few simple principles:

```text
Design should feel intentional.
Content should be editable.
Performance should not be sacrificed for visuals.
Security should exist at every layer.
SEO should work without depending entirely on JavaScript.
The admin experience should be as polished as the public website.
```

***

# 👨‍💻 Author

<p align="center">
  <strong>Harsh Kapadiya</strong>
  <br />
  Computer Science & Engineering Student · UI/UX Designer · Developer
</p>

<p align="center">
  <a href="https://harsh-kapadiya.vercel.app">Portfolio</a>
  ·
  <a href="https://github.com/Harsh-Kapadiya">GitHub</a>
</p>

***

<p align="center">
  Built with curiosity, code, and a slightly unhealthy obsession with good UI.
</p>

<p align="center">
  <sub>© 2026 Harsh Kapadiya. All rights reserved.</sub>
</p>
