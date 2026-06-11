"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "./ThemeContext";
import { useNotifications } from "./NotificationContext";
import { 
  LayoutDashboard, 
  CalendarRange, 
  CheckSquare, 
  Activity, 
  BookOpen, 
  NotebookPen,
  LogOut, 
  Sun, 
  Moon, 
  Bell, 
  User as UserIcon, 
  Award,
  Sparkles,
  ChevronRight,
  Menu,
  X
} from "lucide-react";

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { theme, toggleTheme } = useTheme();
  const { notifications, markAsRead, clearAll, requestBrowserPermission } = useNotifications();

  const [isOpen, setIsOpen] = useState(true);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [dbUser, setDbUser] = useState<any>(null);

  // Poll database user stats (XP, level, streak)
  useEffect(() => {
    if (session?.user?.id) {
      fetch(`/api/analytics?userId=${session.user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data && !data.error) {
            setDbUser(data);
          }
        })
        .catch(err => console.error("Error loading user state", err));
    }
  }, [session, pathname]);

  // Redirect unauthenticated to login (allow register endpoint access)
  useEffect(() => {
    if (status !== "loading" && !session && pathname !== "/login" && pathname !== "/register") {
      router.push("/login");
    }
  }, [session, status, pathname, router]);

  // If loading or unauthenticated on private route, return empty placeholder safely
  if (status === "loading" || (!session && pathname !== "/login" && pathname !== "/register")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 font-medium text-sm">Synchronizing dashboard...</p>
        </div>
      </div>
    );
  }

  // If login or register, just render normal view without sidebar
  if (pathname === "/login" || pathname === "/register") {
    return <div className="min-h-screen w-full bg-[#0a0a0a] text-white">{children}</div>;
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  const links = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Daily Planner", href: "/planner", icon: CalendarRange },
    { name: "Smart To-Do", href: "/todo", icon: CheckSquare },
    { name: "Habit Tracker", href: "/habits", icon: Activity },
    { name: "Notes & Journal", href: "/notes", icon: NotebookPen },
    { name: "AI Analytics", href: "/analytics", icon: Sparkles }
  ];

  const currentLevelXP = dbUser ? dbUser.xp % 500 : 100;
  const xpPercentage = (currentLevelXP / 500) * 100;

  return (
    <div className="min-h-screen flex text-foreground bg-background transition-colors duration-300">
      
      {/* SIDEBAR CONTAINER */}
      <aside className={`fixed inset-y-0 left-0 z-30 flex flex-col justify-between glass-panel border-r border-border/40 transition-all duration-300 ${isOpen ? "w-64" : "w-20"}`}>
        
        {/* TOP BLOCK */}
        <div>
          {/* LOGO */}
          <div className="p-6 flex items-center justify-between border-b border-border/10">
            <Link href="/" className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/20">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              {isOpen && (
                <span className="font-bold text-lg bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Atlas
                </span>
              )}
            </Link>
            <button onClick={() => setIsOpen(!isOpen)} className="hidden md:block text-muted-foreground hover:text-foreground">
              <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
            </button>
          </div>

          {/* USER CARD (GAMIFICATION STATS) */}
          {isOpen && session && (
            <div className="p-4 mx-4 mt-6 rounded-2xl bg-indigo-600/5 border border-indigo-500/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
                  {session.user.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                  <h4 className="text-sm font-semibold truncate max-w-[130px]">{session.user.name}</h4>
                  <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-medium">
                    <Award className="w-3.5 h-3.5" />
                    <span>Level {dbUser?.level || 1}</span>
                  </div>
                </div>
              </div>

              {/* XP Progress Bar */}
              <div className="mt-3">
                <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                  <span>{currentLevelXP} / 500 XP</span>
                  <span>{Math.round(xpPercentage)}%</span>
                </div>
                <div className="w-full h-1.5 bg-secondary/50 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${xpPercentage}%` }}></div>
                </div>
              </div>

              {/* Streak Pill */}
              <div className="mt-3 flex justify-between items-center text-xs bg-black/20 p-2 rounded-lg">
                <span className="text-muted-foreground">Streak:</span>
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  🔥 {dbUser?.streak || 1} Days
                </span>
              </div>
            </div>
          )}

          {/* NAVIGATION LINKS */}
          <nav className="mt-6 px-3 space-y-1">
            {links.map((link) => {
              const active = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    active 
                      ? "bg-indigo-600/10 text-indigo-400 border-l-2 border-indigo-500 shadow-md shadow-indigo-600/5" 
                      : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {isOpen && <span>{link.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* BOTTOM BLOCK (PREFERENCES & LOGOUT) */}
        <div className="p-3 border-t border-border/10 space-y-2">
          {/* Theme & Notifications actions */}
          <div className="flex items-center justify-around py-2">
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-lg hover:bg-secondary/60 text-muted-foreground hover:text-foreground"
              title="Toggle Theme"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button 
              onClick={() => {
                setShowNotifMenu(!showNotifMenu);
                requestBrowserPermission();
              }} 
              className="relative p-2 rounded-lg hover:bg-secondary/60 text-muted-foreground hover:text-foreground"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></span>
              )}
            </button>
          </div>

          <button
            onClick={() => {
              if (typeof window !== "undefined") {
                localStorage.removeItem("lifetracker-email");
                localStorage.removeItem("lifetracker-pass");
              }
              signOut({ callbackUrl: "/login" });
            }}
            className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-all`}
          >
            <LogOut className="w-5 h-5" />
            {isOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* NOTIFICATIONS PANEL FLOATING POPUP */}
      {showNotifMenu && (
        <div className="fixed right-6 top-6 z-50 w-80 glass-panel border border-border rounded-2xl shadow-2xl p-4 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between pb-3 border-b border-border/20">
            <span className="font-semibold text-sm flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-indigo-400" /> Notifications ({unreadCount} new)
            </span>
            <button onClick={clearAll} className="text-xs text-muted-foreground hover:text-foreground">Clear All</button>
          </div>
          <div className="mt-3 max-h-60 overflow-y-auto space-y-2.5 pr-1">
            {notifications.length === 0 ? (
              <p className="text-xs text-center text-muted-foreground py-6">No recent notifications</p>
            ) : (
              notifications.map((n) => (
                <div 
                  key={n.id} 
                  onClick={() => markAsRead(n.id)}
                  className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                    n.read 
                      ? "bg-secondary/20 border-border/20 text-muted-foreground" 
                      : "bg-indigo-600/5 border-indigo-500/20 text-foreground font-medium"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-semibold">{n.title}</span>
                    <span className="text-[10px] text-muted-foreground">{new Date(n.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{n.message}</p>
                </div>
              ))
            )}
          </div>
          <button 
            onClick={() => setShowNotifMenu(false)}
            className="w-full text-center text-xs text-indigo-400 hover:text-indigo-300 mt-3 pt-2.5 border-t border-border/10 font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* MAIN VIEWPORT WRAPPER */}
      <main className={`flex-1 transition-all duration-300 ${isOpen ? "pl-64" : "pl-20"} min-h-screen bg-gradient-to-b from-[#0b0b0f] via-background to-background text-foreground`}>
        <div className="max-w-6xl mx-auto p-6 md:p-10">
          {children}
        </div>
      </main>
      
    </div>
  );
}
