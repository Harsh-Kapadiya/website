import { useEffect, useState } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export type FieldConfig = {
  key: string;
  label: string;
  type?: 'text' | 'textarea' | 'tags' | 'lines' | 'select'; // default: text
  options?: string[];
  placeholder?: string;
  hint?: string;
};

type Row = Record<string, any>;

const field = 'w-full bg-white/[0.04] border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-white/40 text-sm';

/** Generic add / edit / delete / reorder for one content table. */
export function TableEditor({
  table,
  title,
  hint,
  fields,
  newRow,
}: {
  table: string;
  title: string;
  hint?: string;
  fields: FieldConfig[];
  /** Called on "Add". Must produce unique values for the table's natural key. */
  newRow: () => Row;
}) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  function flash(text: string, ok: boolean) {
    setMessage({ text, ok });
    setTimeout(() => setMessage(null), ok ? 2000 : 6000);
  }

  useEffect(() => {
    if (!supabase) return;
    setLoading(true);
    supabase
      .from(table)
      .select('*')
      .order('sort_order', { ascending: true })
      .then(({ data, error }) => {
        if (error) flash(error.message, false);
        setRows(data ?? []);
        setLoading(false);
      });
  }, [table]);

  const update = (id: string, key: string, value: unknown) => setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [key]: value } : r)));

  async function save(row: Row) {
    if (!supabase) return;
    setSavingId(row.id);
    const { id, ...rest } = row;
    rest.sort_order = Number(rest.sort_order) || 0;
    const { error } = await supabase.from(table).update(rest).eq('id', id);
    setSavingId(null);
    flash(error ? error.message : 'Saved — live on the site now.', !error);
  }

  async function add() {
    if (!supabase) return;
    const { data, error } = await supabase.from(table).insert({ ...newRow(), sort_order: rows.length }).select().single();
    if (error) flash(error.message, false);
    else setRows((prev) => [...prev, data]);
  }

  async function remove(id: string) {
    if (!supabase || !confirm('Delete this item? This can’t be undone.')) return;
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) flash(error.message, false);
    else setRows((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-2">
        <h2 className="text-white text-xl font-medium">{title}</h2>
        <button onClick={add} className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-[#0a0a0a] hover:bg-white/90 text-[0.8125rem] font-medium shrink-0">
          <Plus size={14} aria-hidden /> Add
        </button>
      </div>
      {hint && <p className="text-white/40 mb-4 text-[0.8125rem]">{hint}</p>}
      {message && (
        <p role="status" className={`mb-4 text-[0.8125rem] ${message.ok ? 'text-emerald-400' : 'text-red-400'}`}>
          {message.text}
        </p>
      )}

      {loading ? (
        <p className="text-white/40 text-sm">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-white/40 text-sm">Nothing here yet — click Add to create the first one.</p>
      ) : (
        <div className="space-y-4">
          {rows.map((row) => (
            <div key={row.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {fields.map((f) => {
                  const id = `${row.id}-${f.key}`;
                  const wide = f.type === 'textarea' || f.type === 'lines';
                  return (
                    <div key={f.key} className={wide ? 'md:col-span-2' : ''}>
                      <label htmlFor={id} className="block text-white/50 mb-1.5 text-xs">{f.label}</label>
                      {f.type === 'textarea' ? (
                        <textarea id={id} rows={3} value={row[f.key] ?? ''} placeholder={f.placeholder} onChange={(e) => update(row.id, f.key, e.target.value)} className={`${field} resize-y`} />
                      ) : f.type === 'lines' ? (
                        <textarea
                          id={id}
                          rows={3}
                          value={(row[f.key] ?? []).join('\n')}
                          placeholder={f.placeholder}
                          onChange={(e) => update(row.id, f.key, e.target.value.split('\n').map((s) => s.trim()).filter(Boolean))}
                          className={`${field} resize-y font-mono text-xs`}
                        />
                      ) : f.type === 'tags' ? (
                        <input
                          id={id}
                          value={(row[f.key] ?? []).join(', ')}
                          placeholder="Comma-separated"
                          onChange={(e) => update(row.id, f.key, e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
                          className={field}
                        />
                      ) : f.type === 'select' ? (
                        <select id={id} value={row[f.key] ?? ''} onChange={(e) => update(row.id, f.key, e.target.value)} className={field}>
                          {f.options?.map((o) => <option key={o} value={o} className="bg-[#0a0a0a]">{o}</option>)}
                        </select>
                      ) : (
                        <input id={id} value={row[f.key] ?? ''} placeholder={f.placeholder} onChange={(e) => update(row.id, f.key, e.target.value)} className={field} />
                      )}
                      {f.hint && <p className="text-white/30 mt-1 text-[0.7rem]">{f.hint}</p>}
                    </div>
                  );
                })}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-white/50 text-xs">
                  Order
                  <input type="number" value={row.sort_order ?? 0} onChange={(e) => update(row.id, 'sort_order', e.target.value)} className={`${field} w-20`} />
                </label>
                <button onClick={() => save(row)} disabled={savingId === row.id} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/15 disabled:opacity-50 text-[0.8125rem]">
                  <Save size={13} aria-hidden /> {savingId === row.id ? 'Saving…' : 'Save'}
                </button>
                <button onClick={() => remove(row.id)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-red-400 hover:bg-red-400/10 text-[0.8125rem]">
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
