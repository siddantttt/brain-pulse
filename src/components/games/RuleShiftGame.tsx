import { useState, useEffect, useRef, useCallback } from 'react'
import type { GameMetrics } from '../../types'

/**
 * Rule Shift — Yellow domain (cognitive flexibility / executive function)
 * Wisconsin Card Sorting paradigm: sort cards by shape rule, then rule silently
 * shifts to color. Measures set-shifting and cognitive flexibility.
 */

interface Props {
  difficulty: number
  onComplete: (score: number, metrics: GameMetrics) => void
}

type Shape = 'circle' | 'square' | 'triangle' | 'diamond'
type Color = 'blue' | 'green' | 'amber' | 'rose'

interface Card {
  shape: Shape
  color: Color
}

const SHAPES: Shape[] = ['circle', 'square', 'triangle', 'diamond']
const COLORS: Color[] = ['blue', 'green', 'amber', 'rose']

const COLOR_HEX: Record<Color, string> = {
  blue:  '#3B82F6',
  green: '#22C55E',
  amber: '#F59E0B',
  rose:  '#F43F5E',
}

function getConfig(difficulty: number) {
  const timePerCard = difficulty >= 7 ? 1000 : difficulty >= 4 ? 1500 : 2200
  const shiftAt = difficulty >= 7 ? 6 : difficulty >= 4 ? 8 : 9
  return { timePerCard, shiftAt }
}

function generateDeck(count: number): Card[] {
  return Array.from({ length: count }, () => ({
    shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  }))
}

function ShapeIcon({ shape, color, size = 72 }: { shape: Shape; color: string; size?: number }) {
  switch (shape) {
    case 'circle':
      return (
        <svg width={size} height={size} viewBox="0 0 72 72">
          <circle cx="36" cy="36" r="28" fill={color} opacity={0.9} />
        </svg>
      )
    case 'square':
      return (
        <svg width={size} height={size} viewBox="0 0 72 72">
          <rect x="12" y="12" width="48" height="48" rx="6" fill={color} opacity={0.9} />
        </svg>
      )
    case 'triangle':
      return (
        <svg width={size} height={size} viewBox="0 0 72 72">
          <polygon points="36,8 66,62 6,62" fill={color} opacity={0.9} />
        </svg>
      )
    case 'diamond':
      return (
        <svg width={size} height={size} viewBox="0 0 72 72">
          <polygon points="36,6 66,36 36,66 6,36" fill={color} opacity={0.9} />
        </svg>
      )
  }
}

const TOTAL_CARDS = 10

export default function RuleShiftGame({ difficulty, onComplete }: Props) {
  const { timePerCard, shiftAt } = getConfig(difficulty)

  const [phase, setPhase] = useState<'intro' | 'playing' | 'done'>('intro')
  const [deck] = useState<Card[]>(() => generateDeck(TOTAL_CARDS))
  const [cardIdx, setCardIdx] = useState(0)
  const [rule, setRule] = useState<'shape' | 'color'>('shape')
  const [targetShape] = useState<Shape>(SHAPES[Math.floor(Math.random() * SHAPES.length)])
  const [targetColor] = useState<Color>(COLORS[Math.floor(Math.random() * COLORS.length)])
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | 'timeout' | null>(null)
  const [timeLeft, setTimeLeft] = useState(timePerCard)

  const resultsRef = useRef<Array<{ correct: boolean; rt: number; postShift: boolean }>>([])
  const cardShowTimeRef = useRef(0)
  const shiftedRef = useRef(false)

  const isMatch = useCallback((card: Card) => {
    return rule === 'shape' ? card.shape === targetShape : card.color === targetColor
  }, [rule, targetShape, targetColor])

  const advance = useCallback((userSaidMatch: boolean | null) => {
    if (cardIdx >= TOTAL_CARDS) return

    const card = deck[cardIdx]
    const correct = userSaidMatch === null ? false : userSaidMatch === isMatch(card)
    const rt = userSaidMatch !== null ? Date.now() - cardShowTimeRef.current : timePerCard

    resultsRef.current.push({
      correct,
      rt,
      postShift: shiftedRef.current,
    })

    const fb: 'correct' | 'wrong' | 'timeout' = userSaidMatch === null ? 'timeout' : correct ? 'correct' : 'wrong'
    setFeedback(fb)

    const next = cardIdx + 1

    if (next >= TOTAL_CARDS) {
      setPhase('done')
      const all = resultsRef.current
      const totalCorrect = all.filter(r => r.correct).length
      const avgRT = Math.round(all.reduce((a, b) => a + b.rt, 0) / all.length)

      const postShift = all.filter(r => r.postShift)
      const postShiftCorrect = postShift.filter(r => r.correct).length
      const postShiftAcc = postShift.length > 0 ? postShiftCorrect / postShift.length : 1

      // Score: base accuracy + bonus for fast adaptation after shift
      const preShift = all.filter(r => !r.postShift)
      const preShiftAcc = preShift.length > 0 ? preShift.filter(r => r.correct).length / preShift.length : 0
      const score = Math.round((preShiftAcc * 0.3 + postShiftAcc * 0.7) * 100)

      const droppedUnderPressure = postShiftAcc < preShiftAcc - 0.2

      const metrics: GameMetrics = {
        accuracy: Math.round((totalCorrect / TOTAL_CARDS) * 100),
        avgResponseTime: avgRT,
        droppedUnderPressure,
        domain: 'flexibility',
      }

      setTimeout(() => onComplete(Math.min(100, Math.max(0, score)), metrics), 800)
      return
    }

    // Check if it's time to shift the rule
    if (!shiftedRef.current && next >= shiftAt) {
      shiftedRef.current = true
      setRule('color')
    }

    setTimeout(() => {
      setFeedback(null)
      setCardIdx(next)
      setTimeLeft(timePerCard)
      cardShowTimeRef.current = Date.now()
    }, 600)
  }, [cardIdx, deck, isMatch, shiftAt, timePerCard, onComplete])

  useEffect(() => {
    if (phase !== 'playing' || feedback !== null) return
    if (timeLeft <= 0) {
      advance(null)
      return
    }
    const t = setTimeout(() => setTimeLeft(s => s - 1), timePerCard > 1000 ? 100 : 50)
    return () => clearTimeout(t)
  }, [phase, feedback, timeLeft, advance, timePerCard])

  function startGame() {
    setPhase('playing')
    cardShowTimeRef.current = Date.now()
    setTimeLeft(timePerCard)
  }

  if (phase === 'intro') {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <div>
          <p className="text-sm mb-4 max-w-xs leading-relaxed" style={{ color: '#9CA3AF' }}>
            This one tests how quickly your brain adapts when the rules change without warning.
          </p>
          <h2 className="text-2xl font-bold" style={{ color: '#F9FAFB' }}>Rule Shift</h2>
          <p className="text-sm mt-2" style={{ color: '#9CA3AF' }}>
            A rule is active. Tap <strong style={{ color: '#F9FAFB' }}>MATCH</strong> if the card fits it.<br />
            The rule will change silently — figure it out from feedback.
          </p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="p-4 rounded-2xl" style={{ background: '#111827', border: '1px solid #1F2937' }}>
            <ShapeIcon shape="circle" color={COLOR_HEX['blue']} size={56} />
          </div>
          <div className="p-4 rounded-2xl" style={{ background: '#111827', border: '1px solid #1F2937' }}>
            <ShapeIcon shape="triangle" color={COLOR_HEX['amber']} size={56} />
          </div>
        </div>
        <button onClick={startGame} className="btn-primary px-8 py-3">
          Start — {TOTAL_CARDS} cards
        </button>
      </div>
    )
  }

  if (phase === 'done') {
    return (
      <div className="flex items-center justify-center h-32 text-sm" style={{ color: '#6B7280' }}>
        Calculating…
      </div>
    )
  }

  const card = deck[cardIdx]
  const timerPct = (timeLeft / timePerCard) * 100

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-between w-full">
        <span className="text-sm" style={{ color: '#9CA3AF' }}>Card {cardIdx + 1}/{TOTAL_CARDS}</span>
        <div className="flex-1 mx-4">
          <div className="w-full rounded-full h-1.5" style={{ background: '#1F2937' }}>
            <div className="h-1.5 rounded-full transition-all"
              style={{
                width: `${timerPct}%`,
                background: '#CA8A04',
                transitionDuration: `${timePerCard > 1000 ? 100 : 50}ms`,
              }} />
          </div>
        </div>
        <span className="text-sm" style={{ color: '#6B7280' }}>
          {Math.ceil(timeLeft / (timePerCard > 1000 ? 100 : 50) * (timePerCard > 1000 ? 0.1 : 0.05)).toFixed(0)}
        </span>
      </div>

      {/* Card */}
      <div
        className="flex items-center justify-center rounded-3xl transition-all duration-150"
        style={{
          width: 200, height: 200,
          background: feedback === 'correct'
            ? 'rgba(22,163,74,0.15)'
            : feedback === 'wrong'
              ? 'rgba(220,38,38,0.12)'
              : feedback === 'timeout'
                ? 'rgba(107,114,128,0.1)'
                : '#111827',
          border: `2px solid ${
            feedback === 'correct' ? '#16A34A' :
            feedback === 'wrong'   ? '#DC2626' :
            feedback === 'timeout' ? '#374151' : '#1F2937'
          }`,
          boxShadow: feedback === 'correct'
            ? '0 0 30px rgba(22,163,74,0.2)'
            : feedback === 'wrong'
              ? '0 0 30px rgba(220,38,38,0.15)'
              : 'none',
        }}>
        <ShapeIcon shape={card.shape} color={COLOR_HEX[card.color]} size={88} />
      </div>

      {/* Feedback label */}
      {feedback && (
        <div className="text-sm font-medium" style={{
          color: feedback === 'correct' ? '#86EFAC' :
                 feedback === 'wrong'   ? '#FCA5A5' : '#6B7280'
        }}>
          {feedback === 'correct' ? '✓ Correct' :
           feedback === 'wrong'   ? '✗ Wrong' : 'Time up'}
        </div>
      )}

      {/* Buttons */}
      {!feedback && (
        <div className="flex gap-4 w-full">
          <button
            onClick={() => advance(false)}
            className="flex-1 py-4 rounded-xl font-semibold text-base border transition-colors"
            style={{ background: 'rgba(255,255,255,0.04)', borderColor: '#1F2937', color: '#9CA3AF' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#374151'; e.currentTarget.style.background = 'rgba(255,255,255,0.07)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#1F2937'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}>
            SKIP
          </button>
          <button
            onClick={() => advance(true)}
            className="flex-1 py-4 rounded-xl font-semibold text-base border transition-colors"
            style={{ background: 'rgba(202,138,4,0.12)', borderColor: 'rgba(202,138,4,0.4)', color: '#FDE68A' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(202,138,4,0.2)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(202,138,4,0.12)' }}>
            MATCH
          </button>
        </div>
      )}

      <p className="text-xs text-center" style={{ color: '#374151' }}>
        Based on the Wisconsin Card Sorting Test · measures cognitive flexibility
      </p>
    </div>
  )
}
