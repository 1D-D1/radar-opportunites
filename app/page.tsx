"use client";

import Link from "next/link";

const steps = [
  {
    number: "01",
    icon: "\uD83D\uDD0D",
    title: "Scan automatique",
    text: "L\u2019IA analyse les tendances, r\u00e9glementations et frictions du march\u00e9 en temps r\u00e9el",
  },
  {
    number: "02",
    icon: "\uD83C\uDFAF",
    title: "Opportunit\u00e9s scor\u00e9es",
    text: "Chaque projet est \u00e9valu\u00e9 sur 5 crit\u00e8res : urgence, faisabilit\u00e9, rentabilit\u00e9, comp\u00e9tition, timing",
  },
  {
    number: "03",
    icon: "\uD83D\uDE80",
    title: "Protocole pr\u00eat",
    text: "Un mega-prompt complet pour Claude Code. Copiez, collez, lancez.",
  },
];

const freeFeatures = [
  { label: "3 scans par mois", included: true },
  { label: "1 brief par scan", included: true },
  { label: "Scores et justifications", included: true },
  { label: "Historique des scans", included: false },
  { label: "Favoris et filtres", included: false },
];

const proFeatures = [
  { label: "Scans illimit\u00e9s", included: true },
  { label: "Briefs illimit\u00e9s", included: true },
  { label: "Historique complet", included: true },
  { label: "Favoris et filtres", included: true },
  { label: "Support prioritaire", included: true },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#020617] text-[#f1f5f9] overflow-x-hidden">
      {/* ==================== SECTION 1 - HERO ==================== */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6">
        {/* Animated gradient background */}
        <div
          className="absolute inset-0 animate-pulse"
          style={{
            background:
              "radial-gradient(ellipse at center, #0c1222 0%, #020617 70%)",
            animationDuration: "6s",
          }}
        />

        <div className="relative z-10 flex flex-col items-center gap-6 max-w-[700px] text-center">
          {/* Badge */}
          <span className="bg-[#6366f1]/10 text-[#6366f1] rounded-full px-4 py-1.5 text-[12px] font-semibold">
            {"\uD83D\uDD0D"} Propuls{"\u00e9"} par Claude AI
          </span>

          {/* Main title */}
          <h1 className="text-[36px] sm:text-[48px] font-extrabold leading-tight">
            D{"\u00e9"}tectez votre prochain
            <br />
            <span className="bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] bg-clip-text text-transparent">
              projet digital
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-[16px] sm:text-[18px] text-[#94a3b8] max-w-[600px]">
            L&apos;IA scanne le web en temps r{"\u00e9"}el, identifie les
            opportunit{"\u00e9"}s business, et g{"\u00e9"}n{"\u00e8"}re le
            protocole complet pour lancer votre projet avec Claude Code.
          </p>

          {/* CTA button */}
          <Link
            href="/auth/login"
            className="bg-[#6366f1] text-white font-bold text-[16px] px-8 py-4 rounded-[12px] hover:brightness-110 transition shadow-lg shadow-[#6366f1]/25"
          >
            Commencer gratuitement {"\u2192"}
          </Link>

          {/* Secondary link */}
          <Link
            href="/auth/login"
            className="text-[#64748b] hover:text-[#94a3b8] transition text-[14px]"
          >
            D{"\u00e9"}j{"\u00e0"} un compte ? Se connecter
          </Link>
        </div>
      </section>

      {/* ==================== SECTION 2 - HOW IT WORKS ==================== */}
      <section className="px-6 py-20">
        <h2 className="text-[22px] font-extrabold text-center text-[#f1f5f9] mb-12">
          Comment {"\u00e7"}a marche ?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[960px] mx-auto">
          {steps.map((step) => (
            <div
              key={step.number}
              className="bg-[#0c1222] border border-[#1e293b] rounded-[16px] p-6 text-center"
            >
              <div className="text-[#6366f1] text-[48px] font-extrabold opacity-20 leading-none">
                {step.number}
              </div>
              <div className="text-[36px] mt-2">{step.icon}</div>
              <h3 className="font-bold text-[#f1f5f9] mt-3 text-[16px]">
                {step.title}
              </h3>
              <p className="text-[#94a3b8] text-[14px] mt-2">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== SECTION 3 - PRICING ==================== */}
      <section className="px-6 py-20">
        <h2 className="text-[22px] font-extrabold text-center text-[#f1f5f9] mb-12">
          Tarifs simples
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[700px] mx-auto">
          {/* FREE Card */}
          <div className="bg-[#0c1222] border border-[#1e293b] rounded-[16px] p-6 flex flex-col">
            <h3 className="text-[18px] font-bold text-[#f1f5f9]">Gratuit</h3>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-[36px] font-extrabold text-[#f1f5f9]">
                0{"\u20AC"}
              </span>
              <span className="text-[#64748b] text-[14px]">/mois</span>
            </div>

            <ul className="mt-6 space-y-3 flex-1">
              {freeFeatures.map((feat) => (
                <li
                  key={feat.label}
                  className="flex items-center gap-2 text-[14px]"
                >
                  {feat.included ? (
                    <span className="text-[#4ade80]">{"\u2713"}</span>
                  ) : (
                    <span className="text-[#64748b]">{"\u2717"}</span>
                  )}
                  <span
                    className={
                      feat.included ? "text-[#94a3b8]" : "text-[#64748b]"
                    }
                  >
                    {feat.label}
                  </span>
                </li>
              ))}
            </ul>

            <Link
              href="/auth/login"
              className="mt-6 border border-[#334155] text-[#94a3b8] hover:text-[#f1f5f9] transition font-semibold text-center py-3 rounded-[10px] block"
            >
              Commencer
            </Link>
          </div>

          {/* PRO Card */}
          <div className="relative bg-[#0c1222] border border-[#6366f1] rounded-[16px] p-6 shadow-lg shadow-[#6366f1]/20 flex flex-col">
            {/* Popular badge */}
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#6366f1] text-white text-[11px] font-bold uppercase px-3 py-1 rounded-full">
              Populaire
            </span>

            <h3 className="text-[18px] font-bold text-[#f1f5f9]">Pro</h3>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-[36px] font-extrabold bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] bg-clip-text text-transparent">
                29{"\u20AC"}
              </span>
              <span className="text-[#64748b] text-[14px]">/mois</span>
            </div>

            <ul className="mt-6 space-y-3 flex-1">
              {proFeatures.map((feat) => (
                <li
                  key={feat.label}
                  className="flex items-center gap-2 text-[14px]"
                >
                  <span className="text-[#4ade80]">{"\u2713"}</span>
                  <span className="text-[#94a3b8]">{feat.label}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/auth/login"
              className="mt-6 bg-[#6366f1] text-white font-semibold text-center w-full py-3 rounded-[10px] hover:brightness-110 transition block"
            >
              Commencer avec Pro {"\u2192"}
            </Link>
          </div>
        </div>
      </section>

      {/* ==================== SECTION 4 - FOOTER ==================== */}
      <footer className="text-[#64748b] text-[13px] text-center py-8 border-t border-[#1e293b]">
        <p>
          Radar Opportunit{"\u00e9"}s &middot; Propuls{"\u00e9"} par Claude AI
          &middot; 2026
        </p>
      </footer>
    </div>
  );
}
