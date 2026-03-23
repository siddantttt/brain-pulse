import { RadarChart as RechartsRadar, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts'
import type { DomainScores } from '../types'
import { DOMAIN_COLORS } from '../types'

export default function BrainRadarChart({ scores, size = 280 }: { scores: DomainScores; size?: number }) {
  const data = [
    { domain: 'Focus',       score: scores.focus },
    { domain: 'Memory',      score: scores.memory },
    { domain: 'Logic',       score: scores.logic },
    { domain: 'Visual',      score: scores.visual },
    { domain: 'Math',        score: scores.math },
    { domain: 'Flexibility', score: scores.flexibility },
  ]
  return (
    <ResponsiveContainer width={size} height={size}>
      <RechartsRadar data={data} outerRadius="70%">
        <PolarGrid stroke="rgba(255,255,255,0.05)" />
        <PolarAngleAxis dataKey="domain" tick={{ fill: '#4B5563', fontSize: 11 }} />
        {/* Blue focus polygon — the "brain profile" lives in the focus domain's color space */}
        <Radar dataKey="score" stroke={DOMAIN_COLORS.focus.primary} fill={DOMAIN_COLORS.focus.primary} fillOpacity={0.1} strokeWidth={1.5} />
      </RechartsRadar>
    </ResponsiveContainer>
  )
}
