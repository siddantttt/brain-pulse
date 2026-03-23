import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Focus Training — Blue domain (focus / stability / lower cortisol)
 * Deep blue promotes sustained attention and stability.
 */

interface Target {
  id: number
  x: number
  y: number
  color: string
  isTarget: boolean
}

interface Props {
  difficulty: number
  onComplete: (score: number) => void
}

// Target = focus blue; decoys = muted non-blue colors
const TARGET_COLOR = '#1B4FD8'
const DECOY_COLORS = ['#6B7280', '#374151', '#9CA3AF', '#4B5563']
const DURATION = 45

function getConfig(difficulty: number) {
  const speed = Math.max(400, 1200 - difficulty * 100)
  const decoys = Math.min(difficulty, 4)
  const spawnInterval = Math.max(600, 1400 - difficulty * 80)
  return { speed, decoys, spawnInterval }
}

export default function FocusGame({ difficulty, onComplete }: Props) {
  const [targets, setTargets] = useState<Target[]>([])
  const [score, setScore] = useState({ hits: 0, misses: 0, total: 0 })
  const [timeLeft, setTimeLeft] = useState(DURATION)
  const [running, setRunning] = useState(false)
  const [started, setStarted] = useState(false)
  const idRef = useRef(0)
  const { speed, decoys, spawnInterval } = getConfig(difficulty)

  const removeTarget = useCallback((id: number) => {
    setTargets(prev => prev.filter(t => t.id !== id))
  }, [])

  const spawnTargets = useCallback(() => {
    const newTargets: Target[] = []
    const decoyColors = DECOY_COLORS.slice(0, decoys)

    newTargets.push({
      id: idRef.current++,
      x: 10 + Math.random() * 75,
      y: 10 + Math.random() * 75,
      color: TARGET_COLOR,
      isTarget: true,
    })

    decoyColors.forEach(color => {
      newTargets.push({
        id: idRef.current++,
        x: 10 + Math.random() * 75,
        y: 10 + Math.random() * 75,
        color,
        isTarget: false,
      })
    })

    setTargets(prev => [...prev, ...newTargets])
    setScore(s => ({ ...s, total: s.total + 1 + decoys }))

    newTargets.forEach(t => {
      setTimeout(() => removeTarget(t.id), speed)
    })
  }, [decoys, speed, removeTarget])

  useEffect(() => {
    if (!running) return
    if (timeLeft <= 0) {
      setRunning(false)
      setTargets([])
      const finalScore = score.total === 0 ? 0 :
        Math.round((score.hits / Math.max(score.total - score.misses * 2, 1)) * 100)
      onComplete(Math.min(100, Math.max(0, finalScore)))
      return
    }
    const t = setTimeout(() => setTimeLeft(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [running, timeLeft, score, onComplete])

  useEffect(() => {
    if (!running) return
    const interval = setInterval(spawnTargets, spawnInterval)
    return () => clearInterval(interval)
  }, [running, spawnTargets, spawnInterval])

  function handleClick(target: Target) {
    if (!running) return
    removeTarget(target.id)
    if (target.isTarget) {
      setScore(s => ({ ...s, hits: s.hits + 1 }))
    } else {
      setScore(s => ({ ...s, misses: s.misses + 1 }))
    }
  }

  function start() {
    setStarted(true)
    setRunning(true)
    setTimeLeft(DURATION)
    setScore({ hits: 0, misses: 0, total: 0 })
    setTargets([])
  }

  if (!started) {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#F9FAFB' }}>Focus Training</h2>
          <p className="mt-2 text-sm" style={{ color: '#9CA3AF' }}>
            Click the <span style={{ color: '#93C5FD', fontWeight: 600 }}>blue</span> targets only.<br />Ignore all other targets.
          </p>
        </div>
        <div className="relative rounded-2xl" style={{ width: 320, height: 280, background: '#0A0F1E', border: '1px solid #1F2937' }}>
          <div className="absolute rounded-full" style={{
            width: 48, height: 48, left: '50%', top: '50%',
            transform: 'translate(-50%,-50%)',
            background: TARGET_COLOR,
            boxShadow: '0 0 20px rgba(27,79,216,0.4)',
          }} />
          <div className="absolute bottom-3 left-0 right-0 text-center text-xs" style={{ color: '#4B5563' }}>example target</div>
        </div>
        <button onClick={start} className="btn-primary px-8 py-3">
          Start — {DURATION}s
        </button>
      </div>
    )
  }

  const accuracy = score.total > 0 ? Math.round((score.hits / score.total) * 100) : 0

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-between w-full max-w-sm">
        <div className="text-center">
          <div className="text-2xl font-bold" style={{ color: '#F9FAFB' }}>{timeLeft}s</div>
          <div className="text-xs" style={{ color: '#6B7280' }}>time left</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold" style={{ color: '#93C5FD' }}>{score.hits}</div>
          <div className="text-xs" style={{ color: '#6B7280' }}>hits</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold" style={{ color: '#FCA5A5' }}>{score.misses}</div>
          <div className="text-xs" style={{ color: '#6B7280' }}>misses</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold" style={{ color: '#86EFAC' }}>{accuracy}%</div>
          <div className="text-xs" style={{ color: '#6B7280' }}>accuracy</div>
        </div>
      </div>

      <div className="relative rounded-2xl overflow-hidden"
        style={{ width: 340, height: 300, background: '#0A0F1E', border: '1px solid #1F2937' }}>
        {targets.map(target => (
          <button
            key={target.id}
            onClick={() => handleClick(target)}
            className="absolute rounded-full transition-transform hover:scale-110 active:scale-90"
            style={{
              width: 48, height: 48,
              left: `${target.x}%`, top: `${target.y}%`,
              backgroundColor: target.color,
              transform: 'translate(-50%, -50%)',
              boxShadow: target.isTarget ? '0 0 16px rgba(27,79,216,0.5)' : 'none',
              border: target.isTarget ? '2px solid rgba(147,197,253,0.4)' : '2px solid rgba(255,255,255,0.05)',
            }}
          />
        ))}
        {targets.length === 0 && running && (
          <div className="absolute inset-0 flex items-center justify-center text-sm" style={{ color: '#374151' }}>
            Get ready…
          </div>
        )}
      </div>
    </div>
  )
}
