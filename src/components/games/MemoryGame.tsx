import { useState, useEffect, useCallback, useRef } from 'react'
import type { GameMetrics } from '../../types'

/**
 * Memory Match — Green domain (memory / concentration / reduced fatigue)
 * Green calms anxiety and supports long-form concentration tasks.
 */

interface Card {
  id: number
  emoji: string
  flipped: boolean
  matched: boolean
}

interface Props {
  difficulty: number
  onComplete: (score: number, metrics: GameMetrics) => void
}

const EMOJIS = ['🧠', '⚡', '🔥', '🌙', '💎', '🎯', '🌊', '🎭', '🦋', '🌈', '🚀', '🎸']

function getGridSize(difficulty: number): number {
  if (difficulty <= 3) return 8
  if (difficulty <= 6) return 12
  return 16
}

function buildDeck(pairs: number): Card[] {
  const selected = EMOJIS.slice(0, pairs)
  const cards: Card[] = [...selected, ...selected].map((emoji, i) => ({
    id: i, emoji, flipped: false, matched: false,
  }))
  return cards.sort(() => Math.random() - 0.5)
}

export default function MemoryGame({ difficulty, onComplete }: Props) {
  const pairs = getGridSize(difficulty)
  const [started, setStarted] = useState(false)
  const [cards, setCards] = useState<Card[]>(() => buildDeck(pairs))
  const [flipped, setFlipped] = useState<number[]>([])
  const [matched, setMatched] = useState(0)
  const [moves, setMoves] = useState(0)
  const [phase, setPhase] = useState<'preview' | 'play'>('preview')
  const [previewCountdown, setPreviewCountdown] = useState(3)
  const [locked, setLocked] = useState(false)

  const pairTimesRef = useRef<number[]>([])
  const lastPairTimeRef = useRef(0)

  useEffect(() => {
    if (!started) return
    setCards(buildDeck(pairs))
    setFlipped([])
    setMatched(0)
    setMoves(0)
    setPhase('preview')
    setPreviewCountdown(3)
  }, [pairs, started])

  useEffect(() => {
    if (!started || phase !== 'preview') return
    if (previewCountdown <= 0) {
      setPhase('play')
      lastPairTimeRef.current = Date.now()
      return
    }
    const t = setTimeout(() => setPreviewCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [started, phase, previewCountdown])

  const handleFlip = useCallback((idx: number) => {
    if (locked || phase !== 'play') return
    if (cards[idx].matched || cards[idx].flipped) return
    if (flipped.length === 2) return

    const next = [...flipped, idx]
    setCards(prev => prev.map((c, i) => i === idx ? { ...c, flipped: true } : c))
    setFlipped(next)

    if (next.length === 2) {
      setMoves(m => m + 1)
      setLocked(true)
      const [a, b] = next
      setTimeout(() => {
        if (cards[a].emoji === cards[b].emoji) {
          setCards(prev => prev.map((c, i) =>
            i === a || i === b ? { ...c, matched: true, flipped: true } : c
          ))
          setMatched(m => {
            const newMatched = m + 1
            pairTimesRef.current.push(Date.now() - lastPairTimeRef.current)
            lastPairTimeRef.current = Date.now()

            if (newMatched === pairs) {
              const maxMoves = pairs * 2
              const rawScore = Math.round(100 - ((moves + 1 - pairs) / maxMoves) * 60)
              const clampedScore = Math.max(0, Math.min(100, rawScore))

              const avgRT = pairTimesRef.current.length > 0
                ? Math.round(pairTimesRef.current.reduce((a, b) => a + b, 0) / pairTimesRef.current.length)
                : 3000

              const half = Math.floor(pairTimesRef.current.length / 2)
              let droppedUnderPressure = false
              if (half >= 2) {
                const firstHalfAvg = pairTimesRef.current.slice(0, half).reduce((a, b) => a + b, 0) / half
                const secondHalfAvg = pairTimesRef.current.slice(half).reduce((a, b) => a + b, 0) / (pairTimesRef.current.length - half)
                droppedUnderPressure = secondHalfAvg > firstHalfAvg * 1.3
              }

              const metrics: GameMetrics = {
                accuracy: 100,
                avgResponseTime: avgRT,
                droppedUnderPressure,
                domain: 'memory',
              }

              setTimeout(() => onComplete(clampedScore, metrics), 500)
            }
            return newMatched
          })
        } else {
          setCards(prev => prev.map((c, i) =>
            i === a || i === b ? { ...c, flipped: false } : c
          ))
        }
        setFlipped([])
        setLocked(false)
      }, 800)
    }
  }, [locked, phase, cards, flipped, pairs, moves, onComplete])

  const cols = 4

  if (!started) {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <div>
          <p className="text-sm mb-4 max-w-xs leading-relaxed" style={{ color: '#9CA3AF' }}>
            This one tests how much your brain can hold and recall under pressure.
          </p>
          <h2 className="text-2xl font-bold" style={{ color: '#F9FAFB' }}>Memory Match</h2>
          <p className="text-sm mt-2" style={{ color: '#9CA3AF' }}>
            Memorise the cards, then match pairs from memory.
          </p>
        </div>
        <div className="grid grid-cols-4 gap-2" style={{ maxWidth: 280 }}>
          {['🧠', '⚡', '🔥', '🌙', '🧠', '⚡', '🔥', '🌙'].map((e, i) => (
            <div key={i} className="w-14 h-14 rounded-xl text-2xl flex items-center justify-center border"
              style={{ background: i < 4 ? 'rgba(22,163,74,0.08)' : 'rgba(255,255,255,0.04)', borderColor: i < 4 ? 'rgba(22,163,74,0.25)' : '#1F2937' }}>
              {i < 4 ? e : '?'}
            </div>
          ))}
        </div>
        <button onClick={() => setStarted(true)} className="btn-primary px-8 py-3">
          Start
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold" style={{ color: '#F9FAFB' }}>Memory Match</h2>
        <p className="text-sm mt-1" style={{ color: '#9CA3AF' }}>
          {phase === 'preview'
            ? `Memorise the cards… ${previewCountdown}`
            : `Pairs found: ${matched}/${pairs} · Moves: ${moves}`}
        </p>
      </div>

      <div className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, maxWidth: '320px' }}>
        {cards.map((card, idx) => (
          <button
            key={card.id}
            onClick={() => handleFlip(idx)}
            className="w-16 h-16 rounded-xl text-2xl flex items-center justify-center transition-all duration-300 border"
            style={
              card.matched
                ? { background: 'rgba(22,163,74,0.2)', borderColor: 'rgba(22,163,74,0.4)' }
                : card.flipped || phase === 'preview'
                  ? { background: 'rgba(22,163,74,0.08)', borderColor: 'rgba(22,163,74,0.25)' }
                  : { background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)', cursor: 'pointer' }
            }
          >
            {(card.flipped || card.matched || phase === 'preview') ? card.emoji : '?'}
          </button>
        ))}
      </div>
    </div>
  )
}
