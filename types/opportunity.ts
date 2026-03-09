// ============================================================
// TYPES — PHAROS
// ============================================================

export type SignalType = 'reglementation' | 'tendance' | 'friction' | 'techno' | 'demande';
export type PlanType = 'free' | 'pro';
export type ScanStatus = 'pending' | 'completed' | 'failed';
export type SavedStatus = 'saved' | 'launched' | 'archived';

export interface Scores {
  urgence: number;
  faisabilite: number;
  rentabilite: number;
  competition: number;
  timing: number;
}

export interface Justification {
  signal: string;
  timing: string;
  market_proof: string;
}

export interface Project {
  description: string;
  target_user: string;
  revenue_model: string;
  mvp_features: string[];
  stack: string;
  build_time: string;
  monthly_potential: string;
}

export interface Opportunity {
  id: number;
  name: string;
  tagline: string;
  signal_type: SignalType;
  justification: Justification;
  project: Project;
  scores: Scores;
}

export interface ScanResult {
  scan_date: string;
  market_pulse: string;
  opportunities: Opportunity[];
}

export interface Scan {
  id: string;
  user_id: string;
  market_pulse: string;
  scan_date: string;
  opportunities: Opportunity[];
  status: ScanStatus;
}

export interface SavedOpportunity {
  id: string;
  user_id: string;
  scan_id: string;
  opportunity: Opportunity;
  status: SavedStatus;
  notes: string | null;
  saved_at: string;
}

export interface Profile {
  id: string;
  email: string;
  plan: PlanType;
  scans_this_month: number;
  scans_reset_date: string;
  stripe_customer_id: string | null;
  created_at: string;
  // Onboarding fields
  display_name: string | null;
  bio: string | null;
  interests: string[];
  skills: string[];
  project_goals: string | null;
  onboarding_completed: boolean;
}

// Signal configuration
export const SIGNAL_CONFIG: Record<SignalType, { label: string; color: string; icon: string }> = {
  reglementation: { label: 'Réglementation', color: '#f43f5e', icon: '⚖️' },
  tendance: { label: 'Tendance', color: '#8b5cf6', icon: '📈' },
  friction: { label: 'Friction', color: '#f59e0b', icon: '⚡' },
  techno: { label: 'Technologie', color: '#3b82f6', icon: '🔧' },
  demande: { label: 'Demande', color: '#10b981', icon: '🎯' },
};

// Normalize signal_type from AI responses to canonical values
const SIGNAL_ALIASES: Record<string, SignalType> = {
  // Réglementation variants
  reglementation: 'reglementation',
  réglementation: 'reglementation',
  regulation: 'reglementation',
  pont_reglementaire: 'reglementation',
  compliance: 'reglementation',
  legal: 'reglementation',
  // Tendance variants
  tendance: 'tendance',
  trend: 'tendance',
  macro_tendance: 'tendance',
  tendance_macro: 'tendance',
  // Friction variants
  friction: 'friction',
  pain_point: 'friction',
  douleur: 'friction',
  probleme: 'friction',
  // Technologie variants
  techno: 'techno',
  technologie: 'techno',
  technology: 'techno',
  tech: 'techno',
  nouvelle_techno: 'techno',
  // Demande variants
  demande: 'demande',
  demand: 'demande',
  marche: 'demande',
  market: 'demande',
  besoin: 'demande',
};

export function normalizeSignalType(raw: string): SignalType {
  if (!raw) return 'tendance';
  const key = raw.toLowerCase().trim().replace(/[éèê]/g, 'e').replace(/\s+/g, '_');
  return SIGNAL_ALIASES[key] || SIGNAL_ALIASES[raw.toLowerCase().trim()] || 'tendance';
}

// Scan animation phases
export const SCAN_PHASES = [
  { icon: '🌐', label: 'Analyse des tendances tech mondiales...' },
  { icon: '📊', label: 'Scan des opportunités micro-SaaS...' },
  { icon: '⚖️', label: 'Vérification des changements réglementaires...' },
  { icon: '💬', label: 'Analyse des frictions utilisateurs (Reddit, forums)...' },
  { icon: '🧠', label: 'Scoring et classement des opportunités...' },
  { icon: '✨', label: 'Génération du rapport final...' },
];
