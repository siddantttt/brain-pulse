# 🧠 Brain Pulse

### Train your brain, track the proof.

Brain Pulse is a cognitive training app built for students — sharpen your memory, attention, problem-solving, and reaction speed through focused daily games, then watch your progress compound over time.

**[🚀 Try it live →](https://brainpulse-qe8w4l2ao-siddantttts-projects.vercel.app/)**

---

## What it does

Students don't just need to study harder — they need to think better. Brain Pulse delivers short, targeted training sessions across four cognitive domains:

- 🧩 **Memory** — retain and recall information under pressure
- 🎯 **Attention** — filter noise and stay locked in
- 💡 **Problem Solving** — think flexibly and strategically
- ⚡ **Speed & Reaction** — process information faster

Every session is scored and tracked. You don't just feel like you're improving — you can see it.

---

## Features

- 🔐 **Secure auth** — sign up and pick up where you left off across devices
- 📈 **Progress dashboard** — visualize your performance trends over time
- 🔥 **Streak tracking** — build a daily habit and stay consistent
- 🎯 **Goal setting** — set a personal cognitive goal during onboarding
- 📊 **Domain-level scoring** — see exactly where you're strong and where to improve
- ⚙️ **Adaptive difficulty** — sessions scale as you get better

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite |
| Styling | Tailwind CSS |
| Routing | React Router v7 |
| Charts | Recharts |
| Backend / Auth | Supabase (Postgres + Auth) |
| Deployment | Vercel |

---

## Getting Started

```bash
# Clone the repo
git clone https://github.com/siddantttt/brain-pulse.git
cd brain-pulse

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your Supabase URL and anon key

# Run locally
npm run dev
```

### Environment Variables

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Setup

Run the included schema against your Supabase project:

```bash
# In your Supabase SQL editor, run:
supabase-schema.sql
```

---

## Roadmap

- [ ] Spaced repetition recommendations based on weak domains
- [ ] Head-to-head challenges between students
- [ ] Teacher/parent dashboard for monitoring progress
- [ ] Mobile app (React Native)
- [ ] AI-personalized training plans

---

## Built by

[@siddantttt](https://github.com/siddantttt)
