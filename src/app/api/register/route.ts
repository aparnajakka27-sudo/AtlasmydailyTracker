import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

async function hashPassword(password: string) {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || email.split("@")[0],
        xp: 100, // starting bonus
        level: 1,
        streak: 1,
        longestStreak: 1
      }
    });

    // Seed sample data for the user
    const today = new Date().toISOString().split("T")[0];
    
    // Seed Tasks
    await prisma.task.createMany({
      data: [
        { title: "Complete design review of LifeTracker AI", priority: "High", category: "Work", completed: true, userId: user.id },
        { title: "Work out for 45 minutes", priority: "Medium", category: "Health", completed: false, userId: user.id },
        { title: "Read 15 pages of book", priority: "Low", category: "Reading", completed: false, userId: user.id }
      ]
    });

    // Seed Schedules
    await prisma.schedule.createMany({
      data: [
        { title: "Morning meditation & coffee", priority: "Low", category: "Health", startTime: "07:30", endTime: "08:00", date: today, completed: true, userId: user.id },
        { title: "Next.js Core Architecture coding sprint", priority: "High", category: "Coding", startTime: "09:00", endTime: "12:00", date: today, completed: true, userId: user.id },
        { title: "Gym & cardio training session", priority: "Medium", category: "Health", startTime: "17:00", endTime: "18:00", date: today, completed: false, userId: user.id }
      ]
    });

    // Seed Habits
    await prisma.habit.createMany({
      data: [
        { name: "Coding", goal: "60 mins/day", streak: 3, userId: user.id },
        { name: "Meditation", goal: "15 mins/day", streak: 1, userId: user.id },
        { name: "Water Intake", goal: "8 glasses/day", streak: 5, userId: user.id }
      ]
    });

    return NextResponse.json({ success: true, userId: user.id }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create user" }, { status: 500 });
  }
}
