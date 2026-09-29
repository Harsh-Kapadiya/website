import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

type Row = { id: string; page: string; section: string; key: string; value: string };

/** Every editable piece of page copy, grouped by page / section. */
export function ContentBlocksEditor() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<Record<string, string>>({});

  useEffect(() => {
    supabase
      ?.from('content_blocks')
      .select('*')
      .order('page')
      .order('section')
      .order('key')
      .then(({ data }) => {
        setRows(data ?? []);
        setLoading(false);
      });
  }, []);

  async function save(row: Row) {
    if (!supabase) return;
    setStatus((s) => ({ ...s, [row.id]: 'Saving…' }));
    const { error } = await supabase.from('content_blocks').update({ value: row.value }).eq('id', row.id);
    setStatus((s) => ({ ...s, [row.id]: error ? error.message : 'Saved' }));
  }

  if (loading) return <p className="text-white/40 text-sm">Loading…</p>;

  const groups = rows.reduce<Record<string, Row[]>>((acc, r) => {
    (acc[`${r.page} / ${r.section}`] ??= []).push(r);
    return acc;
  }, {});

  return (
    <div>
      <h2 className="text-white mb-2 text-xl font-medium">Page copy</h2>
      <p className="text-white/40 mb-6 text-[0.8125rem]">
        Every text on the site except headings. Includes the response-time promise (home / contact), the hero 3D scene URL, and the location used in local search schema.
      </p>
      {rows.length === 0 && <p className="text-white/40 text-sm">No content found — run supabase/schema.sql first.</p>}
      <div className="space-y-8">
        {Object.entries(groups).map(([group, groupRows]) => (
          <section key={group}>
            <h3 className="text-white/40 mb-3 uppercase text-xs tracking-[0.08em]">{group}</h3>
            <div className="space-y-3">
              {groupRows.map((row) => (
                <div key={row.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-4 flex flex-col md:flex-row gap-3 md:items-start">
                  <label htmlFor={row.id} className="text-white/60 shrink-0 md:w-40 pt-2 text-[0.8125rem]">{row.key.replace(/_/g, ' ')}</label>
                  <textarea
                    id={row.id}
                    rows={row.value.length > 90 ? 3 : 1}
                    value={row.value}
                    onChange={(e) => setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, value: e.target.value } : r)))}
                    className="flex-1 bg-white/[0.04] border border-white/15 rounded-lg px-3 py-2 text-white resize-y focus:outline-none focus:border-white/40 text-sm"
                  />
                  <div className="flex md:flex-col items-center gap-2 shrink-0">
                    <button onClick={() => save(row)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 text-white hover:bg-white/15 text-[0.8125rem]">
                      <Save size={13} aria-hidden /> Save
                    </button>
                    {status[row.id] && <span className={`text-[0.7rem] ${status[row.id] === 'Saved' || status[row.id] === 'Saving…' ? 'text-emerald-400' : 'text-red-400'}`}>{status[row.id]}</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
