-- Run this in Supabase SQL editor/terminal
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null,
  email text unique not null,
  full_name text not null,
  roll_no text unique,
  role text not null default 'student' check (role in ('admin', 'student')),
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.attendance_events (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('entry', 'exit')),
  captured_at timestamptz not null default now(),
  camera_label text,
  confidence double precision,
  created_at timestamptz not null default now()
);

create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_attendance_events_profile_captured on public.attendance_events(profile_id, captured_at desc);
create index if not exists idx_attendance_events_captured on public.attendance_events(captured_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

-- If the profiles table already exists (ran schema.sql before), add the column:
alter table public.profiles add column if not exists photo_url text;

-- Create Supabase Storage bucket for student face photos (public read):
insert into storage.buckets (id, name, public)
values ('student-photos', 'student-photos', true)
on conflict (id) do nothing;

-- 1. Rooms Table
create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  number text unique not null,
  floor integer not null,
  capacity integer not null default 2,
  type text not null default 'Double',
  status text not null default 'available' check (status in ('available', 'full', 'maintenance')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_rooms_updated_at
before update on public.rooms
for each row
execute function public.set_updated_at();

-- 2. Room Allotments Table
create table if not exists public.room_allotments (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  profile_id uuid unique not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_room_allotments_updated_at
before update on public.room_allotments
for each row
execute function public.set_updated_at();

-- 3. Mess Menu Table
create table if not exists public.mess_menu (
  id uuid primary key default gen_random_uuid(),
  day text unique not null check (day in ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
  breakfast text not null,
  lunch text not null,
  dinner text not null,
  duty_roster text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_mess_menu_updated_at
before update on public.mess_menu
for each row
execute function public.set_updated_at();

-- 4. Mess Committee Table
create table if not exists public.mess_committee (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('Head', 'Deputy', 'Member')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_mess_committee_updated_at
before update on public.mess_committee
for each row
execute function public.set_updated_at();

-- 5. Sports Leagues Table
create table if not exists public.sports_leagues (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  sport text not null check (sport in ('football', 'cricket')),
  created_at timestamptz not null default now()
);

-- 6. Sports Teams Table
create table if not exists public.sports_teams (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references public.sports_leagues(id) on delete cascade,
  name text not null,
  captain_id uuid references public.profiles(id) on delete set null,
  wins integer not null default 0,
  losses integer not null default 0,
  points integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (league_id, name)
);

create trigger trg_sports_teams_updated_at
before update on public.sports_teams
for each row
execute function public.set_updated_at();

-- 7. Sports Matches Table
create table if not exists public.sports_matches (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references public.sports_leagues(id) on delete cascade,
  team_a_id uuid not null references public.sports_teams(id) on delete cascade,
  team_b_id uuid not null references public.sports_teams(id) on delete cascade,
  score_a integer,
  score_b integer,
  status text not null default 'upcoming' check (status in ('upcoming', 'completed')),
  match_date timestamptz not null,
  venue text not null,
  created_at timestamptz not null default now()
);

-- 8. Budget Estimates Table
create table if not exists public.budget_estimates (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('electricity', 'grocery')),
  month text not null, -- e.g., '2026-06'
  actual_amount double precision not null default 0.0,
  predicted_amount double precision not null default 0.0,
  budget_limit double precision not null default 0.0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (category, month)
);

create trigger trg_budget_estimates_updated_at
before update on public.budget_estimates
for each row
execute function public.set_updated_at();

-- 9. Grocery Expenses Table
create table if not exists public.grocery_expenses (
  id uuid primary key default gen_random_uuid(),
  category text not null, -- e.g., 'Vegetables', 'Dairy', 'Rice/Grains'
  amount double precision not null,
  expense_date date not null default current_date,
  created_at timestamptz not null default now()
);

-- 10. Leave Requests Table
create table if not exists public.leave_requests (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  from_date date not null,
  to_date date not null,
  reason text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  rejected_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_leave_requests_updated_at
before update on public.leave_requests
for each row
execute function public.set_updated_at();

-- 11. Complaints Table
create table if not exists public.complaints (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  category text not null, -- e.g., 'Electrical', 'Plumbing', etc.
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'critical')),
  status text not null default 'pending' check (status in ('pending', 'in-progress', 'resolved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_complaints_updated_at
before update on public.complaints
for each row
execute function public.set_updated_at();

