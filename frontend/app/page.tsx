"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  Dumbbell, 
  Flame, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Activity, 
  Layers, 
  Clock, 
  Calendar,
  Zap
} from "lucide-react";
import { useAuth } from "../lib/context/AuthContext";
import { Navbar } from "../components/Navbar";

export default function HomePage() {
  const { isAuthenticated, isLoading, login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleQuickDemo = async () => {
    try {
      await login("demo@fitgenius.ai", "password123");
      router.push("/dashboard");
    } catch (err) {
      console.error("Demo login error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#090D16] text-slate-900 dark:text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32">
        {/* Ambient Glow Circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-gradient-to-tr from-emerald-500/15 via-teal-500/10 to-cyan-500/15 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>AI-Driven Biomechanics & Hypertrophy Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.1]">
            Build Your Ultimate Physique with{" "}
            <span className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
              FitGenius AI
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Stop guessing your sets, reps, and splits. FitGenius AI creates personalized, evidence-based training routines adapted to your goals, equipment, and weekly schedule.
          </p>

          {/* Call to Actions */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleQuickDemo}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/35 transition flex items-center justify-center gap-2 group"
            >
              <Zap className="w-4 h-4 fill-current text-slate-950" />
              <span>Explore Instant Live Demo</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white font-semibold transition flex items-center justify-center gap-2"
            >
              Start Free Questionnaire
            </Link>
          </div>

          {/* Micro social proof stats */}
          <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">100%</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Personalized Plans</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-500">40+</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Scientific Exercises</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400">0s</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Rest Interval Tracking</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-indigo-400">RPE & PR</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Volume Tracking</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive AI Schedule Preview Card (Inspired by CerbroFit & Workouter) */}
      <section className="py-12 bg-slate-50/50 dark:bg-[#0B101E]/50 border-y border-slate-200/60 dark:border-slate-800/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Evidence-Based Weekly Programming
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Each routine aligns sets, rep tempos, RPE thresholds, and muscle recovery rules.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Monday */}
            <div className="rounded-2xl p-4 bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500/40 transition">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">Monday</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">45 min</span>
              </div>
              <h3 className="font-semibold text-base mt-2.5 text-slate-900 dark:text-white">Chest & Triceps</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Hypertrophy & Lockout Power</p>
              
              <ul className="space-y-2 text-xs">
                <li className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-[#090D16]">
                  <span className="font-medium">Barbell Bench Press</span>
                  <span className="text-emerald-500 font-semibold">3 × 10</span>
                </li>
                <li className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-[#090D16]">
                  <span className="font-medium">Incline DB Press</span>
                  <span className="text-emerald-500 font-semibold">3 × 12</span>
                </li>
                <li className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-[#090D16]">
                  <span className="font-medium">Triceps Pushdown</span>
                  <span className="text-emerald-500 font-semibold">3 × 12</span>
                </li>
              </ul>
            </div>

            {/* Tuesday */}
            <div className="rounded-2xl p-4 bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 shadow-sm hover:border-cyan-500/40 transition">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Tuesday</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">50 min</span>
              </div>
              <h3 className="font-semibold text-base mt-2.5 text-slate-900 dark:text-white">Back & Biceps</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Width & Pulling Strength</p>
              
              <ul className="space-y-2 text-xs">
                <li className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-[#090D16]">
                  <span className="font-medium">Lat Pulldown</span>
                  <span className="text-cyan-400 font-semibold">3 × 10</span>
                </li>
                <li className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-[#090D16]">
                  <span className="font-medium">Seated Cable Row</span>
                  <span className="text-cyan-400 font-semibold">3 × 12</span>
                </li>
                <li className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-[#090D16]">
                  <span className="font-medium">Dumbbell Curl</span>
                  <span className="text-cyan-400 font-semibold">3 × 12</span>
                </li>
              </ul>
            </div>

            {/* Thursday */}
            <div className="rounded-2xl p-4 bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 shadow-sm hover:border-amber-500/40 transition">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Thursday</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">60 min</span>
              </div>
              <h3 className="font-semibold text-base mt-2.5 text-slate-900 dark:text-white">Legs & Posterior</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Quad & Hamstring Power</p>
              
              <ul className="space-y-2 text-xs">
                <li className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-[#090D16]">
                  <span className="font-medium">Barbell Squats</span>
                  <span className="text-amber-400 font-semibold">3 × 10</span>
                </li>
                <li className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-[#090D16]">
                  <span className="font-medium">Leg Press</span>
                  <span className="text-amber-400 font-semibold">3 × 12</span>
                </li>
                <li className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-[#090D16]">
                  <span className="font-medium">Leg Curl</span>
                  <span className="text-amber-400 font-semibold">3 × 12</span>
                </li>
              </ul>
            </div>

            {/* Friday */}
            <div className="rounded-2xl p-4 bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500/40 transition">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Friday</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">40 min</span>
              </div>
              <h3 className="font-semibold text-base mt-2.5 text-slate-900 dark:text-white">Shoulders & Abs</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Deltoid 3D Sculpt & Core</p>
              
              <ul className="space-y-2 text-xs">
                <li className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-[#090D16]">
                  <span className="font-medium">Shoulder Press</span>
                  <span className="text-indigo-400 font-semibold">3 × 10</span>
                </li>
                <li className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-[#090D16]">
                  <span className="font-medium">Lateral Raises</span>
                  <span className="text-indigo-400 font-semibold">3 × 15</span>
                </li>
                <li className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-[#090D16]">
                  <span className="font-medium">Plank</span>
                  <span className="text-indigo-400 font-semibold">3 × 30s</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight">
            Engineered for Serious Fitness Enthusiasts
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm">
            Everything you need to plan, track, and optimize your workouts in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-[#111726] border border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold">Intelligent AI Generator</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Generates calibrated splits matching your exact equipment, from full commercial gyms to minimal dumbbells or bodyweight-only setups.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-[#111726] border border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-500 mb-4">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold">Interactive Live Tracker</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Run workouts set-by-set with automated rest interval stopwatches, target RPE tracking, and instant total volume calculations.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-[#111726] border border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 mb-4">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold">Progress & Weight Analytics</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Visual charts for weight loss/gain, workout frequency compliance, cumulative tonnage lifted, and workout consistency streaks.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 py-8 bg-white dark:bg-[#090D16]">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500 dark:text-slate-400">
          <p>FitGenius AI — Full-Stack AI Workout & Fitness Platform © 2026. Built with Next.js, FastAPI & OpenAI.</p>
        </div>
      </footer>
    </div>
  );
}
