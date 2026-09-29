import { createContext, useContext, useEffect, useState, createElement, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';

type AuthState = { loading: boolean; isAdmin: boolean; error: string | null };
type AuthApi = AuthState & {
  signInWithPassword: (email: string, password: string) => Promise<string | null>;
  signInWithGoogle: () => Promise<string | null>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthApi | null>(null);

/**
 * One shared auth state for the whole app. Being a valid Supabase user
 * (password OR Google) is not enough — the user's id must also be in
 * public.admins. RLS enforces the same rule on every write regardless.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ loading: Boolean(supabase), isAdmin: false, error: null });

  async function resolve(session: Session | null) {
    if (!supabase || !session) {
      setState((s) => ({ ...s, loading: false, isAdmin: false }));
      return;
    }
    const { data, error } = await supabase.from('admins').select('id').eq('id', session.user.id).maybeSingle();
    if (data) {
      setState({ loading: false, isAdmin: true, error: null });
      return;
    }
    await supabase.auth.signOut();
    setState({
      loading: false,
      isAdmin: false,
      error: error
        ? 'Couldn’t verify admin access. Make sure supabase/schema.sql has been run.'
        : `${session.user.email ?? 'This account'} isn’t an admin yet. Add its user id to the admins table (see README).`,
    });
  }

  useEffect(() => {
    if (!supabase) return;
    // Fires INITIAL_SESSION immediately, which also covers returning from Google.
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      // Supabase: never await other supabase calls inside this callback (it can
      // deadlock the auth lock) — hand off to the next tick instead.
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        setTimeout(() => resolve(session), 0);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const api: AuthApi = {
    ...state,
    async signInWithPassword(email, password) {
      if (!supabase) return 'Supabase isn’t configured.';
      setState((s) => ({ ...s, error: null }));
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return error ? error.message : null; // the admin check runs via onAuthStateChange
    },
    async signInWithGoogle() {
      if (!supabase) return 'Supabase isn’t configured.';
      setState((s) => ({ ...s, error: null }));
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin + import.meta.env.BASE_URL },
      });
      return error ? error.message : null; // on success the browser is already leaving for Google
    },
    async signOut() {
      await supabase?.auth.signOut();
    },
  };

  return createElement(AuthContext.Provider, { value: api }, children);
}

export function useAdminAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used inside <AuthProvider>');
  return ctx;
}
