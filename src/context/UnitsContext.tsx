import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "../lib/supabase";

export type Unit = "kg" | "lb";

type UnitsContextValue = {
  unit: Unit;
  setUnit: (u: Unit) => void;
  toDisplay: (kg: number) => number;
  fromDisplay: (val: number) => number;
  format: (kg: number, digits?: number) => string;
  label: string;
};

const UnitsContext = createContext<UnitsContextValue | null>(null);

const KG_TO_LB = 2.2046226218;

export function UnitsProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth();
  const [unit, setUnitState] = useState<Unit>("kg");

  useEffect(() => {
    if (profile?.weight_unit === "kg" || profile?.weight_unit === "lb") {
      setUnitState(profile.weight_unit);
    } else {
      const stored = typeof window !== "undefined" ? window.localStorage.getItem("units") : null;
      if (stored === "kg" || stored === "lb") setUnitState(stored);
    }
  }, [profile]);

  const setUnit = async (u: Unit) => {
    setUnitState(u);
    if (typeof window !== "undefined") window.localStorage.setItem("units", u);
    if (user) {
      await supabase
        .from("profiles")
        .update({ weight_unit: u } as never)
        .eq("id", user.id);
    }
  };

  const toDisplay = (kg: number) => (unit === "kg" ? kg : kg * KG_TO_LB);
  const fromDisplay = (val: number) => (unit === "kg" ? val : val / KG_TO_LB);
  const format = (kg: number, digits = 1) => {
    const v = toDisplay(kg);
    return `${v.toFixed(digits).replace(/\.0$/, "")} ${unit}`;
  };

  return (
    <UnitsContext.Provider value={{ unit, setUnit, toDisplay, fromDisplay, format, label: unit }}>
      {children}
    </UnitsContext.Provider>
  );
}

export function useUnits() {
  const ctx = useContext(UnitsContext);
  if (!ctx) throw new Error("useUnits must be used inside UnitsProvider");
  return ctx;
}
