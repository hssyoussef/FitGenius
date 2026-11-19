import logging
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session

from app.models.models import (
    User, FitnessProfile, Exercise, WorkoutPlan, WorkoutDay, WorkoutExercise,
    WorkoutSession, ExerciseLog, ProgressLog
)
from app.core.security import get_password_hash

logger = logging.getLogger(__name__)

EXERCISES_DATA = [
    # Chest
    {
        "name": "Barbell Bench Press",
        "muscle_group": "Chest",
        "secondary_muscles": "Triceps, Anterior Deltoids",
        "equipment": "Barbell",
        "difficulty": "Intermediate",
        "instructions": "1. Lie flat on the bench with feet flat on the floor.\n2. Grip the barbell slightly wider than shoulder-width.\n3. Unrack the bar and slowly lower it to your mid-chest while tucking elbows at roughly 45 degrees.\n4. Press the bar upward explosively until arms are extended without locking elbows.",
        "tips": "Keep shoulder blades retracted and depressed against the bench throughout the lift.",
        "image_url": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&auto=format&fit=crop"
    },
    {
        "name": "Incline Dumbbell Press",
        "muscle_group": "Chest",
        "secondary_muscles": "Upper Chest, Triceps, Shoulders",
        "equipment": "Dumbbell",
        "difficulty": "Intermediate",
        "instructions": "1. Set bench to a 30-45 degree incline.\n2. Hold dumbbells at shoulder level with palms facing forward.\n3. Press the dumbbells upward and slightly inward until arms are extended.\n4. Lower under control with a 2-second eccentric phase.",
        "tips": "Avoid excessively steep angles (above 45 degrees) which shifts too much load to front deltoids.",
        "image_url": "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&auto=format&fit=crop"
    },
    {
        "name": "Dumbbell Bench Press",
        "muscle_group": "Chest",
        "secondary_muscles": "Triceps, Shoulders",
        "equipment": "Dumbbell",
        "difficulty": "Beginner",
        "instructions": "1. Lie flat holding dumbbells at chest height.\n2. Press upward in a slight arc until weights are above chest.\n3. Lower with control until you feel a deep stretch in the chest muscles.",
        "tips": "Allows for greater range of motion and joint comfort than a straight barbell.",
        "image_url": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop"
    },
    {
        "name": "Push-ups",
        "muscle_group": "Chest",
        "secondary_muscles": "Triceps, Core, Shoulders",
        "equipment": "Bodyweight",
        "difficulty": "Beginner",
        "instructions": "1. Place hands shoulder-width apart on the floor.\n2. Keep core braced and body in a straight line from heels to head.\n3. Lower chest until it hovers an inch above the ground.\n4. Push through palms to return to starting position.",
        "tips": "Engage glutes and abs to avoid sagging hips.",
        "image_url": "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=600&auto=format&fit=crop"
    },
    {
        "name": "Cable Crossover",
        "muscle_group": "Chest",
        "secondary_muscles": "Anterior Deltoids",
        "equipment": "Cable",
        "difficulty": "Intermediate",
        "instructions": "1. Set pulleys at upper chest height.\n2. Grab handles and take a slight step forward with staggered stance.\n3. Bring hands together in front of your chest with a slight elbow bend.\n4. Squeeze pectorals at the peak contraction.",
        "tips": "Focus on the mind-muscle connection and full horizontal adduction of the humerus.",
        "image_url": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop"
    },
    {
        "name": "Incline Push-ups",
        "muscle_group": "Chest",
        "secondary_muscles": "Triceps, Core",
        "equipment": "Bodyweight",
        "difficulty": "Beginner",
        "instructions": "1. Place hands on an elevated surface like a bench or step.\n2. Maintain a rigid plank posture.\n3. Lower chest to the edge and push back up smoothly.",
        "tips": "Great regression for beginners building pressing endurance.",
        "image_url": "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=600&auto=format&fit=crop"
    },

    # Back
    {
        "name": "Barbell Bent-Over Row",
        "muscle_group": "Back",
        "secondary_muscles": "Lats, Rhomboids, Biceps, Core",
        "equipment": "Barbell",
        "difficulty": "Intermediate",
        "instructions": "1. Hinge at hips with knees slightly bent, back flat at ~45 degrees.\n2. Grip bar with overhand grip.\n3. Pull bar toward lower ribs/navel, driving elbows backward.\n4. Squeeze shoulder blades together and lower under control.",
        "tips": "Do not let lower back round; keep core braced tightly.",
        "image_url": "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=600&auto=format&fit=crop"
    },
    {
        "name": "Lat Pulldown",
        "muscle_group": "Back",
        "secondary_muscles": "Biceps, Rear Deltoids",
        "equipment": "Cable",
        "difficulty": "Beginner",
        "instructions": "1. Sit at lat pulldown machine with thighs secured under pads.\n2. Grip wide bar with overhand grip.\n3. Pull bar down toward upper chest while leaning slightly back.\n4. Slowly return bar up, feeling the stretch in your lats.",
        "tips": "Think about pulling with your elbows rather than pulling with your hands.",
        "image_url": "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&auto=format&fit=crop"
    },
    {
        "name": "Pull-ups",
        "muscle_group": "Back",
        "secondary_muscles": "Biceps, Lats, Forearms",
        "equipment": "Bodyweight",
        "difficulty": "Advanced",
        "instructions": "1. Hang from a pull-up bar with overhand grip wider than shoulders.\n2. Pull yourself up until chin clears the bar.\n3. Lower with complete control until arms are fully extended.",
        "tips": "Avoid swinging or kicking legs to maintain pure back engagement.",
        "image_url": "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&auto=format&fit=crop"
    },
    {
        "name": "Seated Cable Row",
        "muscle_group": "Back",
        "secondary_muscles": "Middle Back, Biceps, Rhomboids",
        "equipment": "Cable",
        "difficulty": "Beginner",
        "instructions": "1. Sit with feet braced on footrests and knees slightly unlocked.\n2. Grip V-bar handle and pull toward your lower stomach.\n3. Keep torso upright without excessive leaning back.\n4. Return smoothly to full arm extension.",
        "tips": "Squeeze your scapulae together for 1 second at full contraction.",
        "image_url": "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600&auto=format&fit=crop"
    },
    {
        "name": "Dumbbell Row",
        "muscle_group": "Back",
        "secondary_muscles": "Lats, Biceps, Core",
        "equipment": "Dumbbell",
        "difficulty": "Beginner",
        "instructions": "1. Place one knee and same-side hand on a bench for support.\n2. Hold dumbbell in free hand with arm hanging straight.\n3. Row dumbbell upward towards hip, keeping elbow close to torso.\n4. Lower slowly to starting position.",
        "tips": "Keep torso parallel to bench and avoid twisting your spine.",
        "image_url": "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&auto=format&fit=crop"
    },
    {
        "name": "Deadlift",
        "muscle_group": "Back",
        "secondary_muscles": "Hamstrings, Glutes, Traps, Core",
        "equipment": "Barbell",
        "difficulty": "Advanced",
        "instructions": "1. Stand with feet hip-width apart, barbell over mid-foot.\n2. Hinge at hips and grip bar just outside knees.\n3. Flatten back, wedge hips, engage lats.\n4. Drive through the floor, extending hips and knees simultaneously to lockout.",
        "tips": "Keep bar in contact with shins and thighs throughout the entire path.",
        "image_url": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop"
    },

    # Legs
    {
        "name": "Barbell Squat",
        "muscle_group": "Legs",
        "secondary_muscles": "Glutes, Hamstrings, Core, Lower Back",
        "equipment": "Barbell",
        "difficulty": "Intermediate",
        "instructions": "1. Rest barbell comfortably across upper traps/rear delts.\n2. Stand with feet slightly wider than shoulder-width, toes angled slightly out.\n3. Sit back and down into hips until thighs are parallel to floor.\n4. Drive up through midfoot to stand.",
        "tips": "Maintain neutral spine and do not let knees cave inwards.",
        "image_url": "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&auto=format&fit=crop"
    },
    {
        "name": "Leg Press",
        "muscle_group": "Legs",
        "secondary_muscles": "Quads, Glutes",
        "equipment": "Machine",
        "difficulty": "Beginner",
        "instructions": "1. Sit securely in machine seat with back flat against backrest.\n2. Place feet shoulder-width on platform.\n3. Release safety pins and lower sled until knees form a 90-degree angle.\n4. Push sled back up without hyperextending knees.",
        "tips": "Never lock out knees abruptly at the top.",
        "image_url": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop"
    },
    {
        "name": "Romanian Deadlift",
        "muscle_group": "Legs",
        "secondary_muscles": "Hamstrings, Glutes, Lower Back",
        "equipment": "Barbell",
        "difficulty": "Intermediate",
        "instructions": "1. Hold barbell with overhand grip at hip level.\n2. Hinge at hips with slight knee bend, pushing hips directly backwards.\n3. Lower bar along thighs until you feel a deep hamstring stretch.\n4. Squeeze glutes and thrust hips forward to return to standing.",
        "tips": "The movement is a hip hinge, not a squat. Do not lower weight by bending knees further.",
        "image_url": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop"
    },
    {
        "name": "Goblet Squat",
        "muscle_group": "Legs",
        "secondary_muscles": "Quads, Core, Glutes",
        "equipment": "Dumbbell",
        "difficulty": "Beginner",
        "instructions": "1. Hold a dumbbell vertically against your upper chest.\n2. Feet shoulder-width apart.\n3. Squat deep between your knees, keeping torso upright.\n4. Drive upward through heels.",
        "tips": "Elbows should track inside knees at bottom position.",
        "image_url": "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&auto=format&fit=crop"
    },
    {
        "name": "Bulgarian Split Squats",
        "muscle_group": "Legs",
        "secondary_muscles": "Quads, Glutes, Balance",
        "equipment": "Dumbbell",
        "difficulty": "Intermediate",
        "instructions": "1. Stand 2-3 feet in front of a bench.\n2. Rest top of rear foot on bench behind you.\n3. Lower front thigh until parallel with floor.\n4. Push through front heel to rise back up.",
        "tips": "Torso can have a slight forward lean for greater glute activation.",
        "image_url": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop"
    },
    {
        "name": "Walking Lunges",
        "muscle_group": "Legs",
        "secondary_muscles": "Quads, Glutes, Calves",
        "equipment": "Dumbbell",
        "difficulty": "Beginner",
        "instructions": "1. Take a long step forward with right leg.\n2. Lower back knee until it almost touches floor.\n3. Push through right heel and step forward with left leg.",
        "tips": "Maintain tall posture and brace core to maintain balance.",
        "image_url": "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&auto=format&fit=crop"
    },
    {
        "name": "Leg Curl",
        "muscle_group": "Legs",
        "secondary_muscles": "Hamstrings, Calves",
        "equipment": "Machine",
        "difficulty": "Beginner",
        "instructions": "1. Lie face down on machine with roller pad above heels.\n2. Curl legs upward towards glutes, contracting hamstrings.\n3. Pause briefly at peak contraction, then lower slowly.",
        "tips": "Keep hips pinned to the pad to isolate hamstrings without lower back hyperextension.",
        "image_url": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop"
    },
    {
        "name": "Calf Raises",
        "muscle_group": "Legs",
        "secondary_muscles": "Gastrocnemius, Soleus",
        "equipment": "Bodyweight",
        "difficulty": "Beginner",
        "instructions": "1. Stand with balls of feet on an edge.\n2. Lower heels down for a full calf stretch.\n3. Raise up as high as possible on toes, squeezing calves for 2 seconds.",
        "tips": "Control the tempo: slow descent, hard squeeze at top.",
        "image_url": "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&auto=format&fit=crop"
    },

    # Shoulders
    {
        "name": "Overhead Barbell Press",
        "muscle_group": "Shoulders",
        "secondary_muscles": "Triceps, Upper Chest, Core",
        "equipment": "Barbell",
        "difficulty": "Intermediate",
        "instructions": "1. Stand tall, barbell at clavicle level.\n2. Grip slightly wider than shoulders.\n3. Press overhead vertically, moving head slightly back then bringing it forward at top lockout.",
        "tips": "Brace glutes and abs to avoid lumbar hyperextension.",
        "image_url": "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&auto=format&fit=crop"
    },
    {
        "name": "Dumbbell Shoulder Press",
        "muscle_group": "Shoulders",
        "secondary_muscles": "Triceps, Upper Traps",
        "equipment": "Dumbbell",
        "difficulty": "Beginner",
        "instructions": "1. Sit on bench with back support holding dumbbells at ear level.\n2. Press upward until arms are straight.\n3. Lower with control back to starting position.",
        "tips": "Keep wrists directly above elbows during the movement.",
        "image_url": "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&auto=format&fit=crop"
    },
    {
        "name": "Dumbbell Lateral Raise",
        "muscle_group": "Shoulders",
        "secondary_muscles": "Lateral Deltoid",
        "equipment": "Dumbbell",
        "difficulty": "Beginner",
        "instructions": "1. Stand holding dumbbells at sides with slight forward lean.\n2. Raise arms out to sides until elbows reach shoulder height.\n3. Lower slowly back to sides.",
        "tips": "Lead with elbows and pour a pitcher of water at top for peak lateral head tension.",
        "image_url": "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&auto=format&fit=crop"
    },
    {
        "name": "Face Pulls",
        "muscle_group": "Shoulders",
        "secondary_muscles": "Rear Deltoid, Rhomboids, Rotator Cuff",
        "equipment": "Cable",
        "difficulty": "Beginner",
        "instructions": "1. Set cable rope attachment to eye level.\n2. Pull rope toward face while externally rotating shoulders, knuckles facing back.\n3. Squeeze shoulder blades together.",
        "tips": "Essential posture exercise for shoulder health and longevity.",
        "image_url": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop"
    },
    {
        "name": "Pike Push-ups",
        "muscle_group": "Shoulders",
        "secondary_muscles": "Triceps, Upper Chest",
        "equipment": "Bodyweight",
        "difficulty": "Intermediate",
        "instructions": "1. Form an inverted V-shape with hips elevated high in the air.\n2. Lower head forward between hands.\n3. Press back up to starting pike position.",
        "tips": "Excellent bodyweight vertical press builder.",
        "image_url": "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=600&auto=format&fit=crop"
    },

    # Arms - Biceps & Triceps
    {
        "name": "Barbell Bicep Curl",
        "muscle_group": "Biceps",
        "secondary_muscles": "Forearms, Brachialis",
        "equipment": "Barbell",
        "difficulty": "Beginner",
        "instructions": "1. Stand holding barbell with underhand shoulder-width grip.\n2. Curl bar toward chest, keeping elbows pinned to ribs.\n3. Squeeze biceps hard at top, lower slowly.",
        "tips": "Do not swing hips or lower back to move the weight.",
        "image_url": "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&auto=format&fit=crop"
    },
    {
        "name": "Dumbbell Bicep Curl",
        "muscle_group": "Biceps",
        "secondary_muscles": "Forearms",
        "equipment": "Dumbbell",
        "difficulty": "Beginner",
        "instructions": "1. Stand holding dumbbells at sides.\n2. Curl weights up while supinating (turning palms up).\n3. Lower with strict 2-3 second tempo.",
        "tips": "Can be done alternating or both arms simultaneously.",
        "image_url": "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&auto=format&fit=crop"
    },
    {
        "name": "Hammer Curls",
        "muscle_group": "Biceps",
        "secondary_muscles": "Brachioradialis, Forearms",
        "equipment": "Dumbbell",
        "difficulty": "Beginner",
        "instructions": "1. Hold dumbbells with neutral grip (palms facing each other).\n2. Curl upward keeping palms facing inward.\n3. Lower with complete control.",
        "tips": "Builds arm thickness and forearm grip strength.",
        "image_url": "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&auto=format&fit=crop"
    },
    {
        "name": "Tricep Rope Pushdown",
        "muscle_group": "Triceps",
        "secondary_muscles": "Lateral Head",
        "equipment": "Cable",
        "difficulty": "Beginner",
        "instructions": "1. Attach rope to high cable pulley.\n2. Keep upper arms glued to sides.\n3. Extend arms down and spread rope apart at the bottom.\n4. Return until forearms are horizontal.",
        "tips": "Lock elbows in place to prevent chest or shoulder takeover.",
        "image_url": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop"
    },
    {
        "name": "Skull Crushers",
        "muscle_group": "Triceps",
        "secondary_muscles": "Long Head Triceps",
        "equipment": "Barbell",
        "difficulty": "Intermediate",
        "instructions": "1. Lie on bench holding EZ bar or barbell over forehead.\n2. Keeping elbows stationary, lower bar towards forehead/crown.\n3. Extend elbows back to lockout.",
        "tips": "Keep elbows pointing straight up; do not let them flare wide.",
        "image_url": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&auto=format&fit=crop"
    },
    {
        "name": "Tricep Dips",
        "muscle_group": "Triceps",
        "secondary_muscles": "Lower Chest, Anterior Deltoids",
        "equipment": "Bodyweight",
        "difficulty": "Intermediate",
        "instructions": "1. Grip parallel dip bars and lift body until arms are locked.\n2. Lower torso until elbows reach 90 degrees.\n3. Push firmly back up to top position.",
        "tips": "Stay upright to prioritize triceps; leaning forward shifts load to chest.",
        "image_url": "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&auto=format&fit=crop"
    },

    # Core & Cardio
    {
        "name": "Plank",
        "muscle_group": "Core",
        "secondary_muscles": "Transverse Abdominis, Glutes, Shoulders",
        "equipment": "Bodyweight",
        "difficulty": "Beginner",
        "instructions": "1. Rest on forearms and toes.\n2. Keep body rigid like an ironing board from head to heels.\n3. Hold without letting hips sag or pike.",
        "tips": "Squeeze glutes and draw belly button inward toward spine.",
        "image_url": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop"
    },
    {
        "name": "Hanging Leg Raise",
        "muscle_group": "Core",
        "secondary_muscles": "Lower Abs, Hip Flexors, Grip",
        "equipment": "Bodyweight",
        "difficulty": "Intermediate",
        "instructions": "1. Hang from pull-up bar with arms fully extended.\n2. Raise legs up to 90 degrees or touch toes to bar without swinging.\n3. Lower with 3-second control.",
        "tips": "Posteriorly tilt pelvis at the top for true abdominal activation.",
        "image_url": "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&auto=format&fit=crop"
    },
    {
        "name": "Russian Twists",
        "muscle_group": "Core",
        "secondary_muscles": "Obliques, Hip Flexors",
        "equipment": "Bodyweight",
        "difficulty": "Beginner",
        "instructions": "1. Sit on floor with knees bent and feet elevated.\n2. Lean torso back slightly to create tension.\n3. Rotate torso side to side, touching floor beside your hips.",
        "tips": "Rotate through thoracic spine rather than merely moving arms.",
        "image_url": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop"
    },
    {
        "name": "Treadmill Incline Walk",
        "muscle_group": "Cardio",
        "secondary_muscles": "Calves, Glutes, Cardiovascular",
        "equipment": "Machine",
        "difficulty": "Beginner",
        "instructions": "1. Set treadmill incline to 10-12% and speed to 4.5-5.5 km/h.\n2. Walk maintaining upright posture.\n3. Do not lean or hang onto handrails.",
        "tips": "Superb low-impact cardio that preserves muscle mass while burning calories.",
        "image_url": "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=600&auto=format&fit=crop"
    }
]


def seed_database(db: Session):
    """Seeds initial exercises and demo data if not already present."""
    # 1. Seed Exercises
    existing_count = db.query(Exercise).count()
    if existing_count == 0:
        logger.info("Seeding initial exercise library...")
        for ex in EXERCISES_DATA:
            exercise = Exercise(**ex)
            db.add(exercise)
        db.commit()
        logger.info(f"Seeded {len(EXERCISES_DATA)} exercises.")

    # 2. Seed Demo User
    demo_email = "demo@fitgenius.ai"
    demo_user = db.query(User).filter(User.email == demo_email).first()
    if not demo_user:
        logger.info("Creating demo user account...")
        demo_user = User(
            email=demo_email,
            full_name="Alex Rivers",
            hashed_password=get_password_hash("password123"),
            is_active=True
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)

        # Profile
        profile = FitnessProfile(
            user_id=demo_user.id,
            age=27,
            gender="Male",
            height_cm=180.0,
            weight_kg=78.5,
            target_weight_kg=82.0,
            goal="muscle_gain",
            experience="intermediate",
            training_days=4,
            equipment="gym",
            session_duration=60,
            fitness_level_notes="Focusing on hypertrophy and upper body strength."
        )
        db.add(profile)
        db.commit()

        # Seed initial progress history (weight over last 6 weeks)
        now = datetime.now(timezone.utc)
        weights = [80.5, 80.0, 79.4, 79.0, 78.8, 78.5]
        for i, w in enumerate(reversed(weights)):
            log_date = now - timedelta(days=7 * (5 - i))
            progress_log = ProgressLog(
                user_id=demo_user.id,
                date=log_date,
                weight_kg=w,
                body_fat_percentage=14.5 - (i * 0.2),
                waist_cm=82.0 - (i * 0.3),
                chest_cm=102.0 + (i * 0.4),
                notes=f"Week {i+1} progress log: energy levels high, recovery on point."
            )
            db.add(progress_log)
        db.commit()

        # Seed an active AI workout plan
        plan = WorkoutPlan(
            user_id=demo_user.id,
            title="4-Day AI Hypertrophy & Strength Split",
            description="High-yield upper/lower periodization split maximizing muscle growth and recovery.",
            goal="muscle_gain",
            experience_level="intermediate",
            days_per_week=4,
            duration_weeks=4,
            is_active=True,
            generated_by_ai=True,
            ai_rationale="Tailored for Alex's 4-day availability and gym access. Features alternating push-pull compound patterns and progressive overload volume."
        )
        db.add(plan)
        db.commit()
        db.refresh(plan)

        # Days
        db_exs = {e.name: e for e in db.query(Exercise).all()}
        
        days_config = [
            ("Day 1: Upper Body Power", "Monday", "Chest, Back, Arms", [
                ("Barbell Bench Press", 4, "8-10", 90),
                ("Lat Pulldown", 4, "10-12", 75),
                ("Incline Dumbbell Press", 3, "10-12", 60),
                ("Seated Cable Row", 3, "10-12", 60),
                ("Dumbbell Bicep Curl", 3, "12-15", 45),
                ("Tricep Rope Pushdown", 3, "12-15", 45)
            ]),
            ("Day 2: Lower Body Quad & Core", "Tuesday", "Legs, Core", [
                ("Barbell Squat", 4, "6-8", 120),
                ("Leg Press", 3, "10-12", 90),
                ("Bulgarian Split Squats", 3, "10-12", 75),
                ("Calf Raises", 4, "15-20", 45),
                ("Hanging Leg Raise", 3, "12-15", 60)
            ]),
            ("Day 3: Upper Body Hypertrophy", "Thursday", "Shoulders, Back, Chest", [
                ("Overhead Barbell Press", 4, "8-10", 90),
                ("Barbell Bent-Over Row", 4, "8-10", 90),
                ("Dumbbell Lateral Raise", 4, "12-15", 45),
                ("Cable Crossover", 3, "12-15", 60),
                ("Face Pulls", 3, "15-20", 45)
            ]),
            ("Day 4: Lower Body Posterior & Hamstrings", "Friday", "Legs, Lower Back", [
                ("Romanian Deadlift", 4, "8-10", 90),
                ("Leg Curl", 4, "10-12", 60),
                ("Walking Lunges", 3, "12 per leg", 60),
                ("Plank", 3, "45-60 sec", 45)
            ])
        ]

        for day_idx, (day_title, day_name, focus, ex_list) in enumerate(days_config, 1):
            w_day = WorkoutDay(
                plan_id=plan.id,
                day_number=day_idx,
                day_name=day_name,
                title=day_title,
                focus_muscle_group=focus,
                is_rest_day=False,
                notes="Focus on 2-second eccentrics and progressive overload."
            )
            db.add(w_day)
            db.commit()
            db.refresh(w_day)

            for order, (name, s, r, rest) in enumerate(ex_list):
                if name in db_exs:
                    w_ex = WorkoutExercise(
                        workout_day_id=w_day.id,
                        exercise_id=db_exs[name].id,
                        order_index=order,
                        sets=s,
                        reps=r,
                        rest_seconds=rest,
                        target_rpe=8.0,
                        notes="Keep form strict."
                    )
                    db.add(w_ex)
            db.commit()

        # Seed sample completed workout session
        day_one = db.query(WorkoutDay).filter(WorkoutDay.plan_id == plan.id).first()
        session = WorkoutSession(
            user_id=demo_user.id,
            workout_day_id=day_one.id if day_one else None,
            plan_id=plan.id,
            title="Upper Body Power Session",
            start_time=now - timedelta(days=2, hours=1),
            end_time=now - timedelta(days=2),
            duration_minutes=58,
            total_volume_kg=4820.0,
            notes="Hit a new PR on Bench Press! Excellent pump and energy.",
            rating=5,
            is_completed=True
        )
        db.add(session)
        db.commit()
        db.refresh(session)

        # Seed exercise logs for that session
        if "Barbell Bench Press" in db_exs:
            bench_id = db_exs["Barbell Bench Press"].id
            for s_num, (wt, rp) in enumerate([(60.0, 10), (70.0, 10), (75.0, 8), (80.0, 6)], 1):
                db.add(ExerciseLog(
                    session_id=session.id,
                    exercise_id=bench_id,
                    set_number=s_num,
                    weight_kg=wt,
                    reps_completed=rp,
                    is_completed=True,
                    rpe=8.5
                ))
        db.commit()
        logger.info("Demo user, plan, and initial session data seeded successfully.")
