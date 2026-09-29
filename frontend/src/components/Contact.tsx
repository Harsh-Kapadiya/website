import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useContentBlocks } from '@/hooks/useContentBlocks';
import { useTable } from '@/hooks/useTable';
import { apiPost } from '@/lib/api';
import { trackEvent } from '@/lib/analytics';
import { safeHref } from '@/lib/safeUrl';
import { SOCIALS, type SocialLink } from '@/lib/fallbacks';
import { Magnetic } from './interactions/Magnetic';
import { ResponseTime } from './ResponseTime';
import { Honeypot } from './Honeypot';

const input =
  'w-full bg-white/[0.04] border border-white/15 rounded-xl px-5 py-4 text-white placeholder-white/30 focus:outline-none focus:border-white/40 transition-colors text-[0.9375rem]';

export function Contact() {
  const navigate = useNavigate();
  const { get } = useContentBlocks('home');
  const { data: socials } = useTable<SocialLink>('social_links', SOCIALS);
  const [form, setForm] = useState({ name: '', email: '', message: '', website: '' });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const email = get('contact', 'email', 'hello@harshkapadiya.dev');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSending(true);
    try {
      await apiPost('/api/contact', form);
      trackEvent('generate_lead', { form: 'contact' });
      navigate('/thank-you?from=contact');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setSending(false);
    }
  }

  return (
    <section id="contact" className="px-6 md:px-12 py-32">
      <div className="max-w-[1400px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="mb-20 text-center">
          <p className="text-white/40 mb-6 text-xs tracking-[0.1em]">LET'S WORK TOGETHER</p>
          <h1 className="text-white font-medium tracking-[-0.04em] leading-[0.95] mb-8" style={{ fontSize: 'clamp(3rem, 8vw, 8rem)' }}>
            Start a project
            <br />
            <span className="text-white/25 italic font-light">today.</span>
          </h1>
          <Magnetic strength={0.25} className="inline-block">
            <a href={`mailto:${email}`} className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors">
              {email} <ArrowUpRight size={16} aria-hidden />
            </a>
          </Magnetic>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div>
            <h2 className="text-white mb-6 text-2xl font-medium tracking-[-0.02em]">Let's build something great together</h2>
            <p className="text-white/60 leading-relaxed mb-10 text-[0.9375rem]">
              {get('contact', 'intro', "Whether you have a project in mind or just want to explore possibilities, I'd love to hear from you.")}
            </p>
            <dl>
              {[
                ['Email', email],
                ['Location', get('contact', 'location', 'Patna, India')],
                ['Availability', get('contact', 'availability', 'Open to projects')],
                ['Response time', get('contact', 'response_time', 'I reply within 24 hours')],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between items-center gap-4 py-5 border-b border-white/10">
                  <dt className="text-white/50 text-[0.8125rem]">{label}</dt>
                  <dd className="text-white text-sm text-right">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="flex flex-wrap gap-5 mt-10">
              {socials.map((s) => (
                <a key={s.id} href={safeHref(s.url)} target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white transition-colors text-[0.8125rem]">
                  {s.platform}
                </a>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="relative space-y-5" noValidate={false}>
            <Honeypot value={form.website} onChange={(website) => setForm({ ...form, website })} />
            <div>
              <label htmlFor="c-name" className="block text-white/60 mb-2 text-[0.8125rem]">Your name</label>
              <input id="c-name" required maxLength={100} autoComplete="name" placeholder="John Smith" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={input} />
            </div>
            <div>
              <label htmlFor="c-email" className="block text-white/60 mb-2 text-[0.8125rem]">Email address</label>
              <input id="c-email" type="email" required maxLength={254} autoComplete="email" placeholder="john@company.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={input} />
            </div>
            <div>
              <label htmlFor="c-message" className="block text-white/60 mb-2 text-[0.8125rem]">Tell me about your project</label>
              <textarea id="c-message" required maxLength={5000} rows={5} placeholder="I'd love to work on..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={`${input} resize-none`} />
            </div>
            {error && <p role="alert" className="text-red-400 text-[0.8125rem]">{error}</p>}
            <button type="submit" disabled={sending} className="w-full py-4 rounded-xl bg-white text-[#0a0a0a] hover:bg-white/90 transition-all flex items-center justify-center gap-2 text-[0.9375rem] font-medium disabled:opacity-60">
              {sending ? 'Sending…' : 'Send message'} <ArrowUpRight size={16} aria-hidden />
            </button>
            <p className="text-center text-[0.8125rem]"><ResponseTime /></p>
          </form>
        </div>
      </div>
    </section>
  );
}
