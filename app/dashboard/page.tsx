'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase-client';
import ScanAnimation from '@/components/ScanAnimation';
import MarketPulse from '@/components/MarketPulse';
import OpportunityCard from '@/components/OpportunityCard';
import BriefGenerator from '@/components/BriefGenerator';
import PricingGate from '@/components/PricingGate';
import ScanHistory from '@/components/ScanHistory';
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
  const [scanHistory, setScanHistory] = useState<any[]>([]);

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
    async (userId: string, userProfile: Profile | null) => {
      const { data: scans } = await supabase
        .from('scans')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .order('scan_date', { ascending: false })
        .limit(1);

      const isQuotaReached =
        userProfile?.plan === 'free' &&
        (userProfile?.scans_this_month ?? 0) >= FREE_SCAN_LIMIT;

      if (scans && scans.length > 0) {
        const lastScan = scans[0];
        const scanAge = Date.now() - new Date(lastScan.scan_date).getTime();
        const twentyFourHours = 24 * 60 * 60 * 1000;

        // Always show last scan data first
        setCurrentScan({
          market_pulse: lastScan.market_pulse,
          opportunities: lastScan.opportunities,
          scan_date: lastScan.scan_date,
        });
        setCurrentScanId(lastScan.id);

        // Only auto-refresh if scan is old AND quota not reached
        if (scanAge > twentyFourHours && !isQuotaReached) {
          startScan();
        }
      } else if (!isQuotaReached) {
        startScan();
      }
    },
    [startScan]
  );

  // ── Load scan history (pro) ─────────────────────────────────
  const loadScanHistory = useCallback(async (userId: string) => {
    const { data: history } = await supabase
      .from('scans')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('scan_date', { ascending: false })
      .limit(10);

    if (history) setScanHistory(history);
  }, []);

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

      const prof = profileData ? (profileData as Profile) : null;
      if (prof) {
        setProfile(prof);
        if (prof.plan === 'pro') {
          loadScanHistory(authUser.id);
        }
      }

      loadLastScan(authUser.id, prof);
    }

    init();
  }, [loadLastScan, loadScanHistory]);

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
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Erreur lors de la redirection vers le paiement.');
      }
    } catch {
      setError('Erreur de connexion au service de paiement.');
    }
  }

  // ── Logout ────────────────────────────────────────────────────
  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = '/';
  }

  // ── Select scan from history ──────────────────────────────────
  function handleSelectScan(scanId: string) {
    const scan = scanHistory.find((s) => s.id === scanId);
    if (scan) {
      setCurrentScan({
        market_pulse: scan.market_pulse,
        opportunities: scan.opportunities,
        scan_date: scan.scan_date,
      });
      setCurrentScanId(scan.id);
    }
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
        <header className="flex flex-wrap justify-between items-center mb-6 border-b border-[#1e293b] pb-4 gap-3">
          {/* Left: Logo */}
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] bg-clip-text text-transparent tracking-tight">
              PHAROS
            </span>
          </div>

          {/* Center: Date */}
          <div className="hidden sm:block text-sm text-[#94a3b8] capitalize order-last sm:order-none w-full sm:w-auto text-center">
            {formatDateFr(new Date())}
          </div>

          {/* Right: Actions + Avatar */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => startScan()}
              disabled={isScanning || quotaReached}
              className="px-3 py-1.5 text-sm rounded-[8px] bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20 hover:bg-[#f59e0b]/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isScanning ? 'Scan en cours...' : 'Re-scanner'}
            </button>

            <div className="relative group">
              <div className="w-8 h-8 rounded-full bg-[#f59e0b] flex items-center justify-center text-[#020617] text-sm font-bold cursor-pointer">
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
            <p className="text-[#f87171] text-sm break-words">{error}</p>
          </div>
        )}

        {/* ═══ MARKET PULSE ═══ */}
        {currentScan && !isScanning && (
          <MarketPulse
            pulse={currentScan.market_pulse}
            scanDate={currentScan.scan_date}
          />
        )}

        {/* ═══ SCAN ANIMATION ═══ */}
        {isScanning && (
          <div className="py-20">
            <ScanAnimation />
          </div>
        )}

        {/* ═══ OPPORTUNITY CARDS ═══ */}
        {currentScan && !isScanning && (
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

        {/* ═══ PRICING GATE (after cards) ═══ */}
        {quotaReached && (
          <PricingGate
            scansUsed={profile?.scans_this_month ?? 0}
            scansLimit={FREE_SCAN_LIMIT}
            plan={profile?.plan ?? 'free'}
            onUpgrade={handleUpgrade}
          />
        )}

        {/* ═══ SCAN HISTORY (pro users) ═══ */}
        {profile?.plan === 'pro' && !isScanning && scanHistory.length > 1 && (
          <div className="mt-8 bg-[#0c1222] border border-[#1e293b] rounded-[16px] p-5">
            <ScanHistory
              scans={scanHistory}
              onSelectScan={handleSelectScan}
            />
          </div>
        )}

        {/* ═══ SAVED TOAST ═══ */}
        {savedToast && (
          <div className="fixed bottom-6 right-6 bg-[#10b981]/20 border border-[#10b981]/30 text-[#10b981] px-4 py-2 rounded-[8px] text-sm z-50 animate-fade-in">
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
