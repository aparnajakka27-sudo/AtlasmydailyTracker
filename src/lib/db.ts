import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

// Vercel serverless functions have a read-only root directory. 
// We copy the database to '/tmp' (which is read-write on Vercel) and point DATABASE_URL there.
if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
  const dbName = 'dev.db';
  const srcPath = path.join(process.cwd(), 'prisma', dbName);
  const destPath = path.join('/tmp', dbName);

  try {
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    
    // Copy if it doesn't exist yet in /tmp
    if (!fs.existsSync(destPath)) {
      if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        fs.chmodSync(destPath, 0o666);
        console.log('Database successfully copied to /tmp');
      } else {
        console.warn('Source database not found at:', srcPath);
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

