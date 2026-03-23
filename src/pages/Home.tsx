import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useDomainScores } from '../hooks/useDomainScores'
import { useGameSessions } from '../hooks/useGameSessions'
import BrainRadarChart from '../components/RadarChart'
import StreakBadge from '../components/StreakBadge'
import { PulseIcon, FocusIcon, MemoryIcon, LogicIcon, VisualIcon, MathIcon, FlexibilityIcon, ArrowRightIcon, TrendUpIcon } from '../components/Icons'
import type { Domain } from '../types'
import { DOMAIN_LABELS, DOMAIN_COLORS } from '../types'

const DOMAIN_ICONS = { focus: FocusIcon, memory: MemoryIcon, logic: LogicIcon, visual: VisualIcon, math: MathIcon, flexibility: FlexibilityIcon }

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
          <PulseIcon size={15} style={{ color: '#1B4FD8' }} />
          <span className="font-semibold tracking-tight text-sm">Brain Pulse</span>
        </div>
        <button onClick={signOut} className="text-xs transition-colors" style={{ color: '#4B5563' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#9CA3AF')}
          onMouseLeave={e => (e.currentTarget.style.color = '#4B5563')}>
          Sign out
        </button>
      </div>

      {/* Streak */}
      <div className="mb-8">
        <StreakBadge streak={profile?.streak_days ?? 0} />
      </div>

      {/* Radar */}
      <div className="rounded-2xl p-6 mb-4" style={{ background: '#111827', border: '1px solid #1F2937' }}>
        <p className="text-xs uppercase tracking-widest mb-6" style={{ color: '#4B5563' }}>Brain Profile</p>
        {loading ? (
          <div className="flex items-center justify-center" style={{ height: 280 }}>
            <div className="w-1 h-8 rounded animate-pulse" style={{ background: '#1F2937' }} />
          </div>
        ) : (
          <div className="flex justify-center">
            <BrainRadarChart scores={scores} size={260} />
          </div>
        )}
        {/* Domain scores — each labelled in its cognitive color */}
        <div className="grid grid-cols-6 gap-2 mt-4">
          {(Object.keys(scores) as Domain[]).map(d => {
            const Icon = DOMAIN_ICONS[d]
            const dc = DOMAIN_COLORS[d]
            return (
              <div key={d} className="text-center">
                <Icon size={13} className="mx-auto mb-1" style={{ color: dc.primary }} />
                <div className="text-xs font-medium" style={{ color: dc.light }}>{scores[d]}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Today's session */}
      <div className="rounded-2xl p-6 mb-4" style={{ background: '#111827', border: '1px solid #1F2937' }}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs uppercase tracking-widest" style={{ color: '#4B5563' }}>Today's Session</p>
          <span className="text-xs" style={{ color: '#374151' }}>~12 min</span>
        </div>

        {hasPlayedToday && (
          <p className="text-xs mb-4" style={{ color: '#93C5FD' }}>Session complete for today</p>
        )}

        <div className="flex flex-col gap-2 mb-5">
          {plan.map((domain, i) => {
            const Icon = DOMAIN_ICONS[domain]
            const dc = DOMAIN_COLORS[domain]
            const tag = i === 0 ? 'Goal' : i === 1 ? 'Weakest' : 'Daily'
            return (
              <div key={domain} className="flex items-center gap-3 px-3 py-3 rounded-xl"
                style={{ background: '#0A0F1E', borderLeft: `2px solid ${dc.primary}` }}>
                <div className="p-1.5 rounded-lg" style={{ background: dc.primary + '18' }}>
                  <Icon size={14} style={{ color: dc.primary }} />
                </div>
                <div className="flex-1">
                  <span className="text-sm font-medium">{DOMAIN_LABELS[domain]}</span>
                </div>
                <span className="text-xs" style={{ color: '#4B5563' }}>{tag}</span>
                <span className="text-xs font-medium" style={{ color: dc.light }}>{scores[domain]}</span>
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
        <div className="rounded-2xl px-6 py-2" style={{ background: '#111827', border: '1px solid #1F2937' }}>
          <button onClick={() => navigate('/progress')} className="w-full flex items-center justify-between py-3">
            <div className="flex items-center gap-2">
              <TrendUpIcon size={14} style={{ color: '#6B7280' }} />
              <span className="text-sm" style={{ color: '#6B7280' }}>View progress</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs" style={{ color: '#4B5563' }}>{sessions.length} sessions</span>
              <ArrowRightIcon size={13} style={{ color: '#4B5563' }} />
            </div>
          </button>
        </div>
      )}
    </div>
  )
}
