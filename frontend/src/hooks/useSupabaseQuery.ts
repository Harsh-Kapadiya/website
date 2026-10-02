import { useEffect, useState } from 'react';
import { ssr } from '@/lib/ssr';

// Many components on one page ask for the same table/page of copy.
// Share one in-flight request per key instead of firing duplicates.
const cache = new Map<string, Promise<unknown>>();

// Rows the build-time pre-render embedded in this page: the first render shows
// real content at once, then the effect below still refreshes from the database.
const seed: Record<string, unknown> =
  typeof document === 'undefined' ? {} : JSON.parse(document.getElementById('ssr-data')?.textContent || '{}');

export function useCachedQuery<T>(key: string, run: (() => Promise<T>) | null): { data: T | undefined; loading: boolean } {
  if (ssr.active && run) {
    ssr.used.add(key);
    if (!ssr.data.has(key)) ssr.pending.set(key, run);
  }
  const ready = ssr.active ? ssr.data.has(key) : key in seed;
  const [data, setData] = useState<T | undefined>(() => (ssr.active ? ssr.data.get(key) : seed[key]) as T | undefined);
  const [loading, setLoading] = useState(Boolean(run) && !ready);

  useEffect(() => {
    if (!run) return;
    let alive = true;
    if (!cache.has(key)) cache.set(key, run().catch((e) => { cache.delete(key); throw e; }));
    (cache.get(key) as Promise<T>)
      .then((d) => alive && setData(d))
      .catch((e) => console.error(`query ${key}:`, e))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { data, loading };
}
