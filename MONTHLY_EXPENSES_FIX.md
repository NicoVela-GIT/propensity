# Monthly Expenses Fix - Quick Setup

## What Was Fixed

The monthly expenses field in the Edit Properties page was not saving because the database schema used a complex expense tracking system (categories, time-series data) while the UI just had a single "monthly expenses" input field.

**Solution**: Added a simple `monthly_expenses_override` column to store the total monthly expenses amount directly.

---

## Step 1: Run SQL Migration in Supabase

1. Open your Supabase project: https://fwcrhxpnfodcfbcgtpby.supabase.co
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste this SQL:

```sql
-- Add monthly_expenses_override column to properties table
ALTER TABLE properties 
ADD COLUMN monthly_expenses_override NUMERIC(10,2);

COMMENT ON COLUMN properties.monthly_expenses_override IS 
'User-provided total monthly expenses estimate. Used when detailed expense tracking is not needed.';
```

5. Click **Run** (or press Cmd/Ctrl + Enter)
6. You should see "Success. No rows returned"

---

## Step 2: Populate Existing Data

Since you already have 6 properties in Supabase from the previous migration, you need to populate their monthly expenses values.

**Option A: Run in Supabase SQL Editor** (Recommended)

```sql
-- Update properties with monthly expenses from original mock data
UPDATE properties SET monthly_expenses_override = 717 WHERE address = '2029 Estes St';
UPDATE properties SET monthly_expenses_override = 780 WHERE address = '7216 Russell St';
UPDATE properties SET monthly_expenses_override = 1230 WHERE address = '543 Ocean Blvd';
UPDATE properties SET monthly_expenses_override = 660 WHERE address = '2156 Maple Ave';
UPDATE properties SET monthly_expenses_override = 891 WHERE address = '789 Pine St';
UPDATE properties SET monthly_expenses_override = 1350 WHERE address = '1024 Summit Drive';
```

**Option B: Re-run Full Migration** (If you want fresh data)

```bash
npm run migrate
```

---

## Step 3: Test It

1. Go to http://localhost:3000/properties
2. Click on any property
3. Click **Edit Property** (top right)
4. Change the **Monthly Expenses** value
5. Click **Save**
6. Close the success modal
7. **Verify**: The property detail page should show your updated expenses value
8. **Verify**: The ROI calculation should reflect the new expenses

---

## What Changed in the Code

✅ **Database Schema**: Added `monthly_expenses_override` column
✅ **Database Types**: Updated TypeScript types to include the new field
✅ **Migration Script**: Will now populate this field for new migrations
✅ **Service Layer**: Reads from `monthly_expenses_override` and updates it when user changes expenses
✅ **Repository Layer**: Automatically handles the new column (no changes needed)

---

## Notes

- The old `expenses` table still exists in the database (unused)
- If you ever want detailed expense tracking by category, the infrastructure is already there
- For now, the app uses the simple single-field approach you requested
