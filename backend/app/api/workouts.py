from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.models import User, WorkoutSession, ExerciseLog, WorkoutDay
from app.schemas.schemas import (
    WorkoutSessionStartRequest, WorkoutSessionFinishRequest,
    WorkoutSessionResponse
)
from app.api.deps import get_current_user

router = APIRouter(prefix="/workouts", tags=["Workout Sessions & Tracking"])

def utc_now():
    return datetime.now(timezone.utc)

@router.post("/start", response_model=WorkoutSessionResponse)
def start_workout_session(
    req: WorkoutSessionStartRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = WorkoutSession(
        user_id=current_user.id,
        workout_day_id=req.workout_day_id,
        plan_id=req.plan_id,
        title=req.title,
        start_time=utc_now(),
        is_completed=False,
        duration_minutes=0,
        total_volume_kg=0.0
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

@router.post("/{session_id}/finish", response_model=WorkoutSessionResponse)
def finish_workout_session(
    session_id: int,
    req: WorkoutSessionFinishRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(WorkoutSession).filter(
        WorkoutSession.id == session_id,
        WorkoutSession.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Workout session not found")

    session.end_time = req.end_time or utc_now()
    session.duration_minutes = req.duration_minutes
    session.notes = req.notes
    session.rating = req.rating
    session.is_completed = True

    # Calculate total volume lifted
    total_volume = 0.0

    # Save ExerciseLogs
    for log_data in req.exercise_logs:
        log = ExerciseLog(
            session_id=session.id,
            exercise_id=log_data.exercise_id,
            set_number=log_data.set_number,
            weight_kg=log_data.weight_kg,
            reps_completed=log_data.reps_completed,
            is_completed=log_data.is_completed,
            rpe=log_data.rpe
        )
        db.add(log)
        if log_data.is_completed:
            total_volume += (log_data.weight_kg * log_data.reps_completed)

    session.total_volume_kg = req.total_volume_kg if req.total_volume_kg > 0 else total_volume
    db.commit()
    db.refresh(session)
    return session

@router.get("/sessions", response_model=List[WorkoutSessionResponse])
def get_user_sessions(
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sessions = db.query(WorkoutSession).filter(
        WorkoutSession.user_id == current_user.id
    ).order_by(WorkoutSession.start_time.desc()).limit(limit).all()
    return sessions

@router.get("/sessions/{session_id}", response_model=WorkoutSessionResponse)
def get_session_detail(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(WorkoutSession).filter(
        WorkoutSession.id == session_id,
        WorkoutSession.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session
