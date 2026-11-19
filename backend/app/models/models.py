from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.db.session import Base

def utc_now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    # Relationships
    profile = relationship("FitnessProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    workout_plans = relationship("WorkoutPlan", back_populates="user", cascade="all, delete-orphan")
    workout_sessions = relationship("WorkoutSession", back_populates="user", cascade="all, delete-orphan")
    progress_logs = relationship("ProgressLog", back_populates="user", cascade="all, delete-orphan")


class FitnessProfile(Base):
    __tablename__ = "fitness_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    age = Column(Integer, nullable=True)
    gender = Column(String(30), nullable=True)  # Male, Female, Other
    height_cm = Column(Float, nullable=True)
    weight_kg = Column(Float, nullable=True)
    goal = Column(String(50), nullable=True)  # muscle_gain, weight_loss, maintenance, endurance, strength
    experience = Column(String(50), nullable=True)  # beginner, intermediate, advanced
    training_days = Column(Integer, default=4)  # 1 to 7
    equipment = Column(String(100), default="gym")  # gym, home_dumbbells, dumbbells, bodyweight
    session_duration = Column(Integer, default=45)  # minutes: 30, 45, 60, 90
    target_weight_kg = Column(Float, nullable=True)
    fitness_level_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="profile")


class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), index=True, nullable=False)
    muscle_group = Column(String(50), index=True, nullable=False)  # Chest, Back, Legs, Shoulders, Biceps, Triceps, Core, Full Body, Cardio
    secondary_muscles = Column(String(150), nullable=True)  # Comma separated
    equipment = Column(String(100), index=True, nullable=False)  # Barbell, Dumbbell, Machine, Cable, Bodyweight, Bands
    difficulty = Column(String(50), default="Beginner")  # Beginner, Intermediate, Advanced
    instructions = Column(Text, nullable=False)
    tips = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    video_url = Column(String(500), nullable=True)
    is_custom = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now)

    workout_exercises = relationship("WorkoutExercise", back_populates="exercise")
    exercise_logs = relationship("ExerciseLog", back_populates="exercise")


class WorkoutPlan(Base):
    __tablename__ = "workout_plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    goal = Column(String(50), nullable=False)
    experience_level = Column(String(50), nullable=False)
    days_per_week = Column(Integer, nullable=False)
    duration_weeks = Column(Integer, default=4)
    is_active = Column(Boolean, default=True)
    generated_by_ai = Column(Boolean, default=True)
    ai_rationale = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="workout_plans")
    days = relationship("WorkoutDay", back_populates="plan", cascade="all, delete-orphan", order_by="WorkoutDay.day_number")


class WorkoutDay(Base):
    __tablename__ = "workout_days"

    id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer, ForeignKey("workout_plans.id", ondelete="CASCADE"), nullable=False)
    day_number = Column(Integer, nullable=False)  # 1 to 7
    day_name = Column(String(50), nullable=False)  # e.g., Monday, Day 1
    title = Column(String(150), nullable=False)  # e.g., "Chest & Triceps Power"
    focus_muscle_group = Column(String(100), nullable=False)
    is_rest_day = Column(Boolean, default=False)
    notes = Column(Text, nullable=True)

    plan = relationship("WorkoutPlan", back_populates="days")
    exercises = relationship("WorkoutExercise", back_populates="workout_day", cascade="all, delete-orphan", order_by="WorkoutExercise.order_index")
    sessions = relationship("WorkoutSession", back_populates="workout_day")


class WorkoutExercise(Base):
    __tablename__ = "workout_exercises"

    id = Column(Integer, primary_key=True, index=True)
    workout_day_id = Column(Integer, ForeignKey("workout_days.id", ondelete="CASCADE"), nullable=False)
    exercise_id = Column(Integer, ForeignKey("exercises.id", ondelete="CASCADE"), nullable=False)
    order_index = Column(Integer, default=0)
    sets = Column(Integer, default=3)
    reps = Column(String(50), default="10-12")  # e.g., "8-10", "12-15", "Failure"
    rest_seconds = Column(Integer, default=60)
    notes = Column(Text, nullable=True)
    target_rpe = Column(Float, nullable=True)  # Rate of Perceived Exertion (e.g. 7-9)

    workout_day = relationship("WorkoutDay", back_populates="exercises")
    exercise = relationship("Exercise", back_populates="workout_exercises")


class WorkoutSession(Base):
    __tablename__ = "workout_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    workout_day_id = Column(Integer, ForeignKey("workout_days.id", ondelete="SET NULL"), nullable=True)
    plan_id = Column(Integer, ForeignKey("workout_plans.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(150), nullable=False)
    start_time = Column(DateTime, default=utc_now)
    end_time = Column(DateTime, nullable=True)
    duration_minutes = Column(Integer, default=0)
    total_volume_kg = Column(Float, default=0.0)
    notes = Column(Text, nullable=True)
    rating = Column(Integer, nullable=True)  # 1 to 5 stars
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="workout_sessions")
    workout_day = relationship("WorkoutDay", back_populates="sessions")
    exercise_logs = relationship("ExerciseLog", back_populates="session", cascade="all, delete-orphan")


class ExerciseLog(Base):
    __tablename__ = "exercise_logs"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("workout_sessions.id", ondelete="CASCADE"), nullable=False)
    exercise_id = Column(Integer, ForeignKey("exercises.id", ondelete="CASCADE"), nullable=False)
    set_number = Column(Integer, nullable=False)
    weight_kg = Column(Float, default=0.0)
    reps_completed = Column(Integer, default=0)
    is_completed = Column(Boolean, default=True)
    rpe = Column(Float, nullable=True)

    session = relationship("WorkoutSession", back_populates="exercise_logs")
    exercise = relationship("Exercise", back_populates="exercise_logs")


class ProgressLog(Base):
    __tablename__ = "progress_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    date = Column(DateTime, default=utc_now)
    weight_kg = Column(Float, nullable=False)
    body_fat_percentage = Column(Float, nullable=True)
    chest_cm = Column(Float, nullable=True)
    waist_cm = Column(Float, nullable=True)
    arms_cm = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)
    photo_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="progress_logs")
