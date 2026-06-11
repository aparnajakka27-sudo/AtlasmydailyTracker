import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

// Vercel serverless functions have a read-only root directory. 
// We copy the database to '/tmp' (which is read-write on Vercel) and point DATABASE_URL there.
if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
  const dbName = 'dev.db';
  const destPath = path.join('/tmp', dbName);

  // Search across several possible location directories inside Vercel's runtime environment
  const possibleSrcPaths = [
    path.join(/*turbopackIgnore: true*/ process.cwd(), 'prisma', dbName),
    path.join(/*turbopackIgnore: true*/ process.cwd(), 'lifetracker', 'prisma', dbName),
    path.join(/*turbopackIgnore: true*/ process.cwd(), '.next', 'server', 'prisma', dbName),
    path.resolve(path.join(/*turbopackIgnore: true*/ process.cwd(), '..', 'prisma', dbName)),
  ];

  try {
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    
    // Copy if it doesn't exist yet in /tmp
    if (!fs.existsSync(destPath)) {
      let copied = false;
      for (const srcPath of possibleSrcPaths) {
        if (fs.existsSync(srcPath)) {
          fs.copyFileSync(srcPath, destPath);
          fs.chmodSync(destPath, 0o666);
          console.log(`Database successfully copied to /tmp from ${srcPath}`);
          copied = true;
          break;
        }
      }
      if (!copied) {
        console.warn('Source database not found in any fallback path:', possibleSrcPaths);
      }
    }
    
    // Point Prisma to the writable /tmp file
    process.env.DATABASE_URL = `file:${destPath}`;
  } catch (err) {
    console.error('Failed to copy database to /tmp:', err);
  }
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

