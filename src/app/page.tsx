"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  Award, 
  Flame, 
  CheckCircle2, 
  ListTodo, 
  CalendarClock, 
  TrendingUp, 
  Quote, 
  Play,
  ClipboardCheck
} from "lucide-react";
import { ReviewModal } from "./ReviewModal";

const QUOTES = [
  { text: "Your focus determines your reality.", author: "Qui-Gon Jinn" },
  { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Make each day your masterpiece.", author: "John Wooden" },
  { text: "Action is the foundational key to all success.", author: "Pablo Picasso" }
];

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [dateStr, setDateStr] = useState("");
  const [timeStr, setTimeStr] = useState("");
  const [quote, setQuote] = useState({ text: "", author: "" });
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({
    completedCount: 0,
    pendingCount: 0,
    progressPercent: 0,
    productivityScore: 80,
    streak: 1,
    level: 1,
    xp: 0
  });

  const [isReviewOpen, setIsReviewOpen] = useState(false);

  // Load date/time client-side to prevent hydration mismatch
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setDateStr(now.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);

    // Pick quote of the day
    const day = new Date().getDate();
    setQuote(QUOTES[day % QUOTES.length]);

    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    try {
      let tasks = [];
      try {
        const tasksRes = await fetch(`/api/tasks?userId=${session.user.id}`);
        if (tasksRes.ok) {
          tasks = await tasksRes.json();
        } else {
          throw new Error("Failed to load tasks from server");
        }
      } catch (e) {
        console.error("Dashboard tasks load failed, loading locally:", e);
        const local = localStorage.getItem(`lifetracker-tasks-${session.user.id}`);
        if (local) tasks = JSON.parse(local);
      }
      
      let anal: any = {};
      try {
        const analRes = await fetch(`/api/analytics?userId=${session.user.id}`);
        if (analRes.ok) {
          anal = await analRes.json();
        }
      } catch (e) {
        console.error("Dashboard analytics load failed:", e);
      }

      if (Array.isArray(tasks)) {
        const completed = tasks.filter(t => t.completed).length;
        const pending = tasks.filter(t => !t.completed).length;
        const total = completed + pending;
        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

        setStats({
          completedCount: completed,
          pendingCount: pending,
          progressPercent: percent,
          productivityScore: anal.avgProductivityScore || 80,
          streak: anal.streak || 1,
          level: anal.level || 1,
          xp: anal.xp || 100
        });
      }
    } catch (err) {
      console.error("Error loading dashboard metrics", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      loadDashboardData();
    }
  }, [session]);

  if (!session) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest block mb-1">
            System Synchronized ⚡
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight">
            Welcome back, <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">{session.user.name || "User"}</span>
          </h2>
          <p className="text-muted-foreground text-sm mt-1">{dateStr}</p>
        </div>

        {/* TIME WIDGET */}
        <div className="glass-panel border border-border/40 px-6 py-3.5 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-black/10">
          <CalendarClock className="w-5 h-5 text-indigo-400" />
          <span className="text-xl font-bold font-mono tracking-wider">{timeStr}</span>
        </div>
      </div>

      {/* MOTIVATIONAL QUOTE OF THE DAY */}
      <div className="glass-panel border border-indigo-500/10 rounded-3xl p-6 relative overflow-hidden bg-indigo-600/5">
        <Quote className="absolute right-6 bottom-4 w-24 h-24 text-indigo-500/5 rotate-12" />
        <div className="flex items-start gap-4">
          <div className="p-3 bg-indigo-500/15 text-indigo-400 rounded-2xl border border-indigo-500/20 shrink-0">
            <Quote className="w-5 h-5" />
          </div>
          <div>
            <p className="text-base font-medium text-gray-200 leading-relaxed">"{quote.text}"</p>
            <span className="text-xs text-indigo-400 font-semibold block mt-1.5">— {quote.author}</span>
          </div>
        </div>
      </div>

      {/* DYNAMIC METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* DAILY PROGRESS CIRCLE/CARD */}
        <div className="glass-panel border border-border/40 rounded-3xl p-6 flex items-center justify-between shadow-xl shadow-black/5 hover:border-indigo-500/20 transition-all">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Daily Progress</span>
            <span className="text-3xl font-extrabold block">{stats.progressPercent}%</span>
            <span className="text-xs text-muted-foreground">completed tasks count</span>
          </div>
          <div className="w-14 h-14 rounded-full border-4 border-secondary/50 border-t-indigo-500 flex items-center justify-center font-bold text-xs animate-spin-slow">
            {stats.progressPercent}%
          </div>
        </div>

        {/* COMPLETED TASKS */}
        <div className="glass-panel border border-border/40 rounded-3xl p-6 flex items-center justify-between shadow-xl shadow-black/5 hover:border-indigo-500/20 transition-all">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Completed</span>
            <span className="text-3xl font-extrabold block text-emerald-400">{stats.completedCount}</span>
            <span className="text-xs text-muted-foreground">tasks archive logs</span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/15">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* PENDING TASKS */}
        <div className="glass-panel border border-border/40 rounded-3xl p-6 flex items-center justify-between shadow-xl shadow-black/5 hover:border-indigo-500/20 transition-all">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Pending</span>
            <span className="text-3xl font-extrabold block text-amber-400">{stats.pendingCount}</span>
            <span className="text-xs text-muted-foreground">needs review</span>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/15">
            <ListTodo className="w-6 h-6" />
          </div>
        </div>

        {/* PRODUCTIVITY SCORE */}
        <div className="glass-panel border border-border/40 rounded-3xl p-6 flex items-center justify-between shadow-xl shadow-black/5 hover:border-indigo-500/20 transition-all">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Productivity Score</span>
            <span className="text-3xl font-extrabold block text-purple-400">{stats.productivityScore} / 100</span>
            <span className="text-xs text-muted-foreground">AI consolidated metric</span>
          </div>
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl border border-purple-500/15">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* GAMIFICATION & DAILY REVIEW ACTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* ACTION PANEL */}
        <div className="md:col-span-2 glass-panel border border-border/40 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-2 relative z-10">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
              <ClipboardCheck className="w-4 h-4" /> End of Day Review
            </span>
            <h3 className="text-xl font-bold">Done for the day? Evaluate your daily performance</h3>
            <p className="text-sm text-muted-foreground max-w-lg leading-relaxed">
              Submit your Daily Review to process completion ratios, evaluate obstacles, receive personal AI tips and earn 150 bonus experience points.
            </p>
          </div>

          <button
            onClick={() => setIsReviewOpen(true)}
            className="w-fit mt-6 px-6 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-2xl text-sm font-semibold shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all relative z-10 hover:-translate-y-0.5"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Launch End of Day Review</span>
          </button>
        </div>

        {/* BADGES & LEVELS */}
        <div className="glass-panel border border-border/40 rounded-3xl p-6 space-y-4">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Badges & Accomplishments</span>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center font-bold text-sm">
                🔥
              </div>
              <div>
                <span className="text-xs font-semibold block text-white">Daily Streak Reward</span>
                <span className="text-[10px] text-muted-foreground">Keep streak active 3 days (Unlocked)</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-purple-500/5 border border-purple-500/10">
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center font-bold text-sm">
                ⭐
              </div>
              <div>
                <span className="text-xs font-semibold block text-white">XP Ascendant</span>
                <span className="text-[10px] text-muted-foreground">Reach 250 XP total volume (Unlocked)</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 opacity-60">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold text-sm">
                🎖️
              </div>
              <div>
                <span className="text-xs font-semibold block text-white">Mindfulness Guru</span>
                <span className="text-[10px] text-muted-foreground">Complete Habit logs for 7 consecutive days</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* REVIEW MODAL ELEMENT */}
      <ReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        onReviewSaved={loadDashboardData}
      />

    </div>
  );
}
