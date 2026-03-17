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
