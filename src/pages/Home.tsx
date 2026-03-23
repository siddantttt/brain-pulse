import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useDomainScores } from '../hooks/useDomainScores'
import { useGameSessions } from '../hooks/useGameSessions'
import BrainRadarChart from '../components/RadarChart'
import StreakBadge from '../components/StreakBadge'
import { PulseIcon, FocusIcon, MemoryIcon, LogicIcon, VisualIcon, MathIcon, ArrowRightIcon, TrendUpIcon } from '../components/Icons'
import type { Domain } from '../types'
import { DOMAIN_LABELS } from '../types'

const DOMAIN_ICONS = { focus: FocusIcon, memory: MemoryIcon, logic: LogicIcon, visual: VisualIcon, math: MathIcon }

function getDailyPlan(goal: Domain | null, scores: Record<Domain, number>): Domain[] {
  const all: Domain[] = ['focus', 'memory', 'logic', 'visual', 'math']
  const primary = goal ?? 'memory'
  const remaining = all.filter(d => d !== primary)
  const lowest = remaining.reduce((a, b) => scores[a] <= scores[b] ? a : b)
  const third = remaining.filter(d => d !== lowest)[new Date().getDay() % 3] ?? 'math'
  return [primary, lowest, third]
}

export default function Home() {
  const navigate = useNavigate()
  const { profile, signOut } = useAuth()
  const { scores, loading } = useDomainScores()
  const { sessions } = useGameSessions()

  const plan = getDailyPlan(profile?.goal ?? null, scores)
  const hasPlayedToday = profile?.last_session_at
    ? new Date(profile.last_session_at).toDateString() === new Date().toDateString()
    : false

  return (
    <div className="min-h-screen max-w-lg mx-auto px-4 py-8">

      {/* Nav */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-2">
          <PulseIcon size={15} style={{ color: '#4f9eff' }} />
          <span className="font-semibold tracking-tight text-sm">Brain Pulse</span>
        </div>
        <button onClick={signOut} className="text-xs transition-colors" style={{ color: '#333' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#666')}
          onMouseLeave={e => (e.currentTarget.style.color = '#333')}>
          Sign out
        </button>
      </div>

      {/* Streak */}
      <div className="mb-8">
        <StreakBadge streak={profile?.streak_days ?? 0} />
      </div>

      {/* Radar */}
      <div className="rounded-2xl p-6 mb-4" style={{ background: '#111', border: '1px solid #1e1e1e' }}>
        <p className="text-xs uppercase tracking-widest mb-6" style={{ color: '#444' }}>Brain Profile</p>
        {loading ? (
          <div className="flex items-center justify-center" style={{ height: 280 }}>
            <div className="w-1 h-8 rounded animate-pulse" style={{ background: '#1e1e1e' }} />
          </div>
        ) : (
          <div className="flex justify-center">
            <BrainRadarChart scores={scores} size={260} />
          </div>
        )}
        <div className="grid grid-cols-5 gap-2 mt-4">
          {(Object.keys(scores) as Domain[]).map(d => {
            const Icon = DOMAIN_ICONS[d]
            return (
              <div key={d} className="text-center">
                <Icon size={13} className="mx-auto mb-1" style={{ color: '#444' }} />
                <div className="text-xs font-medium">{scores[d]}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Today's session */}
      <div className="rounded-2xl p-6 mb-4" style={{ background: '#111', border: '1px solid #1e1e1e' }}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs uppercase tracking-widest" style={{ color: '#444' }}>Today's Session</p>
          <span className="text-xs" style={{ color: '#333' }}>~12 min</span>
        </div>

        {hasPlayedToday && (
          <p className="text-xs mb-4" style={{ color: '#4f9eff' }}>Session complete for today</p>
        )}

        <div className="flex flex-col gap-2 mb-5">
          {plan.map((domain, i) => {
            const Icon = DOMAIN_ICONS[domain]
            const tag = i === 0 ? 'Goal' : i === 1 ? 'Weakest' : 'Daily'
            return (
              <div key={domain} className="flex items-center gap-3 px-3 py-3 rounded-xl" style={{ background: '#161616' }}>
                <div className="p-1.5 rounded-lg" style={{ background: '#1e1e1e' }}>
                  <Icon size={14} style={{ color: '#666' }} />
                </div>
                <div className="flex-1">
                  <span className="text-sm font-medium">{DOMAIN_LABELS[domain]}</span>
                </div>
                <span className="text-xs" style={{ color: '#333' }}>{tag}</span>
                <span className="text-xs font-medium" style={{ color: '#444' }}>{scores[domain]}</span>
              </div>
            )
          })}
        </div>

        <button onClick={() => navigate('/session', { state: { plan } })} className="btn-primary w-full py-3.5 flex items-center justify-center gap-2">
          {hasPlayedToday ? 'Play again' : 'Start session'} <ArrowRightIcon size={15} />
        </button>
      </div>

      {/* Stats */}
      {sessions.length > 0 && (
        <div className="rounded-2xl px-6 py-2" style={{ background: '#111', border: '1px solid #1e1e1e' }}>
          <button onClick={() => navigate('/progress')} className="w-full flex items-center justify-between py-3">
            <div className="flex items-center gap-2">
              <TrendUpIcon size={14} style={{ color: '#444' }} />
              <span className="text-sm" style={{ color: '#555' }}>View progress</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs" style={{ color: '#333' }}>{sessions.length} sessions</span>
              <ArrowRightIcon size={13} style={{ color: '#333' }} />
            </div>
          </button>
        </div>
      )}
    </div>
  )
}
