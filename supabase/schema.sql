-- ============================================================
-- TURBO TRACKER V2 — Supabase Schema
-- Run this in the Supabase SQL Editor (one-time setup).
-- ============================================================

-- 1. PROFILES (auto-created via trigger on auth.users signup)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null default 'Athlete',
  avatar_url text,
  theme text default 'volt',
  weight_unit text not null default 'kg' check (weight_unit in ('kg', 'lb')),
  created_at timestamp with time zone not null default timezone('utc'::text, now())
);

alter table public.profiles enable row level security;

create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Trigger: auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, weight_unit)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'Athlete'),
    'kg'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. EXERCISES (global presets + per-user custom exercises)
create table public.exercises (
  id text primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  muscle text not null,
  equipment text not null,
  instructions text not null default '',
  is_custom boolean not null default false,
  created_at timestamp with time zone not null default timezone('utc'::text, now())
);

alter table public.exercises enable row level security;

create policy "Anyone can read global presets" on public.exercises
  for select using (user_id is null);

create policy "Users can read own custom exercises" on public.exercises
  for select using (auth.uid() = user_id);

create policy "Users can insert own custom exercises" on public.exercises
  for insert with check (auth.uid() = user_id);

create policy "Users can update own custom exercises" on public.exercises
  for update using (auth.uid() = user_id);

create policy "Users can delete own custom exercises" on public.exercises
  for delete using (auth.uid() = user_id);

-- 3. WORKOUTS
create table public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  started_at timestamp with time zone not null,
  completed_at timestamp with time zone not null,
  duration_min integer not null,
  volume_kg numeric not null default 0,
  created_at timestamp with time zone not null default timezone('utc'::text, now())
);

alter table public.workouts enable row level security;

create policy "Users can manage own workouts" on public.workouts
  for all using (auth.uid() = user_id);

-- 4. WORKOUT EXERCISES (join table)
create table public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts(id) on delete cascade,
  exercise_id text not null references public.exercises(id) on delete restrict,
  rest_sec integer not null default 90,
  sequence_order integer not null
);

alter table public.workout_exercises enable row level security;

create policy "Users can manage own workout exercises" on public.workout_exercises
  for all using (
    exists (
      select 1 from public.workouts
      where workouts.id = workout_exercises.workout_id
        and workouts.user_id = auth.uid()
    )
  );

-- 5. WORKOUT SETS
create table public.workout_sets (
  id uuid primary key default gen_random_uuid(),
  workout_exercise_id uuid not null references public.workout_exercises(id) on delete cascade,
  weight_kg numeric not null default 0,
  reps integer not null default 0,
  rpe numeric,
  sequence_order integer not null,
  done boolean not null default false
);

alter table public.workout_sets enable row level security;

create policy "Users can manage own workout sets" on public.workout_sets
  for all using (
    exists (
      select 1 from public.workout_exercises
      join public.workouts on workouts.id = workout_exercises.workout_id
      where workout_exercises.id = workout_sets.workout_exercise_id
        and workouts.user_id = auth.uid()
    )
  );

-- 6. SEED DEFAULT EXERCISES (40+ presets)
insert into public.exercises (id, user_id, name, muscle, equipment, instructions, is_custom) values
  ('bb-bench',      null, 'Barbell Bench Press',      'Chest',     'Barbell',   'Lower the bar to mid-chest, press until arms lock out. Keep shoulder blades retracted.', false),
  ('db-bench',      null, 'Dumbbell Bench Press',      'Chest',     'Dumbbell',  'Press dumbbells from chest to lockout, control the descent.', false),
  ('incline-db-press', null, 'Incline Dumbbell Press', 'Chest',     'Dumbbell',  'Set bench to 30°, press dumbbells overhead.', false),
  ('cable-fly',     null, 'Cable Fly',                 'Chest',     'Cable',     'Slight bend in elbows, sweep hands together in front of chest.', false),
  ('push-up',       null, 'Push-Up',                   'Chest',     'Bodyweight','Body in a straight line, lower chest to floor, press back up.', false),
  ('deadlift',      null, 'Deadlift',                  'Back',      'Barbell',   'Hip hinge, brace core, drive the floor away and lock out at the top.', false),
  ('pull-up',       null, 'Pull-Up',                   'Back',      'Bodyweight','Pull chin over the bar, control on the way down.', false),
  ('bb-row',        null, 'Barbell Row',               'Back',      'Barbell',   'Hinge to ~45°, row bar to lower ribs.', false),
  ('db-row',        null, 'Dumbbell Row',              'Back',      'Dumbbell',  'One hand on bench, row dumbbell to hip.', false),
  ('lat-pulldown',  null, 'Lat Pulldown',              'Back',      'Cable',     'Pull bar to upper chest, squeeze lats.', false),
  ('seated-row',    null, 'Seated Cable Row',          'Back',      'Cable',     'Chest up, pull handle to lower ribs.', false),
  ('back-squat',    null, 'Back Squat',                'Legs',      'Barbell',   'Bar on upper back, squat to depth, drive up.', false),
  ('front-squat',   null, 'Front Squat',               'Legs',      'Barbell',   'Bar on front delts, elbows high, squat down.', false),
  ('leg-press',     null, 'Leg Press',                 'Legs',      'Machine',   'Feet shoulder-width, lower to 90°, press away.', false),
  ('rdl',           null, 'Romanian Deadlift',         'Legs',      'Barbell',   'Slight knee bend, hinge until hamstrings load, stand up.', false),
  ('leg-curl',      null, 'Leg Curl',                  'Legs',      'Machine',   'Curl heels toward glutes, slow eccentric.', false),
  ('leg-ext',       null, 'Leg Extension',             'Legs',      'Machine',   'Extend knees fully, pause at top.', false),
  ('lunges',        null, 'Walking Lunge',             'Legs',      'Dumbbell',  'Step forward, drop back knee to inches off floor, alternate.', false),
  ('hip-thrust',    null, 'Hip Thrust',                'Glutes',    'Barbell',   'Upper back on bench, drive hips up, squeeze glutes.', false),
  ('glute-bridge',  null, 'Glute Bridge',              'Glutes',    'Bodyweight','Feet planted, drive hips up, squeeze glutes hard.', false),
  ('ohp',           null, 'Overhead Press',            'Shoulders', 'Barbell',   'Press bar from front rack to overhead lockout.', false),
  ('db-shoulder',   null, 'Dumbbell Shoulder Press',   'Shoulders', 'Dumbbell',  'Press dumbbells overhead until lockout.', false),
  ('lateral-raise', null, 'Lateral Raise',             'Shoulders', 'Dumbbell',  'Raise arms out to shoulder height, control down.', false),
  ('rear-delt-fly', null, 'Rear Delt Fly',             'Shoulders', 'Dumbbell',  'Hinge forward, raise arms out to the sides.', false),
  ('face-pull',     null, 'Face Pull',                 'Shoulders', 'Cable',     'Pull rope to face, elbows high, external rotation at end.', false),
  ('bb-curl',       null, 'Barbell Curl',              'Arms',      'Barbell',   'Curl bar to shoulders, no swinging.', false),
  ('db-curl',       null, 'Dumbbell Curl',             'Arms',      'Dumbbell',  'Alternate or together, full range.', false),
  ('hammer-curl',   null, 'Hammer Curl',               'Arms',      'Dumbbell',  'Neutral grip, curl dumbbells to shoulders.', false),
  ('tri-pushdown',  null, 'Triceps Pushdown',          'Arms',      'Cable',     'Elbows pinned, extend arms fully.', false),
  ('skullcrusher',  null, 'Skullcrusher',              'Arms',      'Barbell',   'Lower bar to forehead, extend to lockout.', false),
  ('dip',           null, 'Dip',                       'Arms',      'Bodyweight','Lower until shoulders below elbows, press up.', false),
  ('plank',         null, 'Plank',                     'Core',      'Bodyweight','Forearms down, body straight, brace hard.', false),
  ('hanging-knee',  null, 'Hanging Knee Raise',        'Core',      'Bodyweight','Hang from bar, raise knees to chest.', false),
  ('cable-crunch',  null, 'Cable Crunch',              'Core',      'Cable',     'Kneel, crunch elbows toward knees.', false),
  ('russian-twist', null, 'Russian Twist',             'Core',      'Bodyweight','Seated, lean back, rotate side to side.', false),
  ('kb-swing',      null, 'Kettlebell Swing',          'Glutes',    'Kettlebell','Hip hinge, snap hips to swing bell to chest height.', false),
  ('kb-goblet',     null, 'Goblet Squat',              'Legs',      'Kettlebell','Hold KB at chest, squat between the elbows.', false),
  ('row-machine',   null, 'Rowing Machine',            'Cardio',    'Machine',   'Legs, then back, then arms. Reverse on the return.', false),
  ('assault-bike',  null, 'Assault Bike',              'Cardio',    'Machine',   'Steady output or intervals.', false),
  ('treadmill',     null, 'Treadmill Run',             'Cardio',    'Machine',   'Steady state or intervals.', false)
on conflict (id) do nothing;
