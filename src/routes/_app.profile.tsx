import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";
import { LogOut, User, Loader } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useUnits } from "../context/UnitsContext";

export const Route = createFileRoute("/_app/profile")({
  head: () => ({
    meta: [
      { title: "Profile — IRONLOG" },
      { name: "description", content: "Your account and preferences." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, profile, loading, signOut } = useAuth();
  const { unit, setUnit } = useUnits();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  const handleUnitChange = useCallback(
    async (u: "kg" | "lb") => {
      setUnit(u);
    },
    [setUnit],
  );

  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader className="h-8 w-8 animate-spin text-volt" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-5xl">Profile</h1>
        <p className="mt-1 text-muted-foreground">Account and preferences.</p>
      </header>

      <section className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-volt text-volt-foreground">
          <User className="h-8 w-8" strokeWidth={2.5} />
        </div>
        <div>
          <div className="font-display text-2xl">{profile?.name ?? "Athlete"}</div>
          <div className="text-sm text-muted-foreground">{user?.email ?? ""}</div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="font-display text-xl">Weight units</div>
            <p className="text-sm text-muted-foreground">Applies across the whole app.</p>
          </div>
          <div className="flex gap-1 rounded-lg border border-border p-1">
            {(["kg", "lb"] as const).map((u) => (
              <button
                key={u}
                onClick={() => handleUnitChange(u)}
                className={`rounded-md px-4 py-1.5 text-sm font-semibold uppercase tracking-widest ${
                  unit === u
                    ? "bg-volt text-volt-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="font-display text-xl">Appearance</div>
        <p className="mt-1 text-sm text-muted-foreground">
          Dark theme is on by default — built for the gym floor.
        </p>
      </section>

      <button
        onClick={handleSignOut}
        className="flex w-full items-center justify-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 py-3 font-semibold text-destructive hover:bg-destructive/20"
      >
        <LogOut className="h-4 w-4" /> Sign out
      </button>
    </div>
  );
}
