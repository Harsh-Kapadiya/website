import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTable } from '@/hooks/useTable';
import { useContentBlocks } from '@/hooks/useContentBlocks';
import { TiltCard } from './interactions/TiltCard';

type Project = {
  id: string;
  title: string;
  category: string;
  year: string;
  image_url: string;
  size: 'large' | 'small';
  link_url?: string | null;
};

const fallbackProjects: Project[] = [
  { id: '1', title: 'Luminary', category: 'Brand Identity · Web Design', year: '2024', image_url: 'https://images.unsplash.com/photo-1614036634955-ae5e90f9b9eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', size: 'large' },
  { id: '2', title: 'Noir Studio', category: 'Product Design', year: '2024', image_url: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', size: 'small' },
  { id: '3', title: 'Velvet', category: 'E-commerce · Art Direction', year: '2024', image_url: 'https://images.unsplash.com/photo-1667266543254-505cf5b16ec4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', size: 'small' },
  { id: '4', title: 'Forma', category: 'Web App · Design System', year: '2023', image_url: 'https://images.unsplash.com/photo-1671159593357-ee577a598f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', size: 'large' },
];

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      style={{ aspectRatio: project.size === 'large' ? '4/3' : '3/4' }}
    >
      <TiltCard max={5} className="group h-full w-full overflow-hidden rounded-2xl cursor-pointer" data-cursor="hover">
        <img
          src={project.image_url}
          alt={project.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
        <div className="absolute inset-0 p-7 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-white/70" style={{ fontSize: '0.75rem' }}>
              {project.year}
            </span>
            <div className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
              <ArrowUpRight size={16} className="text-white" />
            </div>
          </div>
          <div>
            <p className="text-white/50 mb-1.5" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
              {project.category}
            </p>
            <h3 className="text-white" style={{ fontSize: '1.375rem', fontWeight: 500, letterSpacing: '-0.02em' }}>
              {project.title}
            </h3>
          </div>
        </div>
      </TiltCard>
    </motion.div>
  );
}

export function Work({ compact = false }: { compact?: boolean }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const { data: allProjects } = useTable<Project>('projects', fallbackProjects);
  const { get } = useContentBlocks('home');
  const projects = compact ? allProjects.slice(0, 3) : allProjects;

  return (
    <section id="work" className="bg-[#0a0a0a] px-8 md:px-12 py-32">
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
              SELECTED WORK
            </p>
            <h2 className="text-white leading-tight tracking-tight" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 500, letterSpacing: '-0.03em' }}>
              {get('work', 'heading', "Projects I'm proud of")}
            </h2>
          </div>
          {compact && (
            <Link
              to="/work"
              data-cursor="hover"
              className="flex items-center gap-1.5 text-white/40 hover:text-white transition-colors duration-300 self-start md:self-auto"
              style={{ fontSize: '0.875rem' }}
            >
              View all work <ArrowUpRight size={14} />
            </Link>
          )}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects[0] && (
            <div className="lg:col-span-2">
              <ProjectCard project={projects[0]} index={0} />
            </div>
          )}
          {(projects[1] || projects[2]) && (
            <div className="grid grid-rows-2 gap-4">
              {projects[1] && <ProjectCard project={projects[1]} index={1} />}
              {projects[2] && <ProjectCard project={projects[2]} index={2} />}
            </div>
          )}
          <div className="lg:col-span-1 hidden lg:block">
            <StatCard get={get} />
          </div>
          {projects[3] && (
            <div className="lg:col-span-2">
              <ProjectCard project={projects[3]} index={3} />
            </div>
          )}
          {!compact &&
            projects.slice(4).map((p, i) => (
              <div key={p.id} className={p.size === 'large' ? 'lg:col-span-2' : ''}>
                <ProjectCard project={p} index={4 + i} />
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}

function StatCard({ get }: { get: (section: string, key: string, fallback: string) => string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay: 0.3 }}
      className="rounded-2xl border border-white/8 bg-white/3 p-8 h-full flex flex-col justify-between"
      style={{ minHeight: '240px' }}
    >
      <p className="text-white/30" style={{ fontSize: '0.8125rem' }}>
        {get('work', 'stat_tagline', 'Happy clients across 12+ countries')}
      </p>
      <div>
        <p className="text-white leading-none mb-2" style={{ fontSize: '5rem', fontWeight: 600, letterSpacing: '-0.04em' }}>
          {get('work', 'stat_value', '48+')}
        </p>
        <p className="text-white/30" style={{ fontSize: '0.8125rem' }}>
          {get('work', 'stat_caption', 'Projects delivered since 2019')}
        </p>
      </div>
    </motion.div>
  );
}
