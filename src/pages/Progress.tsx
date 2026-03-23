import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useGameSessions } from '../hooks/useGameSessions'
import { ChevronLeftIcon } from '../components/Icons'
import type { Domain } from '../types'
import { DOMAIN_LABELS } from '../types'

const COLORS: Record<Domain, string> = {
  focus: '#4f9eff', memory: '#3af0ff', logic: '#ff9f3a', visual: '#c03aff', math: '#ff3a7a',
}
const ALL: Domain[] = ['focus', 'memory', 'logic', 'visual', 'math']

export default function Progress() {
  const navigate = useNavigate()
  const { sessions, loading } = useGameSessions()
  const [hidden, setHidden] = useState<Set<Domain>>(new Set())

  const chartData = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (13 - i))
      const dateStr = d.toDateString()
      const day = sessions.filter(s => new Date(s.played_at).toDateString() === dateStr)
      const point: Record<string, string | number> = {
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      }
      ALL.forEach(domain => {
        const ds = day.filter(s => s.domain === domain)
        if (ds.length) point[domain] = Math.round(ds.reduce((a, b) => a + b.score, 0) / ds.length)
      })
      return point
    })
  }, [sessions])

  function toggle(d: Domain) {
    setHidden(prev => { const n = new Set(prev); n.has(d) ? n.delete(d) : n.add(d); return n })
  }

  return (
    <div className="min-h-screen max-w-lg mx-auto px-4 py-8">

      <div className="flex items-center gap-3 mb-10">
        <button onClick={() => navigate(-1)} style={{ color: '#444' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#888')}
          onMouseLeave={e => (e.currentTarget.style.color = '#444')}>
          <ChevronLeftIcon size={18} />
        </button>
        <h1 className="font-semibold tracking-tight">Progress</h1>
      </div>

      {loading ? (
        <div className="text-sm text-center py-20" style={{ color: '#333' }}>Loading…</div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-sm mb-4" style={{ color: '#444' }}>No sessions yet</p>
          <button onClick={() => navigate('/home')} className="btn-primary px-6 py-2.5 text-sm">Start training</button>
        </div>
      ) : (
        <>
          {/* Domain toggles */}
          <div className="flex flex-wrap gap-2 mb-6">
            {ALL.map(d => (
              <button key={d} onClick={() => toggle(d)}
                className="px-3 py-1 rounded-full text-xs font-medium border transition-all"
                style={hidden.has(d)
                  ? { background: 'transparent', borderColor: '#1e1e1e', color: '#333' }
                  : { background: `${COLORS[d]}12`, borderColor: `${COLORS[d]}30`, color: COLORS[d] }}>
                {DOMAIN_LABELS[d]}
              </button>
            ))}
          </div>

          {/* Chart */}
          <div className="rounded-2xl p-5 mb-4" style={{ background: '#111', border: '1px solid #1e1e1e' }}>
            <p className="text-xs uppercase tracking-widest mb-6" style={{ color: '#444' }}>14-Day History</p>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={chartData} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                <XAxis dataKey="date" tick={{ fill: '#333', fontSize: 10 }} interval={3} />
                <YAxis domain={[0, 100]} tick={{ fill: '#333', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, color: '#f0f0f0', fontSize: 12 }}
                  labelStyle={{ color: '#555', marginBottom: 4 }}
                />
                {ALL.filter(d => !hidden.has(d)).map(d => (
                  <Line key={d} type="monotone" dataKey={d} name={DOMAIN_LABELS[d]}
                    stroke={COLORS[d]} strokeWidth={1.5} dot={false} connectNulls />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Per-domain stats */}
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #1e1e1e' }}>
            {ALL.map((d, i) => {
              const ds = sessions.filter(s => s.domain === d)
              if (!ds.length) return null
              const avg = Math.round(ds.reduce((a, b) => a + b.score, 0) / ds.length)
              const best = Math.round(Math.max(...ds.map(s => s.score)))
              return (
                <div key={d} className="flex items-center justify-between px-4 py-3.5"
                  style={{ background: '#111', borderBottom: i < ALL.length - 1 ? '1px solid #1a1a1a' : 'none' }}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-1.5 h-4 rounded-full" style={{ background: COLORS[d] }} />
                    <span className="text-sm">{DOMAIN_LABELS[d]}</span>
                  </div>
                  <div className="flex gap-6 text-xs">
                    <div className="text-center">
                      <div style={{ color: '#444' }}>avg</div>
                      <div className="font-medium">{avg}</div>
                    </div>
                    <div className="text-center">
                      <div style={{ color: '#444' }}>best</div>
                      <div className="font-medium" style={{ color: COLORS[d] }}>{best}</div>
                    </div>
                    <div className="text-center">
                      <div style={{ color: '#444' }}>games</div>
                      <div className="font-medium">{ds.length}</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
