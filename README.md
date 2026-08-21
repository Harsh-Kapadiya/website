# Harsh Kapadiya — Portfolio

Dark, motion-heavy portfolio site. React + TypeScript + Vite + Tailwind on the
frontend, Express + Supabase on the backend, a separate admin panel for
content management. Three independent apps, each deployed on its own.

## Structure

| Folder | What it is | Talks to |
|---|---|---|
| `frontend/` | Public site | Supabase directly (reads) + `backend/` (contact & feedback forms) |
| `backend/` | Express API | Supabase (service role, writes) + sends notification emails |
| `admin-panel/` | Content editor, feedback moderation, contact inbox | Supabase directly (reads/writes, admin-only via RLS) |
| `supabase/` | `schema.sql` — run once in the Supabase SQL editor | — |

## First-time setup

1. **Database** — create a Supabase project, run `supabase/schema.sql` in
   Project → SQL Editor. Note your Project URL, anon/publishable key, and
   service_role/secret key (Project Settings → API).
2. **Make yourself an admin** — Authentication → Users → Add user (your
   email + a password). Copy that user's UUID, then in the SQL Editor run:
   ```sql
   insert into public.admins (id) values ('paste-user-uuid-here');
   ```
3. **Backend** — `cd backend && npm install`, copy `.env.example` → `.env`,
   fill in Supabase keys, `OWNER_EMAIL`, SMTP creds, then `npm run dev`.
   Runs on `http://localhost:8787`.
4. **Frontend** — `cd frontend && npm install`, copy `.env.example` →
   `.env`, set `VITE_API_URL=http://localhost:8787` plus the Supabase
   URL/anon key, then `npm run dev`. Runs on `http://localhost:5173`.
5. **Admin panel** — `cd admin-panel && npm install`, copy `.env.example` →
   `.env`, same Supabase URL/anon key as frontend, then `npm run dev`.
   Runs on `http://localhost:5174`. Sign in with the account from step 2.

## What's in each app

**frontend/** — multipage (`/`, `/work`, `/services`, `/about`, `/resume`,
`/contact`, `/feedback`), Spline 3D hero, resume timeline, magnetic buttons,
tilt cards, custom cursor, right-to-left testimonials marquee, glow-on-hover
skills grid. Every text field, project, service, stat, client, social link,
and resume entry is pulled from Supabase with a hardcoded fallback so the
site never looks broken or empty before content's been added — only page
headings stay fixed in code.

**backend/** — two endpoints: `POST /api/contact` and `POST /api/feedback`.
Both validate input, write to Supabase with the service-role key, and email
`OWNER_EMAIL` (contact messages have reply-to set to the sender). Feedback
always saves as unapproved until reviewed in the admin panel.

**admin-panel/** — a tab per content type (page copy, tech stack, skills,
services, projects, stats, clients, social links, resume, feedback
moderation, contact inbox). Talks to Supabase directly using the same anon
key as the frontend — access is enforced by Row Level Security checking the
`admins` table, not by keeping any key secret.

## Deploying admin-panel under a path (not a subdomain)

If you want `https://yourdomain.com/admin-panel` instead of a separate
subdomain, run:

```bash
./scripts/build-all.sh
```

This builds `frontend/` and `admin-panel/` separately, then copies
`admin-panel/dist` into `frontend/dist/admin-panel`. Deploy the contents of
`frontend/dist/` as your site — one deploy serves both, because it's just
nested static files at that point. No reverse proxy, no server config.

Two things make this work, already set up:
- `admin-panel/vite.config.ts` builds with `base: '/admin-panel/'`, so its
  JS/CSS assets and React Router both resolve correctly at that path.
- `frontend/public/_redirects` (Netlify) and `frontend/vercel.json`
  (Vercel) both route `/admin-panel/*` to the admin panel's own
  `index.html`, and everything else to the frontend's — needed so a
  direct link like `/admin-panel/login` doesn't 404 on refresh. If you
  deploy somewhere else (S3+CloudFront, Nginx, etc.), you'll need the
  equivalent: two SPA fallback rules, one scoped to `/admin-panel/*`.

## Setting up Google sign-in for the admin panel

The admin login page has a "Continue with Google" button, but it needs two
things configured first — neither is code, both are dashboard steps:

1. **Google Cloud Console** → create an OAuth 2.0 Client ID (APIs &
   Services → Credentials → Create Credentials → OAuth client ID → type
   "Web application"). Add this as an Authorized redirect URI — copy it
   exactly from Supabase in the next step, don't guess it.
2. **Supabase** → Authentication → Providers → Google → toggle it on,
   paste in the Client ID and Client Secret from step 1. Supabase shows
   you the exact redirect URI to paste into Google Cloud right there.

**Important gotcha:** the first time you sign in with Google, Supabase
creates a *brand new* user — a different UUID than any email/password
account you already made an admin. That first Google sign-in attempt will
correctly fail with "This account isn't an admin" (same protection as
before). Fix it the same way as any admin:
```sql
select id, email from auth.users;  -- find the row with your Google email
insert into public.admins (id) values ('paste-that-uuid-here');
```
After that, Google sign-in works going forward. Email/password sign-in
still works too — this adds Google as a second option, doesn't replace it.

## Troubleshooting: admin panel edits don't show up on the site

Almost always means `frontend/.env` doesn't have `VITE_SUPABASE_URL` /
`VITE_SUPABASE_ANON_KEY` set (or the dev server wasn't restarted after
adding them). Without those, `isSupabaseConfigured` is `false` and every
section silently falls back to its built-in default content — admin
panel writes are real and saved, the frontend just isn't reading them yet.
Check `frontend/.env` exists (not just `.env.example`), values match what's
in `admin-panel/.env`, then restart `npm run dev` in `frontend/`.

## Why this split

`frontend` and `admin-panel` read from Supabase directly using the public
anon key — fast, no backend round-trip, safe because RLS only lets admins
write. `backend` exists for the two things that shouldn't happen straight
from the browser: inserting contact/feedback submissions with the
service-role key, and emailing you when one comes in.

## Not yet done

Hosting/deployment — next phase.
