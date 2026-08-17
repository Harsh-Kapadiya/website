import { motion } from 'motion/react';

export function PageHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="bg-[#0a0a0a] px-8 md:px-12 pt-40 pb-10">
      <div className="max-w-[1400px] mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-white/30 mb-3"
          style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}
        >
          {eyebrow}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="text-white tracking-tight"
          style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: 500, letterSpacing: '-0.03em' }}
        >
          {title}
        </motion.h1>
      </div>
    </div>
  );
}
