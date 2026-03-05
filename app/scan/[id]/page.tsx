'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import Link from 'next/link';
import MarketPulse from '@/components/MarketPulse';
import OpportunityCard from '@/components/OpportunityCard';
import BriefGenerator from '@/components/BriefGenerator';
import type { Opportunity, Scan } from '@/types/opportunity';

const supabase = createClient();

const FRENCH_MONTHS = [
  'janvier', 'fevrier', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'aout', 'septembre', 'octobre', 'novembre', 'decembre',
];

function formatFrenchDate(isoDate: string): string {
  const date = new Date(isoDate);
  const day = date.getDate();
  const month = FRENCH_MONTHS[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

export default function ScanDetailPage() {
  const params = useParams();
  const scanId = params.id as string;

  const [scan, setScan] = useState<Scan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBrief, setShowBrief] = useState<Opportunity | null>(null);

  // ── Fetch scan on mount ────────────────────────────────────
  useEffect(() => {
    async function loadScan() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = '/';
        return;
      }

      const { data: scanData, error: scanError } = await supabase
        .from('scans')
        .select('*')
        .eq('id', scanId)
        .eq('user_id', user.id)
        .single();

      if (scanError || !scanData) {
        setError('Scan introuvable ou acces refuse.');
        setLoading(false);
        return;
      }

      setScan(scanData as Scan);
      setLoading(false);
    }

    loadScan();
  }, [scanId]);

  // ── Loading state ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-[#1e293b]" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#6366f1] animate-spin" />
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────
  if (error || !scan) {
    return (
      <div className="min-h-screen bg-[#020617]">
        <div className="max-w-[960px] mx-auto px-4 py-6">
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
              Scan
            </h1>
          </header>

          <div className="bg-[#f87171]/10 border border-[#f87171]/30 rounded-[12px] p-6 text-center">
            <p className="text-[#f87171] text-[14px] mb-4">
              {error || 'Scan introuvable.'}
            </p>
            <Link
              href="/dashboard"
              className="text-[13px] text-[#6366f1] hover:text-[#818cf8] underline transition-colors"
            >
              Retour au dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Main render ────────────────────────────────────────────
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
            Scan du {formatFrenchDate(scan.scan_date)}
          </h1>
        </header>

        {/* ═══ MARKET PULSE ═══ */}
        <MarketPulse pulse={scan.market_pulse} scanDate={scan.scan_date} />

        {/* ═══ OPPORTUNITY CARDS ═══ */}
        <div className="space-y-4 mt-6">
          {scan.opportunities.map((opportunity, index) => (
            <OpportunityCard
              key={opportunity.id}
              opportunity={opportunity}
              index={index}
              onLaunch={() => setShowBrief(opportunity)}
            />
          ))}
        </div>

        {/* ═══ EMPTY STATE ═══ */}
        {scan.opportunities.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[14px] text-[#64748b]">
              Aucune opportunite dans ce scan.
            </p>
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
