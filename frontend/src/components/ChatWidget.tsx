import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Send, X } from 'lucide-react';
import { apiHealth, apiPost } from '@/lib/api';
import { trackEvent } from '@/lib/analytics';

type Msg = { role: 'user' | 'assistant'; content: string };
type Status = 'idle' | 'checking' | 'ready' | 'offline';

const GREETING = "Hi! I'm Harsh's AI assistant. Ask me about his work, services or experience — or leave him a message.";
const SUGGESTIONS = ['What does Harsh Kapadiya do?', 'Show me a case study', 'I want to hire Harsh Kapadiya'];
// The server accepts up to 12 turns; an odd count keeps "starts and ends with the visitor".
const MAX_HISTORY = 11;
const LINK = /(https?:\/\/[^\s<>()]+[^\s<>().,!?:;'"])/g;

/** Plain text with http(s) links made clickable. React escapes the text; only http(s) becomes a link. */
function Linkified({ text }: { text: string }) {
  return (
    <>
      {text.split(LINK).map((part, i) =>
        i % 2 ? (
          <a
            key={i}
            href={part}
            {...(part.startsWith(window.location.origin) ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
            className="underline underline-offset-2 [overflow-wrap:anywhere] hover:text-white"
          >
            {part.replace(/^https?:\/\/(www\.)?/, '')}
          </a>
        ) : (
          part
        )
      )}
    </>
  );
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [slow, setSlow] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [leadSent, setLeadSent] = useState(false); // tells the backend not to save a second lead this chat
  const inputRef = useRef<HTMLInputElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Wake the backend the moment the chat opens — Render's free plan sleeps when idle.
  useEffect(() => {
    if (!open || status !== 'idle') return;
    setStatus('checking');
    const t = setTimeout(() => setSlow(true), 1500);
    apiHealth()
      .then((h) => setStatus(h.chat ? 'ready' : 'offline'))
      .finally(() => {
        clearTimeout(t);
        setSlow(false);
      });
  }, [open, status]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open, status]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, busy, status, error]);

  function toggle(next: boolean) {
    setOpen(next);
    if (next) trackEvent('chat_open');
    else launcherRef.current?.focus();
  }

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy || status !== 'ready') return;
    const next: Msg[] = [...messages, { role: 'user', content }];
    setMessages(next);
    setInput('');
    setError('');
    setBusy(true);
    const history = next.slice(-MAX_HISTORY);
    if (history[0]?.role === 'assistant') history.shift();
    try {
      const out = await apiPost<{ reply: string; leadSaved: boolean }>('/api/chat', {
        messages: history.map((m) => ({ ...m, content: m.content.slice(0, m.role === 'user' ? 1000 : 2500) })),
        leadSent,
      });
      setMessages((m) => [...m, { role: 'assistant', content: out.reply }]);
      if (out.leadSaved) {
        setLeadSent(true);
        trackEvent('generate_lead', { location: 'chat' });
      }
    } catch (e) {
      // Drop the unanswered message (keeps turns alternating) and give the text back for a retry.
      setMessages((m) => m.slice(0, -1));
      setInput(content);
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(input);
  };

  return (
    <>
      <button
        ref={launcherRef}
        type="button"
        onClick={() => toggle(!open)}
        aria-expanded={open}
        aria-controls="chat-panel"
        aria-label={open ? 'Close chat' : "Chat with Harsh's AI assistant"}
        className={`${open ? 'hidden md:flex' : 'flex'} fixed z-50 right-4 bottom-32 md:right-6 md:bottom-6 w-14 h-14 items-center justify-center rounded-full bg-white text-[#0a0a0a] shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:bg-white/85 transition-colors`}
      >
        {open ? <X size={22} aria-hidden /> : <MessageCircle size={22} aria-hidden />}
      </button>

      {open && (
        <div
          id="chat-panel"
          role="dialog"
          aria-labelledby="chat-title"
          onKeyDown={(e) => e.key === 'Escape' && toggle(false)}
          className="fixed z-50 inset-x-3 bottom-3 md:inset-x-auto md:right-6 md:bottom-24 md:w-[380px] h-[min(560px,calc(100svh-1.5rem))] md:h-[min(560px,calc(100svh-8rem))] flex flex-col rounded-2xl border border-white/10 bg-[#111] shadow-[0_20px_60px_rgba(0,0,0,0.6)] text-white"
        >
          <header className="flex items-start justify-between gap-3 px-5 py-4 border-b border-white/10">
            <div>
              <h2 id="chat-title" className="flex items-center gap-2 text-[0.9375rem] font-medium">
                <span className={`w-2 h-2 rounded-full ${status === 'offline' ? 'bg-white/30' : 'bg-emerald-400'}`} aria-hidden />
                Harsh's AI assistant
                <span className="px-1.5 py-0.5 rounded border border-white/15 text-[0.625rem] tracking-wider text-white/60">AI</span>
              </h2>
              <p className="text-white/45 text-xs mt-1">Answers come from this site and can be wrong.</p>
            </div>
            <button type="button" onClick={() => toggle(false)} aria-label="Close chat" className="p-1 -m-1 text-white/50 hover:text-white">
              <X size={18} aria-hidden />
            </button>
          </header>

          <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 text-sm leading-relaxed" aria-live="polite">
            <p className="max-w-[85%] rounded-2xl rounded-tl-md bg-white/[0.06] px-4 py-2.5 text-white/85">{GREETING}</p>

            {messages.map((m, i) => (
              <p
                key={i}
                className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 ${m.role === 'user' ? 'ml-auto rounded-tr-md bg-white text-[#0a0a0a]' : 'rounded-tl-md bg-white/[0.06] text-white/85'
                  }`}
              >
                {m.role === 'assistant' ? <Linkified text={m.content} /> : m.content}
              </p>
            ))}

            {busy && (
              <p className="flex gap-1 w-fit rounded-2xl rounded-tl-md bg-white/[0.06] px-4 py-3.5" aria-label="Assistant is typing">
                {[0, 150, 300].map((d) => (
                  <span key={d} className="w-1.5 h-1.5 rounded-full bg-white/50 motion-safe:animate-pulse" style={{ animationDelay: `${d}ms` }} />
                ))}
              </p>
            )}

            {status === 'ready' && !messages.length && (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTIONS.map((s) => (
                  <button key={s} type="button" onClick={() => send(s)} className="px-3 py-1.5 rounded-full border border-white/15 text-white/70 text-xs hover:border-white/40 hover:text-white transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            )}

            {status === 'checking' && slow && (
              <p className="text-white/45 text-xs">Waking the assistant up — the first reply can take up to a minute.</p>
            )}
            {status === 'offline' && (
              <p className="text-white/60 text-xs">
                The assistant is offline right now. You can reach Harsh through the{' '}
                <Link to="/contact" onClick={() => toggle(false)} className="underline underline-offset-2 hover:text-white">contact page</Link>.
              </p>
            )}
            {error && <p role="alert" className="text-rose-300 text-xs">{error}</p>}
          </div>

          <form onSubmit={onSubmit} className="flex items-center gap-2 px-3 pt-3 pb-2 border-t border-white/10">
            <label htmlFor="chat-input" className="sr-only">Message</label>
            <input
              ref={inputRef}
              id="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={1000}
              autoComplete="off"
              disabled={status === 'offline'}
              placeholder={status === 'ready' ? 'Ask about Harsh’s work…' : status === 'offline' ? 'Assistant offline' : 'Connecting…'}
              className="flex-1 min-w-0 rounded-full bg-white/[0.06] border border-white/10 px-4 py-2.5 text-sm placeholder:text-white/35 focus:outline-none focus:border-white/30"
            />
            <button
              type="submit"
              disabled={busy || status !== 'ready' || !input.trim()}
              aria-label="Send message"
              className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-white text-[#0a0a0a] disabled:opacity-30 transition-opacity"
            >
              <Send size={16} aria-hidden />
            </button>
          </form>
          <p className="px-5 pb-3 text-[0.6875rem] text-white/35">Chats aren't saved here, but Google may use them to improve Gemini — please don't share sensitive info.</p>
        </div>
      )}
    </>
  );
}
