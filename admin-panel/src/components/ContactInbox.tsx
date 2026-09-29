import { useEffect, useState } from 'react';
import { Mail, MailOpen, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

type Row = { id: string; name: string; email: string; message: string; read: boolean; created_at: string };

export function ContactInbox() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      ?.from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setRows(data ?? []);
        setLoading(false);
      });
  }, []);

  async function setRead(id: string, read: boolean) {
    const { error } = await supabase!.from('contact_messages').update({ read }).eq('id', id);
    if (!error) setRows((prev) => prev.map((r) => (r.id === id ? { ...r, read } : r)));
  }
  async function remove(id: string) {
    if (!confirm('Delete this message permanently?')) return;
    const { error } = await supabase!.from('contact_messages').delete().eq('id', id);
    if (!error) setRows((prev) => prev.filter((r) => r.id !== id));
  }

  if (loading) return <p className="text-white/40 text-sm">Loading…</p>;
  const unread = rows.filter((r) => !r.read).length;

  return (
    <div>
      <h2 className="text-white mb-2 text-xl font-medium">Inbox {unread > 0 && <span className="text-white/40 font-normal">({unread} unread)</span>}</h2>
      <p className="text-white/40 mb-6 text-[0.8125rem]">Every contact form submission — also emailed to you as it arrives.</p>
      {rows.length === 0 ? (
        <p className="text-white/40 text-sm">No messages yet.</p>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r.id} className={`rounded-xl border p-5 ${r.read ? 'border-white/10 bg-white/[0.015]' : 'border-white/20 bg-white/[0.04]'}`}>
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <p className="text-white font-medium">{r.name}</p>
                  <a href={`mailto:${r.email}`} className="text-white/50 hover:text-white text-[0.8125rem]">{r.email}</a>
                </div>
                <time dateTime={r.created_at} className="text-white/30 shrink-0 text-xs">{new Date(r.created_at).toLocaleString()}</time>
              </div>
              <p className="text-white/70 mb-4 whitespace-pre-wrap text-sm leading-relaxed">{r.message}</p>
              <div className="flex items-center gap-3">
                <button onClick={() => setRead(r.id, !r.read)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 text-white hover:bg-white/15 text-[0.8rem]">
                  {r.read ? <Mail size={13} aria-hidden /> : <MailOpen size={13} aria-hidden />} {r.read ? 'Mark unread' : 'Mark read'}
                </button>
                <button onClick={() => remove(r.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-red-400 hover:bg-red-400/10 text-[0.8rem]">
                  <Trash2 size={13} aria-hidden /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
