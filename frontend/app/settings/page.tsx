"use client";

import React, { useState, useEffect } from "react";
import { 
  Settings, 
  User, 
  Target, 
  Dumbbell, 
  Clock, 
  Calendar, 
  Check, 
  Lock, 
  Save, 
  Sparkles,
  ShieldCheck
} from "lucide-react";
import { useAuth } from "../../lib/context/AuthContext";
import { AppShell } from "../../components/AppShell";

export default function SettingsPage() {
  const { user, profile, updateProfile } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || "");
  const [age, setAge] = useState(profile?.age?.toString() || "26");
  const [gender, setGender] = useState(profile?.gender || "Male");
  const [heightCm, setHeightCm] = useState(profile?.height_cm?.toString() || "178");
  const [weightKg, setWeightKg] = useState(profile?.weight_kg?.toString() || "75");
  const [targetWeightKg, setTargetWeightKg] = useState(profile?.target_weight_kg?.toString() || "78");
  const [goal, setGoal] = useState(profile?.goal || "muscle_gain");
  const [experience, setExperience] = useState(profile?.experience || "intermediate");
  const [trainingDays, setTrainingDays] = useState(profile?.training_days || 4);
  const [equipment, setEquipment] = useState(profile?.equipment || "gym");
  const [sessionDuration, setSessionDuration] = useState(profile?.session_duration || 45);
  const [notes, setNotes] = useState(profile?.fitness_level_notes || "");

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (user?.full_name) setFullName(user.full_name);
    if (profile) {
      if (profile.age) setAge(profile.age.toString());
      if (profile.gender) setGender(profile.gender);
      if (profile.height_cm) setHeightCm(profile.height_cm.toString());
      if (profile.weight_kg) setWeightKg(profile.weight_kg.toString());
      if (profile.target_weight_kg) setTargetWeightKg(profile.target_weight_kg.toString());
      if (profile.goal) setGoal(profile.goal);
      if (profile.experience) setExperience(profile.experience);
      if (profile.training_days) setTrainingDays(profile.training_days);
      if (profile.equipment) setEquipment(profile.equipment);
      if (profile.session_duration) setSessionDuration(profile.session_duration);
      if (profile.fitness_level_notes) setNotes(profile.fitness_level_notes);
    }
  }, [user, profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await updateProfile({
        age: parseInt(age) || 25,
        gender,
        height_cm: parseFloat(heightCm) || 175,
        weight_kg: parseFloat(weightKg) || 75,
        target_weight_kg: parseFloat(targetWeightKg) || 75,
        goal,
        experience,
        training_days: trainingDays,
        equipment,
        session_duration: sessionDuration,
        fitness_level_notes: notes
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to update profile:", err);
      alert("Failed to update settings. Please check your inputs.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold mb-2">
            <Settings className="w-3.5 h-3.5 text-emerald-500" />
            <span>Profile & Preferences</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Account & Fitness Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Update your body metrics, equipment changes, and training availability.
          </p>
        </div>

        {saveSuccess && (
          <div className="px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
            <Check className="w-4 h-4" />
            <span>Settings saved successfully!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-8 max-w-4xl">
        {/* Physical Metrics */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <User className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Personal & Body Characteristics
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Age
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Height (cm)
              </label>
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Current Weight (kg)
              </label>
              <input
                type="number"
                step="0.5"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Weight (kg)
              </label>
              <input
                type="number"
                step="0.5"
                value={targetWeightKg}
                onChange={(e) => setTargetWeightKg(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Training Parameters */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <Target className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Training Preferences
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Primary Goal
              </label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 capitalize"
              >
                <option value="muscle_gain">Muscle Gain (Hypertrophy)</option>
                <option value="weight_loss">Fat Loss & Conditioning</option>
                <option value="strength">Raw Strength</option>
                <option value="maintenance">Maintenance & Health</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Experience Level
              </label>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 capitalize"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Training Days / Week
              </label>
              <select
                value={trainingDays}
                onChange={(e) => setTrainingDays(parseInt(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                  <option key={num} value={num}>
                    {num} Days / Week
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Session Duration
              </label>
              <select
                value={sessionDuration}
                onChange={(e) => setSessionDuration(parseInt(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {[30, 45, 60, 90].map((mins) => (
                  <option key={mins} value={mins}>
                    {mins} minutes
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Equipment
              </label>
              <select
                value={equipment}
                onChange={(e) => setEquipment(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="gym">Full Gym</option>
                <option value="home_dumbbells">Home with Dumbbells & Bench</option>
                <option value="dumbbells">Dumbbells Only</option>
                <option value="bodyweight">Bodyweight Only</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Injury Notes / Exercise Modifications
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g. Mild rotator cuff sensitivity on flat bench press"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="submit"
            disabled={isSaving}
            className="py-3 px-8 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </AppShell>
  );
}
