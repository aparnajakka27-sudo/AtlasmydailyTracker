import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const date = searchParams.get("date"); // YYYY-MM-DD
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const schedules = await prisma.schedule.findMany({
      where: { 
        userId,
        ...(date ? { date } : {})
      },
      orderBy: { startTime: "asc" }
    });

    return NextResponse.json(schedules);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { title, description, priority, category, startTime, endTime, date, userId } = await req.json();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const schedule = await prisma.schedule.create({
      data: {
        title,
        description,
        priority: priority || "Medium",
        category: category || "General",
        startTime,
        endTime,
        date: date || new Date().toISOString().split("T")[0],
        userId
      }
    });

    return NextResponse.json(schedule, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, title, description, priority, category, startTime, endTime, date, completed, userId } = await req.json();
    if (!id || !userId) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const schedule = await prisma.schedule.update({
      where: { id },
      data: {
        title,
        description,
        priority,
        category,
        startTime,
        endTime,
        date,
        completed
      }
    });

    return NextResponse.json(schedule);
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

    await prisma.schedule.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
