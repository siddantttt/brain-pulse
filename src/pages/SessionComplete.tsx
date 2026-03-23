import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useDomainScores } from '../hooks/useDomainScores'
import BrainRadarChart from '../components/RadarChart'
import StreakBadge from '../components/StreakBadge'
import { supabase } from '../lib/supabase'
import { TrendUpIcon } from '../components/Icons'
import type { Domain } from '../types'
import { DOMAIN_LABELS } from '../types'

const TIPS = [
  "Sleep in the next few hours consolidates today's memory gains.",
  "Hydration boosts cognitive performance by up to 14%.",
  "A 10-minute walk after training accelerates neural plasticity.",
  "Your brain strengthens these pathways most during the first sleep cycle.",
  "Spaced repetition: tomorrow's session locks in today's gains.",
  "Challenge and novelty trigger BDNF — the brain's growth protein.",
  "Deep breathing for 2 minutes increases prefrontal cortex activity.",
  "Social connection after learning enhances memory consolidation.",
  "Avoid screens for 30 minutes to let your brain integrate new patterns.",
  "Today's training builds cognitive reserve against future decline.",
]

function getTip() {
  const day = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
  return TIPS[day % TIPS.length]
}

export default function SessionComplete() {
  const navigate = useNavigate()
  const location = useLocation()
  const { profile, refreshProfile } = useAuth()
  const { scores } = useDomainScores()
  const results: Array<{ domain: Domain; score: number; difficulty: number }> = location.state?.results ?? []

  useEffect(() => {
    async function updateStreak() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: p } = await supabase.from('user_profiles').select('streak_days, last_session_at').eq('id', user.id).single()
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

  const deltas = results.map(r => ({
    domain: r.domain,
    score: r.score,
    delta: Math.round(r.score - scores[r.domain]),
  }))

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto px-4 py-10">

      {/* Header */}
      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest mb-2" style={{ color: '#444' }}>Session complete</p>
        <StreakBadge streak={profile?.streak_days ?? 0} />
      </div>

      {/* Radar */}
      <div className="flex justify-center mb-6">
        <BrainRadarChart scores={scores} size={220} />
      </div>

      {/* Deltas */}
      <div className="rounded-2xl overflow-hidden mb-4" style={{ border: '1px solid #1e1e1e' }}>
        {deltas.map(({ domain, score, delta }, i) => (
          <div key={domain} className="flex items-center justify-between px-4 py-3.5"
            style={{ borderBottom: i < deltas.length - 1 ? '1px solid #1a1a1a' : 'none', background: '#111' }}>
            <span className="text-sm">{DOMAIN_LABELS[domain]}</span>
            <div className="flex items-center gap-3">
              <span className="text-sm" style={{ color: '#444' }}>{Math.round(score)}</span>
              <span className="text-sm font-medium w-12 text-right"
                style={{ color: delta > 0 ? '#4f9eff' : delta < 0 ? '#ff5555' : '#444' }}>
                {delta > 0 ? `+${delta}` : delta === 0 ? '—' : delta}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Tip */}
      <div className="rounded-2xl px-5 py-4 mb-6" style={{ background: '#111', border: '1px solid #1e1e1e' }}>
        <p className="text-xs uppercase tracking-widest mb-2" style={{ color: '#4f9eff' }}>Neuroscience</p>
        <p className="text-sm leading-relaxed" style={{ color: '#555' }}>{getTip()}</p>
      </div>

      {/* Actions */}
      <button onClick={() => navigate('/progress')}
        className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 mb-3">
        <TrendUpIcon size={15} /> See my progress
      </button>
      <button onClick={() => navigate('/home')} className="btn-ghost w-full py-3.5 text-sm" style={{ color: '#555' }}>
        Done for today
      </button>
    </div>
  )
}
