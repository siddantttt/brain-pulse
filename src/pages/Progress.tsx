import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useGameSessions } from '../hooks/useGameSessions'
import { ChevronLeftIcon } from '../components/Icons'
import type { Domain } from '../types'
import { DOMAIN_LABELS, DOMAIN_COLORS } from '../types'

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
        <button onClick={() => navigate(-1)} style={{ color: '#6B7280' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#9CA3AF')}
          onMouseLeave={e => (e.currentTarget.style.color = '#6B7280')}>
          <ChevronLeftIcon size={18} />
        </button>
        <h1 className="font-semibold tracking-tight">Progress</h1>
      </div>

      {loading ? (
        <div className="text-sm text-center py-20" style={{ color: '#4B5563' }}>Loading…</div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-sm mb-4" style={{ color: '#6B7280' }}>No sessions yet</p>
          <button onClick={() => navigate('/home')} className="btn-primary px-6 py-2.5 text-sm">Start training</button>
        </div>
      ) : (
        <>
          {/* Domain toggles — each in its cognitive color */}
          <div className="flex flex-wrap gap-2 mb-6">
            {ALL.map(d => {
              const dc = DOMAIN_COLORS[d]
              return (
                <button key={d} onClick={() => toggle(d)}
                  className="px-3 py-1 rounded-full text-xs font-medium border transition-all"
                  style={hidden.has(d)
                    ? { background: 'transparent', borderColor: '#1F2937', color: '#4B5563' }
                    : { background: dc.primary + '18', borderColor: dc.primary + '50', color: dc.light }}>
                  {DOMAIN_LABELS[d]}
                </button>
              )
            })}
          </div>

          {/* Chart */}
          <div className="rounded-2xl p-5 mb-4" style={{ background: '#111827', border: '1px solid #1F2937' }}>
            <p className="text-xs uppercase tracking-widest mb-6" style={{ color: '#4B5563' }}>14-Day History</p>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={chartData} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                <XAxis dataKey="date" tick={{ fill: '#4B5563', fontSize: 10 }} interval={3} />
                <YAxis domain={[0, 100]} tick={{ fill: '#4B5563', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ background: '#111827', border: '1px solid #1F2937', borderRadius: 12, color: '#F9FAFB', fontSize: 12 }}
                  labelStyle={{ color: '#9CA3AF', marginBottom: 4 }}
                />
                {ALL.filter(d => !hidden.has(d)).map(d => (
                  <Line key={d} type="monotone" dataKey={d} name={DOMAIN_LABELS[d]}
                    stroke={DOMAIN_COLORS[d].primary} strokeWidth={1.5} dot={false} connectNulls />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Per-domain stats */}
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #1F2937' }}>
            {ALL.map((d, i) => {
              const ds = sessions.filter(s => s.domain === d)
              if (!ds.length) return null
              const dc = DOMAIN_COLORS[d]
              const avg = Math.round(ds.reduce((a, b) => a + b.score, 0) / ds.length)
              const best = Math.round(Math.max(...ds.map(s => s.score)))
              return (
                <div key={d} className="flex items-center justify-between px-4 py-3.5"
                  style={{
                    background: '#111827',
                    borderBottom: i < ALL.length - 1 ? '1px solid #1F2937' : 'none',
                    borderLeft: `2px solid ${dc.primary}`,
                  }}>
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm" style={{ color: dc.light }}>{DOMAIN_LABELS[d]}</span>
                  </div>
                  <div className="flex gap-6 text-xs">
                    <div className="text-center">
                      <div style={{ color: '#4B5563' }}>avg</div>
                      <div className="font-medium">{avg}</div>
                    </div>
                    <div className="text-center">
                      <div style={{ color: '#4B5563' }}>best</div>
                      <div className="font-medium" style={{ color: dc.light }}>{best}</div>
                    </div>
                    <div className="text-center">
                      <div style={{ color: '#4B5563' }}>games</div>
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
