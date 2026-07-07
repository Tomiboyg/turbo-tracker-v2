import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import type { WorkoutRow, WorkoutExerciseRow, WorkoutSetRow } from "../lib/database.types";

export type WorkoutWithDetails = WorkoutRow & {
  exercises: (WorkoutExerciseRow & { sets: WorkoutSetRow[] })[];
};

export type WeeklyVolume = { week: string; volume: number };
export type WeeklySessions = { week: string; sessions: number };
export type MuscleSplit = { muscle: string; value: number };
export type OneRmPoint = { week: string; oneRm: number };

function getWeekId(date: Date): string {
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / (7 * 86400000));
  return `W${Math.max(0, 8 - diff)}`;
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekEnd(date: Date): Date {
  const d = getWeekStart(date);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
}

function isThisWeek(date: Date): boolean {
  const now = new Date();
  const start = getWeekStart(now);
  const end = getWeekEnd(now);
  return date >= start && date <= end;
}

export function computeStreak(workouts: WorkoutRow[]): number {
  if (workouts.length === 0) return 0;
  const dates = workouts.map((w) => {
    const d = new Date(w.completed_at);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  });
  const unique = [...new Set(dates)].sort((a, b) => b - a);
  let streak = 1;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTs = today.getTime();
  if (unique[0] < todayTs - 86400000) return 0;
  for (let i = 0; i < unique.length - 1; i++) {
    if (unique[i] - unique[i + 1] === 86400000) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export function computeWeeklyVolume(workouts: WorkoutRow[]): WeeklyVolume[] {
  const weeks: Record<string, number> = {};
  for (let i = 7; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i * 7);
    weeks[getWeekId(d)] = 0;
  }
  for (const w of workouts) {
    const wk = getWeekId(new Date(w.completed_at));
    if (wk in weeks) weeks[wk] += Number(w.volume_kg);
  }
  return Object.entries(weeks).map(([week, volume]) => ({ week, volume }));
}

export function computeWeeklySessions(workouts: WorkoutRow[]): WeeklySessions[] {
  const weeks: Record<string, number> = {};
  for (let i = 7; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i * 7);
    weeks[getWeekId(d)] = 0;
  }
  for (const w of workouts) {
    const wk = getWeekId(new Date(w.completed_at));
    if (wk in weeks) weeks[wk]++;
  }
  return Object.entries(weeks).map(([week, sessions]) => ({ week, sessions }));
}

export function computeMuscleSplit(workouts: WorkoutWithDetails[]): MuscleSplit[] {
  const counts: Record<string, number> = {};
  let total = 0;
  for (const w of workouts) {
    for (const we of w.exercises) {
      for (const s of we.sets) {
        if (s.done) {
          counts[we.exercise_id] = (counts[we.exercise_id] || 0) + 1;
          total++;
        }
      }
    }
  }
  if (total === 0) return [];
  const muscleMap: Record<string, string> = {
    "bb-bench": "Chest",
    "db-bench": "Chest",
    "incline-db-press": "Chest",
    "cable-fly": "Chest",
    "push-up": "Chest",
    deadlift: "Back",
    "pull-up": "Back",
    "bb-row": "Back",
    "db-row": "Back",
    "lat-pulldown": "Back",
    "seated-row": "Back",
    "back-squat": "Legs",
    "front-squat": "Legs",
    "leg-press": "Legs",
    rdl: "Legs",
    "leg-curl": "Legs",
    "leg-ext": "Legs",
    lunges: "Legs",
    "kb-goblet": "Legs",
    "hip-thrust": "Glutes",
    "glute-bridge": "Glutes",
    "kb-swing": "Glutes",
    ohp: "Shoulders",
    "db-shoulder": "Shoulders",
    "lateral-raise": "Shoulders",
    "rear-delt-fly": "Shoulders",
    "face-pull": "Shoulders",
    "bb-curl": "Arms",
    "db-curl": "Arms",
    "hammer-curl": "Arms",
    "tri-pushdown": "Arms",
    skullcrusher: "Arms",
    dip: "Arms",
    plank: "Core",
    "hanging-knee": "Core",
    "cable-crunch": "Core",
    "russian-twist": "Core",
    "row-machine": "Cardio",
    "assault-bike": "Cardio",
    treadmill: "Cardio",
  };
  const muscleTotals: Record<string, number> = {};
  let totalMuscleSets = 0;
  for (const [exId, count] of Object.entries(counts)) {
    const muscle = muscleMap[exId] || "Other";
    muscleTotals[muscle] = (muscleTotals[muscle] || 0) + count;
    totalMuscleSets += count;
  }
  return Object.entries(muscleTotals).map(([muscle, value]) => ({
    muscle,
    value: Math.round((value / totalMuscleSets) * 100),
  }));
}

export function computePRs(workouts: WorkoutWithDetails[]) {
  type PR = { exercise: string; weightKg: number; reps: number; date: string };
  const prs: Record<string, PR> = {};
  for (const w of workouts) {
    for (const we of w.exercises) {
      for (const s of we.sets) {
        if (s.done && s.weight_kg > 0) {
          const key = we.exercise_id;
          const existing = prs[key];
          const epley = s.weight_kg * (1 + s.reps / 30);
          const existingEpley = existing ? existing.weightKg * (1 + existing.reps / 30) : 0;
          if (!existing || epley > existingEpley) {
            prs[key] = {
              exercise: key,
              weightKg: s.weight_kg,
              reps: s.reps,
              date: w.completed_at,
            };
          }
        }
      }
    }
  }
  return Object.values(prs).sort((a, b) => b.weightKg - a.weightKg);
}

export function computeOneRmHistory(
  workouts: WorkoutWithDetails[],
  exerciseId: string,
): OneRmPoint[] {
  const points: OneRmPoint[] = [];
  const sorted = [...workouts].sort(
    (a, b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime(),
  );
  for (const w of sorted) {
    for (const we of w.exercises) {
      if (we.exercise_id === exerciseId) {
        let bestEpley = 0;
        for (const s of we.sets) {
          if (s.done && s.weight_kg > 0) {
            const epley = s.weight_kg * (1 + s.reps / 30);
            if (epley > bestEpley) bestEpley = epley;
          }
        }
        if (bestEpley > 0) {
          points.push({ week: getWeekId(new Date(w.completed_at)), oneRm: bestEpley });
        }
      }
    }
  }
  return points;
}

export function useWorkoutHistory() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["workouts", user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return [];

      const { data: workouts, error } = await supabase
        .from("workouts")
        .select("*, exercises:workout_exercises(*, sets:workout_sets(*))")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false });

      if (error) throw error;
      return (workouts ?? []) as WorkoutWithDetails[];
    },
    staleTime: 30_000,
  });
}

export function useDashboardData() {
  const { data: workouts = [], isLoading } = useWorkoutHistory();
  const now = new Date();

  const thisWeekWorkouts = workouts.filter((w) => isThisWeek(new Date(w.completed_at)));

  const workoutsThisWeek = thisWeekWorkouts.length;

  const weeklyVolumeTotal = thisWeekWorkouts.reduce((sum, w) => sum + Number(w.volume_kg), 0);

  const timeTrainedMin = thisWeekWorkouts.reduce((sum, w) => sum + w.duration_min, 0);

  const streak = computeStreak(workouts);

  const weeklyVolume = computeWeeklyVolume(workouts);

  const recentWorkouts = workouts.slice(0, 5).map((w) => {
    const topSets = w.exercises.flatMap((we) =>
      we.sets
        .filter((s) => s.done && s.weight_kg > 0)
        .map((s) => ({
          exercise: we.exercise_id,
          weightKg: s.weight_kg,
          reps: s.reps,
          rpe: s.rpe ?? 0,
        })),
    );
    return {
      id: w.id,
      date: formatRelativeDate(new Date(w.completed_at)),
      name: w.name,
      durationMin: w.duration_min,
      volumeKg: Number(w.volume_kg),
      topSets: topSets.slice(0, 3),
    };
  });

  return {
    workouts,
    workoutsThisWeek,
    weeklyVolumeTotal,
    timeTrainedMin,
    streak,
    weeklyVolume,
    recentWorkouts,
    isLoading,
  };
}

export function useProgressData() {
  const { data: workouts = [], isLoading } = useWorkoutHistory();
  const weeklySessions = computeWeeklySessions(workouts);
  const weeklyVolume = computeWeeklyVolume(workouts);
  const muscleSplit = computeMuscleSplit(workouts);
  const prs = computePRs(workouts);

  return {
    workouts,
    weeklySessions,
    weeklyVolume,
    muscleSplit,
    prs,
    isLoading,
  };
}

function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
