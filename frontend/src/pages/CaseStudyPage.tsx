import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { useTable } from '@/hooks/useTable';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useJsonLd } from '@/hooks/useJsonLd';
import { PROJECTS, type Project } from '@/lib/fallbacks';
import { imageUrl, safeHref } from '@/lib/safeUrl';
import { projectAlt } from '@/components/Work';
import { CtaBanner } from '@/components/CtaBanner';
import { NotFoundPage } from './NotFoundPage';

const SECTIONS = [
  ['overview', 'Overview'],
  ['challenge', 'The challenge'],
  ['solution', 'The solution'],
  ['results', 'Results'],
] as const;

export function CaseStudyPage() {
  const { slug } = useParams();
  const { data: projects, loading } = useTable<Project>('projects', PROJECTS);
  const index = projects.findIndex((p) => p.slug === slug);
  const project = projects[index];
  const cover = imageUrl(project?.image_url);

  usePageMeta({
    title: project ? `${project.title} — case study` : 'Case study',
    description: project?.overview || (project ? `${project.title}: a ${project.category} project by Harsh Kapadiya.` : 'Case study by Harsh Kapadiya.'),
    image: cover || undefined,
  });
  useJsonLd(
    'case-study',
    project && {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: project.title,
      genre: project.category,
      dateCreated: project.year,
      ...(cover ? { image: cover } : {}),
      ...(project.overview ? { abstract: project.overview } : {}),
      creator: { '@type': 'Person', name: 'Harsh Kapadiya' },
    }
  );

  if (loading) return <section className="min-h-[60vh]" aria-busy="true" />;
  if (!project) return <NotFoundPage />;

  const prev = projects[(index - 1 + projects.length) % projects.length];
  const next = projects[(index + 1) % projects.length];
  const written = SECTIONS.filter(([key]) => project[key]);

  return (
    <>
      <article className="px-6 md:px-12 pt-12 pb-24">
        <div className="max-w-[1100px] mx-auto">
          <p className="text-white/50 text-xs tracking-[0.1em] uppercase mb-4">
            {project.category} · {project.year}
          </p>
          <h1 className="text-white font-medium tracking-[-0.04em] leading-[1] mb-10" style={{ fontSize: 'clamp(2.75rem, 7vw, 6rem)' }}>
            {project.title}
          </h1>

          {cover && <img src={cover} alt={projectAlt(project)} className="w-full aspect-[16/9] object-cover rounded-2xl mb-16" />}

          {written.length ? (
            <div className="grid md:grid-cols-[220px_1fr] gap-x-12 gap-y-12">
              {written.map(([key, label]) => (
                <div key={key} className="contents">
                  <h2 className="text-white/50 text-xs tracking-[0.1em] uppercase pt-1">{label}</h2>
                  <p className="text-white/80 text-lg leading-relaxed whitespace-pre-line">{project[key]}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/60 text-lg">The full write-up for this project is on its way. <Link to="/contact" className="text-white underline underline-offset-4">Ask me about it</Link>.</p>
          )}

          {project.gallery && project.gallery.length > 0 && (
            <div className="grid md:grid-cols-2 gap-4 mt-16">
              {project.gallery.map(imageUrl).filter(Boolean).map((src, i) => (
                <img key={src} src={src} alt={`${project.title} — detail ${i + 1}`} loading="lazy" className="w-full rounded-2xl object-cover" />
              ))}
            </div>
          )}

          {project.link_url && (
            <a href={safeHref(project.link_url)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-12 px-6 py-3 rounded-full border border-white/20 text-white text-sm hover:bg-white hover:text-[#0a0a0a] transition-colors">
              Visit the live project <ArrowUpRight size={15} aria-hidden />
            </a>
          )}

          {projects.length > 1 && (
            <nav aria-label="More case studies" className="grid grid-cols-2 gap-4 mt-20 pt-10 border-t border-white/10">
              <Link to={`/work/${prev.slug}`} className="group">
                <span className="flex items-center gap-1.5 text-white/50 text-xs mb-2"><ArrowLeft size={13} aria-hidden /> Previous</span>
                <span className="text-white text-lg group-hover:text-white/70 transition-colors">{prev.title}</span>
              </Link>
              <Link to={`/work/${next.slug}`} className="group text-right">
                <span className="flex items-center justify-end gap-1.5 text-white/50 text-xs mb-2">Next <ArrowRight size={13} aria-hidden /></span>
                <span className="text-white text-lg group-hover:text-white/70 transition-colors">{next.title}</span>
              </Link>
            </nav>
          )}
        </div>
      </article>
      <CtaBanner heading="Want results" accent="like these?" />
    </>
  );
}
