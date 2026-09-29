import { supabase } from '@/lib/supabaseClient';
import { useCachedQuery } from './useSupabaseQuery';

type Blocks = Record<string, Record<string, string>>;

/** get(section, key, fallback) for one page's admin-editable copy. */
export function useContentBlocks(page: string) {
  const { data } = useCachedQuery<Blocks>(
    `content:${page}`,
    supabase
      ? async () => {
          const { data: rows, error } = await supabase!.from('content_blocks').select('section, key, value').eq('page', page);
          if (error) throw error;
          const grouped: Blocks = {};
          for (const r of rows ?? []) (grouped[r.section] ??= {})[r.key] = r.value;
          return grouped;
        }
      : null
  );
  return { get: (section: string, key: string, fallback: string) => data?.[section]?.[key] || fallback };
}
