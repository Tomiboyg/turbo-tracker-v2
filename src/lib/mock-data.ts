export type MuscleGroup =
  "Chest" | "Back" | "Legs" | "Shoulders" | "Arms" | "Core" | "Glutes" | "Cardio";

export type Equipment = "Barbell" | "Dumbbell" | "Machine" | "Cable" | "Bodyweight" | "Kettlebell";

export type Exercise = {
  id: string;
  name: string;
  muscle: MuscleGroup;
  equipment: Equipment;
  instructions: string;
  custom?: boolean;
};

export const PRESET_EXERCISES: Exercise[] = [
  {
    id: "bb-bench",
    name: "Barbell Bench Press",
    muscle: "Chest",
    equipment: "Barbell",
    instructions:
      "Lower the bar to mid-chest, press until arms lock out. Keep shoulder blades retracted.",
  },
  {
    id: "db-bench",
    name: "Dumbbell Bench Press",
    muscle: "Chest",
    equipment: "Dumbbell",
    instructions: "Press dumbbells from chest to lockout, control the descent.",
  },
  {
    id: "incline-db-press",
    name: "Incline Dumbbell Press",
    muscle: "Chest",
    equipment: "Dumbbell",
    instructions: "Set bench to 30°, press dumbbells overhead.",
  },
  {
    id: "cable-fly",
    name: "Cable Fly",
    muscle: "Chest",
    equipment: "Cable",
    instructions: "Slight bend in elbows, sweep hands together in front of chest.",
  },
  {
    id: "push-up",
    name: "Push-Up",
    muscle: "Chest",
    equipment: "Bodyweight",
    instructions: "Body in a straight line, lower chest to floor, press back up.",
  },
  {
    id: "deadlift",
    name: "Deadlift",
    muscle: "Back",
    equipment: "Barbell",
    instructions: "Hip hinge, brace core, drive the floor away and lock out at the top.",
  },
  {
    id: "pull-up",
    name: "Pull-Up",
    muscle: "Back",
    equipment: "Bodyweight",
    instructions: "Pull chin over the bar, control on the way down.",
  },
  {
    id: "bb-row",
    name: "Barbell Row",
    muscle: "Back",
    equipment: "Barbell",
    instructions: "Hinge to ~45°, row bar to lower ribs.",
  },
  {
    id: "db-row",
    name: "Dumbbell Row",
    muscle: "Back",
    equipment: "Dumbbell",
    instructions: "One hand on bench, row dumbbell to hip.",
  },
  {
    id: "lat-pulldown",
    name: "Lat Pulldown",
    muscle: "Back",
    equipment: "Cable",
    instructions: "Pull bar to upper chest, squeeze lats.",
  },
  {
    id: "seated-row",
    name: "Seated Cable Row",
    muscle: "Back",
    equipment: "Cable",
    instructions: "Chest up, pull handle to lower ribs.",
  },
  {
    id: "back-squat",
    name: "Back Squat",
    muscle: "Legs",
    equipment: "Barbell",
    instructions: "Bar on upper back, squat to depth, drive up.",
  },
  {
    id: "front-squat",
    name: "Front Squat",
    muscle: "Legs",
    equipment: "Barbell",
    instructions: "Bar on front delts, elbows high, squat down.",
  },
  {
    id: "leg-press",
    name: "Leg Press",
    muscle: "Legs",
    equipment: "Machine",
    instructions: "Feet shoulder-width, lower to 90°, press away.",
  },
  {
    id: "rdl",
    name: "Romanian Deadlift",
    muscle: "Legs",
    equipment: "Barbell",
    instructions: "Slight knee bend, hinge until hamstrings load, stand up.",
  },
  {
    id: "leg-curl",
    name: "Leg Curl",
    muscle: "Legs",
    equipment: "Machine",
    instructions: "Curl heels toward glutes, slow eccentric.",
  },
  {
    id: "leg-ext",
    name: "Leg Extension",
    muscle: "Legs",
    equipment: "Machine",
    instructions: "Extend knees fully, pause at top.",
  },
  {
    id: "lunges",
    name: "Walking Lunge",
    muscle: "Legs",
    equipment: "Dumbbell",
    instructions: "Step forward, drop back knee to inches off floor, alternate.",
  },
  {
    id: "hip-thrust",
    name: "Hip Thrust",
    muscle: "Glutes",
    equipment: "Barbell",
    instructions: "Upper back on bench, drive hips up, squeeze glutes.",
  },
  {
    id: "glute-bridge",
    name: "Glute Bridge",
    muscle: "Glutes",
    equipment: "Bodyweight",
    instructions: "Feet planted, drive hips up, squeeze glutes hard.",
  },
  {
    id: "ohp",
    name: "Overhead Press",
    muscle: "Shoulders",
    equipment: "Barbell",
    instructions: "Press bar from front rack to overhead lockout.",
  },
  {
    id: "db-shoulder",
    name: "Dumbbell Shoulder Press",
    muscle: "Shoulders",
    equipment: "Dumbbell",
    instructions: "Press dumbbells overhead until lockout.",
  },
  {
    id: "lateral-raise",
    name: "Lateral Raise",
    muscle: "Shoulders",
    equipment: "Dumbbell",
    instructions: "Raise arms out to shoulder height, control down.",
  },
  {
    id: "rear-delt-fly",
    name: "Rear Delt Fly",
    muscle: "Shoulders",
    equipment: "Dumbbell",
    instructions: "Hinge forward, raise arms out to the sides.",
  },
  {
    id: "face-pull",
    name: "Face Pull",
    muscle: "Shoulders",
    equipment: "Cable",
    instructions: "Pull rope to face, elbows high, external rotation at end.",
  },
  {
    id: "bb-curl",
    name: "Barbell Curl",
    muscle: "Arms",
    equipment: "Barbell",
    instructions: "Curl bar to shoulders, no swinging.",
  },
  {
    id: "db-curl",
    name: "Dumbbell Curl",
    muscle: "Arms",
    equipment: "Dumbbell",
    instructions: "Alternate or together, full range.",
  },
  {
    id: "hammer-curl",
    name: "Hammer Curl",
    muscle: "Arms",
    equipment: "Dumbbell",
    instructions: "Neutral grip, curl dumbbells to shoulders.",
  },
  {
    id: "tri-pushdown",
    name: "Triceps Pushdown",
    muscle: "Arms",
    equipment: "Cable",
    instructions: "Elbows pinned, extend arms fully.",
  },
  {
    id: "skullcrusher",
    name: "Skullcrusher",
    muscle: "Arms",
    equipment: "Barbell",
    instructions: "Lower bar to forehead, extend to lockout.",
  },
  {
    id: "dip",
    name: "Dip",
    muscle: "Arms",
    equipment: "Bodyweight",
    instructions: "Lower until shoulders below elbows, press up.",
  },
  {
    id: "plank",
    name: "Plank",
    muscle: "Core",
    equipment: "Bodyweight",
    instructions: "Forearms down, body straight, brace hard.",
  },
  {
    id: "hanging-knee",
    name: "Hanging Knee Raise",
    muscle: "Core",
    equipment: "Bodyweight",
    instructions: "Hang from bar, raise knees to chest.",
  },
  {
    id: "cable-crunch",
    name: "Cable Crunch",
    muscle: "Core",
    equipment: "Cable",
    instructions: "Kneel, crunch elbows toward knees.",
  },
  {
    id: "russian-twist",
    name: "Russian Twist",
    muscle: "Core",
    equipment: "Bodyweight",
    instructions: "Seated, lean back, rotate side to side.",
  },
  {
    id: "kb-swing",
    name: "Kettlebell Swing",
    muscle: "Glutes",
    equipment: "Kettlebell",
    instructions: "Hip hinge, snap hips to swing bell to chest height.",
  },
  {
    id: "kb-goblet",
    name: "Goblet Squat",
    muscle: "Legs",
    equipment: "Kettlebell",
    instructions: "Hold KB at chest, squat between the elbows.",
  },
  {
    id: "row-machine",
    name: "Rowing Machine",
    muscle: "Cardio",
    equipment: "Machine",
    instructions: "Legs, then back, then arms. Reverse on the return.",
  },
  {
    id: "assault-bike",
    name: "Assault Bike",
    muscle: "Cardio",
    equipment: "Machine",
    instructions: "Steady output or intervals.",
  },
  {
    id: "treadmill",
    name: "Treadmill Run",
    muscle: "Cardio",
    equipment: "Machine",
    instructions: "Steady state or intervals.",
  },
];

export type WorkoutSummary = {
  id: string;
  date: string;
  name: string;
  durationMin: number;
  volumeKg: number;
  topSets: { exercise: string; weightKg: number; reps: number; rpe: number }[];
};

export const RECENT_WORKOUTS: WorkoutSummary[] = [
  {
    id: "w1",
    date: "Yesterday",
    name: "Push Day",
    durationMin: 62,
    volumeKg: 8420,
    topSets: [
      { exercise: "Bench Press", weightKg: 100, reps: 5, rpe: 8.5 },
      { exercise: "OHP", weightKg: 60, reps: 6, rpe: 8 },
    ],
  },
  {
    id: "w2",
    date: "3 days ago",
    name: "Pull Day",
    durationMin: 58,
    volumeKg: 9110,
    topSets: [
      { exercise: "Deadlift", weightKg: 160, reps: 3, rpe: 9 },
      { exercise: "Pull-Up", weightKg: 0, reps: 10, rpe: 8 },
    ],
  },
  {
    id: "w3",
    date: "5 days ago",
    name: "Leg Day",
    durationMin: 71,
    volumeKg: 11200,
    topSets: [
      { exercise: "Back Squat", weightKg: 140, reps: 5, rpe: 9 },
      { exercise: "RDL", weightKg: 120, reps: 8, rpe: 8 },
    ],
  },
  {
    id: "w4",
    date: "Last week",
    name: "Upper",
    durationMin: 55,
    volumeKg: 7800,
    topSets: [{ exercise: "Incline DB Press", weightKg: 34, reps: 8, rpe: 8 }],
  },
  {
    id: "w5",
    date: "Last week",
    name: "Lower",
    durationMin: 64,
    volumeKg: 10450,
    topSets: [{ exercise: "Front Squat", weightKg: 110, reps: 5, rpe: 8.5 }],
  },
];

export const VOLUME_HISTORY = [
  { week: "W1", volume: 22000 },
  { week: "W2", volume: 24500 },
  { week: "W3", volume: 23100 },
  { week: "W4", volume: 26800 },
  { week: "W5", volume: 28200 },
  { week: "W6", volume: 27400 },
  { week: "W7", volume: 30150 },
  { week: "W8", volume: 32000 },
];

export const FREQUENCY_HISTORY = [
  { week: "W1", sessions: 3 },
  { week: "W2", sessions: 4 },
  { week: "W3", sessions: 3 },
  { week: "W4", sessions: 5 },
  { week: "W5", sessions: 4 },
  { week: "W6", sessions: 4 },
  { week: "W7", sessions: 5 },
  { week: "W8", sessions: 5 },
];

export const MUSCLE_SPLIT = [
  { muscle: "Chest", value: 22 },
  { muscle: "Back", value: 26 },
  { muscle: "Legs", value: 28 },
  { muscle: "Shoulders", value: 12 },
  { muscle: "Arms", value: 8 },
  { muscle: "Core", value: 4 },
];

export const BENCH_1RM_HISTORY = [
  { week: "W1", oneRm: 95 },
  { week: "W2", oneRm: 97.5 },
  { week: "W3", oneRm: 100 },
  { week: "W4", oneRm: 102.5 },
  { week: "W5", oneRm: 102.5 },
  { week: "W6", oneRm: 105 },
  { week: "W7", oneRm: 107.5 },
  { week: "W8", oneRm: 110 },
];
