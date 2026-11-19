"use client";

import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  Scale, 
  Plus, 
  Calendar, 
  Trash2, 
  ArrowUpRight, 
  ArrowDownRight, 
  Award,
  RefreshCw,
  Check,
  Target
} from "lucide-react";
import { api } from "../../lib/api";
import { ProgressLog, FitnessProfile } from "../../lib/types";
import { useAuth } from "../../lib/context/AuthContext";
import { AppShell } from "../../components/AppShell";

export default function ProgressPage() {
  const { profile } = useAuth();
  const [logs, setLogs] = useState<ProgressLog[]>([]);
  const [loading, setLoading] = useState(true);

  // New Log Form
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [weight, setWeight] = useState(profile?.weight_kg?.toString() || "75.0");
  const [bodyFat, setBodyFat] = useState("");
  const [chestCm, setChestCm] = useState("");
  const [waistCm, setWaistCm] = useState("");
  const [armsCm, setArmsCm] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await api.getProgressHistory();
      setLogs(data);
    } catch (err) {
      console.error("Failed to load progress logs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.logProgress({
        weight_kg: parseFloat(weight) || 75.0,
        body_fat_percentage: bodyFat ? parseFloat(bodyFat) : undefined,
        chest_cm: chestCm ? parseFloat(chestCm) : undefined,
        waist_cm: waistCm ? parseFloat(waistCm) : undefined,
        arms_cm: armsCm ? parseFloat(armsCm) : undefined,
        notes: notes || undefined
      });
      setIsLogModalOpen(false);
      setNotes("");
      await fetchHistory();
    } catch (err) {
      console.error("Failed to save progress entry:", err);
      alert("Could not save entry. Check values and retry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLog = async (id: number) => {
    if (!confirm("Are you sure you want to remove this measurement log?")) return;
    try {
      await api.deleteProgressLog(id);
      setLogs((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      console.error("Failed to delete log:", err);
    }
  };

  const currentWeight = logs.length > 0 ? logs[logs.length - 1].weight_kg : (profile?.weight_kg || 75);
  const startWeight = logs.length > 0 ? logs[0].weight_kg : currentWeight;
  const targetWeight = profile?.target_weight_kg || 78;
  const weightDelta = Math.round((currentWeight - startWeight) * 10) / 10;

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span>Body Composition Analytics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Progress Tracking
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track weight curves, body fat percentages, and body measurements over time.
          </p>
        </div>

        <button
          onClick={() => setIsLogModalOpen(true)}
          className="py-2.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Log Measurement</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-3xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Current Weight</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{currentWeight}</span>
            <span className="text-xs font-bold text-slate-400">kg</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Latest logged entry</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Net Progression</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className={`text-3xl font-black ${weightDelta <= 0 ? "text-emerald-500" : "text-cyan-400"}`}>
              {weightDelta > 0 ? `+${weightDelta}` : weightDelta}
            </span>
            <span className="text-xs font-bold text-slate-400">kg total</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Since baseline measurement</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Goal Target</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{targetWeight}</span>
            <span className="text-xs font-bold text-slate-400">kg target</span>
          </div>
          <p className="text-[11px] text-emerald-500 font-medium mt-1">
            {Math.abs(Math.round((currentWeight - targetWeight) * 10) / 10)} kg to objective
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Checkpoints</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-indigo-400">{logs.length}</span>
            <span className="text-xs font-bold text-slate-400">Entries</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Regular consistency builds precision</p>
        </div>
      </div>

      {/* Trajectory Chart Card */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Weight Progression Curve
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Trajectory over time vs target objective ({targetWeight} kg)
            </p>
          </div>
        </div>

        {logs.length > 1 ? (
          <div className="space-y-4">
            {/* Interactive SVG Chart */}
            <div className="h-48 w-full flex items-end gap-2 pt-6 pb-2">
              {logs.map((log, idx) => {
                const minWeight = Math.min(...logs.map((l) => l.weight_kg), targetWeight) - 2;
                const maxWeight = Math.max(...logs.map((l) => l.weight_kg), targetWeight) + 2;
                const heightPercent = Math.max(10, Math.min(100, ((log.weight_kg - minWeight) / (maxWeight - minWeight || 1)) * 100));

                return (
                  <div key={log.id} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 px-2 py-1 bg-slate-900 text-white rounded text-[10px] pointer-events-none transition whitespace-nowrap z-20 shadow-md">
                      {log.weight_kg} kg ({new Date(log.date).toLocaleDateString()})
                    </div>
                    <div
                      className="w-full bg-gradient-to-t from-emerald-600 via-teal-500 to-cyan-400 rounded-t-xl transition-all group-hover:brightness-125"
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className="text-[9px] text-slate-400 font-medium">
                      {new Date(log.date).getDate()}/{new Date(log.date).getMonth() + 1}
                    </span>
                  </div>
                );
              })}
            </div>
            
            <div className="flex items-center justify-center gap-6 text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/60">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-emerald-500 inline-block" />
                <span>Recorded Weight</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-0.5 bg-amber-400 inline-block" />
                <span>Target: {targetWeight} kg</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-slate-500">
            Log at least 2 entries to display your progression curve.
          </div>
        )}
      </div>

      {/* History Log Table */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="font-bold text-base text-slate-900 dark:text-white mb-4">
          Measurement Log History
        </h3>

        {logs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-100 dark:border-slate-800/80 font-semibold">
                  <th className="pb-3">DATE</th>
                  <th className="pb-3">WEIGHT</th>
                  <th className="pb-3">BODY FAT %</th>
                  <th className="pb-3">CHEST</th>
                  <th className="pb-3">WAIST</th>
                  <th className="pb-3">ARMS</th>
                  <th className="pb-3">NOTES</th>
                  <th className="pb-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {[...logs].reverse().map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                    <td className="py-3 font-semibold text-slate-900 dark:text-white">
                      {new Date(item.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 font-bold text-emerald-600 dark:text-emerald-400">
                      {item.weight_kg} kg
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-300">
                      {item.body_fat_percentage ? `${item.body_fat_percentage}%` : "—"}
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-300">
                      {item.chest_cm ? `${item.chest_cm} cm` : "—"}
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-300">
                      {item.waist_cm ? `${item.waist_cm} cm` : "—"}
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-300">
                      {item.arms_cm ? `${item.arms_cm} cm` : "—"}
                    </td>
                    <td className="py-3 text-slate-400 max-w-xs truncate">
                      {item.notes || "—"}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleDeleteLog(item.id)}
                        className="p-1 rounded-lg hover:bg-rose-500/10 text-rose-500 transition"
                        title="Delete log"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500">
            No measurements recorded yet. Click "Log Measurement" above!
          </div>
        )}
      </div>

      {/* Log Modal */}
      {isLogModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-1">
              Log Progress Entry
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Record today's weight and optional circumference metrics.
            </p>

            <form onSubmit={handleAddLog} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Weight (kg) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Body Fat % (optional)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={bodyFat}
                    onChange={(e) => setBodyFat(e.target.value)}
                    placeholder="e.g. 14.5"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Waist (cm)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={waistCm}
                    onChange={(e) => setWaistCm(e.target.value)}
                    placeholder="e.g. 81.0"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Chest (cm)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={chestCm}
                    onChange={(e) => setChestCm(e.target.value)}
                    placeholder="e.g. 102"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Arms (cm)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={armsCm}
                    onChange={(e) => setArmsCm(e.target.value)}
                    placeholder="e.g. 38.5"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Observations / Energy Notes
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Morning fasted weigh-in, feeling lean"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-2.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 disabled:opacity-50"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
