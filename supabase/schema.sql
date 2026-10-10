-- ============================================================
-- Harsh Kapadiya Portfolio — Supabase schema
-- Supabase Dashboard → SQL Editor → New query → paste → Run.
-- Safe to re-run: tables/indexes use IF NOT EXISTS, policies are
-- dropped and recreated, and every seed has a real unique key so
-- ON CONFLICT DO NOTHING never duplicates rows (and never overwrites
-- edits you made in the admin panel).
-- ============================================================

create extension if not exists pgcrypto;

-- ---------- ADMIN ACCESS ----------
create table if not exists public.admins (
  id uuid primary key references auth.users(id) on delete cascade
);

-- Hardened: pinned search_path, schema-qualified, only callable by
-- signed-in users. RLS policies below are the real security boundary.
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (select 1 from public.admins where id = (select auth.uid()));
$$;
revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- updated_at maintenance
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- CONTENT ----------
create table if not exists public.nav_links (
  id uuid primary key default gen_random_uuid(),
  label text not null check (char_length(label) between 1 and 40),
  path text not null check (path ~ '^/'),
  sort_order int not null default 0
);

create table if not exists public.content_blocks (
  id uuid primary key default gen_random_uuid(),
  page text not null,
  section text not null,
  key text not null,
  value text not null default '' check (char_length(value) <= 5000),
  updated_at timestamptz not null default now(),
  unique (page, section, key)
);

create table if not exists public.tech_stack (
  id uuid primary key default gen_random_uuid(),
  label text not null check (char_length(label) between 1 and 40),
  sort_order int not null default 0
);

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  label text not null check (char_length(label) between 1 and 40),
  icon text not null default 'react',
  sort_order int not null default 0
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  number text not null,
  title text not null check (char_length(title) between 1 and 80),
  description text not null check (char_length(description) <= 600),
  tags text[] not null default '{}',
  sort_order int not null default 0
);

-- Projects double as case studies: fill slug + overview/challenge/
-- solution/results in the admin panel and /work/<slug> gets a page.
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 80),
  category text not null,
  year text not null,
  image_url text not null check (image_url ~ '^https?://'),
  size text not null default 'small' check (size in ('large', 'small')),
  link_url text check (link_url is null or link_url = '' or link_url ~ '^https?://'),
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  overview text,
  challenge text,
  solution text,
  results text,
  gallery text[] not null default '{}',
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
  url text not null check (url ~ '^(https?://|mailto:|#$)'),
  sort_order int not null default 0
);

create table if not exists public.resume_items (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('experience', 'education', 'skill')),
  title text not null,
  subtitle text,
  period text,
  description text,
  sort_order int not null default 0
);

create table if not exists public.resume_files (
  id uuid primary key default gen_random_uuid(),
  file_url text not null check (file_url ~ '^https?://'),
  label text not null default 'Download Resume',
  updated_at timestamptz not null default now()
);

-- ---------- SUBMISSIONS (written only by the backend) ----------
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  author text not null check (char_length(author) between 1 and 100),
  role text check (role is null or char_length(role) <= 120),
  avatar_url text,
  quote text not null check (char_length(quote) between 1 and 1000),
  rating int not null default 5 check (rating between 1 and 5),
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  email text not null check (char_length(email) <= 254),
  message text not null check (char_length(message) between 1 and 5000),
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Natural keys — these are what make the seeds below truly idempotent.
create unique index if not exists nav_links_path_key on public.nav_links (path);
create unique index if not exists tech_stack_label_key on public.tech_stack (label);
create unique index if not exists skills_label_key on public.skills (label);
create unique index if not exists services_title_key on public.services (title);
create unique index if not exists projects_slug_key on public.projects (slug);
create unique index if not exists stats_label_key on public.stats (label);
create unique index if not exists clients_name_key on public.clients (name);
create unique index if not exists social_links_platform_key on public.social_links (platform);

drop trigger if exists content_blocks_touch on public.content_blocks;
create trigger content_blocks_touch before update on public.content_blocks
  for each row execute function public.touch_updated_at();
drop trigger if exists resume_files_touch on public.resume_files;
create trigger resume_files_touch before update on public.resume_files
  for each row execute function public.touch_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- Public reads per table; every write requires an authenticated
-- user whose id is in public.admins. Frontend route guards are UX
-- only — these policies are the actual boundary.
-- ============================================================
alter table public.admins enable row level security;
alter table public.nav_links enable row level security;
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

-- New Supabase projects (since 2026-05-30) no longer expose tables to the
-- API by default — these grants are required. RLS still decides which rows.
grant usage on schema public to anon, authenticated, service_role;
grant select on public.nav_links, public.content_blocks, public.tech_stack, public.skills,
  public.services, public.projects, public.stats, public.clients, public.social_links,
  public.resume_items, public.resume_files, public.feedback to anon;
grant select, insert, update, delete on all tables in schema public to authenticated, service_role;

drop policy if exists "self read own admin row" on public.admins;
create policy "self read own admin row" on public.admins
  for select to authenticated using (id = (select auth.uid()));

do $$
declare t text;
begin
  foreach t in array array['nav_links','content_blocks','tech_stack','skills','services',
                           'projects','stats','clients','social_links','resume_items','resume_files']
  loop
    execute format('drop policy if exists "public read %1$s" on public.%1$I', t);
    execute format('create policy "public read %1$s" on public.%1$I for select using (true)', t);
    execute format('drop policy if exists "admin write %1$s" on public.%1$I', t);
    execute format('create policy "admin write %1$s" on public.%1$I for all to authenticated '
                   'using ((select public.is_admin())) with check ((select public.is_admin()))', t);
  end loop;
end $$;

drop policy if exists "public read approved feedback" on public.feedback;
create policy "public read approved feedback" on public.feedback
  for select using (approved = true);
drop policy if exists "admin read feedback" on public.feedback;
create policy "admin read feedback" on public.feedback
  for select to authenticated using ((select public.is_admin()));
drop policy if exists "admin manage feedback" on public.feedback;
create policy "admin manage feedback" on public.feedback
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "admin delete feedback" on public.feedback;
create policy "admin delete feedback" on public.feedback
  for delete to authenticated using ((select public.is_admin()));

drop policy if exists "admin read contact_messages" on public.contact_messages;
create policy "admin read contact_messages" on public.contact_messages
  for select to authenticated using ((select public.is_admin()));
drop policy if exists "admin update contact_messages" on public.contact_messages;
create policy "admin update contact_messages" on public.contact_messages
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "admin delete contact_messages" on public.contact_messages;
create policy "admin delete contact_messages" on public.contact_messages
  for delete to authenticated using ((select public.is_admin()));

-- ============================================================
-- SEED DATA (starter copy — edit everything from the admin panel)
-- ============================================================
insert into public.content_blocks (page, section, key, value) values
  ('global','brand','logo_text','HK.'),
  ('global','brand','copyright_name','Harsh Kapadiya'),
  ('home','hero','badge_text','Available for freelance & full-time roles'),
  ('home','hero','badge_pill','Open to remote'),
  ('home','hero','bio','Full-stack web developer specializing in React, TypeScript & Node.js. I turn complex problems into clean, performant products.'),
  ('home','hero','cta_primary','View my work'),
  ('home','hero','cta_secondary','Hire me'),
  ('home','hero','spline_url','https://my.spline.design/glassknotvortex-rLUuC5Mcco8xm25vDzEAdS2s/'),
  ('home','hero','poster_url','/img/hero-poster.webp'),
  ('home','services','intro','End-to-end design solutions tailored to ambitious brands and startups.'),
  ('home','work','heading','Projects I''m proud of'),
  ('home','work','stat_tagline','Happy clients across 12+ countries'),
  ('home','work','stat_value','48+'),
  ('home','work','stat_caption','Projects delivered since 2019'),
  ('home','about','eyebrow','ABOUT ME'),
  ('home','about','bio_1','I''m Harsh Kapadiya — a multidisciplinary designer and developer who believes great design is inseparable from great function. I work at the intersection of aesthetics and engineering to create digital experiences that are both beautiful and meaningful.'),
  ('home','about','name','Harsh Kapadiya'),
  ('home','about','title_location','Designer & Developer · Haryana, India'),
  ('home','about','photo_url','/img/harsh.jpg'),
  ('home','contact','email','harsh2021800@gmail.com'),
  ('home','contact','location','Haryana, India'),
  ('home','contact','availability','Open to projects'),
  ('home','contact','intro','Whether you have a project in mind or just want to explore possibilities, I''d love to hear from you.'),
  ('home','contact','response_time','I reply within 24 hours')
on conflict (page, section, key) do nothing;

insert into public.nav_links (label, path, sort_order) values
  ('Work','/work',0), ('Services','/services',1), ('About','/about',2),
  ('Resume','/resume',3), ('Contact','/contact',4)
on conflict (path) do nothing;

insert into public.tech_stack (label, sort_order) values
  ('React',0), ('TypeScript',1), ('Next.js',2), ('Node.js',3), ('Tailwind',4)
on conflict (label) do nothing;

insert into public.skills (label, icon, sort_order) values
  ('React','react',0), ('TypeScript','typescript',1), ('Node.js','node',2),
  ('Tailwind CSS','tailwind',3), ('Next.js','nextjs',4), ('Figma','figma',5),
  ('PostgreSQL','database',6), ('Three.js','threejs',7), ('Git','git',8), ('Motion','motion',9)
on conflict (label) do nothing;

insert into public.services (number, title, description, tags, sort_order) values
  ('01','Brand Identity','Building cohesive visual identities that communicate your values and create lasting impressions across every touchpoint.', array['Logo Design','Visual Systems','Brand Guidelines'], 0),
  ('02','Web Design','Crafting high-performance websites that are as beautiful as they are functional, optimized for conversion and delight.', array['UI/UX','Interaction Design','Responsive'], 1),
  ('03','Product Design','Designing digital products that solve real problems with intuitive interfaces and seamless user experiences.', array['SaaS','Design Systems','Prototyping'], 2),
  ('04','Motion & 3D','Bringing ideas to life with motion graphics and 3D visuals that captivate audiences and elevate storytelling.', array['Animation','3D Rendering','Video'], 3)
on conflict (title) do nothing;

-- Stats and clients are not seeded: add only real ones in the admin panel
-- (each section stays hidden until it has at least one row).

insert into public.social_links (platform, url, sort_order) values
  ('LinkedIn','https://www.linkedin.com/in/harsh-kapadiya-0a25b1325/',0), ('GitHub','https://github.com/Harsh-Kapadiya',1),
  ('X','https://x.com/Harsh2021800',2), ('LeetCode','https://leetcode.com/u/Harsh_kapadiya/',3), ('Instagram','https://www.instagram.com/harsh._kapadiya/',4)
on conflict (platform) do nothing;

insert into public.projects (title, category, year, image_url, size, slug, overview, challenge, solution, results, sort_order) values
  ('Luminary','Brand Identity · Web Design','2024','https://images.unsplash.com/photo-1614036634955-ae5e90f9b9eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080','large','luminary',
   'A full brand identity and web presence for a creative studio repositioning itself for larger clients.',
   'The existing brand felt dated and did not reflect the caliber of work the studio was producing.',
   'Rebuilt the identity from the ground up — new mark, type system, and a component-driven website that scales with their content.',
   null, 0),
  ('Noir Studio','Product Design','2024','https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080','small','noir-studio',null,null,null,null,1),
  ('Velvet','E-commerce · Art Direction','2024','https://images.unsplash.com/photo-1667266543254-505cf5b16ec4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080','small','velvet',null,null,null,null,2),
  ('Forma','Web App · Design System','2023','https://images.unsplash.com/photo-1671159593357-ee577a598f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080','large','forma',null,null,null,null,3)
on conflict (slug) do nothing;

-- No feedback is seeded on purpose: the testimonials section only ever
-- shows real, approved client reviews, and stays hidden until there is one.

-- ---------- FRIDAY (AI CHAT) FAQ ----------
-- Questions answered in Harsh's own words; the chat assistant uses them.
-- Admin-only: the public site never reads this table (the backend uses the secret key).
-- Self-contained — on an existing project, run just this block in the SQL Editor.
create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null check (char_length(question) between 1 and 300),
  answer text not null default '' check (char_length(answer) <= 2000),
  sort_order int not null default 0
);
alter table public.faqs enable row level security;
grant select, insert, update, delete on public.faqs to authenticated, service_role;
drop policy if exists "admin manage faqs" on public.faqs;
create policy "admin manage faqs" on public.faqs for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
