'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';

const supabase = createClient();

const INTEREST_SUGGESTIONS = [
  'SaaS', 'E-commerce', 'No-code', 'IA / Machine Learning', 'Fintech',
  'EdTech', 'HealthTech', 'Marketplace', 'Automatisation', 'API',
  'Mobile', 'Chrome Extension', 'Bot / Agent', 'Blockchain', 'Productivite',
];

const SKILL_SUGGESTIONS = [
  'Marketing digital', 'Design UI/UX', 'No-code (Bubble, Webflow)',
  'Developpement web', 'SEO / Growth', 'Vente B2B', 'Community building',
  'Gestion de projet', 'Copywriting', 'Data analyse', 'Claude Code',
  'Automatisation (n8n, Zapier)', 'Product management',
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [projectGoals, setProjectGoals] = useState('');
  const [customTag, setCustomTag] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check auth
  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/';
        return;
      }
      // Pre-fill name from email
      const emailName = user.email?.split('@')[0] || '';
      setDisplayName(emailName.charAt(0).toUpperCase() + emailName.slice(1));
    }
    check();
  }, []);

  function toggleTag(tag: string, list: string[], setList: (v: string[]) => void) {
    if (list.includes(tag)) {
      setList(list.filter(t => t !== tag));
    } else {
      setList([...list, tag]);
    }
  }

  function addCustomTag(list: string[], setList: (v: string[]) => void) {
    const trimmed = customTag.trim();
    if (trimmed && !list.includes(trimmed)) {
      setList([...list, trimmed]);
      setCustomTag('');
    }
  }

  async function handleFinish() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: displayName,
          bio,
          interests,
          skills,
          project_goals: projectGoals,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur sauvegarde');
      }

      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  }

  const steps = [
    { title: 'Bienvenue', subtitle: 'Presentez-vous' },
    { title: 'Centres d\'interet', subtitle: 'Quels domaines vous attirent ?' },
    { title: 'Objectifs', subtitle: 'Que souhaitez-vous accomplir ?' },
  ];

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
      <div className="w-full max-w-[520px]">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] bg-clip-text text-transparent">
            PHAROS
          </h1>
          <p className="text-[13px] text-[#64748b] mt-1">Configurez votre phare</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center mb-8 gap-2">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold transition-all ${
                i < step ? 'bg-[#4ade80] text-white' :
                i === step ? 'bg-[#f59e0b] text-[#020617]' :
                'bg-[#111827] text-[#64748b] border border-[#1e293b]'
              }`}>
                {i < step ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="2,7 5.5,10.5 12,3.5" /></svg>
                ) : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={`w-8 h-[2px] rounded-full ${i < step ? 'bg-[#4ade80]' : 'bg-[#1e293b]'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-[#0c1222] border border-[#1e293b] rounded-[16px] p-6">
          <h2 className="text-[18px] font-bold text-[#f1f5f9] mb-1">{steps[step].title}</h2>
          <p className="text-[13px] text-[#64748b] mb-6">{steps[step].subtitle}</p>

          {/* STEP 0: Name + Bio */}
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748b] mb-1.5 block">
                  Votre nom
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Jean Dupont"
                  className="w-full bg-[#111827] border border-[#1e293b] rounded-[12px] px-4 py-3 text-[#f1f5f9] text-[14px] placeholder:text-[#64748b] focus:outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b]/30 transition-all"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748b] mb-1.5 block">
                  Bio courte <span className="text-[#64748b] normal-case font-normal">(optionnel)</span>
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Entrepreneur, passione de tech et de no-code..."
                  rows={3}
                  className="w-full bg-[#111827] border border-[#1e293b] rounded-[12px] px-4 py-3 text-[#f1f5f9] text-[14px] placeholder:text-[#64748b] focus:outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b]/30 transition-all resize-none"
                />
              </div>
            </div>
          )}

          {/* STEP 1: Interests + Skills */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Interests */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748b] mb-3 block">
                  Domaines d&apos;interet
                </label>
                <div className="flex flex-wrap gap-2">
                  {INTEREST_SUGGESTIONS.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag, interests, setInterests)}
                      className={`px-3 py-1.5 rounded-[8px] text-[12px] font-medium transition-all cursor-pointer ${
                        interests.includes(tag)
                          ? 'bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30'
                          : 'bg-[#111827] text-[#94a3b8] border border-[#1e293b] hover:border-[#334155]'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748b] mb-3 block">
                  Vos competences
                </label>
                <div className="flex flex-wrap gap-2">
                  {SKILL_SUGGESTIONS.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag, skills, setSkills)}
                      className={`px-3 py-1.5 rounded-[8px] text-[12px] font-medium transition-all cursor-pointer ${
                        skills.includes(tag)
                          ? 'bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30'
                          : 'bg-[#111827] text-[#94a3b8] border border-[#1e293b] hover:border-[#334155]'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                {/* Custom tag input */}
                <div className="flex gap-2 mt-3">
                  <input
                    type="text"
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomTag(skills, setSkills); } }}
                    placeholder="Ajouter une competence..."
                    className="flex-1 bg-[#111827] border border-[#1e293b] rounded-[8px] px-3 py-2 text-[#f1f5f9] text-[12px] placeholder:text-[#64748b] focus:outline-none focus:border-[#f59e0b] transition-all"
                  />
                  <button
                    onClick={() => addCustomTag(skills, setSkills)}
                    className="px-3 py-2 rounded-[8px] text-[12px] font-medium bg-[#f59e0b]/10 text-[#f59e0b] hover:bg-[#f59e0b]/20 transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Goals */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748b] mb-1.5 block">
                  Que cherchez-vous a accomplir ?
                </label>
                <textarea
                  value={projectGoals}
                  onChange={(e) => setProjectGoals(e.target.value)}
                  placeholder="Je cherche des idees de micro-SaaS a lancer rapidement avec Claude Code. Je veux un projet rentable en moins de 3 mois..."
                  rows={4}
                  className="w-full bg-[#111827] border border-[#1e293b] rounded-[12px] px-4 py-3 text-[#f1f5f9] text-[14px] placeholder:text-[#64748b] focus:outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b]/30 transition-all resize-none"
                />
              </div>

              {/* Summary */}
              <div className="bg-[#111827] border border-[#1e293b] rounded-[12px] p-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748b] mb-2">Recapitulatif</p>
                <div className="space-y-2 text-[13px]">
                  <p className="text-[#94a3b8]"><span className="text-[#f1f5f9] font-medium">{displayName}</span></p>
                  {interests.length > 0 && (
                    <p className="text-[#94a3b8]">
                      <span className="text-[#64748b]">Interets:</span>{' '}
                      {interests.join(', ')}
                    </p>
                  )}
                  {skills.length > 0 && (
                    <p className="text-[#94a3b8]">
                      <span className="text-[#64748b]">Competences:</span>{' '}
                      {skills.join(', ')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 p-3 bg-[#f87171]/10 border border-[#f87171]/20 rounded-[10px]">
              <p className="text-[13px] text-[#f87171]">{error}</p>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between mt-6 gap-3">
            {step > 0 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="px-5 py-2.5 rounded-[10px] text-[13px] font-medium bg-[#111827] text-[#94a3b8] border border-[#1e293b] hover:text-[#f1f5f9] hover:border-[#334155] transition-colors cursor-pointer"
              >
                Retour
              </button>
            ) : <div />}

            {step < 2 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={step === 0 && !displayName.trim()}
                className="px-5 py-2.5 rounded-[10px] text-[13px] font-semibold bg-[#f59e0b] text-[#020617] hover:bg-[#fbbf24] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Suivant
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={saving}
                className="px-6 py-2.5 rounded-[10px] text-[13px] font-semibold bg-[#f59e0b] text-[#020617] hover:bg-[#fbbf24] transition-all shadow-lg shadow-[#f59e0b]/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {saving ? 'Sauvegarde...' : 'Commencer a explorer'}
              </button>
            )}
          </div>
        </div>

        {/* Skip link */}
        <div className="text-center mt-4">
          <button
            onClick={handleFinish}
            className="text-[12px] text-[#64748b] hover:text-[#94a3b8] transition-colors cursor-pointer"
          >
            Passer pour l&apos;instant
          </button>
        </div>
      </div>
    </div>
  );
}
