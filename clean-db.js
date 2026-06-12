const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning database tables...");
  
  const tasks = await prisma.task.deleteMany({});
  console.log(`Deleted ${tasks.count} tasks.`);

  const schedules = await prisma.schedule.deleteMany({});
  console.log(`Deleted ${schedules.count} schedules.`);

  const habitLogs = await prisma.habitLog.deleteMany({});
  console.log(`Deleted ${habitLogs.count} habit logs.`);

  const habits = await prisma.habit.deleteMany({});
  console.log(`Deleted ${habits.count} habits.`);

  const notes = await prisma.note.deleteMany({});
  console.log(`Deleted ${notes.count} notes.`);

  const reviews = await prisma.review.deleteMany({});
  console.log(`Deleted ${reviews.count} reviews.`);

  const analytics = await prisma.analytics.deleteMany({});
  console.log(`Deleted ${analytics.count} analytics.`);

  // Optional: keep or delete users. Let's delete the demo user so it is clean, and optionally we can keep registered users.
  // Actually, deleting all users ensures complete freshness.
  const users = await prisma.user.deleteMany({});
  console.log(`Deleted ${users.count} users.`);

  console.log("Database cleanup completed successfully.");
}

main()
  .catch(e => {
    console.error("Cleanup failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
