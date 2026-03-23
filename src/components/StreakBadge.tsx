import { PulseIcon } from './Icons'

export default function StreakBadge({ streak }: { streak: number }) {
  if (streak === 0) {
    return <p className="text-sm" style={{ color: '#444' }}>Start your streak today</p>
  }
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
      style={{ background: 'rgba(79,158,255,0.08)', border: '1px solid rgba(79,158,255,0.15)' }}>
      <PulseIcon size={13} style={{ color: '#4f9eff' }} />
      <span className="text-sm font-medium" style={{ color: '#4f9eff' }}>{streak} day streak</span>
    </div>
  )
}
