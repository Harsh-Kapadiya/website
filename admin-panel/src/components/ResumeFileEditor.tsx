import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

type ResumeFile = { id: string; file_url: string; label: string };

export function ResumeFileEditor() {
  const [row, setRow] = useState<ResumeFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from('resume_files')
      .select('*')
      .limit(1)
      .then(({ data }) => {
        if (data && data[0]) setRow(data[0]);
        setLoading(false);
      });
  }, []);

  async function save() {
    if (!supabase) return;
    setSaving(true);
    if (row?.id) {
      await supabase.from('resume_files').update({ file_url: row.file_url, label: row.label }).eq('id', row.id);
    } else {
      const { data } = await supabase
        .from('resume_files')
        .insert({ file_url: row?.file_url ?? '', label: row?.label ?? 'Download Resume' })
        .select()
        .single();
      if (data) setRow(data);
    }
    setSaving(false);
  }

  if (loading) return <p className="text-white/30" style={{ fontSize: '0.875rem' }}>Loading…</p>;

  return (
    <div>
      <h2 className="text-white mb-2" style={{ fontSize: '1.25rem', fontWeight: 500 }}>
        Resume download
      </h2>
      <p className="text-white/30 mb-6" style={{ fontSize: '0.8125rem' }}>
        Upload your PDF to Supabase Storage (or any host), then paste the public URL here. The download
        button only appears on the Resume page once this is set.
      </p>

      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 max-w-lg space-y-4">
        <div>
          <label className="block text-white/40 mb-1.5" style={{ fontSize: '0.75rem' }}>
            File URL
          </label>
          <input
            value={row?.file_url ?? ''}
            onChange={(e) => setRow({ id: row?.id ?? '', label: row?.label ?? 'Download Resume', file_url: e.target.value })}
            placeholder="https://your-project.supabase.co/storage/v1/object/public/resume/harsh-resume.pdf"
            className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-white/30"
            style={{ fontSize: '0.875rem' }}
          />
        </div>
        <div>
          <label className="block text-white/40 mb-1.5" style={{ fontSize: '0.75rem' }}>
            Button label
          </label>
          <input
            value={row?.label ?? 'Download Resume'}
            onChange={(e) => setRow({ id: row?.id ?? '', file_url: row?.file_url ?? '', label: e.target.value })}
            className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-white/30"
            style={{ fontSize: '0.875rem' }}
          />
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white text-[#0a0a0a] hover:bg-white/90 transition-colors disabled:opacity-50"
          style={{ fontSize: '0.8125rem', fontWeight: 500 }}
        >
          <Save size={13} /> {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
}
