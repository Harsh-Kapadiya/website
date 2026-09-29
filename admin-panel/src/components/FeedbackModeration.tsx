import { useEffect, useState } from 'react';
import { Check, Trash2, Star, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

type Row = { id: string; author: string; role: string | null; quote: string; rating: number; approved: boolean; created_at: string };

/** Reviews arrive unapproved. Only approved ones appear on the site. */
export function FeedbackModeration() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      ?.from('feedback')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setRows(data ?? []);
        setLoading(false);
      });
  }, []);

  async function setApproved(id: string, approved: boolean) {
    const { error } = await supabase!.from('feedback').update({ approved }).eq('id', id);
    if (!error) setRows((prev) => prev.map((r) => (r.id === id ? { ...r, approved } : r)));
  }
  async function remove(id: string) {
    if (!confirm('Delete this review permanently?')) return;
    const { error } = await supabase!.from('feedback').delete().eq('id', id);
    if (!error) setRows((prev) => prev.filter((r) => r.id !== id));
  }

  if (loading) return <p className="text-white/40 text-sm">Loading…</p>;
  const pending = rows.filter((r) => !r.approved).length;

  return (
    <div>
      <h2 className="text-white mb-2 text-xl font-medium">Reviews {pending > 0 && <span className="text-white/40 font-normal">({pending} pending)</span>}</h2>
      <p className="text-white/40 mb-6 text-[0.8125rem]">Only approved reviews appear in "What clients say" — the section stays hidden until at least one is approved.</p>
      {rows.length === 0 ? (
        <p className="text-white/40 text-sm">No reviews yet. Share yoursite.com/feedback with past clients.</p>
      ) : (
        <div className="space-y-4">
          {rows.map((r) => (
            <div key={r.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <p className="text-white font-medium">{r.author} {r.role && <span className="text-white/40 font-normal">· {r.role}</span>}</p>
                  <div className="flex gap-0.5 mt-1" aria-label={`${r.rating} of 5`}>
                    {Array.from({ length: r.rating }, (_, i) => <Star key={i} size={12} aria-hidden className="fill-white/60 text-white/60" />)}
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full shrink-0 text-[0.7rem] ${r.approved ? 'bg-emerald-400/10 text-emerald-400' : 'bg-white/10 text-white/50'}`}>
                  {r.approved ? 'Live on site' : 'Pending'}
                </span>
              </div>
              <p className="text-white/70 mb-4 text-sm leading-relaxed">“{r.quote}”</p>
              <div className="flex items-center gap-3">
                {r.approved ? (
                  <button onClick={() => setApproved(r.id, false)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 text-white hover:bg-white/15 text-[0.8rem]">
                    <EyeOff size={13} aria-hidden /> Unpublish
                  </button>
                ) : (
                  <button onClick={() => setApproved(r.id, true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-[#0a0a0a] hover:bg-white/90 text-[0.8rem] font-medium">
                    <Check size={13} aria-hidden /> Approve
                  </button>
                )}
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
