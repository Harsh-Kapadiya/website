import { useEffect, useState } from 'react';
import { Check, Trash2, Star } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

type Row = {
  id: string;
  author: string;
  role: string | null;
  quote: string;
  rating: number;
  approved: boolean;
  created_at: string;
};

export function FeedbackModeration() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!supabase) return;
    setLoading(true);
    const { data } = await supabase.from('feedback').select('*').order('created_at', { ascending: false });
    if (data) setRows(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function approve(id: string) {
    if (!supabase) return;
    await supabase.from('feedback').update({ approved: true }).eq('id', id);
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, approved: true } : r)));
  }

  async function unapprove(id: string) {
    if (!supabase) return;
    await supabase.from('feedback').update({ approved: false }).eq('id', id);
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, approved: false } : r)));
  }

  async function remove(id: string) {
    if (!supabase || !confirm('Delete this feedback permanently?')) return;
    await supabase.from('feedback').delete().eq('id', id);
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  if (loading) return <p className="text-white/30" style={{ fontSize: '0.875rem' }}>Loading…</p>;

  return (
    <div>
      <h2 className="text-white mb-2" style={{ fontSize: '1.25rem', fontWeight: 500 }}>
        Feedback
      </h2>
      <p className="text-white/30 mb-6" style={{ fontSize: '0.8125rem' }}>
        The Testimonials section only shows approved entries — and disappears entirely if there are none.
      </p>

      {rows.length === 0 ? (
        <p className="text-white/30" style={{ fontSize: '0.875rem' }}>
          No submissions yet.
        </p>
      ) : (
        <div className="space-y-4">
          {rows.map((row) => (
            <div key={row.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <p className="text-white" style={{ fontSize: '0.9375rem', fontWeight: 500 }}>
                    {row.author} {row.role && <span className="text-white/30 font-normal">· {row.role}</span>}
                  </p>
                  <div className="flex gap-0.5 mt-1">
                    {Array.from({ length: row.rating }).map((_, i) => (
                      <Star key={i} size={12} className="fill-white/50 text-white/50" />
                    ))}
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full shrink-0 ${row.approved ? 'bg-emerald-400/10 text-emerald-400' : 'bg-white/10 text-white/40'}`}
                  style={{ fontSize: '0.7rem' }}
                >
                  {row.approved ? 'Live on site' : 'Pending review'}
                </span>
              </div>
              <p className="text-white/50 mb-4" style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
                "{row.quote}"
              </p>
              <div className="flex items-center gap-3">
                {row.approved ? (
                  <button
                    onClick={() => unapprove(row.id)}
                    className="px-3 py-1.5 rounded-lg bg-white/10 text-white hover:bg-white/15 transition-colors"
                    style={{ fontSize: '0.8rem' }}
                  >
                    Unpublish
                  </button>
                ) : (
                  <button
                    onClick={() => approve(row.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-[#0a0a0a] hover:bg-white/90 transition-colors"
                    style={{ fontSize: '0.8rem', fontWeight: 500 }}
                  >
                    <Check size={13} /> Approve
                  </button>
                )}
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
