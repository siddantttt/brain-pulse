import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import type { Domain } from '../types'

type Screen = 'goal' | 'game' | 'auth'
type TapState = 'waiting' | 'ready' | 'tapped' | 'early'

const GOALS = [
  { domain: 'focus' as Domain, label: 'Sharper Focus', desc: 'Improve concentration & attention span', icon: '🎯' },
  { domain: 'memory' as Domain, label: 'Better Memory', desc: 'Retain more, recall faster', icon: '🧠' },
  { domain: 'logic' as Domain, label: 'Overall Sharpness', desc: 'Boost all-round mental performance', icon: '⚡' },
]

const ROUNDS = 5

// Fast inline reaction-time game — done in ~15 seconds
function ReactionTest({ onComplete }: { onComplete: (score: number) => void }) {
  const [round, setRound] = useState(0)
  const [state, setState] = useState<TapState>('waiting')
  const [times, setTimes] = useState<number[]>([])
  const startRef = useRef<number>(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (round >= ROUNDS) {
      const avg = times.reduce((a, b) => a + b, 0) / times.length
      // avg ~200ms = 100pts, avg ~600ms = 40pts
      const score = Math.max(10, Math.min(100, Math.round(100 - ((avg - 200) / 400) * 60)))
      onComplete(score)
      return
    }
    setState('waiting')
    const delay = 1200 + Math.random() * 2000
    timerRef.current = setTimeout(() => {
      setState('ready')
      startRef.current = Date.now()
    }, delay)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [round])

  function handleTap() {
    if (state === 'waiting') {
      if (timerRef.current) clearTimeout(timerRef.current)
      setState('early')
      setTimeout(() => setRound(r => r + 1), 800)
    } else if (state === 'ready') {
      const ms = Date.now() - startRef.current
      setTimes(prev => [...prev, ms])
      setState('tapped')
      setTimeout(() => setRound(r => r + 1), 600)
    }
  }

  if (round >= ROUNDS) {
    return <div className="text-white/40 text-center">Calculating…</div>
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex gap-1.5">
        {Array.from({ length: ROUNDS }).map((_, i) => (
          <div key={i} className={`w-8 h-1.5 rounded-full ${i < round ? 'bg-indigo-500' : i === round ? 'bg-indigo-300' : 'bg-white/10'}`} />
        ))}
      </div>

      <button
        onClick={handleTap}
        className={`w-48 h-48 rounded-full flex flex-col items-center justify-center transition-all duration-150 select-none
          ${state === 'waiting' ? 'bg-white/5 border-2 border-white/10 cursor-default scale-95' :
            state === 'ready' ? 'bg-indigo-500 border-2 border-indigo-300 scale-100 shadow-lg shadow-indigo-500/40 cursor-pointer' :
            state === 'tapped' ? 'bg-emerald-500 border-2 border-emerald-300 scale-95 cursor-default' :
            'bg-red-500/30 border-2 border-red-400/50 scale-95 cursor-default'}`}
      >
        {state === 'waiting' && <span className="text-white/30 text-sm">wait…</span>}
        {state === 'ready' && <span className="text-white text-lg font-bold">TAP!</span>}
        {state === 'tapped' && (
          <>
            <span className="text-white text-2xl font-bold">{times[times.length - 1]}ms</span>
            <span className="text-white/60 text-xs mt-1">nice</span>
          </>
        )}
        {state === 'early' && <span className="text-red-300 text-sm">too early</span>}
      </button>

      <p className="text-white/30 text-sm">
        {state === 'waiting' ? 'Wait for the circle to turn purple…' : 'Tap as fast as you can!'}
      </p>
    </div>
  )
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

  function handleGoalSelect(domain: Domain) {
    setGoal(domain)
    setScreen('game')
  }

  function handleGameComplete(score: number) {
    setGameScore(score)
  }

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isSignUp) {
        await signUp(email, password)
      } else {
        await signIn(email, password)
      }
      await saveOnboardingData()
      navigate('/home')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setLoading(true)
    try {
      await signInWithGoogle()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed')
      setLoading(false)
    }
  }

  async function saveOnboardingData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('user_profiles').upsert({
      id: user.id,
      goal: goal ?? 'memory',
      onboarding_done: true,
    })
    if (gameScore !== null) {
      await supabase.from('game_sessions').insert({
        user_id: user.id,
        domain: 'focus',
        score: gameScore,
        difficulty: 1,
      })
    }
  }

  // Screen 1
  if (screen === 'goal') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="text-center mb-10">
            <div className="text-4xl mb-3">🧠</div>
            <h1 className="text-3xl font-bold text-white">Brain Pulse</h1>
            <p className="text-white/50 mt-2">What do you want to improve?</p>
          </div>
          <div className="flex flex-col gap-3">
            {GOALS.map(g => (
              <button
                key={g.domain}
                onClick={() => handleGoalSelect(g.domain)}
                className="flex items-center gap-4 p-5 bg-white/5 hover:bg-indigo-500/10 border border-white/10 hover:border-indigo-500/50 rounded-2xl transition-all text-left group"
              >
                <span className="text-3xl">{g.icon}</span>
                <div>
                  <div className="text-white font-semibold group-hover:text-indigo-300 transition-colors">{g.label}</div>
                  <div className="text-white/40 text-sm mt-0.5">{g.desc}</div>
                </div>
                <div className="ml-auto text-white/20 group-hover:text-indigo-400 transition-colors">→</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Screen 2
  if (screen === 'game') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full flex flex-col items-center gap-8">
          {gameScore === null ? (
            <>
              <div className="text-center">
                <p className="text-white/50 text-sm uppercase tracking-widest mb-1">Step 2 of 3</p>
                <h2 className="text-2xl font-bold text-white">Reaction speed test</h2>
                <p className="text-white/40 text-sm mt-1">5 rounds · ~15 seconds</p>
              </div>
              <ReactionTest onComplete={handleGameComplete} />
            </>
          ) : (
            <div className="flex flex-col items-center gap-8 text-center">
              <div>
                <p className="text-white/50 text-sm uppercase tracking-widest mb-2">Your focus baseline</p>
                <div className="text-6xl font-bold text-white">{Math.round(gameScore)}</div>
                <div className="text-white/40 text-sm mt-1">out of 100</div>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2 max-w-xs">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                  style={{ width: `${gameScore}%` }}
                />
              </div>
              <p className="text-white/50 text-sm">Create your account to save your results.</p>
              <button
                onClick={() => setScreen('auth')}
                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold text-white transition-colors w-full max-w-xs"
              >
                Save my results →
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Screen 3
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <p className="text-white/50 text-sm uppercase tracking-widest mb-1">Step 3 of 3</p>
          <h2 className="text-2xl font-bold text-white">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h2>
        </div>

        <form onSubmit={handleAuth} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 transition-colors"
            required
          />
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 transition-colors"
            required
            minLength={6}
          />
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl font-semibold text-white transition-colors mt-1"
          >
            {loading ? '…' : isSignUp ? 'Create account & start' : 'Sign in'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-white/30 text-sm">or</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-medium text-white transition-colors flex items-center justify-center gap-2"
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
            <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
            <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
            <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.31z"/>
          </svg>
          Continue with Google
        </button>

        <p className="text-center text-white/30 text-sm mt-4">
          {isSignUp ? 'Already have an account? ' : 'New here? '}
          <button onClick={() => setIsSignUp(!isSignUp)} className="text-indigo-400 hover:text-indigo-300">
            {isSignUp ? 'Sign in' : 'Sign up'}
          </button>
        </p>
      </div>
    </div>
  )
}
