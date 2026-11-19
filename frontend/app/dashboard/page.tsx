"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Flame, 
  Dumbbell, 
  TrendingUp, 
  CheckCircle2, 
  Sparkles, 
  Play, 
  Calendar, 
  Clock, 
  ChevronRight, 
  Scale, 
  ArrowUpRight, 
  ArrowDownRight,
  Activity,
  Layers,
  RefreshCw
} from "lucide-react";
import { useAuth } from "../../lib/context/AuthContext";
import { api } from "../../lib/api";
import { DashboardStats } from "../../lib/types";
import { AppShell } from "../../components/AppShell";

export default function DashboardPage() {
  const { user, profile, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (isAuthenticated) {
      fetchDashboard();
    }
  }, [isAuthenticated, isLoading, router]);

  const fetchDashboard = async () => {
    setLoadingStats(true);
    try {
      const data = await api.getDashboard();
      setStats(data);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  return (
    <AppShell>
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Hello, {user?.full_name ? user.full_name.split(" ")[0] : "Athlete"}
            </h1>
            <span className="text-xl">⚡</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Your body is adapting. Today's focus:{" "}
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {stats?.today_workout ? stats.today_workout.title : "Consistent Hypertrophy & Recovery"}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/workout-live"
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start Today's Session</span>
          </Link>
          <button
            onClick={fetchDashboard}
            className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111726] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
            title="Refresh stats"
          >
            <RefreshCw className={`w-4 h-4 ${loadingStats ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* 4 Metric KPI Cards (Inspired by CerbroFit & HealthVibe) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Streak */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800/90 shadow-sm relative overflow-hidden group hover:border-amber-500/40 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Workout Streak</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {stats?.current_streak_days || 0}
            </span>
            <span className="text-xs font-semibold text-slate-500">Days Active</span>
          </div>
          <p className="text-[11px] text-amber-500/90 font-medium mt-2 flex items-center gap-1">
            <span>Keep your momentum going!</span>
          </p>
        </div>

        {/* Workouts Completed */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800/90 shadow-sm relative overflow-hidden group hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Sessions</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {stats?.total_workouts || 0}
            </span>
            <span className="text-xs font-semibold text-slate-500">Finished</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-500 font-medium">
            <span>{stats?.completion_rate_percentage || 0}% target rate</span>
          </div>
        </div>

        {/* Weekly Frequency */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800/90 shadow-sm relative overflow-hidden group hover:border-cyan-500/40 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Weekly Pace</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {stats?.weekly_frequency || 0}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              / {profile?.training_days || 4} days
            </span>
          </div>
          <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-cyan-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, ((stats?.weekly_frequency || 0) / (profile?.training_days || 4)) * 100)}%` }}
            />
          </div>
        </div>

        {/* Total Volume */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800/90 shadow-sm relative overflow-hidden group hover:border-indigo-500/40 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Volume</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Dumbbell className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {stats?.total_volume_kg ? Math.round(stats.total_volume_kg).toLocaleString() : 0}
            </span>
            <span className="text-xs font-semibold text-slate-500">kg moved</span>
          </div>
          <p className="text-[11px] text-indigo-400 font-medium mt-2">
            Cumulative tonnage lifted
          </p>
        </div>
      </div>

      {/* Main Grid: Today's Workout & Weight Progression */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Today's Workout Card (2 cols on desktop) */}
        <div className="lg:col-span-2 p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {stats?.today_workout?.day_name || "Daily Target"}
                </div>
                <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                  {stats?.today_workout?.title || "Scheduled Routine"}
                </h3>
              </div>
              <Link 
                href="/workouts"
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>Full Split</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Focus Tag & Notes */}
            <div className="my-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                Target: {stats?.today_workout?.focus_muscle_group || "Full Body Hypertrophy"}
              </span>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                {profile?.session_duration || 45} mins
              </span>
            </div>

            {/* Exercise List Preview */}
            <div className="space-y-2 mt-4">
              {stats?.today_workout?.exercises && stats.today_workout.exercises.length > 0 ? (
                stats.today_workout.exercises.slice(0, 4).map((wEx, idx) => (
                  <div
                    key={wEx.id || idx}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-[#090D16] border border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-500 font-bold flex items-center justify-center text-[11px]">
                        {idx + 1}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {wEx.exercise?.name || "Target Movement"}
                        </span>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {wEx.exercise?.equipment || "Free Weight"} · {wEx.rest_seconds}s rest
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {wEx.sets} sets × {wEx.reps}
                      </span>
                      {wEx.target_rpe && (
                        <div className="text-[10px] text-slate-400">RPE {wEx.target_rpe}</div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
                  No exercises loaded for today. Generate or select an active workout plan.
                </div>
              )}
            </div>
          </div>

          {/* Start CTA */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {stats?.today_workout?.exercises?.length || 0} exercises programmed
            </span>
            <Link
              href="/workout-live"
              className="py-2.5 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition flex items-center gap-2"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Start Live Workout
            </Link>
          </div>
        </div>

        {/* Weight & Body Progression Card (1 col) */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-500" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Weight Trend</h3>
              </div>
              <Link 
                href="/progress"
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>Log</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Current Weight & Delta */}
            <div className="my-5">
              <div className="text-xs text-slate-500 dark:text-slate-400">Current Weight</div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-slate-900 dark:text-white">
                  {stats?.current_weight || 75.0}
                </span>
                <span className="text-sm font-semibold text-slate-400">kg</span>

                {stats?.weight_change != null && stats.weight_change !== 0 && (
                  <span className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full ${
                    (stats.weight_change ?? 0) < 0 
                      ? "bg-emerald-500/10 text-emerald-500" 
                      : "bg-cyan-500/10 text-cyan-400"
                  }`}>
                    {(stats.weight_change ?? 0) > 0 ? `+${stats.weight_change}` : stats.weight_change} kg
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Goal target: <span className="font-semibold text-slate-300">{stats?.target_weight || 78.0} kg</span>
              </div>
            </div>

            {/* Interactive SVG Sparkline/Chart */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#090D16] border border-slate-100 dark:border-slate-800/80">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Recent 6 Weeks
              </div>
              {stats?.weight_history && stats.weight_history.length > 1 ? (
                <div className="h-28 w-full flex items-end gap-1.5 pt-4 pb-2">
                  {stats.weight_history.map((log, i) => {
                    const minW = Math.min(...stats.weight_history.map(w => w.weight_kg)) - 1;
                    const maxW = Math.max(...stats.weight_history.map(w => w.weight_kg)) + 1;
                    const heightPercent = Math.max(15, Math.min(100, ((log.weight_kg - minW) / (maxW - minW || 1)) * 100));
                    
                    return (
                      <div key={log.id || i} className="flex-1 flex flex-col items-center gap-1 group relative">
                        {/* Tooltip */}
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 px-2 py-1 bg-slate-900 text-white rounded text-[10px] pointer-events-none transition z-20 whitespace-nowrap">
                          {log.weight_kg} kg
                        </div>
                        <div 
                          className="w-full bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-lg transition-all group-hover:brightness-125"
                          style={{ height: `${heightPercent}%` }}
                        />
                        <span className="text-[9px] text-slate-500">
                          {new Date(log.date).getDate()}d
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-28 flex items-center justify-center text-xs text-slate-500">
                  Log multiple entries to reveal progression curve
                </div>
              )}
            </div>
          </div>

          <Link
            href="/progress"
            className="mt-4 block text-center py-2 px-4 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            Update Body Measurements
          </Link>
        </div>
      </div>

      {/* Active AI Plan Rationale Banner */}
      {stats?.active_plan && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-slate-900 border border-emerald-500/30 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                FitGenius AI Rationale
              </span>
            </div>
            <h4 className="text-base font-bold text-white">
              {stats.active_plan.title}
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {stats.active_plan.ai_rationale || stats.active_plan.description}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/generator"
              className="py-2.5 px-4 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Regenerate Plan
            </Link>
            <Link
              href="/workouts"
              className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition"
            >
              View Schedule
            </Link>
          </div>
        </div>
      )}

      {/* Recent Activity History */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Recent Completed Sessions
          </h3>
          <Link
            href="/history"
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Full History
          </Link>
        </div>

        {stats?.recent_sessions && stats.recent_sessions.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {stats.recent_sessions.map((session) => (
              <div key={session.id} className="py-3.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-slate-900 dark:text-white">{session.title}</h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {new Date(session.start_time).toLocaleDateString()} · {session.duration_minutes} min duration
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {Math.round(session.total_volume_kg || 0).toLocaleString()} kg volume
                  </span>
                  {session.rating && (
                    <div className="text-[11px] text-amber-400">
                      {"★".repeat(session.rating)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
            No completed workouts yet. Hit "Start Live Workout" above to record your first session!
          </div>
        )}
      </div>
    </AppShell>
  );
}
