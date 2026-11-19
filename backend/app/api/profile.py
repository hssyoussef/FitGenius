from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.models import User, FitnessProfile
from app.schemas.schemas import FitnessProfileUpdate, FitnessProfileResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/profile", tags=["Fitness Profile"])

@router.get("/me", response_model=FitnessProfileResponse)
def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(FitnessProfile).filter(FitnessProfile.user_id == current_user.id).first()
    if not profile:
        profile = FitnessProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile

@router.put("/me", response_model=FitnessProfileResponse)
def update_my_profile(
    profile_in: FitnessProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(FitnessProfile).filter(FitnessProfile.user_id == current_user.id).first()
    if not profile:
        profile = FitnessProfile(user_id=current_user.id)
        db.add(profile)

    update_data = profile_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)
    return profile
