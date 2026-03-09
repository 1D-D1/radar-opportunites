"use client";

import React, { useState } from "react";

interface LaunchModalProps {
  brief: string;
  projectName: string;
  onClose: () => void;
}

const STEPS = [
  { label: "Copier le prompt" },
  { label: "Ouvrir Claude" },
  { label: "Coller et lancer" },
] as const;

export default function LaunchModal({ brief, projectName, onClose }: LaunchModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(brief);
      setCopied(true);
      setTimeout(() => {
        setCurrentStep(1);
      }, 800);
    } catch {
      // Fallback for clipboard API failure
    }
  };

  const handleOpenClaude = () => {
    window.open("https://claude.ai/new", "_blank");
    setTimeout(() => {
      setCurrentStep(2);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative bg-[#0c1222] border border-[#1e293b] rounded-[16px] p-5 sm:p-6 max-w-lg w-full shadow-2xl">
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

        {/* Title */}
        <h2 className="text-[18px] font-bold text-[#f1f5f9] mb-6">
          Lancer {projectName}
        </h2>

        {/* Step indicator */}
        <div className="flex items-center justify-center mb-8">
          {STEPS.map((step, i) => (
            <React.Fragment key={i}>
              {/* Circle */}
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`flex items-center justify-center w-9 h-9 rounded-full text-[13px] font-bold transition-all duration-300 ${
                    i < currentStep
                      ? "bg-[#4ade80] text-white"
                      : i === currentStep
                        ? "bg-[#f59e0b] text-[#020617] shadow-lg shadow-[#f59e0b]/30"
                        : "bg-[#111827] text-[#64748b] border border-[#1e293b]"
                  }`}
                >
                  {i < currentStep ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3,8 6.5,11.5 13,4.5" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  className={`text-[11px] whitespace-nowrap transition-colors duration-300 ${
                    i <= currentStep ? "text-[#94a3b8]" : "text-[#64748b]"
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connecting line */}
              {i < STEPS.length - 1 && (
                <div className="flex-1 mx-3 mb-6">
                  <div
                    className={`h-[2px] rounded-full transition-all duration-500 ${
                      i < currentStep ? "bg-[#4ade80]" : "bg-[#1e293b]"
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step content */}
        <div className="min-h-[140px] flex flex-col items-center justify-center">
          {/* Step 1: Copy prompt */}
          {currentStep === 0 && (
            <div className="flex flex-col items-center gap-4 animate-fadeIn">
              <button
                onClick={handleCopy}
                className={`flex items-center gap-2.5 px-6 py-3 rounded-[12px] text-[14px] font-semibold transition-all duration-300 ${
                  copied
                    ? "bg-[#4ade80]/15 text-[#4ade80] border border-[#4ade80]/30 scale-105"
                    : "bg-[#f59e0b] text-[#020617] hover:bg-[#fbbf24] shadow-lg shadow-[#f59e0b]/25 hover:shadow-[#f59e0b]/40"
                }`}
              >
                {copied ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3,9 7,13 15,5" />
                    </svg>
                    Copie !
                  </>
                ) : (
                  <>
                    <span>Copier le mega-prompt</span>
                  </>
                )}
              </button>
              <p className="text-[12px] text-[#64748b]">
                Le prompt sera copie dans votre presse-papiers
              </p>
            </div>
          )}

          {/* Step 2: Open Claude */}
          {currentStep === 1 && (
            <div className="flex flex-col items-center gap-4 animate-fadeIn">
              <button
                onClick={handleOpenClaude}
                className="flex items-center gap-2.5 px-6 py-3 rounded-[12px] text-[14px] font-semibold bg-[#f59e0b] text-[#020617] hover:bg-[#fbbf24] shadow-lg shadow-[#f59e0b]/25 hover:shadow-[#f59e0b]/40 transition-all duration-300"
              >
                <span>Ouvrir Claude Code</span>
              </button>
              <p className="text-[12px] text-[#64748b]">
                Claude s&apos;ouvre dans un nouvel onglet
              </p>
            </div>
          )}

          {/* Step 3: Paste and launch */}
          {currentStep === 2 && (
            <div className="flex flex-col items-center gap-4 animate-fadeIn">
              {/* Green checkmark animation */}
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[#4ade80]/15 animate-scaleIn">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#4ade80" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6,14 11.5,19.5 22,8.5" />
                </svg>
              </div>
              <div className="text-center space-y-2">
                <p className="text-[14px] text-[#f1f5f9] font-medium">
                  Collez le prompt avec Ctrl+V <span className="text-[#64748b]">(ou Cmd+V sur Mac)</span>
                </p>
                <p className="text-[12px] text-[#64748b]">
                  Le mega-prompt est dans votre presse-papiers, pret a etre colle.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Brief preview toggle */}
        <div className="mt-6 border-t border-[#1e293b] pt-4">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 text-[12px] text-[#64748b] hover:text-[#94a3b8] transition-colors"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform duration-200 ${showPreview ? "rotate-90" : ""}`}
            >
              <polyline points="4,2 8,6 4,10" />
            </svg>
            Apercu du prompt
          </button>

          {showPreview && (
            <div className="mt-3 bg-[#111827] rounded-[12px] p-4 max-h-[200px] overflow-y-auto animate-fadeIn">
              <pre className="text-[12px] font-mono text-[#64748b] whitespace-pre-wrap leading-relaxed break-words">
                {brief}
              </pre>
            </div>
          )}
        </div>

        {/* Inline keyframe styles */}
        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.5); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }
          .animate-scaleIn {
            animation: scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          }
        `}</style>
      </div>
    </div>
  );
}
