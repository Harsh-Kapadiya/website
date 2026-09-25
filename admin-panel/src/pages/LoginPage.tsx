import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { isSupabaseConfigured } from '@/lib/supabaseClient';

export function LoginPage() {
  const { signInWithPassword, signInWithGoogle, isAuthed, authError, clearAuthError } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  if (isAuthed) navigate('/', { replace: true });

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    clearAuthError();
    const { error } = await signInWithPassword(email, password);
    setSubmitting(false);
    if (error) setFormError(error);
    // No manual navigate on success — the admin check runs in the
    // background and isAuthed flips true (triggering the redirect above)
    // once it's confirmed this account is actually an admin.
  }

  async function handleGoogleClick() {
    setGoogleLoading(true);
    setFormError(null);
    clearAuthError();
    const { error } = await signInWithGoogle();
    if (error) {
      setFormError(error);
      setGoogleLoading(false);
    }
    // On success the browser navigates to Google immediately — nothing
    // else to do here.
  }

  const shownError = formError || authError;

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="text-white/30 mb-2" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>
          HK ADMIN
        </p>
        <h1 className="text-white mb-8" style={{ fontSize: '1.75rem', fontWeight: 500 }}>
          Sign in
        </h1>

        {!isSupabaseConfigured && (
          <p className="text-amber-300/80 mb-6 rounded-lg border border-amber-300/20 bg-amber-300/5 p-3" style={{ fontSize: '0.8125rem' }}>
            Supabase isn't connected — add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to admin-panel/.env first.
          </p>
        )}

        <button
          type="button"
          onClick={handleGoogleClick}
          disabled={googleLoading || !isSupabaseConfigured}
          className="w-full py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white hover:bg-white/10 transition-colors disabled:opacity-50 flex items-center justify-center gap-3 mb-6"
          style={{ fontSize: '0.9375rem', fontWeight: 500 }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
            <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9C16.66 14.2 17.64 11.9 17.64 9.2z" />
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.83.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 0 0 9 18z" />
            <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.03l2.99-2.33z" />
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.97l2.99 2.33C4.66 5.17 6.65 3.58 9 3.58z" />
          </svg>
          {googleLoading ? 'Redirecting…' : 'Continue with Google'}
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-white/25" style={{ fontSize: '0.75rem' }}>
            or
          </span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-white/40 mb-2" style={{ fontSize: '0.8125rem' }}>
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30"
              style={{ fontSize: '0.9375rem' }}
            />
          </div>
          <div>
            <label className="block text-white/40 mb-2" style={{ fontSize: '0.8125rem' }}>
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30"
              style={{ fontSize: '0.9375rem' }}
            />
          </div>
          {shownError && (
            <p className="text-red-400" style={{ fontSize: '0.8125rem' }}>
              {shownError}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-white text-[#0a0a0a] hover:bg-white/90 transition-colors disabled:opacity-50"
            style={{ fontSize: '0.9375rem', fontWeight: 500 }}
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-white/20 mt-8" style={{ fontSize: '0.75rem' }}>
          Only accounts added to the <code className="text-white/40">admins</code> table in Supabase can sign in here — for either method.
        </p>
      </div>
    </div>
  );
}
