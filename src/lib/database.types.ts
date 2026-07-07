export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      exercises: {
        Row: ExerciseRow;
        Insert: ExerciseInsert;
        Update: ExerciseUpdate;
      };
      workouts: {
        Row: WorkoutRow;
        Insert: WorkoutInsert;
        Update: WorkoutUpdate;
      };
      workout_exercises: {
        Row: WorkoutExerciseRow;
        Insert: WorkoutExerciseInsert;
        Update: WorkoutExerciseUpdate;
      };
      workout_sets: {
        Row: WorkoutSetRow;
        Insert: WorkoutSetInsert;
        Update: WorkoutSetUpdate;
      };
    };
  };
}

export interface ProfileRow {
  id: string;
  name: string;
  weight_unit: "kg" | "lb";
  created_at: string;
}
export type ProfileInsert = { id: string; name?: string; weight_unit?: "kg" | "lb" };
export type ProfileUpdate = { name?: string; weight_unit?: "kg" | "lb" };

export interface ExerciseRow {
  id: string;
  user_id: string | null;
  name: string;
  muscle: string;
  equipment: string;
  instructions: string;
  is_custom: boolean;
  created_at: string;
}
export type ExerciseInsert = {
  id: string;
  user_id: string | null;
  name: string;
  muscle: string;
  equipment: string;
  instructions?: string;
  is_custom?: boolean;
};
export type ExerciseUpdate = {
  name?: string;
  muscle?: string;
  equipment?: string;
  instructions?: string;
};

export interface WorkoutRow {
  id: string;
  user_id: string;
  name: string;
  started_at: string;
  completed_at: string;
  duration_min: number;
  volume_kg: number;
  created_at: string;
}
export type WorkoutInsert = {
  id?: string;
  user_id: string;
  name: string;
  started_at: string;
  completed_at: string;
  duration_min: number;
  volume_kg: number;
};
export type WorkoutUpdate = {
  name?: string;
  duration_min?: number;
  volume_kg?: number;
};

export interface WorkoutExerciseRow {
  id: string;
  workout_id: string;
  exercise_id: string;
  rest_sec: number;
  sequence_order: number;
}
export type WorkoutExerciseInsert = {
  id?: string;
  workout_id: string;
  exercise_id: string;
  rest_sec: number;
  sequence_order: number;
};
export type WorkoutExerciseUpdate = {
  rest_sec?: number;
};

export interface WorkoutSetRow {
  id: string;
  workout_exercise_id: string;
  weight_kg: number;
  reps: number;
  rpe: number | null;
  sequence_order: number;
  done: boolean;
}
export type WorkoutSetInsert = {
  id?: string;
  workout_exercise_id: string;
  weight_kg: number;
  reps: number;
  rpe?: number | null;
  sequence_order: number;
  done?: boolean;
};
export type WorkoutSetUpdate = {
  weight_kg?: number;
  reps?: number;
  rpe?: number | null;
  done?: boolean;
};
