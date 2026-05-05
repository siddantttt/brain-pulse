import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import type { Domain } from '../types'
import { DOMAIN_COLORS } from '../types'

const ORDER: Domain[] = ['focus', 'flexibility', 'math', 'logic', 'visual']
const ANGLE = 360 / ORDER.length  // 72° per domain

// Average first-session scores by age group
const AGE_BENCHMARKS: Record<string, Record<Domain, number>> = {
  teen:        { focus: 65, memory: 68, math: 62, logic: 60, flexibility: 63, visual: 67 },
  young_adult: { focus: 70, memory: 67, math: 68, logic: 65, flexibility: 67, visual: 65 },
  adult:       { focus: 62, memory: 60, math: 62, logic: 60, flexibility: 59, visual: 58 },
  midlife:     { focus: 55, memory: 53, math: 55, logic: 53, flexibility: 52, visual: 51 },
  senior:      { focus: 47, memory: 45, math: 47, logic: 45, flexibility: 43, visual: 43 },
}

type ComparisonTier = 'above' | 'onpar' | 'below'

const COMPARISON_LABELS: Record<ComparisonTier, string> = {
  above: 'Above avg',
  onpar: 'On par',
  below: 'Below avg',
}

const COMPARISON_COLORS: Record<ComparisonTier, string> = {
  above: '#86EFAC',
  onpar: '#93C5FD',
  below: '#FCA5A5',
}

function getComparisonTier(score: number, domain: Domain, ageGroup: string): ComparisonTier | null {
  const bench = AGE_BENCHMARKS[ageGroup]
  if (!bench) return null
  const avg = bench[domain]
  if (avg === undefined) return null
  if (score >= avg + 8) return 'above'
  if (score >= avg - 8) return 'onpar'
  return 'below'
}

const COMPARISON_CARD_COPY: Record<ComparisonTier, Record<Domain, string>> = {
  above: {
    focus:       "Your focus sits above average for your age group on the first try. That kind of attention control is a real cognitive edge — and it only gets stronger from here.",
    memory:      "Your recall is stronger than average for your age. Working memory like this compounds — every session builds on what you've already got.",
    math:        "Your mental arithmetic speed is above average for your age. Fast numerical processing transfers into real decisions — keep pushing it.",
    logic:       "Your pattern recognition is ahead of where most people your age start. Fluid intelligence like this strongly predicts academic performance.",
    flexibility: "You switch between rules faster than most people your age. Cognitive flexibility is rare — it shows up when things change quickly and most people freeze.",
    visual:      "Your spatial memory is above average for your age group. Visuospatial working memory underpins everything from navigation to complex problem-solving.",
  },
  onpar: {
    focus:       "Your focus is right where you'd expect for your age. Consistent training moves attention faster than almost any other domain — you're starting from a solid base.",
    memory:      "You're tracking with your age group on working memory. This is exactly the kind of baseline we build from — a few focused sessions make a visible difference.",
    math:        "Your math speed is in line with your age group. Processing speed responds quickly to training — expect to see this climb within a week of consistent sessions.",
    logic:       "Your logic score is right on the average for your age. Pattern recognition builds steadily — each session sharpens the instinct.",
    flexibility: "Solid flexibility for your age group. Cognitive shifting is one of the most trainable skills — keep showing up and this will move.",
    visual:      "Your spatial score is on track for your age. Visuospatial memory develops consistently with practice — you're in a good starting position.",
  },
  below: {
    focus:       "Your focus is a bit below average for your age — but that's exactly what Brain Pulse is here for. Attention responds fast to the right training. A few sessions will move this noticeably. Nothing to worry about.",
    memory:      "Working memory is one of the most trainable cognitive skills. Being below average now just means you have the most room to grow — you'll feel the difference within days of consistent sessions.",
    math:        "Your processing speed has real room to improve — and this domain responds to training faster than almost any other. Don't worry about it; just keep coming back.",
    logic:       "Pattern recognition can feel hard at first — it's genuinely difficult. Being below average here is completely normal and is one of the areas Brain Pulse will focus on building for you.",
    flexibility: "Rule-switching is genuinely hard and scoring below average is common. Cognitive flexibility is highly trainable — Brain Pulse will target this specifically based on your profile.",
    visual:      "Spatial memory is a skill most people never actively train, so being below average isn't surprising at all. This is one of the fastest-improving areas with targeted practice.",
  },
}

const COG_LABELS: Record<Domain, string> = {
  focus: 'Attention', memory: 'Memory', flexibility: 'Flexibility',
  math: 'Speed', logic: 'Pattern', visual: 'Spatial',
}

const HEADLINES: Record<Domain, string> = {
  focus:       "You have a remarkable ability to block out the noise.",
  memory:      "Your mind holds on to things others let slip.",
  flexibility: "You adapt faster than most people ever will.",
  math:        "Your brain makes decisions at serious speed.",
  logic:       "You see connections others miss.",
  visual:      "You navigate complexity with natural ease.",
}

const STRENGTH_COPY: Record<Domain, string> = {
  focus:       "The kind of focus that lets you read a room, stay on task when others drift, and notice things most people walk right past.",
  memory:      "You hold context others lose. Whether it's names, details, or complex threads — things stick for you in a way that compounds over time.",
  flexibility: "When the rules change mid-task — and they always do — you adapt while most people are still catching up. That's rare.",
  math:        "Quick-decision clarity under time pressure. The kind of mental speed that matters when the window is short and the answer still needs to be right.",
  logic:       "Connecting dots across noisy information, seeing the structure underneath — pattern recognition is one of the rarest cognitive advantages.",
  visual:      "Mentally rotating objects, navigating complex systems, holding space in your head — your visuospatial memory is working at a high level.",
}

const OPPORTUNITY_COPY: Record<Domain, string> = {
  focus:       "Sustained attention is the multiplier. Building your focused endurance here will amplify performance across every other domain.",
  memory:      "Memory is trainable faster than most people realize. This is where your sessions will deliver the most visible growth, quickly.",
  flexibility: "Rule-shifting speed compounds. Strengthening cognitive flexibility here makes you faster in every high-pressure, fast-changing situation.",
  math:        "Decision speed responds to training quickly. A few focused sessions here will compress your reaction times in ways that carry into real life.",
  logic:       "Pattern recognition compounds with practice. Every session here sharpens the ability to read systems — an edge that shows up everywhere.",
  visual:      "Spatial memory has outsized returns. Building it here strengthens the same systems behind navigation, visualization, and complex thinking.",
}

function scoreLabel(s: number): string {
  if (s >= 70) return 'Exceptional'
  if (s >= 50) return 'Strong'
  if (s >= 30) return 'Building'
  return 'Developing'
}

// ── SVG chart geometry ──────────────────────────────────────────────────────
const CX = 140
const CY = 135
const RADIUS = 88
const LABEL_R = RADIUS + 26

function toXY(angleDeg: number, r: number) {
  const rad = (angleDeg - 90) * (Math.PI / 180)
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) }
}

function polyPath(r: number): string {
  return ORDER.map((_, i) => {
    const { x, y } = toXY(i * ANGLE, r)
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ') + ' Z'
}

// ────────────────────────────────────────────────────────────────────────────

export default function BrainProfile() {
  const navigate = useNavigate()
  const location = useLocation()
  const { profile } = useAuth()
  const ageGroup: string | null = profile?.age_group ?? null
  const results: Array<{ domain: Domain; score: number; difficulty: number }> =
    location.state?.results ?? []

  // Build score map (0 for any domain not yet assessed)
  const scoreMap = Object.fromEntries(ORDER.map(d => [d, 0])) as Record<Domain, number>
  results.forEach(r => { scoreMap[r.domain] = r.score })

  // Sorted domains: best first, worst last
  const sorted = [...ORDER].sort((a, b) => scoreMap[b] - scoreMap[a])
  const topDomain = sorted[0]
  const bottomDomain = sorted[sorted.length - 1]

  // First session plan: 3 domains to work on (lowest first)
  const firstPlan = sorted.slice(-3).reverse()

  // ── Animation phases ──────────────────────────────────────────────────────
  const [showGrid, setShowGrid]       = useState(false)
  const [polyVisible, setPolyVisible] = useState(false)  // mount the path
  const [polyDraw, setPolyDraw]       = useState(false)  // trigger dashoffset → 0
  const [showLabels, setShowLabels]   = useState(false)
  const [showContent, setShowContent] = useState(false)
  const [showCards, setShowCards]     = useState(false)
  const [showCta, setShowCta]         = useState(false)

  useEffect(() => {
    const ts = [
      setTimeout(() => setShowGrid(true),    80),
      setTimeout(() => setPolyVisible(true), 250),
      setTimeout(() => setPolyDraw(true),    300),   // starts the 1.5s draw
      setTimeout(() => setShowLabels(true),  1900),
      setTimeout(() => setShowContent(true), 2100),
      setTimeout(() => setShowCards(true),   2400),
      setTimeout(() => setShowCta(true),     3200),
    ]
    return () => ts.forEach(clearTimeout)
  }, [])

  // ── Reveal raw score on tap ───────────────────────────────────────────────
  const [revealed, setRevealed] = useState<Set<Domain>>(new Set())
  function toggleReveal(d: Domain) {
    setRevealed(prev => {
      const n = new Set(prev)
      n.has(d) ? n.delete(d) : n.add(d)
      return n
    })
  }

  // ── Score polygon path ────────────────────────────────────────────────────
  const scorePath = ORDER.map((d, i) => {
    const r = (scoreMap[d] / 100) * RADIUS
    const { x, y } = toXY(i * ANGLE, r)
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ') + ' Z'

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: '#0A0F1E', minHeight: '100vh', color: '#F9FAFB' }}>
      <div className="max-w-lg mx-auto px-5 py-12">

        {/* Eyebrow label */}
        <div className="text-center mb-6" style={{
          opacity: showGrid ? 1 : 0,
          transition: 'opacity 0.6s ease',
        }}>
          <p className="text-xs uppercase tracking-widest" style={{ color: '#4B5563' }}>
            Assessment complete · Your brain profile
          </p>
        </div>

        {/* ── Radar chart ── */}
        <div className="flex justify-center mb-2">
          <svg width={280} height={280} viewBox="0 0 280 280">

            {/* Grid rings */}
            {[0.33, 0.66, 1].map((level, li) => (
              <path
                key={li}
                d={polyPath(RADIUS * level)}
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth={1}
                style={{
                  opacity: showGrid ? 1 : 0,
                  transition: `opacity 0.4s ease ${li * 100}ms`,
                }}
              />
            ))}

            {/* Axis lines */}
            {ORDER.map((_, i) => {
              const end = toXY(i * ANGLE, RADIUS)
              return (
                <line key={i}
                  x1={CX} y1={CY} x2={end.x} y2={end.y}
                  stroke="rgba(255,255,255,0.04)" strokeWidth={1}
                  style={{ opacity: showGrid ? 1 : 0, transition: 'opacity 0.4s ease 200ms' }}
                />
              )
            })}

            {/* Score polygon — draws itself */}
            {polyVisible && (
              <path
                d={scorePath}
                pathLength={1}
                stroke={DOMAIN_COLORS.focus.primary}
                strokeWidth={1.5}
                strokeDasharray="1"
                style={{
                  fill: polyDraw ? 'rgba(27,79,216,0.09)' : 'transparent',
                  strokeDashoffset: polyDraw ? 0 : 1,
                  transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1), fill 0.8s ease 1.0s',
                }}
              />
            )}

            {/* Domain score dots */}
            {ORDER.map((d, i) => {
              const { x, y } = toXY(i * ANGLE, (scoreMap[d] / 100) * RADIUS)
              return (
                <circle key={d} cx={x} cy={y} r={3}
                  fill={DOMAIN_COLORS[d].primary}
                  style={{
                    opacity: showLabels ? 1 : 0,
                    transition: `opacity 0.3s ease ${i * 60}ms`,
                  }}
                />
              )
            })}

            {/* Axis labels */}
            {ORDER.map((d, i) => {
              const angle = i * ANGLE
              const { x, y } = toXY(angle, LABEL_R)
              const anchor: React.SVGAttributes<SVGTextElement>['textAnchor'] =
                angle < 10 || Math.abs(angle - 180) < 10 ? 'middle' : angle < 180 ? 'start' : 'end'
              const dyExtra = angle < 10 ? -3 : Math.abs(angle - 180) < 10 ? 10 : 4
              return (
                <text key={d}
                  x={x} y={y + dyExtra}
                  textAnchor={anchor}
                  fontSize={10}
                  fill="#6B7280"
                  style={{
                    opacity: showLabels ? 1 : 0,
                    transition: `opacity 0.4s ease ${i * 80}ms`,
                    fontFamily: 'inherit',
                  }}>
                  {COG_LABELS[d]}
                </text>
              )
            })}
          </svg>
        </div>

        {/* ── Domain score chips — tap to reveal raw score ── */}
        <div className="grid grid-cols-5 gap-2 mb-12" style={{
          opacity: showLabels ? 1 : 0,
          transition: 'opacity 0.5s ease',
        }}>
          {ORDER.map(d => {
            const dc = DOMAIN_COLORS[d]
            const isRevealed = revealed.has(d)
            const tier = isRevealed && ageGroup ? getComparisonTier(scoreMap[d], d, ageGroup) : null
            return (
              <button key={d} onClick={() => toggleReveal(d)}
                className="flex flex-col items-center py-3 px-2 rounded-xl text-center transition-all"
                style={{
                  background: isRevealed ? dc.primary + '12' : '#111827',
                  border: `1px solid ${isRevealed ? dc.primary + '50' : '#1F2937'}`,
                }}>
                <div className="text-xs font-medium mb-0.5" style={{ color: dc.light }}>
                  {COG_LABELS[d]}
                </div>
                <div className="text-xs transition-colors" style={{
                  color: isRevealed ? '#F9FAFB' : '#4B5563',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {isRevealed ? scoreMap[d] : scoreLabel(scoreMap[d])}
                </div>
                {tier && (
                  <div className="text-xs mt-1 font-medium" style={{ color: COMPARISON_COLORS[tier], fontSize: 9 }}>
                    {COMPARISON_LABELS[tier]}
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* ── Personal headline ── */}
        <div className="mb-10 text-center px-2" style={{
          opacity: showContent ? 1 : 0,
          transform: showContent ? 'translateY(0)' : 'translateY(10px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}>
          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: DOMAIN_COLORS[topDomain].primary }}>
            {COG_LABELS[topDomain]} · your strongest domain
          </p>
          <h1 className="text-2xl font-bold leading-snug tracking-tight" style={{ color: '#F9FAFB' }}>
            {HEADLINES[topDomain]}
          </h1>
        </div>

        {/* ── Insight cards ── */}
        <div className="flex flex-col gap-3 mb-8">
          {[
            {
              label: `Top strength · ${COG_LABELS[topDomain]}`,
              color: DOMAIN_COLORS[topDomain].primary,
              light: DOMAIN_COLORS[topDomain].light,
              body: ageGroup && getComparisonTier(scoreMap[topDomain], topDomain, ageGroup)
                ? COMPARISON_CARD_COPY[getComparisonTier(scoreMap[topDomain], topDomain, ageGroup)!][topDomain]
                : STRENGTH_COPY[topDomain],
              delay: 0,
            },
            {
              label: `Where to grow · ${COG_LABELS[bottomDomain]}`,
              color: DOMAIN_COLORS[bottomDomain].primary,
              light: DOMAIN_COLORS[bottomDomain].light,
              body: ageGroup && getComparisonTier(scoreMap[bottomDomain], bottomDomain, ageGroup)
                ? COMPARISON_CARD_COPY[getComparisonTier(scoreMap[bottomDomain], bottomDomain, ageGroup)!][bottomDomain]
                : `This is where your plan will focus first. ${OPPORTUNITY_COPY[bottomDomain]}`,
              delay: 150,
            },
            {
              label: 'What comes next',
              color: '#1B4FD8',
              light: '#93C5FD',
              body: "Your daily sessions are built around this profile. The difficulty adapts automatically as your scores move. Come back tomorrow — it will already know where you are.",
              delay: 300,
            },
          ].map((card, i) => (
            <div key={i} className="rounded-2xl p-5" style={{
              background: '#111827',
              border: '1px solid #1F2937',
              borderLeft: `2px solid ${card.color}`,
              opacity: showCards ? 1 : 0,
              transform: showCards ? 'translateY(0)' : 'translateY(12px)',
              transition: `opacity 0.5s ease ${card.delay}ms, transform 0.5s ease ${card.delay}ms`,
            }}>
              <p className="text-xs font-medium mb-2" style={{ color: card.light }}>{card.label}</p>
              <p className="text-sm leading-relaxed" style={{ color: '#9CA3AF' }}>{card.body}</p>
            </div>
          ))}
        </div>

        {/* ── Living profile note ── */}
        <p className="text-center text-sm mb-10" style={{
          color: '#4B5563',
          opacity: showCards ? 1 : 0,
          transition: 'opacity 0.5s ease 500ms',
        }}>
          This is just your starting point. Your profile updates every session.
        </p>

        {/* ── CTA ── */}
        <div style={{
          opacity: showCta ? 1 : 0,
          transform: showCta ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 0.5s ease, transform 0.5s ease',
        }}>
          <button
            onClick={() => navigate('/session', { state: { plan: firstPlan } })}
            className="btn-primary w-full py-4 text-base font-semibold">
            Start Your First Session
          </button>
        </div>

      </div>
    </div>
  )
}
