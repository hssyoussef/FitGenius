"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  History, 
  Dumbbell, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Trash2, 
  ArrowRight,
  RefreshCw
} from "lucide-react";
import { api } from "../../lib/api";
import { WorkoutSession, WorkoutPlan } from "../../lib/types";
import { useAuth } from "../../lib/context/AuthContext";
import { AppShell } from "../../components/AppShell";

export default function HistoryPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [tab, setTab] = useState<"sessions" | "plans">("sessions");
  
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSessionId, setExpandedSessionId] = useState<number | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadHistory();
    }
  }, [isAuthenticated]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const [sessionsData, plansData] = await Promise.all([
        api.getSessions(),
        api.getPlans()
      ]);
      setSessions(sessionsData);
      setPlans(plansData);
    } catch (err) {
      console.error("Error loading history:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetActivePlan = async (planId: number) => {
    try {
      await api.setActivePlan(planId);
      await loadHistory();
      alert("Plan activated successfully! You can find it under 'My Workouts'.");
    } catch (err) {
      console.error("Error setting active plan:", err);
    }
  };

  const handleDeletePlan = async (planId: number) => {
    if (!confirm("Are you sure you want to delete this workout plan?")) return;
    try {
      await api.deletePlan(planId);
      setPlans((prev) => prev.filter((p) => p.id !== planId));
    } catch (err) {
      console.error("Error deleting plan:", err);
    }
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold mb-2">
            <History className="w-3.5 h-3.5 text-emerald-500" />
            <span>Training Logs & Archive</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Workout History & Archives
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review completed sessions, sets performance, and reuse previous AI workout programs.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setTab("sessions")}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition ${
              tab === "sessions"
                ? "bg-emerald-500 text-slate-950 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Past Sessions ({sessions.length})
          </button>
          <button
            onClick={() => setTab("plans")}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition ${
              tab === "plans"
                ? "bg-emerald-500 text-slate-950 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            AI Plan Archives ({plans.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-500" />
          <p className="text-xs font-semibold">Loading workout history...</p>
        </div>
      ) : tab === "sessions" ? (
        /* Sessions List */
        sessions.length > 0 ? (
          <div className="space-y-4">
            {sessions.map((session) => {
              const isExpanded = expandedSessionId === session.id;
              return (
                <div
                  key={session.id}
                  className="rounded-3xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800/80 shadow-sm overflow-hidden"
                >
                  <div
                    onClick={() => setExpandedSessionId(isExpanded ? null : session.id)}
                    className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-base text-slate-900 dark:text-white">
                          {session.title}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {new Date(session.start_time).toLocaleDateString()}
                          </span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {session.duration_minutes} min
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 justify-between sm:justify-end">
                      <div className="text-right">
                        <div className="font-extrabold text-sm text-emerald-500">
                          {Math.round(session.total_volume_kg || 0).toLocaleString()} kg
                        </div>
                        <span className="text-[10px] text-slate-400">Total volume</span>
                      </div>

                      {session.rating && (
                        <div className="text-amber-400 text-sm">
                          {"★".repeat(session.rating)}
                        </div>
                      )}

                      <div className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Logs */}
                  {isExpanded && (
                    <div className="px-6 pb-6 pt-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0A0F1E]/50 text-xs animate-in fade-in duration-200">
                      {session.notes && (
                        <p className="mb-4 text-slate-600 dark:text-slate-300 italic">
                          "{session.notes}"
                        </p>
                      )}

                      <h5 className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-2">
                        Exercise Logs Breakdown
                      </h5>

                      {session.exercise_logs && session.exercise_logs.length > 0 ? (
                        <div className="space-y-2">
                          {session.exercise_logs.map((log, idx) => (
                            <div
                              key={log.id || idx}
                              className="p-2.5 rounded-xl bg-white dark:bg-[#111726] border border-slate-200/60 dark:border-slate-800 flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold flex items-center justify-center">
                                  {log.set_number}
                                </span>
                                <span className="font-semibold text-slate-900 dark:text-white">
                                  {log.exercise?.name || "Exercise"}
                                </span>
                              </div>

                              <div className="flex items-center gap-3">
                                <span className="font-bold text-emerald-500">
                                  {log.weight_kg} kg × {log.reps_completed} reps
                                </span>
                                {log.rpe && (
                                  <span className="text-[10px] text-slate-400">RPE {log.rpe}</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-500">No individual set breakdown logged.</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-16 text-center rounded-3xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 text-slate-400">
            <Dumbbell className="w-10 h-10 mx-auto mb-2 text-slate-500" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No workout sessions logged yet</h4>
            <p className="text-xs mt-1">Start a workout from your dashboard or weekly schedule.</p>
          </div>
        )
      ) : (
        /* AI Plans List */
        plans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {plans.map((p) => (
              <div
                key={p.id}
                className={`p-6 rounded-3xl bg-white dark:bg-[#111726] border transition flex flex-col justify-between ${
                  p.is_active
                    ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      p.is_active
                        ? "bg-emerald-500 text-slate-950 font-black"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                    }`}>
                      {p.is_active ? "Active Plan" : "Archived"}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {p.days_per_week} Days/Week
                    </span>
                  </div>

                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                    {p.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {p.description || p.ai_rationale}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-slate-400">
                    <span className="px-2 py-0.5 rounded-md bg-slate-50 dark:bg-[#090D16] border border-slate-200/60 dark:border-slate-800 capitalize">
                      {p.goal.replace("_", " ")}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-50 dark:bg-[#090D16] border border-slate-200/60 dark:border-slate-800 capitalize">
                      {p.experience_level}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-50 dark:bg-[#090D16] border border-slate-200/60 dark:border-slate-800">
                      {p.days?.length || 0} scheduled routines
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => handleDeletePlan(p.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition"
                    title="Delete plan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {p.is_active ? (
                    <Link
                      href="/workouts"
                      className="py-2 px-4 rounded-xl bg-emerald-500/15 text-emerald-400 font-bold text-xs hover:bg-emerald-500/25 transition flex items-center gap-1.5"
                    >
                      <span>View Current Routine</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleSetActivePlan(p.id)}
                      className="py-2 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition"
                    >
                      Re-Activate Plan
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center rounded-3xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 text-slate-400">
            <Sparkles className="w-10 h-10 mx-auto mb-2 text-slate-500" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No workout plans archived</h4>
            <p className="text-xs mt-1">Generate a plan to save it to your archive.</p>
          </div>
        )
      )}
    </AppShell>
  );
}
