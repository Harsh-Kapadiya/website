import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useContentBlocks } from '@/hooks/useContentBlocks';
import { useTable } from '@/hooks/useTable';
import { imageUrl } from '@/lib/safeUrl';

type Stat = { id: string; value: string; label: string };
type Client = { id: string; name: string };

export function About() {
  const { get } = useContentBlocks('home');
  const { data: stats } = useTable<Stat>('stats', []);
  const { data: clients } = useTable<Client>('clients', []);
  const name = get('about', 'name', 'Harsh Kapadiya');
  const fade = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

  return (
    <section id="about" className="bg-[#0f0f0f] px-6 md:px-12 py-32 border-t border-white/5">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
        <div>
          <p className="text-white/40 mb-5 text-xs tracking-[0.1em]">{get('about', 'eyebrow', 'ABOUT ME')}</p>
          <motion.h1 {...fade} className="text-white font-medium tracking-[-0.03em] leading-[1.1] mb-8" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}>
            Design is how it
            <br />
            <span className="text-white/30 italic font-light">works</span>
          </motion.h1>
          <motion.div {...fade} transition={{ delay: 0.1 }} className="space-y-5 text-white/60 leading-relaxed text-[0.9375rem]">
            <p>{get('about', 'bio_1', "I'm Harsh Kapadiya — a multidisciplinary designer and developer who believes great design is inseparable from great function.")}</p>
            {get('about', 'bio_2', '') && <p>{get('about', 'bio_2', '')}</p>}
          </motion.div>

          <div className="mt-10 flex items-center gap-4">
            <img
              src={imageUrl(get('about', 'photo_url', '/img/harsh.jpg')) || '/img/harsh.jpg'}
              alt={`Portrait of ${name}`}
              width={48}
              height={48}
              className="w-12 h-12 rounded-full object-cover grayscale"
            />
            <div>
              <p className="text-white text-[0.9rem] font-medium">{name}</p>
              <p className="text-white/50 text-[0.8rem]">{get('about', 'title_location', 'Designer & Developer · Haryana, India')}</p>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-6 text-sm">
            <Link to="/work" className="inline-flex items-center gap-1.5 text-white hover:text-white/60 transition-colors">
              See my work <ArrowUpRight size={14} aria-hidden />
            </Link>
            <Link to="/resume" className="inline-flex items-center gap-1.5 text-white/60 hover:text-white transition-colors">
              Read my resume <ArrowUpRight size={14} aria-hidden />
            </Link>
          </div>
        </div>

        <div>
          {stats.length > 0 && (
          <dl className="grid grid-cols-2 gap-px bg-white/10 rounded-2xl overflow-hidden mb-10">
            {stats.map((s) => (
              <div key={s.id} className="bg-[#0f0f0f] p-8 flex flex-col-reverse gap-2">
                <dt className="text-white/50 text-[0.8125rem]">{s.label}</dt>
                <dd className="text-white text-[2.75rem] font-semibold tracking-[-0.04em] leading-none">{s.value}</dd>
              </div>
            ))}
          </dl>
          )}
          {clients.length > 0 && (
            <>
              <p className="text-white/40 mb-6 text-xs tracking-[0.1em]">TRUSTED BY</p>
              <ul className="flex flex-wrap gap-x-8 gap-y-4">
                {clients.map((c) => (
                  <li key={c.id} className="text-white/45 hover:text-white/80 transition-colors font-medium">{c.name}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
