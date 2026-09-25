import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

/**
 * Fetches all rows from `table`, ordered by `orderBy` (default: sort_order).
 * Falls back to `fallback` when Supabase isn't configured or the table is
 * empty — so sections like Services/Work/About never render blank before
 * you've populated them from /admin.
 */
export function useTable<T>(table: string, fallback: T[], orderBy = 'sort_order'): {
  data: T[];
  loading: boolean;
  refetch: () => void;
} {
  const [data, setData] = useState<T[]>(fallback);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;

    supabase
      .from(table)
      .select('*')
      .order(orderBy, { ascending: true })
      .then(({ data: rows, error }) => {
        if (cancelled) return;
        if (error) {
          console.error(`useTable(${table}):`, error.message);
        } else if (rows && rows.length > 0) {
          setData(rows as T[]);
        } else {
          setData(fallback);
        }
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, orderBy, tick]);

  return { data, loading, refetch: () => setTick((t) => t + 1) };
}

/** Same idea, but for tables where an empty result should stay empty
 *  (e.g. feedback) rather than falling back to placeholder content. */
export function useTableNoFallback<T>(table: string, filter?: (q: any) => any, orderBy = 'created_at') {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    let query = supabase.from(table).select('*').order(orderBy, { ascending: false });
    if (filter) query = filter(query);

    query.then(({ data: rows, error }: any) => {
      if (cancelled) return;
      if (error) console.error(`useTableNoFallback(${table}):`, error.message);
      setData((rows ?? []) as T[]);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, orderBy]);

  return { data, loading };
}
