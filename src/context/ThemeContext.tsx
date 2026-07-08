import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "../lib/supabase";
import type { ThemeId } from "../themes";
import { THEMES, applyTheme } from "../themes";

type ThemeContextValue = {
  themeId: ThemeId;
  setThemeId: (id: ThemeId) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth();
  const [themeId, setThemeIdState] = useState<ThemeId>(() => {
    try {
      const stored = localStorage.getItem("turbo-theme");
      if (stored && THEMES.some((t) => t.id === stored)) return stored as ThemeId;
    } catch {}
    return "volt";
  });

  useEffect(() => {
    if (profile?.theme && THEMES.some((t) => t.id === profile.theme)) {
      setThemeIdState(profile.theme as ThemeId);
    }
  }, [profile]);

  useEffect(() => {
    applyTheme(themeId);
  }, [themeId]);

  const setThemeId = async (id: ThemeId) => {
    setThemeIdState(id);
    localStorage.setItem("turbo-theme", id);
    if (user) {
      await supabase.from("profiles").update({ theme: id } as never).eq("id", user.id);
    }
  };

  return (
    <ThemeContext.Provider value={{ themeId, setThemeId }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
