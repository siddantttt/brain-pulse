import { useState, useEffect, useCallback } from 'react'

interface Card {
  id: number
  emoji: string
  flipped: boolean
  matched: boolean
}

interface Props {
  difficulty: number
  onComplete: (score: number) => void
}

const EMOJIS = ['🧠', '⚡', '🔥', '🌙', '💎', '🎯', '🌊', '🎭', '🦋', '🌈', '🚀', '🎸']

function getGridSize(difficulty: number): number {
  // difficulty 1-3 → 8 pairs (4x4), 4-6 → 12 pairs, 7-10 → 16 pairs
  if (difficulty <= 3) return 8
  if (difficulty <= 6) return 12
  return 16
}

function buildDeck(pairs: number): Card[] {
  const selected = EMOJIS.slice(0, pairs)
  const cards: Card[] = [...selected, ...selected].map((emoji, i) => ({
    id: i,
    emoji,
    flipped: false,
    matched: false,
  }))
  return cards.sort(() => Math.random() - 0.5)
}

export default function MemoryGame({ difficulty, onComplete }: Props) {
  const pairs = getGridSize(difficulty)
  const [cards, setCards] = useState<Card[]>(() => buildDeck(pairs))
  const [flipped, setFlipped] = useState<number[]>([])
  const [matched, setMatched] = useState(0)
  const [moves, setMoves] = useState(0)
  const [phase, setPhase] = useState<'preview' | 'play'>('preview')
  const [previewCountdown, setPreviewCountdown] = useState(3)
  const [locked, setLocked] = useState(false)

  // Preview phase: show all cards then hide
  useEffect(() => {
    setCards(buildDeck(pairs))
    setFlipped([])
    setMatched(0)
    setMoves(0)
    setPhase('preview')
    setPreviewCountdown(3)
  }, [pairs])

  useEffect(() => {
    if (phase !== 'preview') return
    if (previewCountdown <= 0) {
      setPhase('play')
      return
    }
    const t = setTimeout(() => setPreviewCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, previewCountdown])

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
            if (newMatched === pairs) {
              // Score: more moves = lower score
              const maxMoves = pairs * 2
              const score = Math.max(40, Math.round(100 - ((moves + 1 - pairs) / maxMoves) * 60))
              setTimeout(() => onComplete(Math.min(100, score)), 500)
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

  const cols = pairs === 8 ? 4 : pairs === 12 ? 4 : 4

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">Memory Match</h2>
        <p className="text-white/60 text-sm mt-1">
          {phase === 'preview'
            ? `Memorize the cards… ${previewCountdown}`
            : `Pairs found: ${matched}/${pairs} · Moves: ${moves}`}
        </p>
      </div>

      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, maxWidth: '320px' }}
      >
        {cards.map((card, idx) => (
          <button
            key={card.id}
            onClick={() => handleFlip(idx)}
            className={`
              w-16 h-16 rounded-xl text-2xl flex items-center justify-center
              transition-all duration-300 border
              ${card.matched
                ? 'bg-indigo-500/30 border-indigo-400/50 scale-95'
                : card.flipped || phase === 'preview'
                  ? 'bg-navy-700 border-indigo-400/50'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 cursor-pointer'}
            `}
            style={{ backgroundColor: card.matched ? undefined : undefined }}
          >
            {(card.flipped || card.matched || phase === 'preview') ? card.emoji : '?'}
          </button>
        ))}
      </div>
    </div>
  )
}
