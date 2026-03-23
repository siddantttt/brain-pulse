import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { envMissing } from './lib/supabase'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'
import Home from './pages/Home'
import Session from './pages/Session'
import SessionComplete from './pages/SessionComplete'
import Progress from './pages/Progress'

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <Loading />
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="text-4xl animate-pulse">🧠</div>
        <div className="text-sm" style={{ color: '#6B7280' }}>Loading Brain Pulse…</div>
      </div>
    </div>
  )
}

function EnvError() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md w-full rounded-2xl p-8" style={{ background: '#111827', border: '1px solid #1F2937' }}>
        <div className="text-2xl mb-4">⚠️</div>
        <h1 className="text-lg font-semibold mb-2" style={{ color: '#F9FAFB' }}>Missing environment variables</h1>
        <p className="text-sm mb-6" style={{ color: '#9CA3AF' }}>
          The app cannot connect to the database. Supabase credentials are not configured.
        </p>
        <div className="rounded-xl px-4 py-3 mb-6 font-mono text-xs" style={{ background: '#0A0F1E', color: '#FDE68A', border: '1px solid #1F2937' }}>
          <div>VITE_SUPABASE_URL</div>
          <div>VITE_SUPABASE_ANON_KEY</div>
        </div>
        <ol className="text-sm space-y-1.5 list-decimal list-inside" style={{ color: '#9CA3AF' }}>
          <li>Copy <code style={{ color: '#93C5FD' }}>.env.local.example</code> to <code style={{ color: '#93C5FD' }}>.env.local</code></li>
          <li>Fill in your Supabase project URL and anon key</li>
          <li>Restart the dev server</li>
        </ol>
        <p className="text-xs mt-5" style={{ color: '#4B5563' }}>
          Find these values at supabase.com → your project → Settings → API
        </p>
      </div>
    </div>
  )
}

function AppRoutes() {
  const { user, loading } = useAuth()

  return (
    <Routes>
      {/* Landing — always public */}
      <Route path="/" element={<Landing />} />

      {/* Auth routes — redirect to /home if already logged in */}
      <Route path="/login" element={
        loading ? <Loading /> : user ? <Navigate to="/home" replace /> : <Login />
      } />
      <Route path="/onboarding" element={
        loading ? <Loading /> : user ? <Navigate to="/home" replace /> : <Onboarding />
      } />

      {/* Protected routes */}
      <Route path="/home" element={<AuthGuard><Home /></AuthGuard>} />
      <Route path="/session" element={<AuthGuard><Session /></AuthGuard>} />
      <Route path="/session-complete" element={<AuthGuard><SessionComplete /></AuthGuard>} />
      <Route path="/progress" element={<AuthGuard><Progress /></AuthGuard>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  if (envMissing) return <EnvError />

  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
