# Supabase Setup Guide - Complete Beginner's Guide

**For**: Complete beginners (never used Supabase before)  
**Goal**: Get your database connected and working  
**Time**: 30-45 minutes

---

## 🎯 What is Supabase?

Supabase is like a "database in the cloud" that:
- Stores your property data permanently
- Provides an API to read/write data
- Handles authentication (future)
- Gives you a nice dashboard to view data

**Think of it as**: Your app's permanent storage (like Google Drive for your data)

---

## 📋 Step-by-Step Setup

### STEP 1: Create Supabase Account (5 minutes)

1. **Go to**: https://supabase.com
2. **Click**: "Start your project" or "Sign Up"
3. **Sign up with**: GitHub account (easiest) or email
4. **Verify email** if needed

**Result**: You'll see the Supabase dashboard

---

### STEP 2: Create New Project (3 minutes)

1. **Click**: "New Project" button (green button)
2. **Fill in**:
   - **Name**: `propensity-realestatedashboard`
   - **Database Password**: Create a strong password (SAVE THIS!)
   - **Region**: Choose closest to you (e.g., "US West" if you're in California)
   - **Pricing Plan**: Free (perfect for development)

3. **Click**: "Create new project"
4. **Wait**: 2-3 minutes for database to provision (you'll see a loading screen)

**Result**: Your project dashboard will open

---

### STEP 3: Get Your API Credentials (2 minutes)

1. **In Supabase dashboard**, click **"Settings"** (gear icon in left sidebar)
2. **Click**: "API" in the settings menu
3. **You'll see two important values**:

   ```
   Project URL: https://xxxxxxxxxxxxx.supabase.co
   anon/public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

4. **COPY BOTH** - you'll need them in Step 5

**⚠️ Important**: Don't share these publicly (they're like passwords)

---

### STEP 4: Install Supabase in Your Project (1 minute)

**In your terminal** (in Cursor or system terminal):

```bash
cd /Users/nicovela/propensity-realestatedashboard
npm install @supabase/supabase-js
```

**Wait for**: Installation to complete (~30 seconds)

**Result**: You'll see "added 1 package" message

---

### STEP 5: Create Environment Variables File (2 minutes)

**I'll create this file for you** - just need your credentials from Step 3.

**File**: `.env.local` (at project root)

**Contents**:
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Feature flag (set to 'true' when ready to use Supabase)
NEXT_PUBLIC_USE_SUPABASE=false
```

**Replace**:
- `your_project_url_here` with your Project URL from Step 3
- `your_anon_key_here` with your anon key from Step 3

**⚠️ Security**: This file is already in `.gitignore` (won't be committed to git)

---

### STEP 6: Create Database Tables (5 minutes)

1. **In Supabase dashboard**, click **"SQL Editor"** (in left sidebar)
2. **Click**: "New query" button
3. **Copy the schema** (I'll provide this below)
4. **Paste** into the SQL editor
5. **Click**: "Run" button (or press Cmd+Enter)

**Wait for**: "Success. No rows returned" message

---

## 📊 Database Schema (Copy This)

```sql
-- ============================================
-- Core Properties Table
-- ============================================

CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT,
  property_type TEXT NOT NULL,
  bedrooms INTEGER,
  bathrooms NUMERIC(3,1),
  square_feet INTEGER,
  year_built INTEGER,
  purchase_price NUMERIC(12,2) NOT NULL,
  purchase_date DATE NOT NULL,
  closing_costs NUMERIC(12,2),
  notes TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Capital Structures Table
-- ============================================

CREATE TABLE capital_structures (
  property_id UUID PRIMARY KEY REFERENCES properties(id) ON DELETE CASCADE,
  cash_invested NUMERIC(12,2) NOT NULL,
  loan_amount NUMERIC(12,2) NOT NULL,
  total_acquisition_cost NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Loans Table
-- ============================================

CREATE TABLE loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  loan_type TEXT NOT NULL,
  original_principal NUMERIC(12,2) NOT NULL,
  interest_rate NUMERIC(5,3) NOT NULL,
  term_months INTEGER NOT NULL,
  origination_date DATE NOT NULL,
  monthly_payment NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  paid_off_date DATE,
  replaced_by_loan_id UUID REFERENCES loans(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Valuation Snapshots Table
-- ============================================

CREATE TABLE valuation_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  effective_date DATE NOT NULL,
  estimated_value NUMERIC(12,2) NOT NULL,
  source TEXT NOT NULL,
  confidence TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(property_id, effective_date, source)
);

-- ============================================
-- Loan Balance Snapshots Table
-- ============================================

CREATE TABLE loan_balance_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID REFERENCES loans(id) ON DELETE CASCADE,
  effective_date DATE NOT NULL,
  principal_balance NUMERIC(12,2) NOT NULL,
  source TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(loan_id, effective_date)
);

-- ============================================
-- Leases Table
-- ============================================

CREATE TABLE leases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  tenant_name TEXT,
  lease_type TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  monthly_rent NUMERIC(10,2) NOT NULL,
  security_deposit NUMERIC(10,2),
  status TEXT NOT NULL DEFAULT 'active',
  renewal_reminder_days INTEGER DEFAULT 60,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Expenses Table
-- ============================================

CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  effective_date DATE NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Indexes for Performance
-- ============================================

CREATE INDEX idx_valuations_property_date ON valuation_snapshots(property_id, effective_date DESC);
CREATE INDEX idx_loan_balances_loan_date ON loan_balance_snapshots(loan_id, effective_date DESC);
CREATE INDEX idx_leases_property_status ON leases(property_id, status);
CREATE INDEX idx_expenses_property_date ON expenses(property_id, effective_date);
CREATE INDEX idx_loans_property_status ON loans(property_id, status);

-- ============================================
-- Enable Row Level Security (Optional for now)
-- ============================================

-- We'll skip RLS for now since you're the only user
-- Can add later for multi-user support
```

**After running**: You should see "Success" message and all tables created!

---

## 🔄 Next Steps After Schema Creation

Once you've completed Steps 1-6, let me know and I'll help you with:

### Step 7: Create Supabase Client
I'll create the configuration files

### Step 8: Build Data Access Layer
I'll create repository functions to read/write data

### Step 9: Migrate Your Mock Data
I'll help you import your 6 properties into Supabase

### Step 10: Update Edit Functionality
I'll connect the edit form to save to Supabase

---

## 📝 Checklist

Before moving forward, complete these:

- [ ] Created Supabase account
- [ ] Created new project
- [ ] Got Project URL and anon key
- [ ] Installed `@supabase/supabase-js` package
- [ ] Created `.env.local` file with credentials
- [ ] Ran the SQL schema in Supabase SQL Editor

---

## 🆘 Common Issues

### "Can't find SQL Editor"
- Look in left sidebar for "SQL Editor" icon (looks like `</>`)
- Or go to: Project → SQL Editor

### "Schema failed to run"
- Make sure you copied the ENTIRE schema
- Check for any copy-paste errors
- Try running table by table if needed

### "Installation failed"
- Make sure you're in the project directory
- Try: `npm cache clean --force` then reinstall

---

## 🎯 Ready to Start?

**Tell me when you've**:
1. Created your Supabase project
2. Got your credentials (URL + key)

**Then I'll**:
1. Create the `.env.local` file for you
2. Set up the Supabase client
3. Build the data access layer
4. Help you migrate your data

**Let's do this step by step - no rush!** 🚀