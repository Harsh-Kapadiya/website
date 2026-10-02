import { PostgrestClient } from '@supabase/postgrest-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
// Supabase renamed "anon key" to "publishable key" — accept either variable name.
const key = (import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) as string | undefined;

export const isSupabaseConfigured = Boolean(url && key);

// ponytail: the public site only reads tables, so it ships just the query client
// (not supabase-js with auth/storage/realtime, ~4x larger). Same headers supabase-js
// sends. Need login or file uploads here one day? Switch back to createClient.
export const supabase = isSupabaseConfigured
  ? new PostgrestClient(`${url!.replace(/\/$/, '')}/rest/v1`, { headers: { apikey: key!, Authorization: `Bearer ${key}` } })
  : null;
