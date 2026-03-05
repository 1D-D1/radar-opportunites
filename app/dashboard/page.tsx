'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase-client';
import ScanAnimation from '@/components/ScanAnimation';
import MarketPulse from '@/components/MarketPulse';
import OpportunityCard from '@/components/OpportunityCard';
import BriefGenerator from '@/components/BriefGenerator';
import PricingGate from '@/components/PricingGate';
import type { Opportunity, Profile } from '@/types/opportunity';
import type { User } from '@supabase/supabase-js';

const supabase = createClient();

const FREE_SCAN_LIMIT = 3;

function formatDateFr(date: Date): string {
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentScan, setCurrentScan] = useState<{
    market_pulse: string;
    opportunities: Opportunity[];
    scan_date: string;
  } | null>(null);
  const [currentScanId, setCurrentScanId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBrief, setShowBrief] = useState<Opportunity | null>(null);
  const [savedToast, setSavedToast] = useState(false);

  // ── Start a new scan ──────────────────────────────────────────
  const startScan = useCallback(async () => {
    setIsScanning(true);
    setError(null);
    try {
      const res = await fetch('/api/scan', { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur scan');
      }
      const data = await res.json();
      setCurrentScan({
        market_pulse: data.market_pulse,
        opportunities: data.opportunities,
        scan_date: data.scan_date,
      });
      if (data.scan_id) {
        setCurrentScanId(data.scan_id);
      }

      // Refresh profile to update scans_this_month
      if (user) {
        const { data: updatedProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (updatedProfile) setProfile(updatedProfile as Profile);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsScanning(false);
    }
  }, [user]);

  // ── Load last scan ────────────────────────────────────────────
  const loadLastScan = useCallback(
    async (userId: string) => {
      const { data: scans } = await supabase
        .from('scans')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .order('scan_date', { ascending: false })
        .limit(1);

      if (scans && scans.length > 0) {
        const lastScan = scans[0];
        const scanAge = Date.now() - new Date(lastScan.scan_date).getTime();
        const twentyFourHours = 24 * 60 * 60 * 1000;

        if (scanAge > twentyFourHours) {
          startScan();
        } else {
          setCurrentScan({
            market_pulse: lastScan.market_pulse,
            opportunities: lastScan.opportunities,
            scan_date: lastScan.scan_date,
          });
          setCurrentScanId(lastScan.id);
        }
      } else {
        startScan();
      }
    },
    [startScan]
  );

  // ── Auth + profile check on mount ─────────────────────────────
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

      loadLastScan(authUser.id);
    }

    init();
  }, [loadLastScan]);

  // ── Save an opportunity ───────────────────────────────────────
  async function handleSave(opportunity: Opportunity) {
    if (!user) return;

    await supabase.from('saved_opportunities').insert({
      user_id: user.id,
      scan_id: currentScanId,
      opportunity: opportunity,
    });

    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  }

  // ── Upgrade to Pro ────────────────────────────────────────────
  async function handleUpgrade() {
    const res = await fetch('/api/stripe/checkout', { method: 'POST' });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  }

  // ── Logout ────────────────────────────────────────────────────
  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = '/';
  }

  // ── Quota gate check ──────────────────────────────────────────
  const quotaReached =
    profile?.plan === 'free' &&
    (profile?.scans_this_month ?? 0) >= FREE_SCAN_LIMIT;

  // ── Loading state (no user yet) ───────────────────────────────
  if (!user) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <ScanAnimation />
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#020617]">
      <div className="max-w-[960px] mx-auto px-4 py-6">
        {/* ═══ HEADER ═══ */}
        <header className="flex justify-between items-center mb-6 border-b border-[#1e293b] pb-4">
          {/* Left: Logo */}
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] bg-clip-text text-transparent">
              RADAR
            </span>
            <span className="text-sm font-medium text-[#f1f5f9] tracking-wider">
              OPPORTUNITES
            </span>
          </div>

          {/* Center: Date */}
          <div className="hidden sm:block text-sm text-[#94a3b8] capitalize">
            {formatDateFr(new Date())}
          </div>

          {/* Right: Actions + Avatar */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => startScan()}
              disabled={isScanning || quotaReached}
              className="px-3 py-1.5 text-sm rounded-[8px] bg-[#6366f1]/10 text-[#6366f1] border border-[#6366f1]/20 hover:bg-[#6366f1]/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isScanning ? 'Scan en cours...' : 'Re-scanner'}
            </button>

            <div className="relative group">
              <div className="w-8 h-8 rounded-full bg-[#6366f1] flex items-center justify-center text-white text-sm font-medium cursor-pointer">
                {user.email?.charAt(0).toUpperCase() ?? '?'}
              </div>

              {/* Dropdown */}
              <div className="absolute right-0 top-full mt-2 w-40 bg-[#0f172a] border border-[#1e293b] rounded-[8px] py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <a
                  href="/settings"
                  className="block px-4 py-2 text-sm text-[#94a3b8] hover:text-white hover:bg-[#1e293b] transition-colors"
                >
                  Parametres
                </a>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-[#94a3b8] hover:text-white hover:bg-[#1e293b] transition-colors"
                >
                  Deconnexion
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* ═══ ERROR ═══ */}
        {error && (
          <div className="bg-[#f87171]/10 border border-[#f87171]/30 rounded-[12px] p-4 mb-6">
            <p className="text-[#f87171] text-sm">{error}</p>
          </div>
        )}

        {/* ═══ MARKET PULSE ═══ */}
        {currentScan && !isScanning && (
          <MarketPulse
            pulse={currentScan.market_pulse}
            scanDate={currentScan.scan_date}
          />
        )}

        {/* ═══ PRICING GATE ═══ */}
        {quotaReached && (
          <PricingGate
            scansUsed={profile?.scans_this_month ?? 0}
            scansLimit={FREE_SCAN_LIMIT}
            plan={profile?.plan ?? 'free'}
            onUpgrade={handleUpgrade}
          />
        )}

        {/* ═══ SCAN ANIMATION ═══ */}
        {isScanning && (
          <div className="py-20">
            <ScanAnimation />
          </div>
        )}

        {/* ═══ OPPORTUNITY CARDS ═══ */}
        {currentScan && !isScanning && !quotaReached && (
          <div className="space-y-4 mt-6">
            {currentScan.opportunities.map((opportunity, index) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                index={index}
                onSave={() => handleSave(opportunity)}
                onLaunch={() => setShowBrief(opportunity)}
              />
            ))}
          </div>
        )}

        {/* ═══ SCAN HISTORY LINK ═══ */}
        {profile?.plan === 'pro' && !isScanning && (
          <div className="mt-8 text-center">
            <a
              href="/scan"
              className="text-sm text-[#6366f1] hover:text-[#8b5cf6] transition-colors"
            >
              Voir l&apos;historique des scans
            </a>
          </div>
        )}

        {/* ═══ SAVED TOAST ═══ */}
        {savedToast && (
          <div className="fixed bottom-6 right-6 bg-[#10b981]/20 border border-[#10b981]/30 text-[#10b981] px-4 py-2 rounded-[8px] text-sm animate-pulse z-50">
            Opportunite sauvegardee
          </div>
        )}
      </div>

      {/* ═══ BRIEF GENERATOR MODAL ═══ */}
      {showBrief && (
        <BriefGenerator
          opportunity={showBrief}
          onClose={() => setShowBrief(null)}
        />
      )}
    </div>
  );
}
