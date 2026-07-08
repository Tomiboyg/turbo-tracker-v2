import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Play, Plus, Search, Timer, Trash2, X, Check, Loader } from "lucide-react";
import { useWorkout, type WorkoutSet } from "../context/WorkoutContext";
import { useUnits } from "../context/UnitsContext";
import { useExerciseLibrary } from "../context/ExerciseLibraryContext";
import type { Exercise } from "../lib/mock-data";
import { formatDuration } from "./_app";

export const Route = createFileRoute("/_app/workout")({
  head: () => ({
    meta: [
      { title: "Workout — Turbo tracker" },
      { name: "description", content: "Log the current session." },
    ],
  }),
  component: WorkoutPage,
});

const RPE_STEPS = [6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10];

function WorkoutPage() {
  const routerState = useRouterState();
  const hasDetailChild = routerState.matches.some((m) => m.routeId === "/_app/workout/$workoutId");

  const {
    active,
    startWorkout,
    finishWorkout,
    elapsedSec,
    exercises,
    addExercise,
    removeExercise,
    addSet,
    updateSet,
    markSetDone,
    restRemaining,
    cancelRest,
    setRest,
    saving,
  } = useWorkout();
  const { toDisplay, fromDisplay, label } = useUnits();
  const [pickerOpen, setPickerOpen] = useState(false);
  const navigate = useNavigate();

  if (hasDetailChild) return <Outlet />;

  const handleFinish = async () => {
    await finishWorkout();
    navigate({ to: "/dashboard" });
  };

  if (!active && exercises.length === 0) {
    return (
      <div className="grid min-h-[60vh] place-items-center text-center">
        <div>
          <h1 className="font-display text-5xl">Ready to train?</h1>
          <p className="mt-2 text-muted-foreground">Start a session and add your first exercise.</p>
          <button
            onClick={() => startWorkout()}
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-volt px-6 py-3 font-semibold text-volt-foreground hover:opacity-90"
          >
            <Play className="h-5 w-5" /> Start empty workout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between rounded-2xl border border-border bg-card px-5 py-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Elapsed</div>
          <div className="font-display text-4xl numeric">{formatDuration(elapsedSec)}</div>
        </div>
        <button
          onClick={handleFinish}
          disabled={saving}
          className="rounded-md bg-volt px-4 py-2 font-semibold text-volt-foreground hover:opacity-90 disabled:opacity-50"
        >
          {saving ? (
            <span className="inline-flex items-center gap-2">
              <Loader className="h-4 w-4 animate-spin" /> Saving
            </span>
          ) : (
            "Finish"
          )}
        </button>
      </header>

      {restRemaining !== null ? (
        <div className="flex items-center justify-between rounded-xl border border-volt bg-volt/10 px-5 py-3">
          <div className="flex items-center gap-2 text-volt">
            <Timer className="h-4 w-4" />
            <span className="text-sm font-semibold">Rest</span>
            <span className="numeric font-display text-2xl">
              {String(Math.floor(restRemaining / 60)).padStart(1, "0")}:
              {String(restRemaining % 60).padStart(2, "0")}
            </span>
          </div>
          <button
            onClick={cancelRest}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Skip
          </button>
        </div>
      ) : null}

      <div className="space-y-4">
        {exercises.map((we) => (
          <div key={we.id} className="rounded-2xl border border-border bg-card p-4">
            <div className="mb-3 flex items-start justify-between gap-2">
              <div>
                <div className="font-display text-2xl">{we.exercise.name}</div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">
                  {we.exercise.muscle} · {we.exercise.equipment}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Timer className="h-3.5 w-3.5" /> Rest
                  <select
                    value={we.restSec}
                    onChange={(e) => setRest(we.id, Number(e.target.value))}
                    className="rounded-md border border-border bg-background px-2 py-1 text-xs numeric"
                  >
                    {[30, 60, 90, 120, 180, 240].map((s) => (
                      <option key={s} value={s}>
                        {s}s
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  onClick={() => removeExercise(we.id)}
                  className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-[32px_1fr_1fr_1fr_36px] items-center gap-2 border-b border-border pb-1 text-[11px] uppercase tracking-widest text-muted-foreground">
              <div>Set</div>
              <div>Weight ({label})</div>
              <div>Reps</div>
              <div>RPE</div>
              <div />
            </div>
            <div className="mt-2 space-y-2">
              {we.sets.map((s, i) => (
                <SetRow
                  key={s.id}
                  index={i + 1}
                  set={s}
                  onWeight={(v) => updateSet(we.id, s.id, { weightKg: fromDisplay(v) })}
                  onReps={(v) => updateSet(we.id, s.id, { reps: v })}
                  onRpe={(v) => updateSet(we.id, s.id, { rpe: v })}
                  onDone={() => markSetDone(we.id, s.id)}
                  displayWeight={toDisplay(s.weightKg)}
                />
              ))}
            </div>

            <button
              onClick={() => addSet(we.id)}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-border py-2 text-sm text-muted-foreground hover:border-volt hover:text-volt"
            >
              <Plus className="h-4 w-4" /> Add set
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={() => setPickerOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-volt py-4 font-semibold text-volt-foreground hover:opacity-90"
      >
        <Plus className="h-5 w-5" /> Add exercise
      </button>

      {pickerOpen ? (
        <ExercisePicker
          onClose={() => setPickerOpen(false)}
          onPick={(e) => {
            addExercise(e);
            setPickerOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}

function SetRow({
  index,
  set,
  displayWeight,
  onWeight,
  onReps,
  onRpe,
  onDone,
}: {
  index: number;
  set: WorkoutSet;
  displayWeight: number;
  onWeight: (v: number) => void;
  onReps: (v: number) => void;
  onRpe: (v: number) => void;
  onDone: () => void;
}) {
  const [showRpe, setShowRpe] = useState(false);
  return (
    <div>
      <div
        className={`grid grid-cols-[32px_1fr_1fr_1fr_36px] items-center gap-2 rounded-md px-1 py-1 ${
          set.done ? "bg-volt/10" : ""
        }`}
      >
        <div className="numeric text-sm font-semibold text-muted-foreground">{index}</div>
        <input
          type="number"
          inputMode="decimal"
          value={displayWeight || ""}
          onChange={(e) => onWeight(Number(e.target.value))}
          className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm numeric outline-none focus:border-volt"
        />
        <input
          type="number"
          inputMode="numeric"
          value={set.reps || ""}
          onChange={(e) => onReps(Number(e.target.value))}
          className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm numeric outline-none focus:border-volt"
        />
        <button
          onClick={() => setShowRpe((v) => !v)}
          className={`rounded-md border px-2 py-1.5 text-sm numeric ${
            set.rpe !== null
              ? "border-volt bg-volt/15 text-volt"
              : "border-border bg-background text-muted-foreground"
          }`}
        >
          {set.rpe ?? "—"}
        </button>
        <button
          onClick={onDone}
          className={`grid h-8 w-8 place-items-center rounded-md ${
            set.done ? "bg-volt text-volt-foreground" : "border border-border text-muted-foreground"
          }`}
        >
          <Check className="h-4 w-4" />
        </button>
      </div>
      {showRpe ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {RPE_STEPS.map((r) => (
            <button
              key={r}
              onClick={() => {
                onRpe(r);
                setShowRpe(false);
              }}
              className={`rounded-md border px-2.5 py-1 text-xs numeric ${
                set.rpe === r
                  ? "border-volt bg-volt text-volt-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-volt hover:text-foreground"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ExercisePicker({
  onClose,
  onPick,
}: {
  onClose: () => void;
  onPick: (e: Exercise) => void;
}) {
  const { exercises } = useExerciseLibrary();
  const [q, setQ] = useState("");
  const filtered = useMemo(
    () =>
      exercises.filter(
        (e) =>
          e.name.toLowerCase().includes(q.toLowerCase()) ||
          e.muscle.toLowerCase().includes(q.toLowerCase()),
      ),
    [exercises, q],
  );
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 sm:items-center">
      <div className="max-h-[85vh] w-full max-w-lg overflow-hidden rounded-t-2xl bg-card sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="font-display text-xl">Add exercise</div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search exercises"
              className="w-full rounded-md border border-border bg-background py-2.5 pl-9 pr-3 text-sm outline-none focus:border-volt"
            />
          </div>
        </div>
        <div className="max-h-[55vh] overflow-y-auto px-2 pb-4">
          {filtered.map((e) => (
            <button
              key={e.id}
              onClick={() => onPick(e)}
              className="flex w-full items-center justify-between rounded-md px-3 py-3 text-left hover:bg-accent"
            >
              <div>
                <div className="font-semibold">{e.name}</div>
                <div className="text-xs text-muted-foreground">
                  {e.muscle} · {e.equipment}
                </div>
              </div>
              <Plus className="h-4 w-4 text-volt" />
            </button>
          ))}
          {filtered.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">No matches.</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
