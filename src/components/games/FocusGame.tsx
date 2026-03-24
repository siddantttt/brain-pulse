import { useState, useEffect, useRef } from 'react'
import type { GameMetrics } from '../../types'

/**
 * Focus Training — Eriksen Flanker Task
 *
 * Five arrows appear in a row. The player must respond to the CENTER arrow
 * direction only, ignoring the four flanking arrows.
 *
 * Congruent trial  (easy): all arrows point the same way  ← ← ← ← ←
 * Incongruent trial (hard): flankers oppose center         ← ← → ← ←
 *
 * This tests selective attention and inhibitory control — the same construct
 * measured by clinical CPT and Flanker paradigms in neuropsychology research.
 *
 * Difficulty scales two parameters:
 *   - responseWindow: how long the player has to respond before auto-timeout
 *   - congruentRatio: proportion of easy (congruent) trials
 *
 * Higher difficulty → less time, more incongruent (interference) trials.
 */

interface Props {
  difficulty: number
  duration?: number
  onComplete: (score: number, metrics: GameMetrics) => void
}

interface Trial {
  arrows: boolean[]              // true = right (→), false = left (←), length 5
  answer: 'left' | 'right'       // center arrow direction
  congruent: boolean
}

const DURATION = 45

function getConfig(difficulty: number) {
  const d = Math.max(1, Math.min(10, difficulty))
  return {
    responseWindow: Math.max(550, 2200 - d * 165),    // ms per trial
    congruentRatio: Math.max(0.15, 0.85 - d * 0.07),  // prob of easy trial
  }
}

function makeTrial(congruentRatio: number): Trial {
  const congruent  = Math.random() < congruentRatio
  const centerRight = Math.random() < 0.5
  const arrows = Array.from({ length: 5 }, (_, i) =>
    i === 2 ? centerRight : (congruent ? centerRight : !centerRight)
  )
  return { arrows, answer: centerRight ? 'right' : 'left', congruent }
}

export default function FocusGame({ difficulty, duration, onComplete }: Props) {
  const gameDuration = duration ?? DURATION
  const { responseWindow, congruentRatio } = getConfig(difficulty)

  // UI state
  const [started,   setStarted]   = useState(false)
  const [timeLeft,  setTimeLeft]  = useState(gameDuration)
  const [trialIdx,  setTrialIdx]  = useState(0)
  const [feedback,  setFeedback]  = useState<'correct' | 'wrong' | 'timeout' | null>(null)
  const [correct,   setCorrect]   = useState(0)
  const [total,     setTotal]     = useState(0)
  const [trialPct,  setTrialPct]  = useState(100)  // response-window progress bar

  // Pre-generate enough trials for any session length
  const [trials] = useState<Trial[]>(() =>
    Array.from({ length: 150 }, () => makeTrial(congruentRatio))
  )

  // Refs — hold live values accessible inside timers without stale-closure issues
  const doneRef          = useRef(false)
  const lockedRef        = useRef(false)
  const correctRef       = useRef(0)
  const totalRef         = useRef(0)
  const responseTimesRef = useRef<number[]>([])
  const trialStartRef    = useRef(0)
  const halfStatsRef     = useRef<{ correct: number; total: number } | null>(null)
  const onCompleteRef    = useRef(onComplete)
  useEffect(() => { onCompleteRef.current = onComplete }, [onComplete])

  const currentTrial = trials[trialIdx % trials.length]

  // ── End game ──────────────────────────────────────────────────────────────
  function endGame() {
    if (doneRef.current) return
    doneRef.current = true

    const c = correctRef.current
    const t = totalRef.current
    const score = t === 0 ? 0 : Math.max(0, Math.min(100, Math.round((c / t) * 100)))

    const avgRT = responseTimesRef.current.length > 0
      ? Math.round(responseTimesRef.current.reduce((a, b) => a + b, 0) / responseTimesRef.current.length)
      : responseWindow

    let droppedUnderPressure = false
    if (halfStatsRef.current && halfStatsRef.current.total >= 3) {
      const half      = halfStatsRef.current
      const firstAcc  = half.correct / half.total
      const secTotal  = t - half.total
      const secAcc    = secTotal > 0 ? (c - half.correct) / secTotal : 0
      droppedUnderPressure = firstAcc - secAcc > 0.15
    }

    const metrics: GameMetrics = {
      accuracy: t === 0 ? 0 : Math.round((c / t) * 100),
      avgResponseTime: avgRT,
      droppedUnderPressure,
      domain: 'attention',
    }

    onCompleteRef.current(score, metrics)
  }

  // ── Main game timer (runs on a fixed interval, independent of trial state) ─
  useEffect(() => {
    if (!started) return
    const id = setInterval(() => {
      setTimeLeft(prev => {
        const next = prev - 1
        if (next === Math.ceil(gameDuration / 2) && !halfStatsRef.current) {
          halfStatsRef.current = { correct: correctRef.current, total: totalRef.current }
        }
        if (next <= 0) {
          clearInterval(id)
          setTimeout(endGame, 400)
        }
        return Math.max(0, next)
      })
    }, 1000)
    return () => clearInterval(id)
  }, [started])   // intentionally no other deps — reads only from refs

  // ── Per-trial: response window countdown + auto-timeout ───────────────────
  useEffect(() => {
    if (!started || feedback !== null || doneRef.current) return

    trialStartRef.current = Date.now()
    setTrialPct(100)

    // Smooth progress bar draining over responseWindow ms
    const TICK = 40
    const progressId = setInterval(() => {
      const elapsed = Date.now() - trialStartRef.current
      setTrialPct(Math.max(0, 100 - (elapsed / responseWindow) * 100))
    }, TICK)

    // Auto-timeout when window expires
    const timeoutId = setTimeout(() => {
      clearInterval(progressId)
      if (doneRef.current || lockedRef.current) return
      lockedRef.current = true
      totalRef.current += 1
      setTotal(t => t + 1)
      setFeedback('timeout')
      setTimeout(() => {
        lockedRef.current = false
        setFeedback(null)
        setTrialIdx(i => i + 1)
      }, 380)
    }, responseWindow)

    return () => {
      clearInterval(progressId)
      clearTimeout(timeoutId)
    }
  }, [started, trialIdx, feedback])   // re-runs for each new trial

  // ── Player response ───────────────────────────────────────────────────────
  function handleResponse(dir: 'left' | 'right') {
    if (!started || lockedRef.current || doneRef.current || feedback !== null) return
    lockedRef.current = true

    const rt        = Date.now() - trialStartRef.current
    const isCorrect = dir === currentTrial.answer

    if (isCorrect) {
      correctRef.current += 1
      setCorrect(c => c + 1)
      responseTimesRef.current.push(rt)
    }
    totalRef.current += 1
    setTotal(t => t + 1)
    setFeedback(isCorrect ? 'correct' : 'wrong')

    setTimeout(() => {
      lockedRef.current = false
      setFeedback(null)
      setTrialIdx(i => i + 1)
    }, 380)
  }

  // ── Keyboard support ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!started) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft')  handleResponse('left')
      if (e.key === 'ArrowRight') handleResponse('right')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [started, feedback, trialIdx])

  // ── Start ─────────────────────────────────────────────────────────────────
  function start() {
    doneRef.current          = false
    lockedRef.current        = false
    correctRef.current       = 0
    totalRef.current         = 0
    responseTimesRef.current = []
    halfStatsRef.current     = null
    setCorrect(0)
    setTotal(0)
    setTimeLeft(gameDuration)
    setTrialIdx(0)
    setFeedback(null)
    setTrialPct(100)
    setStarted(true)
  }

  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0

  // ── Intro screen ──────────────────────────────────────────────────────────
  if (!started) {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <div>
          <p className="text-sm mb-4 max-w-xs leading-relaxed" style={{ color: '#9CA3AF' }}>
            This tests your ability to focus on what matters and block out what doesn't.
          </p>
          <h2 className="text-2xl font-bold" style={{ color: '#F9FAFB' }}>Flanker Task</h2>
          <p className="mt-2 text-sm" style={{ color: '#9CA3AF' }}>
            Five arrows appear. Tap the direction the{' '}
            <span style={{ color: '#93C5FD', fontWeight: 600 }}>centre arrow</span>{' '}
            is pointing.<br />Ignore the four arrows around it.
          </p>
        </div>

        {/* Example: congruent vs incongruent */}
        <div className="flex flex-col gap-3 w-full max-w-xs">
          {[
            { arrows: [false, false, false, false, false], label: 'Easy — all agree', labelColor: '#86EFAC' },
            { arrows: [true,  true,  false, true,  true ], label: 'Hard — flankers disagree', labelColor: '#FCA5A5' },
          ].map((ex, ei) => (
            <div key={ei} className="p-4 rounded-2xl flex flex-col items-center gap-2"
              style={{ background: '#111827', border: '1px solid #1F2937' }}>
              <div className="flex gap-3">
                {ex.arrows.map((right, i) => (
                  <span key={i}
                    className="text-2xl font-bold select-none"
                    style={{ color: i === 2 ? '#93C5FD' : '#4B5563' }}>
                    {right ? '→' : '←'}
                  </span>
                ))}
              </div>
              <span className="text-xs" style={{ color: ex.labelColor }}>{ex.label}</span>
            </div>
          ))}
        </div>

        <button onClick={start} className="btn-primary px-8 py-3">
          Start — {gameDuration}s
        </button>
        <p className="text-xs" style={{ color: '#374151' }}>
          Eriksen Flanker Task · inhibitory control · selective attention
        </p>
      </div>
    )
  }

  // ── Game screen ───────────────────────────────────────────────────────────
  const arenaColor = feedback === 'correct' ? 'rgba(22,163,74,0.1)'
    : feedback === 'wrong'   ? 'rgba(220,38,38,0.1)'
    : feedback === 'timeout' ? 'rgba(107,114,128,0.07)'
    : '#111827'

  const arenaBorder = feedback === 'correct' ? '#16A34A'
    : feedback === 'wrong'   ? '#DC2626'
    : feedback === 'timeout' ? '#374151'
    : '#1F2937'

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-sm mx-auto">

      {/* HUD */}
      <div className="flex items-center justify-between w-full">
        <div className="text-center">
          <div className="text-2xl font-bold" style={{ color: '#F9FAFB' }}>{timeLeft}s</div>
          <div className="text-xs" style={{ color: '#6B7280' }}>time left</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold" style={{ color: '#93C5FD' }}>{correct}</div>
          <div className="text-xs" style={{ color: '#6B7280' }}>correct</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold" style={{ color: '#86EFAC' }}>{accuracy}%</div>
          <div className="text-xs" style={{ color: '#6B7280' }}>accuracy</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold" style={{ color: '#9CA3AF' }}>{total}</div>
          <div className="text-xs" style={{ color: '#6B7280' }}>trials</div>
        </div>
      </div>

      {/* Response-window bar */}
      <div className="w-full h-1 rounded-full" style={{ background: '#1F2937' }}>
        <div className="h-1 rounded-full transition-none"
          style={{
            width: `${trialPct}%`,
            background: trialPct > 50 ? '#1B4FD8' : trialPct > 25 ? '#7C3AED' : '#DC2626',
          }} />
      </div>

      {/* Arrow display */}
      <div className="w-full rounded-2xl flex flex-col items-center justify-center transition-colors duration-150"
        style={{
          height: 160,
          background: arenaColor,
          border: `1px solid ${arenaBorder}`,
        }}>
        {feedback ? (
          <span className="text-lg font-semibold"
            style={{
              color: feedback === 'correct' ? '#86EFAC'
                   : feedback === 'wrong'   ? '#FCA5A5'
                   : '#6B7280',
            }}>
            {feedback === 'correct' ? '✓ Correct'
           : feedback === 'wrong'   ? '✗ Wrong'
           : 'Too slow'}
          </span>
        ) : (
          <div className="flex items-center gap-4">
            {currentTrial.arrows.map((right, i) => (
              <span key={i}
                className="font-bold select-none"
                style={{
                  fontSize:   i === 2 ? 52 : 40,
                  color:      i === 2 ? '#F9FAFB' : '#4B5563',
                  lineHeight: 1,
                }}>
                {right ? '→' : '←'}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Response buttons */}
      <div className="flex gap-3 w-full">
        {(['left', 'right'] as const).map(dir => (
          <button
            key={dir}
            onClick={() => handleResponse(dir)}
            disabled={!!feedback}
            className="flex-1 rounded-2xl flex items-center justify-center font-bold transition-colors"
            style={{
              height: 80,
              fontSize: 36,
              background: feedback ? 'rgba(255,255,255,0.02)' : 'rgba(27,79,216,0.08)',
              border: `1px solid ${feedback ? '#1F2937' : 'rgba(27,79,216,0.35)'}`,
              color: feedback ? '#374151' : '#93C5FD',
              cursor: feedback ? 'default' : 'pointer',
            }}
            onMouseEnter={e => {
              if (!feedback) e.currentTarget.style.background = 'rgba(27,79,216,0.16)'
            }}
            onMouseLeave={e => {
              if (!feedback) e.currentTarget.style.background = 'rgba(27,79,216,0.08)'
            }}>
            {dir === 'left' ? '←' : '→'}
          </button>
        ))}
      </div>

      <p className="text-xs text-center" style={{ color: '#374151' }}>
        Keyboard: ← → arrow keys also work
      </p>
    </div>
  )
}
