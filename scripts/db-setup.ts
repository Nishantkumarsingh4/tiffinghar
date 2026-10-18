import { execSync } from 'child_process';
import dotenv from 'dotenv';
dotenv.config();

async function setupDatabase() {
  console.log('🚀 Running complete database setup (create + migrate + seed)...\n');

  try {
    console.log('Step 1: Create Database');
    execSync('npx tsx scripts/db-create.ts', { stdio: 'inherit' });

    console.log('\nStep 2: Run Migrations');
    execSync('npx tsx scripts/db-migrate.ts', { stdio: 'inherit' });

    console.log('\nStep 3: Seed Initial Data');
    execSync('npx tsx scripts/db-seed.ts', { stdio: 'inherit' });

    console.log('\n🎉 Database setup finished successfully!');
  } catch (err: any) {
    console.error('\n❌ Database setup encountered an error.');
    process.exit(1);
  }
}

setupDatabase();
