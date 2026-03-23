import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useGameSessions } from '../hooks/useGameSessions'
import MemoryGame from '../components/games/MemoryGame'
import FocusGame from '../components/games/FocusGame'
import LogicGame from '../components/games/LogicGame'
import VisualGame from '../components/games/VisualGame'
import MathGame from '../components/games/MathGame'
import ScoreScreen from '../components/ScoreScreen'
import { CloseIcon, FocusIcon, MemoryIcon, LogicIcon, VisualIcon, MathIcon } from '../components/Icons'
import type { Domain } from '../types'
import { DOMAIN_LABELS } from '../types'

const DOMAIN_ICONS = { focus: FocusIcon, memory: MemoryIcon, logic: LogicIcon, visual: VisualIcon, math: MathIcon }

const DOMAIN_SCIENCE: Record<Domain, string> = {
  focus:  'Continuous Performance Test · inhibitory control',
  memory: 'Paired-associate learning · episodic memory',
  logic:  "Raven's Progressive Matrices · fluid intelligence",
  visual: 'Corsi Block Test · visuospatial working memory',
  math:   'Numerical cognition · intraparietal sulcus',
}

function GameComponent({ domain, difficulty, onComplete }: { domain: Domain; difficulty: number; onComplete: (s: number) => void }) {
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
  const Icon = DOMAIN_ICONS[domain]

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

      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <button onClick={() => navigate('/home')} style={{ color: '#333' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#666')}
          onMouseLeave={e => (e.currentTarget.style.color = '#333')}>
          <CloseIcon size={18} />
        </button>
        <div className="flex-1 flex gap-1.5">
          {plan.map((_, i) => (
            <div key={i} className="flex-1 rounded-full transition-all"
              style={{ height: 2, background: i < gameIdx ? '#4f9eff' : i === gameIdx ? 'rgba(79,158,255,0.4)' : '#1e1e1e' }} />
          ))}
        </div>
        <span className="text-xs" style={{ color: '#333' }}>{gameIdx + 1}/{plan.length}</span>
      </div>

      {/* Domain label */}
      {phase === 'playing' && (
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-xl" style={{ background: 'rgba(79,158,255,0.08)', border: '1px solid rgba(79,158,255,0.12)' }}>
            <Icon size={16} style={{ color: '#4f9eff' }} />
          </div>
          <div>
            <p className="font-semibold text-sm">{DOMAIN_LABELS[domain]} · Level {difficulty}</p>
            <p className="text-xs mt-0.5" style={{ color: '#444' }}>{DOMAIN_SCIENCE[domain]}</p>
          </div>
        </div>
      )}

      <div className="flex-1 flex items-center justify-center">
        {phase === 'playing' ? (
          <GameComponent key={`${gameIdx}-${domain}`} domain={domain} difficulty={difficulty} onComplete={handleGameComplete} />
        ) : (
          <ScoreScreen domain={domain} score={currentScore} lastScore={getLastScore(domain)}
            isLast={gameIdx + 1 >= plan.length} onNext={handleNext} />
        )}
      </div>
    </div>
  )
}
