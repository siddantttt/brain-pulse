import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useDomainScores } from '../hooks/useDomainScores'
import BrainRadarChart from '../components/RadarChart'
import StreakBadge from '../components/StreakBadge'
import { supabase } from '../lib/supabase'
import type { Domain } from '../types'
import { DOMAIN_LABELS } from '../types'

const NEURO_TIPS = [
  "Sleep in the next few hours will consolidate today's memory gains.",
  "Hydration boosts cognitive performance by up to 14% — drink water now.",
  "A 10-minute walk after training accelerates neural plasticity.",
  "Your brain strengthens these pathways most during the first sleep cycle.",
  "Spaced repetition: tomorrow's session will lock in today's improvements.",
  "Challenge and novelty trigger BDNF — the brain's growth protein.",
  "Deep breathing for 2 minutes increases prefrontal cortex activity.",
  "Social connection after learning enhances memory consolidation.",
  "Avoid screens for 30 minutes to let your brain integrate new patterns.",
  "Today's training reduces cognitive decline risk by building brain reserve.",
]

function getTip() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
  return NEURO_TIPS[dayOfYear % NEURO_TIPS.length]
}

export default function SessionComplete() {
  const navigate = useNavigate()
  const location = useLocation()
  const { profile, refreshProfile } = useAuth()
  const { scores } = useDomainScores()

  const results: Array<{ domain: Domain; score: number; difficulty: number }> = location.state?.results ?? []

  // Update streak on mount
  useEffect(() => {
    async function updateStreak() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: p } = await supabase
        .from('user_profiles')
        .select('streak_days, last_session_at')
        .eq('id', user.id)
        .single()

      if (!p) return

      const today = new Date().toDateString()
      const last = p.last_session_at ? new Date(p.last_session_at).toDateString() : null

      if (last !== today) {
        await supabase.from('user_profiles').update({
          streak_days: (p.streak_days ?? 0) + 1,
          last_session_at: new Date().toISOString(),
        }).eq('id', user.id)
        await refreshProfile()
      }
    }
    updateStreak()
  }, [refreshProfile])

  const deltas = results.map(r => {
    const prev = scores[r.domain]
    return { domain: r.domain, score: r.score, delta: Math.round(r.score - prev) }
  })

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-4xl mb-3">🎉</div>
        <h1 className="text-2xl font-bold text-white">Session complete!</h1>
        <div className="flex justify-center mt-3">
          <StreakBadge streak={(profile?.streak_days ?? 0)} />
        </div>
      </div>

      {/* Updated radar */}
      <div className="flex justify-center mb-6">
        <BrainRadarChart scores={scores} size={240} />
      </div>

      {/* Score deltas */}
      <div className="flex flex-col gap-2 mb-6">
        {deltas.map(({ domain, score, delta }) => (
          <div key={domain} className="flex items-center justify-between px-4 py-3 bg-white/5 border border-white/10 rounded-xl">
            <span className="text-white text-sm font-medium">{DOMAIN_LABELS[domain]}</span>
            <div className="flex items-center gap-3">
              <span className="text-white/50 text-sm">{Math.round(score)}/100</span>
              <span className={`text-sm font-semibold ${
                delta > 0 ? 'text-emerald-400' :
                delta < 0 ? 'text-red-400' : 'text-white/40'
              }`}>
                {delta > 0 ? `+${delta}` : delta === 0 ? '—' : `${delta}`}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Neuro tip */}
      <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl mb-6">
        <div className="text-indigo-300 text-xs uppercase tracking-widest mb-1">Neuroscience tip</div>
        <p className="text-white/70 text-sm">{getTip()}</p>
      </div>

      {/* Actions */}
      <button
        onClick={() => navigate('/progress')}
        className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold text-white transition-colors mb-3"
      >
        See my progress
      </button>
      <button
        onClick={() => navigate('/home')}
        className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/60 hover:text-white transition-colors"
      >
        Done for today
      </button>
    </div>
  )
}
