'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import Link from 'next/link';
import type { Profile, SavedOpportunity, SavedStatus } from '@/types/opportunity';
import type { User } from '@supabase/supabase-js';

const supabase = createClient();

const FREE_SCAN_LIMIT = 3;

const FRENCH_MONTHS = [
  'janvier', 'fevrier', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'aout', 'septembre', 'octobre', 'novembre', 'decembre',
];

function formatResetDate(isoDate: string): string {
  const date = new Date(isoDate);
  const day = date.getDate();
  const month = FRENCH_MONTHS[date.getMonth()];
  return `${day} ${month}`;
}

const STATUS_LABELS: Record<SavedStatus, { label: string; bg: string; text: string }> = {
  saved: { label: 'Sauvegarde', bg: 'bg-[#f59e0b]/15', text: 'text-[#f59e0b]' },
  launched: { label: 'Lance', bg: 'bg-[#4ade80]/15', text: 'text-[#4ade80]' },
  archived: { label: 'Archive', bg: 'bg-[#64748b]/15', text: 'text-[#64748b]' },
};

const STATUS_OPTIONS: SavedStatus[] = ['saved', 'launched', 'archived'];

const INTEREST_SUGGESTIONS = [
  'SaaS', 'E-commerce', 'IA / ML', 'Fintech', 'EdTech', 'HealthTech',
  'Productivite', 'Automatisation', 'No-code', 'API', 'Mobile',
  'DevTools', 'MarketPlace', 'Crypto / Web3', 'Ecologie',
];

const SKILL_SUGGESTIONS = [
  'JavaScript', 'TypeScript', 'Python', 'React', 'Next.js', 'Node.js',
  'SQL', 'NoSQL', 'Design', 'Marketing', 'SEO', 'Copywriting',
  'Vente', 'Gestion de projet', 'Data analyse',
];

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [savedOpportunities, setSavedOpportunities] = useState<SavedOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);

  // Profile editing state
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    display_name: '',
    bio: '',
    interests: [] as string[],
    skills: [] as string[],
    project_goals: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [customSkill, setCustomSkill] = useState('');
  const [customInterest, setCustomInterest] = useState('');

  useEffect(() => {
    async function init() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { window.location.href = '/'; return; }
      setUser(authUser);

      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', authUser.id).single();
      if (profileData) {
        const prof = profileData as Profile;
        setProfile(prof);
        setProfileForm({
          display_name: prof.display_name || '',
          bio: prof.bio || '',
          interests: prof.interests || [],
          skills: prof.skills || [],
          project_goals: prof.project_goals || '',
        });
      }

      const { data: saved } = await supabase.from('saved_opportunities').select('*').eq('user_id', authUser.id).order('saved_at', { ascending: false });
      if (saved) setSavedOpportunities(saved as SavedOpportunity[]);

      setLoading(false);
    }
    init();
  }, []);

  async function handleUpgrade() {
    setUpgrading(true);
    setStripeError(null);
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' });
      const data = await res.json();
      if (data.url) { window.location.href = data.url; }
      else { setStripeError(data.error || 'Erreur lors de la redirection vers le paiement.'); setUpgrading(false); }
    } catch { setStripeError('Erreur de connexion. Veuillez reessayer.'); setUpgrading(false); }
  }

  async function handleManageSubscription() {
    setStripeError(null);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) { window.location.href = data.url; }
      else { setStripeError(data.error || 'Erreur d\'acces au portail de gestion.'); }
    } catch { setStripeError('Erreur de connexion. Veuillez reessayer.'); }
  }

  async function handleStatusChange(id: string, newStatus: SavedStatus) {
    const { error } = await supabase.from('saved_opportunities').update({ status: newStatus }).eq('id', id);
    if (!error) {
      setSavedOpportunities((prev) => prev.map((item) => item.id === id ? { ...item, status: newStatus } : item));
    }
  }

  async function handleSaveProfile() {
    if (!user) return;
    setSavingProfile(true);
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: profileForm.display_name,
          bio: profileForm.bio,
          interests: profileForm.interests,
          skills: profileForm.skills,
          project_goals: profileForm.project_goals,
        }),
      });
      if (res.ok) {
        // Refresh profile
        const { data: updatedProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (updatedProfile) {
          setProfile(updatedProfile as Profile);
        }
        setEditingProfile(false);
        setProfileSaved(true);
        setTimeout(() => setProfileSaved(false), 2500);
      }
    } catch {
      // Silent fail
    } finally {
      setSavingProfile(false);
    }
  }

  function toggleTag(list: string[], tag: string): string[] {
    return list.includes(tag) ? list.filter((t) => t !== tag) : [...list, tag];
  }

  function addCustomTag(type: 'interests' | 'skills') {
    const value = type === 'interests' ? customInterest.trim() : customSkill.trim();
    if (!value) return;
    if (!profileForm[type].includes(value)) {
      setProfileForm((prev) => ({ ...prev, [type]: [...prev[type], value] }));
    }
    if (type === 'interests') setCustomInterest('');
    else setCustomSkill('');
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = '/';
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-[#1e293b]" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#f59e0b] animate-spin" />
        </div>
      </div>
    );
  }

  const scansUsed = profile?.scans_this_month ?? 0;
  const scansPercentage = Math.min((scansUsed / FREE_SCAN_LIMIT) * 100, 100);

  return (
    <div className="min-h-screen bg-[#020617]">
      <div className="max-w-[960px] mx-auto px-4 py-6">
        {/* HEADER */}
        <header className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="flex items-center justify-center w-9 h-9 rounded-[10px] bg-[#0c1222] border border-[#1e293b] text-[#94a3b8] hover:text-[#f1f5f9] hover:border-[#334155] transition-colors" aria-label="Retour">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3L6 9l6 6" /></svg>
          </Link>
          <h1 className="text-[22px] font-extrabold text-[#f1f5f9]">Parametres</h1>
        </header>

        {/* ACCOUNT */}
        <section className="mb-6">
          <div className="bg-[#0c1222] border border-[#1e293b] rounded-[16px] p-5 sm:p-6">
            <h2 className="text-[16px] font-bold text-[#f1f5f9] mb-4">Compte</h2>
            <div className="mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">Email</span>
              <p className="text-[14px] text-[#94a3b8] mt-1 break-words">{user.email}</p>
            </div>
            <div className="mb-5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">Plan</span>
              <div className="mt-1.5">
                {profile?.plan === 'pro' ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-[8px] text-[12px] font-semibold bg-[#f59e0b]/15 text-[#f59e0b]">Pro</span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-[8px] text-[12px] font-semibold bg-[#111827] text-[#94a3b8]">Gratuit</span>
                )}
              </div>
            </div>
            {stripeError && (
              <div className="mb-4 p-3 bg-[#f87171]/10 border border-[#f87171]/20 rounded-[10px]">
                <p className="text-[13px] text-[#f87171] break-words">{stripeError}</p>
              </div>
            )}
            {profile?.plan === 'pro' ? (
              <button onClick={handleManageSubscription} className="px-4 py-2.5 rounded-[10px] text-[13px] font-medium bg-[#111827] text-[#94a3b8] border border-[#1e293b] hover:text-[#f1f5f9] hover:border-[#334155] transition-colors cursor-pointer">
                Gerer l&apos;abonnement
              </button>
            ) : (
              <button onClick={handleUpgrade} disabled={upgrading} className="px-5 py-2.5 rounded-[10px] text-[13px] font-semibold bg-[#f59e0b] text-[#020617] hover:bg-[#fbbf24] transition-all duration-200 shadow-lg shadow-[#f59e0b]/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                {upgrading ? 'Redirection...' : 'Passer au Pro'}
              </button>
            )}
          </div>
        </section>

        {/* ═══ PROFIL ═══ */}
        <section className="mb-6">
          <div className="bg-[#0c1222] border border-[#1e293b] rounded-[16px] p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[16px] font-bold text-[#f1f5f9]">Profil</h2>
              {!editingProfile && (
                <button
                  onClick={() => setEditingProfile(true)}
                  className="px-3 py-1.5 rounded-[8px] text-[12px] font-medium bg-[#111827] text-[#94a3b8] border border-[#1e293b] hover:text-[#f1f5f9] hover:border-[#334155] transition-colors cursor-pointer"
                >
                  Modifier
                </button>
              )}
            </div>

            {!editingProfile ? (
              /* ── View mode ── */
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">Nom</span>
                  <p className="text-[14px] text-[#94a3b8] mt-1">{profile?.display_name || '—'}</p>
                </div>
                {profile?.bio && (
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">Bio</span>
                    <p className="text-[14px] text-[#94a3b8] mt-1 break-words">{profile.bio}</p>
                  </div>
                )}
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">Centres d&apos;interet</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {(profile?.interests && profile.interests.length > 0) ? (
                      profile.interests.map((tag) => (
                        <span key={tag} className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#f59e0b]/10 text-[#f59e0b]">{tag}</span>
                      ))
                    ) : (
                      <span className="text-[14px] text-[#64748b]">—</span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">Competences</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {(profile?.skills && profile.skills.length > 0) ? (
                      profile.skills.map((tag) => (
                        <span key={tag} className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#4ade80]/10 text-[#4ade80]">{tag}</span>
                      ))
                    ) : (
                      <span className="text-[14px] text-[#64748b]">—</span>
                    )}
                  </div>
                </div>
                {profile?.project_goals && (
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">Objectif</span>
                    <p className="text-[14px] text-[#94a3b8] mt-1 break-words">{profile.project_goals}</p>
                  </div>
                )}
              </div>
            ) : (
              /* ── Edit mode ── */
              <div className="space-y-5">
                {/* Name */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748b] block mb-1.5">Nom</label>
                  <input
                    type="text"
                    value={profileForm.display_name}
                    onChange={(e) => setProfileForm((p) => ({ ...p, display_name: e.target.value }))}
                    className="w-full bg-[#111827] border border-[#1e293b] rounded-[10px] px-4 py-2.5 text-[14px] text-[#f1f5f9] placeholder-[#475569] focus:outline-none focus:border-[#f59e0b]/50 transition-colors"
                    placeholder="Votre nom"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748b] block mb-1.5">Bio <span className="text-[#475569] normal-case">(optionnel)</span></label>
                  <textarea
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm((p) => ({ ...p, bio: e.target.value }))}
                    rows={2}
                    className="w-full bg-[#111827] border border-[#1e293b] rounded-[10px] px-4 py-2.5 text-[14px] text-[#f1f5f9] placeholder-[#475569] focus:outline-none focus:border-[#f59e0b]/50 transition-colors resize-none"
                    placeholder="Decrivez-vous en quelques mots..."
                  />
                </div>

                {/* Interests */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748b] block mb-2">Centres d&apos;interet</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {INTEREST_SUGGESTIONS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setProfileForm((p) => ({ ...p, interests: toggleTag(p.interests, tag) }))}
                        className={`px-3 py-1.5 rounded-full text-[12px] font-medium border transition-colors cursor-pointer ${
                          profileForm.interests.includes(tag)
                            ? 'bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/30'
                            : 'bg-[#111827] text-[#64748b] border-[#1e293b] hover:text-[#94a3b8] hover:border-[#334155]'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                    {/* Show custom interests not in suggestions */}
                    {profileForm.interests
                      .filter((t) => !INTEREST_SUGGESTIONS.includes(t))
                      .map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setProfileForm((p) => ({ ...p, interests: toggleTag(p.interests, tag) }))}
                          className="px-3 py-1.5 rounded-full text-[12px] font-medium border transition-colors cursor-pointer bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/30"
                        >
                          {tag}
                        </button>
                      ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customInterest}
                      onChange={(e) => setCustomInterest(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomTag('interests'); } }}
                      className="flex-1 bg-[#111827] border border-[#1e293b] rounded-[8px] px-3 py-1.5 text-[12px] text-[#f1f5f9] placeholder-[#475569] focus:outline-none focus:border-[#f59e0b]/50 transition-colors"
                      placeholder="Ajouter un interet..."
                    />
                    <button
                      type="button"
                      onClick={() => addCustomTag('interests')}
                      className="px-3 py-1.5 rounded-[8px] text-[12px] font-medium bg-[#111827] text-[#94a3b8] border border-[#1e293b] hover:text-[#f1f5f9] transition-colors cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748b] block mb-2">Competences</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {SKILL_SUGGESTIONS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setProfileForm((p) => ({ ...p, skills: toggleTag(p.skills, tag) }))}
                        className={`px-3 py-1.5 rounded-full text-[12px] font-medium border transition-colors cursor-pointer ${
                          profileForm.skills.includes(tag)
                            ? 'bg-[#4ade80]/15 text-[#4ade80] border-[#4ade80]/30'
                            : 'bg-[#111827] text-[#64748b] border-[#1e293b] hover:text-[#94a3b8] hover:border-[#334155]'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                    {profileForm.skills
                      .filter((t) => !SKILL_SUGGESTIONS.includes(t))
                      .map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setProfileForm((p) => ({ ...p, skills: toggleTag(p.skills, tag) }))}
                          className="px-3 py-1.5 rounded-full text-[12px] font-medium border transition-colors cursor-pointer bg-[#4ade80]/15 text-[#4ade80] border-[#4ade80]/30"
                        >
                          {tag}
                        </button>
                      ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customSkill}
                      onChange={(e) => setCustomSkill(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomTag('skills'); } }}
                      className="flex-1 bg-[#111827] border border-[#1e293b] rounded-[8px] px-3 py-1.5 text-[12px] text-[#f1f5f9] placeholder-[#475569] focus:outline-none focus:border-[#f59e0b]/50 transition-colors"
                      placeholder="Ajouter une competence..."
                    />
                    <button
                      type="button"
                      onClick={() => addCustomTag('skills')}
                      className="px-3 py-1.5 rounded-[8px] text-[12px] font-medium bg-[#111827] text-[#94a3b8] border border-[#1e293b] hover:text-[#f1f5f9] transition-colors cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Goals */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748b] block mb-1.5">Objectif</label>
                  <textarea
                    value={profileForm.project_goals}
                    onChange={(e) => setProfileForm((p) => ({ ...p, project_goals: e.target.value }))}
                    rows={3}
                    className="w-full bg-[#111827] border border-[#1e293b] rounded-[10px] px-4 py-2.5 text-[14px] text-[#f1f5f9] placeholder-[#475569] focus:outline-none focus:border-[#f59e0b]/50 transition-colors resize-none"
                    placeholder="Quel type de projet cherchez-vous ? Quels sont vos objectifs ?"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={handleSaveProfile}
                    disabled={savingProfile || !profileForm.display_name.trim()}
                    className="px-5 py-2.5 rounded-[10px] text-[13px] font-semibold bg-[#f59e0b] text-[#020617] hover:bg-[#fbbf24] transition-all duration-200 shadow-lg shadow-[#f59e0b]/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {savingProfile ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                  <button
                    onClick={() => {
                      setEditingProfile(false);
                      // Reset form to current profile
                      if (profile) {
                        setProfileForm({
                          display_name: profile.display_name || '',
                          bio: profile.bio || '',
                          interests: profile.interests || [],
                          skills: profile.skills || [],
                          project_goals: profile.project_goals || '',
                        });
                      }
                    }}
                    className="px-4 py-2.5 rounded-[10px] text-[13px] font-medium text-[#94a3b8] hover:text-[#f1f5f9] transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* USAGE (free) */}
        {profile?.plan === 'free' && (
          <section className="mb-6">
            <div className="bg-[#0c1222] border border-[#1e293b] rounded-[16px] p-5 sm:p-6">
              <h2 className="text-[16px] font-bold text-[#f1f5f9] mb-4">Utilisation</h2>
              <div className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
                <span className="text-[14px] text-[#94a3b8]"><span className="text-[#f1f5f9] font-bold">{scansUsed}</span> / {FREE_SCAN_LIMIT} scans ce mois</span>
                <span className="text-[12px] text-[#64748b]">{scansUsed >= FREE_SCAN_LIMIT ? 'Limite atteinte' : `${FREE_SCAN_LIMIT - scansUsed} restant${FREE_SCAN_LIMIT - scansUsed > 1 ? 's' : ''}`}</span>
              </div>
              <div className="w-full h-2 bg-[#111827] rounded-full overflow-hidden mb-3">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${scansPercentage}%`, backgroundColor: scansPercentage >= 100 ? '#f87171' : '#f59e0b' }} />
              </div>
              {profile.scans_reset_date && <p className="text-[12px] text-[#64748b]">Reinitialisation le {formatResetDate(profile.scans_reset_date)}</p>}
            </div>
          </section>
        )}

        {/* SAVED OPPORTUNITIES (pro) */}
        {profile?.plan === 'pro' && (
          <section className="mb-6">
            <div className="bg-[#0c1222] border border-[#1e293b] rounded-[16px] p-5 sm:p-6">
              <h2 className="text-[16px] font-bold text-[#f1f5f9] mb-4">Opportunites sauvegardees</h2>
              {savedOpportunities.length === 0 ? (
                <p className="text-[14px] text-[#64748b] text-center py-6">Aucune opportunite sauvegardee</p>
              ) : (
                <div className="space-y-3">
                  {savedOpportunities.map((saved) => {
                    const statusConfig = STATUS_LABELS[saved.status];
                    return (
                      <div key={saved.id} className="bg-[#111827] border border-[#1e293b] rounded-[12px] p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-[14px] font-semibold text-[#f1f5f9] truncate">{saved.opportunity.name}</h3>
                          <p className="text-[12px] text-[#94a3b8] italic truncate">{saved.opportunity.tagline}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-[6px] text-[10px] font-semibold ${statusConfig.bg} ${statusConfig.text}`}>{statusConfig.label}</span>
                          <div className="flex gap-1 flex-wrap">
                            {STATUS_OPTIONS.filter((s) => s !== saved.status).map((status) => (
                              <button key={status} onClick={() => handleStatusChange(saved.id, status)} className="px-2 py-1 rounded-[6px] text-[10px] font-medium bg-[#0c1222] text-[#64748b] border border-[#1e293b] hover:text-[#94a3b8] hover:border-[#334155] transition-colors cursor-pointer" title={`Passer en ${STATUS_LABELS[status].label}`}>{STATUS_LABELS[status].label}</button>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        )}

        {/* DANGER ZONE */}
        <section className="mb-6">
          <div className="bg-[#f87171]/5 border border-[#f87171]/20 rounded-[16px] p-5 sm:p-6">
            <h2 className="text-[16px] font-bold text-[#f1f5f9] mb-4">Zone de danger</h2>
            <button onClick={handleLogout} className="px-5 py-2.5 rounded-[10px] text-[13px] font-semibold bg-[#f87171]/10 text-[#f87171] border border-[#f87171]/30 hover:bg-[#f87171]/20 transition-colors cursor-pointer">Se deconnecter</button>
          </div>
        </section>

        {/* ═══ PROFILE SAVED TOAST ═══ */}
        {profileSaved && (
          <div className="fixed bottom-6 right-6 bg-[#10b981]/20 border border-[#10b981]/30 text-[#10b981] px-4 py-2 rounded-[8px] text-sm z-50 animate-fade-in">
            Profil enregistre
          </div>
        )}
      </div>
    </div>
  );
}
