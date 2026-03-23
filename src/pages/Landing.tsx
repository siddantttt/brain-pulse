import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { FocusIcon, MemoryIcon, LogicIcon, VisualIcon, MathIcon, PulseIcon, ArrowRightIcon } from '../components/Icons'

const DOMAINS = [
  { Icon: FocusIcon,  name: 'Focus',  desc: 'Sustained attention and inhibitory control. Stay locked in, block out noise.', test: 'Continuous Performance Test' },
  { Icon: MemoryIcon, name: 'Memory', desc: 'Episodic and visual working memory. Retain more, recall faster, under pressure.', test: 'Paired-Associate Learning' },
  { Icon: LogicIcon,  name: 'Logic',  desc: 'Fluid intelligence. Reason through novel problems without relying on prior knowledge.', test: "Raven's Progressive Matrices" },
  { Icon: VisualIcon, name: 'Visual', desc: 'Visuospatial working memory. Process, store, and rotate visual information mentally.', test: 'Corsi Block Test' },
  { Icon: MathIcon,   name: 'Math',   desc: 'Numerical cognition and calculation speed. Trains the regions directly linked to mathematical reasoning.', test: 'Intraparietal Sulcus Training' },
]

const SCIENCE = [
  { label: 'Adaptive difficulty', desc: "Always training at the edge of your ability — the optimal zone for neuroplasticity. The system reads your last 3 scores and adjusts instantly." },
  { label: 'Spaced repetition', desc: 'Daily sessions reinforce neural pathways through distributed practice — the most evidence-backed method for lasting cognitive change.' },
  { label: 'Standardised baselines', desc: "Scores derived from clinical-grade assessments (CPT, Corsi, Raven's). Not arbitrary points — comparable to research benchmarks." },
  { label: 'Consolidation window', desc: 'We surface targeted insights after each session to maximise what your brain does overnight, when long-term potentiation actually occurs.' },
]

export default function Landing() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()

  return (
    <div style={{
      background: 'radial-gradient(ellipse 1200px 600px at 50% -80px, rgba(27,79,216,0.12) 0%, transparent 60%), #0A0F1E',
      color: '#F9FAFB',
      minHeight: '100vh',
    }}>

      {/* Nav */}
      <nav style={{ borderBottom: '1px solid #1F2937' }}>
        <div className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
          <div className="flex items-center gap-2.5">
            <PulseIcon size={18} style={{ color: '#1B4FD8' }} />
            <span className="font-semibold tracking-tight" style={{ color: '#F9FAFB' }}>Brain Pulse</span>
          </div>
          <div className="flex items-center gap-2">
            {!loading && user ? (
              <button onClick={() => navigate('/home')} className="btn-primary px-5 py-2 text-sm">
                Dashboard
              </button>
            ) : (
              <>
                <button onClick={() => navigate('/login')} className="px-4 py-2 text-sm" style={{ color: '#9CA3AF' }}>
                  Sign in
                </button>
                <button onClick={() => navigate('/onboarding')} className="btn-primary px-5 py-2 text-sm">
                  Get started
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs mb-10 font-medium"
          style={{ background: 'rgba(27,79,216,0.12)', color: '#93C5FD', border: '1px solid rgba(27,79,216,0.3)' }}>
          <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: '#1B4FD8' }} />
          Clinically validated cognitive training
        </div>
        <h1 className="font-bold leading-none tracking-tight mb-6"
          style={{ fontSize: 'clamp(40px, 7vw, 80px)', color: '#F9FAFB' }}>
          Train your brain.<br />
          <span style={{ color: '#93C5FD' }}>Track the proof.</span>
        </h1>
        <p className="text-lg leading-relaxed mb-10 max-w-xl mx-auto" style={{ color: '#9CA3AF' }}>
          Five domains. Twelve minutes a day. Scores backed by the same assessments used in neuropsychology research worldwide.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => navigate('/onboarding')}
            className="btn-primary flex items-center gap-2 px-7 py-3.5 text-base">
            Start free <ArrowRightIcon size={16} />
          </button>
          <button onClick={() => navigate('/login')} className="btn-ghost px-7 py-3.5 text-base">
            Sign in
          </button>
        </div>
        <p className="text-xs mt-4" style={{ color: '#4B5563' }}>No card required</p>
      </section>

      {/* Pulse visual */}
      <section className="flex justify-center pb-20 px-6">
        <div className="w-full max-w-lg" style={{ height: 80 }}>
          <svg viewBox="0 0 500 80" fill="none" className="w-full">
            <polyline
              points="0,40 60,40 90,40 110,8 130,72 150,20 170,55 190,40 260,40 280,40 300,15 320,65 340,30 360,50 380,40 500,40"
              stroke="#1B4FD8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.35"
            />
            <polyline
              points="0,40 60,40 90,40 110,8 130,72 150,20 170,55 190,40 260,40"
              stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>
        </div>
      </section>

      {/* Domains */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-3">Five cognitive domains</h2>
          <p style={{ color: '#6B7280' }}>Each one measured with a standardised assessment. Each one trainable.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {DOMAINS.map(({ Icon, name, desc, test }) => (
            <div key={name} className="p-6 rounded-2xl" style={{ background: '#111827', border: '1px solid #1F2937' }}>
              <div className="mb-4 p-2 rounded-lg w-fit" style={{ background: 'rgba(27,79,216,0.1)' }}>
                <Icon size={18} style={{ color: '#93C5FD' }} />
              </div>
              <h3 className="font-semibold text-base mb-1.5">{name}</h3>
              <p className="text-sm leading-relaxed mb-4" style={{ color: '#6B7280' }}>{desc}</p>
              <span className="text-xs px-2 py-1 rounded-md" style={{ background: '#1F2937', color: '#6B7280' }}>{test}</span>
            </div>
          ))}
          <div className="p-6 rounded-2xl flex flex-col justify-between"
            style={{ background: 'rgba(27,79,216,0.06)', border: '1px solid rgba(27,79,216,0.2)' }}>
            <p className="text-sm mb-6" style={{ color: '#9CA3AF' }}>Take a 2-minute baseline test. See exactly where you stand.</p>
            <button onClick={() => navigate('/onboarding')}
              className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm w-fit">
              Get your profile <ArrowRightIcon size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ borderTop: '1px solid #1F2937', borderBottom: '1px solid #1F2937' }}>
        <div className="max-w-5xl mx-auto px-6 py-24">
          <div className="mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-3">How it works</h2>
            <p style={{ color: '#6B7280' }}>Simple to start. The depth shows up over time.</p>
          </div>
          <div className="grid gap-10 sm:grid-cols-3">
            {[
              { n: '01', title: 'Pick your goal', body: 'Focus, memory, or overall sharpness. One tap. No questionnaire.' },
              { n: '02', title: 'Play your session', body: '3 games, ~12 minutes. Each targets a specific cognitive domain with a validated task.' },
              { n: '03', title: 'Track your growth', body: 'Your brain profile updates after every session. Watch the radar chart evolve.' },
            ].map(s => (
              <div key={s.n}>
                <div className="text-5xl font-bold mb-4" style={{ color: '#1F2937' }}>{s.n}</div>
                <h3 className="font-semibold mb-2">{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#6B7280' }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Science */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <div className="mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-3">Built on research</h2>
          <p style={{ color: '#6B7280' }}>Not gamification. Not dopamine tricks. Actual cognitive science.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {SCIENCE.map(s => (
            <div key={s.label} className="p-6 rounded-2xl" style={{ background: '#111827', border: '1px solid #1F2937' }}>
              <h3 className="font-semibold mb-2 text-sm" style={{ color: '#93C5FD' }}>{s.label}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#6B7280' }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ borderTop: '1px solid #1F2937' }}>
        <div className="max-w-xl mx-auto px-6 py-24 text-center">
          <h2 className="text-4xl font-bold tracking-tight mb-4">Your brain is measurable.</h2>
          <p className="mb-8" style={{ color: '#6B7280' }}>Start with a 2-minute baseline. No account needed until you're ready.</p>
          <button onClick={() => navigate('/onboarding')}
            className="btn-primary flex items-center gap-2 px-8 py-4 text-base mx-auto">
            Start free <ArrowRightIcon size={16} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #1F2937' }}>
        <div className="max-w-5xl mx-auto px-6 py-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PulseIcon size={14} style={{ color: '#374151' }} />
            <span className="text-sm" style={{ color: '#374151' }}>Brain Pulse</span>
          </div>
          <span className="text-xs" style={{ color: '#1F2937' }}>Science-backed cognitive training</span>
        </div>
      </footer>

    </div>
  )
}
