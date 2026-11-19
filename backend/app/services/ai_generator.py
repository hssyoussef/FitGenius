import json
import logging
from typing import Dict, Any, List, Optional
import httpx
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.models import Exercise, FitnessProfile

logger = logging.getLogger(__name__)

# System instructions for OpenAI structured response
SYSTEM_PROMPT = """You are FitGenius AI, an elite sports scientist, master personal trainer, and biomechanics expert.
Generate a structured, evidence-based weekly workout plan in strictly valid JSON format.

Constraints & Safety Rules:
1. Ensure proper muscle recovery: never schedule the exact same major muscle group on consecutive days.
2. Strictly use the user's available equipment.
3. Align sets, rep ranges, and rest intervals with the user's specific fitness goal:
   - Muscle Gain (Hypertrophy): 3-4 sets, 8-12 reps, 60-90s rest.
   - Weight Loss / Fat Burning: 3-4 sets, 12-15 reps, 45-60s rest, higher metabolic density.
   - Strength: 4-5 sets, 4-6 reps, 120-180s rest.
   - Endurance / Maintenance: 3 sets, 12-18 reps, 45-60s rest.
4. Scale training volume (number of exercises per session) based on experience:
   - Beginner: 3 to 4 exercises per day.
   - Intermediate: 5 to 6 exercises per day.
   - Advanced: 6 to 7 exercises per day.

You MUST return ONLY a JSON object matching this schema:
{
  "title": "Plan title (e.g. 4-Day Hypertrophy & Strength Split)",
  "description": "High-level overview of the plan and training philosophy.",
  "ai_rationale": "Detailed explanation of why this specific program matches the user's anatomy, goals, and recovery capacity.",
  "days": [
    {
      "day_number": 1,
      "day_name": "Monday",
      "title": "Chest & Triceps Hypertrophy",
      "focus_muscle_group": "Chest, Triceps",
      "is_rest_day": false,
      "notes": "Focus on controlled eccentrics and deep chest stretch.",
      "exercises": [
        {
          "name": "Barbell Bench Press",
          "sets": 4,
          "reps": "8-10",
          "rest_seconds": 90,
          "target_rpe": 8.0,
          "notes": "Keep shoulder blades retracted and feet planted."
        }
      ]
    }
  ]
}
"""

def generate_ai_workout_plan(
    db: Session,
    profile_data: Dict[str, Any],
    additional_notes: Optional[str] = None
) -> Dict[str, Any]:
    """
    Attempts to generate workout plan using OpenAI API with structured JSON output.
    If OPENAI_API_KEY is not configured or an error occurs, falls back to the built-in
    smart algorithmic fitness engine.
    """
    goal = profile_data.get("goal") or "muscle_gain"
    experience = profile_data.get("experience") or "intermediate"
    training_days = int(profile_data.get("training_days") or 4)
    equipment = profile_data.get("equipment") or "gym"
    session_duration = int(profile_data.get("session_duration") or 45)
    weight_kg = profile_data.get("weight_kg")
    height_cm = profile_data.get("height_cm")
    age = profile_data.get("age")
    gender = profile_data.get("gender")

    # If OpenAI API key is present, attempt live LLM call
    if settings.OPENAI_API_KEY and len(settings.OPENAI_API_KEY.strip()) > 10:
        try:
            plan = _call_openai_generator(
                goal=goal,
                experience=experience,
                training_days=training_days,
                equipment=equipment,
                session_duration=session_duration,
                weight_kg=weight_kg,
                height_cm=height_cm,
                age=age,
                gender=gender,
                additional_notes=additional_notes
            )
            if plan and "days" in plan and len(plan["days"]) > 0:
                return _enrich_and_validate_plan(db, plan, equipment)
        except Exception as e:
            logger.warning(f"OpenAI API generation failed, falling back to smart engine: {e}")

    # Fallback to local expert fitness engine
    plan = _generate_expert_rule_plan(
        db=db,
        goal=goal,
        experience=experience,
        training_days=training_days,
        equipment=equipment,
        session_duration=session_duration,
        additional_notes=additional_notes
    )
    return _enrich_and_validate_plan(db, plan, equipment)


def _call_openai_generator(
    goal: str,
    experience: str,
    training_days: int,
    equipment: str,
    session_duration: int,
    weight_kg: Optional[float],
    height_cm: Optional[float],
    age: Optional[int],
    gender: Optional[str],
    additional_notes: Optional[str]
) -> Dict[str, Any]:
    user_prompt = f"""Generate a weekly training plan for this athlete:
- Goal: {goal.replace('_', ' ').title()}
- Experience: {experience.title()}
- Training Frequency: {training_days} days per week
- Available Equipment: {equipment.replace('_', ' ').title()}
- Session Duration: {session_duration} minutes per session
- Physical Profile: Age {age or 'N/A'}, Gender {gender or 'N/A'}, Height {height_cm or 'N/A'}cm, Weight {weight_kg or 'N/A'}kg
- Special instructions / notes: {additional_notes or 'None'}

Remember: output strictly valid JSON conforming to the schema."""

    headers = {
        "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": settings.OPENAI_MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt}
        ],
        "response_format": {"type": "json_object"},
        "temperature": 0.7
    }

    with httpx.Client(timeout=45.0) as client:
        response = client.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)
        response.raise_for_status()
        result = response.json()
        content = result["choices"][0]["message"]["content"]
        return json.loads(content)


def _generate_expert_rule_plan(
    db: Session,
    goal: str,
    experience: str,
    training_days: int,
    equipment: str,
    session_duration: int,
    additional_notes: Optional[str] = None
) -> Dict[str, Any]:
    """
    Expert Sports Science Algorithmic Generator
    Generates tailored, balanced, periodized splits matching equipment and volume constraints.
    """
    # Determine reps, sets, rest by goal
    if goal == "muscle_gain":
        target_sets = 4 if experience in ["intermediate", "advanced"] else 3
        reps_compound = "8-10"
        reps_iso = "10-12"
        rest_sec = 75
        tempo_desc = "Hypertrophy focus: moderate volume with high mechanical tension."
    elif goal == "weight_loss":
        target_sets = 3
        reps_compound = "12-15"
        reps_iso = "15-20"
        rest_sec = 45
        tempo_desc = "Fat loss & conditioning: high density, short rest periods, elevated caloric burn."
    elif goal == "strength":
        target_sets = 4 if experience == "beginner" else 5
        reps_compound = "4-6"
        reps_iso = "6-8"
        rest_sec = 120
        tempo_desc = "Maximal strength & neuro-muscular adaptation: heavy compound lifts with full recovery."
    else:  # maintenance / endurance
        target_sets = 3
        reps_compound = "10-12"
        reps_iso = "12-15"
        rest_sec = 60
        tempo_desc = "Balanced functional fitness and physical maintenance."

    # Days split design
    day_splits = []
    if training_days == 1:
        day_splits = [
            ("Monday", "Full Body Total Conditioning", "Full Body", [
                ("Barbell Bench Press", "Push-ups", "Chest"),
                ("Barbell Squat", "Bodyweight Squat", "Legs"),
                ("Lat Pulldown", "Pull-ups", "Back"),
                ("Dumbbell Shoulder Press", "Pike Push-ups", "Shoulders"),
                ("Plank", "Plank", "Core")
            ])
        ]
    elif training_days == 2:
        day_splits = [
            ("Tuesday", "Upper Body Power & Tone", "Chest, Back, Shoulders, Arms", [
                ("Barbell Bench Press", "Dumbbell Press", "Chest"),
                ("Barbell Row", "Dumbbell Row", "Back"),
                ("Dumbbell Shoulder Press", "Pike Push-ups", "Shoulders"),
                ("Dumbbell Bicep Curl", "Dumbbell Bicep Curl", "Biceps"),
                ("Tricep Rope Pushdown", "Diamond Push-ups", "Triceps")
            ]),
            ("Friday", "Lower Body & Core Stability", "Legs, Core", [
                ("Barbell Squat", "Goblet Squat", "Legs"),
                ("Romanian Deadlift", "Dumbbell Romanian Deadlift", "Legs"),
                ("Leg Press", "Lunges", "Legs"),
                ("Calf Raises", "Calf Raises", "Legs"),
                ("Hanging Leg Raise", "Plank", "Core")
            ])
        ]
    elif training_days == 3:
        day_splits = [
            ("Monday", "Push — Chest, Shoulders & Triceps", "Chest, Shoulders, Triceps", [
                ("Barbell Bench Press", "Dumbbell Bench Press", "Chest"),
                ("Incline Dumbbell Press", "Incline Push-ups", "Chest"),
                ("Overhead Shoulder Press", "Dumbbell Shoulder Press", "Shoulders"),
                ("Dumbbell Lateral Raise", "Lateral Raises", "Shoulders"),
                ("Tricep Rope Pushdown", "Overhead Tricep Extension", "Triceps")
            ]),
            ("Wednesday", "Pull — Back, Biceps & Rear Delts", "Back, Biceps", [
                ("Lat Pulldown", "Pull-ups", "Back"),
                ("Seated Cable Row", "Dumbbell Row", "Back"),
                ("Face Pulls", "Dumbbell Reverse Flyes", "Shoulders"),
                ("Barbell Bicep Curl", "Dumbbell Bicep Curl", "Biceps"),
                ("Hammer Curls", "Hammer Curls", "Biceps")
            ]),
            ("Friday", "Legs & Core Power", "Legs, Core", [
                ("Barbell Squat", "Goblet Squat", "Legs"),
                ("Romanian Deadlift", "Dumbbell Romanian Deadlift", "Legs"),
                ("Leg Press", "Walking Lunges", "Legs"),
                ("Leg Curl", "Dumbbell Step-ups", "Legs"),
                ("Plank", "Hanging Leg Raise", "Core")
            ])
        ]
    elif training_days == 4:
        day_splits = [
            ("Monday", "Upper Body A — Chest & Back Dominant", "Chest, Back", [
                ("Barbell Bench Press", "Dumbbell Bench Press", "Chest"),
                ("Lat Pulldown", "Pull-ups", "Back"),
                ("Incline Dumbbell Press", "Dumbbell Incline Press", "Chest"),
                ("Seated Cable Row", "Dumbbell Row", "Back"),
                ("Tricep Rope Pushdown", "Dips", "Triceps"),
                ("Dumbbell Bicep Curl", "Bicep Curls", "Biceps")
            ]),
            ("Tuesday", "Lower Body A — Quad & Core Focus", "Legs, Core", [
                ("Barbell Squat", "Goblet Squat", "Legs"),
                ("Leg Press", "Bulgarian Split Squats", "Legs"),
                ("Leg Extension", "Bodyweight Squat", "Legs"),
                ("Standing Calf Raise", "Calf Raises", "Legs"),
                ("Hanging Leg Raise", "Plank", "Core")
            ]),
            ("Thursday", "Upper Body B — Shoulders & Arms Focus", "Shoulders, Arms, Back", [
                ("Dumbbell Shoulder Press", "Overhead Press", "Shoulders"),
                ("Chest Supported Row", "Dumbbell Row", "Back"),
                ("Dumbbell Lateral Raise", "Lateral Raises", "Shoulders"),
                ("Incline Dumbbell Curl", "Hammer Curls", "Biceps"),
                ("Skull Crushers", "Diamond Push-ups", "Triceps"),
                ("Cable Face Pull", "Reverse Flyes", "Shoulders")
            ]),
            ("Friday", "Lower Body B — Posterior Chain & Hamstrings", "Legs, Core", [
                ("Romanian Deadlift", "Dumbbell Romanian Deadlift", "Legs"),
                ("Walking Lunges", "Lunges", "Legs"),
                ("Lying Leg Curl", "Glute Bridge", "Legs"),
                ("Seated Calf Raise", "Calf Raises", "Legs"),
                ("Cable Woodchopper", "Russian Twists", "Core")
            ])
        ]
    elif training_days == 5:
        day_splits = [
            ("Monday", "Chest & Triceps Hypertrophy", "Chest, Triceps", [
                ("Barbell Bench Press", "Dumbbell Bench Press", "Chest"),
                ("Incline Dumbbell Press", "Incline Push-ups", "Chest"),
                ("Cable Crossover", "Dumbbell Flyes", "Chest"),
                ("Tricep Rope Pushdown", "Diamond Push-ups", "Triceps"),
                ("Skull Crushers", "Overhead Tricep Extension", "Triceps")
            ]),
            ("Tuesday", "Back & Biceps Thickness", "Back, Biceps", [
                ("Deadlift", "Dumbbell Romanian Deadlift", "Back"),
                ("Lat Pulldown", "Pull-ups", "Back"),
                ("Barbell Bent-Over Row", "Dumbbell Row", "Back"),
                ("Barbell Bicep Curl", "Dumbbell Bicep Curl", "Biceps"),
                ("Hammer Curls", "Hammer Curls", "Biceps")
            ]),
            ("Wednesday", "Quad & Hamstring Foundation", "Legs", [
                ("Barbell Squat", "Goblet Squat", "Legs"),
                ("Romanian Deadlift", "Dumbbell Romanian Deadlift", "Legs"),
                ("Leg Press", "Bulgarian Split Squats", "Legs"),
                ("Leg Curl", "Glute Bridge", "Legs"),
                ("Calf Raises", "Calf Raises", "Legs")
            ]),
            ("Thursday", "Shoulders & Traps Sculpt", "Shoulders", [
                ("Overhead Barbell Press", "Dumbbell Shoulder Press", "Shoulders"),
                ("Dumbbell Lateral Raise", "Lateral Raises", "Shoulders"),
                ("Cable Face Pull", "Dumbbell Reverse Flyes", "Shoulders"),
                ("Dumbbell Front Raise", "Front Raises", "Shoulders"),
                ("Barbell Shrugs", "Dumbbell Shrugs", "Back")
            ]),
            ("Friday", "Arms & Core Conditioning", "Arms, Core", [
                ("Preacher Curl", "Dumbbell Bicep Curl", "Biceps"),
                ("Tricep Dips", "Tricep Dips", "Triceps"),
                ("Incline Dumbbell Curl", "Hammer Curls", "Biceps"),
                ("Hanging Leg Raise", "Leg Raises", "Core"),
                ("Plank", "Plank", "Core")
            ])
        ]
    else:  # 6 or 7 days (PPL x 2 or 5 days + active recovery)
        day_splits = [
            ("Monday", "Push 1 — Strength Focus", "Chest, Shoulders, Triceps", [
                ("Barbell Bench Press", "Dumbbell Bench Press", "Chest"),
                ("Overhead Shoulder Press", "Dumbbell Shoulder Press", "Shoulders"),
                ("Incline Dumbbell Press", "Incline Push-ups", "Chest"),
                ("Lateral Raises", "Lateral Raises", "Shoulders"),
                ("Tricep Rope Pushdown", "Overhead Tricep Extension", "Triceps")
            ]),
            ("Tuesday", "Pull 1 — Width & Density", "Back, Biceps", [
                ("Lat Pulldown", "Pull-ups", "Back"),
                ("Barbell Row", "Dumbbell Row", "Back"),
                ("Seated Cable Row", "Single Arm Row", "Back"),
                ("Face Pulls", "Reverse Flyes", "Shoulders"),
                ("Barbell Bicep Curl", "Dumbbell Curl", "Biceps")
            ]),
            ("Wednesday", "Legs 1 — Quad Dominant", "Legs, Core", [
                ("Barbell Squat", "Goblet Squat", "Legs"),
                ("Leg Press", "Walking Lunges", "Legs"),
                ("Leg Extension", "Bodyweight Squat", "Legs"),
                ("Calf Raises", "Calf Raises", "Legs"),
                ("Hanging Leg Raise", "Plank", "Core")
            ]),
            ("Thursday", "Push 2 — Hypertrophy & Pump", "Chest, Shoulders, Triceps", [
                ("Incline Dumbbell Press", "Dumbbell Bench Press", "Chest"),
                ("Cable Chest Flyes", "Push-ups", "Chest"),
                ("Dumbbell Arnold Press", "Shoulder Press", "Shoulders"),
                ("Cable Lateral Raise", "Lateral Raises", "Shoulders"),
                ("Skull Crushers", "Diamond Push-ups", "Triceps")
            ]),
            ("Friday", "Pull 2 — Upper Back & Arms", "Back, Biceps", [
                ("Neutral Grip Pulldown", "Chin-ups", "Back"),
                ("T-Bar Row", "Dumbbell Row", "Back"),
                ("Incline Dumbbell Curl", "Hammer Curls", "Biceps"),
                ("Preacher Curl", "Concentration Curl", "Biceps"),
                ("Cable Shrugs", "Dumbbell Shrugs", "Back")
            ]),
            ("Saturday", "Legs 2 — Posterior Chain & Hamstrings", "Legs, Core", [
                ("Romanian Deadlift", "Dumbbell Romanian Deadlift", "Legs"),
                ("Bulgarian Split Squats", "Step-ups", "Legs"),
                ("Lying Leg Curl", "Glute Bridge", "Legs"),
                ("Seated Calf Raise", "Calf Raises", "Legs"),
                ("Plank", "Russian Twists", "Core")
            ])
        ]
        if training_days == 7:
            day_splits.append(
                ("Sunday", "Active Recovery & Mobility", "Mobility, Core", [
                    ("Cat-Cow Stretch", "Cat-Cow Stretch", "Full Body"),
                    ("World's Greatest Stretch", "World's Greatest Stretch", "Full Body"),
                    ("Dead Bug", "Dead Bug", "Core"),
                    ("Light Walking", "Treadmill Walking", "Cardio")
                ])
            )

    # Build the days array
    days_list = []
    for idx, (day_name, day_title, focus, exercises_proto) in enumerate(day_splits, 1):
        day_exercises = []
        for ex_gym, ex_home, muscle in exercises_proto:
            # Pick name based on equipment
            ex_name = ex_home if equipment in ["bodyweight", "dumbbells", "home_dumbbells"] else ex_gym
            is_compound = any(c in ex_name.lower() for c in ["squat", "bench", "deadlift", "row", "press", "pulldown"])
            day_exercises.append({
                "name": ex_name,
                "sets": target_sets,
                "reps": reps_compound if is_compound else reps_iso,
                "rest_seconds": rest_sec if not is_compound else (rest_sec + 30),
                "target_rpe": 8.0 if experience == "intermediate" else (7.0 if experience == "beginner" else 8.5),
                "notes": f"Maintain controlled form with full range of motion targeting {muscle}."
            })
        
        days_list.append({
            "day_number": idx,
            "day_name": day_name,
            "title": day_title,
            "focus_muscle_group": focus,
            "is_rest_day": False,
            "notes": f"Stay hydrated and perform 5 minutes of dynamic warmup before starting.",
            "exercises": day_exercises
        })

    title = f"{training_days}-Day AI {goal.replace('_', ' ').title()} Blueprint ({experience.title()})"
    description = f"Scientifically calibrated {training_days}-day training split tailored for {goal.replace('_', ' ')} with {equipment.replace('_', ' ')} equipment."
    rationale = f"FitGenius AI designed this program using {tempo_desc} Recovery intervals are strategically placed to ensure progressive overload while avoiding overtraining."

    return {
        "title": title,
        "description": description,
        "ai_rationale": rationale,
        "days": days_list
    }


def _enrich_and_validate_plan(db: Session, plan_dict: Dict[str, Any], equipment: str) -> Dict[str, Any]:
    """
    Validates exercises against the database exercise catalog.
    Matches exercise names or creates fallback references so every exercise has a valid DB ID.
    Enforces maximum volume (max 8 exercises per day).
    """
    all_db_exercises = db.query(Exercise).all()
    name_to_ex = {ex.name.lower(): ex for ex in all_db_exercises}

    days = plan_dict.get("days", [])
    for day in days:
        raw_exercises = day.get("exercises", [])
        # Cap at 8 exercises max for safety & recovery
        capped_exercises = raw_exercises[:8]
        validated_exercises = []
        
        for idx, ex_data in enumerate(capped_exercises):
            ex_name = ex_data.get("name", "Standard Exercise")
            # Lookup in DB
            db_ex = name_to_ex.get(ex_name.lower())
            
            # If not exact match, do a fuzzy substring match
            if not db_ex:
                for db_name, item in name_to_ex.items():
                    if db_name in ex_name.lower() or ex_name.lower() in db_name:
                        db_ex = item
                        break
            
            # If still not found, find any exercise matching the focus muscle group or fallback to first
            if not db_ex:
                focus_first = day.get("focus_muscle_group", "Chest").split(",")[0].strip()
                db_ex = db.query(Exercise).filter(Exercise.muscle_group.ilike(f"%{focus_first}%")).first()
                if not db_ex:
                    db_ex = all_db_exercises[0] if all_db_exercises else None

            if db_ex:
                validated_exercises.append({
                    "exercise_id": db_ex.id,
                    "order_index": idx,
                    "sets": int(ex_data.get("sets") or 3),
                    "reps": str(ex_data.get("reps") or "10-12"),
                    "rest_seconds": int(ex_data.get("rest_seconds") or 60),
                    "target_rpe": float(ex_data.get("target_rpe") or 8.0),
                    "notes": ex_data.get("notes") or db_ex.tips,
                    "exercise_name": db_ex.name,
                    "muscle_group": db_ex.muscle_group
                })

        day["exercises"] = validated_exercises

    plan_dict["days"] = days
    return plan_dict
