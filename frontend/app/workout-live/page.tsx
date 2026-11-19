"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Check, 
  Plus, 
  Clock, 
  Dumbbell, 
  CheckCircle2, 
  Flame, 
  Star, 
  Sparkles,
  ArrowRight,
  X,
  Volume2
} from "lucide-react";
import { useAuth } from "../../lib/context/AuthContext";
import { api } from "../../lib/api";
import { WorkoutPlan, WorkoutDay, Exercise } from "../../lib/types";
import { AppShell } from "../../components/AppShell";

interface ActiveSet {
  setNumber: number;
  weightKg: number;
  repsCompleted: number;
  isCompleted: boolean;
  rpe?: number;
}

interface ActiveExerciseTracking {
  exerciseId: number;
  name: string;
  muscleGroup: string;
  equipment: string;
  restSeconds: number;
  targetReps: string;
  sets: ActiveSet[];
}

function LiveWorkoutContent() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dayIdParam = searchParams.get("day_id");

  // Session State
  const [sessionTitle, setSessionTitle] = useState("Hypertrophy Training Session");
  const [exercisesTracking, setExercisesTracking] = useState<ActiveExerciseTracking[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Rest Timer State
  const [restTimerSeconds, setRestTimerSeconds] = useState(0);
  const [restTimerActive, setRestTimerActive] = useState(false);
  const [initialRestSeconds, setInitialRestSeconds] = useState(60);

  // Finish Modal State
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
  const [workoutRating, setWorkoutRating] = useState(5);
  const [workoutNotes, setWorkoutNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sound Synth using Web Audio API
  const playRestCompleteSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.3); // A6
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch {
      // AudioContext unavailable or blocked by autoplay
    }
  };

  // Workout Duration Timer
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Rest Countdown Timer
  useEffect(() => {
    let interval: any = null;
    if (restTimerActive && restTimerSeconds > 0) {
      interval = setInterval(() => {
        setRestTimerSeconds((prev) => {
          if (prev <= 1) {
            setRestTimerActive(false);
            playRestCompleteSound();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [restTimerActive, restTimerSeconds]);

  // Initialize or Load Day exercises
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (isAuthenticated) {
      initializeSession();
    }
  }, [isAuthenticated, isLoading, dayIdParam]);

  const initializeSession = async () => {
    try {
      const plan = await api.getActivePlan();
      let targetDay: WorkoutDay | undefined;

      if (plan && plan.days && plan.days.length > 0) {
        if (dayIdParam) {
          targetDay = plan.days.find((d) => d.id === parseInt(dayIdParam));
        }
        if (!targetDay) {
          targetDay = plan.days[0];
        }
      }

      if (targetDay && targetDay.exercises && targetDay.exercises.length > 0) {
        setSessionTitle(targetDay.title);
        const mapped: ActiveExerciseTracking[] = targetDay.exercises.map((wEx) => {
          const defaultSetsCount = wEx.sets || 3;
          const defaultReps = parseInt(wEx.reps.split("-")[0]) || 10;
          const setsArr: ActiveSet[] = Array.from({ length: defaultSetsCount }).map((_, i) => ({
            setNumber: i + 1,
            weightKg: 40.0,
            repsCompleted: defaultReps,
            isCompleted: false,
            rpe: wEx.target_rpe || 8.0
          }));

          return {
            exerciseId: wEx.exercise_id,
            name: wEx.exercise?.name || "Exercise",
            muscleGroup: wEx.exercise?.muscle_group || "Target Area",
            equipment: wEx.exercise?.equipment || "Weight",
            restSeconds: wEx.rest_seconds || 60,
            targetReps: wEx.reps || "10-12",
            sets: setsArr
          };
        });

        setExercisesTracking(mapped);
      } else {
        // Fallback default exercises if no active plan
        const allExercises = await api.getExercises();
        const sampleExercises = allExercises.slice(0, 4);
        setExercisesTracking(
          sampleExercises.map((ex) => ({
            exerciseId: ex.id,
            name: ex.name,
            muscleGroup: ex.muscle_group,
            equipment: ex.equipment,
            restSeconds: 60,
            targetReps: "10-12",
            sets: [
              { setNumber: 1, weightKg: 50.0, repsCompleted: 10, isCompleted: false },
              { setNumber: 2, weightKg: 50.0, repsCompleted: 10, isCompleted: false },
              { setNumber: 3, weightKg: 50.0, repsCompleted: 10, isCompleted: false }
            ]
          }))
        );
      }

      // Create session in backend
      const session = await api.startWorkout({
        title: targetDay?.title || "Live Hypertrophy Training Session",
        workout_day_id: targetDay?.id,
        plan_id: plan?.id
      });
      setActiveSessionId(session.id);
    } catch (err) {
      console.error("Error setting up workout session:", err);
    }
  };

  const triggerRestTimer = (seconds: number) => {
    setInitialRestSeconds(seconds);
    setRestTimerSeconds(seconds);
    setRestTimerActive(true);
  };

  const handleToggleSetComplete = (exIdx: number, setIdx: number) => {
    setExercisesTracking((prev) => {
      const copy = [...prev];
      const targetEx = { ...copy[exIdx] };
      const targetSets = [...targetEx.sets];
      const currentSet = { ...targetSets[setIdx] };

      const willBeCompleted = !currentSet.isCompleted;
      currentSet.isCompleted = willBeCompleted;
      targetSets[setIdx] = currentSet;
      targetEx.sets = targetSets;
      copy[exIdx] = targetEx;

      // Start rest timer automatically when completing a set
      if (willBeCompleted) {
        triggerRestTimer(targetEx.restSeconds || 60);
      }

      return copy;
    });
  };

  const handleUpdateWeight = (exIdx: number, setIdx: number, val: number) => {
    setExercisesTracking((prev) => {
      const copy = [...prev];
      copy[exIdx].sets[setIdx].weightKg = val;
      return copy;
    });
  };

  const handleUpdateReps = (exIdx: number, setIdx: number, val: number) => {
    setExercisesTracking((prev) => {
      const copy = [...prev];
      copy[exIdx].sets[setIdx].repsCompleted = val;
      return copy;
    });
  };

  const handleAddSet = (exIdx: number) => {
    setExercisesTracking((prev) => {
      const copy = [...prev];
      const ex = copy[exIdx];
      const lastSet = ex.sets[ex.sets.length - 1];
      ex.sets.push({
        setNumber: ex.sets.length + 1,
        weightKg: lastSet ? lastSet.weightKg : 40.0,
        repsCompleted: lastSet ? lastSet.repsCompleted : 10,
        isCompleted: false,
        rpe: lastSet ? lastSet.rpe : 8.0
      });
      return copy;
    });
  };

  // Calculations
  const totalVolumeKg = exercisesTracking.reduce((acc, ex) => {
    return (
      acc +
      ex.sets
        .filter((s) => s.isCompleted)
        .reduce((sAcc, s) => sAcc + s.weightKg * s.repsCompleted, 0)
    );
  }, 0);

  const completedSetsCount = exercisesTracking.reduce((acc, ex) => {
    return acc + ex.sets.filter((s) => s.isCompleted).length;
  }, 0);

  const totalSetsCount = exercisesTracking.reduce((acc, ex) => acc + ex.sets.length, 0);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleFinishWorkout = async () => {
    if (!activeSessionId) return;
    setIsSubmitting(true);

    try {
      // Build exercise logs payload
      const exerciseLogs: any[] = [];
      exercisesTracking.forEach((ex) => {
        ex.sets.forEach((s) => {
          exerciseLogs.push({
            exercise_id: ex.exerciseId,
            set_number: s.setNumber,
            weight_kg: s.weightKg,
            reps_completed: s.repsCompleted,
            is_completed: s.isCompleted,
            rpe: s.rpe
          });
        });
      });

      await api.finishWorkout(activeSessionId, {
        duration_minutes: Math.max(1, Math.round(elapsedSeconds / 60)),
        total_volume_kg: totalVolumeKg,
        notes: workoutNotes,
        rating: workoutRating,
        exercise_logs: exerciseLogs
      });

      setIsFinishModalOpen(false);
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Failed to finish session:", err);
      alert("Could not finish session. Check connection and retry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell>
      {/* Sticky Top Workout HUD */}
      <div className="sticky top-16 z-30 mb-8 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3.5 bg-white/90 dark:bg-[#090D16]/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
                  {formatTime(elapsedSeconds)}
                </span>
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                  title={isTimerRunning ? "Pause timer" : "Resume timer"}
                >
                  {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current text-emerald-500" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xs">
                {sessionTitle}
              </p>
            </div>
          </div>

          {/* Quick HUD Metrics */}
          <div className="flex items-center gap-4 text-xs">
            <div className="hidden sm:block text-right">
              <span className="text-slate-400">Total Volume</span>
              <div className="font-extrabold text-emerald-500">
                {Math.round(totalVolumeKg).toLocaleString()} kg
              </div>
            </div>

            <div className="hidden sm:block text-right">
              <span className="text-slate-400">Sets Completed</span>
              <div className="font-extrabold text-cyan-400">
                {completedSetsCount} / {totalSetsCount}
              </div>
            </div>

            <button
              onClick={() => setIsFinishModalOpen(true)}
              className="py-2 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Finish Workout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Rest Timer Floating Bar (when active) */}
      {restTimerActive && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-teal-950/70 to-slate-900 border border-emerald-500/40 shadow-xl flex items-center justify-between animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 font-black flex items-center justify-center font-mono text-base shadow-md">
              {restTimerSeconds}s
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                <span>Rest Interval Active</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Breathe deeply. Sound will cue when ready for next set.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setRestTimerSeconds((prev) => prev + 30)}
              className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
            >
              +30s
            </button>
            <button
              onClick={() => {
                setRestTimerActive(false);
                setRestTimerSeconds(0);
              }}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs"
              title="Skip rest"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Exercises Tracking List */}
      <div className="space-y-6">
        {exercisesTracking.map((ex, exIdx) => {
          const completedExSets = ex.sets.filter((s) => s.isCompleted).length;
          return (
            <div
              key={ex.exerciseId || exIdx}
              className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 shadow-sm"
            >
              {/* Exercise Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-emerald-500 font-extrabold flex items-center justify-center text-xs">
                    {exIdx + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      {ex.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <span>{ex.muscleGroup}</span>
                      <span>·</span>
                      <span>{ex.equipment}</span>
                      <span>·</span>
                      <span className="text-emerald-500 font-medium">Target: {ex.targetReps}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    onClick={() => triggerRestTimer(ex.restSeconds)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-500 text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Rest {ex.restSeconds}s</span>
                  </button>
                </div>
              </div>

              {/* Set Table */}
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-100 dark:border-slate-800/60 font-semibold">
                      <th className="pb-2.5 w-12 text-center">SET</th>
                      <th className="pb-2.5 min-w-[100px]">KG (WEIGHT)</th>
                      <th className="pb-2.5 min-w-[100px]">REPS</th>
                      <th className="pb-2.5 w-16 text-center">RPE</th>
                      <th className="pb-2.5 w-14 text-center">DONE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                    {ex.sets.map((set, setIdx) => (
                      <tr
                        key={set.setNumber}
                        className={`transition ${set.isCompleted ? "bg-emerald-500/5" : ""}`}
                      >
                        <td className="py-2.5 text-center font-bold text-slate-500">
                          {set.setNumber}
                        </td>
                        <td className="py-2.5 pr-3">
                          <input
                            type="number"
                            step="0.5"
                            value={set.weightKg}
                            onChange={(e) =>
                              handleUpdateWeight(exIdx, setIdx, parseFloat(e.target.value) || 0)
                            }
                            className="w-24 px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-700/80 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </td>
                        <td className="py-2.5 pr-3">
                          <input
                            type="number"
                            value={set.repsCompleted}
                            onChange={(e) =>
                              handleUpdateReps(exIdx, setIdx, parseInt(e.target.value) || 0)
                            }
                            className="w-20 px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-700/80 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </td>
                        <td className="py-2.5 text-center text-slate-400">
                          {set.rpe ? `@${set.rpe}` : "—"}
                        </td>
                        <td className="py-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleSetComplete(exIdx, setIdx)}
                            className={`w-7 h-7 rounded-lg border flex items-center justify-center transition ${
                              set.isCompleted
                                ? "bg-emerald-500 border-emerald-500 text-slate-950 font-bold"
                                : "border-slate-300 dark:border-slate-700 hover:border-emerald-500 text-transparent"
                            }`}
                          >
                            <Check className="w-4 h-4 stroke-[3]" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add Set Button */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
                <span>
                  {completedExSets} of {ex.sets.length} sets finished
                </span>
                <button
                  type="button"
                  onClick={() => handleAddSet(exIdx)}
                  className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Set</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Finish Session Confirmation Modal */}
      {isFinishModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 mx-auto mb-3 shadow-lg shadow-emerald-500/25">
                <div className="w-full h-full bg-[#090D16] rounded-[14px] flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                </div>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Workout Complete!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Outstanding work. Let's record your session performance.
              </p>
            </div>

            {/* Performance Summary Pill */}
            <div className="grid grid-cols-3 gap-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#090D16] border border-slate-100 dark:border-slate-800 text-center mb-6 text-xs">
              <div>
                <span className="text-[10px] text-slate-400">Duration</span>
                <div className="font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {Math.max(1, Math.round(elapsedSeconds / 60))}m
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400">Volume</span>
                <div className="font-extrabold text-emerald-500 mt-0.5">
                  {Math.round(totalVolumeKg)} kg
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400">Sets</span>
                <div className="font-extrabold text-cyan-400 mt-0.5">
                  {completedSetsCount}
                </div>
              </div>
            </div>

            {/* Rating Stars */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 text-center">
                Session Intensity & Feeling
              </label>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setWorkoutRating(star)}
                    className="p-1 text-2xl transition hover:scale-110"
                  >
                    <span className={star <= workoutRating ? "text-amber-400" : "text-slate-300 dark:text-slate-700"}>
                      ★
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Session Notes (optional)
              </label>
              <textarea
                rows={2}
                value={workoutNotes}
                onChange={(e) => setWorkoutNotes(e.target.value)}
                placeholder="e.g. Good pump on chest press, increase barbell weight next week."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsFinishModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Resume
              </button>
              <button
                type="button"
                onClick={handleFinishWorkout}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Save to History</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

export default function LiveWorkoutPage() {
  return (
    <React.Suspense
      fallback={
        <AppShell>
          <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-400">
            <div className="w-8 h-8 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
            <p className="text-xs font-semibold">Initializing workout tracker...</p>
          </div>
        </AppShell>
      }
    >
      <LiveWorkoutContent />
    </React.Suspense>
  );
}
