/**
 * List all properties in Supabase
 * This helps verify the migration and see the actual property IDs
 */

// Load environment variables
const fs = require('fs');
const path = require('path');

try {
  const envFile = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf-8');
  envFile.split('\n').forEach((line: string) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
} catch (error) {
  console.error('⚠️  Could not load .env.local file');
  process.exit(1);
}

import { getAllProperties } from '../src/lib/supabase/repositories/properties.repository';

async function main() {
  console.log('📋 Fetching all properties from Supabase...\n');
  
  try {
    const properties = await getAllProperties();
    
    console.log(`✅ Found ${properties.length} properties:\n`);
    
    properties.forEach((p, index) => {
      console.log(`${index + 1}. ${p.property.address}, ${p.property.city}`);
      console.log(`   ID: ${p.property.id}`);
      console.log(`   Purchase Price: $${p.property.purchase_price.toLocaleString()}`);
      console.log(`   Current Value: ${p.valuations[0] ? '$' + p.valuations[0].estimated_value.toLocaleString() : 'N/A'}`);
      console.log('');
    });
  } catch (error) {
    console.error('❌ Error fetching properties:', error);
    process.exit(1);
  }
}

main();
