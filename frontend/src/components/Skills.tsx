import { motion } from 'motion/react';
import { Atom, FileCode2, Server, Paintbrush, Layers, PenTool, Database, Box, GitBranch, Sparkles, type LucideIcon } from 'lucide-react';
import { useTable } from '@/hooks/useTable';

type Skill = { id: string; label: string; icon: string };

const ICONS: Record<string, LucideIcon> = {
  react: Atom, typescript: FileCode2, node: Server, tailwind: Paintbrush, nextjs: Layers,
  figma: PenTool, database: Database, threejs: Box, git: GitBranch, motion: Sparkles,
};
const FALLBACK: Skill[] = [
  ['React', 'react'], ['TypeScript', 'typescript'], ['Node.js', 'node'], ['Tailwind CSS', 'tailwind'], ['Next.js', 'nextjs'],
  ['Figma', 'figma'], ['PostgreSQL', 'database'], ['Three.js', 'threejs'], ['Git', 'git'], ['Motion', 'motion'],
].map(([label, icon], i) => ({ id: String(i), label, icon }));

export function Skills() {
  const { data: skills } = useTable<Skill>('skills', FALLBACK);

  return (
    <section className="px-6 md:px-12 py-32 border-t border-white/5">
      <div className="max-w-[1400px] mx-auto">
        <p className="text-white/40 mb-3 text-xs tracking-[0.1em]">TOOLKIT</p>
        <h2 className="text-white font-medium tracking-[-0.03em] mb-16" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
          Skills &amp; tools
        </h2>
        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {skills.map((s, i) => {
            const Icon = ICONS[s.icon] ?? Atom;
            return (
              <motion.li
                key={s.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.04 }}
                className="group relative flex flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] py-8 px-4 transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.05] hover:shadow-[0_0_40px_4px_rgba(255,255,255,0.08)]"
              >
                <span aria-hidden className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(120px_circle_at_50%_38%,rgba(255,255,255,0.14),transparent_70%)]" />
                <Icon size={26} strokeWidth={1.5} aria-hidden className="relative text-white/50 group-hover:text-white group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.6)] transition-all" />
                <span className="relative text-white/60 group-hover:text-white transition-colors text-[0.8125rem] text-center">{s.label}</span>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
