-- ============================================================
-- Arik Portfolio — Supabase schema
-- Run once in Supabase Dashboard → SQL Editor → New query → Run.
-- Safe to re-run: every statement is idempotent (IF NOT EXISTS / ON CONFLICT).
-- ============================================================

create extension if not exists pgcrypto;

-- ---------- ADMIN ACCESS ----------
-- Whoever's auth.users id is in this table can write to content tables
-- from the admin panel. After creating your admin user in Supabase Auth
-- (Authentication > Users > Add user), copy their UUID and run:
--   insert into public.admins (id) values ('paste-user-uuid-here');
create table if not exists public.admins (
  id uuid primary key references auth.users(id) on delete cascade
);

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (select 1 from public.admins where id = auth.uid());
$$;

-- ---------- SINGLE-VALUE PAGE COPY ----------
create table if not exists public.content_blocks (
  id uuid primary key default gen_random_uuid(),
  page text not null,
  section text not null,
  key text not null,
  value text not null default '',
  updated_at timestamptz not null default now(),
  unique (page, section, key)
);

-- ---------- REPEATABLE CONTENT ----------
create table if not exists public.tech_stack (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  sort_order int not null default 0
);

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  icon text not null default 'react', -- matches a key in the frontend's icon map
  sort_order int not null default 0
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  number text not null,
  title text not null,
  description text not null,
  tags text[] not null default '{}',
  sort_order int not null default 0
);

-- Your project images live here — image_url can point to Supabase Storage
-- (recommended) or any public image URL (Unsplash, etc.)
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  year text not null,
  image_url text not null,
  size text not null default 'small', -- 'large' | 'small'
  link_url text,
  sort_order int not null default 0
);

create table if not exists public.stats (
  id uuid primary key default gen_random_uuid(),
  value text not null,
  label text not null,
  sort_order int not null default 0
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order int not null default 0
);

create table if not exists public.social_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  url text not null,
  sort_order int not null default 0
);

create table if not exists public.resume_items (
  id uuid primary key default gen_random_uuid(),
  kind text not null, -- 'experience' | 'education' | 'skill'
  title text not null,
  subtitle text,
  period text,
  description text,
  sort_order int not null default 0
);

create table if not exists public.resume_files (
  id uuid primary key default gen_random_uuid(),
  file_url text not null,
  label text not null default 'Download Resume',
  updated_at timestamptz not null default now()
);

-- ---------- CLIENT FEEDBACK ----------
-- Only ever written by the backend (service-role key), never directly from
-- the browser — that's what lets the backend email you on every submission
-- and keep basic spam controls in one place. Public can only ever SELECT
-- approved rows.
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  author text not null,
  role text,
  avatar_url text,
  quote text not null,
  rating int not null default 5 check (rating between 1 and 5),
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- CONTACT INQUIRIES ----------
-- Same pattern: backend-only writes (service role), admin-only reads.
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.admins enable row level security;
alter table public.content_blocks enable row level security;
alter table public.tech_stack enable row level security;
alter table public.skills enable row level security;
alter table public.services enable row level security;
alter table public.projects enable row level security;
alter table public.stats enable row level security;
alter table public.clients enable row level security;
alter table public.social_links enable row level security;
alter table public.resume_items enable row level security;
alter table public.resume_files enable row level security;
alter table public.feedback enable row level security;
alter table public.contact_messages enable row level security;

-- Public read on every general content table
create policy "public read content_blocks" on public.content_blocks for select using (true);
create policy "public read tech_stack" on public.tech_stack for select using (true);
create policy "public read skills" on public.skills for select using (true);
create policy "public read services" on public.services for select using (true);
create policy "public read projects" on public.projects for select using (true);
create policy "public read stats" on public.stats for select using (true);
create policy "public read clients" on public.clients for select using (true);
create policy "public read social_links" on public.social_links for select using (true);
create policy "public read resume_items" on public.resume_items for select using (true);
create policy "public read resume_files" on public.resume_files for select using (true);

-- Feedback: public can read ONLY approved rows. No public insert policy —
-- writes only happen via the backend's service-role key.
create policy "public read approved feedback" on public.feedback
  for select using (approved = true);

-- Contact messages: no public policy at all. Backend writes via service
-- role (bypasses RLS); only admins can read/update from the admin panel.
create policy "admin read contact_messages" on public.contact_messages for select using (is_admin());
create policy "admin update contact_messages" on public.contact_messages for update using (is_admin()) with check (is_admin());

-- Admin write access (content tables + feedback moderation)
create policy "admin write content_blocks" on public.content_blocks for all using (is_admin()) with check (is_admin());
create policy "admin write tech_stack" on public.tech_stack for all using (is_admin()) with check (is_admin());
create policy "admin write skills" on public.skills for all using (is_admin()) with check (is_admin());
create policy "admin write services" on public.services for all using (is_admin()) with check (is_admin());
create policy "admin write projects" on public.projects for all using (is_admin()) with check (is_admin());
create policy "admin write stats" on public.stats for all using (is_admin()) with check (is_admin());
create policy "admin write clients" on public.clients for all using (is_admin()) with check (is_admin());
create policy "admin write social_links" on public.social_links for all using (is_admin()) with check (is_admin());
create policy "admin write resume_items" on public.resume_items for all using (is_admin()) with check (is_admin());
create policy "admin write resume_files" on public.resume_files for all using (is_admin()) with check (is_admin());
create policy "admin manage feedback" on public.feedback for update using (is_admin()) with check (is_admin());
create policy "admin delete feedback" on public.feedback for delete using (is_admin());

-- ============================================================
-- SEED DATA — mirrors the frontend's built-in fallback copy, so the
-- site looks identical the moment you connect Supabase. Edit freely
-- from the admin panel afterwards.
-- ============================================================
insert into public.content_blocks (page, section, key, value) values
  ('home','hero','badge_text','Available for freelance & full-time roles'),
  ('home','hero','badge_pill','Open to remote'),
  ('home','hero','bio','Full-stack web developer specializing in React, TypeScript & Node.js. I turn complex problems into clean, performant products.'),
  ('home','hero','cta_primary','View my work'),
  ('home','hero','cta_secondary','Hire me'),
  ('home','about','eyebrow','ABOUT ME'),
  ('home','about','bio_1','I''m Arik — a multidisciplinary designer and developer who believes great design is inseparable from great function. I work at the intersection of aesthetics and engineering to create digital experiences that are both beautiful and meaningful.'),
  ('home','about','bio_2','With over five years working with startups and global brands, I bring a systems-thinking approach to every project — from brand identity to complex web applications.'),
  ('home','about','name','Arik'),
  ('home','about','title_location','Designer & Developer · New York'),
  ('home','contact','email','hello@arik.design'),
  ('home','contact','location','New York, NY'),
  ('home','contact','availability','Open to projects'),
  ('home','contact','intro','Whether you have a project in mind or just want to explore possibilities, I''d love to hear from you. I typically respond within 24 hours.')
on conflict (page, section, key) do nothing;

insert into public.tech_stack (label, sort_order) values
  ('React',0), ('TypeScript',1), ('Next.js',2), ('Node.js',3), ('Tailwind',4)
on conflict do nothing;

insert into public.skills (label, icon, sort_order) values
  ('React','react',0), ('TypeScript','typescript',1), ('Node.js','node',2),
  ('Tailwind CSS','tailwind',3), ('Next.js','nextjs',4), ('Figma','figma',5),
  ('PostgreSQL','database',6), ('Three.js','threejs',7), ('Git','git',8), ('Motion','motion',9)
on conflict do nothing;

insert into public.services (number, title, description, tags, sort_order) values
  ('01','Brand Identity','Building cohesive visual identities that communicate your values and create lasting impressions across every touchpoint.', array['Logo Design','Visual Systems','Brand Guidelines'], 0),
  ('02','Web Design','Crafting high-performance websites that are as beautiful as they are functional, optimized for conversion and delight.', array['UI/UX','Interaction Design','Responsive'], 1),
  ('03','Product Design','Designing digital products that solve real problems with intuitive interfaces and seamless user experiences.', array['SaaS','Design Systems','Prototyping'], 2),
  ('04','Motion & 3D','Bringing ideas to life with motion graphics and 3D visuals that captivate audiences and elevate storytelling.', array['Animation','3D Rendering','Video'], 3)
on conflict do nothing;

insert into public.stats (value, label, sort_order) values
  ('5+','Years experience',0), ('48+','Projects completed',1),
  ('12+','Countries reached',2), ('99%','Client satisfaction',3)
on conflict do nothing;

insert into public.clients (name, sort_order) values
  ('Stripe',0), ('Linear',1), ('Vercel',2), ('Notion',3), ('Loom',4), ('Arc',5)
on conflict do nothing;

insert into public.social_links (platform, url, sort_order) values
  ('Twitter','#',0), ('LinkedIn','#',1), ('Dribbble','#',2), ('GitHub','#',3)
on conflict do nothing;

insert into public.projects (title, category, year, image_url, size, sort_order) values
  ('Luminary','Brand Identity · Web Design','2024','https://images.unsplash.com/photo-1614036634955-ae5e90f9b9eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080','large',0),
  ('Noir Studio','Product Design','2024','https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080','small',1),
  ('Velvet','E-commerce · Art Direction','2024','https://images.unsplash.com/photo-1667266543254-505cf5b16ec4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080','small',2),
  ('Forma','Web App · Design System','2023','https://images.unsplash.com/photo-1671159593357-ee577a598f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080','large',3)
on conflict do nothing;

-- No feedback / contact_messages / resume_items seeded on purpose —
-- feedback starts empty so the "hides itself" behavior is real from day
-- one, and resume items you add yourself once the admin panel is live.
