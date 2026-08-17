const API_URL = import.meta.env.VITE_API_URL as string | undefined;

export const isApiConfigured = Boolean(API_URL);

/** POSTs JSON to `${VITE_API_URL}${path}`, throws with the server's error message on failure. */
export async function apiPost<T = unknown>(path: string, body: unknown): Promise<T> {
  if (!API_URL) {
    throw new Error('Backend isn\u2019t connected yet \u2014 set VITE_API_URL in frontend/.env');
  }
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || 'Something went wrong.');
  }
  return data as T;
}
