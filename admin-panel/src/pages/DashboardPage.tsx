import { useState } from 'react';
import { LogOut, ExternalLink } from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { ContentBlocksEditor } from '@/components/ContentBlocksEditor';
import { TableEditor } from '@/components/TableEditor';
import { FeedbackModeration } from '@/components/FeedbackModeration';
import { ContactInbox } from '@/components/ContactInbox';
import { ResumeFileEditor } from '@/components/ResumeFileEditor';

const SKILL_ICONS = ['react', 'typescript', 'node', 'tailwind', 'nextjs', 'figma', 'database', 'threejs', 'git', 'motion'];
// Natural keys are unique in the database, so "Add" needs a unique placeholder.
const uid = () => Date.now().toString(36).slice(-5);

const TABS = {
  'Page copy': () => <ContentBlocksEditor />,
  'Case studies': () => (
    <TableEditor
      table="projects"
      title="Projects & case studies"
      hint="Every project gets a page at /work/<slug>. Fill Overview / Challenge / Solution / Results to turn it into a full case study."
      newRow={() => ({ title: 'New project', category: 'Web Design', year: String(new Date().getFullYear()), image_url: 'https://', size: 'small', slug: `new-project-${uid()}` })}
      fields={[
        { key: 'title', label: 'Title' },
        { key: 'slug', label: 'URL slug', hint: 'lowercase-with-dashes → /work/your-slug' },
        { key: 'category', label: 'Category' },
        { key: 'year', label: 'Year' },
        { key: 'image_url', label: 'Cover image URL', hint: 'A direct https:// image link, or a Google Drive share link (set sharing to "Anyone with the link")' },
        { key: 'link_url', label: 'Live project link (optional)' },
        { key: 'size', label: 'Card size', type: 'select', options: ['large', 'small'] },
        { key: 'overview', label: 'Overview', type: 'textarea' },
        { key: 'challenge', label: 'The challenge', type: 'textarea' },
        { key: 'solution', label: 'The solution', type: 'textarea' },
        { key: 'results', label: 'Results', type: 'textarea', placeholder: 'Real, measurable outcomes build the most trust' },
        { key: 'gallery', label: 'Gallery image URLs', type: 'lines', placeholder: 'One image link per line (https:// or a Google Drive share link)' },
      ]}
    />
  ),
  Services: () => (
    <TableEditor
      table="services"
      title="Services"
      newRow={() => ({ number: '0X', title: `New service ${uid()}`, description: '', tags: [] })}
      fields={[
        { key: 'number', label: 'Number' },
        { key: 'title', label: 'Title' },
        { key: 'description', label: 'Description', type: 'textarea' },
        { key: 'tags', label: 'Tags', type: 'tags' },
      ]}
    />
  ),
  Skills: () => (
    <TableEditor
      table="skills"
      title="Skills & tools grid"
      newRow={() => ({ label: `New skill ${uid()}`, icon: 'react' })}
      fields={[
        { key: 'label', label: 'Label' },
        { key: 'icon', label: 'Icon', type: 'select', options: SKILL_ICONS },
      ]}
    />
  ),
  'Tech stack': () => (
    <TableEditor table="tech_stack" title="Hero tech pills" newRow={() => ({ label: `New ${uid()}` })} fields={[{ key: 'label', label: 'Label' }]} />
  ),
  Stats: () => (
    <TableEditor
      table="stats"
      title="About — stats"
      newRow={() => ({ value: '0', label: `New stat ${uid()}` })}
      fields={[{ key: 'value', label: 'Value', placeholder: '48+' }, { key: 'label', label: 'Label' }]}
    />
  ),
  Clients: () => <TableEditor table="clients" title="About — trusted by" newRow={() => ({ name: `New client ${uid()}` })} fields={[{ key: 'name', label: 'Client name' }]} />,
  'Nav links': () => (
    <TableEditor
      table="nav_links"
      title="Navigation"
      hint="Shown in the navbar and footer. Path must match a real page, e.g. /work."
      newRow={() => ({ label: 'New link', path: `/new-${uid()}` })}
      fields={[{ key: 'label', label: 'Label' }, { key: 'path', label: 'Path', placeholder: '/work' }]}
    />
  ),
  'Social links': () => (
    <TableEditor
      table="social_links"
      title="Social links"
      hint="Also used in the site's structured data (sameAs) — use full https:// profile URLs."
      newRow={() => ({ platform: `Platform ${uid()}`, url: '#' })}
      fields={[{ key: 'platform', label: 'Platform' }, { key: 'url', label: 'URL' }]}
    />
  ),
  'Resume items': () => (
    <TableEditor
      table="resume_items"
      title="Resume — experience, education, skills"
      newRow={() => ({ kind: 'experience', title: 'New entry' })}
      fields={[
        { key: 'kind', label: 'Type', type: 'select', options: ['experience', 'education', 'skill'] },
        { key: 'title', label: 'Title' },
        { key: 'subtitle', label: 'Subtitle / company' },
        { key: 'period', label: 'Period', placeholder: '2024 — Present' },
        { key: 'description', label: 'Description', type: 'textarea' },
      ]}
    />
  ),
  'Resume file': () => <ResumeFileEditor />,
  'Friday FAQ': () => (
    <TableEditor
      table="faqs"
      title="Friday FAQ — answers for the AI chat"
      hint="Friday answers these questions in your words (along with everything else on the site). Not shown on the website, but Friday will tell any visitor, so never add private details like your phone number or address."
      newRow={() => ({ question: `New question ${uid()}?`, answer: '' })}
      fields={[
        { key: 'question', label: 'Question', placeholder: 'Are you open to full-time roles?' },
        { key: 'answer', label: 'Your answer', type: 'textarea', placeholder: 'Yes — I graduate in 2027 and…' },
      ]}
    />
  ),
  Reviews: () => <FeedbackModeration />,
  Inbox: () => <ContactInbox />,
} as const;

type Tab = keyof typeof TABS;

export function DashboardPage() {
  const [tab, setTab] = useState<Tab>('Page copy');
  const { signOut } = useAdminAuth();
  const Panel = TABS[tab];

  return (
    <div className="min-h-screen flex">
      <aside className="w-56 shrink-0 border-r border-white/10 p-6 hidden md:flex flex-col sticky top-0 h-screen">
        <p className="text-white mb-8 font-semibold">HK <span className="text-white/30 font-normal">admin</span></p>
        <nav className="flex flex-col gap-1 flex-1 overflow-y-auto" aria-label="Sections">
          {(Object.keys(TABS) as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              aria-current={tab === t ? 'page' : undefined}
              className={`text-left px-3 py-2 rounded-lg text-[0.8125rem] transition-colors ${tab === t ? 'bg-white text-[#0a0a0a] font-medium' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
            >
              {t}
            </button>
          ))}
        </nav>
        <div className="flex flex-col gap-1 pt-4 border-t border-white/10">
          <a href={import.meta.env.VITE_SITE_URL || '/'} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 text-[0.8125rem]">
            <ExternalLink size={13} aria-hidden /> View site
          </a>
          <button onClick={signOut} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 text-left text-[0.8125rem]">
            <LogOut size={13} aria-hidden /> Sign out
          </button>
        </div>
      </aside>

      <div className="md:hidden fixed top-0 inset-x-0 z-20 bg-[#0a0a0a] border-b border-white/10 p-4 flex gap-3">
        <label htmlFor="tab-select" className="sr-only">Section</label>
        <select id="tab-select" value={tab} onChange={(e) => setTab(e.target.value as Tab)} className="flex-1 bg-white/[0.04] border border-white/15 rounded-lg px-3 py-2 text-white text-sm">
          {(Object.keys(TABS) as Tab[]).map((t) => <option key={t} value={t} className="bg-[#0a0a0a]">{t}</option>)}
        </select>
        <button onClick={signOut} aria-label="Sign out" className="px-3 rounded-lg border border-white/15 text-white/70"><LogOut size={15} aria-hidden /></button>
      </div>

      <main className="flex-1 p-6 md:p-10 pt-24 md:pt-10 max-w-4xl">
        <Panel />
      </main>
    </div>
  );
}
