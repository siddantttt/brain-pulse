import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import MemoryGame from '../components/games/MemoryGame'
import LogicGame from '../components/games/LogicGame'
import { PulseIcon, FocusIcon, MemoryIcon, LogicIcon, ArrowRightIcon } from '../components/Icons'
import type { Domain } from '../types'

type Screen = 'goal' | 'game' | 'auth'
type TapState = 'waiting' | 'ready' | 'tapped' | 'early'

const GOALS = [
  { domain: 'focus' as Domain,  Icon: FocusIcon,  label: 'Sharper Focus',     desc: 'Improve concentration & attention span' },
  { domain: 'memory' as Domain, Icon: MemoryIcon, label: 'Better Memory',      desc: 'Retain more, recall faster' },
  { domain: 'logic' as Domain,  Icon: LogicIcon,  label: 'Overall Sharpness',  desc: 'Boost all-round mental performance' },
]

const GAME_META: Record<Domain, { title: string; subtitle: string; science: string }> = {
  focus:  { title: 'Reaction speed test', subtitle: '5 rounds · ~15 seconds',  science: 'Continuous Performance Test · inhibitory control' },
  memory: { title: 'Memory match',        subtitle: 'Flip & match card pairs',  science: 'Paired-associate learning · visual working memory' },
  logic:  { title: 'Pattern recognition', subtitle: '5 sequence puzzles',       science: "Raven's Progressive Matrices · fluid intelligence" },
  visual: { title: 'Spatial recall',      subtitle: '5 rounds',                 science: 'Corsi Block Test · visuospatial memory' },
  math:   { title: 'Speed math',          subtitle: '45 seconds',               science: 'Numerical cognition training' },
}

const ROUNDS = 5

function ReactionTest({ onComplete }: { onComplete: (score: number) => void }) {
  const [round, setRound] = useState(0)
  const [state, setState] = useState<TapState>('waiting')
  const [times, setTimes] = useState<number[]>([])
  const startRef = useRef<number>(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (round >= ROUNDS) {
      const avg = times.reduce((a, b) => a + b, 0) / times.length
      onComplete(Math.max(10, Math.min(100, Math.round(100 - ((avg - 200) / 400) * 60))))
      return
    }
    setState('waiting')
    const delay = 1200 + Math.random() * 2000
    timerRef.current = setTimeout(() => { setState('ready'); startRef.current = Date.now() }, delay)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [round])

  function handleTap() {
    if (state === 'waiting') {
      if (timerRef.current) clearTimeout(timerRef.current)
      setState('early')
      setTimeout(() => setRound(r => r + 1), 800)
    } else if (state === 'ready') {
      setTimes(prev => [...prev, Date.now() - startRef.current])
      setState('tapped')
      setTimeout(() => setRound(r => r + 1), 600)
    }
  }

  if (round >= ROUNDS) return <div className="text-sm text-center" style={{ color: '#444' }}>Calculating…</div>

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex gap-1.5">
        {Array.from({ length: ROUNDS }).map((_, i) => (
          <div key={i} className="w-8 rounded-full transition-all" style={{
            height: 2,
            background: i < round ? '#4f9eff' : i === round ? 'rgba(79,158,255,0.4)' : '#1e1e1e'
          }} />
        ))}
      </div>
      <button onClick={handleTap}
        className="w-44 h-44 rounded-full flex flex-col items-center justify-center transition-all duration-150 select-none"
        style={{
          background: state === 'ready' ? '#4f9eff' : state === 'tapped' ? 'rgba(79,158,255,0.15)' : state === 'early' ? 'rgba(255,85,85,0.1)' : '#111',
          border: `2px solid ${state === 'ready' ? '#4f9eff' : state === 'tapped' ? 'rgba(79,158,255,0.3)' : state === 'early' ? 'rgba(255,85,85,0.3)' : '#1e1e1e'}`,
          transform: state === 'ready' ? 'scale(1.05)' : 'scale(1)',
          boxShadow: state === 'ready' ? '0 0 40px rgba(79,158,255,0.25)' : 'none',
        }}>
        {state === 'waiting' && <span className="text-sm" style={{ color: '#444' }}>wait…</span>}
        {state === 'ready' && <span className="text-base font-bold" style={{ color: '#03060f' }}>TAP</span>}
        {state === 'tapped' && <><span className="text-xl font-bold" style={{ color: '#4f9eff' }}>{times[times.length - 1]}ms</span><span className="text-xs mt-1" style={{ color: '#555' }}>good</span></>}
        {state === 'early' && <span className="text-sm" style={{ color: '#ff5555' }}>too early</span>}
      </button>
      <p className="text-sm" style={{ color: '#444' }}>
        {state === 'waiting' ? 'Wait for the circle to light up' : 'Tap as fast as you can'}
      </p>
    </div>
  )
}

function BaselineGame({ domain, onComplete }: { domain: Domain; onComplete: (s: number) => void }) {
  switch (domain) {
    case 'focus':  return <ReactionTest onComplete={onComplete} />
    case 'memory': return <MemoryGame difficulty={2} onComplete={onComplete} />
    case 'logic':  return <LogicGame difficulty={2} onComplete={onComplete} />
    default:       return <ReactionTest onComplete={onComplete} />
  }
}

const inputStyle = {
  background: '#111', border: '1px solid #1e1e1e', borderRadius: 12,
  color: '#f0f0f0', padding: '12px 16px', width: '100%', outline: 'none', fontSize: 15,
}

export default function Onboarding() {
  const navigate = useNavigate()
  const { signIn, signUp, signInWithGoogle } = useAuth()

  const [screen, setScreen] = useState<Screen>('goal')
  const [goal, setGoal] = useState<Domain | null>(null)
  const [gameScore, setGameScore] = useState<number | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isSignUp) await signUp(email, password)
      else await signIn(email, password)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('user_profiles').upsert({ id: user.id, goal: goal ?? 'memory', onboarding_done: true })
        if (gameScore !== null) {
          await supabase.from('game_sessions').insert({ user_id: user.id, domain: goal ?? 'focus', score: gameScore, difficulty: 2 })
        }
      }
      navigate('/home')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setLoading(true)
    try { await signInWithGoogle() }
    catch (err: unknown) { setError(err instanceof Error ? err.message : 'Failed'); setLoading(false) }
  }

  const gameMeta = GAME_META[goal ?? 'focus']

  // Screen 1 — Goal
  if (screen === 'goal') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="max-w-sm w-full">
          <div className="flex items-center gap-2 mb-10">
            <PulseIcon size={15} style={{ color: '#4f9eff' }} />
            <span className="font-semibold tracking-tight text-sm">Brain Pulse</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">What do you want to improve?</h1>
          <p className="text-sm mb-8" style={{ color: '#555' }}>We'll build your session around this.</p>
          <div className="flex flex-col gap-2">
            {GOALS.map(({ domain, Icon, label, desc }) => (
              <button key={domain} onClick={() => { setGoal(domain); setScreen('game') }}
                className="flex items-center gap-4 p-4 rounded-2xl text-left transition-all group"
                style={{ background: '#111', border: '1px solid #1e1e1e' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(79,158,255,0.25)'; e.currentTarget.style.background = 'rgba(79,158,255,0.04)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e1e1e'; e.currentTarget.style.background = '#111' }}>
                <div className="p-2.5 rounded-xl shrink-0" style={{ background: '#1a1a1a' }}>
                  <Icon size={16} style={{ color: '#555' }} />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{label}</div>
                  <div className="text-xs mt-0.5" style={{ color: '#444' }}>{desc}</div>
                </div>
                <ArrowRightIcon size={14} style={{ color: '#333' }} />
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Screen 2 — Baseline game
  if (screen === 'game') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="max-w-sm w-full flex flex-col items-center gap-8">
          {gameScore === null ? (
            <>
              <div className="text-center w-full">
                <p className="text-xs uppercase tracking-widest mb-2" style={{ color: '#444' }}>Step 2 of 3 · Baseline</p>
                <h2 className="text-xl font-bold tracking-tight">{gameMeta.title}</h2>
                <p className="text-sm mt-1" style={{ color: '#555' }}>{gameMeta.subtitle}</p>
                <p className="text-xs mt-0.5" style={{ color: '#333' }}>{gameMeta.science}</p>
              </div>
              <BaselineGame domain={goal ?? 'focus'} onComplete={setGameScore} />
            </>
          ) : (
            <div className="flex flex-col items-center gap-6 text-center w-full">
              <div>
                <p className="text-xs uppercase tracking-widest mb-3" style={{ color: '#444' }}>Your {goal} baseline</p>
                <div className="text-7xl font-bold tracking-tight">{Math.round(gameScore)}</div>
                <p className="text-sm mt-1" style={{ color: '#444' }}>out of 100</p>
              </div>
              <div className="w-full rounded-full overflow-hidden" style={{ height: 2, background: '#1e1e1e', maxWidth: 240 }}>
                <div className="h-full rounded-full" style={{ width: `${gameScore}%`, background: '#4f9eff' }} />
              </div>
              <p className="text-sm" style={{ color: '#555' }}>Create your account to save this and track your progress.</p>
              <button onClick={() => setScreen('auth')} className="btn-primary w-full max-w-xs py-3.5 flex items-center justify-center gap-2">
                Save my results <ArrowRightIcon size={15} />
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Screen 3 — Auth
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="max-w-sm w-full">
        <div className="flex items-center gap-2 mb-8">
          <PulseIcon size={15} style={{ color: '#4f9eff' }} />
          <span className="font-semibold tracking-tight text-sm">Brain Pulse</span>
        </div>
        <p className="text-xs uppercase tracking-widest mb-2" style={{ color: '#444' }}>Step 3 of 3</p>
        <h2 className="text-2xl font-bold tracking-tight mb-1">{isSignUp ? 'Create your account' : 'Welcome back'}</h2>
        <p className="text-sm mb-8" style={{ color: '#555' }}>Your baseline score will be saved automatically.</p>

        <form onSubmit={handleAuth} className="flex flex-col gap-3">
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} required />
          <input type="password" placeholder="Password (min 6 characters)" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} required minLength={6} />
          {error && <p className="text-sm text-center" style={{ color: '#ff5555' }}>{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary py-3 w-full mt-1">
            {loading ? '…' : isSignUp ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px" style={{ background: '#1e1e1e' }} />
          <span className="text-xs" style={{ color: '#333' }}>or</span>
          <div className="flex-1 h-px" style={{ background: '#1e1e1e' }} />
        </div>

        <button onClick={handleGoogle} disabled={loading} className="btn-ghost py-3 w-full flex items-center justify-center gap-2.5 text-sm">
          <svg width="16" height="16" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
            <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
            <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
            <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.31z"/>
          </svg>
          Continue with Google
        </button>

        <p className="text-center text-sm mt-6" style={{ color: '#444' }}>
          {isSignUp ? 'Already have an account? ' : 'New here? '}
          <button onClick={() => setIsSignUp(!isSignUp)} style={{ color: '#4f9eff' }}>
            {isSignUp ? 'Sign in' : 'Sign up'}
          </button>
        </p>
      </div>
    </div>
  )
}
