import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useGameSessions } from '../hooks/useGameSessions'
import MemoryGame from '../components/games/MemoryGame'
import FocusGame from '../components/games/FocusGame'
import LogicGame from '../components/games/LogicGame'
import VisualGame from '../components/games/VisualGame'
import MathGame from '../components/games/MathGame'
import ScoreScreen from '../components/ScoreScreen'
import type { Domain } from '../types'
import { DOMAIN_LABELS } from '../types'

const DOMAIN_ICONS: Record<Domain, string> = {
  focus: '🎯',
  memory: '🧠',
  logic: '⚡',
  visual: '👁',
  math: '🔢',
}

const DOMAIN_SCIENCE: Record<Domain, string> = {
  focus: 'Continuous Performance Test · inhibitory control',
  memory: 'Paired-associate learning · episodic memory',
  logic: "Raven's Progressive Matrices · fluid intelligence",
  visual: 'Corsi Block Test · visuospatial working memory',
  math: 'Numerical cognition · intraparietal sulcus training',
}

function GameComponent({
  domain,
  difficulty,
  onComplete,
}: {
  domain: Domain
  difficulty: number
  onComplete: (score: number) => void
}) {
  switch (domain) {
    case 'memory': return <MemoryGame difficulty={difficulty} onComplete={onComplete} />
    case 'focus':  return <FocusGame  difficulty={difficulty} onComplete={onComplete} />
    case 'logic':  return <LogicGame  difficulty={difficulty} onComplete={onComplete} />
    case 'visual': return <VisualGame difficulty={difficulty} onComplete={onComplete} />
    case 'math':   return <MathGame   difficulty={difficulty} onComplete={onComplete} />
  }
}

export default function Session() {
  const navigate = useNavigate()
  const location = useLocation()
  const { saveSession, computeDifficulty, getLastScore } = useGameSessions()

  const plan: Domain[] = location.state?.plan ?? ['memory', 'focus', 'logic']

  const [gameIdx, setGameIdx] = useState(0)
  const [phase, setPhase] = useState<'playing' | 'score'>('playing')
  const [currentScore, setCurrentScore] = useState(0)
  const [results, setResults] = useState<Array<{ domain: Domain; score: number; difficulty: number }>>([])

  const domain = plan[gameIdx]
  const difficulty = computeDifficulty(domain)

  async function handleGameComplete(score: number) {
    setCurrentScore(score)
    setPhase('score')
    await saveSession(domain, score, difficulty)
    setResults(prev => [...prev, { domain, score, difficulty }])
  }

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
      {/* Progress header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate('/home')}
          className="text-white/30 hover:text-white/60 transition-colors"
        >
          ✕
        </button>
        <div className="flex-1">
          <div className="flex gap-1.5">
            {plan.map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-1.5 rounded-full transition-colors ${
                  i < gameIdx ? 'bg-indigo-500' :
                  i === gameIdx ? 'bg-indigo-300' : 'bg-white/10'
                }`}
              />
            ))}
          </div>
        </div>
        <span className="text-white/40 text-sm">{gameIdx + 1}/{plan.length}</span>
      </div>

      {/* Game label */}
      {phase === 'playing' && (
        <div className="text-center mb-6">
          <span className="text-2xl">{DOMAIN_ICONS[domain]}</span>
          <p className="text-white font-medium mt-1">{DOMAIN_LABELS[domain]} · Level {difficulty}</p>
          <p className="text-white/30 text-xs mt-0.5">{DOMAIN_SCIENCE[domain]}</p>
        </div>
      )}

      {/* Game or Score */}
      <div className="flex-1 flex items-center justify-center">
        {phase === 'playing' ? (
          <GameComponent domain={domain} difficulty={difficulty} onComplete={handleGameComplete} />
        ) : (
          <ScoreScreen
            domain={domain}
            score={currentScore}
            lastScore={getLastScore(domain)}
            isLast={gameIdx + 1 >= plan.length}
            onNext={handleNext}
          />
        )}
      </div>
    </div>
  )
}
