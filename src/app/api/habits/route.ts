import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const habits = await prisma.habit.findMany({
      where: { userId },
      include: { logs: true },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(habits);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, goal, userId } = await req.json();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const habit = await prisma.habit.create({
      data: {
        name,
        goal: goal || "Daily",
        userId
      },
      include: { logs: true }
    });

    return NextResponse.json(habit, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { habitId, date, completed, userId } = await req.json();
    if (!habitId || !date || !userId) {
      return NextResponse.json({ error: "Missing required params" }, { status: 400 });
    }

    if (completed) {
      // Upsert habit completion log
      await prisma.habitLog.upsert({
        where: {
          habitId_date: { habitId, date }
        },
        create: {
          habitId,
          date,
          completed: true
        },
        update: {
          completed: true
        }
      });

      // Simple Streak increment algorithm
      const logs = await prisma.habitLog.findMany({
        where: { habitId, completed: true },
        select: { date: true }
      });
      const dates = logs.map(l => l.date).sort();
      
      let streak = 0;
      let tempStreak = 0;
      // Calculate consecutive days
      const uniqueSortedDates = Array.from(new Set(dates));
      if (uniqueSortedDates.length > 0) {
        streak = 1;
        for (let i = 1; i < uniqueSortedDates.length; i++) {
          const d1 = new Date(uniqueSortedDates[i - 1]);
          const d2 = new Date(uniqueSortedDates[i]);
          const diffTime = Math.abs(d2.getTime() - d1.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            streak++;
          } else if (diffDays > 1) {
            streak = 1; // reset streak if broken
          }
        }
      }

      await prisma.habit.update({
        where: { id: habitId },
        data: { streak }
      });

      // Reward XP!
      await prisma.user.update({
        where: { id: userId },
        data: { xp: { increment: 25 } }
      });

    } else {
      // Delete habit log
      await prisma.habitLog.deleteMany({
        where: { habitId, date }
      });

      // Recalculate streak
      const logs = await prisma.habitLog.findMany({
        where: { habitId, completed: true }
      });
      const dates = logs.map(l => l.date).sort();
      let streak = 0;
      if (dates.length > 0) {
        streak = 1;
        for (let i = 1; i < dates.length; i++) {
          const d1 = new Date(dates[i - 1]);
          const d2 = new Date(dates[i]);
          const diffDays = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays === 1) streak++;
          else if (diffDays > 1) streak = 1;
        }
      }

      await prisma.habit.update({
        where: { id: habitId },
        data: { streak }
      });
    }

    const updatedHabit = await prisma.habit.findUnique({
      where: { id: habitId },
      include: { logs: true }
    });

    return NextResponse.json(updatedHabit);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const userId = searchParams.get("userId");
    if (!id || !userId) return NextResponse.json({ error: "Missing identity" }, { status: 400 });

    await prisma.habit.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
