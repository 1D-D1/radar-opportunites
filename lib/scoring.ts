import type { Opportunity, Scores } from '@/types/opportunity';

export function getTotalScore(scores: Scores): number {
  return scores.urgence + scores.faisabilite + scores.rentabilite + scores.competition + scores.timing;
}

export function getScoreVerdict(total: number): { label: string; color: string } {
  if (total >= 42) return { label: 'Opportunité exceptionnelle', color: '#4ade80' };
  if (total >= 35) return { label: 'Très prometteur', color: '#6366f1' };
  if (total >= 28) return { label: 'Intéressant à explorer', color: '#fbbf24' };
  return { label: 'À surveiller', color: '#94a3b8' };
}

export function sortByScore(opportunities: Opportunity[]): Opportunity[] {
  return [...opportunities].sort((a, b) => getTotalScore(b.scores) - getTotalScore(a.scores));
}

export function getScoreColor(score: number): string {
  if (score >= 9) return '#4ade80';
  if (score >= 7) return '#6366f1';
  if (score >= 5) return '#fbbf24';
  return '#f87171';
}
