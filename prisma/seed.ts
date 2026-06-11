import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = "demo@lifetracker.ai";
  
  // Clean up existing if any
  const existing = await prisma.user.findUnique({
    where: { email }
  });
  
  if (existing) {
    console.log("Demo user already exists");
    return;
  }

  // Fallback hasher simple check
  let hash = 0;
  const password = "demopassword";
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  const hashedPassword = hash.toString(36);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: "Atas",
      xp: 0,
      level: 1,
      streak: 1,
      longestStreak: 1,
    }
  });

  console.log("Database seeded with user Atas successfully!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
