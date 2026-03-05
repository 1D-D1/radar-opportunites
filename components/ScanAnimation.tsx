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
        {/* Radar SVG */}
        <div className="relative flex items-center justify-center">
          <svg
            width="200"
            height="200"
            viewBox="0 0 200 200"
            className="overflow-visible"
          >
            {/* Pulsing concentric circles */}
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="#6366f1"
              strokeOpacity="0.1"
              strokeWidth="1"
            >
              <animate
                attributeName="stroke-opacity"
                values="0.1;0.25;0.1"
                dur="3s"
                repeatCount="indefinite"
              />
            </circle>
            <circle
              cx="100"
              cy="100"
              r="65"
              fill="none"
              stroke="#6366f1"
              strokeOpacity="0.15"
              strokeWidth="1"
            >
              <animate
                attributeName="stroke-opacity"
                values="0.15;0.35;0.15"
                dur="2.5s"
                repeatCount="indefinite"
              />
            </circle>
            <circle
              cx="100"
              cy="100"
              r="40"
              fill="none"
              stroke="#6366f1"
              strokeOpacity="0.2"
              strokeWidth="1"
            >
              <animate
                attributeName="stroke-opacity"
                values="0.2;0.45;0.2"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>

            {/* Center dot */}
            <circle cx="100" cy="100" r="4" fill="#6366f1">
              <animate
                attributeName="r"
                values="3;5;3"
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

            {/* Radar sweep line with gradient trail */}
            <defs>
              <linearGradient
                id="sweepGradient"
                x1="0"
                y1="0"
                x2="1"
                y2="0"
              >
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.9" />
              </linearGradient>
            </defs>

            {/* Sweep cone / trail */}
            <g style={{ transformOrigin: "100px 100px" }}>
              <path
                d="M100,100 L100,10 A90,90 0 0,1 163.6,36.4 Z"
                fill="url(#sweepGradient)"
                opacity="0.15"
              >
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 100 100"
                  to="360 100 100"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </path>
            </g>

            {/* Sweep line */}
            <line
              x1="100"
              y1="100"
              x2="100"
              y2="10"
              stroke="#6366f1"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.8"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 100 100"
                to="360 100 100"
                dur="3s"
                repeatCount="indefinite"
              />
            </line>

            {/* Outer ring */}
            <circle
              cx="100"
              cy="100"
              r="92"
              fill="none"
              stroke="#6366f1"
              strokeOpacity="0.3"
              strokeWidth="1.5"
            />
          </svg>

          {/* Glow effect behind radar */}
          <div
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
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
                    ? "#6366f1"
                    : "rgba(99, 102, 241, 0.15)",
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
