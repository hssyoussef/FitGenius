"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Dumbbell, 
  Flame, 
  Moon, 
  Sun, 
  User as UserIcon, 
  LogOut, 
  Menu, 
  X, 
  Sparkles,
  Play
} from "lucide-react";
import { useAuth } from "../lib/context/AuthContext";

export function Navbar({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const { user, profile, isDarkMode, toggleDarkMode, logout, isAuthenticated } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#090D16]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand & Mobile Sidebar Toggle */}
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-0.5 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#090D16] rounded-[10px] flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 via-emerald-600 to-teal-600 dark:from-white dark:via-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent">
                  FitGenius
                </span>
                <span className="text-xs font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block -mt-0.5 font-medium">
                Intelligent Fitness Engine
              </p>
            </div>
          </Link>
        </div>

        {/* Center: Quick navigation for guests or search */}
        {!isAuthenticated && (
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">Features</a>
            <a href="#generator" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">AI Generator</a>
            <a href="#exercises" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">Exercise Library</a>
            <a href="#testimonials" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">Scientific Approach</a>
          </nav>
        )}

        {/* Right Action Controls */}
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <>
              {/* Live Workout Shortcut */}
              <Link
                href="/workout-live"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 transition"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <Play className="w-3.5 h-3.5 fill-current" />
                Live Workout
              </Link>

              {/* Goal / Training Frequency Badge */}
              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>{profile?.training_days || 4}d/week</span>
              </div>
            </>
          )}

          {/* Dark / Light Mode Switcher */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 transition"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          {/* Auth Controls */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xs uppercase shadow-sm">
                  {user?.full_name ? user.full_name.charAt(0) : user?.email.charAt(0)}
                </div>
                <span className="hidden sm:block text-xs font-medium text-slate-700 dark:text-slate-300 max-w-[120px] truncate">
                  {user?.full_name || user?.email.split("@")[0]}
                </span>
              </button>

              {showUserMenu && (
                <div 
                  className="absolute right-0 mt-2 w-52 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 text-sm animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setShowUserMenu(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="font-semibold text-slate-900 dark:text-white truncate">
                      {user?.full_name || "Athlete"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {user?.email}
                    </p>
                  </div>
                  
                  <Link
                    href="/settings"
                    className="flex items-center gap-2.5 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition"
                  >
                    <UserIcon className="w-4 h-4 text-emerald-500" />
                    Profile & Goals
                  </Link>
                  <Link
                    href="/generator"
                    className="flex items-center gap-2.5 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition"
                  >
                    <Sparkles className="w-4 h-4 text-cyan-500" />
                    AI Plan Generator
                  </Link>

                  <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20 transition-all hover:shadow-emerald-500/30"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
