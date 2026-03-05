// ============================================================
// TYPES — Radar Opportunités
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
}

// Signal configuration
export const SIGNAL_CONFIG: Record<SignalType, { label: string; color: string; icon: string }> = {
  reglementation: { label: 'Réglementation', color: '#f43f5e', icon: '⚖️' },
  tendance: { label: 'Tendance', color: '#8b5cf6', icon: '📈' },
  friction: { label: 'Friction', color: '#f59e0b', icon: '⚡' },
  techno: { label: 'Technologie', color: '#3b82f6', icon: '🔧' },
  demande: { label: 'Demande', color: '#10b981', icon: '🎯' },
};

// Scan animation phases
export const SCAN_PHASES = [
  { icon: '🌐', label: 'Analyse des tendances tech mondiales...' },
  { icon: '📊', label: 'Scan des opportunités micro-SaaS...' },
  { icon: '⚖️', label: 'Vérification des changements réglementaires...' },
  { icon: '💬', label: 'Analyse des frictions utilisateurs (Reddit, forums)...' },
  { icon: '🧠', label: 'Scoring et classement des opportunités...' },
  { icon: '✨', label: 'Génération du rapport final...' },
];
