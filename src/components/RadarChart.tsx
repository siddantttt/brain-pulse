import {
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts'
import type { DomainScores } from '../types'

interface Props {
  scores: DomainScores
  size?: number
}

export default function BrainRadarChart({ scores, size = 280 }: Props) {
  const data = [
    { domain: 'Focus', score: scores.focus },
    { domain: 'Memory', score: scores.memory },
    { domain: 'Logic', score: scores.logic },
    { domain: 'Visual', score: scores.visual },
    { domain: 'Math', score: scores.math },
  ]

  return (
    <ResponsiveContainer width={size} height={size}>
      <RechartsRadar data={data} outerRadius="70%">
        <PolarGrid stroke="rgba(255,255,255,0.1)" />
        <PolarAngleAxis
          dataKey="domain"
          tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
        />
        <Radar
          dataKey="score"
          stroke="#6366f1"
          fill="#6366f1"
          fillOpacity={0.25}
          strokeWidth={2}
        />
      </RechartsRadar>
    </ResponsiveContainer>
  )
}
