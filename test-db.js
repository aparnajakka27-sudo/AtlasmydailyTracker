const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("=== USERS ===");
  console.log(await prisma.user.findMany());
  console.log("=== TASKS ===");
  console.log(await prisma.task.findMany());
  console.log("=== SCHEDULES ===");
  console.log(await prisma.schedule.findMany());
  console.log("=== HABITS ===");
  console.log(await prisma.habit.findMany());
  console.log("=== NOTES ===");
  console.log(await prisma.note.findMany());
  console.log("=== REVIEWS ===");
  console.log(await prisma.review.findMany());
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
