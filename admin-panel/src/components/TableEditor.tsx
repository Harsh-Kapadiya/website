import { useEffect, useState } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export type FieldConfig = {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'tags' | 'select';
  options?: string[]; // for 'select'
  placeholder?: string;
};

type Row = Record<string, any>;

export function TableEditor({
  table,
  title,
  hint,
  fields,
  orderBy = 'sort_order',
  emptyRow,
}: {
  table: string;
  title: string;
  hint?: string;
  fields: FieldConfig[];
  orderBy?: string;
  emptyRow: Row;
}) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase.from(table).select('*').order(orderBy, { ascending: true });
    if (!error && data) setRows(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table]);

  function updateLocal(id: string, key: string, value: any) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [key]: value } : r)));
  }

  async function saveRow(row: Row) {
    if (!supabase) return;
    setSavingId(row.id);
    const { id, ...rest } = row;
    const { error } = await supabase.from(table).update(rest).eq('id', id);
    setSavingId(null);
    setMessage(error ? error.message : 'Saved');
    setTimeout(() => setMessage(null), 2000);
  }

  async function addRow() {
    if (!supabase) return;
    const nextOrder = rows.length;
    const { data, error } = await supabase
      .from(table)
      .insert({ ...emptyRow, [orderBy]: nextOrder })
      .select()
      .single();
    if (!error && data) setRows((prev) => [...prev, data]);
    else if (error) setMessage(error.message);
  }

  async function deleteRow(id: string) {
    if (!supabase) return;
    if (!confirm('Delete this item?')) return;
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (!error) setRows((prev) => prev.filter((r) => r.id !== id));
    else setMessage(error.message);
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-2 gap-4">
        <h2 className="text-white" style={{ fontSize: '1.25rem', fontWeight: 500 }}>
          {title}
        </h2>
        <div className="flex items-center gap-3 shrink-0">
          {message && (
            <span className="text-emerald-400" style={{ fontSize: '0.8rem' }}>
              {message}
            </span>
          )}
          <button
            onClick={addRow}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-[#0a0a0a] hover:bg-white/90 transition-colors"
            style={{ fontSize: '0.8125rem', fontWeight: 500 }}
          >
            <Plus size={14} /> Add
          </button>
        </div>
      </div>
      {hint && (
        <p className="text-white/30 mb-6" style={{ fontSize: '0.8125rem' }}>
          {hint}
        </p>
      )}

      {loading ? (
        <p className="text-white/30" style={{ fontSize: '0.875rem' }}>
          Loading…
        </p>
      ) : rows.length === 0 ? (
        <p className="text-white/30" style={{ fontSize: '0.875rem' }}>
          Nothing here yet — click Add to create the first one.
        </p>
      ) : (
        <div className="space-y-4">
          {rows.map((row) => (
            <div key={row.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {fields.map((f) => (
                  <div key={f.key} className={f.type === 'textarea' ? 'md:col-span-2' : ''}>
                    <label className="block text-white/40 mb-1.5" style={{ fontSize: '0.75rem' }}>
                      {f.label}
                    </label>
                    {f.type === 'textarea' ? (
                      <textarea
                        rows={3}
                        value={row[f.key] ?? ''}
                        onChange={(e) => updateLocal(row.id, f.key, e.target.value)}
                        placeholder={f.placeholder}
                        className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white resize-none focus:outline-none focus:border-white/30"
                        style={{ fontSize: '0.875rem' }}
                      />
                    ) : f.type === 'tags' ? (
                      <input
                        value={Array.isArray(row[f.key]) ? row[f.key].join(', ') : row[f.key] ?? ''}
                        onChange={(e) =>
                          updateLocal(
                            row.id,
                            f.key,
                            e.target.value.split(',').map((t) => t.trim()).filter(Boolean)
                          )
                        }
                        placeholder="Comma-separated tags"
                        className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-white/30"
                        style={{ fontSize: '0.875rem' }}
                      />
                    ) : f.type === 'select' ? (
                      <select
                        value={row[f.key] ?? ''}
                        onChange={(e) => updateLocal(row.id, f.key, e.target.value)}
                        className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-white/30"
                        style={{ fontSize: '0.875rem' }}
                      >
                        {f.options?.map((opt) => (
                          <option key={opt} value={opt} className="bg-[#0a0a0a]">
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={f.type === 'number' ? 'number' : 'text'}
                        value={row[f.key] ?? ''}
                        onChange={(e) => updateLocal(row.id, f.key, e.target.value)}
                        placeholder={f.placeholder}
                        className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-white/30"
                        style={{ fontSize: '0.875rem' }}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => saveRow(row)}
                  disabled={savingId === row.id}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/15 transition-colors disabled:opacity-50"
                  style={{ fontSize: '0.8125rem' }}
                >
                  <Save size={13} /> {savingId === row.id ? 'Saving…' : 'Save'}
                </button>
                <button
                  onClick={() => deleteRow(row.id)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors"
                  style={{ fontSize: '0.8125rem' }}
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
