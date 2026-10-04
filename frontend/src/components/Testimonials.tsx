import { Quote, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTable } from '@/hooks/useTable';
import { imageUrl } from '@/lib/safeUrl';

type Review = { id: string; author: string; role: string | null; avatar_url: string | null; quote: string; rating: number; created_at: string };

function ReviewCard({ r, hidden }: { r: Review; hidden?: boolean }) {
  return (
    <figure
      aria-hidden={hidden || undefined}
      className="group relative shrink-0 w-[300px] md:w-[380px] rounded-2xl border border-white/10 bg-white/[0.03] p-8 flex flex-col justify-between gap-8 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.05] hover:shadow-[0_20px_60px_-15px_rgba(255,255,255,0.08)]"
    >
      <Quote size={72} strokeWidth={1} aria-hidden className="absolute -top-3 -right-3 text-white/[0.05] group-hover:text-white/[0.08] transition-colors" />
      <div className="flex gap-0.5" role="img" aria-label={`Rated ${r.rating} out of 5`}>
        {Array.from({ length: 5 }, (_, i) => (
          <Star key={i} size={13} aria-hidden className={i < r.rating ? 'fill-white/70 text-white/70' : 'text-white/20'} />
        ))}
      </div>
      <blockquote className="relative text-white/70 leading-relaxed flex-1 text-[0.9375rem]">“{r.quote}”</blockquote>
      <figcaption className="relative flex items-center gap-3">
        {imageUrl(r.avatar_url) ? (
          <img src={imageUrl(r.avatar_url)} alt={`${r.author}${r.role ? `, ${r.role}` : ''}`} loading="lazy" className="w-10 h-10 rounded-full object-cover grayscale ring-1 ring-white/10" />
        ) : (
          <span aria-hidden className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/70 text-[0.8rem] font-medium ring-1 ring-white/10">
            {r.author.charAt(0)}
          </span>
        )}
        <span>
          <span className="block text-white text-sm font-medium">{r.author}</span>
          {r.role && <span className="block text-white/50 text-[0.8rem]">{r.role}</span>}
        </span>
      </figcaption>
    </figure>
  );
}

/**
 * Real reviews only: approved rows from the `feedback` table, never
 * placeholder quotes. With zero approved reviews the section doesn't render.
 */
export function Testimonials() {
  const { data: reviews } = useTable<Review>('feedback', [], { orderBy: 'created_at', ascending: false, approvedOnly: true });
  if (!reviews.length) return null;

  // Rendered twice for a seamless loop; duration scales with count so the
  // speed per card stays the same however many reviews there are.
  return (
    <section className="py-32 border-t border-white/5 overflow-hidden" aria-labelledby="reviews-heading">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 mb-16 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-white/40 mb-3 text-xs tracking-[0.1em]">HAPPY CLIENTS</p>
          <h2 id="reviews-heading" className="text-white font-medium tracking-[-0.03em]" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
            What clients say
          </h2>
        </div>
        <p className="text-white/50 max-w-xs text-sm leading-[1.7]">
          {reviews.length} verified review{reviews.length === 1 ? '' : 's'} from real projects.{' '}
          <Link to="/feedback" className="text-white underline underline-offset-4 hover:text-white/70">Worked with me? Leave one.</Link>
        </p>
      </div>
      <div className="relative w-full [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
        <div className="testimonial-track flex gap-5 w-max" style={{ animationDuration: `${reviews.length * 6}s` }}>
          {reviews.map((r) => <ReviewCard key={r.id} r={r} />)}
          {reviews.map((r) => <ReviewCard key={`dup-${r.id}`} r={r} hidden />)}
        </div>
      </div>
    </section>
  );
}
