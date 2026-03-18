import { useState } from 'react'

/**
 * Corsi Block Test (visuospatial working memory)
 * Shows a sequence of highlighted cells, user must reproduce the order.
 * Scientifically validated measure of visuospatial short-term memory span.
 */

interface Props {
  difficulty: number
  onComplete: (score: number) => void
}

const GRID = 16 // 4x4

function getSequenceLength(difficulty: number) {
  return Math.min(2 + difficulty, 10)
}

function randomSequence(length: number): number[] {
  const seq: number[] = []
  while (seq.length < length) {
    const n = Math.floor(Math.random() * GRID)
    if (!seq.includes(n)) seq.push(n)
  }
  return seq
}

const ROUNDS = 5
const FLASH_MS = 600
const GAP_MS = 250

export default function VisualGame({ difficulty, onComplete }: Props) {
  const seqLen = getSequenceLength(difficulty)
  const [phase, setPhase] = useState<'intro' | 'showing' | 'input' | 'feedback'>('intro')
  const [sequence, setSequence] = useState<number[]>([])
  const [highlighted, setHighlighted] = useState<number | null>(null)
  const [userInput, setUserInput] = useState<number[]>([])
  const [round, setRound] = useState(0)
  const [scores, setScores] = useState<number[]>([])

  function startRound() {
    const seq = randomSequence(seqLen)
    setSequence(seq)
    setUserInput([])
    setPhase('showing')
    flashSequence(seq)
  }

  function flashSequence(seq: number[]) {
    let i = 0
    function next() {
      if (i >= seq.length) {
        setHighlighted(null)
        setTimeout(() => setPhase('input'), 400)
        return
      }
      setHighlighted(seq[i])
      i++
      setTimeout(() => {
        setHighlighted(null)
        setTimeout(next, GAP_MS)
      }, FLASH_MS)
    }
    next()
  }

  function handleCellClick(idx: number) {
    if (phase !== 'input') return
    const next = [...userInput, idx]
    setUserInput(next)

    if (next.length === sequence.length) {
      // Score this round: correct positions in order
      const correct = next.filter((v, i) => v === sequence[i]).length
      const roundScore = correct / sequence.length
      const newScores = [...scores, roundScore]
      setScores(newScores)
      setPhase('feedback')

      if (round + 1 >= ROUNDS) {
        const avg = newScores.reduce((a, b) => a + b, 0) / newScores.length
        setTimeout(() => onComplete(Math.round(avg * 100)), 900)
      } else {
        setTimeout(() => {
          setRound(r => r + 1)
          startRound()
        }, 900)
      }
    }
  }

  const cellState = (idx: number): 'idle' | 'flash' | 'selected' | 'correct' | 'wrong' => {
    if (phase === 'showing' && highlighted === idx) return 'flash'
    if (phase === 'input' && userInput.includes(idx)) return 'selected'
    if (phase === 'feedback') {
      const pos = userInput.indexOf(idx)
      if (pos !== -1) return sequence[pos] === idx ? 'correct' : 'wrong'
    }
    return 'idle'
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">Spatial Recall</h2>
        <p className="text-white/50 text-sm mt-1">
          {phase === 'intro' ? 'Watch the sequence, then tap the cells in order' :
           phase === 'showing' ? 'Memorise the sequence…' :
           phase === 'input' ? `Tap ${sequence.length - userInput.length} more cell${sequence.length - userInput.length !== 1 ? 's' : ''}` :
           scores.length > 0 && scores[scores.length - 1] === 1 ? '✓ Perfect!' : 'Keep going'}
        </p>
      </div>

      <div className="flex gap-1.5">
        {Array.from({ length: ROUNDS }).map((_, i) => (
          <div key={i} className={`w-8 h-1.5 rounded-full ${i < round ? 'bg-indigo-500' : i === round ? 'bg-indigo-300' : 'bg-white/10'}`} />
        ))}
      </div>

      <div className="grid grid-cols-4 gap-2" style={{ width: 260 }}>
        {Array.from({ length: GRID }).map((_, idx) => {
          const s = cellState(idx)
          return (
            <button
              key={idx}
              onClick={() => handleCellClick(idx)}
              disabled={phase !== 'input'}
              className={`w-14 h-14 rounded-xl transition-all duration-150 border
                ${s === 'flash' ? 'bg-indigo-400 border-indigo-300 scale-110 shadow-lg shadow-indigo-500/50' :
                  s === 'selected' ? 'bg-indigo-600/60 border-indigo-400' :
                  s === 'correct' ? 'bg-emerald-500 border-emerald-300' :
                  s === 'wrong' ? 'bg-red-500/60 border-red-400' :
                  'bg-white/5 border-white/10 hover:bg-white/10'}
              `}
            />
          )
        })}
      </div>

      {phase === 'intro' && (
        <button
          onClick={startRound}
          className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold text-white transition-colors"
        >
          Start
        </button>
      )}

      <p className="text-white/20 text-xs text-center max-w-xs">
        Based on the Corsi Block Test · measures visuospatial working memory
      </p>
    </div>
  )
}
