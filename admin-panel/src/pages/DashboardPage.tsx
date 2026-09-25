import { useState } from 'react';
import { LogOut, ExternalLink } from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { ContentBlocksEditor } from '@/components/ContentBlocksEditor';
import { TableEditor } from '@/components/TableEditor';
import { FeedbackModeration } from '@/components/FeedbackModeration';
import { ContactInbox } from '@/components/ContactInbox';
import { ResumeFileEditor } from '@/components/ResumeFileEditor';

const tabs = [
  'Page copy',
  'Nav links',
  'Tech stack',
  'Skills',
  'Services',
  'Projects',
  'Stats',
  'Clients',
  'Social links',
  'Resume items',
  'Resume file',
  'Feedback',
  'Inbox',
] as const;

type Tab = (typeof tabs)[number];

const SKILL_ICONS = ['react', 'typescript', 'node', 'tailwind', 'nextjs', 'figma', 'database', 'threejs', 'git', 'motion'];

export function DashboardPage() {
  const [tab, setTab] = useState<Tab>('Page copy');
  const { signOut } = useAdminAuth();

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <aside className="w-56 shrink-0 border-r border-white/8 p-6 hidden md:flex flex-col">
        <p className="text-white mb-8" style={{ fontSize: '1rem', fontWeight: 600 }}>
          HK <span className="text-white/30 font-normal">admin</span>
        </p>
        <nav className="flex flex-col gap-1 flex-1 overflow-y-auto">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`text-left px-3 py-2 rounded-lg transition-colors ${
                tab === t ? 'bg-white text-[#0a0a0a]' : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
              style={{ fontSize: '0.8125rem', fontWeight: tab === t ? 500 : 400 }}
            >
              {t}
            </button>
          ))}
        </nav>
        <div className="flex flex-col gap-1 pt-4 border-t border-white/8">
          <a
            href={import.meta.env.VITE_SITE_URL || '/'}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors"
            style={{ fontSize: '0.8125rem' }}
          >
            <ExternalLink size={13} /> View site
          </a>
          <button
            onClick={signOut}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors text-left"
            style={{ fontSize: '0.8125rem' }}
          >
            <LogOut size={13} /> Sign out
          </button>
        </div>
      </aside>

      <div className="md:hidden fixed top-0 left-0 right-0 z-20 bg-[#0a0a0a] border-b border-white/8 p-4">
        <select
          value={tab}
          onChange={(e) => setTab(e.target.value as Tab)}
          className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white"
          style={{ fontSize: '0.875rem' }}
        >
          {tabs.map((t) => (
            <option key={t} value={t} className="bg-[#0a0a0a]">
              {t}
            </option>
          ))}
        </select>
      </div>

      <main className="flex-1 p-6 md:p-10 pt-24 md:pt-10 max-w-4xl">
        {tab === 'Page copy' && <ContentBlocksEditor />}

        {tab === 'Nav links' && (
          <TableEditor
            table="nav_links"
            title="Navigation"
            hint="Order here controls order in the navbar. Path must start with / and match a real route (e.g. /work)."
            orderBy="sort_order"
            fields={[
              { key: 'label', label: 'Label', type: 'text', placeholder: 'Work' },
              { key: 'path', label: 'Path', type: 'text', placeholder: '/work' },
            ]}
            emptyRow={{ label: 'New link', path: '/' }}
          />
        )}

        {tab === 'Tech stack' && (
          <TableEditor
            table="tech_stack"
            title="Hero tech stack pills"
            orderBy="sort_order"
            fields={[{ key: 'label', label: 'Label', type: 'text', placeholder: 'React' }]}
            emptyRow={{ label: 'New skill' }}
          />
        )}

        {tab === 'Skills' && (
          <TableEditor
            table="skills"
            title="Skills & tools grid"
            hint="Icon must match one of the built-in keys the frontend knows how to render."
            orderBy="sort_order"
            fields={[
              { key: 'label', label: 'Label', type: 'text', placeholder: 'React' },
              { key: 'icon', label: 'Icon', type: 'select', options: SKILL_ICONS },
            ]}
            emptyRow={{ label: 'New skill', icon: 'react' }}
          />
        )}

        {tab === 'Services' && (
          <TableEditor
            table="services"
            title="Services"
            orderBy="sort_order"
            fields={[
              { key: 'number', label: 'Number', type: 'text', placeholder: '01' },
              { key: 'title', label: 'Title', type: 'text' },
              { key: 'description', label: 'Description', type: 'textarea' },
              { key: 'tags', label: 'Tags', type: 'tags' },
            ]}
            emptyRow={{ number: '0X', title: 'New service', description: '', tags: [] }}
          />
        )}

        {tab === 'Projects' && (
          <TableEditor
            table="projects"
            title="Work / projects"
            hint="image_url can point to Supabase Storage or any public image URL."
            orderBy="sort_order"
            fields={[
              { key: 'title', label: 'Title', type: 'text' },
              { key: 'category', label: 'Category', type: 'text' },
              { key: 'year', label: 'Year', type: 'text' },
              { key: 'image_url', label: 'Image URL', type: 'text' },
              { key: 'link_url', label: 'Link (optional)', type: 'text' },
              { key: 'size', label: 'Card size', type: 'select', options: ['large', 'small'] },
            ]}
            emptyRow={{ title: 'New project', category: '', year: String(new Date().getFullYear()), image_url: '', size: 'small' }}
          />
        )}

        {tab === 'Stats' && (
          <TableEditor
            table="stats"
            title="About — stats grid"
            orderBy="sort_order"
            fields={[
              { key: 'value', label: 'Value', type: 'text', placeholder: '48+' },
              { key: 'label', label: 'Label', type: 'text', placeholder: 'Projects completed' },
            ]}
            emptyRow={{ value: '0', label: 'New stat' }}
          />
        )}

        {tab === 'Clients' && (
          <TableEditor
            table="clients"
            title="About — trusted by"
            orderBy="sort_order"
            fields={[{ key: 'name', label: 'Client name', type: 'text' }]}
            emptyRow={{ name: 'New client' }}
          />
        )}

        {tab === 'Social links' && (
          <TableEditor
            table="social_links"
            title="Social links"
            orderBy="sort_order"
            fields={[
              { key: 'platform', label: 'Platform', type: 'text', placeholder: 'GitHub' },
              { key: 'url', label: 'URL', type: 'text' },
            ]}
            emptyRow={{ platform: 'New platform', url: '#' }}
          />
        )}

        {tab === 'Resume items' && (
          <TableEditor
            table="resume_items"
            title="Resume — experience, education & skills"
            orderBy="sort_order"
            fields={[
              { key: 'kind', label: 'Type', type: 'select', options: ['experience', 'education', 'skill'] },
              { key: 'title', label: 'Title', type: 'text', placeholder: 'Senior Product Designer' },
              { key: 'subtitle', label: 'Subtitle', type: 'text', placeholder: 'Company name' },
              { key: 'period', label: 'Period', type: 'text', placeholder: '2022 — Present' },
              { key: 'description', label: 'Description', type: 'textarea' },
            ]}
            emptyRow={{ kind: 'experience', title: 'New entry', subtitle: '', period: '', description: '' }}
          />
        )}

        {tab === 'Resume file' && <ResumeFileEditor />}
        {tab === 'Feedback' && <FeedbackModeration />}
        {tab === 'Inbox' && <ContactInbox />}
      </main>
    </div>
  );
}
