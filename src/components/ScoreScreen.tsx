import { DOMAIN_LABELS } from '../types'
import type { Domain } from '../types'

export default function ScoreScreen({ domain, score, lastScore, isLast, onNext }: {
  domain: Domain; score: number; lastScore: number | null; isLast: boolean; onNext: () => void
}) {
  const delta = lastScore !== null ? Math.round(score - lastScore) : null

  return (
    <div className="flex flex-col items-center gap-8 text-center w-full max-w-xs mx-auto">
      <div>
        <p className="text-xs uppercase tracking-widest mb-3" style={{ color: '#444' }}>{DOMAIN_LABELS[domain]}</p>
        <div className="text-7xl font-bold tracking-tight" style={{ color: '#f0f0f0' }}>{Math.round(score)}</div>
        <p className="text-sm mt-1" style={{ color: '#444' }}>out of 100</p>
      </div>

      {delta !== null ? (
        <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
          style={{
            background: delta > 0 ? 'rgba(79,158,255,0.08)' : delta < 0 ? 'rgba(255,85,85,0.08)' : 'rgba(255,255,255,0.04)',
            color: delta > 0 ? '#4f9eff' : delta < 0 ? '#ff5555' : '#444',
            border: `1px solid ${delta > 0 ? 'rgba(79,158,255,0.2)' : delta < 0 ? 'rgba(255,85,85,0.2)' : '#1e1e1e'}`,
          }}>
          {delta > 0 ? `+${delta} from last time` : delta === 0 ? 'Same as last time' : `${delta} from last time`}
        </div>
      ) : (
        <div className="px-4 py-2 rounded-full text-sm" style={{ background: 'rgba(79,158,255,0.06)', color: '#4f9eff', border: '1px solid rgba(79,158,255,0.12)' }}>
          First attempt
        </div>
      )}

      <div className="w-full rounded-full overflow-hidden" style={{ height: 3, background: '#1e1e1e' }}>
        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${score}%`, background: '#4f9eff' }} />
      </div>

      <button onClick={onNext} className="btn-primary w-full py-3.5">
        {isLast ? 'See results' : 'Next game'}
      </button>
    </div>
  )
}
