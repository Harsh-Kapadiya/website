import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

type ResumeFile = { id?: string; file_url: string; label: string };
const field = 'w-full bg-white/[0.04] border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-white/40 text-sm';

export function ResumeFileEditor() {
  const [row, setRow] = useState<ResumeFile>({ file_url: '', label: 'Download Resume' });
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    supabase?.from('resume_files').select('*').order('updated_at', { ascending: false }).limit(1).then(({ data }) => data?.[0] && setRow(data[0]));
  }, []);

  async function save() {
    if (!supabase) return;
    setStatus('Saving…');
    const values = { file_url: row.file_url.trim(), label: row.label.trim() || 'Download Resume' };
    const { data, error } = row.id
      ? await supabase.from('resume_files').update(values).eq('id', row.id).select().single()
      : await supabase.from('resume_files').insert(values).select().single();
    if (data) setRow(data);
    setStatus(error ? error.message : 'Saved');
  }

  return (
    <div>
      <h2 className="text-white mb-2 text-xl font-medium">Resume download</h2>
      <p className="text-white/40 mb-6 text-[0.8125rem]">
        Upload your PDF to Supabase Storage (a public bucket) and paste its public https:// URL. The download button appears on /resume once this is set.
      </p>
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 max-w-lg space-y-4">
        <div>
          <label htmlFor="rf-url" className="block text-white/50 mb-1.5 text-xs">File URL</label>
          <input id="rf-url" value={row.file_url} onChange={(e) => setRow({ ...row, file_url: e.target.value })} placeholder="https://…supabase.co/storage/v1/object/public/resume/harsh-kapadiya.pdf" className={field} />
        </div>
        <div>
          <label htmlFor="rf-label" className="block text-white/50 mb-1.5 text-xs">Button label</label>
          <input id="rf-label" value={row.label} onChange={(e) => setRow({ ...row, label: e.target.value })} className={field} />
        </div>
        <div className="flex items-center gap-3">
          <button onClick={save} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white text-[#0a0a0a] hover:bg-white/90 text-[0.8125rem] font-medium">
            <Save size={13} aria-hidden /> Save
          </button>
          {status && <span className={`text-xs ${status === 'Saved' || status === 'Saving…' ? 'text-emerald-400' : 'text-red-400'}`}>{status}</span>}
        </div>
      </div>
    </div>
  );
}
