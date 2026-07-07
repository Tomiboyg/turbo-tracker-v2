import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Dumbbell, Home, Library, LineChart, User, Play } from "lucide-react";
import { useWorkout } from "../context/WorkoutContext";
import { useAuth } from "../context/AuthContext";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

const NAV = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/workout", label: "Workout", icon: Play },
  { to: "/library", label: "Library", icon: Library },
  { to: "/progress", label: "Progress", icon: LineChart },
  { to: "/profile", label: "Profile", icon: User },
] as const;

function AppLayout() {
  const { active, elapsedSec } = useWorkout();
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [user, loading, navigate]);

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-border bg-card px-4 py-6 md:flex">
        <Link to="/dashboard" className="mb-8 flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-md bg-volt text-volt-foreground">
            <Dumbbell className="h-5 w-5" strokeWidth={2.5} />
          </div>
          <span className="font-display text-2xl tracking-wide">Turbo tracker</span>
        </Link>
        <nav className="flex flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-volt text-volt-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>
        {active ? (
          <Link
            to="/workout"
            className="mt-auto rounded-lg border border-volt bg-volt/10 p-3 text-sm"
          >
            <div className="text-xs uppercase tracking-wider text-volt">Live workout</div>
            <div className="mt-1 font-display text-2xl numeric">{formatDuration(elapsedSec)}</div>
          </Link>
        ) : null}
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/90 px-4 py-3 backdrop-blur md:hidden">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-volt text-volt-foreground">
            <Dumbbell className="h-4 w-4" strokeWidth={2.5} />
          </div>
          <span className="font-display text-xl tracking-wide">Turbo tracker</span>
        </Link>
        {active ? (
          <Link
            to="/workout"
            className="rounded-full border border-volt bg-volt/10 px-3 py-1 text-xs font-semibold text-volt numeric"
          >
            ● {formatDuration(elapsedSec)}
          </Link>
        ) : null}
      </header>

      {/* Main content */}
      <main className="min-h-screen pb-24 md:ml-60 md:pb-8">
        <div className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-10">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom tabs */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur md:hidden">
        <div className="grid grid-cols-5">
          {NAV.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex flex-col items-center gap-1 py-3 text-[11px] font-medium ${
                  isActive ? "text-volt" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export function formatDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  if (h > 0) return `${h}:${String(mm).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${mm}:${String(s).padStart(2, "0")}`;
}
