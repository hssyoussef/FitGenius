from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.models import User, FitnessProfile, WorkoutPlan, WorkoutDay, WorkoutExercise, Exercise
from app.schemas.schemas import WorkoutPlanResponse, WorkoutPlanGenerateRequest
from app.api.deps import get_current_user
from app.services.ai_generator import generate_ai_workout_plan

router = APIRouter(prefix="/plans", tags=["Workout Plans"])

@router.post("/generate", response_model=WorkoutPlanResponse)
def generate_plan(
    req: WorkoutPlanGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(FitnessProfile).filter(FitnessProfile.user_id == current_user.id).first()
    
    # Merge profile defaults with custom request parameters
    profile_data = {
        "goal": req.goal or (profile.goal if profile else "muscle_gain"),
        "experience": req.experience or (profile.experience if profile else "intermediate"),
        "training_days": req.training_days or (profile.training_days if profile else 4),
        "equipment": req.equipment or (profile.equipment if profile else "gym"),
        "session_duration": req.session_duration or (profile.session_duration if profile else 45),
        "weight_kg": profile.weight_kg if profile else None,
        "height_cm": profile.height_cm if profile else None,
        "age": profile.age if profile else None,
        "gender": profile.gender if profile else None,
    }

    # Generate plan via AI / Expert Rules Engine
    generated = generate_ai_workout_plan(
        db=db,
        profile_data=profile_data,
        additional_notes=req.additional_notes
    )

    # Deactivate existing active plans for this user
    db.query(WorkoutPlan).filter(
        WorkoutPlan.user_id == current_user.id,
        WorkoutPlan.is_active == True
    ).update({"is_active": False})

    # Create new WorkoutPlan record
    new_plan = WorkoutPlan(
        user_id=current_user.id,
        title=generated.get("title", "AI Workout Plan"),
        description=generated.get("description", ""),
        goal=profile_data["goal"],
        experience_level=profile_data["experience"],
        days_per_week=profile_data["training_days"],
        duration_weeks=4,
        is_active=True,
        generated_by_ai=True,
        ai_rationale=generated.get("ai_rationale", "")
    )
    db.add(new_plan)
    db.commit()
    db.refresh(new_plan)

    # Add Days and Exercises
    for day_data in generated.get("days", []):
        w_day = WorkoutDay(
            plan_id=new_plan.id,
            day_number=day_data.get("day_number", 1),
            day_name=day_data.get("day_name", "Day 1"),
            title=day_data.get("title", "Daily Workout"),
            focus_muscle_group=day_data.get("focus_muscle_group", "Full Body"),
            is_rest_day=day_data.get("is_rest_day", False),
            notes=day_data.get("notes")
        )
        db.add(w_day)
        db.commit()
        db.refresh(w_day)

        for ex_data in day_data.get("exercises", []):
            ex_id = ex_data.get("exercise_id")
            if not ex_id:
                # Find by name or first available
                ex_match = db.query(Exercise).first()
                ex_id = ex_match.id if ex_match else 1

            w_ex = WorkoutExercise(
                workout_day_id=w_day.id,
                exercise_id=ex_id,
                order_index=ex_data.get("order_index", 0),
                sets=int(ex_data.get("sets", 3)),
                reps=str(ex_data.get("reps", "10-12")),
                rest_seconds=int(ex_data.get("rest_seconds", 60)),
                target_rpe=float(ex_data.get("target_rpe", 8.0)),
                notes=ex_data.get("notes")
            )
            db.add(w_ex)
        db.commit()

    db.refresh(new_plan)
    return new_plan

@router.get("/", response_model=List[WorkoutPlanResponse])
def get_user_plans(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    plans = db.query(WorkoutPlan).filter(
        WorkoutPlan.user_id == current_user.id
    ).order_by(WorkoutPlan.created_at.desc()).all()
    return plans

@router.get("/active", response_model=Optional[WorkoutPlanResponse])
def get_active_plan(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    plan = db.query(WorkoutPlan).filter(
        WorkoutPlan.user_id == current_user.id,
        WorkoutPlan.is_active == True
    ).first()
    return plan

@router.get("/{plan_id}", response_model=WorkoutPlanResponse)
def get_plan_by_id(
    plan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    plan = db.query(WorkoutPlan).filter(
        WorkoutPlan.id == plan_id,
        WorkoutPlan.user_id == current_user.id
    ).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Workout plan not found")
    return plan

@router.put("/{plan_id}/set-active", response_model=WorkoutPlanResponse)
def set_active_plan(
    plan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Deactivate others
    db.query(WorkoutPlan).filter(
        WorkoutPlan.user_id == current_user.id
    ).update({"is_active": False})

    plan = db.query(WorkoutPlan).filter(
        WorkoutPlan.id == plan_id,
        WorkoutPlan.user_id == current_user.id
    ).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Workout plan not found")

    plan.is_active = True
    db.commit()
    db.refresh(plan)
    return plan

@router.delete("/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_plan(
    plan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    plan = db.query(WorkoutPlan).filter(
        WorkoutPlan.id == plan_id,
        WorkoutPlan.user_id == current_user.id
    ).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Workout plan not found")

    db.delete(plan)
    db.commit()
    return None
