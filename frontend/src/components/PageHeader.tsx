import { motion } from 'motion/react';

/** Top-of-page heading for inner pages. This is the page's only <h1>. */
export function PageHeader({ eyebrow, title, intro }: { eyebrow: string; title: string; intro?: string }) {
  return (
    <header className="px-6 md:px-12 pt-8 pb-4">
      <div className="max-w-[1400px] mx-auto">
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-white/40 mb-3 text-xs tracking-[0.1em]">
          {eyebrow}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-white font-medium tracking-[-0.03em] leading-[1.05]"
          style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}
        >
          {title}
        </motion.h1>
        {intro && <p className="text-white/50 mt-5 max-w-xl text-[0.9375rem] leading-relaxed">{intro}</p>}
      </div>
    </header>
  );
}
