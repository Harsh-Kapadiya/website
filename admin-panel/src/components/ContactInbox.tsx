import { useEffect, useState } from 'react';
import { Mail, MailOpen, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

type Row = {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  created_at: string;
};

export function ContactInbox() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
    if (!error && data) setRows(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function markRead(id: string, read: boolean) {
    if (!supabase) return;
    await supabase.from('contact_messages').update({ read }).eq('id', id);
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, read } : r)));
  }

  async function remove(id: string) {
    if (!supabase || !confirm('Delete this message permanently?')) return;
    await supabase.from('contact_messages').delete().eq('id', id);
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  if (loading) return <p className="text-white/30" style={{ fontSize: '0.875rem' }}>Loading…</p>;

  const unreadCount = rows.filter((r) => !r.read).length;

  return (
    <div>
      <h2 className="text-white mb-2" style={{ fontSize: '1.25rem', fontWeight: 500 }}>
        Inbox {unreadCount > 0 && <span className="text-white/40 font-normal">({unreadCount} unread)</span>}
      </h2>
      <p className="text-white/30 mb-6" style={{ fontSize: '0.8125rem' }}>
        Contact form submissions — you also get an email for each one as it comes in.
      </p>

      {rows.length === 0 ? (
        <p className="text-white/30" style={{ fontSize: '0.875rem' }}>
          No messages yet.
        </p>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <div
              key={row.id}
              className={`rounded-xl border p-5 ${row.read ? 'border-white/8 bg-white/[0.015]' : 'border-white/15 bg-white/[0.035]'}`}
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <p className="text-white" style={{ fontSize: '0.9375rem', fontWeight: 500 }}>
                    {row.name}
                  </p>
                  <a href={`mailto:${row.email}`} className="text-white/40 hover:text-white transition-colors" style={{ fontSize: '0.8125rem' }}>
                    {row.email}
                  </a>
                </div>
                <span className="text-white/25 shrink-0" style={{ fontSize: '0.75rem' }}>
                  {new Date(row.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <p className="text-white/50 mb-4 whitespace-pre-wrap" style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
                {row.message}
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => markRead(row.id, !row.read)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 text-white hover:bg-white/15 transition-colors"
                  style={{ fontSize: '0.8rem' }}
                >
                  {row.read ? <Mail size={13} /> : <MailOpen size={13} />}
                  {row.read ? 'Mark unread' : 'Mark read'}
                </button>
                <button
                  onClick={() => remove(row.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors"
                  style={{ fontSize: '0.8rem' }}
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
