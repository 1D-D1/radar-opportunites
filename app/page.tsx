"use client";

import Link from "next/link";

const steps = [
  {
    number: "01",
    icon: "\uD83D\uDD2D",
    title: "Scan intelligent",
    text: "PHAROS analyse les tendances, r\u00e9glementations et frictions du march\u00e9 en temps r\u00e9el",
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
    title: "Protocole Claude Code",
    text: "Un mega-prompt complet pour Claude Code. Copiez, collez, lancez votre projet.",
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
  { label: "Scans personnalis\u00e9s", included: true },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#020617] text-[#f1f5f9] overflow-x-hidden">
      {/* ==================== SECTION 1 - HERO ==================== */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6">
        {/* Animated gradient background */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 30%, rgba(245,158,11,0.06) 0%, transparent 60%), radial-gradient(ellipse at center, #0c1222 0%, #020617 70%)",
          }}
        />

        {/* Lighthouse glow effect */}
        <div
          className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full animate-glow-pulse pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 flex flex-col items-center gap-6 max-w-[700px] text-center">
          {/* Lighthouse SVG icon */}
          <div className="mb-2">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Lighthouse beam */}
              <path d="M24 8L38 16L24 12L10 16L24 8Z" fill="#f59e0b" opacity="0.3">
                <animate attributeName="opacity" values="0.2;0.5;0.2" dur="3s" repeatCount="indefinite" />
              </path>
              {/* Lighthouse body */}
              <rect x="20" y="12" width="8" height="20" rx="2" fill="#f59e0b" />
              {/* Lighthouse top */}
              <rect x="18" y="10" width="12" height="4" rx="2" fill="#fbbf24" />
              {/* Lighthouse light */}
              <circle cx="24" cy="12" r="3" fill="#fbbf24">
                <animate attributeName="r" values="2.5;3.5;2.5" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite" />
              </circle>
              {/* Lighthouse base */}
              <rect x="16" y="32" width="16" height="4" rx="1" fill="#d97706" />
              {/* Waves */}
              <path d="M8 40C12 38 16 42 20 40C24 38 28 42 32 40C36 38 40 42 44 40" stroke="#f59e0b" strokeWidth="1.5" opacity="0.4" strokeLinecap="round">
                <animate attributeName="d" values="M8 40C12 38 16 42 20 40C24 38 28 42 32 40C36 38 40 42 44 40;M8 40C12 42 16 38 20 40C24 42 28 38 32 40C36 42 40 38 44 40;M8 40C12 38 16 42 20 40C24 38 28 42 32 40C36 38 40 42 44 40" dur="4s" repeatCount="indefinite" />
              </path>
            </svg>
          </div>

          {/* Badge */}
          <span className="bg-[#f59e0b]/10 text-[#f59e0b] rounded-full px-4 py-1.5 text-[12px] font-semibold tracking-wide">
            Partenaire Claude Code
          </span>

          {/* Main title */}
          <h1 className="text-[36px] sm:text-[52px] font-extrabold leading-[1.1] tracking-tight">
            <span className="bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] bg-clip-text text-transparent">
              PHAROS
            </span>
            <br />
            <span className="text-[22px] sm:text-[28px] font-semibold text-[#94a3b8]">
              Le phare des opportunit{"\u00e9"}s
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-[15px] sm:text-[17px] text-[#94a3b8] max-w-[540px] leading-relaxed">
            Scannez le march{"\u00e9"} en temps r{"\u00e9"}el. Identifiez les projets
            porteurs. G{"\u00e9"}n{"\u00e9"}rez le protocole complet pour lancer
            avec Claude Code.
          </p>

          {/* CTA button */}
          <Link
            href="/auth/login"
            className="bg-[#f59e0b] text-[#020617] font-bold text-[15px] px-8 py-4 rounded-[12px] hover:bg-[#fbbf24] transition-all shadow-lg shadow-[#f59e0b]/20 active:scale-[0.98]"
          >
            Commencer gratuitement {"\u2192"}
          </Link>

          {/* Secondary link */}
          <Link
            href="/auth/login"
            className="text-[#64748b] hover:text-[#f59e0b] transition text-[14px]"
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
              className="bg-[#0c1222] border border-[#1e293b] rounded-[16px] p-6 text-center hover:border-[#f59e0b]/30 transition-colors"
            >
              <div className="text-[#f59e0b] text-[48px] font-extrabold opacity-20 leading-none">
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
          <div className="relative bg-[#0c1222] border border-[#f59e0b]/40 rounded-[16px] p-6 shadow-lg shadow-[#f59e0b]/10 flex flex-col">
            {/* Popular badge */}
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#f59e0b] text-[#020617] text-[11px] font-bold uppercase px-3 py-1 rounded-full">
              Populaire
            </span>

            <h3 className="text-[18px] font-bold text-[#f1f5f9]">Pro</h3>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-[36px] font-extrabold bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] bg-clip-text text-transparent">
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
              className="mt-6 bg-[#f59e0b] text-[#020617] font-semibold text-center w-full py-3 rounded-[10px] hover:bg-[#fbbf24] transition block"
            >
              Commencer avec Pro {"\u2192"}
            </Link>
          </div>
        </div>
      </section>

      {/* ==================== SECTION 4 - FOOTER ==================== */}
      <footer className="text-[#64748b] text-[13px] text-center py-8 border-t border-[#1e293b]">
        <p>
          <span className="text-[#f59e0b] font-semibold">PHAROS</span>
          {" "}&middot;{" "}Partenaire Claude Code{" "}&middot;{" "}2026
        </p>
      </footer>
    </div>
  );
}
