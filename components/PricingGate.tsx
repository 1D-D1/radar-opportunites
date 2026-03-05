"use client";

interface PricingGateProps {
  scansUsed: number;
  scansLimit: number;
  plan: "free" | "pro";
  onUpgrade: () => void;
}

const benefits = [
  "Scans illimités",
  "Historique complet",
  "Favoris & filtres",
  "Briefs illimités",
];

export default function PricingGate({
  scansUsed,
  scansLimit,
  plan,
  onUpgrade,
}: PricingGateProps) {
  if (plan === "pro" || scansUsed < scansLimit) {
    return null;
  }

  const usagePercent = Math.min((scansUsed / scansLimit) * 100, 100);

  return (
    <div className="bg-gradient-to-br from-[#0c1222] to-[#111827] border border-[#6366f1]/30 rounded-[16px] p-6 shadow-lg shadow-[#6366f1]/10">
      {/* Icon */}
      <div className="text-center mb-4">
        <span className="text-4xl" role="img" aria-label="Verrouillé">
          🔒
        </span>
      </div>

      {/* Title */}
      <h3 className="text-[18px] font-bold text-[#f1f5f9] text-center mb-1">
        Quota atteint
      </h3>

      {/* Subtitle */}
      <p className="text-[13px] text-[#94a3b8] text-center mb-5">
        Vous avez utilisé vos {scansLimit} scans gratuits ce mois-ci
      </p>

      {/* Usage bar */}
      <div className="mb-1">
        <div className="flex justify-between text-[12px] text-[#94a3b8] mb-1.5">
          <span>Utilisation</span>
          <span>
            {scansUsed}/{scansLimit}
          </span>
        </div>
        <div className="bg-[#111827] rounded-full h-2 overflow-hidden">
          <div
            className="bg-[#6366f1] h-full rounded-full transition-all duration-500"
            style={{ width: `${usagePercent}%` }}
          />
        </div>
      </div>

      {/* CTA Button */}
      <button
        onClick={onUpgrade}
        className="mt-5 w-full py-3 bg-[#6366f1] text-white font-semibold rounded-[10px] hover:bg-[#818cf8] active:scale-[0.98] transition-all duration-200 cursor-pointer"
      >
        Passer au Pro — 29€/mois
      </button>

      {/* Benefits list */}
      <ul className="mt-5 space-y-2.5">
        {benefits.map((benefit) => (
          <li key={benefit} className="flex items-center gap-2">
            <span className="text-[#4ade80] text-[14px] font-bold">✓</span>
            <span className="text-[13px] text-[#94a3b8]">{benefit}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
