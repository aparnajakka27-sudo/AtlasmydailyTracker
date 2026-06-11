import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const tasks = await prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(tasks);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { title, description, priority, category, dueDate, userId } = await req.json();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority || "Medium",
        category: category || "General",
        dueDate: dueDate ? new Date(dueDate) : null,
        userId
      }
    });

    // Reward XP for creating a task!
    await prisma.user.update({
      where: { id: userId },
      data: { xp: { increment: 10 } }
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, title, description, priority, category, completed, userId } = await req.json();
    if (!id || !userId) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const taskBefore = await prisma.task.findUnique({ where: { id } });
    if (!taskBefore) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const task = await prisma.task.update({
      where: { id },
      data: {
        title,
        description,
        priority,
        category,
        completed
      }
    });

    // Reward XP for completing task!
    if (completed && !taskBefore.completed) {
      await prisma.user.update({
        where: { id: userId },
        data: { xp: { increment: 50 } }
      });
    } else if (!completed && taskBefore.completed) {
      await prisma.user.update({
        where: { id: userId },
        data: { xp: { decrement: 50 } }
      });
    }

    return NextResponse.json(task);
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

    await prisma.task.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
