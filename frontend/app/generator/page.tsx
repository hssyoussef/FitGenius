"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  Dumbbell, 
  Check, 
  RefreshCw, 
  Clock, 
  Calendar, 
  ShieldCheck, 
  ArrowRight,
  Flame,
  Award
} from "lucide-react";
import { useAuth } from "../../lib/context/AuthContext";
import { api } from "../../lib/api";
import { WorkoutPlan } from "../../lib/types";
import { AppShell } from "../../components/AppShell";

export default function GeneratorPage() {
  const { profile, refreshProfile } = useAuth();
  const router = useRouter();

  const [goal, setGoal] = useState(profile?.goal || "muscle_gain");
  const [experience, setExperience] = useState(profile?.experience || "intermediate");
  const [trainingDays, setTrainingDays] = useState(profile?.training_days || 4);
  const [equipment, setEquipment] = useState(profile?.equipment || "gym");
  const [sessionDuration, setSessionDuration] = useState(profile?.session_duration || 45);
  const [additionalNotes, setAdditionalNotes] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStage, setGenerationStage] = useState("");
  const [generatedPlan, setGeneratedPlan] = useState<WorkoutPlan | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerationStage("Analyzing personal recovery capacity and goals...");

    try {
      setTimeout(() => setGenerationStage("Consulting biomechanics knowledge base & exercise volume rules..."), 800);
      setTimeout(() => setGenerationStage("FitGenius AI synthesizing structured split..."), 1600);

      const plan = await api.generatePlan({
        goal,
        experience,
        training_days: trainingDays,
        equipment,
        session_duration: sessionDuration,
        additional_notes: additionalNotes
      });

      setGeneratedPlan(plan);
      await refreshProfile();
    } catch (err: any) {
      console.error("AI Generation error:", err);
      alert(err.message || "Failed to generate workout plan. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleActivateAndGo = async () => {
    if (generatedPlan) {
      try {
        await api.setActivePlan(generatedPlan.id);
        router.push("/workouts");
      } catch (err) {
        router.push("/workouts");
      }
    }
  };

  return (
    <AppShell>
      {/* Title */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
          <span>Core AI Feature</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          AI Workout Generator
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
          Specify your training preferences. FitGenius AI evaluates recovery intervals, periodization volume, and equipment access to synthesize a complete weekly program.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form (5 cols) */}
        <div className="lg:col-span-5 p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          {/* Goal Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Primary Fitness Goal
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "muscle_gain", label: "Muscle Gain" },
                { id: "weight_loss", label: "Weight Loss" },
                { id: "strength", label: "Raw Strength" },
                { id: "maintenance", label: "Maintenance" }
              ].map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGoal(g.id)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition text-left ${
                    goal === g.id
                      ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                      : "bg-slate-50 dark:bg-[#090D16] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Training Days */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Weekly Frequency: <span className="text-emerald-500 font-bold">{trainingDays} Days / Week</span>
            </label>
            <div className="grid grid-cols-7 gap-1.5">
              {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setTrainingDays(d)}
                  className={`py-2 rounded-xl text-xs font-bold border transition ${
                    trainingDays === d
                      ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                      : "bg-slate-50 dark:bg-[#090D16] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400"
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Experience Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {["beginner", "intermediate", "advanced"].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setExperience(lvl)}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold capitalize border transition ${
                    experience === lvl
                      ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                      : "bg-slate-50 dark:bg-[#090D16] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Equipment */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Available Equipment
            </label>
            <div className="space-y-1.5">
              {[
                { id: "gym", label: "Full Gym (Barbells, Cables, Machines)" },
                { id: "home_dumbbells", label: "Home with Dumbbells & Bench" },
                { id: "dumbbells", label: "Dumbbells Only" },
                { id: "bodyweight", label: "Bodyweight (Calisthenics)" }
              ].map((eq) => (
                <div
                  key={eq.id}
                  onClick={() => setEquipment(eq.id)}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border cursor-pointer flex items-center justify-between transition ${
                    equipment === eq.id
                      ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/30"
                      : "bg-slate-50 dark:bg-[#090D16] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400"
                  }`}
                >
                  <span>{eq.label}</span>
                  {equipment === eq.id && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                </div>
              ))}
            </div>
          </div>

          {/* Session Duration */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Duration per Session
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[30, 45, 60, 90].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setSessionDuration(mins)}
                  className={`py-2 rounded-xl text-xs font-bold border transition ${
                    sessionDuration === mins
                      ? "bg-emerald-500 text-white border-emerald-500"
                      : "bg-slate-50 dark:bg-[#090D16] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400"
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>

          {/* Custom Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Custom Muscle Emphasis / Limitations
            </label>
            <textarea
              rows={2}
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="e.g. Focus on upper chest and rear delts, keep squats knee-friendly."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Submit */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/25 transition flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {isGenerating ? (
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Synthesizing Plan...</span>
              </div>
            ) : (
              <>
                <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                <span>Generate New AI Plan</span>
              </>
            )}
          </button>
        </div>

        {/* Right Output Preview (7 cols) */}
        <div className="lg:col-span-7">
          {isGenerating ? (
            <div className="h-full min-h-[420px] rounded-3xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 p-8 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-400 p-0.5 animate-pulse mb-4">
                <div className="w-full h-full bg-[#090D16] rounded-[14px] flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-emerald-400 animate-spin" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Generating Evidence-Based Program
              </h3>
              <p className="text-xs text-emerald-500 font-medium mt-1 animate-pulse">
                {generationStage}
              </p>
              <div className="mt-6 space-y-2 max-w-sm text-xs text-slate-400 text-left">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Calibrating repetition ranges & RPE targets</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Enforcing 48h muscle recovery separation</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Selecting highest motor-unit activation exercises</span>
                </div>
              </div>
            </div>
          ) : generatedPlan ? (
            <div className="rounded-3xl bg-white dark:bg-[#111726] border border-emerald-500/40 p-6 sm:p-8 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-500 uppercase tracking-wider mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Plan Generated Successfully</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    {generatedPlan.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {generatedPlan.days_per_week} Days/Week · {generatedPlan.experience_level} · {generatedPlan.goal}
                  </p>
                </div>

                <button
                  onClick={handleActivateAndGo}
                  className="py-2.5 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <span>Use This Plan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Rationale */}
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed">
                <span className="font-bold">AI Rationale: </span>
                {generatedPlan.ai_rationale}
              </div>

              {/* Schedule Days Accordion / List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Weekly Schedule Breakdown ({generatedPlan.days.length} Days)
                </h4>
                {generatedPlan.days.map((day) => (
                  <div
                    key={day.id || day.day_number}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-800/80"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-500">{day.day_name}</span>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">
                          {day.title}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {day.exercises?.length || 0} exercises
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                      {day.exercises?.map((ex, idx) => (
                        <div
                          key={ex.id || idx}
                          className="p-2.5 rounded-xl bg-white dark:bg-[#111726] border border-slate-200/60 dark:border-slate-800 text-xs flex justify-between items-center"
                        >
                          <span className="font-medium text-slate-800 dark:text-slate-200 truncate pr-2">
                            {ex.exercise?.name || (ex as any).exercise_name || "Exercise"}
                          </span>
                          <span className="text-emerald-500 font-bold shrink-0">
                            {ex.sets} × {ex.reps}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[420px] rounded-3xl bg-white dark:bg-[#111726] border border-dashed border-slate-300 dark:border-slate-800 p-8 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-4">
                <Dumbbell className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
                Configure & Generate
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">
                Adjust your training days, equipment, and duration on the left, then click "Generate New AI Plan" to synthesize your customized routine.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
