import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json({ error: "Email not registered" }, { status: 400 });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExpiry: expiry
      }
    });

    const resetLink = `http://127.0.0.1:3000/reset-password?token=${token}`;
    console.log(`[PASSWORD RESET] Link generated for ${email}: ${resetLink}`);

    return NextResponse.json({
      success: true,
      message: "Reset link generated successfully.",
      resetLink
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
  }
}
