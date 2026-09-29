import { Link, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useContentBlocks } from '@/hooks/useContentBlocks';

export function ThankYouPage() {
  const fromFeedback = useSearchParams()[0].get('from') === 'feedback';
  const { get } = useContentBlocks('home');
  usePageMeta({ title: 'Thank you', description: 'Thanks for getting in touch with Harsh Kapadiya.', noindex: true });

  return (
    <section className="px-6 md:px-12 pb-32 min-h-[60vh]">
      <div className="max-w-[720px] mx-auto text-center">
        <CheckCircle2 size={44} strokeWidth={1.25} aria-hidden className="mx-auto text-emerald-400 mb-8" />
        <h1 className="text-white font-medium tracking-[-0.03em] mb-5" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }}>
          {fromFeedback ? 'Thanks for the review!' : 'Message received.'}
        </h1>
        <p className="text-white/60 text-lg leading-relaxed mb-12">
          {fromFeedback
            ? "Your feedback means a lot. It'll appear on the site once it's been reviewed."
            : `Thanks for reaching out — ${get('contact', 'response_time', 'I reply within 24 hours')}. Keep an eye on your inbox (and your spam folder, just in case).`}
        </p>
        <p className="text-white/40 text-xs tracking-[0.1em] mb-5">WHILE YOU WAIT</p>
        <div className="flex flex-wrap justify-center gap-3">
          {[
            ['/work', 'Browse case studies'],
            ['/services', 'See services'],
            ['/about', 'About me'],
          ].map(([to, label]) => (
            <Link key={to} to={to} className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-white/15 text-white text-sm hover:bg-white hover:text-[#0a0a0a] transition-colors">
              {label} <ArrowUpRight size={14} aria-hidden />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
