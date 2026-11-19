from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.db.session import get_db
from app.models.models import Exercise, User
from app.schemas.schemas import ExerciseResponse, ExerciseCreate
from app.api.deps import get_current_user

router = APIRouter(prefix="/exercises", tags=["Exercise Library"])

@router.get("/", response_model=List[ExerciseResponse])
def get_exercises(
    muscle_group: Optional[str] = Query(None, description="Filter by muscle group"),
    equipment: Optional[str] = Query(None, description="Filter by equipment"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty"),
    search: Optional[str] = Query(None, description="Search term for name or instructions"),
    db: Session = Depends(get_db)
):
    query = db.query(Exercise)

    if muscle_group and muscle_group != "All":
        query = query.filter(Exercise.muscle_group.ilike(f"%{muscle_group}%"))

    if equipment and equipment != "All":
        query = query.filter(Exercise.equipment.ilike(f"%{equipment}%"))

    if difficulty and difficulty != "All":
        query = query.filter(Exercise.difficulty.ilike(f"%{difficulty}%"))

    if search:
        search_filter = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Exercise.name.ilike(search_filter),
                Exercise.muscle_group.ilike(search_filter),
                Exercise.instructions.ilike(search_filter),
                Exercise.equipment.ilike(search_filter)
            )
        )

    return query.order_by(Exercise.name).all()

@router.get("/{exercise_id}", response_model=ExerciseResponse)
def get_exercise_by_id(exercise_id: int, db: Session = Depends(get_db)):
    exercise = db.query(Exercise).filter(Exercise.id == exercise_id).first()
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")
    return exercise

@router.post("/", response_model=ExerciseResponse, status_code=status.HTTP_201_CREATED)
def create_custom_exercise(
    exercise_in: ExerciseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    exercise = Exercise(
        **exercise_in.model_dump(),
        is_custom=True
    )
    db.add(exercise)
    db.commit()
    db.refresh(exercise)
    return exercise
