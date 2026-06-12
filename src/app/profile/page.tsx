"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  User as UserIcon, 
  Mail, 
  Award, 
  Flame, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  Sparkles, 
  BookOpen, 
  ClipboardList, 
  Star,
  Lock
} from "lucide-react";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [savingName, setSavingName] = useState(false);

  const loadProfileData = async () => {
    if (!session?.user?.id) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/profile?userId=${session.user.id}`);
      if (!res.ok) {
        throw new Error("Failed to load profile metrics.");
      }
      const data = await res.json();
      setProfile(data);
      setNewName(data.user.name || "");
    } catch (err: any) {
      setError(err.message || "Error loading profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateName = async () => {
    if (!newName.trim() || !session?.user?.id) return;
    try {
      setSavingName(true);
      const res = await fetch("/api/profile/update-name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: session.user.id, newName })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update name");
      }
      setProfile((prev: any) => ({
        ...prev,
        user: {
          ...prev.user,
          name: data.name
        }
      }));
      await update({ name: data.name });
      setIsEditingName(false);
    } catch (err: any) {
      alert(err.message || "Failed to update name");
    } finally {
      setSavingName(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      loadProfileData();
    }
  }, [session]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07070b]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 font-medium text-sm">Loading your profile statistics...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07070b] text-white p-6">
        <div className="glass-panel p-8 rounded-3xl max-w-md border border-white/5 text-center">
          <p className="text-red-400 font-semibold mb-4">⚠️ {error || "Profile data unavailable"}</p>
          <button 
            onClick={loadProfileData}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-medium text-sm transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { user, tasks, dailyRoutine, weeklyRoutine, monthlyRoutine, targets } = profile;

  // Level progress percentage (assuming 500 XP per level)
  const currentXP = user.xp % 500;
  const xpPercentage = Math.round((currentXP / 500) * 100);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 pb-16">
      
      {/* PROFILE HEADER / BIO CARD */}
      <div className="glass-panel border border-white/5 rounded-3xl p-6 md:p-8 relative overflow-hidden bg-gradient-to-br from-[#0c0d19] to-[#08080f]">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[80px] -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-purple-500/5 rounded-full blur-[60px] -ml-20 -mb-20"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-8">
          {/* Avatar Area */}
          <div className="relative">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-3xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
              <UserIcon className="w-12 h-12 md:w-14 md:h-14" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full border-2 border-[#0c0d19] shadow">
              LVL {user.level}
            </div>
          </div>

          {/* User Details */}
          <div className="flex-1 text-center md:text-left space-y-3 w-full">
            <div>
              {isEditingName ? (
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="Enter new name"
                    disabled={savingName}
                  />
                  <button
                    onClick={handleUpdateName}
                    disabled={savingName}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
                  >
                    {savingName ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingName(false);
                      setNewName(user.name || "");
                    }}
                    disabled={savingName}
                    className="px-3 py-1 bg-white/10 hover:bg-white/15 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">{user.name || "Productive User"}</h1>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="p-1.5 hover:bg-white/5 rounded-lg text-indigo-400 hover:text-indigo-300 transition-all border border-indigo-500/10"
                    title="Change Name"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                    </svg>
                  </button>
                </div>
              )}
              <p className="text-indigo-400 text-sm flex items-center justify-center md:justify-start gap-1.5 mt-1.5">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="text-gray-400">{user.email}</span>
              </p>
            </div>

            {/* Level & XP bar */}
            <div className="space-y-1.5 max-w-md">
              <div className="flex justify-between text-xs font-medium text-gray-400">
                <span>XP: {currentXP} / 500 (Level {user.level})</span>
                <span>{xpPercentage}% completed</span>
              </div>
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-500" 
                  style={{ width: `${xpPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Streaks Banner */}
          <div className="flex gap-4 w-full md:w-auto justify-center md:justify-end">
            <div className="glass-panel border border-white/5 bg-white/[0.02] rounded-2xl px-5 py-4 text-center min-w-[110px] hover:border-indigo-500/20 transition-all">
              <div className="inline-flex p-2 bg-orange-500/10 text-orange-400 rounded-xl mb-1.5">
                <Flame className="w-5 h-5 fill-orange-400/20" />
              </div>
              <div className="text-xl font-bold text-white">{user.streak}</div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Active Streak</div>
            </div>

            <div className="glass-panel border border-white/5 bg-white/[0.02] rounded-2xl px-5 py-4 text-center min-w-[110px] hover:border-indigo-500/20 transition-all">
              <div className="inline-flex p-2 bg-indigo-500/10 text-indigo-400 rounded-xl mb-1.5">
                <Award className="w-5 h-5" />
              </div>
              <div className="text-xl font-bold text-white">{user.longestStreak}</div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Longest Streak</div>
            </div>
          </div>
        </div>
      </div>

      {/* STATS OVERVIEW GRIDS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COMPLETED VS PENDING TASKS CARD */}
        <div className="glass-panel border border-white/5 rounded-3xl p-6 flex flex-col justify-between bg-gradient-to-br from-white/[0.02] to-transparent">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-indigo-400" />
              Works & Tasks
            </h2>
            <span className="text-xs text-gray-400 px-2.5 py-1 bg-white/5 rounded-full border border-white/5">All Time</span>
          </div>

          <div className="py-6 flex justify-center relative">
            {/* Simple Circular Ring using SVG */}
            <svg className="w-36 h-36" viewBox="0 0 36 36">
              <path
                className="text-white/5"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-indigo-500 transition-all duration-700"
                strokeWidth="3.5"
                strokeDasharray={`${tasks.completionRate}, 100`}
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <div className="text-2xl font-bold text-white">{tasks.completionRate}%</div>
              <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Completed</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/5">
            <div className="text-center">
              <p className="text-xs text-gray-400">Tasks Done</p>
              <p className="text-xl font-bold text-green-400 mt-1">{tasks.completed}</p>
            </div>
            <div className="text-center border-l border-white/5">
              <p className="text-xs text-gray-400">Tasks Pending</p>
              <p className="text-xl font-bold text-yellow-400 mt-1">{tasks.pending}</p>
            </div>
          </div>
        </div>

        {/* ROUTINES (DAILY & WEEKLY & MONTHLY) SUMMARY */}
        <div className="glass-panel border border-white/5 rounded-3xl p-6 lg:col-span-2 space-y-6 bg-gradient-to-br from-white/[0.02] to-transparent">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-400" />
            Routine & Schedule Breakdowns
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* DAILY ROUTINE (Today's Schedules) */}
            <div className="glass-panel border border-white/5 bg-white/[0.01] rounded-2xl p-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Daily Routine</span>
                <Calendar className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-white">{dailyRoutine.completed}/{dailyRoutine.total}</p>
                <p className="text-xs text-gray-400">Today's schedules done</p>
              </div>
              {dailyRoutine.total > 0 ? (
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full" 
                    style={{ width: `${Math.round((dailyRoutine.completed / dailyRoutine.total) * 100)}%` }}
                  ></div>
                </div>
              ) : (
                <div className="text-[10px] text-gray-500 italic">No schedules for today</div>
              )}
            </div>

            {/* WEEKLY ROUTINE (Habit completion inconsistency/consistency) */}
            <div className="glass-panel border border-white/5 bg-white/[0.01] rounded-2xl p-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Weekly Habits</span>
                <Award className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-white">{weeklyRoutine.weeklyCompletions}</p>
                <p className="text-xs text-gray-400">Habit logs (last 7 days)</p>
              </div>
              <div className="text-[10px] text-gray-400">
                Tracking {weeklyRoutine.totalHabits} active habit{weeklyRoutine.totalHabits !== 1 && 's'}
              </div>
            </div>

            {/* MONTHLY ROUTINE */}
            <div className="glass-panel border border-white/5 bg-white/[0.01] rounded-2xl p-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Monthly Stats</span>
                <BookOpen className="w-4 h-4 text-purple-400" />
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-white">{monthlyRoutine.notesWritten}</p>
                <p className="text-xs text-gray-400">Journal entries (past 30d)</p>
              </div>
              <div className="text-[10px] text-gray-400 flex items-center justify-between">
                <span>Monthly reviews:</span>
                <span className="font-bold text-white">{monthlyRoutine.reviewsCount} log(s)</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* TARGETS REACHED / ACHIEVEMENTS GRID */}
      <div className="glass-panel border border-white/5 rounded-3xl p-6 md:p-8 space-y-6 bg-gradient-to-br from-white/[0.01] to-transparent">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
              Targets Reached & Achievements
            </h2>
            <p className="text-xs text-gray-400 mt-1">Earn badges and unlock titles by completing tasks, routines, and habits.</p>
          </div>
          <div className="text-xs text-indigo-400 font-semibold bg-indigo-500/10 px-3.5 py-1.5 rounded-xl border border-indigo-500/10">
            {targets.filter((t: any) => t.reached).length} / {targets.length} Unlocked
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {targets.map((target: any) => (
            <div 
              key={target.id} 
              className={`glass-panel border rounded-2xl p-4 flex items-start gap-4 transition-all duration-300 ${
                target.reached 
                  ? 'border-indigo-500/30 bg-indigo-500/[0.02] shadow-md shadow-indigo-500/[0.02]' 
                  : 'border-white/5 bg-white/[0.01] opacity-60'
              }`}
            >
              {/* Badge Icon */}
              <div className={`p-3 rounded-xl border ${
                target.reached
                  ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-indigo-400/20 shadow-lg shadow-indigo-500/20'
                  : 'bg-white/5 text-gray-500 border-white/5'
              }`}>
                {target.reached ? (
                  <Star className="w-5 h-5 fill-white" />
                ) : (
                  <Lock className="w-5 h-5 text-gray-500" />
                )}
              </div>

              {/* Text Info */}
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex justify-between items-start gap-1">
                  <h3 className={`text-sm font-bold truncate ${target.reached ? 'text-white' : 'text-gray-400'}`}>
                    {target.title}
                  </h3>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{target.description}</p>
                <div className="flex justify-between items-center text-[10px] font-medium pt-1.5">
                  <span className={target.reached ? 'text-indigo-400' : 'text-gray-500'}>
                    {target.reached ? '🏆 Reached' : '🔒 Locked'}
                  </span>
                  <span className="text-gray-400 px-2 py-0.5 bg-white/5 rounded-full border border-white/5 text-[9px]">
                    {target.metric}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
