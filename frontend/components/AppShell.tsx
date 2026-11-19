"use client";

import React, { useState } from "react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { useAuth } from "../lib/context/AuthContext";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#090D16]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl border-4 border-emerald-500/20 border-t-emerald-500 animate-spin"></div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
            Loading FitGenius AI...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-slate-100 flex flex-col">
      <Navbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
      
      <div className="flex flex-1">
        {isAuthenticated && (
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}

        <main className={`flex-1 transition-all duration-300 w-full ${isAuthenticated ? "lg:pl-64" : ""}`}>
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
