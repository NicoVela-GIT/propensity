# Supabase Migration Guide

**Status**: Database schema created ✅  
**Next**: Migrate your 6 properties to Supabase

---

## What We've Built So Far

✅ Supabase project created  
✅ Database tables created (7 tables)  
✅ Supabase client configured  
✅ Repository layer (database functions)  
✅ Service layer (switches between mock/Supabase)  
✅ Migration script ready

---

## How to Migrate Your Data

### Option 1: Automatic Migration (Recommended)

**Run this command in your terminal:**

```bash
npx tsx scripts/migrate-data.ts
```

**What it does:**
- Checks if database is empty
- Migrates all 6 properties from mock data
- Creates properties, loans, valuations, leases, capital structures
- Shows progress and summary

**Expected output:**
```
🚀 Starting mock data migration...
📦 Found 6 properties to migrate

📍 Migrating: 2029 Estes St, Muskegon
✅ Successfully migrated: 2029 Estes St

... (repeats for all 6 properties)

📊 Migration Summary
==================================================
✅ Successful: 6
❌ Failed: 0

🎉 Migration complete!
```

---

### Option 2: Manual Migration via Supabase Dashboard

If the script fails, you can manually insert data:

1. Go to **Supabase Dashboard** → **Table Editor**
2. Click **properties** table
3. Click **Insert** → **Insert row**
4. Fill in the property details
5. Repeat for capital_structures, loans, etc.

**Not recommended** - the script is much easier!

---

## After Migration: Enable Supabase

### Step 1: Verify Data

1. Go to **Supabase Dashboard** → **Table Editor**
2. Click **properties** table
3. You should see 6 properties
4. Click **valuations_snapshots** - should see 6 valuations
5. Click **loans** - should see 6 loans
6. Click **leases** - should see 6 leases

### Step 2: Enable Supabase in Your App

**Edit `.env.local`:**

```bash
# Change this from 'false' to 'true'
NEXT_PUBLIC_USE_SUPABASE=true
```

### Step 3: Restart Your Dev Server

**In terminal:**

```bash
# Press Ctrl+C to stop the current server (if running)
# Then start it again:
npm run dev
```

### Step 4: Test the App

1. Go to `http://localhost:3000`
2. You should see the same 6 properties
3. Try editing a property - **changes will now persist!**
4. Refresh the page - **data should remain!**

---

## Troubleshooting

### Issue: "Cannot find module 'tsx'"

**Fix:**
```bash
npm install -D tsx
```

Then run the migration again.

---

### Issue: Migration script hangs or fails

**Check**:
1. Is `.env.local` file in the project root?
2. Are the Supabase credentials correct?
3. Is your internet connection working?

**Try**:
```bash
# Test Supabase connection
node -e "import('./src/lib/supabase/client.js').then(m => console.log('Connected!'))"
```

---

### Issue: "Database already has properties"

**This is normal if**:
- You've already run the migration before

**To reset and re-migrate**:
1. Go to Supabase Dashboard → SQL Editor
2. Run this SQL to delete all data:
   ```sql
   DELETE FROM expenses;
   DELETE FROM leases;
   DELETE FROM loan_balance_snapshots;
   DELETE FROM valuation_snapshots;
   DELETE FROM loans;
   DELETE FROM capital_structures;
   DELETE FROM properties;
   ```
3. Run the migration script again

---

### Issue: Properties show but values are wrong

**Check**:
- The migration script uses the mock data from `src/lib/data.ts`
- If you've edited mock data since migration, it won't match
- Re-run migration after deleting old data (see above)

---

## What Changes After Migration?

### ✅ What Works the Same

- All existing pages and components
- Dashboard displays properties
- Property cards show data
- Edit property page works

### ✨ What's Better

- **Edits persist** across page refreshes
- **Real database** instead of in-memory mock data
- **Ready for production** deployment
- **Multi-user support** (when you add auth later)

### 🔄 What's Different Under the Hood

**Before** (Mock Data):
```typescript
import { properties } from '@/lib/data';
// properties is a mutable array in memory
```

**After** (Supabase):
```typescript
import { getAllProperties } from '@/lib/supabase/services/property.service';
// Fetches from Supabase database
const properties = await getAllProperties();
```

---

## Next Steps After Migration

### 1. Update Components to Use Service Layer

Instead of:
```typescript
import { properties } from '@/lib/data';
```

Use:
```typescript
import { getAllProperties } from '@/lib/supabase/services/property.service';

// In component:
const properties = await getAllProperties();
```

### 2. Add Loading States

Since database calls are async:
```typescript
'use client';
import { useState, useEffect } from 'react';

const [properties, setProperties] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  getAllProperties().then(data => {
    setProperties(data);
    setLoading(false);
  });
}, []);

if (loading) return <div>Loading...</div>;
```

### 3. Add Error Handling

```typescript
try {
  const properties = await getAllProperties();
} catch (error) {
  console.error('Failed to load properties:', error);
  // Show error UI
}
```

---

## FAQ

### Do I need to change my components?

**Not immediately!** The service layer returns data in the old `Property` format, so existing components will work as-is.

**Eventually**: You'll want to refactor to use the new domain model directly for better type safety.

---

### What if I want to go back to mock data?

**Easy!** Just change `.env.local`:
```bash
NEXT_PUBLIC_USE_SUPABASE=false
```

Restart the dev server and it'll use mock data again.

---

### Can I add new properties through the app?

**Not yet!** The migration only handles existing mock data.

**To add this feature**, you need to update the "Add Property" form to use the `createProperty` repository function.

---

### What about alerts and portfolio metrics?

**Not migrated yet.** Those still use mock data from `src/lib/data.ts`.

**Future enhancement**: Add tables for alerts and create portfolio metrics from property data.

---

## Files Created

Here's what was built:

```
src/lib/supabase/
├── client.ts                    # Supabase client configuration
├── database.types.ts            # TypeScript types for database
├── migrate-mock-data.ts         # Migration functions
├── repositories/
│   └── properties.repository.ts # Database CRUD operations
└── services/
    └── property.service.ts      # Unified data access layer

scripts/
└── migrate-data.ts              # CLI migration script

.env.local                        # Supabase credentials (created)
```

---

## Ready to Migrate?

**Run this command:**

```bash
npx tsx scripts/migrate-data.ts
```

**Then come back here and let me know:**
- ✅ Did it succeed?
- ❌ Did you get errors?

**I'll help you enable Supabase and update the components!** 🚀
