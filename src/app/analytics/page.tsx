"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from "recharts";
import { 
  Sparkles, 
  Award, 
  Activity, 
  TrendingUp, 
  Flame, 
  CheckCircle,
  HelpCircle
} from "lucide-react";

export default function AnalyticsPage() {
  const { data: session } = useSession();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetch(`/api/analytics?userId=${session.user.id}`)
        .then(res => res.json())
        .then(resData => {
          if (resData && !resData.error) {
            setData(resData);
          }
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [session]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-muted-foreground">Compiling historical trends...</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div>
        <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest block mb-1">
          Performance index 📈
        </span>
        <h2 className="text-3xl font-extrabold tracking-tight">AI Productivity Analytics</h2>
        <p className="text-muted-foreground text-sm mt-1">Review long-term trends and gamified stats</p>
      </div>

      {/* Aggregated Grid Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        <div className="glass-panel border border-border/40 rounded-3xl p-6 space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Avg Productivity Score</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-indigo-400">{data.avgProductivityScore}</span>
            <span className="text-xs text-muted-foreground">/ 100</span>
          </div>
          <p className="text-[10px] text-muted-foreground">Calculated from End of Day reviews</p>
        </div>

        <div className="glass-panel border border-border/40 rounded-3xl p-6 space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Habit Consistency</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-400">{data.habitConsistency}%</span>
          </div>
          <p className="text-[10px] text-muted-foreground">Completions in the past 30 days</p>
        </div>

        <div className="glass-panel border border-border/40 rounded-3xl p-6 space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Current Streak</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-500">{data.streak} Days</span>
            <Flame className="w-5 h-5 text-amber-500 animate-pulse" />
          </div>
          <p className="text-[10px] text-muted-foreground">Longest Streak: {data.longestStreak} days</p>
        </div>

        <div className="glass-panel border border-border/40 rounded-3xl p-6 space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Total XP Earned</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-purple-400">{data.xp} XP</span>
          </div>
          <p className="text-[10px] text-muted-foreground">Level {data.level} productivity tier</p>
        </div>

      </div>

      {/* Chart Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Productivity area chart */}
        <div className="glass-panel border border-border/40 rounded-3xl p-6 space-y-4">
          <div>
            <h4 className="text-base font-bold">Daily Productivity Score Trend</h4>
            <p className="text-xs text-muted-foreground mt-0.5">Productivity index mapped over recent logs</p>
          </div>

          <div className="h-72 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.productivityGraph}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "rgba(10,10,10,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }}
                  itemStyle={{ color: "#818cf8" }}
                />
                <Area type="monotone" dataKey="score" stroke="#6366f1" fillOpacity={1} fill="url(#colorScore)" strokeWidth={2.5} name="Productivity Score" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task ratio bar charts */}
        <div className="glass-panel border border-border/40 rounded-3xl p-6 space-y-4">
          <div>
            <h4 className="text-base font-bold">Goal Completion Index</h4>
            <p className="text-xs text-muted-foreground mt-0.5">Comparison ratios of scheduled tasks complete</p>
          </div>

          <div className="h-72 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.productivityGraph}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "rgba(10,10,10,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }}
                  itemStyle={{ color: "#34d399" }}
                />
                <Legend iconSize={10} wrapperStyle={{ paddingTop: "15px" }} />
                <Bar dataKey="completionRate" fill="#10b981" radius={[4, 4, 0, 0]} name="Completion Rate (%)" barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
