import {
  User,
  FitnessProfile,
  Exercise,
  WorkoutPlan,
  WorkoutSession,
  ProgressLog,
  DashboardStats,
  ExerciseLog
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("fitgenius_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorDetail = "An unexpected error occurred";
    try {
      const errJson = await res.json();
      errorDetail = errJson.detail || JSON.stringify(errJson);
    } catch {
      errorDetail = `Error ${res.status}: ${res.statusText}`;
    }
    throw new Error(errorDetail);
  }
  return res.json();
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ access_token: string; token_type: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },

  async register(email: string, password: string, full_name?: string): Promise<{ access_token: string; token_type: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, full_name }),
    });
    return handleResponse(res);
  },

  async getMe(): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Profile
  async getProfile(): Promise<FitnessProfile> {
    const res = await fetch(`${API_BASE}/profile/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async updateProfile(profile: Partial<FitnessProfile>): Promise<FitnessProfile> {
    const res = await fetch(`${API_BASE}/profile/me`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(profile),
    });
    return handleResponse(res);
  },

  // Exercise Library
  async getExercises(params?: {
    muscle_group?: string;
    equipment?: string;
    difficulty?: string;
    search?: string;
  }): Promise<Exercise[]> {
    const searchParams = new URLSearchParams();
    if (params?.muscle_group) searchParams.append("muscle_group", params.muscle_group);
    if (params?.equipment) searchParams.append("equipment", params.equipment);
    if (params?.difficulty) searchParams.append("difficulty", params.difficulty);
    if (params?.search) searchParams.append("search", params.search);

    const qs = searchParams.toString();
    const res = await fetch(`${API_BASE}/exercises/${qs ? `?${qs}` : ""}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getExerciseById(id: number): Promise<Exercise> {
    const res = await fetch(`${API_BASE}/exercises/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // AI Workout Plans
  async generatePlan(payload: {
    goal?: string;
    experience?: string;
    training_days?: number;
    equipment?: string;
    session_duration?: number;
    additional_notes?: string;
  }): Promise<WorkoutPlan> {
    const res = await fetch(`${API_BASE}/plans/generate`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async getPlans(): Promise<WorkoutPlan[]> {
    const res = await fetch(`${API_BASE}/plans/`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getActivePlan(): Promise<WorkoutPlan | null> {
    const res = await fetch(`${API_BASE}/plans/active`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getPlanById(id: number): Promise<WorkoutPlan> {
    const res = await fetch(`${API_BASE}/plans/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async setActivePlan(id: number): Promise<WorkoutPlan> {
    const res = await fetch(`${API_BASE}/plans/${id}/set-active`, {
      method: "PUT",
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async deletePlan(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/plans/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete plan");
  },

  // Workout Tracking & Sessions
  async startWorkout(payload: {
    title: string;
    workout_day_id?: number;
    plan_id?: number;
  }): Promise<WorkoutSession> {
    const res = await fetch(`${API_BASE}/workouts/start`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async finishWorkout(
    sessionId: number,
    payload: {
      duration_minutes: number;
      total_volume_kg?: number;
      notes?: string;
      rating?: number;
      exercise_logs: ExerciseLog[];
    }
  ): Promise<WorkoutSession> {
    const res = await fetch(`${API_BASE}/workouts/${sessionId}/finish`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async getSessions(): Promise<WorkoutSession[]> {
    const res = await fetch(`${API_BASE}/workouts/sessions`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getSessionDetail(id: number): Promise<WorkoutSession> {
    const res = await fetch(`${API_BASE}/workouts/sessions/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Progress Logs
  async logProgress(payload: {
    weight_kg: number;
    body_fat_percentage?: number;
    chest_cm?: number;
    waist_cm?: number;
    arms_cm?: number;
    notes?: string;
    photo_url?: string;
  }): Promise<ProgressLog> {
    const res = await fetch(`${API_BASE}/progress/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async getProgressHistory(): Promise<ProgressLog[]> {
    const res = await fetch(`${API_BASE}/progress/history`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async deleteProgressLog(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/progress/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete progress log");
  },

  // Dashboard Overview
  async getDashboard(): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE}/dashboard/overview`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
};
