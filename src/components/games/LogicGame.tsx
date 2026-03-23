import { useState, useEffect } from 'react'

/**
 * Pattern Recognition — Yellow domain (logic / creativity / optimism)
 * Amber/yellow stimulates pattern-matching and encourages optimism.
 */

interface Props {
  difficulty: number
  onComplete: (score: number) => void
}

interface Question {
  sequence: number[]
  answer: number
  options: number[]
}

function generateQuestion(difficulty: number): Question {
  const type = Math.floor(Math.random() * 3)
  let sequence: number[]
  let answer: number

  const base = Math.floor(Math.random() * (difficulty * 2)) + 1

  if (type === 0) {
    const step = Math.floor(Math.random() * (difficulty + 1)) + 1
    const start = Math.floor(Math.random() * 10) + 1
    const len = difficulty >= 6 ? 5 : 4
    sequence = Array.from({ length: len }, (_, i) => start + i * step)
    answer = start + len * step
  } else if (type === 1) {
    if (difficulty >= 4) {
      const ratio = Math.floor(Math.random() * 2) + 2
      sequence = [base, base * ratio, base * ratio ** 2, base * ratio ** 3]
      answer = base * ratio ** 4
    } else {
      const step = (Math.floor(Math.random() * 3) + 1) * (difficulty >= 3 ? 2 : 1)
      sequence = [1, 1 + step, 1 + step * 2, 1 + step * 3]
      answer = 1 + step * 4
    }
  } else {
    const a = Math.floor(Math.random() * 5) + 1
    const b = Math.floor(Math.random() * 5) + a
    sequence = [a, b, a + b, a + b + b]
    answer = a + b + b + (a + b)
  }

  const wrongSet = new Set<number>()
  while (wrongSet.size < 3) {
    const offset = Math.floor(Math.random() * 8) - 4
    const wrong = answer + offset
    if (wrong !== answer && wrong > 0) wrongSet.add(wrong)
  }

  const options = [answer, ...Array.from(wrongSet)].sort(() => Math.random() - 0.5)
  return { sequence, answer, options }
}

const TOTAL = 8
const TIME_PER_Q = 10

export default function LogicGame({ difficulty, onComplete }: Props) {
  const [questions] = useState<Question[]>(() =>
    Array.from({ length: TOTAL }, () => generateQuestion(difficulty))
  )
  const [current, setCurrent] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState(TIME_PER_Q)
  const [done, setDone] = useState(false)

  const q = questions[current]

  useEffect(() => {
    if (done || selected !== null) return
    if (timeLeft <= 0) { advance(false); return }
    const t = setTimeout(() => setTimeLeft(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [timeLeft, done, selected])

  function advance(wasCorrect: boolean) {
    if (wasCorrect) setCorrect(c => c + 1)
    if (current + 1 >= TOTAL) {
      setDone(true)
      const score = Math.round(((wasCorrect ? correct + 1 : correct) / TOTAL) * 100)
      setTimeout(() => onComplete(score), 600)
    } else {
      setTimeout(() => {
        setCurrent(c => c + 1)
        setSelected(null)
        setTimeLeft(TIME_PER_Q)
      }, 600)
    }
  }

  function handleAnswer(opt: number) {
    if (selected !== null || done) return
    setSelected(opt)
    advance(opt === q.answer)
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto">
      <div className="flex items-center justify-between w-full">
        <span className="text-sm" style={{ color: '#9CA3AF' }}>Question {current + 1}/{TOTAL}</span>
        <div className="flex items-center gap-2">
          <div className="h-1.5 rounded-full transition-all"
            style={{ width: `${(timeLeft / TIME_PER_Q) * 80}px`, background: '#CA8A04' }} />
          <span className="text-sm w-6" style={{ color: '#9CA3AF' }}>{timeLeft}s</span>
        </div>
      </div>

      <div className="w-full rounded-2xl p-6 text-center"
        style={{ background: '#111827', border: '1px solid #1F2937' }}>
        <p className="text-sm mb-3" style={{ color: '#9CA3AF' }}>What comes next?</p>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {q.sequence.map((n, i) => (
            <span key={i} className="text-2xl font-bold" style={{ color: '#F9FAFB' }}>{n}</span>
          ))}
          <span className="text-2xl font-bold" style={{ color: '#6B7280' }}>,</span>
          <span className="text-2xl font-bold px-3 border-b-2" style={{ color: '#FDE68A', borderColor: '#CA8A04' }}>?</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full">
        {q.options.map((opt, i) => {
          let bg: React.CSSProperties = { background: 'rgba(255,255,255,0.04)', borderColor: '#1F2937', color: '#F9FAFB' }
          if (selected !== null) {
            if (opt === q.answer) bg = { background: 'rgba(202,138,4,0.2)', borderColor: '#CA8A04', color: '#FDE68A' }
            else if (opt === selected && opt !== q.answer) bg = { background: 'rgba(220,38,38,0.15)', borderColor: '#DC2626', color: '#FCA5A5' }
          }
          return (
            <button key={i} onClick={() => handleAnswer(opt)} disabled={selected !== null}
              className="py-4 rounded-xl text-xl font-bold border transition-colors"
              style={bg}>
              {opt}
            </button>
          )
        })}
      </div>

      <div className="flex gap-1">
        {questions.map((_, i) => (
          <div key={i} className="h-1.5 w-6 rounded-full transition-colors"
            style={{ background: i < current ? '#CA8A04' : i === current ? '#FDE68A' : '#1F2937' }} />
        ))}
      </div>
    </div>
  )
}
