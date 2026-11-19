from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

# ----------------- User Schemas -----------------
class UserBase(BaseModel):
    email: str
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: str
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    password: Optional[str] = None

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenData(BaseModel):
    user_id: Optional[int] = None


# ----------------- Fitness Profile Schemas -----------------
class FitnessProfileBase(BaseModel):
    age: Optional[int] = Field(None, ge=10, le=120)
    gender: Optional[str] = None  # Male, Female, Other
    height_cm: Optional[float] = Field(None, ge=50, le=280)
    weight_kg: Optional[float] = Field(None, ge=20, le=350)
    goal: Optional[str] = "muscle_gain"  # muscle_gain, weight_loss, maintenance, endurance, strength
    experience: Optional[str] = "beginner"  # beginner, intermediate, advanced
    training_days: Optional[int] = Field(4, ge=1, le=7)
    equipment: Optional[str] = "gym"  # gym, home_dumbbells, dumbbells, bodyweight
    session_duration: Optional[int] = Field(45, ge=15, le=180)  # minutes
    target_weight_kg: Optional[float] = None
    fitness_level_notes: Optional[str] = None

class FitnessProfileCreate(FitnessProfileBase):
    pass

class FitnessProfileUpdate(FitnessProfileBase):
    pass

class FitnessProfileResponse(FitnessProfileBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ----------------- Exercise Schemas -----------------
class ExerciseBase(BaseModel):
    name: str
    muscle_group: str
    secondary_muscles: Optional[str] = None
    equipment: str
    difficulty: Optional[str] = "Beginner"
    instructions: str
    tips: Optional[str] = None
    image_url: Optional[str] = None
    video_url: Optional[str] = None

class ExerciseCreate(ExerciseBase):
    is_custom: Optional[bool] = True

class ExerciseResponse(ExerciseBase):
    id: int
    is_custom: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ----------------- Workout Plan Schemas -----------------
class WorkoutExerciseBase(BaseModel):
    exercise_id: int
    order_index: int = 0
    sets: int = 3
    reps: str = "10-12"
    rest_seconds: int = 60
    notes: Optional[str] = None
    target_rpe: Optional[float] = None

class WorkoutExerciseCreate(WorkoutExerciseBase):
    pass

class WorkoutExerciseResponse(WorkoutExerciseBase):
    id: int
    workout_day_id: int
    exercise: Optional[ExerciseResponse] = None

    class Config:
        from_attributes = True

class WorkoutDayBase(BaseModel):
    day_number: int
    day_name: str
    title: str
    focus_muscle_group: str
    is_rest_day: bool = False
    notes: Optional[str] = None

class WorkoutDayCreate(WorkoutDayBase):
    exercises: List[WorkoutExerciseCreate] = []

class WorkoutDayResponse(WorkoutDayBase):
    id: int
    plan_id: int
    exercises: List[WorkoutExerciseResponse] = []

    class Config:
        from_attributes = True

class WorkoutPlanBase(BaseModel):
    title: str
    description: Optional[str] = None
    goal: str
    experience_level: str
    days_per_week: int
    duration_weeks: int = 4
    is_active: bool = True
    ai_rationale: Optional[str] = None

class WorkoutPlanCreate(WorkoutPlanBase):
    days: List[WorkoutDayCreate] = []

class WorkoutPlanGenerateRequest(BaseModel):
    goal: Optional[str] = None
    experience: Optional[str] = None
    training_days: Optional[int] = None
    equipment: Optional[str] = None
    session_duration: Optional[int] = None
    additional_notes: Optional[str] = None
    use_profile_defaults: bool = True

class WorkoutPlanResponse(WorkoutPlanBase):
    id: int
    user_id: int
    generated_by_ai: bool
    created_at: datetime
    updated_at: datetime
    days: List[WorkoutDayResponse] = []

    class Config:
        from_attributes = True


# ----------------- Workout Session & Tracking Schemas -----------------
class ExerciseLogBase(BaseModel):
    exercise_id: int
    set_number: int
    weight_kg: float = 0.0
    reps_completed: int = 0
    is_completed: bool = True
    rpe: Optional[float] = None

class ExerciseLogCreate(ExerciseLogBase):
    pass

class ExerciseLogResponse(ExerciseLogBase):
    id: int
    session_id: int
    exercise: Optional[ExerciseResponse] = None

    class Config:
        from_attributes = True

class WorkoutSessionStartRequest(BaseModel):
    workout_day_id: Optional[int] = None
    plan_id: Optional[int] = None
    title: str

class WorkoutSessionFinishRequest(BaseModel):
    end_time: Optional[datetime] = None
    duration_minutes: int
    total_volume_kg: Optional[float] = 0.0
    notes: Optional[str] = None
    rating: Optional[int] = None
    exercise_logs: List[ExerciseLogCreate] = []

class WorkoutSessionResponse(BaseModel):
    id: int
    user_id: int
    workout_day_id: Optional[int] = None
    plan_id: Optional[int] = None
    title: str
    start_time: datetime
    end_time: Optional[datetime] = None
    duration_minutes: int
    total_volume_kg: float
    notes: Optional[str] = None
    rating: Optional[int] = None
    is_completed: bool
    created_at: datetime
    exercise_logs: List[ExerciseLogResponse] = []

    class Config:
        from_attributes = True


# ----------------- Progress Log Schemas -----------------
class ProgressLogBase(BaseModel):
    date: Optional[datetime] = None
    weight_kg: float
    body_fat_percentage: Optional[float] = None
    chest_cm: Optional[float] = None
    waist_cm: Optional[float] = None
    arms_cm: Optional[float] = None
    notes: Optional[str] = None
    photo_url: Optional[str] = None

class ProgressLogCreate(ProgressLogBase):
    pass

class ProgressLogResponse(ProgressLogBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ----------------- Dashboard Schemas -----------------
class DashboardStatsResponse(BaseModel):
    current_weight: Optional[float] = None
    start_weight: Optional[float] = None
    weight_change: Optional[float] = None
    target_weight: Optional[float] = None
    total_workouts: int = 0
    weekly_frequency: int = 0
    completion_rate_percentage: float = 0.0
    current_streak_days: int = 0
    total_volume_kg: float = 0.0
    active_plan: Optional[WorkoutPlanResponse] = None
    recent_sessions: List[WorkoutSessionResponse] = []
    weight_history: List[ProgressLogResponse] = []
    today_workout: Optional[WorkoutDayResponse] = None
