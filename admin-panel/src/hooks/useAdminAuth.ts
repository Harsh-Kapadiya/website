import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Session } from '@supabase/supabase-js';

export function useAdminAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Central admin check, shared by every sign-in method. Being a valid
  // Supabase user (password OR Google) isn't enough — only ids present in
  // public.admins actually get in. A valid-but-non-admin session gets
  // signed straight back out so nothing half-authenticated lingers.
  async function resolveSession(currentSession: Session | null) {
    if (!supabase || !currentSession) {
      setSession(null);
      setIsAdmin(false);
      return;
    }
    const { data } = await supabase.from('admins').select('id').eq('id', currentSession.user.id).maybeSingle();
    if (!data) {
      await supabase.auth.signOut();
      setSession(null);
      setIsAdmin(false);
      setAuthError('This account isn\u2019t an admin on this project.');
      return;
    }
    setSession(currentSession);
    setIsAdmin(true);
  }

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(async ({ data }) => {
      await resolveSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, sess) => {
      setLoading(true);
      await resolveSession(sess);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function signInWithPassword(email: string, password: string) {
    if (!supabase) return { error: 'Supabase is not configured yet.' };
    setAuthError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    // Success here just means valid credentials — resolveSession (fired by
    // onAuthStateChange) is what decides whether this account is an admin.
    return { error: null };
  }

  async function signInWithGoogle() {
    if (!supabase) return { error: 'Supabase is not configured yet.' };
    setAuthError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + import.meta.env.BASE_URL },
    });
    // On success the browser is about to navigate to Google — there's
    // nothing further to do here. An error at this point usually means
    // the Google provider isn't enabled in Supabase yet.
    if (error) return { error: error.message };
    return { error: null };
  }

  async function signOut() {
    await supabase?.auth.signOut();
    setSession(null);
    setIsAdmin(false);
  }

  return {
    loading,
    isAuthed: Boolean(session) && isAdmin,
    authError,
    clearAuthError: () => setAuthError(null),
    signInWithPassword,
    signInWithGoogle,
    signOut,
  };
}
