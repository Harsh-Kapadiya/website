import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { Download } from 'lucide-react';
import { useTable, useTableNoFallback } from '@/hooks/useTable';
import { Magnetic } from './interactions/Magnetic';

type ResumeItem = {
  id: string;
  kind: 'experience' | 'education' | 'skill';
  title: string;
  subtitle: string | null;
  period: string | null;
  description: string | null;
};

type ResumeFile = { id: string; file_url: string; label: string };

function Timeline({ title, items }: { title: string; items: ResumeItem[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="text-white/25 mb-6" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>
        {title.toUpperCase()}
      </p>
      <div className="space-y-8">
        {items.map((item) => (
          <div key={item.id} className="group relative pl-6 border-l border-white/10 hover:border-white/30 transition-colors duration-300">
            <span className="absolute -left-[3px] top-1.5 w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-white transition-colors duration-300" />
            <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-1 mb-1.5">
              <h4 className="text-white" style={{ fontSize: '1.0625rem', fontWeight: 500 }}>
                {item.title}
              </h4>
              {item.period && (
                <span className="text-white/30 shrink-0" style={{ fontSize: '0.8rem' }}>
                  {item.period}
                </span>
              )}
            </div>
            {item.subtitle && (
              <p className="text-white/45 mb-1.5" style={{ fontSize: '0.875rem' }}>
                {item.subtitle}
              </p>
            )}
            {item.description && (
              <p className="text-white/35 leading-relaxed" style={{ fontSize: '0.875rem' }}>
                {item.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Resume() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const { data: items, loading } = useTableNoFallback<ResumeItem>('resume_items', undefined, 'sort_order');
  const { data: files } = useTable<ResumeFile>('resume_files', []);

  const experience = items.filter((i) => i.kind === 'experience');
  const education = items.filter((i) => i.kind === 'education');
  const skills = items.filter((i) => i.kind === 'skill');
  const downloadFile = files[0];

  return (
    <section id="resume" className="bg-[#0a0a0a] px-8 md:px-12 py-32 border-t border-white/5">
      <div className="max-w-[1400px] mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6"
        >
          <div>
            <p className="text-white/30 mb-3" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>
              EXPERIENCE
            </p>
            <h2 className="text-white tracking-tight" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 500, letterSpacing: '-0.03em' }}>
              Resume
            </h2>
          </div>

          {downloadFile && (
            <Magnetic strength={0.3}>
              <a
                href={downloadFile.file_url}
                download
                data-cursor="hover"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-[#0a0a0a] hover:bg-white/85 transition-colors duration-300"
                style={{ fontSize: '0.875rem', fontWeight: 500 }}
              >
                <Download size={15} />
                {downloadFile.label}
              </a>
            </Magnetic>
          )}
        </motion.div>

        {!loading && items.length === 0 ? (
          <p className="text-white/30" style={{ fontSize: '0.9375rem' }}>
            Resume details go here — add experience, education, and skills from the admin panel.
          </p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <Timeline title="Experience" items={experience} />
            <Timeline title="Education" items={education} />
            <Timeline title="Skills" items={skills} />
          </div>
        )}
      </div>
    </section>
  );
}
