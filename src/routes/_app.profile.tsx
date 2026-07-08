import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { LogOut, User, Loader, Check, Image } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useUnits } from "../context/UnitsContext";
import { useTheme } from "../context/ThemeContext";
import { THEMES, type ThemeId } from "../themes";
import { cn } from "../lib/utils";

export const Route = createFileRoute("/_app/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Turbo tracker" },
      { name: "description", content: "Your account and preferences." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, profile, loading, signOut, updateProfile } = useAuth();
  const { unit, setUnit } = useUnits();
  const { themeId, setThemeId } = useTheme();
  const navigate = useNavigate();
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? "");
  const [savingAvatar, setSavingAvatar] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  const handleUnitChange = async (u: "kg" | "lb") => {
    setUnit(u);
  };

  const handleSaveAvatar = async () => {
    setSavingAvatar(true);
    await updateProfile({ avatar_url: avatarUrl || null });
    setSavingAvatar(false);
  };

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

      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-full bg-volt text-volt-foreground">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <User className="h-8 w-8" strokeWidth={2.5} />
            )}
          </div>
          <div>
            <div className="font-display text-2xl">{profile?.name ?? "Athlete"}</div>
            <div className="text-sm text-muted-foreground">{user?.email ?? ""}</div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-3 flex items-center gap-3">
          <Image className="h-5 w-5 text-muted-foreground" />
          <div>
            <div className="font-display text-xl">Profile picture</div>
            <p className="text-sm text-muted-foreground">Enter a URL to your image.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <input
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://example.com/avatar.jpg"
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-volt"
          />
          <button
            onClick={handleSaveAvatar}
            disabled={savingAvatar}
            className="flex items-center gap-1.5 rounded-md bg-volt px-4 py-2 text-sm font-semibold text-volt-foreground transition-colors hover:opacity-90 disabled:opacity-50"
          >
            {savingAvatar ? <Loader className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Save
          </button>
        </div>
        {avatarUrl && (
          <div className="mt-3 flex items-center gap-3 rounded-lg border border-border bg-background p-3">
            <img src={avatarUrl} alt="" className="h-10 w-10 rounded-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
            <span className="text-xs text-muted-foreground break-all">{avatarUrl}</span>
          </div>
        )}
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
        <div className="mb-3">
          <div className="font-display text-xl">Theme</div>
          <p className="text-sm text-muted-foreground">Choose your accent color.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => setThemeId(t.id as ThemeId)}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-all",
                themeId === t.id
                  ? "border-transparent ring-2 ring-offset-2 ring-offset-card"
                  : "border-border text-muted-foreground hover:border-foreground/30",
              )}
              style={{
                backgroundColor: themeId === t.id ? t.vars.volt : "transparent",
                color: themeId === t.id ? t.vars["volt-foreground"] : undefined,
                "--tw-ring-color": t.vars.volt,
              } as React.CSSProperties}
            >
              <span
                className="h-4 w-4 rounded-full"
                style={{ backgroundColor: t.vars.volt }}
              />
              {t.label}
            </button>
          ))}
        </div>
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
