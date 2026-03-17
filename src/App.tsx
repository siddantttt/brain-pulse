import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Onboarding from './pages/Onboarding'
import Home from './pages/Home'
import Session from './pages/Session'
import SessionComplete from './pages/SessionComplete'
import Progress from './pages/Progress'

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <Loading />
  if (!user) return <Navigate to="/onboarding" replace />
  return <>{children}</>
}

function PublicGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <Loading />
  if (user) return <Navigate to="/home" replace />
  return <>{children}</>
}

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="text-4xl animate-pulse">🧠</div>
        <div className="text-white/30 text-sm">Loading Brain Pulse…</div>
      </div>
    </div>
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/onboarding" element={
        <PublicGuard><Onboarding /></PublicGuard>
      } />
      <Route path="/home" element={
        <AuthGuard><Home /></AuthGuard>
      } />
      <Route path="/session" element={
        <AuthGuard><Session /></AuthGuard>
      } />
      <Route path="/session-complete" element={
        <AuthGuard><SessionComplete /></AuthGuard>
      } />
      <Route path="/progress" element={
        <AuthGuard><Progress /></AuthGuard>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
