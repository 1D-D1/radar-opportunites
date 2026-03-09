"use client";

import React, { useState, useEffect } from "react";
import LaunchModal from "./LaunchModal";

interface BriefGeneratorProps {
  opportunity: {
    name: string;
    tagline: string;
    project: {
      description: string;
      target_user: string;
      revenue_model: string;
      mvp_features: string[];
      stack: string;
      build_time: string;
      monthly_potential: string;
    };
    justification: {
      signal: string;
      timing: string;
      market_proof: string;
    };
  };
  onClose: () => void;
}

export default function BriefGenerator({ opportunity, onClose }: BriefGeneratorProps) {
  const [brief, setBrief] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showLaunchModal, setShowLaunchModal] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function generateBrief() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/generate-brief", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ opportunity }),
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`Erreur ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();
        setBrief(data.brief ?? data.content ?? "");
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(
          err instanceof Error ? err.message : "Erreur lors de la generation du brief"
        );
      } finally {
        setLoading(false);
      }
    }

    generateBrief();

    return () => controller.abort();
  }, [opportunity]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(brief);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for clipboard API failure
    }
  };

  const handleLaunch = () => {
    setShowLaunchModal(true);
  };

  if (showLaunchModal && brief) {
    return (
      <LaunchModal
        brief={brief}
        projectName={opportunity.name}
        onClose={() => setShowLaunchModal(false)}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative bg-[#0c1222] border border-[#1e293b] rounded-[16px] p-5 sm:p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#64748b] hover:text-[#f1f5f9] transition-colors"
          aria-label="Fermer"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <line x1="4" y1="4" x2="16" y2="16" />
            <line x1="16" y1="4" x2="4" y2="16" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h2 className="text-[18px] font-bold text-[#f1f5f9]">
              Protocole Claude Code
            </h2>
            <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#f59e0b]/15 text-[#f59e0b] tracking-wide">
              Powered by Claude
            </span>
          </div>
          <p className="text-[13px] text-[#64748b] mt-1 break-words">
            {opportunity.name} &mdash; {opportunity.tagline}
          </p>
        </div>

        {/* Content area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            {/* Spinner */}
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 rounded-full border-2 border-[#1e293b]" />
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#f59e0b] animate-spin" />
            </div>
            <p className="text-[14px] text-[#94a3b8]">
              Generation du protocole Claude Code...
            </p>
          </div>
        ) : error ? (
          <div className="py-10 text-center">
            <p className="text-[14px] text-red-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-[13px] text-[#f59e0b] hover:text-[#fbbf24] underline transition-colors"
            >
              Reessayer
            </button>
          </div>
        ) : (
          <>
            {/* Brief display */}
            <div className="bg-[#111827] border border-[#1e293b] rounded-[12px] p-4 sm:p-5 max-h-[400px] overflow-y-auto">
              <pre className="text-[13px] font-mono text-[#94a3b8] whitespace-pre-wrap leading-relaxed break-words">
                {brief}
              </pre>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3 mt-5">
              <button
                onClick={handleCopy}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-[10px] text-[13px] font-medium transition-all duration-200 ${
                  copied
                    ? "bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/30"
                    : "bg-[#111827] text-[#94a3b8] border border-[#1e293b] hover:border-[#f59e0b]/50 hover:text-[#f1f5f9]"
                }`}
              >
                {copied ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="2,7 5.5,10.5 12,3.5" />
                    </svg>
                    Copie !
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="4.5" y="4.5" width="8" height="8" rx="1.5" />
                      <path d="M9.5 4.5V2.5a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2" />
                    </svg>
                    Copier le prompt
                  </>
                )}
              </button>

              <button
                onClick={handleLaunch}
                className="flex items-center gap-2 px-5 py-2.5 rounded-[10px] text-[13px] font-medium bg-[#f59e0b] text-[#020617] hover:bg-[#fbbf24] transition-all duration-200 shadow-lg shadow-[#f59e0b]/20"
              >
                <span>Lancer dans Claude</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
