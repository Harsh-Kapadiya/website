import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { Magnetic } from './interactions/Magnetic';
import { ResponseTime } from './ResponseTime';

export function CtaBanner({ heading = 'Got a project in', accent = 'mind?' }: { heading?: string; accent?: string }) {
  return (
    <section className="px-6 md:px-12 py-32 border-t border-white/5 text-center">
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.7 }}>
        <h2 className="text-white font-medium tracking-[-0.04em] leading-[0.95] mb-8" style={{ fontSize: 'clamp(2.5rem, 6vw, 6rem)' }}>
          {heading}
          <br />
          <span className="text-white/25 italic font-light">{accent}</span>
        </h2>
        <Magnetic strength={0.35} className="inline-block">
          <Link to="/contact" className="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-white text-[#0a0a0a] text-[0.9375rem] font-medium hover:bg-white/85 transition-colors">
            Let's talk <ArrowUpRight size={16} aria-hidden />
          </Link>
        </Magnetic>
        <div className="mt-5 text-[0.8125rem]">
          <ResponseTime />
        </div>
      </motion.div>
    </section>
  );
}
