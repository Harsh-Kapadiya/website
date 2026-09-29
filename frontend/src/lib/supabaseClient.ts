import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
// Supabase renamed "anon key" to "publishable key" — accept either variable name.
const key = (import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) as string | undefined;

export const isSupabaseConfigured = Boolean(url && key);

// The public site never signs anyone in. persistSession:false also stops it
// from picking up an admin-panel session stored on the same domain.
export const supabase = isSupabaseConfigured
  ? createClient(url!, key!, { auth: { persistSession: false, autoRefreshToken: false } })
  : null;
