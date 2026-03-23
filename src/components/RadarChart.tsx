import { RadarChart as RechartsRadar, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts'
import type { DomainScores } from '../types'

export default function BrainRadarChart({ scores, size = 280 }: { scores: DomainScores; size?: number }) {
  const data = [
    { domain: 'Focus',  score: scores.focus },
    { domain: 'Memory', score: scores.memory },
    { domain: 'Logic',  score: scores.logic },
    { domain: 'Visual', score: scores.visual },
    { domain: 'Math',   score: scores.math },
  ]
  return (
    <ResponsiveContainer width={size} height={size}>
      <RechartsRadar data={data} outerRadius="70%">
        <PolarGrid stroke="rgba(255,255,255,0.06)" />
        <PolarAngleAxis dataKey="domain" tick={{ fill: '#444', fontSize: 11 }} />
        <Radar dataKey="score" stroke="#4f9eff" fill="#4f9eff" fillOpacity={0.12} strokeWidth={1.5} />
      </RechartsRadar>
    </ResponsiveContainer>
  )
}
