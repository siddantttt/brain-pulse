import { useMemo } from 'react'
import { useGameSessions } from './useGameSessions'
import type { Domain, DomainScores } from '../types'

const DOMAINS: Domain[] = ['focus', 'memory', 'logic', 'visual', 'math', 'flexibility']

export function useDomainScores(): { scores: DomainScores; loading: boolean } {
  const { sessions, loading } = useGameSessions()

  const scores = useMemo<DomainScores>(() => {
    const result = { focus: 50, memory: 50, logic: 50, visual: 50, math: 50, flexibility: 50 }

    for (const domain of DOMAINS) {
      const domainSessions = sessions.filter(s => s.domain === domain)
      if (domainSessions.length > 0) {
        // Use average of last 5 sessions
        const recent = domainSessions.slice(0, 5)
        result[domain] = Math.round(
          recent.reduce((a, b) => a + b.score, 0) / recent.length
        )
      }
    }

    return result
  }, [sessions])

  return { scores, loading }
}
