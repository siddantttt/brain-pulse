export type Domain = 'focus' | 'memory' | 'logic' | 'visual' | 'math'

export interface UserProfile {
  id: string
  streak_days: number
  last_session_at: string | null
  goal: Domain | null
  onboarding_done: boolean
  created_at: string
}

export interface GameSession {
  id: string
  user_id: string
  domain: Domain
  score: number
  difficulty: number
  played_at: string
}

export interface DomainScores {
  focus: number
  memory: number
  logic: number
  visual: number
  math: number
}

export const DOMAIN_LABELS: Record<Domain, string> = {
  focus: 'Focus',
  memory: 'Memory',
  logic: 'Logic',
  visual: 'Visual',
  math: 'Math',
}

/**
 * Cognitive color system — every color is tied to a brain state.
 * Blue   → focus / attention / stability
 * Green  → memory / concentration / reduced fatigue
 * Yellow → logic / pattern recognition / creativity
 * Blue2  → visuospatial attention (lighter blue family)
 * Red    → processing speed / reaction time (accent only, never dominant)
 */
export const DOMAIN_COLORS: Record<Domain, { primary: string; light: string }> = {
  focus:  { primary: '#1B4FD8', light: '#93C5FD' },
  memory: { primary: '#16A34A', light: '#86EFAC' },
  logic:  { primary: '#CA8A04', light: '#FDE68A' },
  visual: { primary: '#0284C7', light: '#7DD3FC' },
  math:   { primary: '#DC2626', light: '#FCA5A5' },
}
