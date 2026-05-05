import { DOMAIN_LABELS, DOMAIN_COLORS } from '../types'
import type { Domain, GameMetrics } from '../types'

// Average first-session scores by age group and domain
const AGE_BENCHMARKS: Record<string, Record<Domain, number>> = {
  teen:        { focus: 65, memory: 68, math: 62, logic: 60, flexibility: 63, visual: 67 },
  young_adult: { focus: 70, memory: 67, math: 68, logic: 65, flexibility: 67, visual: 65 },
  adult:       { focus: 62, memory: 60, math: 62, logic: 60, flexibility: 59, visual: 58 },
  midlife:     { focus: 55, memory: 53, math: 55, logic: 53, flexibility: 52, visual: 51 },
  senior:      { focus: 47, memory: 45, math: 47, logic: 45, flexibility: 43, visual: 43 },
}

type ComparisonTier = 'above' | 'onpar' | 'below'

const COMPARISON_COPY: Record<ComparisonTier, Record<Domain, { label: string; message: string }>> = {
  above: {
    focus:       { label: 'Above average for your age', message: "Your focus is stronger than most people your age on their first attempt. That kind of attention control is a real cognitive edge — and it only gets sharper from here." },
    memory:      { label: 'Above average for your age', message: "Your recall sits above average for your age group. Working memory like this compounds — every session builds on what you've already got." },
    math:        { label: 'Above average for your age', message: "Your mental arithmetic speed is above the average for your age. Fast numerical processing transfers into real-world decisions — keep pushing it." },
    logic:       { label: 'Above average for your age', message: "Your pattern recognition is ahead of where most people your age start. Fluid intelligence like this is one of the strongest predictors of academic performance." },
    flexibility: { label: 'Above average for your age', message: "You switch between rules faster than most people your age. Cognitive flexibility is rare — it shows up when things change quickly and most people freeze." },
    visual:      { label: 'Above average for your age', message: "Your spatial memory is above average for your age group. Visuospatial working memory underpins everything from navigation to complex problem-solving." },
  },
  onpar: {
    focus:       { label: 'On par with your age group', message: "Your focus is right where you'd expect for your age. Consistent training moves attention faster than almost any other domain — you're in a great starting position." },
    memory:      { label: 'On par with your age group', message: "You're tracking with your age group on working memory. This is exactly the kind of baseline we build from — a few sessions will make a visible difference." },
    math:        { label: 'On par with your age group', message: "Your math speed is in line with your age group. Processing speed responds quickly to training — you'll see this climb within a week of consistent sessions." },
    logic:       { label: 'On par with your age group', message: "Your logic score is right on the average for your age. Pattern recognition builds steadily — each session sharpens the instinct." },
    flexibility: { label: 'On par with your age group', message: "Solid flexibility for your age group. Cognitive shifting is one of the most trainable skills — keep showing up and this will move." },
    visual:      { label: 'On par with your age group', message: "Your spatial score is on track for your age. Visuospatial memory develops consistently with practice — you're in a good starting position." },
  },
  below: {
    focus:       { label: 'Room to grow here', message: "Your focus is a bit below average for your age — but that's exactly what Brain Pulse is for. Attention responds fast to the right training. A few sessions will move this noticeably. Nothing to worry about." },
    memory:      { label: 'Room to grow here', message: "Working memory is one of the most trainable cognitive skills. Being below average now means you have the most room to grow — you'll feel the difference within days of consistent sessions." },
    math:        { label: 'Room to grow here', message: "Your processing speed has real room to improve — and this domain responds to training faster than almost any other. Don't worry; just keep coming back." },
    logic:       { label: 'Room to grow here', message: "Pattern recognition can feel hard at first — it genuinely is. Being below average here is completely normal and is one of the areas Brain Pulse will focus on building for you." },
    flexibility: { label: 'Room to grow here', message: "Rule-switching is hard and scoring below average is common. Cognitive flexibility is highly trainable — Brain Pulse will target this specifically based on your profile. Nothing to stress about." },
    visual:      { label: 'Room to grow here', message: "Spatial memory is a skill most people never actively train, so being below average isn't surprising at all. This is one of the fastest-improving areas with targeted practice." },
  },
}

function getComparison(score: number, domain: Domain, ageGroup: string): { tier: ComparisonTier; label: string; message: string } | null {
  const bench = AGE_BENCHMARKS[ageGroup]
  if (!bench) return null
  const avg = bench[domain]
  const tier: ComparisonTier = score >= avg + 8 ? 'above' : score >= avg - 8 ? 'onpar' : 'below'
  return { tier, ...COMPARISON_COPY[tier][domain] }
}

// Response-time thresholds per cognitive domain (ms)
const RT_THRESHOLDS: Record<GameMetrics['domain'], { fast: number; slow: number }> = {
  attention:   { fast: 500,   slow: 900   },
  memory:      { fast: 2000,  slow: 4500  },
  speed:       { fast: 1000,  slow: 2500  },
  pattern:     { fast: 5000,  slow: 12000 },
  flexibility: { fast: 1500,  slow: 3000  },
  spatial:     { fast: 800,   slow: 2000  },
}

function formatRT(ms: number): string {
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`
}

function getDiagnostic(score: number, metrics: GameMetrics): { headline: string; detail: string } {
  const { accuracy, avgResponseTime, droppedUnderPressure, domain } = metrics
  const { fast, slow } = RT_THRESHOLDS[domain]
  const isFast = avgResponseTime < fast
  const isSlow = avgResponseTime > slow
  const isHighAcc = accuracy >= 80
  const isLowAcc  = accuracy < 55

  if (droppedUnderPressure) {
    const area = domain === 'attention' ? 'selective focus'
      : domain === 'memory'      ? 'working memory endurance'
      : domain === 'flexibility' ? 'sustained rule-switching'
      : domain === 'speed'       ? 'calculation speed under pressure'
      : domain === 'pattern'     ? 'abstract reasoning stamina'
      : 'spatial tracking endurance'
    return {
      headline: 'Faded under sustained load',
      detail: `Performance dropped in the second half — ${area} is the area to target in your next session.`,
    }
  }

  if (domain === 'attention') {
    if (isHighAcc && isFast)  return { headline: 'Sharp inhibitory control', detail: 'You filtered flanker interference quickly and accurately — a hallmark of strong selective attention.' }
    if (isHighAcc && isSlow)  return { headline: 'Accurate but deliberate', detail: 'High accuracy with slower responses. Pushing reaction speed in the next session will raise your ceiling.' }
    if (isLowAcc)             return { headline: 'High interference cost', detail: 'The flanking arrows pulled your focus. Inhibitory control builds with consistent practice — keep at it.' }
    return { headline: 'Solid focus session', detail: 'Consistent accuracy and timing — your attentional filtering is holding up well.' }
  }

  if (domain === 'memory') {
    if (score >= 75 && isFast) return { headline: 'Efficient recall', detail: 'Fast and accurate pair matching signals a strong working memory buffer — your hippocampal encoding is sharp.' }
    if (isSlow)                return { headline: 'Careful but slow', detail: 'You found the pairs but with deliberate pacing. Try building a mental map of positions during the preview window.' }
    if (score < 50)            return { headline: 'Memory load was high', detail: 'Fewer matches than expected for the grid size. Chunking cards into groups during preview can help encoding.' }
    return { headline: 'Solid memory session', detail: 'Consistent recall performance. Repeated sessions compound into long-term working memory gains.' }
  }

  if (domain === 'speed') {
    if (isHighAcc && isFast)  return { headline: 'Fast mental arithmetic', detail: 'Quick and accurate — your intraparietal sulcus is firing well. Strong numerical fluency under time pressure.' }
    if (isHighAcc && isSlow)  return { headline: 'Accurate, pace it up', detail: 'High accuracy but deliberate speed. Try committing to faster answers — your instincts are more reliable than you think.' }
    if (isLowAcc)             return { headline: 'Speed outpaced accuracy', detail: 'Rushing led to errors. A slight slowdown can significantly improve your net score — prioritise precision.' }
    return { headline: 'Solid math session', detail: 'Consistent performance under timed pressure — numerical cognition is developing steadily.' }
  }

  if (domain === 'pattern') {
    if (score >= 75)  return { headline: 'Strong pattern recognition', detail: 'You identified abstract rules reliably — fluid intelligence at work. This correlates strongly with academic reasoning.' }
    if (isLowAcc)     return { headline: 'Rules proved elusive', detail: 'Abstract pattern recognition is trainable. Each session builds the neural pathways for spotting structural relationships.' }
    return { headline: 'Developing logic skills', detail: 'Consistent logic training compounds over weeks — the pattern-spotting instinct sharpens with repetition.' }
  }

  if (domain === 'flexibility') {
    if (score >= 75 && isFast) return { headline: 'Rapid rule switching', detail: 'You adapted to new rules quickly — cognitive flexibility is a key executive function tied to learning and resilience.' }
    if (isSlow)                return { headline: 'Switching cost was high', detail: 'Each rule change slowed you noticeably. That switching cost is normal — and it shrinks measurably with practice.' }
    return { headline: 'Solid flexibility session', detail: 'You held your ground across rule shifts — executive control is developing well.' }
  }

  if (domain === 'spatial') {
    if (score >= 75 && isFast) return { headline: 'Sharp spatial memory', detail: 'Fast and accurate block tracking signals strong visuospatial working memory — a key asset in STEM reasoning.' }
    if (isSlow)                return { headline: 'Careful spatial tracking', detail: 'You tracked the sequences but took your time. Visualising the path as a route rather than a list can speed recall.' }
    return { headline: 'Solid visual session', detail: 'Consistent spatial tracking under increasing load — your visuospatial buffer is holding up.' }
  }

  return { headline: 'Session complete', detail: 'Keep training to build your cognitive baseline.' }
}

export default function ScoreScreen({ domain, score, lastScore, metrics, ageGroup, isLast, onNext }: {
  domain: Domain
  score: number
  lastScore: number | null
  metrics?: GameMetrics
  ageGroup?: string | null
  isLast: boolean
  onNext: () => void
}) {
  const delta = lastScore !== null ? Math.round(score - lastScore) : null
  const dc = DOMAIN_COLORS[domain]
  const diagnostic = metrics ? getDiagnostic(score, metrics) : null
  const comparison = ageGroup ? getComparison(score, domain, ageGroup) : null

  return (
    <div className="flex flex-col items-center gap-6 text-center w-full max-w-xs mx-auto">

      {/* Score */}
      <div>
        <p className="text-xs uppercase tracking-widest mb-3" style={{ color: dc.primary }}>{DOMAIN_LABELS[domain]}</p>
        <div className="text-7xl font-bold tracking-tight" style={{ color: dc.light }}>{Math.round(score)}</div>
        <p className="text-sm mt-1" style={{ color: '#6B7280' }}>out of 100</p>
      </div>

      {/* Delta badge */}
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

      {/* Score bar */}
      <div className="w-full rounded-full overflow-hidden" style={{ height: 3, background: '#1F2937' }}>
        <div className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${score}%`, background: dc.primary }} />
      </div>

      {/* Diagnostic panel */}
      {diagnostic && metrics && (
        <div className="w-full rounded-2xl px-4 py-4 text-left"
          style={{ background: '#111827', border: '1px solid #1F2937' }}>

          {/* Stats row */}
          <div className="flex justify-between mb-4">
            <div className="flex flex-col items-center gap-1">
              <span className="text-lg font-bold" style={{ color: '#F9FAFB' }}>{metrics.accuracy}%</span>
              <span className="text-xs" style={{ color: '#4B5563' }}>accuracy</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-lg font-bold" style={{ color: '#F9FAFB' }}>{formatRT(metrics.avgResponseTime)}</span>
              <span className="text-xs" style={{ color: '#4B5563' }}>avg speed</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-lg font-bold"
                style={{ color: metrics.droppedUnderPressure ? '#FCA5A5' : '#86EFAC' }}>
                {metrics.droppedUnderPressure ? 'Faded' : 'Held'}
              </span>
              <span className="text-xs" style={{ color: '#4B5563' }}>under load</span>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: '#1F2937', marginBottom: 12 }} />

          {/* Cognitive insight */}
          <p className="text-xs uppercase tracking-widest mb-1.5" style={{ color: dc.light }}>
            {diagnostic.headline}
          </p>
          <p className="text-sm leading-relaxed" style={{ color: '#6B7280' }}>
            {diagnostic.detail}
          </p>
        </div>
      )}

      {/* Age-group comparison */}
      {comparison && (
        <div className="w-full rounded-2xl px-4 py-4 text-left"
          style={{ background: '#111827', border: '1px solid #1F2937' }}>
          <p className="text-xs uppercase tracking-widest mb-1.5"
            style={{
              color: comparison.tier === 'above' ? '#86EFAC'
                : comparison.tier === 'onpar' ? '#93C5FD'
                : '#FDE68A',
            }}>
            {comparison.label}
          </p>
          <p className="text-sm leading-relaxed" style={{ color: '#6B7280' }}>
            {comparison.message}
          </p>
        </div>
      )}

      <button onClick={onNext} className="btn-primary w-full py-3.5">
        {isLast ? 'See results' : 'Next game'}
      </button>
    </div>
  )
}
