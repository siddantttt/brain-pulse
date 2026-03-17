import { useState, useEffect, useRef, useCallback } from 'react'

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

const COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#ef4444']
const TARGET_COLOR = '#6366f1'
const DURATION = 45 // seconds

function getConfig(difficulty: number) {
  const speed = Math.max(400, 1200 - difficulty * 100)       // ms targets stay
  const decoys = Math.min(difficulty, 4)                      // extra wrong targets
  const spawnInterval = Math.max(600, 1400 - difficulty * 80) // ms between spawns
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
    const allColors = COLORS.filter(c => c !== TARGET_COLOR).slice(0, decoys)

    // Always spawn one real target
    newTargets.push({
      id: idRef.current++,
      x: 10 + Math.random() * 75,
      y: 10 + Math.random() * 75,
      color: TARGET_COLOR,
      isTarget: true,
    })

    // Spawn decoys
    allColors.forEach(color => {
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

    // Auto-remove after speed ms
    newTargets.forEach(t => {
      setTimeout(() => removeTarget(t.id), speed)
    })
  }, [decoys, speed, removeTarget])

  // Timer
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

  // Spawner
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
          <h2 className="text-2xl font-bold text-white">Focus Training</h2>
          <p className="text-white/60 mt-2">Click the <span className="text-indigo-400 font-semibold">purple</span> targets only.<br />Ignore all other colors.</p>
        </div>
        <div
          className="relative rounded-2xl border border-white/10"
          style={{ width: 320, height: 280, backgroundColor: '#16162a' }}
        >
          <div
            className="absolute rounded-full border-2 border-indigo-400"
            style={{ width: 48, height: 48, left: '50%', top: '50%', transform: 'translate(-50%,-50%)', backgroundColor: TARGET_COLOR }}
          />
          <div className="absolute bottom-3 left-0 right-0 text-center text-white/40 text-xs">example target</div>
        </div>
        <button
          onClick={start}
          className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold transition-colors"
        >
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
          <div className="text-2xl font-bold text-white">{timeLeft}s</div>
          <div className="text-white/40 text-xs">time left</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-indigo-400">{score.hits}</div>
          <div className="text-white/40 text-xs">hits</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-pink-400">{score.misses}</div>
          <div className="text-white/40 text-xs">misses</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-emerald-400">{accuracy}%</div>
          <div className="text-white/40 text-xs">accuracy</div>
        </div>
      </div>

      <div
        className="relative rounded-2xl border border-white/10 overflow-hidden"
        style={{ width: 340, height: 300, backgroundColor: '#16162a' }}
      >
        {targets.map(target => (
          <button
            key={target.id}
            onClick={() => handleClick(target)}
            className="absolute rounded-full transition-transform hover:scale-110 active:scale-90"
            style={{
              width: 48,
              height: 48,
              left: `${target.x}%`,
              top: `${target.y}%`,
              backgroundColor: target.color,
              transform: 'translate(-50%, -50%)',
              border: target.isTarget ? '2px solid rgba(255,255,255,0.4)' : '2px solid rgba(255,255,255,0.1)',
            }}
          />
        ))}
        {targets.length === 0 && running && (
          <div className="absolute inset-0 flex items-center justify-center text-white/20 text-sm">
            Get ready…
          </div>
        )}
      </div>
    </div>
  )
}
