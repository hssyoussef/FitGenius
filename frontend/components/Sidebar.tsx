"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Sparkles, 
  Calendar, 
  PlayCircle, 
  BookOpen, 
  TrendingUp, 
  History, 
  Settings,
  Target,
  Dumbbell
} from "lucide-react";
import { useAuth } from "../lib/context/AuthContext";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/generator", label: "AI Generator", icon: Sparkles, badge: "AI" },
  { href: "/workouts", label: "My Workouts", icon: Calendar },
  { href: "/workout-live", label: "Live Tracker", icon: PlayCircle, highlight: true },
  { href: "/exercises", label: "Exercise Library", icon: BookOpen },
  { href: "/progress", label: "Progress & Metrics", icon: TrendingUp },
  { href: "/history", label: "Workout History", icon: History },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const { user, profile } = useAuth();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 border-r border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-[#0A0F1D]/95 backdrop-blur-xl transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col justify-between ${
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div className="p-4 space-y-6 overflow-y-auto">
          {/* Athlete Profile Snippet */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 dark:from-[#111726] dark:to-[#0D121F] border border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-400 p-0.5 shadow-md shadow-emerald-500/20">
                <div className="w-full h-full bg-[#090D16] rounded-[10px] flex items-center justify-center text-white font-bold text-sm">
                  {user?.full_name ? user.full_name.charAt(0) : "A"}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {user?.full_name || "Athlete"}
                </h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 capitalize">
                    {profile?.experience || "Intermediate"}
                  </span>
                </div>
              </div>
            </div>

            {/* Micro Goals Info */}
            <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-emerald-500" />
                <span className="capitalize">{profile?.goal?.replace("_", " ") || "Muscle Gain"}</span>
              </div>
              <div className="flex items-center gap-1">
                <Dumbbell className="w-3.5 h-3.5 text-cyan-500" />
                <span className="capitalize">{profile?.equipment?.replace("_", " ") || "Gym"}</span>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Main Navigation
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                    isActive
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-colors ${
                      isActive ? "text-emerald-500" : "text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200"
                    }`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                      {item.badge}
                    </span>
                  )}
                  {item.highlight && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* AI Generator Banner Footer */}
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800/80">
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-cyan-950/40 border border-emerald-500/30 text-left">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-emerald-400">FitGenius Smart Engine</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-300 leading-relaxed">
              Ready to adjust your program? Regenerate routines anytime based on recovery.
            </p>
            <Link
              href="/generator"
              className="mt-2.5 block text-center py-1.5 px-3 rounded-lg text-xs font-semibold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition"
            >
              Tune Routine
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
