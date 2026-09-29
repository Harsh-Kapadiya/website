import { useEffect, useState } from 'react';

// Many components on one page ask for the same table/page of copy.
// Share one in-flight request per key instead of firing duplicates.
const cache = new Map<string, Promise<unknown>>();

export function useCachedQuery<T>(key: string, run: (() => Promise<T>) | null): { data: T | undefined; loading: boolean } {
  const [data, setData] = useState<T>();
  const [loading, setLoading] = useState(Boolean(run));

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
