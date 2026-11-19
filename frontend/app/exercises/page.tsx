"use client";

import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  Search, 
  Filter, 
  Dumbbell, 
  ChevronRight, 
  X, 
  Sparkles, 
  Check, 
  Info,
  ShieldCheck,
  RefreshCw
} from "lucide-react";
import { api } from "../../lib/api";
import { Exercise } from "../../lib/types";
import { AppShell } from "../../components/AppShell";

const MUSCLE_GROUPS = ["All", "Chest", "Back", "Legs", "Shoulders", "Biceps", "Triceps", "Core", "Cardio"];
const EQUIPMENT_TYPES = ["All", "Barbell", "Dumbbell", "Cable", "Machine", "Bodyweight"];
const DIFFICULTY_LEVELS = ["All", "Beginner", "Intermediate", "Advanced"];

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState("");
  const [selectedMuscle, setSelectedMuscle] = useState("All");
  const [selectedEquipment, setSelectedEquipment] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");

  // Detail Modal
  const [activeModalExercise, setActiveModalExercise] = useState<Exercise | null>(null);

  useEffect(() => {
    fetchExercises();
  }, [selectedMuscle, selectedEquipment, selectedDifficulty]);

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const data = await api.getExercises({
        muscle_group: selectedMuscle !== "All" ? selectedMuscle : undefined,
        equipment: selectedEquipment !== "All" ? selectedEquipment : undefined,
        difficulty: selectedDifficulty !== "All" ? selectedDifficulty : undefined,
        search: search.trim() ? search.trim() : undefined,
      });
      setExercises(data);
    } catch (err) {
      console.error("Failed to load exercises:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchExercises();
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold mb-2">
            <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
            <span>Biomechanics Catalog</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Exercise Library
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse 40+ scientifically structured movements with anatomy cues and execution steps.
          </p>
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Showing <span className="font-bold text-emerald-500">{exercises.length}</span> exercises
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="space-y-4 mb-8">
        {/* Search Bar & Dropdowns */}
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search exercise by name or muscle..."
              className="w-full pl-10 pr-24 py-2.5 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 rounded-xl bg-emerald-500 text-slate-950 font-semibold text-[11px] hover:bg-emerald-400 transition"
            >
              Search
            </button>
          </form>

          <div className="flex items-center gap-2">
            <select
              value={selectedEquipment}
              onChange={(e) => setSelectedEquipment(e.target.value)}
              className="py-2.5 px-3 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
            >
              {EQUIPMENT_TYPES.map((eq) => (
                <option key={eq} value={eq}>
                  {eq === "All" ? "All Equipment" : eq}
                </option>
              ))}
            </select>

            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="py-2.5 px-3 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
            >
              {DIFFICULTY_LEVELS.map((diff) => (
                <option key={diff} value={diff}>
                  {diff === "All" ? "All Levels" : diff}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Muscle Group Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {MUSCLE_GROUPS.map((mg) => {
            const isSelected = selectedMuscle === mg;
            return (
              <button
                key={mg}
                onClick={() => setSelectedMuscle(mg)}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                  isSelected
                    ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                    : "bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400"
                }`}
              >
                {mg}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Exercises */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-500" />
          <p className="text-xs font-semibold">Filtering exercise database...</p>
        </div>
      ) : exercises.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {exercises.map((ex) => (
            <div
              key={ex.id}
              onClick={() => setActiveModalExercise(ex)}
              className="rounded-3xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800/80 p-5 shadow-sm hover:border-emerald-500/40 hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
            >
              <div>
                {/* Visual Thumbnail */}
                <div className="w-full h-40 rounded-2xl overflow-hidden bg-slate-100 dark:bg-[#090D16] mb-4 relative">
                  {ex.image_url ? (
                    <img
                      src={ex.image_url}
                      alt={ex.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Dumbbell className="w-8 h-8" />
                    </div>
                  )}
                  <span className="absolute top-2.5 left-2.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white">
                    {ex.muscle_group}
                  </span>
                  <span className="absolute top-2.5 right-2.5 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500 text-slate-950">
                    {ex.difficulty}
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                  {ex.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {ex.instructions.replace(/\n/g, " ")}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">{ex.equipment}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>View Cues</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 text-slate-400">
          <Dumbbell className="w-10 h-10 mx-auto mb-2 text-slate-500" />
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No exercises matched your filters</h4>
          <p className="text-xs mt-1">Try resetting the search query or selecting "All" categories.</p>
        </div>
      )}

      {/* Exercise Detail Modal */}
      {activeModalExercise && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            {/* Header Image */}
            <div className="relative h-52 w-full bg-slate-900 shrink-0">
              {activeModalExercise.image_url ? (
                <img
                  src={activeModalExercise.image_url}
                  alt={activeModalExercise.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <Dumbbell className="w-12 h-12" />
                </div>
              )}
              <button
                onClick={() => setActiveModalExercise(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    {activeModalExercise.muscle_group}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    {activeModalExercise.equipment}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                    {activeModalExercise.difficulty}
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {activeModalExercise.name}
                </h3>
                {activeModalExercise.secondary_muscles && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    Secondary: {activeModalExercise.secondary_muscles}
                  </p>
                )}
              </div>

              {/* Instructions */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Execution Instructions
                </h4>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#090D16] border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                  {activeModalExercise.instructions}
                </div>
              </div>

              {/* Form Tips */}
              {activeModalExercise.tips && (
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed">
                  <span className="font-bold">Biomechanics Cue: </span>
                  {activeModalExercise.tips}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setActiveModalExercise(null)}
                className="py-2 px-5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
