import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';

// Simple mock AI reviewer rule system
function analyzeReview(
  completedCount: number,
  pendingCount: number,
  challenges: string,
  learnings: string,
  improvements: string
) {
  const total = completedCount + pendingCount;
  const rate = total > 0 ? (completedCount / total) * 100 : 80;
  
  let score = Math.round(rate);
  // Give points for writing thorough replies
  if (challenges.length > 20) score += 5;
  if (learnings.length > 20) score += 5;
  if (improvements.length > 20) score += 5;
  score = Math.min(Math.max(score, 10), 100);

  let rating = "Average";
  if (score >= 90) rating = "Excellent";
  else if (score >= 75) rating = "Good";
  else if (score >= 50) rating = "Average";
  else rating = "Poor";

  let aiSuggestions = "";
  if (rating === "Excellent") {
    aiSuggestions = `### Incredible Job! 🎉
You dominated your goals today with a completion rate of **${Math.round(rate)}%**. 
* **Suggestion**: Maintain this momentum but ensure you build in rest. Your learning ("${learnings.slice(0, 40)}...") shows great progress. Keep it up!`;
  } else if (rating === "Good") {
    aiSuggestions = `### Great Work today! 👍
You completed the majority of your planned tasks.
* **Suggestion**: To overcome the challenge ("${challenges.slice(0, 45)}..."), try breaking your biggest tasks into 20-minute chunks. Tomorrow, target your highest priority item first.`;
  } else {
    aiSuggestions = `### Tomorrow is a new opportunity! 🌱
A score of **${score}** indicates some friction or over-planning.
* **Suggestion**: Lower your planning target by 50% tomorrow to build completion momentum. For your challenge ("${challenges.slice(0, 45)}..."), allocate a dedicated 'deep work block' in the morning.`;
  }

  return { completionRate: rate, productivityScore: score, rating, aiSuggestions };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const date = searchParams.get("date");
    if (!userId || !date) return NextResponse.json({ error: "Missing query info" }, { status: 400 });

    const review = await prisma.review.findUnique({
      where: { date }
    });

    return NextResponse.json(review || null);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { date, tasksCompleted, challenges, learnings, improvements, userId } = await req.json();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Count today's tasks & schedules
    const tasks = await prisma.task.findMany({ where: { userId } });
    const schedules = await prisma.schedule.findMany({ where: { userId, date } });

    const completedTasksCount = tasks.filter(t => t.completed).length;
    const pendingTasksCount = tasks.filter(t => !t.completed).length;

    const completedSchedCount = schedules.filter(s => s.completed).length;
    const pendingSchedCount = schedules.filter(s => !s.completed).length;

    const totalCompleted = completedTasksCount + completedSchedCount;
    const totalPending = pendingTasksCount + pendingSchedCount;

    const analysis = analyzeReview(
      totalCompleted,
      totalPending,
      challenges || "",
      learnings || "",
      improvements || ""
    );

    // Upsert review record
    const review = await prisma.review.upsert({
      where: { date },
      update: {
        tasksCompleted: JSON.stringify(tasksCompleted || []),
        challenges: challenges || "",
        learnings: learnings || "",
        improvements: improvements || "",
        completionRate: analysis.completionRate,
        productivityScore: analysis.productivityScore,
        dayRating: analysis.rating,
        aiSuggestions: analysis.aiSuggestions
      },
      create: {
        date,
        tasksCompleted: JSON.stringify(tasksCompleted || []),
        challenges: challenges || "",
        learnings: learnings || "",
        improvements: improvements || "",
        completionRate: analysis.completionRate,
        productivityScore: analysis.productivityScore,
        dayRating: analysis.rating,
        aiSuggestions: analysis.aiSuggestions,
        userId
      }
    });

    // Add XP rewards
    const xpReward = 150; // review submission bonus!
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        xp: { increment: xpReward }
      }
    });

    // Check if user leveled up (every 500 XP is 1 level)
    const newLevel = Math.floor(updatedUser.xp / 500) + 1;
    if (newLevel > updatedUser.level) {
      await prisma.user.update({
        where: { id: userId },
        data: { level: newLevel }
      });
    }

    return NextResponse.json({ review, xpGained: xpReward, newLevel });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
