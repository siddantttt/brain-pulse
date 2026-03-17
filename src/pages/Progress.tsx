import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { useGameSessions } from '../hooks/useGameSessions'
import type { Domain } from '../types'
import { DOMAIN_LABELS } from '../types'

const DOMAIN_COLORS: Record<Domain, string> = {
  focus: '#6366f1',
  memory: '#ec4899',
  logic: '#10b981',
  visual: '#f59e0b',
  math: '#3b82f6',
}

const ALL_DOMAINS: Domain[] = ['focus', 'memory', 'logic', 'visual', 'math']

export default function Progress() {
  const navigate = useNavigate()
  const { sessions, loading } = useGameSessions()
  const [hidden, setHidden] = useState<Set<Domain>>(new Set())

  const chartData = useMemo(() => {
    const last14: string[] = []
    for (let i = 13; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      last14.push(d.toDateString())
    }

    return last14.map(dateStr => {
      const daySessions = sessions.filter(
        s => new Date(s.played_at).toDateString() === dateStr
      )
      const point: Record<string, string | number> = {
        date: new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      }
      for (const domain of ALL_DOMAINS) {
        const domainDay = daySessions.filter(s => s.domain === domain)
        if (domainDay.length > 0) {
          point[domain] = Math.round(
            domainDay.reduce((a, b) => a + b.score, 0) / domainDay.length
          )
        }
      }
      return point
    })
  }, [sessions])

  function toggleDomain(d: Domain) {
    setHidden(prev => {
      const next = new Set(prev)
      if (next.has(d)) next.delete(d)
      else next.add(d)
      return next
    })
  }

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="text-white/40 hover:text-white transition-colors"
        >
          ← Back
        </button>
        <h1 className="text-xl font-bold text-white">Progress</h1>
      </div>

      <div className="mb-4">
        <h2 className="text-white/50 text-sm uppercase tracking-widest mb-4">14-Day History</h2>
        {loading ? (
          <div className="text-white/30 text-sm text-center py-12">Loading…</div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/40">No sessions yet.</p>
            <button
              onClick={() => navigate('/home')}
              className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm text-white transition-colors"
            >
              Start your first session
            </button>
          </div>
        ) : (
          <>
            {/* Domain toggles */}
            <div className="flex flex-wrap gap-2 mb-4">
              {ALL_DOMAINS.map(d => (
                <button
                  key={d}
                  onClick={() => toggleDomain(d)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                    hidden.has(d)
                      ? 'border-white/10 text-white/30'
                      : 'border-transparent text-white'
                  }`}
                  style={hidden.has(d) ? {} : { backgroundColor: DOMAIN_COLORS[d] + '33', borderColor: DOMAIN_COLORS[d] + '66', color: DOMAIN_COLORS[d] }}
                >
                  {DOMAIN_LABELS[d]}
                </button>
              ))}
            </div>

            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                  interval={3}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#16162a',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12,
                    color: 'white',
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}
                />
                {ALL_DOMAINS.filter(d => !hidden.has(d)).map(d => (
                  <Line
                    key={d}
                    type="monotone"
                    dataKey={d}
                    name={DOMAIN_LABELS[d]}
                    stroke={DOMAIN_COLORS[d]}
                    strokeWidth={2}
                    dot={false}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </>
        )}
      </div>

      {/* Per-domain stats */}
      {sessions.length > 0 && (
        <div className="mt-4">
          <h2 className="text-white/50 text-sm uppercase tracking-widest mb-3">Domain Stats</h2>
          <div className="flex flex-col gap-2">
            {ALL_DOMAINS.map(d => {
              const domainSessions = sessions.filter(s => s.domain === d)
              if (domainSessions.length === 0) return null
              const avg = Math.round(domainSessions.reduce((a, b) => a + b.score, 0) / domainSessions.length)
              const best = Math.round(Math.max(...domainSessions.map(s => s.score)))
              return (
                <div key={d} className="flex items-center justify-between px-4 py-3 bg-white/5 border border-white/10 rounded-xl">
                  <span className="text-white text-sm font-medium">{DOMAIN_LABELS[d]}</span>
                  <div className="flex gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-white/40 text-xs">Avg</div>
                      <div className="text-white font-semibold">{avg}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white/40 text-xs">Best</div>
                      <div style={{ color: DOMAIN_COLORS[d] }} className="font-semibold">{best}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white/40 text-xs">Sessions</div>
                      <div className="text-white font-semibold">{domainSessions.length}</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
