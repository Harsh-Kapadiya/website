import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { Quote, Star } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useTableNoFallback } from '@/hooks/useTable';

type Feedback = {
  id: string;
  author: string;
  role: string | null;
  avatar_url: string | null;
  quote: string;
  rating: number;
};

// Used only while there's no backend connected yet, so this section is
// reviewable in the frontend-only build. Once Supabase is wired up, this
// is ignored entirely — the section then hides itself for real when there's
// no approved feedback (see the early return below).
const previewFeedback: Feedback[] = [
  {
    id: 'preview-1',
    author: 'Sarah Chen',
    role: 'CEO, Luminary',
    avatar_url: null,
    quote:
      'Harsh completely transformed our brand. The attention to detail and creative vision he brought was unmatched.',
    rating: 5,
  },
  {
    id: 'preview-2',
    author: 'Marcus Reid',
    role: 'Founder, Noir Studio',
    avatar_url: null,
    quote: 'Working with Harsh felt like having a creative partner who truly understood our vision.',
    rating: 5,
  },
  {
    id: 'preview-3',
    author: 'Priya Nair',
    role: 'Head of Product, Forma',
    avatar_url: null,
    quote: 'The design system Harsh built for us scaled beautifully as our product grew.',
    rating: 5,
  },
  {
    id: 'preview-4',
    author: 'Jonah Weiss',
    role: 'CTO, Velvet',
    avatar_url: null,
    quote: 'Rare to find someone who designs and ships at this level. Every handoff was clean.',
    rating: 5,
  },
  {
    id: 'preview-5',
    author: 'Elena Torres',
    role: 'VP Product, Arc',
    avatar_url: null,
    quote: 'Turned a vague brief into something sharper than we imagined, and fast.',
    rating: 5,
  },
];

function TestimonialCard({ t }: { t: Feedback }) {
  return (
    <div
      data-cursor="hover"
      className="group relative shrink-0 w-[340px] md:w-[380px] rounded-2xl border border-white/8 bg-white/[0.025] p-8 flex flex-col justify-between gap-8 overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.04]"
      style={{ boxShadow: '0 0 0 rgba(255,255,255,0)' }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 20px 60px -15px rgba(255,255,255,0.08)')}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 0 0 rgba(255,255,255,0)')}
    >
      <Quote
        size={72}
        className="absolute -top-3 -right-3 text-white/[0.04] group-hover:text-white/[0.07] transition-colors duration-300"
        strokeWidth={1}
      />

      <div className="relative flex items-center justify-between">
        <div className="flex gap-0.5">
          {Array.from({ length: t.rating }).map((_, j) => (
            <Star key={j} size={13} className="fill-white/60 text-white/60" />
          ))}
        </div>
      </div>

      <p className="relative text-white/55 leading-relaxed flex-1" style={{ fontSize: '0.9375rem' }}>
        "{t.quote}"
      </p>

      <div className="relative flex items-center gap-3">
        {t.avatar_url ? (
          <img src={t.avatar_url} alt={t.author} className="w-10 h-10 rounded-full object-cover grayscale ring-1 ring-white/10" />
        ) : (
          <div
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/60 ring-1 ring-white/10"
            style={{ fontSize: '0.8rem', fontWeight: 500 }}
          >
            {t.author.charAt(0)}
          </div>
        )}
        <div>
          <p className="text-white" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
            {t.author}
          </p>
          {t.role && (
            <p className="text-white/30" style={{ fontSize: '0.8rem' }}>
              {t.role}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function Testimonials() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const { data: liveFeedback, loading } = useTableNoFallback<Feedback>(
    'feedback',
    (q) => q.eq('approved', true),
    'created_at'
  );

  // No backend yet → show preview content so the design is reviewable.
  // Backend connected → real rule: hide entirely with zero approved feedback.
  const feedback = !supabase ? previewFeedback : liveFeedback;
  if (supabase && (loading || feedback.length === 0)) return null;

  // Duplicated once for a seamless loop; duration scales with item count so
  // the scroll speed per card stays constant no matter how many reviews
  // there are — that's the "perfect timing" part.
  const track = [...feedback, ...feedback];
  const durationSeconds = feedback.length * 6;

  return (
    <section className="bg-[#0a0a0a] py-32 border-t border-white/5 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-8 md:px-12">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-4"
        >
          <div>
            <p className="text-white/30 mb-3" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>
              HAPPY CLIENTS
            </p>
            <h2 className="text-white tracking-tight" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 500, letterSpacing: '-0.03em' }}>
              What clients say
            </h2>
          </div>
          <p className="text-white/30 max-w-xs" style={{ fontSize: '0.875rem', lineHeight: '1.7' }}>
            {feedback.length} review{feedback.length === 1 ? '' : 's'} from people I've shipped real projects with.
          </p>
        </motion.div>
      </div>

      {/* Edge-fade marquee — pauses on hover, loops seamlessly right to left */}
      <div
        className="relative w-full"
        style={{ WebkitMaskImage: 'linear-gradient(to right, transparent, black 6%, black 94%, transparent)', maskImage: 'linear-gradient(to right, transparent, black 6%, black 94%, transparent)' }}
      >
        <div
          className="flex gap-5 w-max testimonial-track"
          style={{ animationDuration: `${durationSeconds}s` }}
        >
          {track.map((t, i) => (
            <TestimonialCard key={`${t.id}-${i}`} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
