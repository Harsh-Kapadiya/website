import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { usePageMeta } from '@/hooks/usePageMeta';

const SUGGESTIONS = [
  ['/', 'Home', 'Start from the beginning'],
  ['/work', 'Work', 'Projects and case studies'],
  ['/services', 'Services', 'What I can build for you'],
  ['/contact', 'Contact', 'Start a project'],
];

export function NotFoundPage() {
  usePageMeta({ title: 'Page not found', description: "This page doesn't exist — here are some places to go instead.", noindex: true });

  return (
    <section className="px-6 md:px-12 pt-40 pb-32 min-h-[80vh]">
      <div className="max-w-[1000px] mx-auto">
        <p className="text-white/40 text-xs tracking-[0.1em] mb-4">ERROR 404</p>
        <h1 className="text-white font-medium tracking-[-0.04em] leading-[0.95] mb-6" style={{ fontSize: 'clamp(3rem, 9vw, 8rem)' }}>
          Lost in the
          <br />
          <span className="text-white/25 italic font-light">void.</span>
        </h1>
        <p className="text-white/60 text-lg mb-14 max-w-md">The page you're looking for moved or never existed. One of these should get you back on track.</p>
        <nav aria-label="Suggested pages" className="grid sm:grid-cols-2 gap-3">
          {SUGGESTIONS.map(([to, label, hint]) => (
            <Link key={to} to={to} className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-5 hover:border-white/30 hover:bg-white/[0.05] transition-all">
              <span>
                <span className="block text-white font-medium">{label}</span>
                <span className="block text-white/50 text-sm">{hint}</span>
              </span>
              <ArrowUpRight size={18} aria-hidden className="text-white/40 group-hover:text-white transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
