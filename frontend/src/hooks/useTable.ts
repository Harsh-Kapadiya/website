import { supabase } from '@/lib/supabaseClient';
import { useCachedQuery } from './useSupabaseQuery';

type Options = { orderBy?: string; ascending?: boolean; approvedOnly?: boolean };

/**
 * Rows from a content table. While loading → [] (no flash of placeholder
 * content). Supabase not configured, or table empty → `fallback`.
 * Pass fallback `[]` for data that must never be faked (reviews).
 */
export function useTable<T>(table: string, fallback: T[], { orderBy = 'sort_order', ascending = true, approvedOnly = false }: Options = {}) {
  const { data, loading } = useCachedQuery<T[]>(
    `table:${table}:${orderBy}:${approvedOnly}`,
    supabase
      ? async () => {
          let q = supabase!.from(table).select('*').order(orderBy, { ascending });
          if (approvedOnly) q = q.eq('approved', true);
          const { data: rows, error } = await q;
          if (error) throw error;
          return (rows ?? []) as T[];
        }
      : null
  );
  if (!supabase) return { data: fallback, loading: false };
  if (loading) return { data: [] as T[], loading: true };
  return { data: data && data.length ? data : fallback, loading: false };
}
