import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";
import { PRESET_EXERCISES, type Exercise } from "../lib/mock-data";
import type { ExerciseRow } from "../lib/database.types";

type Ctx = {
  exercises: Exercise[];
  addCustom: (e: Omit<Exercise, "id" | "custom">) => Promise<Exercise>;
  loading: boolean;
};

const ExerciseLibraryContext = createContext<Ctx | null>(null);

function rowToExercise(row: ExerciseRow): Exercise {
  return {
    id: row.id,
    name: row.name,
    muscle: row.muscle as Exercise["muscle"],
    equipment: row.equipment as Exercise["equipment"],
    instructions: row.instructions,
    custom: row.is_custom,
  };
}

export function ExerciseLibraryProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>(PRESET_EXERCISES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setExercises(PRESET_EXERCISES);
      setLoading(false);
      return;
    }

    supabase
      .from("exercises")
      .select("*")
      .or(`user_id.is.null,user_id.eq.${user.id}`)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) {
          const mapped = (data as ExerciseRow[]).map(rowToExercise);
          setExercises(mapped);
        }
        setLoading(false);
      });
  }, [user]);

  const addCustom: Ctx["addCustom"] = async (e) => {
    if (!user) return { ...e, id: `offline-${Date.now()}`, custom: true };

    const id = `custom-${Date.now()}`;
    const { error } = await supabase.from("exercises").insert({
      id,
      user_id: user.id,
      name: e.name,
      muscle: e.muscle,
      equipment: e.equipment,
      instructions: e.instructions,
      is_custom: true,
    } as never);

    if (error) {
      const ex: Exercise = { ...e, id: `offline-${Date.now()}`, custom: true };
      setExercises((prev) => [ex, ...prev]);
      return ex;
    }

    const ex: Exercise = { ...e, id, custom: true };
    setExercises((prev) => [ex, ...prev]);
    return ex;
  };

  return (
    <ExerciseLibraryContext.Provider value={{ exercises, addCustom, loading }}>
      {children}
    </ExerciseLibraryContext.Provider>
  );
}

export function useExerciseLibrary() {
  const ctx = useContext(ExerciseLibraryContext);
  if (!ctx) throw new Error("useExerciseLibrary must be used inside ExerciseLibraryProvider");
  return ctx;
}
