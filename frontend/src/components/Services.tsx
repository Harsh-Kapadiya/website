import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTable } from '@/hooks/useTable';
import { useContentBlocks } from '@/hooks/useContentBlocks';

type Service = { id: string; number: string; title: string; description: string; tags: string[] };

const FALLBACK: Service[] = [
  { id: '1', number: '01', title: 'Brand Identity', description: 'Building cohesive visual identities that communicate your values and create lasting impressions across every touchpoint.', tags: ['Logo Design', 'Visual Systems', 'Brand Guidelines'] },
  { id: '2', number: '02', title: 'Web Design', description: 'Crafting high-performance websites that are as beautiful as they are functional, optimized for conversion and delight.', tags: ['UI/UX', 'Interaction Design', 'Responsive'] },
  { id: '3', number: '03', title: 'Product Design', description: 'Designing digital products that solve real problems with intuitive interfaces and seamless user experiences.', tags: ['SaaS', 'Design Systems', 'Prototyping'] },
  { id: '4', number: '04', title: 'Motion & 3D', description: 'Bringing ideas to life with motion graphics and 3D visuals that captivate audiences and elevate storytelling.', tags: ['Animation', '3D Rendering', 'Video'] },
];

function ServiceRow({ service, index }: { service: Service; index: number }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: index * 0.08 }}>
      {/* Each service links straight to the contact form — no dead-end rows. */}
      <Link
        ref={ref}
        to="/contact"
        aria-label={`Start a ${service.title} project`}
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
          e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
        }}
        className="group relative py-10 flex flex-col md:flex-row md:items-center gap-6 md:gap-12 overflow-hidden"
      >
        <span aria-hidden className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(220px_circle_at_var(--mx,50%)_var(--my,50%),rgba(255,255,255,0.05),transparent_70%)]" />
        <span className="relative text-white/30 shrink-0 w-10 text-[0.8125rem] font-medium">{service.number}</span>
        <h3 className="relative text-white group-hover:text-white/70 transition-colors shrink-0 md:w-52 text-[1.375rem] font-medium tracking-[-0.02em]">{service.title}</h3>
        <p className="relative text-white/55 flex-1 max-w-md text-[0.9rem] leading-[1.7]">{service.description}</p>
        <ul className="relative flex flex-wrap gap-2 flex-1" aria-label={`${service.title} includes`}>
          {service.tags.map((tag) => (
            <li key={tag} className="px-3 py-1 rounded-full border border-white/10 text-white/50 group-hover:border-white/20 group-hover:text-white/70 transition-all text-xs">{tag}</li>
          ))}
        </ul>
        <ArrowUpRight size={18} aria-hidden className="relative text-white/30 group-hover:text-white shrink-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 hidden md:block" />
      </Link>
    </motion.div>
  );
}

export function Services({ page = false }: { page?: boolean }) {
  const { data: services } = useTable<Service>('services', FALLBACK);
  const { get } = useContentBlocks('home');
  const Heading = page ? 'h1' : 'h2';

  return (
    <section id="services" className="px-6 md:px-12 py-32 border-t border-white/5">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <p className="text-white/40 mb-3 text-xs tracking-[0.1em]">WHAT I DO</p>
            <Heading className="text-white font-medium tracking-[-0.03em]" style={{ fontSize: page ? 'clamp(2.5rem, 6vw, 5rem)' : 'clamp(2rem, 4vw, 3.5rem)' }}>
              Services &amp; expertise
            </Heading>
          </div>
          <p className="text-white/50 max-w-xs text-sm leading-[1.7]">{get('services', 'intro', 'End-to-end design solutions tailored to ambitious brands and startups.')}</p>
        </div>
        <div className="divide-y divide-white/10">
          {(page ? services : services.slice(0, 3)).map((s, i) => <ServiceRow key={s.id} service={s} index={i} />)}
        </div>
        {!page && (
          <Link to="/services" className="inline-flex items-center gap-1.5 mt-10 text-white/60 hover:text-white transition-colors text-sm">
            See all services <ArrowUpRight size={14} aria-hidden />
          </Link>
        )}
      </div>
    </section>
  );
}
