"use client";

import { useState, useEffect } from "react";

const PHASES = [
  { emoji: "\u{1F310}", text: "Analyse des tendances tech mondiales..." },
  { emoji: "\u{1F4CA}", text: "Scan des opportunit\u00E9s micro-SaaS..." },
  { emoji: "\u2696\uFE0F", text: "V\u00E9rification des changements r\u00E9glementaires..." },
  { emoji: "\u{1F4AC}", text: "Analyse des frictions utilisateurs..." },
  { emoji: "\u{1F9E0}", text: "Scoring et classement des opportunit\u00E9s..." },
  { emoji: "\u2728", text: "G\u00E9n\u00E9ration du rapport final..." },
];

const PHASE_DURATION = 3500;

export default function ScanAnimation() {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);

      setTimeout(() => {
        setCurrentPhase((prev) => (prev + 1) % PHASES.length);
        setIsVisible(true);
      }, 300);
    }, PHASE_DURATION);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary">
      <div className="flex w-full max-w-[480px] flex-col items-center gap-10 px-6">
        {/* Lighthouse SVG */}
        <div className="relative flex items-center justify-center">
          <svg
            width="200"
            height="200"
            viewBox="0 0 200 200"
            className="overflow-visible"
          >
            {/* Ambient glow */}
            <circle cx="100" cy="60" r="80" fill="url(#lighthouseGlow)" opacity="0.3">
              <animate
                attributeName="opacity"
                values="0.2;0.4;0.2"
                dur="3s"
                repeatCount="indefinite"
              />
            </circle>

            {/* Light beam (sweep) */}
            <defs>
              <radialGradient id="lighthouseGlow" cx="50%" cy="30%" r="50%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="beamGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Beam cone that rotates */}
            <g style={{ transformOrigin: "100px 75px" }}>
              <path
                d="M100,75 L60,10 A50,50 0 0,1 140,10 Z"
                fill="url(#beamGradient)"
                opacity="0.2"
              >
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 100 75"
                  to="360 100 75"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </path>
            </g>

            {/* Beam line */}
            <line
              x1="100"
              y1="75"
              x2="100"
              y2="10"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.6"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 100 75"
                to="360 100 75"
                dur="3s"
                repeatCount="indefinite"
              />
            </line>

            {/* Lighthouse body */}
            <rect x="88" y="80" width="24" height="50" rx="4" fill="#1e293b" stroke="#f59e0b" strokeWidth="1" strokeOpacity="0.4" />

            {/* Lighthouse top (lantern room) */}
            <rect x="84" y="70" width="32" height="14" rx="4" fill="#1e293b" stroke="#f59e0b" strokeWidth="1.5" strokeOpacity="0.6" />

            {/* Light source */}
            <circle cx="100" cy="77" r="5" fill="#f59e0b">
              <animate
                attributeName="r"
                values="4;6;4"
                dur="2s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.8;1;0.8"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>

            {/* Lighthouse stripes */}
            <rect x="88" y="92" width="24" height="4" fill="#f59e0b" opacity="0.15" />
            <rect x="88" y="104" width="24" height="4" fill="#f59e0b" opacity="0.15" />
            <rect x="88" y="116" width="24" height="4" fill="#f59e0b" opacity="0.15" />

            {/* Base */}
            <rect x="78" y="130" width="44" height="8" rx="3" fill="#1e293b" stroke="#f59e0b" strokeWidth="0.5" strokeOpacity="0.3" />

            {/* Waves */}
            <path
              d="M50 155 Q65 148 80 155 Q95 162 110 155 Q125 148 140 155 Q155 162 170 155"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="1.5"
              strokeOpacity="0.2"
              strokeLinecap="round"
            >
              <animate
                attributeName="d"
                values="M50 155 Q65 148 80 155 Q95 162 110 155 Q125 148 140 155 Q155 162 170 155;M50 155 Q65 162 80 155 Q95 148 110 155 Q125 162 140 155 Q155 148 170 155;M50 155 Q65 148 80 155 Q95 162 110 155 Q125 148 140 155 Q155 162 170 155"
                dur="4s"
                repeatCount="indefinite"
              />
            </path>
            <path
              d="M40 165 Q60 158 80 165 Q100 172 120 165 Q140 158 160 165"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="1"
              strokeOpacity="0.1"
              strokeLinecap="round"
            >
              <animate
                attributeName="d"
                values="M40 165 Q60 158 80 165 Q100 172 120 165 Q140 158 160 165;M40 165 Q60 172 80 165 Q100 158 120 165 Q140 172 160 165;M40 165 Q60 158 80 165 Q100 172 120 165 Q140 158 160 165"
                dur="5s"
                repeatCount="indefinite"
              />
            </path>

            {/* Outer ring */}
            <circle
              cx="100"
              cy="100"
              r="92"
              fill="none"
              stroke="#f59e0b"
              strokeOpacity="0.08"
              strokeWidth="1"
            />
          </svg>

          {/* Glow effect behind lighthouse */}
          <div
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 50% 40%, rgba(245,158,11,0.12) 0%, transparent 60%)",
            }}
          />
        </div>

        {/* Phase text */}
        <div className="flex h-8 items-center justify-center">
          <p
            className="text-center text-lg font-medium text-text-primary transition-opacity duration-300"
            style={{ opacity: isVisible ? 1 : 0 }}
          >
            <span className="mr-2">{PHASES[currentPhase].emoji}</span>
            {PHASES[currentPhase].text}
          </p>
        </div>

        {/* Progress bar - 6 segments */}
        <div className="flex w-full max-w-[320px] items-center gap-2">
          {PHASES.map((_, index) => (
            <div
              key={index}
              className="h-1.5 flex-1 overflow-hidden rounded-full transition-colors duration-500"
              style={{
                backgroundColor:
                  index <= currentPhase
                    ? "#f59e0b"
                    : "rgba(245, 158, 11, 0.15)",
              }}
            />
          ))}
        </div>

        {/* Timer message */}
        <p className="text-sm text-text-secondary">
          Analyse en cours... 30 {"\u00E0"} 60 secondes
        </p>
      </div>
    </div>
  );
}
