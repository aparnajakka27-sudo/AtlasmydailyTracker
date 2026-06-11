"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useNotifications } from "../NotificationContext";
import { 
  CalendarRange, 
  Clock, 
  Plus, 
  Trash2, 
  Check, 
  AlertTriangle, 
  Tag,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from "lucide-react";

export default function PlannerPage() {
  const { data: session } = useSession();
  const { triggerNotification } = useNotifications();

  // Selected date
  const [selectedDate, setSelectedDate] = useState("");
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [category, setCategory] = useState("General");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");

  useEffect(() => {
    setSelectedDate(new Date().toISOString().split("T")[0]);
  }, []);

  const loadSchedules = async () => {
    if (!session?.user?.id || !selectedDate) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/schedules?userId=${session.user.id}&date=${selectedDate}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setSchedules(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDate && session) {
      loadSchedules();
    }
  }, [selectedDate, session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !session?.user?.id) return;

    try {
      const res = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          priority,
          category,
          startTime: "All day",
          endTime: "All day",
          date: selectedDate,
          userId: session.user.id
        })
      });

      if (res.ok) {
        setTitle("");
        setDescription("");
        loadSchedules();
        triggerNotification("Schedule Created! 📅", `"${title}" has been successfully added to your planner.`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleCompleted = async (id: string, currentCompleted: boolean) => {
    if (!session?.user?.id) return;
    try {
      const res = await fetch("/api/schedules", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          completed: !currentCompleted,
          userId: session.user.id
        })
      });

      if (res.ok) {
        loadSchedules();
        if (!currentCompleted) {
          triggerNotification("Goal Reached! 🌟", "Awesome job finishing your scheduled block!");
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!session?.user?.id) return;
    try {
      const res = await fetch(`/api/schedules?id=${id}&userId=${session.user.id}`, {
        method: "DELETE"
      });

      if (res.ok) {
        loadSchedules();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Move calendar days
  const adjustDate = (days: number) => {
    if (!selectedDate) return;
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header & Date controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest block mb-1">
            Focus & Schedule ⏰
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight">Daily Planner</h2>
          <p className="text-muted-foreground text-sm mt-1">Structure your hour-by-hour calendar schedule</p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 bg-secondary/35 border border-border/40 p-1.5 rounded-2xl">
          <button onClick={() => adjustDate(-1)} className="p-2 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-all">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent text-sm font-semibold focus:outline-none border-none cursor-pointer px-2"
          />
          <button onClick={() => adjustDate(1)} className="p-2 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-all">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ADD EVENT FORM */}
        <div className="glass-panel border border-border/40 rounded-3xl p-6 h-fit space-y-5">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest block">Add Scheduled Event</span>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Event Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2.5 bg-secondary/35 border border-border rounded-xl text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all"
                placeholder="e.g. Code Review / Gym Block"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2.5 bg-secondary/35 border border-border rounded-xl text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all"
                placeholder="e.g. Address github issues..."
              />
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
                    <option value="Coding">Coding</option>
                    <option value="Work">Work</option>
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
              <span>Add Event</span>
            </button>
          </form>
        </div>

        {/* TIMELINE TIMETABLE VIEW */}
        <div className="lg:col-span-2 glass-panel border border-border/40 rounded-3xl p-6 min-h-[500px]">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest block mb-4">Hourly Timeline View</span>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-80 gap-3">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-muted-foreground">Loading day schedule...</p>
            </div>
          ) : schedules.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-80 text-muted-foreground">
              <CalendarRange className="w-12 h-12 text-gray-600 mb-3" />
              <p className="text-sm font-medium">Nothing scheduled for today yet.</p>
              <p className="text-xs text-gray-500 mt-1">Fill out the planner form to get organized.</p>
            </div>
          ) : (
            <div className="relative border-l border-border/60 ml-4 space-y-6">
              {schedules.map((item) => {
                const priorityColor = 
                  item.priority === "High" ? "border-red-500 bg-red-500/10 text-red-400" :
                  item.priority === "Medium" ? "border-amber-500 bg-amber-500/10 text-amber-400" :
                  "border-indigo-500 bg-indigo-500/10 text-indigo-400";
                
                return (
                  <div key={item.id} className="relative pl-8 group">
                    {/* Circle bullet */}
                    <div className={`absolute -left-3.5 top-1.5 w-7 h-7 rounded-full border bg-background flex items-center justify-center transition-all ${item.completed ? "border-emerald-500 text-emerald-500" : "border-border text-muted-foreground hover:border-indigo-500"}`}>
                      {item.completed ? <Check className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                    </div>

                    {/* Content Box */}
                    <div className={`p-4 rounded-2xl border ${item.completed ? "bg-emerald-500/5 border-emerald-500/20 opacity-70" : "bg-secondary/25 border-border/40 hover:border-indigo-500/30"} transition-all`}>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${priorityColor}`}>{item.priority}</span>
                            <span className="text-[10px] bg-secondary border border-border px-2 py-0.5 rounded-full font-semibold text-muted-foreground">{item.category}</span>
                          </div>
                          
                          <h4 className={`text-base font-semibold mt-1.5 ${item.completed ? "line-through text-muted-foreground" : ""}`}>{item.title}</h4>
                          {item.description && (
                            <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleToggleCompleted(item.id, item.completed)}
                            className="p-1.5 rounded-lg hover:bg-emerald-500/20 text-emerald-400/80 hover:text-emerald-400"
                            title={item.completed ? "Mark Incomplete" : "Mark Complete"}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400/80 hover:text-red-400"
                            title="Delete Schedule"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
