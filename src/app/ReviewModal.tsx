"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { X, Sparkles, Send, Award, BookOpen, AlertTriangle, Lightbulb, TrendingUp } from "lucide-react";
import confetti from "canvas-confetti";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReviewSaved: () => void;
}

export function ReviewModal({ isOpen, onClose, onReviewSaved }: ReviewModalProps) {
  const { data: session } = useSession();
  const [challenges, setChallenges] = useState("");
  const [learnings, setLearnings] = useState("");
  const [improvements, setImprovements] = useState("");
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Results view
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (isOpen && session?.user?.id) {
      // Get today's tasks
      fetch(`/api/tasks?userId=${session.user.id}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setTasks(data);
          }
        });
    }
  }, [isOpen, session]);

  if (!isOpen) return null;

  const completedTasks = tasks.filter(t => t.completed);
  const pendingTasks = tasks.filter(t => !t.completed);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const todayStr = new Date().toISOString().split("T")[0];

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: todayStr,
          tasksCompleted: completedTasks.map(t => t.title),
          challenges,
          learnings,
          improvements,
          userId: session?.user?.id
        })
      });

      const data = await res.ok ? await res.json() : null;
      if (data) {
        setResult(data.review);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        onReviewSaved();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-card border border-border/80 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-border/10 flex items-center justify-between bg-indigo-600/5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-lg">End of Day Productivity Review</h3>
              <p className="text-xs text-muted-foreground">Submit feedback to compute your AI score</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary/80 text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {result ? (
          /* RESULT / AI ANALYSIS PREVIEW PANEL */
          <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            <div className="text-center p-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 font-extrabold text-2xl text-white shadow-xl shadow-indigo-500/20 mb-3 animate-bounce">
                {result.productivityScore}
              </div>
              <h4 className="text-xl font-bold">Your Day Rating: <span className="text-indigo-400">{result.dayRating}</span></h4>
              <p className="text-xs text-muted-foreground mt-1">Productivity Score calculated out of 100</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-secondary/30 border border-border/40 text-center">
                <span className="text-xs text-muted-foreground block">Completion Rate</span>
                <span className="text-xl font-bold text-emerald-400 mt-1 block">{Math.round(result.completionRate)}%</span>
              </div>
              <div className="p-4 rounded-xl bg-secondary/30 border border-border/40 text-center">
                <span className="text-xs text-muted-foreground block">XP Rewarded</span>
                <span className="text-xl font-bold text-indigo-400 mt-1 block">+150 XP 🎯</span>
              </div>
            </div>

            {/* AI suggestions markdown renderer */}
            <div className="p-5 rounded-2xl bg-[#0b0b13] border border-indigo-500/10 space-y-2">
              <span className="text-xs font-semibold text-indigo-400 tracking-wider uppercase block">AI Personal Suggestions</span>
              <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                {result.aiSuggestions}
              </div>
            </div>

            <button
              onClick={() => {
                setResult(null);
                onClose();
              }}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all"
            >
              Continue to Dashboard
            </button>
          </div>
        ) : (
          /* REVIEW SUBMISSION FORM */
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[85vh] overflow-y-auto">
            
            {/* Task summary */}
            <div className="p-4 rounded-2xl bg-secondary/30 border border-border/40">
              <span className="text-xs font-semibold text-muted-foreground block mb-2">Today's Progress Overview</span>
              <div className="flex gap-6 text-sm">
                <div>
                  <span className="text-emerald-400 font-bold">{completedTasks.length}</span> Completed Tasks
                </div>
                <div>
                  <span className="text-amber-400 font-bold">{pendingTasks.length}</span> Pending Tasks
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> What challenges did you face today?
                </label>
                <textarea
                  required
                  rows={3}
                  value={challenges}
                  onChange={(e) => setChallenges(e.target.value)}
                  className="w-full p-3 bg-secondary/30 border border-border rounded-xl text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
                  placeholder="e.g. Spent too long debug-logging Webpack errors, got sidetracked by social media..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-indigo-400" /> What did you learn today?
                </label>
                <textarea
                  required
                  rows={3}
                  value={learnings}
                  onChange={(e) => setLearnings(e.target.value)}
                  className="w-full p-3 bg-secondary/30 border border-border rounded-xl text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
                  placeholder="e.g. Learned how Next.js Router handles dynamic routes on deployment servers..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> What can be improved tomorrow?
                </label>
                <textarea
                  required
                  rows={3}
                  value={improvements}
                  onChange={(e) => setImprovements(e.target.value)}
                  className="w-full p-3 bg-secondary/30 border border-border rounded-xl text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
                  placeholder="e.g. Schedule coding tasks strictly in the morning, block notification feeds..."
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Review & Generate AI Analytics</span>
                </>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
