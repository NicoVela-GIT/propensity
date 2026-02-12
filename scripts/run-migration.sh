#!/bin/bash

# Migration runner that loads environment variables
# This ensures .env.local is loaded before running the migration

# Load environment variables from .env.local
if [ -f .env.local ]; then
  export $(cat .env.local | grep -v '^#' | xargs)
  echo "✅ Environment variables loaded from .env.local"
  echo ""
else
  echo "❌ Error: .env.local file not found"
  exit 1
fi

# Run the migration
npx tsx scripts/migrate-data.ts
