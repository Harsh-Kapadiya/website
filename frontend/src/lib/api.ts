const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '');

/** POSTs JSON to the backend and returns its JSON; throws an Error with a human-readable message on failure. */
export async function apiPost<T = unknown>(path: string, body: unknown): Promise<T> {
  if (!API_URL) throw new Error('The form isn’t connected yet — please email me directly.');
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error('Couldn’t reach the server. Check your connection and try again.');
  }
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(data.message || 'Something went wrong. Please try again.');
  }
  return (await res.json().catch(() => ({}))) as T;
}

/** Wakes the backend (Render's free plan sleeps) and reports whether the chat assistant is configured. */
export async function apiHealth(): Promise<{ ok: boolean; chat: boolean }> {
  if (!API_URL) return { ok: false, chat: false };
  try {
    const res = await fetch(`${API_URL}/api/health`);
    return res.ok ? { ok: true, chat: Boolean((await res.json()).chat) } : { ok: false, chat: false };
  } catch {
    return { ok: false, chat: false };
  }
}
