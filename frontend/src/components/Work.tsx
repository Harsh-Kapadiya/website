import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTable } from '@/hooks/useTable';
import { useContentBlocks } from '@/hooks/useContentBlocks';
import { PROJECTS, type Project } from '@/lib/fallbacks';
import { TiltCard } from './interactions/TiltCard';
import { imageUrl } from '@/lib/safeUrl';

export function projectAlt(p: Pick<Project, 'title' | 'category'>) {
  return `${p.title} — ${p.category} project by Harsh Kapadiya`;
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const src = imageUrl(project.image_url);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: (index % 4) * 0.1, ease: [0.16, 1, 0.3, 1] }}
      style={{ aspectRatio: project.size === 'large' ? '4/3' : '3/4' }}
    >
      <Link to={`/work/${project.slug}`} className="block h-full" aria-label={`${project.title} case study`}>
        <TiltCard max={5} className="group h-full w-full overflow-hidden rounded-2xl">
          {src && (
            <img
              src={src}
              alt={projectAlt(project)}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent opacity-70 group-hover:opacity-85 transition-opacity duration-500" />
          <div className="absolute inset-0 p-6 md:p-7 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-sm text-white/80 text-xs">{project.year}</span>
              <span className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                <ArrowUpRight size={16} aria-hidden />
              </span>
            </div>
            <div>
              <p className="text-white/70 mb-1.5 text-xs tracking-[0.05em]">{project.category}</p>
              <h3 className="text-white text-[1.375rem] font-medium tracking-[-0.02em]">{project.title}</h3>
            </div>
          </div>
        </TiltCard>
      </Link>
    </motion.div>
  );
}

function StatCard() {
  const { get } = useContentBlocks('home');
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 h-full min-h-60 flex flex-col justify-between">
      <p className="text-white/50 text-[0.8125rem]">{get('work', 'stat_tagline', 'Happy clients across 12+ countries')}</p>
      <div>
        <p className="text-white leading-none mb-2 text-[5rem] font-semibold tracking-[-0.04em]">{get('work', 'stat_value', '48+')}</p>
        <p className="text-white/50 text-[0.8125rem]">{get('work', 'stat_caption', 'Projects delivered since 2019')}</p>
      </div>
    </div>
  );
}

/** Home: first 3 projects + "view all". `page`: every project, heading as <h1>. */
export function Work({ page = false }: { page?: boolean }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const { data: all } = useTable<Project>('projects', PROJECTS);
  const { get } = useContentBlocks('home');
  const projects = page ? all : all.slice(0, 4);
  const Heading = page ? motion.h1 : motion.h2;

  return (
    <section id="work" className="px-6 md:px-12 py-32">
      <div className="max-w-[1400px] mx-auto">
        <div ref={ref} className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <p className="text-white/40 mb-3 text-xs tracking-[0.1em]">SELECTED WORK</p>
            <Heading
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              className="text-white font-medium leading-tight tracking-[-0.03em]"
              style={{ fontSize: page ? 'clamp(2.5rem, 6vw, 5rem)' : 'clamp(2rem, 4vw, 3.5rem)' }}
            >
              {get('work', 'heading', "Projects I'm proud of")}
            </Heading>
          </div>
          {!page && (
            <Link to="/work" className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors text-sm self-start md:self-auto">
              View all work <ArrowUpRight size={14} aria-hidden />
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects[0] && <div className="lg:col-span-2"><ProjectCard project={projects[0]} index={0} /></div>}
          {(projects[1] || projects[2]) && (
            <div className="grid gap-4">
              {projects[1] && <ProjectCard project={projects[1]} index={1} />}
              {projects[2] && <ProjectCard project={projects[2]} index={2} />}
            </div>
          )}
          <div className="hidden lg:block"><StatCard /></div>
          {projects.slice(3).map((p, i) => (
            <div key={p.id} className={p.size === 'large' ? 'lg:col-span-2' : ''}>
              <ProjectCard project={p} index={3 + i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
