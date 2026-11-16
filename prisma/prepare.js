const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const schemaPath = path.join(__dirname, 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

const dbUrl = process.env.DATABASE_URL || '';
const isPostgres = dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://');
const targetProvider = isPostgres ? 'postgresql' : 'sqlite';

console.log(`[prepare-db] DATABASE_URL detected: ${isPostgres ? 'PostgreSQL' : 'SQLite'}`);
console.log(`[prepare-db] Setting Prisma provider to "${targetProvider}"`);

schema = schema.replace(
  /provider\s*=\s*"(sqlite|postgresql)"/,
  `provider = "${targetProvider}"`
);
fs.writeFileSync(schemaPath, schema);

// Generate Prisma Client
console.log('[prepare-db] Running prisma generate...');
execSync('npx prisma generate', { stdio: 'inherit' });

// If on Postgres (e.g. Vercel deployment), push schema to ensure database tables exist in the cloud
if (isPostgres) {
  console.log('[prepare-db] Running prisma db push for PostgreSQL...');
  try {
    execSync('npx prisma db push --skip-generate', { stdio: 'inherit' });
  } catch (err) {
    console.error('[prepare-db] Warning: prisma db push encountered an issue:', err.message);
  }
}
