import { useState } from 'react';
import { Send, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiPost } from '@/lib/api';
import { trackEvent } from '@/lib/analytics';
import { Honeypot } from './Honeypot';

const input =
  'w-full bg-white/[0.04] border border-white/15 rounded-xl px-5 py-4 text-white placeholder-white/30 focus:outline-none focus:border-white/40 transition-colors text-[0.9375rem]';

export function FeedbackForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ author: '', role: '', quote: '', rating: 5, website: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await apiPost('/api/feedback', form);
      trackEvent('submit_review', { rating: form.rating });
      navigate('/thank-you?from=feedback');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative space-y-5">
      <Honeypot value={form.website} onChange={(website) => setForm({ ...form, website })} />
      <div>
        <label htmlFor="f-author" className="block text-white/60 mb-2 text-[0.8125rem]">Your name</label>
        <input id="f-author" required maxLength={100} autoComplete="name" placeholder="Jane Cooper" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} className={input} />
      </div>
      <div>
        <label htmlFor="f-role" className="block text-white/60 mb-2 text-[0.8125rem]">Role / company (optional)</label>
        <input id="f-role" maxLength={120} autoComplete="organization-title" placeholder="Founder, Acme Co." value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={input} />
      </div>
      <fieldset>
        <legend className="block text-white/60 mb-2 text-[0.8125rem]">Rating</legend>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => setForm({ ...form, rating: n })} aria-label={`${n} star${n > 1 ? 's' : ''}`} aria-pressed={form.rating === n} className="p-2 -m-0.5">
              <Star size={22} aria-hidden className={n <= form.rating ? 'fill-white text-white' : 'text-white/25'} />
            </button>
          ))}
        </div>
      </fieldset>
      <div>
        <label htmlFor="f-quote" className="block text-white/60 mb-2 text-[0.8125rem]">Your feedback</label>
        <textarea id="f-quote" required maxLength={1000} rows={5} placeholder="What was it like working together?" value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} className={`${input} resize-none`} />
      </div>
      {error && <p role="alert" className="text-red-400 text-[0.8125rem]">{error}</p>}
      <button type="submit" disabled={submitting} className="w-full py-4 rounded-xl bg-white text-[#0a0a0a] hover:bg-white/90 transition-all flex items-center justify-center gap-2 text-[0.9375rem] font-medium disabled:opacity-60">
        {submitting ? 'Sending…' : 'Submit feedback'} <Send size={16} aria-hidden />
      </button>
    </form>
  );
}
