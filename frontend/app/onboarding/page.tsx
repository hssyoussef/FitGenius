"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  Dumbbell, 
  Target, 
  Clock, 
  Calendar, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Award,
  Zap,
  Activity
} from "lucide-react";
import { useAuth } from "../../lib/context/AuthContext";
import { api } from "../../lib/api";

export default function OnboardingPage() {
  const { profile, updateProfile, refreshProfile, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStage, setGenerationStage] = useState("Analyzing physical profile...");

  // Form states
  const [age, setAge] = useState(profile?.age?.toString() || "26");
  const [gender, setGender] = useState(profile?.gender || "Male");
  const [heightCm, setHeightCm] = useState(profile?.height_cm?.toString() || "178");
  const [weightKg, setWeightKg] = useState(profile?.weight_kg?.toString() || "75");
  const [targetWeightKg, setTargetWeightKg] = useState(profile?.target_weight_kg?.toString() || "78");
  
  const [goal, setGoal] = useState(profile?.goal || "muscle_gain");
  const [experience, setExperience] = useState(profile?.experience || "intermediate");
  const [sessionDuration, setSessionDuration] = useState(profile?.session_duration || 45);
  
  const [trainingDays, setTrainingDays] = useState(profile?.training_days || 4);
  const [equipment, setEquipment] = useState(profile?.equipment || "gym");
  const [notes, setNotes] = useState(profile?.fitness_level_notes || "");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  const goals = [
    { id: "muscle_gain", label: "Muscle Gain (Hypertrophy)", desc: "Build maximum muscle mass and density", icon: Dumbbell },
    { id: "weight_loss", label: "Fat Loss & Conditioning", desc: "Burn fat, sculpt muscle and boost metabolism", icon: Zap },
    { id: "strength", label: "Raw Strength", desc: "Develop maximal power on compound lifts", icon: Award },
    { id: "maintenance", label: "General Fitness & Health", desc: "Sustain athletic performance and mobility", icon: Target },
  ];

  const experienceLevels = [
    { id: "beginner", title: "Beginner", desc: "< 1 year of consistent lifting. Mastering form & fundamentals." },
    { id: "intermediate", title: "Intermediate", desc: "1-3 years. Familiar with progressive overload and periodization." },
    { id: "advanced", title: "Advanced", desc: "3+ years. High work capacity needing intense stimulus." },
  ];

  const equipmentOptions = [
    { id: "gym", title: "Full Commercial Gym", desc: "Barbells, dumbbells, cable machines & racks" },
    { id: "home_dumbbells", title: "Home with Dumbbells & Bench", desc: "Adjustable dumbbells and bench setup" },
    { id: "dumbbells", title: "Dumbbells Only", desc: "Minimalist free weight setup" },
    { id: "bodyweight", title: "Bodyweight Only (Calisthenics)", desc: "Zero equipment or pull-up bar only" },
  ];

  const handleFinish = async () => {
    setIsGenerating(true);
    setGenerationStage("Analyzing biomechanics & training volume...");

    try {
      // 1. Update Profile
      await updateProfile({
        age: parseInt(age) || 25,
        gender,
        height_cm: parseFloat(heightCm) || 175,
        weight_kg: parseFloat(weightKg) || 75,
        target_weight_kg: parseFloat(targetWeightKg) || 75,
        goal,
        experience,
        session_duration: sessionDuration,
        training_days: trainingDays,
        equipment,
        fitness_level_notes: notes
      });

      // Also log starting weight in progress log
      try {
        await api.logProgress({
          weight_kg: parseFloat(weightKg) || 75,
          notes: "Initial onboarding baseline weight."
        });
      } catch (err) {
        console.warn("Could not log initial progress weight:", err);
      }

      setGenerationStage("FitGenius AI synthesizing structured split...");
      
      // 2. Trigger AI Generation
      await api.generatePlan({
        goal,
        experience,
        training_days: trainingDays,
        equipment,
        session_duration: sessionDuration,
        additional_notes: notes
      });

      setGenerationStage("Optimizing rest days & loading routines...");
      await refreshProfile();
      router.push("/dashboard");
    } catch (err) {
      console.error("Onboarding plan generation failed:", err);
      alert("Could not generate plan right now. You can retry from the generator.");
      router.push("/dashboard");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-slate-100 flex flex-col justify-center items-center p-4 selection:bg-emerald-500 selection:text-white">
      <div className="w-full max-w-2xl">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
            <span>Step {step} of 4</span>
            <span className="text-emerald-500 font-bold">
              {step === 1 && "Physical Metrics"}
              {step === 2 && "Primary Goal"}
              {step === 3 && "Experience & Duration"}
              {step === 4 && "Equipment & Days"}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Container */}
        <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 shadow-2xl relative overflow-hidden">
          {/* Generation Overlay */}
          {isGenerating && (
            <div className="absolute inset-0 bg-[#090D16]/95 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-cyan-400 p-1 animate-pulse">
                  <div className="w-full h-full bg-[#090D16] rounded-[22px] flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-emerald-400 animate-spin" />
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-extrabold text-white">Synthesizing AI Workout Plan</h3>
              <p className="mt-2 text-sm text-emerald-400 font-medium animate-pulse">
                {generationStage}
              </p>
              <p className="mt-4 text-xs text-slate-400 max-w-xs leading-relaxed">
                Applying progressive overload rules, exercise isolation, and scientific rest recovery cycles...
              </p>
            </div>
          )}

          {/* Step 1: Physical Characteristics */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">Physical Characteristics</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  We use your anatomy to tailor joint angles and caloric estimates.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    min={12}
                    max={100}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Gender (optional)
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other / Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    min={100}
                    max={250}
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Current Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min={30}
                    max={300}
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Target Goal Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={targetWeightKg}
                  onChange={(e) => setTargetWeightKg(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Target weight in kg"
                />
              </div>
            </div>
          )}

          {/* Step 2: Fitness Goal */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">What is your primary goal?</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  FitGenius AI calibrates repetition targets and rest periods based on your goal.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {goals.map((g) => {
                  const Icon = g.icon;
                  const isSelected = goal === g.id;
                  return (
                    <div
                      key={g.id}
                      onClick={() => setGoal(g.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/30"
                          : "bg-slate-50 dark:bg-[#090D16] border-slate-200 dark:border-slate-800 hover:border-slate-400"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Icon className="w-5 h-5 text-emerald-500" />
                        {isSelected && <Check className="w-4 h-4 text-emerald-500" />}
                      </div>
                      <h4 className="font-semibold text-sm text-slate-900 dark:text-white">{g.label}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">{g.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Experience & Duration */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">Experience & Session Length</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Adjusts exercise complexity and total sets per workout.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Training Experience
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {experienceLevels.map((lvl) => {
                    const isSelected = experience === lvl.id;
                    return (
                      <div
                        key={lvl.id}
                        onClick={() => setExperience(lvl.id)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                          isSelected
                            ? "bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                            : "bg-slate-50 dark:bg-[#090D16] border-slate-200 dark:border-slate-800 hover:border-slate-400"
                        }`}
                      >
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{lvl.title}</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          {lvl.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Session Duration: <span className="text-emerald-500 font-bold">{sessionDuration} minutes</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[30, 45, 60, 90].map((dur) => (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => setSessionDuration(dur)}
                      className={`py-2.5 rounded-xl text-xs font-bold border transition ${
                        sessionDuration === dur
                          ? "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20"
                          : "bg-slate-50 dark:bg-[#090D16] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400"
                      }`}
                    >
                      {dur}m
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Equipment & Days */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">Equipment & Weekly Schedule</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  How many days per week can you train, and what equipment is available?
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Available Days: <span className="text-emerald-500 font-bold">{trainingDays} days / week</span>
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setTrainingDays(num)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition ${
                        trainingDays === num
                          ? "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20"
                          : "bg-slate-50 dark:bg-[#090D16] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400"
                      }`}
                    >
                      {num}d
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Available Equipment
                </label>
                <div className="space-y-2">
                  {equipmentOptions.map((opt) => {
                    const isSelected = equipment === opt.id;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => setEquipment(opt.id)}
                        className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between transition ${
                          isSelected
                            ? "bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                            : "bg-slate-50 dark:bg-[#090D16] border-slate-200 dark:border-slate-800 hover:border-slate-400"
                        }`}
                      >
                        <div>
                          <h4 className="font-semibold text-sm text-slate-900 dark:text-white">{opt.title}</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{opt.desc}</p>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-emerald-500 shrink-0 ml-2" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Special Notes or Injury Restrictions (optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Mild lower back sensitivity, focus on chest development"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            ) : <div />}

            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="py-2.5 px-6 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20 flex items-center gap-2 transition"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                disabled={isGenerating}
                className="py-3 px-7 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate AI Workout Plan</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
