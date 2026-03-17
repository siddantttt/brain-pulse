import { DOMAIN_LABELS } from '../types'
import type { Domain } from '../types'

interface Props {
  domain: Domain
  score: number
  lastScore: number | null
  isLast: boolean
  onNext: () => void
}

export default function ScoreScreen({ domain, score, lastScore, isLast, onNext }: Props) {
  const delta = lastScore !== null ? score - lastScore : null

  return (
    <div className="flex flex-col items-center gap-8 text-center">
      <div>
        <p className="text-white/50 text-sm uppercase tracking-widest mb-1">{DOMAIN_LABELS[domain]}</p>
        <h2 className="text-5xl font-bold text-white">{Math.round(score)}</h2>
        <p className="text-white/40 text-sm mt-1">out of 100</p>
      </div>

      {delta !== null ? (
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
          delta > 0 ? 'bg-emerald-500/10 border border-emerald-500/30' :
          delta < 0 ? 'bg-red-500/10 border border-red-500/30' :
          'bg-white/5 border border-white/10'
        }`}>
          <span className={`font-semibold ${
            delta > 0 ? 'text-emerald-400' :
            delta < 0 ? 'text-red-400' : 'text-white/50'
          }`}>
            {delta > 0 ? `+${delta}` : delta === 0 ? 'Same as last time' : `${delta}`}
          </span>
          {delta !== 0 && <span className="text-white/40 text-sm">from last time</span>}
        </div>
      ) : (
        <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full text-indigo-300 text-sm">
          First attempt!
        </div>
      )}

      <div className="w-full max-w-xs">
        <div className="w-full bg-white/5 rounded-full h-2">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000"
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      <button
        onClick={onNext}
        className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold text-white transition-colors w-full max-w-xs"
      >
        {isLast ? 'See results' : 'Next game'}
      </button>
    </div>
  )
}
