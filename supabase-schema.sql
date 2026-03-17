-- Brain Pulse — Supabase Schema (idempotent — safe to re-run)

create table if not exists user_profiles (
  id uuid references auth.users primary key,
  streak_days int default 0,
  last_session_at timestamptz,
  goal text,
  onboarding_done boolean default false,
  created_at timestamptz default now()
);

create table if not exists game_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references user_profiles not null,
  domain text not null,
  score numeric(5,2) not null,
  difficulty int default 1,
  played_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into user_profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_signup on auth.users;
create trigger on_signup after insert on auth.users
  for each row execute procedure handle_new_user();

-- RLS
alter table user_profiles enable row level security;
alter table game_sessions enable row level security;

drop policy if exists "own" on user_profiles;
drop policy if exists "own" on game_sessions;
create policy "own" on user_profiles for all using (auth.uid() = id);
create policy "own" on game_sessions for all using (auth.uid() = user_id);
