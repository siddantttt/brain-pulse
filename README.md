# Brain Pulse

Science-backed cognitive training. Five domains, twelve minutes a day, scores tied to clinical neuropsychology assessments.

**Stack:** React 19 + TypeScript + Vite + Tailwind CSS + Supabase

---

## Setup

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier is fine)

### 1. Clone and install

```bash
git clone https://github.com/your-username/brain-pulse.git
cd brain-pulse
npm install
```

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in your Supabase credentials. Find them at:
**supabase.com → your project → Settings → API**

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

### 3. Set up the database

In your Supabase project, open the **SQL editor** and run the contents of `supabase-schema.sql`. This creates the `user_profiles` and `game_sessions` tables, sets up Row Level Security, and adds the trigger that auto-creates a profile on signup.

### 4. Run

```bash
npm run dev
```

App runs at `http://localhost:5173`.

---

## Cognitive domains

| Domain  | Color  | Assessment                        |
|---------|--------|-----------------------------------|
| Focus   | Blue   | Continuous Performance Test       |
| Memory  | Green  | Paired-Associate Learning         |
| Logic   | Yellow | Raven's Progressive Matrices      |
| Visual  | Sky    | Corsi Block Test                  |
| Math    | Red    | Intraparietal Sulcus Training     |

---

## Project structure

```
src/
├── components/
│   ├── games/          # One component per cognitive domain
│   ├── Icons.tsx
│   ├── RadarChart.tsx
│   ├── ScoreScreen.tsx
│   └── StreakBadge.tsx
├── contexts/
│   └── AuthContext.tsx
├── hooks/
│   ├── useDomainScores.ts
│   └── useGameSessions.ts
├── lib/
│   └── supabase.ts
├── pages/
│   ├── Landing.tsx
│   ├── Login.tsx
│   ├── Onboarding.tsx
│   ├── Home.tsx
│   ├── Session.tsx
│   ├── SessionComplete.tsx
│   └── Progress.tsx
└── types/
    └── index.ts        # Domain types + DOMAIN_COLORS map
```

---

## Deployment

The app deploys to Vercel with zero config. Set the two environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) in your Vercel project settings under **Environment Variables**, then push to trigger a deploy.
