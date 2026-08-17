import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { useContentBlocks } from '@/hooks/useContentBlocks';
import { useTable } from '@/hooks/useTable';

type Stat = { id: string; value: string; label: string };
type ClientRow = { id: string; name: string };

const fallbackStats: Stat[] = [
  { id: '1', value: '5+', label: 'Years experience' },
  { id: '2', value: '48+', label: 'Projects completed' },
  { id: '3', value: '12+', label: 'Countries reached' },
  { id: '4', value: '99%', label: 'Client satisfaction' },
];
const fallbackClients: ClientRow[] = ['Stripe', 'Linear', 'Vercel', 'Notion', 'Loom', 'Arc'].map((name, i) => ({
  id: String(i),
  name,
}));

export function About() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true, margin: '-60px' });

  const { get } = useContentBlocks('home');
  const { data: stats } = useTable<Stat>('stats', fallbackStats);
  const { data: clients } = useTable<ClientRow>('clients', fallbackClients);

  return (
    <section id="about" className="bg-[#0f0f0f] px-8 md:px-12 py-32 border-t border-white/5">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          <div ref={ref}>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="text-white/30 mb-5"
              style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}
            >
              {get('about', 'eyebrow', 'ABOUT ME')}
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-white tracking-tight mb-8"
              style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 500, letterSpacing: '-0.03em', lineHeight: '1.1' }}
            >
              Design is how it
              <br />
              <span className="text-white/25 italic" style={{ fontWeight: 300 }}>
                works
              </span>
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-5"
            >
              <p className="text-white/45 leading-relaxed" style={{ fontSize: '0.9375rem' }}>
                {get(
                  'about',
                  'bio_1',
                  "I'm Harsh Kapadiya — a multidisciplinary designer and developer who believes great design is inseparable from great function. I work at the intersection of aesthetics and engineering to create digital experiences that are both beautiful and meaningful."
                )}
              </p>
              <p className="text-white/45 leading-relaxed" style={{ fontSize: '0.9375rem' }}>
                {get(
                  'about',
                  'bio_2',
                  'With over five years working with startups and global brands, I bring a systems-thinking approach to every project — from brand identity to complex web applications.'
                )}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10 flex items-center gap-4"
            >
              <img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200"
                alt={get('about', 'name', 'Harsh Kapadiya')}
                className="w-12 h-12 rounded-full object-cover grayscale"
              />
              <div>
                <p className="text-white" style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                  {get('about', 'name', 'Harsh Kapadiya')}
                </p>
                <p className="text-white/35" style={{ fontSize: '0.8rem' }}>
                  {get('about', 'title_location', 'Designer & Developer · New York')}
                </p>
              </div>
            </motion.div>
          </div>

          <div>
            <motion.div
              ref={statsRef}
              initial={{ opacity: 0 }}
              animate={statsInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-2 gap-px bg-white/8 rounded-2xl overflow-hidden mb-10"
            >
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={statsInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="bg-[#0f0f0f] p-8 flex flex-col gap-2"
                >
                  <p className="text-white" style={{ fontSize: '2.75rem', fontWeight: 600, letterSpacing: '-0.04em', lineHeight: 1 }}>
                    {stat.value}
                  </p>
                  <p className="text-white/35" style={{ fontSize: '0.8125rem' }}>
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={statsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <p className="text-white/25 mb-6" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>
                TRUSTED BY
              </p>
              <div className="flex flex-wrap gap-x-8 gap-y-4">
                {clients.map((client) => (
                  <span
                    key={client.id}
                    data-cursor="hover"
                    className="text-white/30 hover:text-white/60 transition-colors duration-300 cursor-default"
                    style={{ fontSize: '1rem', fontWeight: 500 }}
                  >
                    {client.name}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
