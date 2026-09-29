import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

/** Trailing ring cursor that grows over links/buttons. Desktop only. */
export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 400, damping: 35 });
  const sy = useSpring(y, { stiffness: 400, damping: 35 });

  useEffect(() => {
    if (matchMedia('(pointer: coarse)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setEnabled(true);
    const onMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setHovering(Boolean((e.target as HTMLElement)?.closest('a, button, [data-cursor="hover"]')));
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [x, y]);

  if (!enabled) return null;
  return (
    <motion.div
      aria-hidden
      className="fixed top-0 left-0 z-[100] pointer-events-none mix-blend-difference"
      style={{ x: sx, y: sy, translateX: '-50%', translateY: '-50%' }}
    >
      <motion.div
        animate={{ width: hovering ? 48 : 18, height: hovering ? 48 : 18 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="rounded-full bg-white"
      />
    </motion.div>
  );
}
