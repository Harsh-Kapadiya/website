import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

type Row = { id: string; page: string; section: string; key: string; value: string };

export function ContentBlocksEditor() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from('content_blocks')
      .select('*')
      .order('page')
      .order('section')
      .then(({ data }) => {
        if (data) setRows(data);
        setLoading(false);
      });
  }, []);

  function updateLocal(id: string, value: string) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, value } : r)));
  }

  async function save(row: Row) {
    if (!supabase) return;
    setSavingId(row.id);
    await supabase.from('content_blocks').update({ value: row.value }).eq('id', row.id);
    setSavingId(null);
  }

  if (loading) return <p className="text-white/30" style={{ fontSize: '0.875rem' }}>Loading…</p>;

  const grouped = rows.reduce<Record<string, Row[]>>((acc, r) => {
    const groupKey = `${r.page} / ${r.section}`;
    acc[groupKey] ??= [];
    acc[groupKey].push(r);
    return acc;
  }, {});

  return (
    <div>
      <h2 className="text-white mb-2" style={{ fontSize: '1.25rem', fontWeight: 500 }}>
        Page copy
      </h2>
      <p className="text-white/30 mb-6" style={{ fontSize: '0.8125rem' }}>
        Every text field below is live on the site — headings themselves stay fixed in code, everything else is editable here.
      </p>

      {rows.length === 0 ? (
        <p className="text-white/30" style={{ fontSize: '0.875rem' }}>
          No content blocks found — run supabase/schema.sql if you haven't yet.
        </p>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([group, groupRows]) => (
            <div key={group}>
              <p className="text-white/25 mb-3 uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.08em' }}>
                {group}
              </p>
              <div className="space-y-3">
                {groupRows.map((row) => (
                  <div key={row.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-4 flex flex-col md:flex-row gap-3 md:items-start">
                    <label className="text-white/40 shrink-0 md:w-40 pt-2" style={{ fontSize: '0.8125rem' }}>
                      {row.key.replace(/_/g, ' ')}
                    </label>
                    <textarea
                      rows={row.value.length > 100 ? 3 : 1}
                      value={row.value}
                      onChange={(e) => updateLocal(row.id, e.target.value)}
                      className="flex-1 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white resize-y focus:outline-none focus:border-white/30"
                      style={{ fontSize: '0.875rem' }}
                    />
                    <button
                      onClick={() => save(row)}
                      disabled={savingId === row.id}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 text-white hover:bg-white/15 transition-colors disabled:opacity-50 shrink-0"
                      style={{ fontSize: '0.8125rem' }}
                    >
                      <Save size={13} /> {savingId === row.id ? '…' : 'Save'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
