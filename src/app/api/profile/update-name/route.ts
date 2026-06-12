import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { userId, newName } = await req.json();

    if (!userId || !newName || !newName.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name: newName.trim() }
    });

    return NextResponse.json({ success: true, name: updatedUser.name });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update name" }, { status: 500 });
  }
}
