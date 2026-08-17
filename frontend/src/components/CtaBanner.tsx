import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { Magnetic } from './interactions/Magnetic';

export function CtaBanner() {
  return (
    <section className="bg-[#0a0a0a] px-8 md:px-12 py-32 border-t border-white/5 text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7 }}
      >
        <h2
          className="text-white tracking-tight mb-8"
          style={{ fontSize: 'clamp(2.5rem, 6vw, 6rem)', fontWeight: 500, letterSpacing: '-0.04em', lineHeight: '0.95' }}
        >
          Got a project in
          <br />
          <span className="text-white/20 italic" style={{ fontWeight: 300 }}>
            mind?
          </span>
        </h2>
        <Magnetic strength={0.35} className="inline-block">
          <Link
            to="/contact"
            data-cursor="hover"
            className="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-white text-[#0a0a0a] hover:bg-white/85 transition-colors duration-300"
            style={{ fontSize: '0.9375rem', fontWeight: 500 }}
          >
            Let's talk
            <ArrowUpRight size={16} />
          </Link>
        </Magnetic>
      </motion.div>
    </section>
  );
}
