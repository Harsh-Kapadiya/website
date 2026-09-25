import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import {
  Atom,
  FileCode2,
  Server,
  Paintbrush,
  Layers,
  PenTool,
  Database,
  Box,
  GitBranch,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { useTable } from '@/hooks/useTable';

type Skill = { id: string; label: string; icon: string };

const ICONS: Record<string, LucideIcon> = {
  react: Atom,
  typescript: FileCode2,
  node: Server,
  tailwind: Paintbrush,
  nextjs: Layers,
  figma: PenTool,
  database: Database,
  threejs: Box,
  git: GitBranch,
  motion: Sparkles,
};

const fallbackSkills: Skill[] = [
  { id: '1', label: 'React', icon: 'react' },
  { id: '2', label: 'TypeScript', icon: 'typescript' },
  { id: '3', label: 'Node.js', icon: 'node' },
  { id: '4', label: 'Tailwind CSS', icon: 'tailwind' },
  { id: '5', label: 'Next.js', icon: 'nextjs' },
  { id: '6', label: 'Figma', icon: 'figma' },
  { id: '7', label: 'PostgreSQL', icon: 'database' },
  { id: '8', label: 'Three.js', icon: 'threejs' },
  { id: '9', label: 'Git', icon: 'git' },
  { id: '10', label: 'Motion', icon: 'motion' },
];

function SkillCard({ skill, index }: { skill: Skill; index: number }) {
  const Icon = ICONS[skill.icon] ?? Atom;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
      data-cursor="hover"
      className="group relative flex flex-col items-center justify-center gap-3 rounded-2xl border border-white/8 bg-white/[0.02] py-8 px-4 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.05]"
    >
      {/* Glow — soft white bloom behind the icon, brightens on hover */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: 'radial-gradient(120px circle at 50% 38%, rgba(255,255,255,0.14), transparent 70%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ boxShadow: '0 0 40px 4px rgba(255,255,255,0.08)' }}
      />

      <Icon
        size={26}
        strokeWidth={1.5}
        className="relative text-white/40 group-hover:text-white group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.6)] transition-all duration-300"
      />
      <span className="relative text-white/45 group-hover:text-white/90 transition-colors duration-300 text-center" style={{ fontSize: '0.8125rem' }}>
        {skill.label}
      </span>
    </motion.div>
  );
}

export function Skills() {
  const headerRef = useRef(null);
  const inView = useInView(headerRef, { once: true, margin: '-80px' });
  const { data: skills } = useTable<Skill>('skills', fallbackSkills);

  return (
    <section className="bg-[#0a0a0a] px-8 md:px-12 py-32 border-t border-white/5">
      <div className="max-w-[1400px] mx-auto">
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="text-white/30 mb-3" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>
            TOOLKIT
          </p>
          <h2 className="text-white tracking-tight" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 500, letterSpacing: '-0.03em' }}>
            Skills &amp; tools
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {skills.map((skill, i) => (
            <SkillCard key={skill.id} skill={skill} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
