# How to Run the Migration

The migration script needs your Supabase credentials. Here's the easiest way to run it:

## Run this command:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://fwcrhxpnfodcfbcgtpby.supabase.co NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_v3wDGqddzFtswq2eSJkReA_8HzlN5EE npx tsx scripts/migrate-data.ts
```

**Copy the entire command above and paste it into your terminal.**

---

## What it does:

1. Sets the Supabase environment variables
2. Runs the migration script
3. Imports all 6 properties into your Supabase database

---

## Expected output:

```
🔍 Checking migration status...

📊 Current database: 0 properties
📦 Mock data: 6 properties

✅ Database is empty. Starting migration...

🚀 Starting mock data migration...
📦 Found 6 properties to migrate

📍 Migrating: 2029 Estes St, Muskegon
✅ Successfully migrated: 2029 Estes St

... (continues for all 6 properties)

==================================================
📊 Migration Summary
==================================================
✅ Successful: 6
❌ Failed: 0

🎉 Migration complete!
```

---

## After successful migration:

1. Verify in Supabase Dashboard → Table Editor → `properties` (should see 6 rows)
2. Edit `.env.local` → Change `NEXT_PUBLIC_USE_SUPABASE=false` to `true`
3. Restart your dev server (`npm run dev`)
4. Test editing a property - changes will persist!
