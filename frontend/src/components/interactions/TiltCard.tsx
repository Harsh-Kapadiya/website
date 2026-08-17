import { useRef, ReactNode } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

/** Subtle 3D tilt + glare that follows the cursor across a card. */
export function TiltCard({
  children,
  className = '',
  max = 8,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const springX = useSpring(px, { stiffness: 150, damping: 18 });
  const springY = useSpring(py, { stiffness: 150, damping: 18 });

  const rotateX = useTransform(springY, [0, 1], [max, -max]);
  const rotateY = useTransform(springX, [0, 1], [-max, max]);
  const glareX = useTransform(springX, (v) => `${v * 100}%`);
  const glareY = useTransform(springY, (v) => `${v * 100}%`);

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
  }

  function onLeave() {
    px.set(0.5);
    py.set(0.5);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      className={`relative ${className}`}
    >
      {children}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(280px circle at ${glareX} ${glareY}, rgba(255,255,255,0.08), transparent 65%)`,
        }}
      />
    </motion.div>
  );
}
