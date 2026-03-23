import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { GameSession, Domain } from '../types'

export function useGameSessions() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState<GameSession[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSessions = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('played_at', { ascending: false })
    if (data) setSessions(data as GameSession[])
    setLoading(false)
  }, [user])

  useEffect(() => { fetchSessions() }, [fetchSessions])

  async function saveSession(domain: Domain, score: number, difficulty: number) {
    if (!user) return
    await supabase.from('game_sessions').insert({
      user_id: user.id,
      domain,
      score,
      difficulty,
    })
    await fetchSessions()
  }

  function getLastScoresForDomain(domain: Domain, count = 3): GameSession[] {
    return sessions
      .filter(s => s.domain === domain)
      .slice(0, count)
  }

  function computeDifficulty(domain: Domain): number {
    const last3 = getLastScoresForDomain(domain, 3)

    // No history — start at 3 for new users
    if (last3.length === 0) return 3

    // Anchor to the most recent session's actual difficulty, not a hardcoded value.
    // This lets difficulty genuinely traverse 1–10 across sessions.
    const baseDifficulty = last3[0].difficulty
    const avg = last3.reduce((a, b) => a + b.score, 0) / last3.length

    // Graduated curve: larger jumps at the extremes, smaller in the middle
    if (avg > 80) return Math.min(baseDifficulty + 2, 10)
    if (avg > 65) return Math.min(baseDifficulty + 1, 10)
    if (avg < 25) return Math.max(baseDifficulty - 2, 1)
    if (avg < 40) return Math.max(baseDifficulty - 1, 1)
    return baseDifficulty
  }

  function getLastScore(domain: Domain): number | null {
    const domainSessions = sessions.filter(s => s.domain === domain)
    return domainSessions.length > 0 ? domainSessions[0].score : null
  }

  return { sessions, loading, saveSession, getLastScoresForDomain, computeDifficulty, getLastScore }
}
