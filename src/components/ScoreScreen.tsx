import { DOMAIN_LABELS, DOMAIN_COLORS } from '../types'
import type { Domain } from '../types'

export default function ScoreScreen({ domain, score, lastScore, isLast, onNext }: {
  domain: Domain; score: number; lastScore: number | null; isLast: boolean; onNext: () => void
}) {
  const delta = lastScore !== null ? Math.round(score - lastScore) : null
  const dc = DOMAIN_COLORS[domain]

  return (
    <div className="flex flex-col items-center gap-8 text-center w-full max-w-xs mx-auto">
      <div>
        <p className="text-xs uppercase tracking-widest mb-3" style={{ color: dc.primary }}>{DOMAIN_LABELS[domain]}</p>
        <div className="text-7xl font-bold tracking-tight" style={{ color: dc.light }}>{Math.round(score)}</div>
        <p className="text-sm mt-1" style={{ color: '#6B7280' }}>out of 100</p>
      </div>

      {delta !== null ? (
        <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
          style={{
            background: delta > 0 ? '#16A34A18' : delta < 0 ? 'rgba(220,38,38,0.08)' : 'rgba(255,255,255,0.04)',
            color: delta > 0 ? '#86EFAC' : delta < 0 ? '#FCA5A5' : '#6B7280',
            border: `1px solid ${delta > 0 ? '#16A34A40' : delta < 0 ? 'rgba(220,38,38,0.2)' : '#1F2937'}`,
          }}>
          {delta > 0 ? `+${delta} from last time` : delta === 0 ? 'Same as last time' : `${delta} from last time`}
        </div>
      ) : (
        <div className="px-4 py-2 rounded-full text-sm"
          style={{ background: dc.primary + '12', color: dc.light, border: `1px solid ${dc.primary}30` }}>
          First attempt
        </div>
      )}

      <div className="w-full rounded-full overflow-hidden" style={{ height: 3, background: '#1F2937' }}>
        <div className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${score}%`, background: dc.primary }} />
      </div>

      <button onClick={onNext} className="btn-primary w-full py-3.5">
        {isLast ? 'See results' : 'Next game'}
      </button>
    </div>
  )
}
