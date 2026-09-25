import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { useTable } from '@/hooks/useTable';
import { useContentBlocks } from '@/hooks/useContentBlocks';

type Service = { id: string; number: string; title: string; description: string; tags: string[] };

const fallbackServices: Service[] = [
  { id: '1', number: '01', title: 'Brand Identity', description: 'Building cohesive visual identities that communicate your values and create lasting impressions across every touchpoint.', tags: ['Logo Design', 'Visual Systems', 'Brand Guidelines'] },
  { id: '2', number: '02', title: 'Web Design', description: 'Crafting high-performance websites that are as beautiful as they are functional, optimized for conversion and delight.', tags: ['UI/UX', 'Interaction Design', 'Responsive'] },
  { id: '3', number: '03', title: 'Product Design', description: 'Designing digital products that solve real problems with intuitive interfaces and seamless user experiences.', tags: ['SaaS', 'Design Systems', 'Prototyping'] },
  { id: '4', number: '04', title: 'Motion & 3D', description: 'Bringing ideas to life with motion graphics and 3D visuals that captivate audiences and elevate storytelling.', tags: ['Animation', '3D Rendering', 'Video'] },
];

export function Services({ compact = false }: { compact?: boolean }) {
  const headerRef = useRef(null);
  const inView = useInView(headerRef, { once: true, margin: '-80px' });
  const { data: services } = useTable<Service>('services', fallbackServices);
  const { get } = useContentBlocks('home');

  return (
    <section id="services" className="bg-[#0a0a0a] px-8 md:px-12 py-32 border-t border-white/5">
      <div className="max-w-[1400px] mx-auto">
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-6"
        >
          <div>
            <p className="text-white/30 mb-3" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>
              WHAT I DO
            </p>
            <h2 className="text-white tracking-tight" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 500, letterSpacing: '-0.03em' }}>
              Services &amp; expertise
            </h2>
          </div>
          <p className="text-white/30 max-w-xs" style={{ fontSize: '0.875rem', lineHeight: '1.7' }}>
            {get('services', 'intro', 'End-to-end design solutions tailored to ambitious brands and startups.')}
          </p>
        </motion.div>

        <div className="divide-y divide-white/8">
          {(compact ? services.slice(0, 3) : services).map((service, i) => (
            <ServiceRow key={service.id} service={service} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceRow({ service, index }: { service: Service; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    el.style.setProperty('--my', `${e.clientY - rect.top}px`);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.08 }}
      data-cursor="hover"
      className="group relative py-10 flex flex-col md:flex-row md:items-center gap-6 md:gap-12 cursor-pointer overflow-hidden"
      style={{
        // @ts-ignore custom property
        '--mx': '50%',
        '--my': '50%',
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: 'radial-gradient(220px circle at var(--mx) var(--my), rgba(255,255,255,0.04), transparent 70%)' }}
      />

      <span className="relative text-white/15 shrink-0 w-10" style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
        {service.number}
      </span>

      <h3
        className="relative text-white group-hover:text-white/60 transition-colors duration-300 shrink-0 w-52"
        style={{ fontSize: '1.375rem', fontWeight: 500, letterSpacing: '-0.02em' }}
      >
        {service.title}
      </h3>

      <p className="relative text-white/35 flex-1 max-w-md" style={{ fontSize: '0.9rem', lineHeight: '1.7' }}>
        {service.description}
      </p>

      <div className="relative flex flex-wrap gap-2 flex-1">
        {service.tags.map((tag) => (
          <span
            key={tag}
            className="px-3 py-1 rounded-full border border-white/10 text-white/40 group-hover:border-white/20 group-hover:text-white/60 transition-all duration-300"
            style={{ fontSize: '0.75rem' }}
          >
            {tag}
          </span>
        ))}
      </div>

      <ArrowUpRight
        size={18}
        className="relative text-white/20 group-hover:text-white shrink-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 hidden md:block"
      />
    </motion.div>
  );
}
