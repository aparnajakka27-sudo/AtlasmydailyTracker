import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { compare, hash } from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const hashedPassword = await hash(password, 10);

    let user = null;
    try {
      user = await prisma.user.findUnique({
        where: { email: cleanEmail }
      });
    } catch (e) {
      console.error("verify route db lookup failed:", e);
    }

    if (!user) {
      try {
        // Auto-register user on the fly if they don't exist yet
        user = await prisma.user.create({
          data: {
            email: cleanEmail,
            password: hashedPassword,
            name: cleanEmail.split("@")[0],
            xp: 100, // starting bonus
            level: 1,
            streak: 1,
            longestStreak: 1
          }
        });
      } catch (err) {
        console.error("verify route auto-register failed:", err);
      }
    } else {
      try {
        // If user exists, update password to what they just typed
        user = await prisma.user.update({
          where: { id: user.id },
          data: { password: hashedPassword }
        });
      } catch (err) {
        console.error("verify route password update failed:", err);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
  }
}
