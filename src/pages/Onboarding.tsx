import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import MemoryGame from '../components/games/MemoryGame'
import LogicGame from '../components/games/LogicGame'
import { PulseIcon, FocusIcon, MemoryIcon, LogicIcon, ArrowRightIcon } from '../components/Icons'
import type { Domain } from '../types'
import { DOMAIN_COLORS } from '../types'

type Screen = 'welcome' | 'age' | 'goal' | 'game' | 'auth'
type TapState = 'waiting' | 'ready' | 'tapped' | 'early'

const GOALS = [
  { domain: 'focus' as Domain,  Icon: FocusIcon,  label: 'Sharper Focus',    desc: 'Improve concentration & attention span' },
  { domain: 'memory' as Domain, Icon: MemoryIcon, label: 'Better Memory',     desc: 'Retain more, recall faster' },
  { domain: 'logic' as Domain,  Icon: LogicIcon,  label: 'Overall Sharpness', desc: 'Boost all-round mental performance' },
]

const GAME_META: Record<Domain, { title: string; subtitle: string; science: string }> = {
  focus:       { title: 'Reaction speed test', subtitle: '5 rounds · ~15 seconds',  science: 'Continuous Performance Test · inhibitory control' },
  memory:      { title: 'Memory match',        subtitle: 'Flip & match card pairs',  science: 'Paired-associate learning · visual working memory' },
  logic:       { title: 'Pattern recognition', subtitle: '5 sequence puzzles',       science: "Raven's Progressive Matrices · fluid intelligence" },
  visual:      { title: 'Spatial recall',      subtitle: '5 rounds',                 science: 'Corsi Block Test · visuospatial memory' },
  math:        { title: 'Speed math',          subtitle: '45 seconds',               science: 'Numerical cognition training' },
  flexibility: { title: 'Rule shift',          subtitle: '16 cards',                 science: 'Wisconsin Card Sorting Test · cognitive flexibility' },
}

function ageGroupLine(n: number): string {
  if (n >= 13 && n <= 17) return "We'll keep things fast and fun"
  if (n >= 18 && n <= 25) return "We'll push your limits"
  if (n >= 26 && n <= 40) return "We'll fit into your busy life"
  if (n >= 41 && n <= 60) return "We'll keep your mind sharp"
  if (n > 60)             return "We'll celebrate every win"
  return ''
}

function ageGroupKey(n: number): string {
  if (n >= 13 && n <= 17) return 'teen'
  if (n >= 18 && n <= 25) return 'young_adult'
  if (n >= 26 && n <= 40) return 'adult'
  if (n >= 41 && n <= 60) return 'midlife'
  if (n > 60)             return 'senior'
  return ''
}

const ROUNDS = 5

function ReactionTest({ onComplete, themeColor }: { onComplete: (score: number) => void; themeColor: string }) {
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

  if (round >= ROUNDS) return <div className="text-sm text-center" style={{ color: '#6B7280' }}>Calculating…</div>

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex gap-1.5">
        {Array.from({ length: ROUNDS }).map((_, i) => (
          <div key={i} className="w-8 rounded-full transition-all" style={{
            height: 2,
            background: i < round ? themeColor : i === round ? themeColor + '60' : '#1F2937'
          }} />
        ))}
      </div>
      <button onClick={handleTap}
        className="w-44 h-44 rounded-full flex flex-col items-center justify-center transition-all duration-150 select-none"
        style={{
          background: state === 'ready' ? themeColor : state === 'tapped' ? themeColor + '25' : state === 'early' ? 'rgba(220,38,38,0.1)' : '#111827',
          border: `2px solid ${state === 'ready' ? themeColor : state === 'tapped' ? themeColor + '50' : state === 'early' ? 'rgba(220,38,38,0.3)' : '#1F2937'}`,
          transform: state === 'ready' ? 'scale(1.05)' : 'scale(1)',
          boxShadow: state === 'ready' ? `0 0 40px ${themeColor}40` : 'none',
        }}>
        {state === 'waiting' && <span className="text-sm" style={{ color: '#6B7280' }}>wait…</span>}
        {state === 'ready' && <span className="text-base font-bold" style={{ color: '#ffffff' }}>TAP</span>}
        {state === 'tapped' && <><span className="text-xl font-bold" style={{ color: themeColor }}>{times[times.length - 1]}ms</span><span className="text-xs mt-1" style={{ color: '#6B7280' }}>good</span></>}
        {state === 'early' && <span className="text-sm" style={{ color: '#FCA5A5' }}>too early</span>}
      </button>
      <p className="text-sm" style={{ color: '#6B7280' }}>
        {state === 'waiting' ? 'Wait for the circle to light up' : 'Tap as fast as you can'}
      </p>
    </div>
  )
}

function BaselineGame({ domain, onComplete, themeColor }: { domain: Domain; onComplete: (s: number) => void; themeColor: string }) {
  const wrap = (score: number, _metrics: unknown) => onComplete(score)
  switch (domain) {
    case 'focus':  return <ReactionTest onComplete={onComplete} themeColor={themeColor} />
    case 'memory': return <MemoryGame difficulty={2} onComplete={wrap} />
    case 'logic':  return <LogicGame difficulty={2} onComplete={wrap} />
    default:       return <ReactionTest onComplete={onComplete} themeColor={themeColor} />
  }
}

const inputStyle = {
  background: '#111827', border: '1px solid #1F2937', borderRadius: 12,
  color: '#F9FAFB', padding: '12px 16px', width: '100%', outline: 'none', fontSize: 15,
}

export default function Onboarding() {
  const navigate = useNavigate()
  const { signIn, signUp, signInWithGoogle } = useAuth()

  const [screen, setScreen] = useState<Screen>('welcome')
  const [goal, setGoal] = useState<Domain | null>(null)
  const [gameScore, setGameScore] = useState<number | null>(null)
  const [age, setAge] = useState('')
  const [ageGroup, setAgeGroup] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Glow pulse animation state for welcome screen
  const [glowPulse, setGlowPulse] = useState(false)
  useEffect(() => {
    if (screen !== 'welcome') return
    const t = setTimeout(() => setGlowPulse(true), 100)
    return () => clearTimeout(t)
  }, [screen])

  const themeColor = goal ? DOMAIN_COLORS[goal].primary : '#1B4FD8'
  const themeLight = goal ? DOMAIN_COLORS[goal].light : '#93C5FD'

  const ageNum = parseInt(age)
  const ageValid = !isNaN(ageNum) && ageNum >= 10 && ageNum <= 100
  const ageLine = ageValid ? ageGroupLine(ageNum) : ''

  function handleAgeContinue() {
    setAgeGroup(ageGroupKey(ageNum))
    setScreen('goal')
  }

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isSignUp) await signUp(email, password)
      else await signIn(email, password)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('user_profiles').upsert({
          id: user.id,
          goal: goal ?? 'memory',
          onboarding_done: true,
          age: ageValid ? ageNum : null,
          age_group: ageGroup || null,
        })
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

  // ── Screen: welcome ──────────────────────────────────────────────────────
  if (screen === 'welcome') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6"
        style={{
          background: '#0A0F1E',
          transition: 'background 1s ease',
        }}>
        {/* Animated radial glow */}
        <div style={{
          position: 'fixed', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 700px 400px at 50% 40%, rgba(27,79,216,0.13) 0%, transparent 70%)',
          opacity: glowPulse ? 1 : 0,
          transition: 'opacity 1.8s ease',
        }} />
        <div className="max-w-sm w-full text-center relative">
          <div className="flex items-center justify-center gap-2 mb-14"
            style={{ opacity: glowPulse ? 1 : 0, transition: 'opacity 0.8s ease 0.2s' }}>
            <PulseIcon size={16} style={{ color: '#1B4FD8' }} />
            <span className="font-semibold tracking-tight text-sm" style={{ color: '#6B7280' }}>BRAIN PULSE</span>
          </div>
          <h1 className="font-bold tracking-tight mb-5"
            style={{
              fontSize: 'clamp(28px, 6vw, 40px)',
              lineHeight: 1.15,
              color: '#F9FAFB',
              opacity: glowPulse ? 1 : 0,
              transform: glowPulse ? 'translateY(0)' : 'translateY(10px)',
              transition: 'opacity 0.7s ease 0.4s, transform 0.7s ease 0.4s',
            }}>
            Your brain is unique.<br />
            <span style={{ color: '#93C5FD' }}>Your plan should be too.</span>
          </h1>
          <p className="text-sm mb-12" style={{
            color: '#4B5563',
            opacity: glowPulse ? 1 : 0,
            transition: 'opacity 0.7s ease 0.6s',
          }}>
            Five cognitive domains. Twelve minutes a day.<br />Scores tied to clinical neuroscience assessments.
          </p>
          <button onClick={() => setScreen('age')}
            className="btn-primary px-10 py-3.5 flex items-center gap-2 mx-auto"
            style={{
              opacity: glowPulse ? 1 : 0,
              transform: glowPulse ? 'translateY(0)' : 'translateY(6px)',
              transition: 'opacity 0.6s ease 0.9s, transform 0.6s ease 0.9s',
            }}>
            Get Started <ArrowRightIcon size={15} />
          </button>
          <p className="text-xs mt-4" style={{
            color: '#1F2937',
            opacity: glowPulse ? 1 : 0,
            transition: 'opacity 0.6s ease 1.1s',
          }}>
            No card required
          </p>
        </div>
      </div>
    )
  }

  // ── Screen: age ───────────────────────────────────────────────────────────
  if (screen === 'age') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6"
        style={{ background: '#0A0F1E' }}>
        <div className="max-w-sm w-full">
          <div className="flex items-center gap-2 mb-10">
            <PulseIcon size={15} style={{ color: '#1B4FD8' }} />
            <span className="font-semibold tracking-tight text-sm" style={{ color: '#6B7280' }}>BRAIN PULSE</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">First, how old are you?</h1>
          <p className="text-sm mb-8" style={{ color: '#6B7280' }}>
            We tailor the experience to your stage of life.
          </p>

          {/* Large number input */}
          <div className="mb-2">
            <input
              type="number"
              inputMode="numeric"
              placeholder="Enter your age"
              value={age}
              onChange={e => setAge(e.target.value)}
              min={10} max={100}
              autoFocus
              style={{
                ...inputStyle,
                fontSize: 32,
                fontWeight: 700,
                padding: '16px 20px',
                letterSpacing: '-0.5px',
                textAlign: 'center',
                MozAppearance: 'textfield',
              }}
            />
          </div>

          {/* Reactive line */}
          <div className="mb-8" style={{ minHeight: 24 }}>
            <p className="text-sm text-center transition-all duration-300"
              style={{ color: ageValid ? '#93C5FD' : 'transparent' }}>
              {ageLine || '‎'}
            </p>
          </div>

          <button
            onClick={handleAgeContinue}
            disabled={!ageValid}
            className="btn-primary w-full py-3.5"
            style={{ opacity: ageValid ? 1 : 0.3, transition: 'opacity 0.2s ease' }}>
            Continue
          </button>
        </div>
      </div>
    )
  }

  // ── Screen: goal ──────────────────────────────────────────────────────────
  if (screen === 'goal') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="max-w-sm w-full">
          <div className="flex items-center gap-2 mb-10">
            <PulseIcon size={15} style={{ color: '#1B4FD8' }} />
            <span className="font-semibold tracking-tight text-sm">Brain Pulse</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">What do you want to improve?</h1>
          <p className="text-sm mb-8" style={{ color: '#9CA3AF' }}>We'll build your session around this.</p>
          <div className="flex flex-col gap-2">
            {GOALS.map(({ domain, Icon, label, desc }) => {
              const dc = DOMAIN_COLORS[domain]
              return (
                <button key={domain} onClick={() => { setGoal(domain); setScreen('game') }}
                  className="flex items-center gap-4 p-4 rounded-2xl text-left transition-all"
                  style={{ background: '#111827', border: '1px solid #1F2937' }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = dc.primary + '60'
                    e.currentTarget.style.background = dc.primary + '0D'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#1F2937'
                    e.currentTarget.style.background = '#111827'
                  }}>
                  <div className="p-2.5 rounded-xl shrink-0" style={{ background: '#1F2937' }}>
                    <Icon size={16} style={{ color: dc.primary }} />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{label}</div>
                    <div className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{desc}</div>
                  </div>
                  <ArrowRightIcon size={14} style={{ color: '#4B5563' }} />
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ── Screen: game ──────────────────────────────────────────────────────────
  if (screen === 'game') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6"
        style={{ background: `radial-gradient(ellipse 800px 400px at 50% 0%, ${themeColor}0A 0%, transparent 60%), #0A0F1E` }}>
        <div className="max-w-sm w-full flex flex-col items-center gap-8">
          {gameScore === null ? (
            <>
              <div className="text-center w-full">
                <p className="text-xs uppercase tracking-widest mb-2" style={{ color: '#6B7280' }}>Step 3 of 4 · Baseline</p>
                <h2 className="text-xl font-bold tracking-tight">{gameMeta.title}</h2>
                <p className="text-sm mt-1" style={{ color: '#9CA3AF' }}>{gameMeta.subtitle}</p>
                <p className="text-xs mt-0.5" style={{ color: themeColor }}>{gameMeta.science}</p>
              </div>
              <BaselineGame domain={goal ?? 'focus'} onComplete={setGameScore} themeColor={themeColor} />
            </>
          ) : (
            <div className="flex flex-col items-center gap-6 text-center w-full">
              <div>
                <p className="text-xs uppercase tracking-widest mb-3" style={{ color: themeColor }}>Your {goal} baseline</p>
                <div className="text-7xl font-bold tracking-tight" style={{ color: themeLight }}>{Math.round(gameScore)}</div>
                <p className="text-sm mt-1" style={{ color: '#6B7280' }}>out of 100</p>
              </div>
              <div className="w-full rounded-full overflow-hidden" style={{ height: 2, background: '#1F2937', maxWidth: 240 }}>
                <div className="h-full rounded-full" style={{ width: `${gameScore}%`, background: themeColor }} />
              </div>
              <p className="text-sm" style={{ color: '#9CA3AF' }}>Create your account to save this and track your progress.</p>
              <button onClick={() => setScreen('auth')}
                className="w-full max-w-xs py-3.5 flex items-center justify-center gap-2 font-semibold rounded-xl transition-opacity hover:opacity-88"
                style={{ background: themeColor, color: '#ffffff' }}>
                Save my results <ArrowRightIcon size={15} />
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── Screen: auth ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="max-w-sm w-full">
        <div className="flex items-center gap-2 mb-8">
          <PulseIcon size={15} style={{ color: '#1B4FD8' }} />
          <span className="font-semibold tracking-tight text-sm">Brain Pulse</span>
        </div>
        <p className="text-xs uppercase tracking-widest mb-2" style={{ color: '#6B7280' }}>Step 4 of 4</p>
        <h2 className="text-2xl font-bold tracking-tight mb-1">{isSignUp ? 'Create your account' : 'Welcome back'}</h2>
        <p className="text-sm mb-8" style={{ color: '#9CA3AF' }}>Your baseline score will be saved automatically.</p>

        <form onSubmit={handleAuth} className="flex flex-col gap-3">
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} required />
          <input type="password" placeholder="Password (min 6 characters)" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} required minLength={6} />
          {error && <p className="text-sm text-center" style={{ color: '#FCA5A5' }}>{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary py-3 w-full mt-1">
            {loading ? '…' : isSignUp ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px" style={{ background: '#1F2937' }} />
          <span className="text-xs" style={{ color: '#4B5563' }}>or</span>
          <div className="flex-1 h-px" style={{ background: '#1F2937' }} />
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

        <p className="text-center text-sm mt-6" style={{ color: '#6B7280' }}>
          {isSignUp ? 'Already have an account? ' : 'New here? '}
          <button onClick={() => setIsSignUp(!isSignUp)} style={{ color: '#93C5FD' }}>
            {isSignUp ? 'Sign in' : 'Sign up'}
          </button>
        </p>
      </div>
    </div>
  )
}
