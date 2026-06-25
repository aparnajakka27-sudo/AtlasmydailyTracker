import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Fetch user core info
    let user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        xp: true,
        level: true,
        streak: true,
        longestStreak: true,
        createdAt: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2. Fetch Tasks stats
    const allTasks = await prisma.task.findMany({
      where: { userId }
    });
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(t => t.completed).length;
    const pendingTasks = totalTasks - completedTasks;

    // 3. Fetch Daily Routine (Today's Schedules)
    const todayStr = new Date().toISOString().split("T")[0];
    const todaySchedules = await prisma.schedule.findMany({
      where: { userId, date: todayStr }
    });
    const totalDaily = todaySchedules.length;
    const completedDaily = todaySchedules.filter(s => s.completed).length;
    const pendingDaily = totalDaily - completedDaily;

    // 4. Fetch Weekly Routine (Habits & Logs last 7 days)
    const habits = await prisma.habit.findMany({
      where: { userId },
      include: {
        logs: true
      }
    });
    
    // Count completions in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split("T")[0];

    let weeklyCompletions = 0;
    habits.forEach(habit => {
      const recentLogs = habit.logs.filter(log => log.date >= sevenDaysAgoStr && log.completed);
      weeklyCompletions += recentLogs.length;
    });
    const totalHabits = habits.length;

    // 5. Fetch Monthly Routine (Notes & Reviews last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentNotesCount = await prisma.note.count({
      where: {
        userId,
        createdAt: { gte: thirtyDaysAgo }
      }
    });

    const recentReviews = await prisma.review.findMany({
      where: {
        userId,
        createdAt: { gte: thirtyDaysAgo }
      }
    });
    const avgMonthlyProductivity = recentReviews.length > 0
      ? Math.round(recentReviews.reduce((sum, r) => sum + r.productivityScore, 0) / recentReviews.length)
      : 0;

    // 6. Dynamic Targets Reached (Milestones calculation)
    const totalSchedulesCompleted = await prisma.schedule.count({
      where: { userId, completed: true }
    });
    const totalNotesWritten = await prisma.note.count({
      where: { userId }
    });

    const targets = [
      {
        id: "first_task",
        title: "First Accomplishment",
        description: "Complete your first task",
        reached: completedTasks >= 1,
        metric: `${completedTasks}/1 task`
      },
      {
        id: "taskmaster",
        title: "Taskmaster",
        description: "Complete 10 tasks in total",
        reached: completedTasks >= 10,
        metric: `${completedTasks}/10 tasks`
      },
      {
        id: "daily_planner",
        title: "Organized Mind",
        description: "Complete 5 schedules",
        reached: totalSchedulesCompleted >= 5,
        metric: `${totalSchedulesCompleted}/5 schedules`
      },
      {
        id: "habit_starter",
        title: "Consistency Seed",
        description: "Track your habits and log a completed habit",
        reached: weeklyCompletions >= 1,
        metric: `${weeklyCompletions}/1 log`
      },
      {
        id: "streak_3",
        title: "Habitual Activist",
        description: "Achieve a 3-day streak",
        reached: user.longestStreak >= 3,
        metric: `${user.longestStreak}/3 days streak`
      },
      {
        id: "journalist",
        title: "Self Reflector",
        description: "Write your first note or daily journal entry",
        reached: totalNotesWritten >= 1,
        metric: `${totalNotesWritten}/1 note`
      },
      {
        id: "level_2",
        title: "Ascended Planner",
        description: "Reach Level 2 by gaining XP",
        reached: user.level >= 2,
        metric: `Level ${user.level}/2`
      }
    ];

    return NextResponse.json({
      user,
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        pending: pendingTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
      },
      dailyRoutine: {
        total: totalDaily,
        completed: completedDaily,
        pending: pendingDaily
      },
      weeklyRoutine: {
        totalHabits,
        weeklyCompletions
      },
      monthlyRoutine: {
        notesWritten: recentNotesCount,
        avgProductivity: avgMonthlyProductivity,
        reviewsCount: recentReviews.length
      },
      targets
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load profile data" }, { status: 500 });
  }
}
