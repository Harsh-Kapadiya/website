import { Download, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTable } from '@/hooks/useTable';
import { safeHref } from '@/lib/safeUrl';
import { Magnetic } from './interactions/Magnetic';

type Item = { id: string; kind: 'experience' | 'education' | 'skill'; title: string; subtitle: string | null; period: string | null; description: string | null };
type ResumeFile = { id: string; file_url: string; label: string };

function Timeline({ title, items }: { title: string; items: Item[] }) {
  if (!items.length) return null;
  return (
    <div>
      <h2 className="text-white/40 mb-6 text-xs tracking-[0.1em] uppercase">{title}</h2>
      <ol className="space-y-8">
        {items.map((i) => (
          <li key={i.id} className="group relative pl-6 border-l border-white/10 hover:border-white/30 transition-colors">
            <span aria-hidden className="absolute -left-[3px] top-1.5 w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-white transition-colors" />
            <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-1 mb-1.5">
              <h3 className="text-white text-[1.0625rem] font-medium">{i.title}</h3>
              {i.period && <span className="text-white/50 shrink-0 text-[0.8rem]">{i.period}</span>}
            </div>
            {i.subtitle && <p className="text-white/60 mb-1.5 text-sm">{i.subtitle}</p>}
            {i.description && <p className="text-white/50 leading-relaxed text-sm">{i.description}</p>}
          </li>
        ))}
      </ol>
    </div>
  );
}

export function Resume() {
  const { data: items, loading } = useTable<Item>('resume_items', []);
  const { data: files } = useTable<ResumeFile>('resume_files', [], { orderBy: 'updated_at', ascending: false });
  const file = files[0];

  return (
    <section id="resume" className="px-6 md:px-12 py-32">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <p className="text-white/40 mb-3 text-xs tracking-[0.1em]">EXPERIENCE</p>
            <h1 className="text-white font-medium tracking-[-0.03em]" style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}>Resume</h1>
          </div>
          {file && (
            <Magnetic strength={0.3}>
              <a href={safeHref(file.file_url)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-[#0a0a0a] text-sm font-medium hover:bg-white/85 transition-colors">
                <Download size={15} aria-hidden /> {file.label}
              </a>
            </Magnetic>
          )}
        </div>

        {!loading && !items.length ? (
          <p className="text-white/50 text-[0.9375rem]">My full resume is being updated — in the meantime, <Link to="/contact" className="text-white underline underline-offset-4">ask me for a copy</Link>.</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <Timeline title="Experience" items={items.filter((i) => i.kind === 'experience')} />
            <Timeline title="Education" items={items.filter((i) => i.kind === 'education')} />
            <Timeline title="Skills" items={items.filter((i) => i.kind === 'skill')} />
          </div>
        )}

        <Link to="/work" className="inline-flex items-center gap-1.5 mt-16 text-white/60 hover:text-white transition-colors text-sm">
          See the projects behind this <ArrowUpRight size={14} aria-hidden />
        </Link>
      </div>
    </section>
  );
}
