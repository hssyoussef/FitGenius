from typing import List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.models import User, ProgressLog, FitnessProfile
from app.schemas.schemas import ProgressLogCreate, ProgressLogResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/progress", tags=["Progress & Weight Tracking"])

def utc_now():
    return datetime.now(timezone.utc)

@router.post("/", response_model=ProgressLogResponse, status_code=status.HTTP_201_CREATED)
def create_progress_log(
    log_in: ProgressLogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    log = ProgressLog(
        user_id=current_user.id,
        date=log_in.date or utc_now(),
        weight_kg=log_in.weight_kg,
        body_fat_percentage=log_in.body_fat_percentage,
        chest_cm=log_in.chest_cm,
        waist_cm=log_in.waist_cm,
        arms_cm=log_in.arms_cm,
        notes=log_in.notes,
        photo_url=log_in.photo_url
    )
    db.add(log)

    # Also update current profile weight
    profile = db.query(FitnessProfile).filter(FitnessProfile.user_id == current_user.id).first()
    if profile:
        profile.weight_kg = log_in.weight_kg

    db.commit()
    db.refresh(log)
    return log

@router.get("/history", response_model=List[ProgressLogResponse])
def get_progress_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    logs = db.query(ProgressLog).filter(
        ProgressLog.user_id == current_user.id
    ).order_by(ProgressLog.date.asc()).all()
    return logs

@router.delete("/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_progress_log(
    log_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    log = db.query(ProgressLog).filter(
        ProgressLog.id == log_id,
        ProgressLog.user_id == current_user.id
    ).first()
    if not log:
        raise HTTPException(status_code=404, detail="Log entry not found")
    db.delete(log)
    db.commit()
    return None
