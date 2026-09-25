import { useState } from 'react';
import { motion } from 'motion/react';
import { Send, Star } from 'lucide-react';
import { apiPost } from '@/lib/api';

export function FeedbackForm() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ author: '', role: '', quote: '', rating: 5 });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await apiPost('/api/feedback', form);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-12 flex flex-col items-center justify-center text-center gap-4 min-h-[360px]">
        <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center mb-4">
          <Send size={20} className="text-white/60" />
        </div>
        <h3 className="text-white" style={{ fontSize: '1.25rem', fontWeight: 500 }}>
          Thank you!
        </h3>
        <p className="text-white/40 max-w-sm" style={{ fontSize: '0.9rem' }}>
          Your feedback means a lot — it'll appear on the site once it's reviewed.
        </p>
      </div>
    );
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="space-y-5"
    >
      <div>
        <label className="block text-white/40 mb-2" style={{ fontSize: '0.8125rem' }}>
          Your name
        </label>
        <input
          required
          value={form.author}
          onChange={(e) => setForm({ ...form, author: e.target.value })}
          placeholder="Jane Cooper"
          className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-5 py-4 text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors duration-300"
          style={{ fontSize: '0.9375rem' }}
        />
      </div>

      <div>
        <label className="block text-white/40 mb-2" style={{ fontSize: '0.8125rem' }}>
          Role / company (optional)
        </label>
        <input
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          placeholder="Founder, Acme Co."
          className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-5 py-4 text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors duration-300"
          style={{ fontSize: '0.9375rem' }}
        />
      </div>

      <div>
        <label className="block text-white/40 mb-2" style={{ fontSize: '0.8125rem' }}>
          Rating
        </label>
        <div className="flex gap-2" data-cursor="hover">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setForm({ ...form, rating: n })}
              aria-label={`${n} star${n > 1 ? 's' : ''}`}
              className="p-1"
            >
              <Star
                size={22}
                className={n <= form.rating ? 'fill-white text-white' : 'text-white/20'}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-white/40 mb-2" style={{ fontSize: '0.8125rem' }}>
          Your feedback
        </label>
        <textarea
          required
          rows={5}
          value={form.quote}
          onChange={(e) => setForm({ ...form, quote: e.target.value })}
          placeholder="What was it like working together?"
          className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-5 py-4 text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors duration-300 resize-none"
          style={{ fontSize: '0.9375rem' }}
        />
      </div>

      {error && (
        <p className="text-red-400" style={{ fontSize: '0.8125rem' }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        data-cursor="hover"
        className="w-full py-4 rounded-xl bg-white text-[#0a0a0a] hover:bg-white/90 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
        style={{ fontSize: '0.9375rem', fontWeight: 500 }}
      >
        {submitting ? 'Sending…' : 'Submit feedback'}
        <Send size={16} />
      </button>
    </motion.form>
  );
}
