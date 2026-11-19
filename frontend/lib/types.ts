export interface User {
  id: number;
  email: string;
  full_name: string | null;
  is_active: boolean;
  created_at: string;
}

export interface FitnessProfile {
  id: number;
  user_id: number;
  age: number | null;
  gender: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  goal: string;
  experience: string;
  training_days: number;
  equipment: string;
  session_duration: number;
  target_weight_kg: number | null;
  fitness_level_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Exercise {
  id: number;
  name: string;
  muscle_group: string;
  secondary_muscles: string | null;
  equipment: string;
  difficulty: string;
  instructions: string;
  tips: string | null;
  image_url: string | null;
  video_url: string | null;
  is_custom: boolean;
  created_at: string;
}

export interface WorkoutExercise {
  id: number;
  workout_day_id: number;
  exercise_id: number;
  order_index: number;
  sets: number;
  reps: string;
  rest_seconds: number;
  notes: string | null;
  target_rpe: number | null;
  exercise?: Exercise;
}

export interface WorkoutDay {
  id: number;
  plan_id: number;
  day_number: number;
  day_name: string;
  title: string;
  focus_muscle_group: string;
  is_rest_day: boolean;
  notes: string | null;
  exercises: WorkoutExercise[];
}

export interface WorkoutPlan {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  goal: string;
  experience_level: string;
  days_per_week: number;
  duration_weeks: number;
  is_active: boolean;
  generated_by_ai: boolean;
  ai_rationale: string | null;
  created_at: string;
  updated_at: string;
  days: WorkoutDay[];
}

export interface ExerciseLog {
  id?: number;
  session_id?: number;
  exercise_id: number;
  set_number: number;
  weight_kg: number;
  reps_completed: number;
  is_completed: boolean;
  rpe?: number | null;
  exercise?: Exercise;
}

export interface WorkoutSession {
  id: number;
  user_id: number;
  workout_day_id: number | null;
  plan_id: number | null;
  title: string;
  start_time: string;
  end_time: string | null;
  duration_minutes: number;
  total_volume_kg: number;
  notes: string | null;
  rating: number | null;
  is_completed: boolean;
  created_at: string;
  exercise_logs?: ExerciseLog[];
}

export interface ProgressLog {
  id: number;
  user_id: number;
  date: string;
  weight_kg: number;
  body_fat_percentage: number | null;
  chest_cm: number | null;
  waist_cm: number | null;
  arms_cm: number | null;
  notes: string | null;
  photo_url: string | null;
  created_at: string;
}

export interface DashboardStats {
  current_weight: number | null;
  start_weight: number | null;
  weight_change: number | null;
  target_weight: number | null;
  total_workouts: number;
  weekly_frequency: number;
  completion_rate_percentage: number;
  current_streak_days: number;
  total_volume_kg: number;
  active_plan: WorkoutPlan | null;
  recent_sessions: WorkoutSession[];
  weight_history: ProgressLog[];
  today_workout: WorkoutDay | null;
}
