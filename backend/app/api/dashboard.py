from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.session import get_db
from app.models.models import (
    User, FitnessProfile, WorkoutPlan, WorkoutDay, WorkoutSession, ProgressLog
)
from app.schemas.schemas import DashboardStatsResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard Overview"])

def utc_now():
    return datetime.now(timezone.utc)

@router.get("/overview", response_model=DashboardStatsResponse)
def get_dashboard_overview(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(FitnessProfile).filter(FitnessProfile.user_id == current_user.id).first()
    
    # Active Plan
    active_plan = db.query(WorkoutPlan).filter(
        WorkoutPlan.user_id == current_user.id,
        WorkoutPlan.is_active == True
    ).first()

    # Weight progression
    weight_logs = db.query(ProgressLog).filter(
        ProgressLog.user_id == current_user.id
    ).order_by(ProgressLog.date.asc()).all()

    current_weight = profile.weight_kg if profile and profile.weight_kg else (weight_logs[-1].weight_kg if weight_logs else None)
    start_weight = weight_logs[0].weight_kg if weight_logs else current_weight
    weight_change = round(current_weight - start_weight, 2) if (current_weight is not None and start_weight is not None) else 0.0
    target_weight = profile.target_weight_kg if profile else None

    # Completed Sessions
    completed_sessions = db.query(WorkoutSession).filter(
        WorkoutSession.user_id == current_user.id,
        WorkoutSession.is_completed == True
    ).order_by(WorkoutSession.start_time.desc()).all()

    total_workouts = len(completed_sessions)
    total_volume_kg = sum(s.total_volume_kg or 0.0 for s in completed_sessions)

    # Weekly frequency (completed sessions in the last 7 days)
    seven_days_ago = utc_now() - timedelta(days=7)
    recent_7_days_workouts = [s for s in completed_sessions if s.start_time and s.start_time.replace(tzinfo=timezone.utc) >= seven_days_ago]
    weekly_frequency = len(recent_7_days_workouts)

    # Completion Rate %: target days per week vs actual
    target_days = profile.training_days if profile and profile.training_days else 4
    completion_rate_percentage = round(min(100.0, (weekly_frequency / max(target_days, 1)) * 100.0), 1)

    # Streak calculation
    streak = 0
    if completed_sessions:
        current_check_date = utc_now().date()
        workout_dates = set(s.start_time.date() for s in completed_sessions if s.start_time)
        
        # Check if worked out today or yesterday to continue streak
        if current_check_date in workout_dates:
            streak = 1
            check_date = current_check_date - timedelta(days=1)
        elif (current_check_date - timedelta(days=1)) in workout_dates:
            streak = 1
            check_date = current_check_date - timedelta(days=2)
        else:
            streak = 0
            check_date = None

        if check_date:
            while check_date in workout_dates:
                streak += 1
                check_date -= timedelta(days=1)

    # Today's suggested workout:
    # Match weekday or pick first uncompleted day
    today_workout = None
    if active_plan and active_plan.days:
        day_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        today_name = day_names[utc_now().weekday()]
        
        # Look for day matching today's name
        for d in active_plan.days:
            if d.day_name.lower() == today_name.lower():
                today_workout = d
                break
        # Fallback to day 1 if not matched
        if not today_workout and active_plan.days:
            today_workout = active_plan.days[0]

    return DashboardStatsResponse(
        current_weight=current_weight,
        start_weight=start_weight,
        weight_change=weight_change,
        target_weight=target_weight,
        total_workouts=total_workouts,
        weekly_frequency=weekly_frequency,
        completion_rate_percentage=completion_rate_percentage,
        current_streak_days=streak,
        total_volume_kg=round(total_volume_kg, 1),
        active_plan=active_plan,
        recent_sessions=completed_sessions[:5],
        weight_history=weight_logs[-10:],
        today_workout=today_workout
    )
