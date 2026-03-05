'use client';

import { createClient } from '@/lib/supabase-client';
import { ArrowLeft, Mail, Loader2, CheckCircle2, AlertCircle, Radar } from 'lucide-react';
import Link from 'next/link';
import { useState, type FormEvent } from 'react';

type AuthState = 'idle' | 'loading' | 'sent' | 'error';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [authState, setAuthState] = useState<AuthState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!email.trim()) return;

    setAuthState('loading');
    setErrorMessage('');

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setAuthState('error');
        setErrorMessage(error.message);
        return;
      }

      setAuthState('sent');
    } catch {
      setAuthState('error');
      setErrorMessage('Une erreur inattendue est survenue. Veuillez réessayer.');
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
      {/* Background gradient effect */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-accent-indigo/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent-violet/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Back to home link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="text-sm">Retour</span>
        </Link>

        {/* Card */}
        <div className="bg-bg-surface border border-border-default rounded-card p-8 shadow-2xl shadow-black/20">
          {/* Logo & Heading */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent-indigo/10 border border-accent-indigo/20 mb-5">
              <Radar className="w-7 h-7 text-accent-indigo" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-accent-indigo to-accent-violet bg-clip-text text-transparent tracking-tight">
              RADAR OPPORTUNITES
            </h1>
            <p className="text-text-secondary text-sm mt-2">
              Détectez votre prochain projet digital
            </p>
          </div>

          {/* Success state */}
          {authState === 'sent' ? (
            <div className="animate-scale-in">
              <div className="flex flex-col items-center text-center py-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
                <h2 className="text-text-primary font-semibold text-lg mb-2">
                  Lien magique envoyé !
                </h2>
                <p className="text-text-secondary text-sm leading-relaxed">
                  Vérifiez votre boîte mail. Un lien de connexion
                  a été envoyé à{' '}
                  <span className="text-text-primary font-medium">{email}</span>.
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-border-default">
                <button
                  type="button"
                  onClick={() => {
                    setAuthState('idle');
                    setEmail('');
                  }}
                  className="w-full text-sm text-text-secondary hover:text-text-primary transition-colors py-2"
                >
                  Utiliser une autre adresse email
                </button>
              </div>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-text-secondary mb-2"
                >
                  Adresse email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4 text-text-tertiary" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@exemple.com"
                    required
                    autoComplete="email"
                    autoFocus
                    disabled={authState === 'loading'}
                    className="w-full bg-bg-primary border border-border-default rounded-input py-3 pl-10 pr-4 text-text-primary placeholder-text-tertiary text-sm focus:outline-none focus:ring-2 focus:ring-accent-indigo/40 focus:border-accent-indigo transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Error message */}
              {authState === 'error' && errorMessage && (
                <div className="flex items-start gap-2.5 p-3 bg-red-500/5 border border-red-500/20 rounded-badge text-sm animate-fade-in">
                  <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                  <p className="text-red-300">{errorMessage}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={authState === 'loading' || !email.trim()}
                className="w-full flex items-center justify-center gap-2 bg-accent-indigo hover:bg-accent-indigo/90 disabled:bg-accent-indigo/50 text-white font-medium py-3 px-4 rounded-btn transition-all disabled:cursor-not-allowed text-sm"
              >
                {authState === 'loading' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    Envoyer le lien magique
                  </>
                )}
              </button>

              <p className="text-xs text-text-tertiary text-center leading-relaxed pt-1">
                Un lien de connexion sécurisé sera envoyé à votre adresse email.
                Aucun mot de passe nécessaire.
              </p>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-text-tertiary text-xs mt-6">
          En continuant, vous acceptez nos conditions d'utilisation.
        </p>
      </div>
    </div>
  );
}
