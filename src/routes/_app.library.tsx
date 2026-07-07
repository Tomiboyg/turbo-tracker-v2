import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search, X } from "lucide-react";
import { useExerciseLibrary } from "../context/ExerciseLibraryContext";
import type { Equipment, Exercise, MuscleGroup } from "../lib/mock-data";
import { useWorkout } from "../context/WorkoutContext";

export const Route = createFileRoute("/_app/library")({
  head: () => ({
    meta: [
      { title: "Exercise library — Turbo tracker" },
      { name: "description", content: "Browse presets and add your own custom exercises." },
    ],
  }),
  component: LibraryPage,
});

const MUSCLES: (MuscleGroup | "All")[] = [
  "All",
  "Chest",
  "Back",
  "Legs",
  "Shoulders",
  "Arms",
  "Core",
  "Glutes",
  "Cardio",
];
const EQUIPMENTS: (Equipment | "All")[] = [
  "All",
  "Barbell",
  "Dumbbell",
  "Machine",
  "Cable",
  "Bodyweight",
  "Kettlebell",
];

function LibraryPage() {
  const { exercises } = useExerciseLibrary();
  const [q, setQ] = useState("");
  const [muscle, setMuscle] = useState<(typeof MUSCLES)[number]>("All");
  const [equip, setEquip] = useState<(typeof EQUIPMENTS)[number]>("All");
  const [showAdd, setShowAdd] = useState(false);
  const [detail, setDetail] = useState<Exercise | null>(null);

  const filtered = useMemo(
    () =>
      exercises.filter((e) => {
        if (muscle !== "All" && e.muscle !== muscle) return false;
        if (equip !== "All" && e.equipment !== equip) return false;
        if (q && !e.name.toLowerCase().includes(q.toLowerCase())) return false;
        return true;
      }),
    [exercises, q, muscle, equip],
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-5xl">Exercise library</h1>
          <p className="mt-1 text-muted-foreground">
            {exercises.length} exercises · tap to see form cues
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-2 rounded-md bg-volt px-4 py-2 font-semibold text-volt-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Add custom
        </button>
      </header>

      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search exercises"
            className="w-full rounded-md border border-border bg-card py-2.5 pl-9 pr-3 text-sm outline-none focus:border-volt"
          />
        </div>
        <ChipRow label="Muscle" options={MUSCLES} value={muscle} onChange={setMuscle} />
        <ChipRow label="Equipment" options={EQUIPMENTS} value={equip} onChange={setEquip} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((e) => (
          <button
            key={e.id}
            onClick={() => setDetail(e)}
            className="group rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-volt"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="font-display text-xl">{e.name}</div>
                <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
                  {e.muscle} · {e.equipment}
                </div>
              </div>
              {e.custom ? (
                <span className="rounded-full bg-volt/15 px-2 py-0.5 text-[10px] uppercase tracking-widest text-volt">
                  Custom
                </span>
              ) : null}
            </div>
          </button>
        ))}
        {filtered.length === 0 ? (
          <div className="col-span-full rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">
            No exercises match your filters.
          </div>
        ) : null}
      </div>

      {showAdd ? <AddCustomDialog onClose={() => setShowAdd(false)} /> : null}
      {detail ? <ExerciseDetail exercise={detail} onClose={() => setDetail(null)} /> : null}
    </div>
  );
}

function ChipRow<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 text-[11px] uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={o}
            onClick={() => onChange(o)}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              value === o
                ? "border-volt bg-volt text-volt-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function AddCustomDialog({ onClose }: { onClose: () => void }) {
  const { addCustom } = useExerciseLibrary();
  const [name, setName] = useState("");
  const [muscle, setMuscle] = useState<MuscleGroup>("Chest");
  const [equipment, setEquipment] = useState<Equipment>("Barbell");
  const [instructions, setInstructions] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addCustom({ name: name.trim(), muscle, equipment, instructions: instructions.trim() });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6"
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="font-display text-2xl">New custom exercise</div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs uppercase tracking-widest text-muted-foreground">
              Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 outline-none focus:border-volt"
              placeholder="e.g. Zercher Squat"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs uppercase tracking-widest text-muted-foreground">
                Muscle
              </label>
              <select
                value={muscle}
                onChange={(e) => setMuscle(e.target.value as MuscleGroup)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 outline-none focus:border-volt"
              >
                {MUSCLES.filter((m) => m !== "All").map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-widest text-muted-foreground">
                Equipment
              </label>
              <select
                value={equipment}
                onChange={(e) => setEquipment(e.target.value as Equipment)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 outline-none focus:border-volt"
              >
                {EQUIPMENTS.filter((m) => m !== "All").map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-widest text-muted-foreground">
              Notes
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-border bg-background px-3 py-2 outline-none focus:border-volt"
              placeholder="Form cues, setup, tempo"
            />
          </div>
        </div>
        <button
          type="submit"
          className="mt-5 w-full rounded-md bg-volt py-2.5 font-semibold text-volt-foreground hover:opacity-90"
        >
          Save exercise
        </button>
      </form>
    </div>
  );
}

function ExerciseDetail({ exercise, onClose }: { exercise: Exercise; onClose: () => void }) {
  const { addExercise } = useWorkout();
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 sm:items-center">
      <div className="w-full max-w-lg rounded-t-2xl border border-border bg-card p-6 sm:rounded-2xl">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">
              {exercise.muscle} · {exercise.equipment}
            </div>
            <div className="mt-1 font-display text-3xl">{exercise.name}</div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {exercise.instructions || "No notes yet."}
        </p>
        <button
          onClick={() => {
            addExercise(exercise);
            onClose();
          }}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-volt py-2.5 font-semibold text-volt-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Add to workout
        </button>
      </div>
    </div>
  );
}
