import { useState, useEffect, useRef } from 'react'
import type { GameMetrics } from '../../types'

/**
 * Speed Math — Red domain (processing speed / reaction time)
 * Red used as ACCENT ONLY — timer bar, score indicator, flash feedback.
 * Never as background or dominant color. Signals urgency and high activity.
 */

interface Props {
  difficulty: number
  onComplete: (score: number, metrics: GameMetrics) => void
}

interface Problem {
  a: number
  b: number
  op: '+' | '-' | '×'
  answer: number
  options: number[]
}

function getConfig(difficulty: number) {
  const duration = 45
  const maxNum = difficulty <= 3 ? 12 : difficulty <= 6 ? 25 : 50
  const useMultiply = difficulty >= 4
  return { duration, maxNum, useMultiply }
}

function makeProblem(difficulty: number): Problem {
  const { maxNum, useMultiply } = getConfig(difficulty)
  const ops: Array<'+' | '-' | '×'> = useMultiply ? ['+', '-', '×'] : ['+', '-']
  const op = ops[Math.floor(Math.random() * ops.length)]

  let a = Math.floor(Math.random() * maxNum) + 1
  let b = Math.floor(Math.random() * maxNum) + 1
  let answer: number

  if (op === '+') { answer = a + b }
  else if (op === '-') {
    if (a < b) [a, b] = [b, a]
    answer = a - b
  } else {
    a = Math.floor(Math.random() * (difficulty <= 5 ? 9 : 12)) + 2
    b = Math.floor(Math.random() * (difficulty <= 5 ? 9 : 12)) + 2
    answer = a * b
  }

  const wrongs = new Set<number>()
  while (wrongs.size < 3) {
    const offset = Math.floor(Math.random() * 8) - 4
    const w = answer + offset
    if (w !== answer && w >= 0) wrongs.add(w)
  }
  const options = [answer, ...Array.from(wrongs)].sort(() => Math.random() - 0.5)
  return { a, b, op, answer, options }
}

export default function MathGame({ difficulty, onComplete }: Props) {
  const { duration } = getConfig(difficulty)
  const [started, setStarted] = useState(false)
  const [problem, setProblem] = useState<Problem>(() => makeProblem(difficulty))
  const [timeLeft, setTimeLeft] = useState(duration)
  const [correct, setCorrect] = useState(0)
  const [total, setTotal] = useState(0)
  const [flash, setFlash] = useState<'correct' | 'wrong' | null>(null)
  const doneRef = useRef(false)

  const responseTimesRef = useRef<number[]>([])
  const problemStartRef = useRef(Date.now())
  const halfStatsRef = useRef<{ correct: number; total: number } | null>(null)

  useEffect(() => {
    if (!started || doneRef.current) return
    if (timeLeft <= 0) {
      doneRef.current = true
      const score = total === 0 ? 0 : Math.max(0, Math.min(100, Math.round((correct / total) * 100)))

      const avgRT = responseTimesRef.current.length > 0
        ? Math.round(responseTimesRef.current.reduce((a, b) => a + b, 0) / responseTimesRef.current.length)
        : 3000

      let droppedUnderPressure = false
      if (halfStatsRef.current && halfStatsRef.current.total >= 2) {
        const half = halfStatsRef.current
        const firstHalfAcc = half.correct / half.total
        const secondHalfCorrect = correct - half.correct
        const secondHalfTotal = total - half.total
        const secondHalfAcc = secondHalfTotal > 0 ? secondHalfCorrect / secondHalfTotal : 0
        droppedUnderPressure = firstHalfAcc - secondHalfAcc > 0.15
      }

      const metrics: GameMetrics = {
        accuracy: score,
        avgResponseTime: avgRT,
        droppedUnderPressure,
        domain: 'speed',
      }

      onComplete(score, metrics)
      return
    }

    if (timeLeft === Math.ceil(duration / 2) && !halfStatsRef.current) {
      halfStatsRef.current = { correct, total }
    }

    const t = setTimeout(() => setTimeLeft(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [started, timeLeft, correct, total, duration, onComplete])

  function handleAnswer(opt: number) {
    if (!started || doneRef.current) return
    const rt = Date.now() - problemStartRef.current
    responseTimesRef.current.push(rt)

    const isCorrect = opt === problem.answer
    setFlash(isCorrect ? 'correct' : 'wrong')
    setCorrect(c => isCorrect ? c + 1 : c)
    setTotal(t => t + 1)
    setTimeout(() => {
      setFlash(null)
      setProblem(makeProblem(difficulty))
      problemStartRef.current = Date.now()
    }, 300)
  }

  const pct = total > 0 ? Math.round((correct / total) * 100) : 0
  const timerPct = (timeLeft / duration) * 100
  const timerColor = timerPct > 50 ? '#DC2626' : timerPct > 25 ? '#DC2626' : '#FCA5A5'

  if (!started) {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <div>
          <p className="text-sm mb-4 max-w-xs leading-relaxed" style={{ color: '#9CA3AF' }}>
            This one tests how fast your brain makes decisions when time is short.
          </p>
          <h2 className="text-2xl font-bold" style={{ color: '#F9FAFB' }}>Speed Math</h2>
          <p className="text-sm mt-2" style={{ color: '#9CA3AF' }}>
            Solve as many problems as you can<br />in {duration} seconds.
          </p>
        </div>
        <div className="p-6 rounded-2xl text-4xl font-bold"
          style={{ background: '#111827', border: '1px solid #1F2937', color: '#F9FAFB' }}>
          7 + 8 = ?
        </div>
        <button onClick={() => { setStarted(true); problemStartRef.current = Date.now() }} className="btn-primary px-8 py-3">
          Start — {duration}s
        </button>
        <p className="text-xs max-w-xs" style={{ color: '#374151' }}>
          Based on numerical cognition research · trains the intraparietal sulcus
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto">
      <div className="flex items-center justify-between w-full">
        <div className="text-center">
          <div className="text-2xl font-bold" style={{ color: '#F9FAFB' }}>{timeLeft}s</div>
          <div className="text-xs" style={{ color: '#6B7280' }}>left</div>
        </div>
        <div className="flex-1 mx-4">
          <div className="w-full rounded-full h-1.5" style={{ background: '#1F2937' }}>
            <div className="h-1.5 rounded-full transition-all duration-1000"
              style={{ width: `${timerPct}%`, background: timerColor }} />
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold" style={{ color: '#FCA5A5' }}>{correct}/{total}</div>
          <div className="text-xs" style={{ color: '#6B7280' }}>{pct}%</div>
        </div>
      </div>

      <div className={`w-full p-8 rounded-2xl border text-center transition-colors duration-150`}
        style={
          flash === 'correct'
            ? { background: 'rgba(22,163,74,0.15)', borderColor: '#16A34A' }
            : flash === 'wrong'
              ? { background: 'rgba(220,38,38,0.12)', borderColor: '#DC2626' }
              : { background: '#111827', borderColor: '#1F2937' }
        }>
        <div className="text-5xl font-bold tracking-wide" style={{ color: '#F9FAFB' }}>
          {problem.a} {problem.op} {problem.b}
        </div>
        <div className="text-lg mt-2" style={{ color: '#4B5563' }}>= ?</div>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full">
        {problem.options.map((opt, i) => (
          <button key={i} onClick={() => handleAnswer(opt)}
            className="py-5 rounded-xl text-2xl font-bold border transition-colors"
            style={{ background: 'rgba(255,255,255,0.04)', borderColor: '#1F2937', color: '#F9FAFB' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#DC262640'; e.currentTarget.style.background = 'rgba(220,38,38,0.06)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#1F2937'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}
