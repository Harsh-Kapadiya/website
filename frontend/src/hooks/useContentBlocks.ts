import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

type Blocks = Record<string, Record<string, string>>; // section -> key -> value

/**
 * Fetches every content_blocks row for a given page ('home', 'work', ...)
 * and returns a get(section, key, fallback) accessor. If Supabase isn't
 * configured, or a specific key hasn't been set yet, the fallback you
 * pass in is used — so the site never shows blank text.
 */
export function useContentBlocks(page: string) {
  const [blocks, setBlocks] = useState<Blocks>({});
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;

    supabase
      .from('content_blocks')
      .select('section, key, value')
      .eq('page', page)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.error('useContentBlocks:', error.message);
        } else if (data) {
          const grouped: Blocks = {};
          for (const row of data) {
            grouped[row.section] ??= {};
            grouped[row.section][row.key] = row.value;
          }
          setBlocks(grouped);
        }
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page]);

  function get(section: string, key: string, fallback: string): string {
    return blocks[section]?.[key] ?? fallback;
  }

  return { get, loading };
}
