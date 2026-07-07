import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Loader } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useUnits } from "../context/UnitsContext";
import { useExerciseLibrary } from "../context/ExerciseLibraryContext";
import {
  useProgressData,
  computeOneRmHistory,
  type WorkoutWithDetails,
} from "../hooks/use-workout-history";

export const Route = createFileRoute("/_app/progress")({
  head: () => ({
    meta: [
      { title: "Progress — Turbo tracker" },
      { name: "description", content: "Charts and PRs across your training." },
    ],
  }),
  component: ProgressPage,
});

const TABS = ["Overview", "Exercises", "PRs"] as const;
type Tab = (typeof TABS)[number];

const PIE_COLORS = [
  "var(--color-volt)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "var(--color-muted-foreground)",
];

function ProgressPage() {
  const [tab, setTab] = useState<Tab>("Overview");
  const { format, toDisplay, label } = useUnits();
  const { exercises: libExercises } = useExerciseLibrary();
  const { workouts, weeklySessions, weeklyVolume, muscleSplit, prs, isLoading } = useProgressData();
  const [selectedEx, setSelectedEx] = useState<string>("");

  const exerciseOptions = useMemo(() => {
    const ids = new Set<string>();
    for (const w of workouts) {
      for (const we of w.exercises) {
        ids.add(we.exercise_id);
      }
    }
    return Array.from(ids)
      .map((id) => {
        const ex = libExercises.find((e) => e.id === id);
        return { id, name: ex?.name ?? id };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [workouts, libExercises]);

  const oneRmData = useMemo(() => {
    if (!selectedEx) return [];
    return computeOneRmHistory(workouts as unknown as WorkoutWithDetails[], selectedEx);
  }, [workouts, selectedEx]);

  if (isLoading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader className="h-8 w-8 animate-spin text-volt" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-5xl">Progress</h1>
        <p className="mt-1 text-muted-foreground">Where the numbers live.</p>
      </header>

      <div className="flex gap-1.5 rounded-lg border border-border bg-card p-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold ${
              tab === t
                ? "bg-volt text-volt-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard title="Weekly volume" subtitle={`Total ${label} lifted per week`}>
            <ResponsiveContainer width="100%" height={256}>
              <BarChart data={weeklyVolume.map((v) => ({ ...v, volume: toDisplay(v.volume) }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="week" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} width={45} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="volume" fill="var(--color-volt)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Sessions per week" subtitle="Workout frequency">
            <ResponsiveContainer width="100%" height={256}>
              <BarChart data={weeklySessions}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="week" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} width={30} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="sessions" fill="var(--color-volt)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Muscle-group split" subtitle="Share of completed sets">
            <ResponsiveContainer width="100%" height={256}>
              <PieChart>
                <Pie
                  data={muscleSplit}
                  dataKey="value"
                  nameKey="muscle"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {muscleSplit.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {exerciseOptions.length > 0 ? (
            <ChartCard title="Exercise 1RM" subtitle="Estimated max progression">
              <div className="mb-3">
                <select
                  value={selectedEx}
                  onChange={(e) => setSelectedEx(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-volt"
                >
                  <option value="">Select an exercise</option>
                  {exerciseOptions.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.name}
                    </option>
                  ))}
                </select>
              </div>
              {oneRmData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={oneRmData.map((v) => ({ ...v, oneRm: toDisplay(v.oneRm) }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="week" stroke="var(--color-muted-foreground)" fontSize={12} />
                    <YAxis stroke="var(--color-muted-foreground)" fontSize={12} width={45} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Line
                      type="monotone"
                      dataKey="oneRm"
                      stroke="var(--color-volt)"
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground">No data for this exercise yet.</p>
              )}
            </ChartCard>
          ) : null}
        </div>
      ) : null}

      {tab === "Exercises" ? (
        <div className="space-y-4">
          <select
            value={selectedEx}
            onChange={(e) => setSelectedEx(e.target.value)}
            className="w-full rounded-md border border-border bg-card px-4 py-3 text-sm outline-none focus:border-volt"
          >
            <option value="">Select an exercise</option>
            {exerciseOptions.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name}
              </option>
            ))}
          </select>
          {oneRmData.length > 0 ? (
            <ChartCard title="1RM progression" subtitle="Estimated max over time">
              <ResponsiveContainer width="100%" height={256}>
                <LineChart data={oneRmData.map((v) => ({ ...v, oneRm: toDisplay(v.oneRm) }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="week" stroke="var(--color-muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={12} width={45} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line
                    type="monotone"
                    dataKey="oneRm"
                    stroke="var(--color-volt)"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          ) : (
            <p className="text-center text-muted-foreground">
              {selectedEx
                ? "No logged data for this exercise yet."
                : "Pick an exercise above to see its progression."}
            </p>
          )}
        </div>
      ) : null}

      {tab === "PRs" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {prs.length === 0 ? (
            <div className="col-span-full rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">
              No personal records yet. Log some workouts!
            </div>
          ) : (
            prs.slice(0, 12).map((pr) => {
              const ex = libExercises.find((e) => e.id === pr.exercise);
              const name = ex?.name ?? pr.exercise;
              return (
                <div key={pr.exercise} className="rounded-2xl border border-border bg-card p-5">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">
                    Personal record
                  </div>
                  <div className="mt-1 font-display text-2xl">{name}</div>
                  <div className="mt-3 font-display text-4xl text-volt numeric">
                    {format(pr.weightKg, 1)}
                  </div>
                  <div className="text-xs text-muted-foreground numeric">for {pr.reps} reps</div>
                </div>
              );
            })
          )}
        </div>
      ) : null}
    </div>
  );
}

const tooltipStyle = {
  background: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: 8,
  color: "var(--color-foreground)",
  fontSize: 12,
};

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-2xl">{title}</h2>
        <span className="text-xs uppercase tracking-widest text-muted-foreground">{subtitle}</span>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}
