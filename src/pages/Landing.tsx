import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const DOMAINS = [
  { icon: '🎯', name: 'Focus', desc: 'Sustained attention & inhibitory control. Train your ability to stay locked in and filter out distractions.', science: 'Continuous Performance Test (CPT)' },
  { icon: '🧠', name: 'Memory', desc: 'Episodic and visual working memory. Strengthen your ability to retain information and recall it on demand.', science: 'Paired-Associate Learning' },
  { icon: '⚡', name: 'Logic', desc: 'Fluid intelligence and pattern recognition. The ability to reason through novel problems without prior knowledge.', science: "Raven's Progressive Matrices" },
  { icon: '👁', name: 'Visual', desc: 'Visuospatial working memory. How well you process, store, and manipulate visual information in your mind.', science: 'Corsi Block Test' },
  { icon: '🔢', name: 'Math', desc: 'Numerical cognition and mental calculation speed. Trains the brain regions directly linked to mathematical reasoning.', science: 'Intraparietal Sulcus Training' },
]

const HOW_STEPS = [
  { n: '01', title: 'Set your goal', desc: 'Tell us what you want to improve — focus, memory, or overall sharpness.' },
  { n: '02', title: 'Play your session', desc: '3 games, ~12 minutes. Each one targets a specific cognitive domain with scientifically validated tasks.' },
  { n: '03', title: 'Track your growth', desc: 'Your brain profile updates after every session. Watch your radar chart evolve over days and weeks.' },
]

const SCIENCE_POINTS = [
  { icon: '📊', title: 'Adaptive difficulty', desc: 'Every game adjusts in real-time based on your last 3 scores. You\'re always training at the edge of your ability — the optimal zone for neuroplasticity.' },
  { icon: '🔄', title: 'Spaced repetition', desc: 'Daily sessions reinforce neural pathways through spaced practice — the most evidence-backed method for long-term cognitive improvement.' },
  { icon: '📈', title: 'Measurable baselines', desc: 'We use standardised cognitive assessments (CPT, Corsi, Raven\'s) to give you scores that actually mean something — not arbitrary points.' },
  { icon: '🌙', title: 'Sleep & consolidation', desc: 'We surface neuroscience insights after each session to help you maximise what your brain does overnight — when real consolidation happens.' },
]

export default function Landing() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0f0f1a' }}>

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🧠</span>
          <span className="text-white font-bold text-lg">Brain Pulse</span>
        </div>
        <div className="flex items-center gap-3">
          {!loading && user ? (
            <button
              onClick={() => navigate('/home')}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-medium text-sm transition-colors"
            >
              Go to dashboard →
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="px-5 py-2 text-white/60 hover:text-white text-sm transition-colors"
              >
                Sign in
              </button>
              <button
                onClick={() => navigate('/onboarding')}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-medium text-sm transition-colors"
              >
                Get started free
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center px-6 py-20 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-300 text-xs mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse inline-block" />
          Science-backed cognitive training
        </div>
        <h1 className="text-5xl font-bold text-white leading-tight mb-6">
          Train your brain.<br />
          <span style={{ color: '#818cf8' }}>Measure your growth.</span>
        </h1>
        <p className="text-white/50 text-lg leading-relaxed mb-10 max-w-xl mx-auto">
          Brain Pulse uses clinically validated cognitive tasks to measure and improve your focus, memory, logic, visual processing, and mathematical reasoning — 12 minutes a day.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => navigate('/onboarding')}
            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold text-white text-lg transition-colors shadow-lg shadow-indigo-500/20"
          >
            Start free →
          </button>
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-medium text-white text-lg transition-colors"
          >
            Sign in
          </button>
        </div>
        <p className="text-white/20 text-sm mt-4">No credit card. No fluff. Just your brain.</p>
      </section>

      {/* Radar visual */}
      <section className="flex justify-center px-6 pb-16">
        <div className="relative w-72 h-72 flex items-center justify-center">
          {/* Fake radar rings */}
          {[1, 0.75, 0.5, 0.25].map((scale, i) => (
            <div key={i} className="absolute rounded-full border border-white/5"
              style={{ width: `${scale * 100}%`, height: `${scale * 100}%` }} />
          ))}
          {/* Domain labels */}
          {[
            { label: 'Focus', x: '50%', y: '4%' },
            { label: 'Memory', x: '92%', y: '32%' },
            { label: 'Math', x: '76%', y: '88%' },
            { label: 'Visual', x: '24%', y: '88%' },
            { label: 'Logic', x: '8%', y: '32%' },
          ].map(({ label, x, y }) => (
            <div key={label} className="absolute text-white/40 text-xs font-medium"
              style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}>
              {label}
            </div>
          ))}
          {/* Glow center */}
          <div className="w-24 h-24 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <span className="text-3xl">🧠</span>
          </div>
        </div>
      </section>

      {/* What we train */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">5 domains. One complete picture.</h2>
          <p className="text-white/40">Every session trains a different part of your cognitive system.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DOMAINS.map(d => (
            <div key={d.name} className="p-6 bg-white/3 border border-white/8 rounded-2xl" style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}>
              <div className="text-3xl mb-3">{d.icon}</div>
              <h3 className="text-white font-semibold text-lg mb-2">{d.name}</h3>
              <p className="text-white/40 text-sm leading-relaxed mb-3">{d.desc}</p>
              <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-indigo-500/10 rounded-md">
                <span className="text-indigo-400 text-xs">{d.science}</span>
              </div>
            </div>
          ))}
          {/* 5th domain fills col, add CTA in last slot */}
          <div className="p-6 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl flex flex-col items-center justify-center text-center">
            <p className="text-white/60 text-sm mb-4">Ready to see where you stand?</p>
            <button
              onClick={() => navigate('/onboarding')}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-medium text-sm transition-colors"
            >
              Get your brain profile →
            </button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">How it works</h2>
          <p className="text-white/40">Simple to start. Surprisingly deep.</p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {HOW_STEPS.map(s => (
            <div key={s.n} className="flex flex-col gap-3">
              <div className="text-5xl font-bold" style={{ color: 'rgba(99,102,241,0.3)' }}>{s.n}</div>
              <h3 className="text-white font-semibold text-lg">{s.title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* The science */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Built on real science</h2>
          <p className="text-white/40 max-w-xl mx-auto">
            Every game in Brain Pulse is based on a standardised neuropsychological assessment used in clinical and research settings worldwide.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {SCIENCE_POINTS.map(p => (
            <div key={p.title} className="flex gap-4 p-6 border border-white/6 rounded-2xl" style={{ borderColor: 'rgba(255,255,255,0.06)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
              <span className="text-2xl shrink-0">{p.icon}</span>
              <div>
                <h3 className="text-white font-semibold mb-1">{p.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-20 text-center max-w-2xl mx-auto">
        <h2 className="text-4xl font-bold text-white mb-4">Your brain is trainable.</h2>
        <p className="text-white/40 text-lg mb-8">Most people never measure their cognitive performance. Start in 2 minutes.</p>
        <button
          onClick={() => navigate('/onboarding')}
          className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold text-white text-lg transition-colors shadow-lg shadow-indigo-500/20"
        >
          Start free →
        </button>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-8 text-center text-white/20 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span>🧠</span>
          <span className="font-medium text-white/30">Brain Pulse</span>
        </div>
        Science-backed cognitive training · Built for serious minds
      </footer>

    </div>
  )
}
