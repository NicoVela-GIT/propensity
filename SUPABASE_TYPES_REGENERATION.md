# Supabase Types Regeneration Guide

## When to Regenerate Types

You should regenerate Supabase TypeScript types whenever you:
- Add new tables to your database
- Modify existing table schemas (add/remove/rename columns)
- Change column types or constraints
- See TypeScript errors related to Supabase queries

## Prerequisites

1. **Supabase CLI** installed globally:
   ```bash
   npm install -g supabase
   ```

2. **Supabase Access** - You need to be logged in:
   ```bash
   supabase login
   ```
   This will open a browser window for authentication.

## Regenerate Types

### Method 1: Using Project ID (Recommended)

```bash
npx supabase gen types typescript --project-id fwcrhxpnfodcfbcgtpby > src/lib/supabase/database.types.ts
```

Your project ID is: `fwcrhxpnfodcfbcgtpby` (from your Supabase URL)

### Method 2: Using Database URL (If you have direct DB access)

```bash
npx supabase gen types typescript --db-url "postgresql://postgres:[YOUR-PASSWORD]@db.fwcrhxpnfodcfbcgtpby.supabase.co:5432/postgres" > src/lib/supabase/database.types.ts
```

Replace `[YOUR-PASSWORD]` with your database password from Supabase dashboard.

## Current Workaround

Due to Supabase CLI authentication requirements, we've added `as any` type assertions to the `upsert` operations in:
- `src/lib/supabase/repositories/alerts.repository.ts`

These type assertions allow the code to compile and work correctly at runtime, but bypass TypeScript's strict type checking for these specific operations.

**This is a temporary solution.** The proper fix is to regenerate types using the commands above once you have Supabase CLI access configured.

## After Regenerating Types

1. Remove the `as any` assertions from the upsert operations
2. Update any interfaces in repository files to use the generated types
3. Test the build: `npm run build`
4. If there are type errors, review the generated types and update your code accordingly

## Troubleshooting

### "Access token not provided"
- Run `supabase login` to authenticate
- Or set `SUPABASE_ACCESS_TOKEN` environment variable with your personal access token

### "Permission denied"
- Ensure you have access to the Supabase project
- Check you're using the correct project ID

### Types don't match database
- Ensure you've run all migrations in `supabase-migrations/` folder
- Check that the migration was successful in Supabase dashboard
- Try regenerating types again after a few minutes (Supabase needs time to process schema changes)
