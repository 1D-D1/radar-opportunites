"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import ScoreRadar from "@/components/ScoreRadar";
import type { Opportunity } from "@/types/opportunity";
import { SIGNAL_CONFIG } from "@/types/opportunity";

interface OpportunityCardProps {
  opportunity: Opportunity;
  index: number;
  onLaunch: (opportunity: Opportunity) => void;
  onSave?: (opportunity: Opportunity) => void;
}

function getVerdict(total: number): { label: string; color: string } {
  if (total >= 42) return { label: "Opportunit\u00e9 exceptionnelle", color: "#4ade80" };
  if (total >= 35) return { label: "Tr\u00e8s prometteur", color: "#f59e0b" };
  if (total >= 28) return { label: "Int\u00e9ressant", color: "#fbbf24" };
  return { label: "\u00c0 surveiller", color: "#94a3b8" };
}

export default function OpportunityCard({
  opportunity,
  index,
  onLaunch,
  onSave,
}: OpportunityCardProps) {
  const [expanded, setExpanded] = useState(false);

  const signal = SIGNAL_CONFIG[opportunity.signal_type] || { label: opportunity.signal_type || 'Signal', color: '#f59e0b', icon: '\uD83D\uDCE1' };
  const totalScore =
    opportunity.scores.urgence +
    opportunity.scores.faisabilite +
    opportunity.scores.rentabilite +
    opportunity.scores.competition +
    opportunity.scores.timing;
  const verdict = getVerdict(totalScore);

  return (
    <div
      className="opacity-0 animate-fade-in"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div
        className={`
          bg-[#0c1222] border rounded-[16px] p-4 sm:p-5
          transition-all duration-200
          ${expanded ? "border-[#334155] shadow-lg shadow-black/20" : "border-[#1e293b]"}
          hover:border-[#334155] hover:shadow-lg hover:shadow-black/10
        `}
      >
        {/* ── HEADER (clickable to toggle) ── */}
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="w-full flex items-center gap-3 sm:gap-4 text-left cursor-pointer"
        >
          {/* Signal icon */}
          <div
            className="flex-shrink-0 w-[40px] h-[40px] sm:w-[44px] sm:h-[44px] rounded-[12px] flex items-center justify-center text-xl sm:text-2xl"
            style={{ backgroundColor: `${signal.color}26` }}
          >
            {signal.icon}
          </div>

          {/* Name + tagline */}
          <div className="flex-1 min-w-0">
            <h3 className="text-[14px] sm:text-[16px] font-bold text-[#f1f5f9] truncate">
              {opportunity.name}
            </h3>
            <p className="text-[12px] sm:text-[13px] italic text-[#94a3b8] truncate">
              {opportunity.tagline}
            </p>
          </div>

          {/* Badges — desktop */}
          <div className="hidden sm:flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
            {/* Score badge */}
            <span className="inline-flex items-center px-2.5 py-1 rounded-[6px] text-[10px] font-semibold bg-[#f59e0b]/15 text-[#f59e0b]">
              {totalScore}/50
            </span>

            {/* Signal type badge */}
            <span
              className="inline-flex items-center px-2.5 py-1 rounded-[6px] text-[10px] font-semibold"
              style={{
                backgroundColor: `${signal.color}26`,
                color: signal.color,
              }}
            >
              {signal.label}
            </span>

            {/* Build time badge */}
            <span className="inline-flex items-center px-2.5 py-1 rounded-[6px] text-[10px] font-semibold bg-[#111827] text-[#94a3b8]">
              {opportunity.project.build_time}
            </span>

            {/* Monthly potential badge */}
            <span className="inline-flex items-center px-2.5 py-1 rounded-[6px] text-[10px] font-semibold bg-[#4ade80]/15 text-[#4ade80]">
              {opportunity.project.monthly_potential}
            </span>
          </div>

          {/* Chevron */}
          <ChevronDown
            size={20}
            className={`flex-shrink-0 text-[#64748b] transition-transform duration-300 ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* ── EXPANDED CONTENT ── */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            expanded ? "max-h-[2000px] opacity-100 mt-5" : "max-h-0 opacity-0"
          }`}
        >
          {/* ── Mobile badges (visible only on small screens when expanded) ── */}
          <div className="flex sm:hidden flex-wrap items-center gap-2 mb-5">
            <span className="inline-flex items-center px-2.5 py-1 rounded-[6px] text-[10px] font-semibold bg-[#f59e0b]/15 text-[#f59e0b]">
              {totalScore}/50
            </span>
            <span
              className="inline-flex items-center px-2.5 py-1 rounded-[6px] text-[10px] font-semibold"
              style={{
                backgroundColor: `${signal.color}26`,
                color: signal.color,
              }}
            >
              {signal.label}
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-[6px] text-[10px] font-semibold bg-[#111827] text-[#94a3b8]">
              {opportunity.project.build_time}
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-[6px] text-[10px] font-semibold bg-[#4ade80]/15 text-[#4ade80]">
              {opportunity.project.monthly_potential}
            </span>
          </div>

          {/* ── Section 1: Pourquoi maintenant ? ── */}
          <div className="mb-6">
            <h4 className="text-[15px] sm:text-[16px] font-bold text-[#f1f5f9] mb-4">
              {"\uD83D\uDCE1"} Pourquoi maintenant ?
            </h4>

            {/* SIGNAL */}
            <div
              className="border-l-4 bg-[#111827] rounded-[12px] p-4 mb-3"
              style={{ borderLeftColor: signal.color }}
            >
              <span
                className="text-[11px] font-bold uppercase tracking-wide"
                style={{ color: signal.color }}
              >
                Signal
              </span>
              <p className="text-[13px] text-[#94a3b8] mt-1 break-words">
                {opportunity.justification.signal}
              </p>
            </div>

            {/* TIMING */}
            <div className="border-l-4 border-l-[#fbbf24] bg-[#111827] rounded-[12px] p-4 mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wide text-[#fbbf24]">
                Timing
              </span>
              <p className="text-[13px] text-[#94a3b8] mt-1 break-words">
                {opportunity.justification.timing}
              </p>
            </div>

            {/* PREUVE MARCHE */}
            <div className="border-l-4 border-l-[#4ade80] bg-[#111827] rounded-[12px] p-4 mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wide text-[#4ade80]">
                Preuve march{"\u00e9"}
              </span>
              <p className="text-[13px] text-[#94a3b8] mt-1 break-words">
                {opportunity.justification.market_proof}
              </p>
            </div>
          </div>

          {/* ── Section 2: Le projet ── */}
          <div className="mb-6">
            <h4 className="text-[15px] sm:text-[16px] font-bold text-[#f1f5f9] mb-4">
              {"\uD83C\uDFD7\uFE0F"} Le projet
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* LEFT column */}
              <div className="min-w-0">
                <p className="text-[13px] text-[#94a3b8] mb-4 break-words">
                  {opportunity.project.description}
                </p>

                {/* Info rows */}
                <div className="space-y-3 mb-4">
                  {[
                    { label: "Cible", value: opportunity.project.target_user },
                    { label: "Mod\u00e8le", value: opportunity.project.revenue_model },
                    { label: "Stack", value: opportunity.project.stack },
                    { label: "Build time", value: opportunity.project.build_time },
                  ].map((row) => (
                    <div key={row.label} className="min-w-0">
                      <span className="text-[11px] text-[#64748b] uppercase tracking-wide font-medium">
                        {row.label}
                      </span>
                      <p className="text-[13px] text-[#f1f5f9] mt-0.5 break-words">
                        {row.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* MVP features */}
                <div>
                  <span className="text-[11px] text-[#64748b] uppercase tracking-wide font-medium">
                    MVP Features
                  </span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {opportunity.project.mvp_features.map((feature) => (
                      <span
                        key={feature}
                        className="bg-[#111827] text-[#94a3b8] text-[10px] px-2.5 py-1 rounded-[6px] break-words"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT column — Radar + score */}
              <div className="flex flex-col items-center justify-center">
                <ScoreRadar scores={opportunity.scores} size={180} />
                <div className="text-center mt-3">
                  <span className="text-[22px] font-extrabold text-[#f1f5f9]">
                    {totalScore}/50
                  </span>
                  <p
                    className="text-[13px] font-semibold mt-1"
                    style={{ color: verdict.color }}
                  >
                    {verdict.label}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Section 3: Actions ── */}
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[#1e293b]">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onLaunch(opportunity);
              }}
              className="bg-[#f59e0b] text-[#020617] font-semibold px-5 py-2.5 rounded-[10px] transition-all duration-150 hover:bg-[#fbbf24] active:scale-[0.98] cursor-pointer"
            >
              {"\uD83D\uDE80"} Lancer
            </button>
            {onSave && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSave(opportunity);
                }}
                className="bg-[#111827] text-[#94a3b8] border border-[#1e293b] font-semibold px-4 py-2.5 rounded-[10px] transition-all duration-150 hover:text-[#f1f5f9] hover:border-[#334155] cursor-pointer"
              >
                {"\uD83D\uDCBE"} Sauvegarder
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
