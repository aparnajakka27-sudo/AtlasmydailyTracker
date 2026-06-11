"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useNotifications } from "../NotificationContext";
import { 
  Activity, 
  Flame, 
  Plus, 
  Trash2, 
  Check, 
  Award,
  TrendingUp,
  CalendarDays
} from "lucide-react";

export default function HabitsPage() {
  const { data: session } = useSession();
  const { triggerNotification } = useNotifications();

  const [habits, setHabits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("Daily");

  // Grid dates generator (past 30 days)
  const [pastDates, setPastDates] = useState<string[]>([]);

  useEffect(() => {
    const dates = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split("T")[0]);
    }
    setPastDates(dates);
  }, []);

  const loadHabits = async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/habits?userId=${session.user.id}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setHabits(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      loadHabits();
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !session?.user?.id) return;

    try {
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          goal,
          userId: session.user.id
        })
      });

      if (res.ok) {
        setName("");
        setGoal("Daily");
        loadHabits();
        triggerNotification("Habit Added! ⚡", `"${name}" is ready for streak logging.`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleLog = async (habitId: string, date: string, wasCompleted: boolean) => {
    if (!session?.user?.id) return;
    try {
      const res = await fetch("/api/habits", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          habitId,
          date,
          completed: !wasCompleted,
          userId: session.user.id
        })
      });

      if (res.ok) {
        loadHabits();
        if (!wasCompleted) {
          triggerNotification("Streak Increment! 🔥", "Way to lock down your habits today! +25 XP");
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!session?.user?.id) return;
    try {
      const res = await fetch(`/api/habits?id=${id}&userId=${session.user.id}`, {
        method: "DELETE"
      });

      if (res.ok) {
        loadHabits();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div>
        <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest block mb-1">
          Consistency & Routine 🧬
        </span>
        <h2 className="text-3xl font-extrabold tracking-tight">Habit Tracker</h2>
        <p className="text-muted-foreground text-sm mt-1">Strengthen routines and review consistency heatmap indexes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ADD HABIT FORM */}
        <div className="glass-panel border border-border/40 rounded-3xl p-6 h-fit space-y-5">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest block">Configure Habit</span>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Habit Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 bg-secondary/35 border border-border rounded-xl text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all"
                placeholder="e.g. Drink Water / Exercise"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Daily Goal Target</label>
              <input
                type="text"
                required
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full px-3 py-2.5 bg-secondary/35 border border-border rounded-xl text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all"
                placeholder="e.g. 8 glasses / 45 mins"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
            >
              <Plus className="w-4 h-4" />
              <span>Create Habit</span>
            </button>
          </form>
        </div>

        {/* LIST & HEATMAPS */}
        <div className="lg:col-span-2 glass-panel border border-border/40 rounded-3xl p-6 min-h-[500px] space-y-6">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest block">Your Daily Habit Routines</span>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-80 gap-3">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-muted-foreground">Loading habits data...</p>
            </div>
          ) : habits.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-80 text-muted-foreground">
              <Activity className="w-12 h-12 text-gray-600 mb-3" />
              <p className="text-sm font-medium">No habit configurations active.</p>
              <p className="text-xs text-gray-500 mt-1">Configure habits to measure consistency.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {habits.map((h) => {
                const logsMap = new Set(h.logs.filter((l: any) => l.completed).map((l: any) => l.date));
                const todayLogged = logsMap.has(todayStr);

                return (
                  <div key={h.id} className="p-5 rounded-2xl bg-secondary/20 border border-border/40 space-y-4 group">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h4 className="text-base font-bold flex items-center gap-2">
                          {h.name}
                          <span className="text-xs font-normal text-muted-foreground bg-secondary px-2.5 py-0.5 rounded-full border border-border">Goal: {h.goal}</span>
                        </h4>
                        <div className="flex items-center gap-1 mt-1 text-amber-400 font-bold text-xs">
                          <Flame className="w-3.5 h-3.5" /> {h.streak} Day streak
                        </div>
                      </div>

                      {/* Log Action & Delete */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleLog(h.id, todayStr, todayLogged)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${todayLogged ? "bg-emerald-500 border-emerald-600 text-white" : "bg-indigo-600 hover:bg-indigo-700 border-indigo-600 text-white"}`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{todayLogged ? "Done Today" : "Log Today"}</span>
                        </button>
                        <button
                          onClick={() => handleDelete(h.id)}
                          className="p-2 rounded-xl hover:bg-red-500/15 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* LeetCode styled heatmap widget */}
                    <div>
                      <span className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase flex items-center gap-1 mb-2">
                        <CalendarDays className="w-3.5 h-3.5" /> 30-Day Consistency Heatmap
                      </span>
                      <div className="grid grid-cols-10 gap-1.5 w-fit">
                        {pastDates.map((d) => {
                          const done = logsMap.has(d);
                          const isToday = d === todayStr;
                          return (
                            <button
                              key={d}
                              onClick={() => handleToggleLog(h.id, d, done)}
                              className={`w-6 h-6 rounded-md transition-all border ${
                                done 
                                  ? "bg-emerald-500 border-emerald-600" 
                                  : isToday
                                  ? "bg-indigo-500/10 border-indigo-500/30"
                                  : "bg-secondary/40 border-border/30"
                              }`}
                              title={`${d}: ${done ? "Completed" : "Incomplete"}`}
                            />
                          );
                        })}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
