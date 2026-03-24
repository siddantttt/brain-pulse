import { useState, useEffect, useRef, useCallback } from 'react'
import type { GameMetrics } from '../../types'

/**
 * Focus Training — Blue domain (focus / stability / lower cortisol)
 * Deep blue promotes sustained attention and stability.
 *
 * Difficulty ramps in 3 stages over the session (every 15 s):
 *   Stage 0 — opening: large dots, slow spawns, few/no decoys
 *   Stage 1 — mid:     smaller dots, faster spawns, more decoys
 *   Stage 2 — frantic: tiny dots, rapid spawns, lots of decoys
 *
 * Starting parameters scale with the `difficulty` prop (1–10) so that
 * age-based difficulty (from onboarding) influences the opening pace.
 */

interface Target {
  id: number
  x: number
  y: number
  color: string
  isTarget: boolean
  size: number   // captured at spawn so mid-flight dots don't resize
}

interface StageConfig {
  dotSize: number
  visibility: number    // ms each dot stays on screen before auto-removing
  spawnInterval: number // ms between wave spawns
  decoys: number        // gray decoy dots per wave
}

interface Props {
  difficulty: number
  duration?: number
  onComplete: (score: number, metrics: GameMetrics) => void
}

const TARGET_COLOR = '#1B4FD8'
// Enough distinct gray shades for up to 8 decoys at max stage
const DECOY_COLORS = [
  '#6B7280', '#9CA3AF', '#4B5563', '#D1D5DB',
  '#374151', '#CBD5E1', '#52525B', '#94A3B8',
]
const DURATION = 45
const STAGE_DURATION = 15   // seconds each stage lasts
const STAGE_LABELS = ['Warming up', 'Speeding up', 'Full speed']

function getStageConfig(difficulty: number, stage: number): StageConfig {
  const d = Math.max(1, Math.min(10, difficulty))

  switch (stage) {
    case 0: return {
      // Opening — easy start, scales with difficulty so older/advanced users
      // don't get a trivially slow warm-up
      dotSize:       Math.max(28, 66 - d * 4),
      visibility:    Math.max(700,  2400 - d * 200),
      spawnInterval: Math.max(700,  2100 - d * 175),
      decoys:        Math.max(0, Math.floor(d / 3)),
    }
    case 1: return {
      // Mid ramp — meaningful escalation for all difficulties
      dotSize:       Math.max(22, 52 - d * 2),
      visibility:    Math.max(500,  1600 - d * 120),
      spawnInterval: Math.max(500,  1400 - d * 100),
      decoys:        Math.min(5, 1 + Math.floor(d / 2)),
    }
    default: return {
      // Stage 2 — always frantic; difficulty shifts intensity but floor is high
      dotSize:       Math.max(18, 30 - d),
      visibility:    Math.max(350,  750 - d * 40),
      spawnInterval: Math.max(350,  650 - d * 30),
      decoys:        Math.min(8, 4 + Math.floor(d / 2)),
    }
  }
}

export default function FocusGame({ difficulty, duration, onComplete }: Props) {
  const gameDuration = duration ?? DURATION

  const [targets,  setTargets]  = useState<Target[]>([])
  const [score,    setScore]    = useState({ hits: 0, misses: 0, total: 0 })
  const [timeLeft, setTimeLeft] = useState(gameDuration)
  const [running,  setRunning]  = useState(false)
  const [started,  setStarted]  = useState(false)
  const [stage,    setStage]    = useState(0)
  const [stageFlash, setStageFlash] = useState(false)

  const idRef           = useRef(0)
  const stageRef        = useRef(0)   // updated sync inside timer effect; avoids adding stage to timer deps
  const spawnTimesRef   = useRef<Record<number, number>>({})
  const responseTimesRef = useRef<number[]>([])
  const halfScoreRef    = useRef<{ hits: number; misses: number } | null>(null)

  // Derive live config from current stage state
  const { dotSize, visibility, spawnInterval, decoys } = getStageConfig(difficulty, stage)

  // ── Spawn logic ────────────────────────────────────────────────────────────
  const removeTarget = useCallback((id: number) => {
    setTargets(prev => prev.filter(t => t.id !== id))
  }, [])

  const spawnTargets = useCallback(() => {
    const now = Date.now()
    const wave: Target[] = []

    const blue: Target = {
      id: idRef.current++,
      x: 10 + Math.random() * 75,
      y: 10 + Math.random() * 75,
      color: TARGET_COLOR,
      isTarget: true,
      size: dotSize,
    }
    spawnTimesRef.current[blue.id] = now
    wave.push(blue)

    DECOY_COLORS.slice(0, decoys).forEach(color => {
      const decoy: Target = {
        id: idRef.current++,
        x: 10 + Math.random() * 75,
        y: 10 + Math.random() * 75,
        color,
        isTarget: false,
        size: dotSize,
      }
      spawnTimesRef.current[decoy.id] = now
      wave.push(decoy)
    })

    setTargets(prev => [...prev, ...wave])
    setScore(s => ({ ...s, total: s.total + 1 + decoys }))

    // Each dot auto-removes after `visibility` ms — timer always wins
    wave.forEach(t => setTimeout(() => removeTarget(t.id), visibility))
  }, [decoys, dotSize, visibility, removeTarget])

  // ── Timer + stage advancement ──────────────────────────────────────────────
  useEffect(() => {
    if (!running) return

    if (timeLeft <= 0) {
      setRunning(false)
      setTargets([])

      const finalScore = score.total === 0 ? 0 :
        Math.round((score.hits / Math.max(score.total - score.misses * 2, 1)) * 100)
      const clampedScore = Math.min(100, Math.max(0, finalScore))

      const clickAcc = (score.hits + score.misses) > 0
        ? score.hits / (score.hits + score.misses) : 0
      const avgRT = responseTimesRef.current.length > 0
        ? Math.round(responseTimesRef.current.reduce((a, b) => a + b, 0) / responseTimesRef.current.length)
        : 800

      let droppedUnderPressure = false
      if (halfScoreRef.current) {
        const half = halfScoreRef.current
        const firstHalfTotal  = half.hits + half.misses
        const firstHalfAcc    = firstHalfTotal > 0 ? half.hits / firstHalfTotal : 0
        const secondHalfHits  = score.hits   - half.hits
        const secondHalfMisses = score.misses - half.misses
        const secondHalfTotal = secondHalfHits + secondHalfMisses
        const secondHalfAcc   = secondHalfTotal > 0 ? secondHalfHits / secondHalfTotal : 0
        droppedUnderPressure  = firstHalfTotal > 2 && (firstHalfAcc - secondHalfAcc) > 0.15
      }

      const metrics: GameMetrics = {
        accuracy: Math.round(clickAcc * 100),
        avgResponseTime: avgRT,
        droppedUnderPressure,
        domain: 'attention',
      }

      onComplete(clampedScore, metrics)
      return
    }

    // Advance stage every STAGE_DURATION seconds
    // Use a ref to avoid adding `stage` to deps (which would cause the timer
    // to reset its setTimeout each time stage changes)
    const elapsed    = gameDuration - timeLeft
    const nextStage  = Math.min(2, Math.floor(elapsed / STAGE_DURATION))
    if (nextStage !== stageRef.current) {
      stageRef.current = nextStage
      setStage(nextStage)
      setStageFlash(true)
      setTimeout(() => setStageFlash(false), 800)
    }

    if (timeLeft === Math.ceil(gameDuration / 2)) {
      halfScoreRef.current = { hits: score.hits, misses: score.misses }
    }

    const t = setTimeout(() => setTimeLeft(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [running, timeLeft, score, onComplete, gameDuration])

  // ── Spawn interval — restarts whenever stage changes (new config) ──────────
  useEffect(() => {
    if (!running) return
    const id = setInterval(spawnTargets, spawnInterval)
    return () => clearInterval(id)
  }, [running, spawnTargets, spawnInterval])

  // ── Click handler ──────────────────────────────────────────────────────────
  function handleClick(target: Target) {
    if (!running) return
    removeTarget(target.id)
    if (target.isTarget) {
      const rt = Date.now() - (spawnTimesRef.current[target.id] ?? Date.now())
      responseTimesRef.current.push(rt)
      setScore(s => ({ ...s, hits: s.hits + 1 }))
    } else {
      setScore(s => ({ ...s, misses: s.misses + 1 }))
    }
  }

  // ── Start ──────────────────────────────────────────────────────────────────
  function start() {
    idRef.current = 0
    stageRef.current = 0
    responseTimesRef.current = []
    halfScoreRef.current = null
    setTargets([])
    setScore({ hits: 0, misses: 0, total: 0 })
    setTimeLeft(gameDuration)
    setStage(0)
    setStageFlash(false)
    setStarted(true)
    setRunning(true)
  }

  // ── Intro screen ───────────────────────────────────────────────────────────
  if (!started) {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <div>
          <p className="text-sm mb-4 max-w-xs leading-relaxed" style={{ color: '#9CA3AF' }}>
            This one tests how well you tune out distractions and lock onto what matters.
          </p>
          <h2 className="text-2xl font-bold" style={{ color: '#F9FAFB' }}>Focus Training</h2>
          <p className="mt-2 text-sm" style={{ color: '#9CA3AF' }}>
            Click the <span style={{ color: '#93C5FD', fontWeight: 600 }}>blue</span> targets only.
            <br />Ignore everything else. It gets harder fast.
          </p>
        </div>
        <div className="relative rounded-2xl" style={{ width: 320, height: 200, background: '#0A0F1E', border: '1px solid #1F2937' }}>
          <div className="absolute rounded-full" style={{
            width: 52, height: 52, left: '35%', top: '50%',
            transform: 'translate(-50%, -50%)',
            background: TARGET_COLOR,
            boxShadow: '0 0 20px rgba(27,79,216,0.4)',
          }} />
          <div className="absolute rounded-full" style={{
            width: 40, height: 40, left: '65%', top: '40%',
            transform: 'translate(-50%, -50%)',
            background: '#6B7280',
          }} />
          <div className="absolute bottom-3 left-0 right-0 text-center text-xs" style={{ color: '#4B5563' }}>
            blue = tap · grey = ignore
          </div>
        </div>
        {/* Difficulty ramp preview */}
        <div className="flex items-center gap-2 text-xs" style={{ color: '#4B5563' }}>
          {[0, 1, 2].map(s => {
            const cfg = getStageConfig(difficulty, s)
            return (
              <div key={s} className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl"
                style={{ background: '#111827', border: '1px solid #1F2937' }}>
                <div className="rounded-full" style={{
                  width: cfg.dotSize * 0.6, height: cfg.dotSize * 0.6,
                  background: TARGET_COLOR,
                  opacity: 0.7 + s * 0.1,
                }} />
                <span style={{ color: s === 2 ? '#FCA5A5' : '#4B5563' }}>
                  {STAGE_LABELS[s]}
                </span>
              </div>
            )
          })}
        </div>
        <button onClick={start} className="btn-primary px-8 py-3">
          Start — {gameDuration}s
        </button>
      </div>
    )
  }

  // ── Game screen ────────────────────────────────────────────────────────────
  const accuracy = score.total > 0 ? Math.round((score.hits / score.total) * 100) : 0
  const stageColors = ['#1B4FD8', '#7C3AED', '#DC2626']
  const stageColor  = stageColors[stage]

  return (
    <div className="flex flex-col items-center gap-4">

      {/* HUD */}
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

      {/* Stage indicator */}
      <div className="flex items-center gap-1.5 w-full max-w-sm">
        {[0, 1, 2].map(s => (
          <div key={s} className="flex-1 h-1 rounded-full transition-all duration-500"
            style={{ background: s <= stage ? stageColor : '#1F2937' }} />
        ))}
        <span className="text-xs ml-1 transition-all duration-300"
          style={{
            color: stageFlash ? stageColor : '#4B5563',
            fontWeight: stageFlash ? 600 : 400,
          }}>
          {STAGE_LABELS[stage]}
        </span>
      </div>

      {/* Arena */}
      <div className="relative rounded-2xl overflow-hidden"
        style={{
          width: 340, height: 300,
          background: '#0A0F1E',
          border: `1px solid ${stageFlash ? stageColor + '80' : '#1F2937'}`,
          transition: 'border-color 0.4s ease',
        }}>
        {targets.map(target => (
          <button
            key={target.id}
            onClick={() => handleClick(target)}
            className="absolute rounded-full"
            style={{
              width:  target.size,
              height: target.size,
              left:   `${target.x}%`,
              top:    `${target.y}%`,
              transform: 'translate(-50%, -50%)',
              backgroundColor: target.color,
              boxShadow: target.isTarget ? `0 0 ${Math.round(target.size * 0.35)}px rgba(27,79,216,0.55)` : 'none',
              border: target.isTarget
                ? '2px solid rgba(147,197,253,0.45)'
                : '1px solid rgba(255,255,255,0.06)',
              transition: 'transform 80ms ease',
            }}
          />
        ))}
        {targets.length === 0 && running && (
          <div className="absolute inset-0 flex items-center justify-center text-sm"
            style={{ color: '#374151' }}>
            Get ready…
          </div>
        )}
      </div>
    </div>
  )
}
