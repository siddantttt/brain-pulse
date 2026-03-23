import { PulseIcon } from './Icons'

export default function StreakBadge({ streak }: { streak: number }) {
  if (streak === 0) {
    return <p className="text-sm" style={{ color: '#6B7280' }}>Start your streak today</p>
  }
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
      style={{ background: 'rgba(27,79,216,0.12)', border: '1px solid rgba(27,79,216,0.3)' }}>
      <PulseIcon size={13} style={{ color: '#1B4FD8' }} />
      <span className="text-sm font-medium" style={{ color: '#93C5FD' }}>{streak} day streak</span>
    </div>
  )
}
