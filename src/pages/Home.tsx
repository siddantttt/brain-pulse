import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useDomainScores } from '../hooks/useDomainScores'
import { useGameSessions } from '../hooks/useGameSessions'
import BrainRadarChart from '../components/RadarChart'
import StreakBadge from '../components/StreakBadge'
import type { Domain } from '../types'
import { DOMAIN_LABELS } from '../types'

const DOMAIN_ICONS: Record<Domain, string> = {
  focus: '🎯',
  memory: '🧠',
  logic: '⚡',
  visual: '👁',
  math: '🔢',
}

function getDailyPlan(goal: Domain | null, scores: Record<Domain, number>): Domain[] {
  const allDomains: Domain[] = ['focus', 'memory', 'logic', 'visual', 'math']
  const primary = goal ?? 'memory'

  // Lowest score domain (excluding primary)
  const remaining = allDomains.filter(d => d !== primary)
  const lowest = remaining.reduce((a, b) => scores[a] <= scores[b] ? a : b)

  // Rotating third (day-of-week % 3 from remaining - primary - lowest)
  const third = remaining.filter(d => d !== lowest)[new Date().getDay() % 3] ?? 'math'

  return [primary, lowest, third]
}

export default function Home() {
  const navigate = useNavigate()
  const { profile, signOut } = useAuth()
  const { scores, loading } = useDomainScores()
  const { sessions } = useGameSessions()

  const plan = getDailyPlan(profile?.goal ?? null, scores)

  const hasPlayedToday = (() => {
    if (!profile?.last_session_at) return false
    return new Date(profile.last_session_at).toDateString() === new Date().toDateString()
  })()

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🧠</span>
          <span className="font-bold text-white text-lg">Brain Pulse</span>
        </div>
        <button
          onClick={signOut}
          className="text-white/30 hover:text-white/60 text-sm transition-colors"
        >
          Sign out
        </button>
      </div>

      {/* Streak */}
      <div className="flex justify-center mb-8">
        <StreakBadge streak={profile?.streak_days ?? 0} />
      </div>

      {/* Radar Chart */}
      <div className="flex flex-col items-center mb-8">
        <h2 className="text-white/50 text-sm uppercase tracking-widest mb-4">Your Brain Profile</h2>
        {loading ? (
          <div className="w-70 h-70 flex items-center justify-center text-white/20">Loading…</div>
        ) : (
          <BrainRadarChart scores={scores} size={280} />
        )}
        <div className="flex gap-4 mt-2">
          {(Object.keys(scores) as Domain[]).map(d => (
            <div key={d} className="text-center">
              <div className="text-xs text-white/40">{DOMAIN_LABELS[d]}</div>
              <div className="text-sm font-semibold text-white">{scores[d]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Today's Session Card */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-white font-semibold">Today's Session</h3>
          <span className="text-white/40 text-sm">~12 min</span>
        </div>
        {hasPlayedToday && (
          <p className="text-emerald-400 text-sm mb-3">✓ Session complete for today</p>
        )}
        {!hasPlayedToday && (
          <p className="text-white/40 text-sm mb-3">3 games · personalized for you</p>
        )}

        <div className="flex flex-col gap-2 mb-5">
          {plan.map((domain, i) => (
            <div
              key={domain}
              className="flex items-center gap-3 px-3 py-2 bg-white/5 rounded-xl"
            >
              <span className="text-lg">{DOMAIN_ICONS[domain]}</span>
              <div className="flex-1">
                <div className="text-white text-sm font-medium">{DOMAIN_LABELS[domain]}</div>
                <div className="text-white/30 text-xs">
                  {i === 0 ? 'Your goal' : i === 1 ? 'Needs work' : 'Daily rotation'}
                </div>
              </div>
              <div className="text-white/40 text-sm">{scores[domain]}</div>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate('/session', { state: { plan } })}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold text-white transition-colors"
        >
          {hasPlayedToday ? 'Play again' : 'Start Session'}
        </button>
      </div>

      {/* Quick stats */}
      {sessions.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/progress')}
            className="p-4 bg-white/5 border border-white/10 rounded-xl text-left hover:bg-white/10 transition-colors"
          >
            <div className="text-white/40 text-xs mb-1">Total sessions</div>
            <div className="text-white font-bold text-xl">{sessions.length}</div>
          </button>
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
            <div className="text-white/40 text-xs mb-1">Best streak</div>
            <div className="text-white font-bold text-xl">{profile?.streak_days ?? 0} 🔥</div>
          </div>
        </div>
      )}
    </div>
  )
}
