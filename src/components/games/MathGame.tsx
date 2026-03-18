import { useState, useEffect, useRef } from 'react'

/**
 * Mental Arithmetic Speed Test
 * Rapid-fire arithmetic problems under time pressure.
 * Based on numerical cognition research — mental calculation engages
 * the intraparietal sulcus and prefrontal cortex, training
 * number sense and working memory simultaneously.
 */

interface Props {
  difficulty: number
  onComplete: (score: number) => void
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

  useEffect(() => {
    if (!started || doneRef.current) return
    if (timeLeft <= 0) {
      doneRef.current = true
      const score = total === 0 ? 0 : Math.round((correct / total) * 100)
      onComplete(score)
      return
    }
    const t = setTimeout(() => setTimeLeft(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [started, timeLeft, correct, total, onComplete])

  function handleAnswer(opt: number) {
    if (!started || doneRef.current) return
    const isCorrect = opt === problem.answer
    setFlash(isCorrect ? 'correct' : 'wrong')
    setCorrect(c => isCorrect ? c + 1 : c)
    setTotal(t => t + 1)
    setTimeout(() => {
      setFlash(null)
      setProblem(makeProblem(difficulty))
    }, 300)
  }

  const pct = total > 0 ? Math.round((correct / total) * 100) : 0
  const timerPct = (timeLeft / duration) * 100

  if (!started) {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Speed Math</h2>
          <p className="text-white/60 mt-2">Solve as many problems as you can<br />in {duration} seconds.</p>
        </div>
        <div className="p-6 bg-white/5 border border-white/10 rounded-2xl text-4xl font-bold text-white">
          7 + 8 = ?
        </div>
        <button
          onClick={() => setStarted(true)}
          className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold text-white transition-colors"
        >
          Start — {duration}s
        </button>
        <p className="text-white/20 text-xs max-w-xs">
          Based on numerical cognition research · trains the intraparietal sulcus
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto">
      {/* Stats bar */}
      <div className="flex items-center justify-between w-full">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{timeLeft}s</div>
          <div className="text-white/40 text-xs">left</div>
        </div>
        <div className="flex-1 mx-4">
          <div className="w-full bg-white/5 rounded-full h-1.5">
            <div
              className="h-1.5 rounded-full bg-indigo-500 transition-all duration-1000"
              style={{ width: `${timerPct}%` }}
            />
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-indigo-400">{correct}/{total}</div>
          <div className="text-white/40 text-xs">{pct}%</div>
        </div>
      </div>

      {/* Problem */}
      <div className={`w-full p-8 rounded-2xl border text-center transition-colors duration-150
        ${flash === 'correct' ? 'bg-emerald-500/20 border-emerald-400' :
          flash === 'wrong' ? 'bg-red-500/20 border-red-400' :
          'bg-white/5 border-white/10'}`}
      >
        <div className="text-5xl font-bold text-white tracking-wide">
          {problem.a} {problem.op} {problem.b}
        </div>
        <div className="text-white/30 text-lg mt-2">= ?</div>
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3 w-full">
        {problem.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(opt)}
            className="py-5 bg-white/5 hover:bg-indigo-500/20 border border-white/10 hover:border-indigo-400/50 rounded-xl text-white text-2xl font-bold transition-colors"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}
