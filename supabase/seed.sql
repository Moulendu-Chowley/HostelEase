-- Run this after schema.sql in Supabase SQL editor/terminal

insert into public.profiles (user_id, email, full_name, role, roll_no)
values
  (gen_random_uuid(), 'admin@hostelease.com', 'Hostel Admin', 'admin', null),
  (gen_random_uuid(), 'rahul.sharma@hostelease.com', 'Rahul Sharma', 'student', 'HS2021001'),
  (gen_random_uuid(), 'priya.singh@hostelease.com', 'Priya Singh', 'student', 'HS2021002'),
  (gen_random_uuid(), 'amit.kumar@hostelease.com', 'Amit Kumar', 'student', 'HS2021003'),
  (gen_random_uuid(), 'sneha.patel@hostelease.com', 'Sneha Patel', 'student', 'HS2021004')
on conflict (email) do update set
  full_name = excluded.full_name,
  role = excluded.role,
  roll_no = excluded.roll_no,
  updated_at = now();

with students as (
  select id, row_number() over(order by full_name asc) as rn
  from public.profiles
  where role = 'student'
),
base as (
  select
    id,
    rn,
    now()::date as d
  from students
)
insert into public.attendance_events (profile_id, type, captured_at, camera_label, confidence)
select id, 'entry', (d + make_interval(hours => (8 + rn)::int, mins => (5 + rn)::int)), 'Main Gate Cam', 0.93 from base
union all
select id, 'exit', (d + make_interval(hours => (17 + rn)::int, mins => (10 + rn)::int)), 'Exit Gate Cam', 0.9 from base;

-- 1. Seed Rooms
insert into public.rooms (number, floor, capacity, type, status)
values
  ('101', 1, 2, 'Double', 'full'),
  ('102', 1, 2, 'Double', 'available'),
  ('103', 1, 2, 'Double', 'full'),
  ('104', 1, 2, 'Double', 'available'),
  ('201', 2, 2, 'Double', 'available'),
  ('202', 2, 2, 'Double', 'available'),
  ('203', 2, 2, 'Double', 'available'),
  ('204', 2, 2, 'Double', 'available')
on conflict (number) do nothing;

-- 2. Seed Allotments
-- Match seeded students: Rahul Sharma, Amit Kumar to Room 101; Priya Singh, Sneha Patel to Room 103
insert into public.room_allotments (room_id, profile_id)
select r.id, p.id
from public.rooms r, public.profiles p
where r.number = '101' and p.email in ('rahul.sharma@hostelease.com', 'amit.kumar@hostelease.com')
on conflict (profile_id) do nothing;

insert into public.room_allotments (room_id, profile_id)
select r.id, p.id
from public.rooms r, public.profiles p
where r.number = '103' and p.email in ('priya.singh@hostelease.com', 'sneha.patel@hostelease.com')
on conflict (profile_id) do nothing;

-- 3. Seed Mess Menu
insert into public.mess_menu (day, breakfast, lunch, dinner, duty_roster)
values
  ('Monday', 'Idli, Sambar, Chutney', 'Rice, Dal, Sabzi, Roti', 'Chapati, Paneer, Rice', 'Room 101-102'),
  ('Tuesday', 'Poha, Chai', 'Chole, Rice, Roti', 'Dal Fry, Rice, Roti', 'Room 103-104'),
  ('Wednesday', 'Upma, Coffee', 'Rajma, Rice, Roti', 'Chicken Curry, Rice', 'Room 101-102'),
  ('Thursday', 'Dosa, Chutney', 'Kadhi, Rice, Roti', 'Mixed Veg, Roti', 'Room 103-104'),
  ('Friday', 'Paratha, Curd', 'Biryani, Raita', 'Dal Makhani, Roti', 'Room 101-102'),
  ('Saturday', 'Sandwich, Tea', 'Pulao, Curry', 'Pizza, Salad', 'Room 103-104'),
  ('Sunday', 'Puri Bhaji', 'Special Thali', 'Noodles, Manchurian', 'Room 101-102')
on conflict (day) do nothing;

-- 4. Seed Mess Committee
insert into public.mess_committee (profile_id, role)
select id, 'Head' from public.profiles where email = 'rahul.sharma@hostelease.com'
on conflict (profile_id) do nothing;

insert into public.mess_committee (profile_id, role)
select id, 'Deputy' from public.profiles where email = 'priya.singh@hostelease.com'
on conflict (profile_id) do nothing;

insert into public.mess_committee (profile_id, role)
select id, 'Member' from public.profiles where email = 'amit.kumar@hostelease.com'
on conflict (profile_id) do nothing;

insert into public.mess_committee (profile_id, role)
select id, 'Member' from public.profiles where email = 'sneha.patel@hostelease.com'
on conflict (profile_id) do nothing;

-- 5. Seed Sports Leagues
insert into public.sports_leagues (name, sport)
values
  ('Football League 2024', 'football'),
  ('Cricket League 2024', 'cricket')
on conflict (name) do nothing;

-- 6. Seed Sports Teams
insert into public.sports_teams (league_id, name, captain_id, wins, losses, points)
select l.id, 'Thunder FC', p.id, 5, 1, 15
from public.sports_leagues l, public.profiles p
where l.name = 'Football League 2024' and p.email = 'rahul.sharma@hostelease.com'
on conflict (league_id, name) do nothing;

insert into public.sports_teams (league_id, name, captain_id, wins, losses, points)
select l.id, 'Phoenix United', p.id, 4, 2, 12
from public.sports_leagues l, public.profiles p
where l.name = 'Football League 2024' and p.email = 'amit.kumar@hostelease.com'
on conflict (league_id, name) do nothing;

insert into public.sports_teams (league_id, name, captain_id, wins, losses, points)
select l.id, 'Royal Strikers', p.id, 6, 0, 18
from public.sports_leagues l, public.profiles p
where l.name = 'Cricket League 2024' and p.email = 'priya.singh@hostelease.com'
on conflict (league_id, name) do nothing;

insert into public.sports_teams (league_id, name, captain_id, wins, losses, points)
select l.id, 'Super Kings', p.id, 4, 2, 12
from public.sports_leagues l, public.profiles p
where l.name = 'Cricket League 2024' and p.email = 'sneha.patel@hostelease.com'
on conflict (league_id, name) do nothing;

-- 7. Seed Sports Matches
insert into public.sports_matches (league_id, team_a_id, team_b_id, status, match_date, venue)
select l.id, t1.id, t2.id, 'upcoming', now() + interval '2 days', 'Ground A'
from public.sports_leagues l, public.sports_teams t1, public.sports_teams t2
where l.name = 'Football League 2024' and t1.name = 'Thunder FC' and t2.name = 'Phoenix United'
on conflict do nothing;

insert into public.sports_matches (league_id, team_a_id, team_b_id, status, match_date, venue)
select l.id, t1.id, t2.id, 'upcoming', now() + interval '4 days', 'Ground B'
from public.sports_leagues l, public.sports_teams t1, public.sports_teams t2
where l.name = 'Cricket League 2024' and t1.name = 'Royal Strikers' and t2.name = 'Super Kings'
on conflict do nothing;

-- 8. Seed Budget Estimates
insert into public.budget_estimates (category, month, actual_amount, predicted_amount, budget_limit)
values
  ('electricity', '2026-05', 26800.0, 27000.0, 30000.0),
  ('electricity', '2026-06', 28500.0, 29000.0, 30000.0),
  ('grocery', '2026-05', 15200.0, 15000.0, 20000.0),
  ('grocery', '2026-06', 16500.0, 17000.0, 20000.0)
on conflict (category, month) do nothing;

-- 9. Seed Grocery Expenses
insert into public.grocery_expenses (category, amount, expense_date)
values
  ('Vegetables', 5200.0, current_date - interval '5 days'),
  ('Rice/Grains', 3800.0, current_date - interval '4 days'),
  ('Dairy', 2900.0, current_date - interval '3 days'),
  ('Spices', 1500.0, current_date - interval '2 days'),
  ('Oil', 1800.0, current_date - interval '1 day'),
  ('Others', 1300.0, current_date)
on conflict do nothing;

-- 10. Seed Leave Requests
insert into public.leave_requests (profile_id, from_date, to_date, reason, status)
select id, current_date + interval '2 days', current_date + interval '4 days', 'Medical appointment', 'pending'
from public.profiles where email = 'rahul.sharma@hostelease.com'
on conflict do nothing;

insert into public.leave_requests (profile_id, from_date, to_date, reason, status)
select id, current_date + interval '7 days', current_date + interval '9 days', 'Family function', 'approved'
from public.profiles where email = 'priya.singh@hostelease.com'
on conflict do nothing;

insert into public.leave_requests (profile_id, from_date, to_date, reason, status)
select id, current_date + interval '1 day', current_date + interval '2 days', 'Personal work', 'rejected'
from public.profiles where email = 'amit.kumar@hostelease.com'
on conflict do nothing;

-- 11. Seed Complaints
insert into public.complaints (profile_id, title, description, category, priority, status)
select id, 'AC Not Working', 'The air conditioning in my room has stopped working', 'Electrical', 'high', 'pending'
from public.profiles where email = 'rahul.sharma@hostelease.com'
on conflict do nothing;

insert into public.complaints (profile_id, title, description, category, priority, status)
select id, 'Water Leakage', 'There is water leaking from the bathroom ceiling', 'Plumbing', 'critical', 'in-progress'
from public.profiles where email = 'priya.singh@hostelease.com'
on conflict do nothing;

insert into public.complaints (profile_id, title, description, category, priority, status)
select id, 'Broken Window', 'Window glass is cracked and needs replacement', 'General', 'medium', 'resolved'
from public.profiles where email = 'amit.kumar@hostelease.com'
on conflict do nothing;

