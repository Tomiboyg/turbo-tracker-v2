import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";
import type { Exercise } from "../lib/mock-data";

const STORAGE_KEY = "turbo-active-workout";
const MAX_SESSION_MS = 6 * 3600 * 1000;

type StoredWorkout = {
  startedAt: number;
  exercises: WorkoutExercise[];
};

export type WorkoutSet = {
  id: string;
  weightKg: number;
  reps: number;
  rpe: number | null;
  done: boolean;
};

export type WorkoutExercise = {
  id: string;
  exercise: Exercise;
  sets: WorkoutSet[];
  restSec: number;
};

type WorkoutContextValue = {
  active: boolean;
  startedAt: number | null;
  elapsedSec: number;
  exercises: WorkoutExercise[];
  restRemaining: number | null;
  saving: boolean;
  startWorkout: () => void;
  finishWorkout: () => Promise<void>;
  addExercise: (e: Exercise) => void;
  removeExercise: (id: string) => void;
  addSet: (exerciseId: string) => void;
  updateSet: (exerciseId: string, setId: string, patch: Partial<WorkoutSet>) => void;
  markSetDone: (exerciseId: string, setId: string) => void;
  setRest: (exerciseId: string, sec: number) => void;
  cancelRest: () => void;
};

const WorkoutContext = createContext<WorkoutContextValue | null>(null);

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [startedAt, setStartedAt] = useState<number | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const stored: StoredWorkout = JSON.parse(raw);
      if (Date.now() - stored.startedAt > MAX_SESSION_MS) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return stored.startedAt;
    } catch {
      return null;
    }
  });
  const [elapsedSec, setElapsedSec] = useState(0);
  const [exercises, setExercises] = useState<WorkoutExercise[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const stored: StoredWorkout = JSON.parse(raw);
      if (Date.now() - stored.startedAt > MAX_SESSION_MS) {
        localStorage.removeItem(STORAGE_KEY);
        return [];
      }
      return stored.exercises;
    } catch {
      return [];
    }
  });
  const [restRemaining, setRestRemaining] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const restRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!startedAt) return;
    const t = setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => clearInterval(t);
  }, [startedAt]);

  useEffect(() => {
    if (restRemaining === null) return;
    if (restRemaining <= 0) {
      setRestRemaining(null);
      return;
    }
    const t = setTimeout(() => setRestRemaining((r) => (r === null ? null : r - 1)), 1000);
    return () => clearTimeout(t);
  }, [restRemaining]);

  useEffect(() => {
    if (startedAt && exercises.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ startedAt, exercises }));
    } else if (!startedAt) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [startedAt, exercises]);

  const startWorkout = () => {
    setStartedAt(Date.now());
    setElapsedSec(0);
    setExercises([]);
  };

  const finishWorkout: WorkoutContextValue["finishWorkout"] = async () => {
    if (!startedAt || !user) return;
    setSaving(true);

    const completedAt = Date.now();
    const durationMin = Math.max(1, Math.floor((completedAt - startedAt) / 60000));
    let volumeKg = 0;
    for (const we of exercises) {
      for (const s of we.sets) {
        if (s.done) volumeKg += s.weightKg * s.reps;
      }
    }

    const { data: workout, error: wErr } = await supabase
      .from("workouts")
      .insert({
        user_id: user.id,
        name: "Workout",
        started_at: new Date(startedAt).toISOString(),
        completed_at: new Date(completedAt).toISOString(),
        duration_min: durationMin,
        volume_kg: volumeKg,
      } as never)
      .select("id")
      .single();

    if (wErr || !workout) {
      console.error("Failed to save workout", wErr);
      setSaving(false);
      return;
    }

    for (let i = 0; i < exercises.length; i++) {
      const we = exercises[i];
      const { data: weRow, error: weErr } = await supabase
        .from("workout_exercises")
        .insert({
          workout_id: workout.id,
          exercise_id: we.exercise.id,
          rest_sec: we.restSec,
          sequence_order: i,
        } as never)
        .select("id")
        .single();

      if (weErr || !weRow) {
        console.error("Failed to save workout exercise", weErr);
        continue;
      }

      for (let j = 0; j < we.sets.length; j++) {
        const s = we.sets[j];
        await supabase.from("workout_sets").insert({
          workout_exercise_id: weRow.id,
          weight_kg: s.weightKg,
          reps: s.reps,
          rpe: s.rpe,
          sequence_order: j,
          done: s.done,
        } as never);
      }
    }

    setStartedAt(null);
    setElapsedSec(0);
    setExercises([]);
    setRestRemaining(null);
    setSaving(false);
  };

  const addExercise = (e: Exercise) => {
    setExercises((prev) => [
      ...prev,
      {
        id: uid(),
        exercise: e,
        restSec: 90,
        sets: [{ id: uid(), weightKg: 0, reps: 0, rpe: null, done: false }],
      },
    ]);
    if (!startedAt) setStartedAt(Date.now());
  };

  const removeExercise = (id: string) => {
    setExercises((prev) => prev.filter((x) => x.id !== id));
  };

  const addSet = (exerciseId: string) => {
    setExercises((prev) =>
      prev.map((x) => {
        if (x.id !== exerciseId) return x;
        const last = x.sets[x.sets.length - 1];
        return {
          ...x,
          sets: [
            ...x.sets,
            {
              id: uid(),
              weightKg: last?.weightKg ?? 0,
              reps: last?.reps ?? 0,
              rpe: null,
              done: false,
            },
          ],
        };
      }),
    );
  };

  const updateSet: WorkoutContextValue["updateSet"] = (exerciseId, setId, patch) => {
    setExercises((prev) =>
      prev.map((x) =>
        x.id === exerciseId
          ? { ...x, sets: x.sets.map((s) => (s.id === setId ? { ...s, ...patch } : s)) }
          : x,
      ),
    );
  };

  const markSetDone: WorkoutContextValue["markSetDone"] = (exerciseId, setId) => {
    let rest = 90;
    setExercises((prev) =>
      prev.map((x) => {
        if (x.id !== exerciseId) return x;
        rest = x.restSec;
        return {
          ...x,
          sets: x.sets.map((s) => (s.id === setId ? { ...s, done: !s.done } : s)),
        };
      }),
    );
    if (restRef.current) clearInterval(restRef.current);
    setRestRemaining(rest);
  };

  const setRest: WorkoutContextValue["setRest"] = (exerciseId, sec) => {
    setExercises((prev) => prev.map((x) => (x.id === exerciseId ? { ...x, restSec: sec } : x)));
  };

  const cancelRest = () => setRestRemaining(null);

  return (
    <WorkoutContext.Provider
      value={{
        active: startedAt !== null,
        startedAt,
        elapsedSec,
        exercises,
        restRemaining,
        saving,
        startWorkout,
        finishWorkout,
        addExercise,
        removeExercise,
        addSet,
        updateSet,
        markSetDone,
        setRest,
        cancelRest,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout() {
  const ctx = useContext(WorkoutContext);
  if (!ctx) throw new Error("useWorkout must be used inside WorkoutProvider");
  return ctx;
}
