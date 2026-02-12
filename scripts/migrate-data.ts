/**
 * Data Migration Script
 * 
 * Run this script to migrate mock data to Supabase.
 * 
 * Usage: bash scripts/run-migration.sh
 * (This loads environment variables from .env.local)
 */

import { migrateMockData, checkMigrationStatus } from '../src/lib/supabase/migrate-mock-data';

async function main() {
  console.log('🔍 Checking migration status...\n');
  
  const status = await checkMigrationStatus();
  
  console.log(`📊 Current database: ${status.currentCount} properties`);
  console.log(`📦 Mock data: ${status.mockCount} properties\n`);
  
  if (!status.isNeeded) {
    console.log('⚠️  Database already has properties!');
    console.log('❓ Do you want to migrate anyway? This may create duplicates.');
    console.log('   To proceed, delete existing data first or modify this script.\n');
    process.exit(0);
  }
  
  console.log('✅ Database is empty. Starting migration...\n');
  
  const results = await migrateMockData();
  
  if (results.failed.length === 0) {
    console.log('\n🎉 All properties migrated successfully!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some properties failed to migrate.');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('💥 Migration script failed:', error);
  process.exit(1);
});
