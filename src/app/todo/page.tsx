"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useNotifications } from "../NotificationContext";
import { 
  CheckSquare, 
  Search, 
  Plus, 
  Trash2, 
  Calendar, 
  AlertTriangle, 
  Tag, 
  Filter,
  CheckCircle2,
  Award
} from "lucide-react";
import confetti from "canvas-confetti";

export default function ToDoPage() {
  const { data: session, update } = useSession();
  const { triggerNotification } = useNotifications();

  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all"); // all, pending, completed, high-priority

  // Task Form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [category, setCategory] = useState("General");
  const [dueDate, setDueDate] = useState("");

  const loadTasks = async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks?userId=${session.user.id}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setTasks(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      loadTasks();
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !session?.user?.id) return;

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          priority,
          category,
          dueDate: dueDate ? new Date(dueDate) : null,
          userId: session.user.id
        })
      });

      if (res.ok) {
        setTitle("");
        setDescription("");
        setDueDate("");
        loadTasks();
        triggerNotification("Task Created! ✅", `"${title}" was added. +10 XP rewarded.`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleCompleted = async (id: string, currentCompleted: boolean, title: string) => {
    if (!session?.user?.id) return;
    try {
      const res = await fetch("/api/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          completed: !currentCompleted,
          userId: session.user.id
        })
      });

      if (res.ok) {
        loadTasks();
        if (!currentCompleted) {
          confetti({
            particleCount: 50,
            spread: 40,
            origin: { y: 0.8 }
          });
          triggerNotification("Task Completed! 🎉", `"${title}" marked complete. Earned +50 XP!`);
          
          // Trigger JWT update to sync XP display
          const userAnalytics = await fetch(`/api/analytics?userId=${session.user.id}`).then(r => r.json());
          update({
            xp: userAnalytics.xp,
            level: userAnalytics.level
          });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!session?.user?.id) return;
    try {
      const res = await fetch(`/api/tasks?id=${id}&userId=${session.user.id}`, {
        method: "DELETE"
      });

      if (res.ok) {
        loadTasks();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase()) || 
                          (task.description && task.description.toLowerCase().includes(search.toLowerCase()));
    
    if (!matchesSearch) return false;

    if (filterType === "pending") return !task.completed;
    if (filterType === "completed") return task.completed;
    if (filterType === "high-priority") return task.priority === "High";

    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div>
        <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest block mb-1">
          Efficiency & Goals 📝
        </span>
        <h2 className="text-3xl font-extrabold tracking-tight">Smart To-Do List</h2>
        <p className="text-muted-foreground text-sm mt-1">Complete objectives to earn Level XP and track milestones</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ADD TASK FORM */}
        <div className="glass-panel border border-border/40 rounded-3xl p-6 h-fit space-y-5">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest block">Add Task Goal</span>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Task Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2.5 bg-secondary/35 border border-border rounded-xl text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all"
                placeholder="e.g. Design app interface"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2.5 bg-secondary/35 border border-border rounded-xl text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all"
                placeholder="e.g. Include custom graphs..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Due Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-secondary/35 border border-border rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Priority</label>
                <div className="relative">
                  <AlertTriangle className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-secondary/35 border border-border rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Category</label>
                <div className="relative">
                  <Tag className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-secondary/35 border border-border rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="General">General</option>
                    <option value="Work">Work</option>
                    <option value="Coding">Coding</option>
                    <option value="Health">Health</option>
                    <option value="Reading">Reading</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
            >
              <Plus className="w-4 h-4" />
              <span>Create Task</span>
            </button>
          </form>
        </div>

        {/* LIST & FILTER CONTROLS */}
        <div className="lg:col-span-2 glass-panel border border-border/40 rounded-3xl p-6 min-h-[500px] flex flex-col justify-between">
          <div>
            
            {/* Search and Filters panel */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
              
              {/* Search bar */}
              <div className="relative w-full md:max-w-xs">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-secondary/35 border border-border rounded-xl text-xs placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all"
                  placeholder="Search goals..."
                />
              </div>

              {/* Pills Filters */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { name: "All", value: "all" },
                  { name: "Pending", value: "pending" },
                  { name: "Completed", value: "completed" },
                  { name: "High", value: "high-priority" }
                ].map(p => (
                  <button
                    key={p.value}
                    onClick={() => setFilterType(p.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${filterType === p.value ? "bg-indigo-600/10 text-indigo-400 border-indigo-500/30" : "bg-transparent text-muted-foreground border-border/60 hover:text-foreground"}`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>

            </div>

            {/* List */}
            {loading ? (
              <div className="flex flex-col items-center justify-center h-80 gap-3">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-muted-foreground">Loading task checklist...</p>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-80 text-muted-foreground">
                <CheckSquare className="w-12 h-12 text-gray-600 mb-3" />
                <p className="text-sm font-medium">No tasks found matching query.</p>
                <p className="text-xs text-gray-500 mt-1">Create items to start checking them off.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTasks.map((task) => {
                  const priorityColor = 
                    task.priority === "High" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                    task.priority === "Medium" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                    "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";

                  return (
                    <div 
                      key={task.id} 
                      className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 group ${task.completed ? "bg-emerald-500/5 border-emerald-500/25 opacity-70" : "bg-secondary/25 border-border/40 hover:border-indigo-500/30"}`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => handleToggleCompleted(task.id, task.completed, task.title)}
                          className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${task.completed ? "bg-emerald-500 border-emerald-600 text-white" : "border-border hover:border-indigo-500"}`}
                        >
                          {task.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </button>

                        <div>
                          <h4 className={`text-sm font-bold ${task.completed ? "line-through text-muted-foreground" : ""}`}>{task.title}</h4>
                          {task.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>
                          )}
                          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                            <span className={`text-[9px] px-1.5 py-0.5 rounded border font-semibold ${priorityColor}`}>{task.priority}</span>
                            <span className="text-[9px] bg-secondary border border-border px-1.5 py-0.5 rounded font-semibold text-muted-foreground">{task.category}</span>
                            {task.dueDate && (
                              <span className="text-[9px] text-muted-foreground font-semibold">📅 {new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDelete(task.id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/15 text-red-400/80 hover:text-red-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete Task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

          </div>

          <div className="pt-6 border-t border-border/20 flex justify-between items-center text-xs text-muted-foreground mt-6">
            <span>XP Rate: Completed tasks yield +50 XP.</span>
            <span className="flex items-center gap-1 text-indigo-400 font-bold">
              <Award className="w-4 h-4" /> Gamified Progress Enabled
            </span>
          </div>

        </div>

      </div>

    </div>
  );
}
