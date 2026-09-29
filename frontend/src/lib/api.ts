const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '');

/** POSTs JSON to the backend; throws an Error with a human-readable message on failure. */
export async function apiPost(path: string, body: unknown): Promise<void> {
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
}
