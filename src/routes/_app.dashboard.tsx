import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Flame, Play, TrendingUp, Clock, Dumbbell, Loader, Trash2 } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { useWorkout } from "../context/WorkoutContext";
import { useUnits } from "../context/UnitsContext";
import { useDashboardData, useDeleteWorkout } from "../hooks/use-workout-history";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — IRONLOG" },
      { name: "description", content: "Your training overview." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { format, toDisplay } = useUnits();
  const { startWorkout, active } = useWorkout();
  const navigate = useNavigate();
  const {
    workoutsThisWeek,
    weeklyVolumeTotal,
    timeTrainedMin,
    streak,
    weeklyVolume,
    recentWorkouts,
    isLoading,
  } = useDashboardData();

  const deleteWorkout = useDeleteWorkout();

  const handleDelete = (id: string) => {
    if (window.confirm("Delete this workout?")) {
      deleteWorkout.mutate(id);
    }
  };

  const handleStartWorkout = () => {
    startWorkout();
    navigate({ to: "/workout" });
  };

  if (isLoading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader className="h-8 w-8 animate-spin text-volt" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-sm uppercase tracking-widest text-muted-foreground">
            Welcome back
          </div>
          <h1 className="mt-1 font-display text-5xl">Ready to lift.</h1>
        </div>
        {streak > 0 ? (
          <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm">
            <Flame className="h-4 w-4 text-volt" />
            <span className="numeric font-semibold">{streak}-day streak</span>
          </div>
        ) : null}
      </header>

      {/* CTAs */}
      <div className="grid gap-4 sm:grid-cols-2">
        <button
          onClick={handleStartWorkout}
          className="group flex items-center justify-between rounded-2xl bg-volt p-6 text-volt-foreground transition-transform hover:-translate-y-0.5 text-left"
        >
          <div>
            <div className="text-xs uppercase tracking-widest opacity-80">Start now</div>
            <div className="mt-1 font-display text-3xl">Empty workout</div>
          </div>
          <div className="grid h-14 w-14 place-items-center rounded-full bg-black/10">
            <Play className="h-6 w-6" strokeWidth={2.5} />
          </div>
        </button>
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Templates</div>
          <div className="mt-1 font-display text-3xl">Push / Pull / Legs</div>
          <p className="mt-2 text-sm text-muted-foreground">
            Reuse a routine — coming with your first cloud save.
          </p>
        </div>
      </div>

      {/* Stat row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat icon={Dumbbell} label="Workouts this week" value={String(workoutsThisWeek)} />
        <Stat icon={TrendingUp} label="Weekly volume" value={format(weeklyVolumeTotal, 0)} />
        <Stat
          icon={Clock}
          label="Time trained"
          value={`${Math.floor(timeTrainedMin / 60)}h ${timeTrainedMin % 60}m`}
        />
      </div>

      {/* Chart */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl">Weekly volume</h2>
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            Last 8 weeks
          </span>
        </div>
        <div className="mt-4 h-48">
          <ResponsiveContainer>
            <AreaChart data={weeklyVolume.map((v) => ({ ...v, volume: toDisplay(v.volume) }))}>
              <defs>
                <linearGradient id="vol" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-volt)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--color-volt)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="week"
                stroke="var(--color-muted-foreground)"
                fontSize={12}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  color: "var(--color-foreground)",
                }}
              />
              <Area
                type="monotone"
                dataKey="volume"
                stroke="var(--color-volt)"
                strokeWidth={2}
                fill="url(#vol)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Recent */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl">Recent workouts</h2>
          <Link to="/progress" className="text-sm text-volt hover:underline">
            See all
          </Link>
        </div>
        <div className="space-y-3">
          {recentWorkouts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">
              No workouts yet. Start your first one!
            </div>
          ) : (
            recentWorkouts.map((w) => (
              <div
                key={w.id}
                className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-4"
              >
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">
                    {w.date}
                  </div>
                  <div className="font-display text-xl">{w.name}</div>
                  <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {w.topSets.map((s) => (
                      <span key={s.exercise} className="numeric">
                        {s.exercise} · {format(s.weightKg, 0)} × {s.reps} · RPE {s.rpe}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="numeric font-display text-xl">{w.durationMin}m</div>
                    <div className="text-xs text-muted-foreground numeric">
                      {format(w.volumeKg, 0)}
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(w.id); }}
                    className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-destructive"
                    title="Delete workout"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
        <Icon className="h-4 w-4 text-volt" />
        {label}
      </div>
      <div className="mt-2 font-display text-3xl numeric">{value}</div>
    </div>
  );
}
