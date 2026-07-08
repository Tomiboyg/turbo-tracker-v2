import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Loader, ArrowLeft, Pencil, Save, X, Plus, Trash2 } from "lucide-react";
import { useWorkoutById, useUpdateWorkout, useDeleteWorkout } from "../hooks/use-workout-history";
import { useExerciseLibrary } from "../context/ExerciseLibraryContext";
import { useUnits } from "../context/UnitsContext";

export const Route = createFileRoute("/_app/workout/$workoutId")({
  head: () => ({
    meta: [{ title: "Workout — Turbo tracker" }],
  }),
  component: WorkoutDetailPage,
});

function WorkoutDetailPage() {
  const { workoutId } = Route.useParams();
  const navigate = useNavigate();
  const { data: workout, isLoading } = useWorkoutById(workoutId);
  const { exercises: libExercises } = useExerciseLibrary();
  const { format, toDisplay } = useUnits();
  const updateWorkout = useUpdateWorkout();
  const deleteWorkout = useDeleteWorkout();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [exData, setExData] = useState<EditableExercise[]>([]);

  const exercisesInWorkout = useMemo(() => {
    if (!workout) return [];
    const map: Record<string, string> = {};
    for (const ex of libExercises) map[ex.id] = ex.name;
    return workout.exercises.map((we) => ({
      id: we.id,
      exercise_id: we.exercise_id,
      name: map[we.exercise_id] ?? we.exercise_id,
      restSec: we.rest_sec,
      sets: we.sets.map((s) => ({
        id: s.id,
        weightKg: s.weight_kg,
        reps: s.reps,
        rpe: s.rpe,
        done: s.done,
      })),
    }));
  }, [workout, libExercises]);

  const totalVolume = useMemo(() => {
    let v = 0;
    for (const ex of exData.length > 0 ? exData : exercisesInWorkout) {
      for (const s of ex.sets) {
        if (s.done) v += s.weightKg * s.reps;
      }
    }
    return v;
  }, [exData, exercisesInWorkout]);

  const toggleEdit = () => {
    if (!editing) {
      setName(workout?.name ?? "Workout");
      setExData(exercisesInWorkout.map((ex) => ({
        ...ex,
        sets: ex.sets.map((s) => ({ ...s })),
      })));
    }
    setEditing(!editing);
  };

  const handleSave = async () => {
    if (!workout) return;
    await updateWorkout.mutateAsync({
      id: workout.id,
      name,
      exercises: exData.map((ex) => ({
        exerciseId: ex.exercise_id,
        restSec: ex.restSec,
        sets: ex.sets.map((s) => ({
          weightKg: s.weightKg,
          reps: s.reps,
          rpe: s.rpe,
          done: s.done,
        })),
      })),
    });
    setEditing(false);
  };

  const handleDelete = () => {
    if (!window.confirm("Delete this workout?")) return;
    deleteWorkout.mutate(workoutId, {
      onSuccess: () => navigate({ to: "/dashboard" }),
    });
  };

  const updateSet = (exIdx: number, setIdx: number, patch: Partial<EditableSet>) => {
    setExData((prev) => {
      const next = prev.map((ex) => ({ ...ex, sets: ex.sets.map((s) => ({ ...s })) }));
      Object.assign(next[exIdx].sets[setIdx], patch);
      return next;
    });
  };

  const addSet = (exIdx: number) => {
    setExData((prev) => {
      const next = prev.map((ex) => ({ ...ex, sets: ex.sets.map((s) => ({ ...s })) }));
      const last = next[exIdx].sets[next[exIdx].sets.length - 1];
      next[exIdx].sets.push({
        id: uid(),
        weightKg: last?.weightKg ?? 0,
        reps: last?.reps ?? 0,
        rpe: null,
        done: false,
      });
      return next;
    });
  };

  const removeSet = (exIdx: number, setIdx: number) => {
    setExData((prev) => {
      const next = prev.map((ex) => ({ ...ex, sets: ex.sets.map((s) => ({ ...s })) }));
      next[exIdx].sets.splice(setIdx, 1);
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader className="h-8 w-8 animate-spin text-volt" />
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        <p>Workout not found.</p>
        <Link to="/dashboard" className="mt-4 inline-block text-volt hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const displayEx = editing ? exData : exercisesInWorkout;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/dashboard" className="rounded-md p-2 text-muted-foreground hover:bg-accent">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          {editing ? (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-transparent font-display text-4xl outline-none"
            />
          ) : (
            <h1 className="font-display text-4xl">{workout.name}</h1>
          )}
        </div>
        {editing ? (
          <div className="flex gap-2">
            <button
              onClick={toggleEdit}
              className="flex items-center gap-1.5 rounded-md border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-accent"
            >
              <X className="h-4 w-4" /> Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={updateWorkout.isPending}
              className="flex items-center gap-1.5 rounded-md bg-volt px-4 py-2 text-sm font-semibold text-volt-foreground hover:opacity-90 disabled:opacity-50"
            >
              {updateWorkout.isPending ? <Loader className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 rounded-md border border-destructive/30 px-4 py-2 text-sm font-semibold text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" /> Delete
            </button>
            <button
              onClick={toggleEdit}
              className="flex items-center gap-1.5 rounded-md bg-volt px-4 py-2 text-sm font-semibold text-volt-foreground hover:opacity-90"
            >
              <Pencil className="h-4 w-4" /> Edit
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        <span>{formatRelativeDate(new Date(workout.completed_at))}</span>
        <span className="numeric">{workout.duration_min} min</span>
        <span className="numeric">{format(totalVolume, 0)}</span>
      </div>

      <div className="space-y-4">
        {displayEx.map((ex, exIdx) => (
          <section key={ex.id} className="rounded-2xl border border-border bg-card p-5">
            <div className="font-display text-xl">{ex.name}</div>
            <div className="mt-3 space-y-2">
              <div className="flex gap-3 px-1 text-xs uppercase tracking-widest text-muted-foreground">
                <span className="w-12 text-center">Set</span>
                <span className="flex-1">Weight</span>
                <span className="w-16 text-center">Reps</span>
                <span className="w-16 text-center">RPE</span>
                <span className="w-16 text-center">Done</span>
                {editing && <span className="w-8" />}
              </div>
              {ex.sets.map((s, sIdx) => (
                <div key={s.id} className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2.5 text-sm">
                  <span className="w-12 text-center text-muted-foreground numeric">#{sIdx + 1}</span>
                  {editing ? (
                    <>
                      <InputNum
                        value={s.weightKg}
                        onChange={(v) => updateSet(exIdx, sIdx, { weightKg: v })}
                        min={0}
                        step={0.5}
                        className="flex-1"
                      />
                      <InputNum
                        value={s.reps}
                        onChange={(v) => updateSet(exIdx, sIdx, { reps: v })}
                        min={0}
                        step={1}
                        className="w-16 text-center"
                      />
                      <InputNum
                        value={s.rpe ?? 0}
                        onChange={(v) => updateSet(exIdx, sIdx, { rpe: v || null })}
                        min={0}
                        max={10}
                        step={0.5}
                        className="w-16 text-center"
                      />
                      <button
                        onClick={() => updateSet(exIdx, sIdx, { done: !s.done })}
                        className={`flex h-8 w-16 items-center justify-center rounded-md text-xs font-semibold ${
                          s.done ? "bg-volt text-volt-foreground" : "border border-border text-muted-foreground"
                        }`}
                      >
                        {s.done ? "YES" : "NO"}
                      </button>
                      <button
                        onClick={() => removeSet(exIdx, sIdx)}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 numeric">
                        {toDisplay(s.weightKg).toFixed(1).replace(/\.0$/, "")} {editing ? "" : ""}
                      </span>
                      <span className="w-16 text-center numeric">{s.reps}</span>
                      <span className="w-16 text-center numeric">{s.rpe ?? "—"}</span>
                      <span className={`w-16 text-center text-xs font-semibold ${s.done ? "text-volt" : "text-muted-foreground"}`}>
                        {s.done ? "Done" : "—"}
                      </span>
                    </>
                  )}
                </div>
              ))}
            </div>
            {editing && (
              <button
                onClick={() => addSet(exIdx)}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border py-2.5 text-sm text-muted-foreground hover:border-volt hover:text-volt"
              >
                <Plus className="h-4 w-4" /> Add set
              </button>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}

type EditableSet = {
  id: string;
  weightKg: number;
  reps: number;
  rpe: number | null;
  done: boolean;
};

type EditableExercise = {
  id: string;
  exercise_id: string;
  name: string;
  restSec: number;
  sets: EditableSet[];
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function InputNum({
  value,
  onChange,
  min,
  max,
  step,
  className,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}) {
  return (
    <input
      type="number"
      value={value || ""}
      onChange={(e) => {
        const v = parseFloat(e.target.value);
        if (!isNaN(v)) onChange(v);
      }}
      onBlur={(e) => {
        if (e.target.value === "") onChange(0);
      }}
      min={min}
      max={max}
      step={step}
      className={`rounded-md border border-input bg-background px-2 py-1 text-sm outline-none focus:border-volt focus:ring-1 focus:ring-volt numeric ${className ?? ""}`}
    />
  );
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
