import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { PulseIcon, ChevronLeftIcon } from '../components/Icons'

export default function Login() {
  const navigate = useNavigate()
  const { signIn, signInWithGoogle } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
      navigate('/home')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign in failed')
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

  const inputStyle = {
    background: '#111827', border: '1px solid #1F2937', borderRadius: 12,
    color: '#F9FAFB', padding: '12px 16px', width: '100%', outline: 'none',
    fontSize: 15,
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">

        <button onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-sm mb-10 transition-colors"
          style={{ color: '#6B7280' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#9CA3AF')}
          onMouseLeave={e => (e.currentTarget.style.color = '#6B7280')}>
          <ChevronLeftIcon size={15} /> Back
        </button>

        <div className="flex items-center gap-2.5 mb-8">
          <PulseIcon size={16} style={{ color: '#1B4FD8' }} />
          <span className="font-semibold tracking-tight">Brain Pulse</span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight mb-1">Welcome back</h1>
        <p className="text-sm mb-8" style={{ color: '#9CA3AF' }}>Sign in to continue your training</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input type="email" placeholder="Email" value={email}
            onChange={e => setEmail(e.target.value)} style={inputStyle} required />
          <input type="password" placeholder="Password" value={password}
            onChange={e => setPassword(e.target.value)} style={inputStyle} required />

          {error && <p className="text-sm text-center" style={{ color: '#FCA5A5' }}>{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary py-3 mt-1 w-full">
            {loading ? '…' : 'Sign in'}
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
          No account?{' '}
          <button onClick={() => navigate('/onboarding')} style={{ color: '#93C5FD' }}>
            Get started free
          </button>
        </p>
      </div>
    </div>
  )
}
