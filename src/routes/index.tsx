import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Dumbbell, LineChart, Library, Flame, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [user, loading, navigate]);
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-md bg-volt text-volt-foreground">
            <Dumbbell className="h-5 w-5" strokeWidth={2.5} />
          </div>
          <span className="font-display text-2xl tracking-wide">Turbo tracker</span>
        </div>
        <nav className="flex items-center gap-3 text-sm">
          <Link to="/login" className="text-muted-foreground hover:text-foreground">
            Log in
          </Link>
          <Link
            to="/signup"
            className="rounded-md bg-volt px-4 py-2 font-semibold text-volt-foreground hover:opacity-90"
          >
            Start training
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-6">
        <section className="grid gap-10 py-16 md:grid-cols-2 md:items-center md:py-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs uppercase tracking-widest text-muted-foreground">
              <Flame className="h-3.5 w-3.5 text-volt" /> BUILT FOR LIFTERS, BY LIFTERS
            </div>
            <h1 className="mt-6 font-display text-6xl leading-[0.95] sm:text-7xl md:text-8xl">
              Track every
              <br />
              <span className="text-volt">rep. set. RPE.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-muted-foreground">
              A workout tracker made with passion for Training. Log sessions, rate intensity, and
              watch your numbers climb.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 rounded-md bg-volt px-6 py-3 font-semibold text-volt-foreground hover:opacity-90"
              >
                Start training <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-6 py-3 font-semibold text-foreground hover:bg-accent"
              >
                I already have an account
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-2xl">
              <div className="flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground">
                <span>Push day · 42:18</span>
                <span className="text-volt">Live</span>
              </div>
              <div className="mt-4 space-y-4">
                {[
                  { name: "Bench Press", set: "5 × 100 kg", rpe: 8.5 },
                  { name: "Incline DB Press", set: "8 × 34 kg", rpe: 8 },
                  { name: "Cable Fly", set: "12 × 20 kg", rpe: 9 },
                ].map((r) => (
                  <div
                    key={r.name}
                    className="flex items-center justify-between rounded-lg bg-background/60 px-4 py-3"
                  >
                    <div>
                      <div className="font-semibold">{r.name}</div>
                      <div className="text-sm text-muted-foreground numeric">{r.set}</div>
                    </div>
                    <div className="rounded-md bg-volt/15 px-2 py-1 text-sm font-semibold text-volt numeric">
                      RPE {r.rpe}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 py-16 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Dumbbell,
              title: "Log fast",
              body: "One-tap sets, previous weights auto-filled.",
            },
            {
              icon: Flame,
              title: "Rate every set",
              body: "RPE 6–10 in half-steps, right where you need it.",
            },
            {
              icon: LineChart,
              title: "See progress",
              body: "Volume, PRs, and estimated 1RM per exercise.",
            },
            {
              icon: Library,
              title: "Big library",
              body: "40+ presets and unlimited custom exercises.",
            },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-xl border border-border bg-card p-5">
              <Icon className="h-6 w-6 text-volt" />
              <div className="mt-3 font-display text-xl">{title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="mx-auto max-w-7xl px-6 py-10 text-sm text-muted-foreground">
        © {new Date().getFullYear()} Turbo tracker. Train hard.
      </footer>
    </div>
  );
}
