'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import Link from 'next/link';
import type { Profile, SavedOpportunity, SavedStatus } from '@/types/opportunity';
import type { User } from '@supabase/supabase-js';

const supabase = createClient();

const FREE_SCAN_LIMIT = 3;

const FRENCH_MONTHS = [
  'janvier', 'fevrier', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'aout', 'septembre', 'octobre', 'novembre', 'decembre',
];

function formatResetDate(isoDate: string): string {
  const date = new Date(isoDate);
  const day = date.getDate();
  const month = FRENCH_MONTHS[date.getMonth()];
  return `${day} ${month}`;
}

const STATUS_LABELS: Record<SavedStatus, { label: string; bg: string; text: string }> = {
  saved: { label: 'Sauvegarde', bg: 'bg-[#6366f1]/15', text: 'text-[#6366f1]' },
  launched: { label: 'Lance', bg: 'bg-[#4ade80]/15', text: 'text-[#4ade80]' },
  archived: { label: 'Archive', bg: 'bg-[#64748b]/15', text: 'text-[#64748b]' },
};

const STATUS_OPTIONS: SavedStatus[] = ['saved', 'launched', 'archived'];

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [savedOpportunities, setSavedOpportunities] = useState<SavedOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);

  // ── Auth + profile + saved opportunities on mount ──────────
  useEffect(() => {
    async function init() {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        window.location.href = '/';
        return;
      }

      setUser(authUser);

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profileData) {
        setProfile(profileData as Profile);
      }

      // Load saved opportunities
      const { data: saved } = await supabase
        .from('saved_opportunities')
        .select('*')
        .eq('user_id', authUser.id)
        .order('saved_at', { ascending: false });

      if (saved) {
        setSavedOpportunities(saved as SavedOpportunity[]);
      }

      setLoading(false);
    }

    init();
  }, []);

  // ── Upgrade to Pro ─────────────────────────────────────────
  async function handleUpgrade() {
    setUpgrading(true);
    setStripeError(null);
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setStripeError(data.error || 'Erreur lors de la redirection vers le paiement.');
        setUpgrading(false);
      }
    } catch {
      setStripeError('Erreur de connexion. Veuillez réessayer.');
      setUpgrading(false);
    }
  }

  // ── Manage subscription (Customer Portal) ────────────────
  async function handleManageSubscription() {
    setStripeError(null);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setStripeError(data.error || 'Erreur d\'accès au portail de gestion.');
      }
    } catch {
      setStripeError('Erreur de connexion. Veuillez réessayer.');
    }
  }

  // ── Change saved opportunity status ────────────────────────
  async function handleStatusChange(id: string, newStatus: SavedStatus) {
    const { error } = await supabase
      .from('saved_opportunities')
      .update({ status: newStatus })
      .eq('id', id);

    if (!error) {
      setSavedOpportunities((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: newStatus } : item
        )
      );
    }
  }

  // ── Logout ─────────────────────────────────────────────────
  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = '/';
  }

  // ── Loading state ──────────────────────────────────────────
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-[#1e293b]" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#6366f1] animate-spin" />
        </div>
      </div>
    );
  }

  const scansUsed = profile?.scans_this_month ?? 0;
  const scansPercentage = Math.min((scansUsed / FREE_SCAN_LIMIT) * 100, 100);

  return (
    <div className="min-h-screen bg-[#020617]">
      <div className="max-w-[960px] mx-auto px-4 py-6">
        {/* ═══ HEADER ═══ */}
        <header className="flex items-center gap-4 mb-8">
          <Link
            href="/dashboard"
            className="flex items-center justify-center w-9 h-9 rounded-[10px] bg-[#0c1222] border border-[#1e293b] text-[#94a3b8] hover:text-[#f1f5f9] hover:border-[#334155] transition-colors"
            aria-label="Retour au dashboard"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 3L6 9l6 6" />
            </svg>
          </Link>
          <h1 className="text-[22px] font-extrabold text-[#f1f5f9]">
            Parametres
          </h1>
        </header>

        {/* ═══ SECTION 1: ACCOUNT ═══ */}
        <section className="mb-6">
          <div className="bg-[#0c1222] border border-[#1e293b] rounded-[16px] p-6">
            <h2 className="text-[16px] font-bold text-[#f1f5f9] mb-4">
              Compte
            </h2>

            {/* Email */}
            <div className="mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
                Email
              </span>
              <p className="text-[14px] text-[#94a3b8] mt-1">
                {user.email}
              </p>
            </div>

            {/* Plan */}
            <div className="mb-5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
                Plan
              </span>
              <div className="mt-1.5">
                {profile?.plan === 'pro' ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-[8px] text-[12px] font-semibold bg-[#6366f1]/15 text-[#6366f1]">
                    Pro
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-[8px] text-[12px] font-semibold bg-[#111827] text-[#94a3b8]">
                    Gratuit
                  </span>
                )}
              </div>
            </div>

            {/* Stripe error message */}
            {stripeError && (
              <div className="mb-4 p-3 bg-[#f87171]/10 border border-[#f87171]/20 rounded-[10px]">
                <p className="text-[13px] text-[#f87171]">{stripeError}</p>
              </div>
            )}

            {/* Upgrade / Manage button */}
            {profile?.plan === 'pro' ? (
              <button
                onClick={handleManageSubscription}
                className="px-4 py-2.5 rounded-[10px] text-[13px] font-medium bg-[#111827] text-[#94a3b8] border border-[#1e293b] hover:text-[#f1f5f9] hover:border-[#334155] transition-colors cursor-pointer"
              >
                Gerer l&apos;abonnement
              </button>
            ) : (
              <button
                onClick={handleUpgrade}
                disabled={upgrading}
                className="px-5 py-2.5 rounded-[10px] text-[13px] font-semibold bg-[#6366f1] text-white hover:bg-[#818cf8] transition-all duration-200 shadow-lg shadow-[#6366f1]/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {upgrading ? 'Redirection...' : 'Passer au Pro'}
              </button>
            )}
          </div>
        </section>

        {/* ═══ SECTION 2: USAGE (free plan only) ═══ */}
        {profile?.plan === 'free' && (
          <section className="mb-6">
            <div className="bg-[#0c1222] border border-[#1e293b] rounded-[16px] p-6">
              <h2 className="text-[16px] font-bold text-[#f1f5f9] mb-4">
                Utilisation
              </h2>

              {/* Scans used counter */}
              <div className="flex items-baseline justify-between mb-3">
                <span className="text-[14px] text-[#94a3b8]">
                  <span className="text-[#f1f5f9] font-bold">{scansUsed}</span>
                  {' '}/{' '}{FREE_SCAN_LIMIT} scans ce mois
                </span>
                <span className="text-[12px] text-[#64748b]">
                  {scansUsed >= FREE_SCAN_LIMIT ? 'Limite atteinte' : `${FREE_SCAN_LIMIT - scansUsed} restant${FREE_SCAN_LIMIT - scansUsed > 1 ? 's' : ''}`}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-[#111827] rounded-full overflow-hidden mb-3">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${scansPercentage}%`,
                    backgroundColor: scansPercentage >= 100 ? '#f87171' : '#6366f1',
                  }}
                />
              </div>

              {/* Reset date */}
              {profile.scans_reset_date && (
                <p className="text-[12px] text-[#64748b]">
                  Reinitialisation le {formatResetDate(profile.scans_reset_date)}
                </p>
              )}
            </div>
          </section>
        )}

        {/* ═══ SECTION 3: SAVED OPPORTUNITIES (pro plan) ═══ */}
        {profile?.plan === 'pro' && (
          <section className="mb-6">
            <div className="bg-[#0c1222] border border-[#1e293b] rounded-[16px] p-6">
              <h2 className="text-[16px] font-bold text-[#f1f5f9] mb-4">
                Opportunites sauvegardees
              </h2>

              {savedOpportunities.length === 0 ? (
                <p className="text-[14px] text-[#64748b] text-center py-6">
                  Aucune opportunite sauvegardee
                </p>
              ) : (
                <div className="space-y-3">
                  {savedOpportunities.map((saved) => {
                    const statusConfig = STATUS_LABELS[saved.status];

                    return (
                      <div
                        key={saved.id}
                        className="bg-[#111827] border border-[#1e293b] rounded-[12px] p-4 flex flex-col sm:flex-row sm:items-center gap-3"
                      >
                        {/* Opportunity info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-[14px] font-semibold text-[#f1f5f9] truncate">
                            {saved.opportunity.name}
                          </h3>
                          <p className="text-[12px] text-[#94a3b8] italic truncate">
                            {saved.opportunity.tagline}
                          </p>
                        </div>

                        {/* Status badge + dropdown */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-[6px] text-[10px] font-semibold ${statusConfig.bg} ${statusConfig.text}`}
                          >
                            {statusConfig.label}
                          </span>

                          {/* Status change buttons */}
                          <div className="flex gap-1">
                            {STATUS_OPTIONS.filter((s) => s !== saved.status).map(
                              (status) => (
                                <button
                                  key={status}
                                  onClick={() => handleStatusChange(saved.id, status)}
                                  className="px-2 py-1 rounded-[6px] text-[10px] font-medium bg-[#0c1222] text-[#64748b] border border-[#1e293b] hover:text-[#94a3b8] hover:border-[#334155] transition-colors cursor-pointer"
                                  title={`Passer en ${STATUS_LABELS[status].label}`}
                                >
                                  {STATUS_LABELS[status].label}
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ═══ SECTION 4: DANGER ZONE ═══ */}
        <section className="mb-6">
          <div className="bg-[#f87171]/5 border border-[#f87171]/20 rounded-[16px] p-6">
            <h2 className="text-[16px] font-bold text-[#f1f5f9] mb-4">
              Zone de danger
            </h2>
            <button
              onClick={handleLogout}
              className="px-5 py-2.5 rounded-[10px] text-[13px] font-semibold bg-[#f87171]/10 text-[#f87171] border border-[#f87171]/30 hover:bg-[#f87171]/20 transition-colors cursor-pointer"
            >
              Se deconnecter
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
