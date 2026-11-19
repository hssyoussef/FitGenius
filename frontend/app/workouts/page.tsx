"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Calendar, 
  Sparkles, 
  Play, 
  Clock, 
  Dumbbell, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Info,
  RefreshCw
} from "lucide-react";
import { useAuth } from "../../lib/context/AuthContext";
import { api } from "../../lib/api";
import { WorkoutPlan, WorkoutDay } from "../../lib/types";
import { AppShell } from "../../components/AppShell";

export default function WorkoutsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [activePlan, setActivePlan] = useState<WorkoutPlan | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [expandedExerciseId, setExpandedExerciseId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }
    if (isAuthenticated) {
      loadPlan();
    }
  }, [isAuthenticated, isLoading, router]);

  const loadPlan = async () => {
    setLoading(true);
    try {
      const plan = await api.getActivePlan();
      setActivePlan(plan);
    } catch (err) {
      console.error("Failed to load workout plan:", err);
    } finally {
      setLoading(false);
    }
  };

  const currentDay: WorkoutDay | undefined = activePlan?.days?.[selectedDayIndex];

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold mb-2">
            <Calendar className="w-3.5 h-3.5 text-emerald-500" />
            <span>Weekly Training Schedule</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {activePlan?.title || "My Workout Plan"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {activePlan?.description || "Select a training day to inspect sets, reps, and instructions."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/generator"
            className="px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111726] hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Tune with AI</span>
          </Link>

          {currentDay && (
            <Link
              href={`/workout-live?day_id=${currentDay.id}`}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Train {currentDay.day_name}</span>
            </Link>
          )}
        </div>
      </div>

      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-500" />
          <p className="text-xs font-semibold">Loading weekly split...</p>
        </div>
      ) : activePlan && activePlan.days?.length > 0 ? (
        <div className="space-y-6">
          {/* Day Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {activePlan.days.map((day, idx) => {
              const isSelected = selectedDayIndex === idx;
              return (
                <button
                  key={day.id || idx}
                  onClick={() => setSelectedDayIndex(idx)}
                  className={`flex-shrink-0 px-4 py-3 rounded-2xl border transition-all text-left flex flex-col min-w-[140px] ${
                    isSelected
                      ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20 shadow-md"
                      : "bg-white dark:bg-[#111726] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:border-slate-400"
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {day.day_name}
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 truncate">
                    {day.title}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1">
                    {day.exercises?.length || 0} exercises
                  </span>
                </button>
              );
            })}
          </div>

          {/* Current Day Details Banner */}
          {currentDay && (
            <div className="p-6 rounded-3xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    {currentDay.day_name}
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                    {currentDay.title}
                  </h2>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Focus: <span className="font-semibold text-slate-300">{currentDay.focus_muscle_group}</span> · {currentDay.notes}
                </p>
              </div>

              <Link
                href={`/workout-live?day_id=${currentDay.id}`}
                className="py-2.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition flex items-center justify-center gap-2 shrink-0"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start Session</span>
              </Link>
            </div>
          )}

          {/* Exercises List */}
          <div className="space-y-3">
            {currentDay?.exercises?.map((wEx, idx) => {
              const isExpanded = expandedExerciseId === wEx.id;
              const ex = wEx.exercise;

              return (
                <div
                  key={wEx.id || idx}
                  className="rounded-2xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition hover:border-slate-300 dark:hover:border-slate-700"
                >
                  <div
                    onClick={() => setExpandedExerciseId(isExpanded ? null : wEx.id)}
                    className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-emerald-500 font-extrabold flex items-center justify-center text-xs">
                        {idx + 1}
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          {ex?.name || "Exercise"}
                          {ex?.difficulty && (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                              {ex.difficulty}
                            </span>
                          )}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                          <span>{ex?.muscle_group}</span>
                          <span>·</span>
                          <span>{ex?.equipment}</span>
                          <span>·</span>
                          <span className="text-slate-400">{wEx.rest_seconds}s rest</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                          {wEx.sets} sets × {wEx.reps}
                        </div>
                        {wEx.target_rpe && (
                          <div className="text-[10px] text-slate-400">Target RPE: {wEx.target_rpe}</div>
                        )}
                      </div>

                      <button className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Instructions & Tips */}
                  {isExpanded && ex && (
                    <div className="px-5 pb-5 pt-2 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#0A0F1E]/50 text-xs space-y-3 animate-in fade-in duration-200">
                      {ex.image_url && (
                        <div className="w-full h-44 rounded-xl overflow-hidden relative mb-2">
                          <img 
                            src={ex.image_url} 
                            alt={ex.name}
                            className="w-full h-full object-cover" 
                          />
                        </div>
                      )}

                      <div>
                        <h5 className="font-bold text-slate-900 dark:text-white mb-1">
                          Step-by-Step Instructions:
                        </h5>
                        <p className="text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                          {ex.instructions}
                        </p>
                      </div>

                      {ex.tips && (
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                          <span className="font-bold">Form Tip: </span>
                          {ex.tips}
                        </div>
                      )}

                      {wEx.notes && (
                        <div className="text-slate-500">
                          <span className="font-semibold text-slate-400">AI Coach Note: </span>
                          {wEx.notes}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800">
          <Sparkles className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold">No Active Workout Plan</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            You don't have an active workout plan yet. Use the AI generator to create your evidence-based routine.
          </p>
          <Link
            href="/generator"
            className="mt-5 inline-flex items-center gap-2 py-2.5 px-5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 hover:bg-emerald-400 transition"
          >
            <span>Create AI Workout Plan</span>
          </Link>
        </div>
      )}
    </AppShell>
  );
}
