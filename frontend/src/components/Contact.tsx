import { useRef, useState } from 'react';
import { motion, useInView } from 'motion/react';
import { ArrowUpRight, Send } from 'lucide-react';
import { useContentBlocks } from '@/hooks/useContentBlocks';
import { useTable } from '@/hooks/useTable';
import { apiPost } from '@/lib/api';
import { Magnetic } from './interactions/Magnetic';

type SocialLink = { id: string; platform: string; url: string };
const fallbackSocials: SocialLink[] = [
  { id: '1', platform: 'Twitter', url: '#' },
  { id: '2', platform: 'LinkedIn', url: '#' },
  { id: '3', platform: 'Dribbble', url: '#' },
  { id: '4', platform: 'GitHub', url: '#' },
];

export function Contact() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const { get } = useContentBlocks('home');
  const { data: socials } = useTable<SocialLink>('social_links', fallbackSocials);

  const email = get('contact', 'email', 'hello@harshkapadiya.dev');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSendError(null);
    setSending(true);
    try {
      await apiPost('/api/contact', form);
      setSent(true);
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSending(false);
    }
  }

  return (
    <section id="contact" className="bg-[#0a0a0a] px-8 md:px-12 py-32 border-t border-white/5">
      <div className="max-w-[1400px] mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-24 text-center"
        >
          <p className="text-white/30 mb-6" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>
            LET'S WORK TOGETHER
          </p>
          <h2
            className="text-white tracking-tight mb-8"
            style={{ fontSize: 'clamp(3rem, 8vw, 8rem)', fontWeight: 500, letterSpacing: '-0.04em', lineHeight: '0.95' }}
          >
            Start a project
            <br />
            <span className="text-white/20 italic" style={{ fontWeight: 300 }}>
              today.
            </span>
          </h2>
          <Magnetic strength={0.25} className="inline-block">
            <a
              href={`mailto:${email}`}
              data-cursor="hover"
              className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors duration-300"
              style={{ fontSize: '1rem' }}
            >
              {email}
              <ArrowUpRight size={16} />
            </a>
          </Magnetic>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h3 className="text-white mb-6" style={{ fontSize: '1.5rem', fontWeight: 500, letterSpacing: '-0.02em' }}>
              Let's build something great together
            </h3>
            <p className="text-white/40 leading-relaxed mb-10" style={{ fontSize: '0.9375rem' }}>
              {get(
                'contact',
                'intro',
                "Whether you have a project in mind or just want to explore possibilities, I'd love to hear from you. I typically respond within 24 hours."
              )}
            </p>

            <div className="space-y-6">
              {[
                { label: 'Email', value: email },
                { label: 'Location', value: get('contact', 'location', 'New York, NY') },
                { label: 'Availability', value: get('contact', 'availability', 'Open to projects') },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center py-5 border-b border-white/8">
                  <span className="text-white/30" style={{ fontSize: '0.8125rem' }}>
                    {item.label}
                  </span>
                  <span className="text-white" style={{ fontSize: '0.875rem' }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-5 mt-10">
              {socials.map((social) => (
                <a
                  key={social.id}
                  href={social.url}
                  data-cursor="hover"
                  className="text-white/25 hover:text-white transition-colors duration-300"
                  style={{ fontSize: '0.8125rem' }}
                >
                  {social.platform}
                </a>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            {sent ? (
              <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-12 flex flex-col items-center justify-center text-center gap-4 min-h-[400px]">
                <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center mb-4">
                  <Send size={20} className="text-white/60" />
                </div>
                <h3 className="text-white" style={{ fontSize: '1.25rem', fontWeight: 500 }}>
                  Message sent!
                </h3>
                <p className="text-white/40" style={{ fontSize: '0.9rem' }}>
                  Thanks for reaching out. I'll get back to you within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {[
                  { label: 'Your name', key: 'name', type: 'text', placeholder: 'John Smith' },
                  { label: 'Email address', key: 'email', type: 'email', placeholder: 'john@company.com' },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-white/40 mb-2" style={{ fontSize: '0.8125rem' }}>
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      required
                      placeholder={field.placeholder}
                      value={(form as any)[field.key]}
                      onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-5 py-4 text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors duration-300"
                      style={{ fontSize: '0.9375rem' }}
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-white/40 mb-2" style={{ fontSize: '0.8125rem' }}>
                    Tell me about your project
                  </label>
                  <textarea
                    required
                    placeholder="I'd love to work on..."
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-5 py-4 text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors duration-300 resize-none"
                    style={{ fontSize: '0.9375rem' }}
                  />
                </div>

                {sendError && (
                  <p className="text-red-400" style={{ fontSize: '0.8125rem' }}>
                    {sendError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={sending}
                  data-cursor="hover"
                  className="w-full py-4 rounded-xl bg-white text-[#0a0a0a] hover:bg-white/90 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ fontSize: '0.9375rem', fontWeight: 500 }}
                >
                  {sending ? 'Sending…' : 'Send message'}
                  <ArrowUpRight size={16} />
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
