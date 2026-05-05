import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useGameSessions } from '../hooks/useGameSessions'
import { useAuth } from '../contexts/AuthContext'
import MemoryGame from '../components/games/MemoryGame'
import FocusGame from '../components/games/FocusGame'
import LogicGame from '../components/games/LogicGame'
import VisualGame from '../components/games/VisualGame'
import MathGame from '../components/games/MathGame'
import RuleShiftGame from '../components/games/RuleShiftGame'
import ScoreScreen from '../components/ScoreScreen'
import { CloseIcon, FocusIcon, MemoryIcon, LogicIcon, VisualIcon, MathIcon, FlexibilityIcon } from '../components/Icons'
import type { Domain, GameMetrics } from '../types'
import { DOMAIN_LABELS, DOMAIN_COLORS } from '../types'

const DOMAIN_ICONS = {
  focus: FocusIcon,
  memory: MemoryIcon,
  logic: LogicIcon,
  visual: VisualIcon,
  math: MathIcon,
  flexibility: FlexibilityIcon,
}

const DOMAIN_SCIENCE: Record<Domain, string> = {
  focus:       'Continuous Performance Test · inhibitory control',
  memory:      'Paired-associate learning · episodic memory',
  logic:       "Raven's Progressive Matrices · fluid intelligence",
  visual:      'Corsi Block Test · visuospatial working memory',
  math:        'Numerical cognition · intraparietal sulcus',
  flexibility: 'Wisconsin Card Sorting Test · cognitive flexibility',
}

// Narrative messages shown after each game in assessment mode
const TRANSITION_MESSAGES: Record<number, string> = {
  0: "Sharp. Now let's test your mental agility.",
  1: "Adaptive. Let's test your speed.",
  2: "Fast mind. Let's see how you read patterns.",
  3: "Good eye. One last challenge.",
}

const ASSESSMENT_PLAN: Domain[] = ['focus', 'flexibility', 'math', 'logic', 'visual']

function GameComponent({
  domain, difficulty, onComplete,
}: {
  domain: Domain
  difficulty: number
  onComplete: (score: number, metrics: GameMetrics) => void
}) {
  switch (domain) {
    case 'memory':      return <MemoryGame    difficulty={difficulty} onComplete={onComplete} />
    case 'focus':       return <FocusGame     difficulty={difficulty} onComplete={onComplete} />
    case 'logic':       return <LogicGame     difficulty={difficulty} onComplete={onComplete} />
    case 'visual':      return <VisualGame    difficulty={difficulty} onComplete={onComplete} />
    case 'math':        return <MathGame      difficulty={difficulty} onComplete={onComplete} />
    case 'flexibility': return <RuleShiftGame difficulty={difficulty} onComplete={onComplete} />
  }
}

export default function Session() {
  const navigate = useNavigate()
  const location = useLocation()
  const { saveSession, computeDifficulty, getLastScore } = useGameSessions()
  const { profile } = useAuth()
  const ageGroup = profile?.age_group ?? null

  const isAssessment: boolean = location.state?.isAssessment ?? false
  const plan: Domain[] = isAssessment
    ? ASSESSMENT_PLAN
    : (location.state?.plan ?? ['memory', 'focus', 'logic'])

  const [gameIdx, setGameIdx] = useState(0)
  const [phase, setPhase] = useState<'playing' | 'score' | 'transition'>('playing')
  const [currentScore, setCurrentScore] = useState(0)
  const [currentMetrics, setCurrentMetrics] = useState<GameMetrics | null>(null)
  const [transitionMsg, setTransitionMsg] = useState('')
  const [results, setResults] = useState<Array<{ domain: Domain; score: number; difficulty: number }>>([])

  const domain = plan[gameIdx]
  const difficulty = computeDifficulty(domain)
  const Icon = DOMAIN_ICONS[domain]
  const dc = DOMAIN_COLORS[domain]

  async function handleGameComplete(score: number, metrics: GameMetrics) {
    setCurrentScore(score)
    setCurrentMetrics(metrics)
    await saveSession(domain, score, difficulty)
    const newResults = [...results, { domain, score, difficulty }]
    setResults(newResults)

    if (isAssessment) {
      if (gameIdx + 1 >= plan.length) {
        // Assessment complete — go straight to profile reveal (no score screen)
        navigate('/brain-profile', { state: { results: newResults } })
        return
      }
      const msg = TRANSITION_MESSAGES[gameIdx]
      if (msg) {
        setTransitionMsg(msg)
        setPhase('transition')
        return
      }
    }

    setPhase('score')
  }

  useEffect(() => {
    if (phase !== 'transition') return
    const t = setTimeout(() => {
      setGameIdx(i => i + 1)
      setPhase('playing')
    }, 2000)
    return () => clearTimeout(t)
  }, [phase])

  function handleNext() {
    if (gameIdx + 1 >= plan.length) {
      navigate('/session-complete', { state: { results, plan } })
    } else {
      setGameIdx(i => i + 1)
      setPhase('playing')
    }
  }

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <button onClick={() => navigate('/home')} style={{ color: '#4B5563' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#9CA3AF')}
          onMouseLeave={e => (e.currentTarget.style.color = '#4B5563')}>
          <CloseIcon size={18} />
        </button>

        {isAssessment ? (
          /* Assessment: warm 6-stage progress with stage label */
          <div className="flex-1">
            <div className="flex gap-1.5 mb-1.5">
              {plan.map((d, i) => (
                <div key={i} className="flex-1 rounded-full transition-all"
                  style={{
                    height: 3,
                    background: i < gameIdx
                      ? DOMAIN_COLORS[d].primary
                      : i === gameIdx
                        ? DOMAIN_COLORS[d].primary + '70'
                        : '#1F2937',
                  }} />
              ))}
            </div>
            <p className="text-xs" style={{ color: '#6B7280' }}>
              Assessment · Stage {gameIdx + 1} of {plan.length} · {DOMAIN_LABELS[domain]}
            </p>
          </div>
        ) : (
          /* Normal session: simple segment bar */
          <div className="flex-1 flex gap-1.5">
            {plan.map((d, i) => (
              <div key={i} className="flex-1 rounded-full transition-all"
                style={{
                  height: 2,
                  background: i < gameIdx
                    ? DOMAIN_COLORS[d].primary
                    : i === gameIdx
                      ? DOMAIN_COLORS[d].primary + '60'
                      : '#1F2937',
                }} />
            ))}
          </div>
        )}

        <span className="text-xs" style={{ color: '#4B5563' }}>{gameIdx + 1}/{plan.length}</span>
      </div>

      {/* Domain label */}
      {phase === 'playing' && (
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-xl"
            style={{ background: dc.primary + '18', border: `1px solid ${dc.primary}30` }}>
            <Icon size={16} style={{ color: dc.primary }} />
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: dc.light }}>
              {DOMAIN_LABELS[domain]} · Level {difficulty}
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{DOMAIN_SCIENCE[domain]}</p>
          </div>
        </div>
      )}

      <div className="flex-1 flex items-center justify-center">
        {phase === 'playing' ? (
          <GameComponent
            key={`${gameIdx}-${domain}`}
            domain={domain}
            difficulty={difficulty}
            onComplete={handleGameComplete}
          />
        ) : phase === 'transition' ? (
          /* Assessment narrative transition — auto-advances after 2s */
          <div className="text-center px-6">
            <p className="text-2xl font-semibold leading-snug" style={{ color: '#F9FAFB' }}>
              {transitionMsg}
            </p>
            <div className="flex justify-center gap-1.5 mt-8">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full"
                  style={{ background: i === 0 ? dc.light : '#1F2937', animation: 'pulse 1s ease-in-out infinite' }} />
              ))}
            </div>
          </div>
        ) : (
          <ScoreScreen
            domain={domain}
            score={currentScore}
            lastScore={getLastScore(domain)}
            metrics={currentMetrics ?? undefined}
            ageGroup={ageGroup}
            isLast={gameIdx + 1 >= plan.length}
            onNext={handleNext}
          />
        )}
      </div>
    </div>
  )
}
