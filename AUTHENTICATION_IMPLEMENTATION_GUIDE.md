# 🔐 Authentication Implementation Guide

**Purpose**: Add multi-user authentication to your Real Estate Dashboard  
**When to Use**: Before production deployment or when sharing with multiple users  
**Estimated Time**: 4-6 hours  
**Prerequisites**: Supabase project setup complete, data migrated

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Phase 1: Database Migration](#phase-1-database-migration)
3. [Phase 2: Row Level Security (RLS)](#phase-2-row-level-security-rls)
4. [Phase 3: Install Auth Dependencies](#phase-3-install-auth-dependencies)
5. [Phase 4: Update Supabase Client](#phase-4-update-supabase-client)
6. [Phase 5: Create Auth Components](#phase-5-create-auth-components)
7. [Phase 6: Add Middleware Protection](#phase-6-add-middleware-protection)
8. [Phase 7: Update Repository Layer](#phase-7-update-repository-layer)
9. [Phase 8: Migrate Existing Data](#phase-8-migrate-existing-data)
10. [Phase 9: Testing](#phase-9-testing)
11. [Troubleshooting](#troubleshooting)

---

## Overview

### What Changes?

**Before Authentication:**
- Single user (you)
- No login required
- All properties visible to everyone
- No user isolation

**After Authentication:**
- Multiple users supported
- Login/signup required
- Each user sees only their properties
- Full data isolation via RLS

### Architecture Changes

```
┌─────────────────────────────────────┐
│   User Signs In                     │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│   Supabase Auth                     │
│   (Manages sessions & JWT tokens)   │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│   Middleware                        │
│   (Checks auth on every request)    │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│   Repository Layer                  │
│   (Filtered by user_id)             │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│   Database (RLS Policies)           │
│   (Enforces user_id filtering)      │
└─────────────────────────────────────┘
```

---

## Phase 1: Database Migration

### Step 1.1: Add `user_id` Columns

**File**: Create `supabase-migrations/003_add_user_authentication.sql`

```sql
-- ============================================
-- Migration: Add User Authentication Support
-- ============================================
-- This migration adds user_id columns to all tables
-- and enables Row Level Security (RLS) policies

-- Step 1: Add user_id column to properties table
ALTER TABLE properties 
ADD COLUMN user_id UUID REFERENCES auth.users(id) NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';

-- Step 2: Add user_id to capital_structures
ALTER TABLE capital_structures 
ADD COLUMN user_id UUID REFERENCES auth.users(id) NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';

-- Step 3: Add user_id to loans
ALTER TABLE loans 
ADD COLUMN user_id UUID REFERENCES auth.users(id) NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';

-- Step 4: Add user_id to valuation_snapshots
ALTER TABLE valuation_snapshots 
ADD COLUMN user_id UUID REFERENCES auth.users(id) NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';

-- Step 5: Add user_id to loan_balance_snapshots
ALTER TABLE loan_balance_snapshots 
ADD COLUMN user_id UUID REFERENCES auth.users(id) NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';

-- Step 6: Add user_id to leases
ALTER TABLE leases 
ADD COLUMN user_id UUID REFERENCES auth.users(id) NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';

-- Step 7: Add user_id to expenses
ALTER TABLE expenses 
ADD COLUMN user_id UUID REFERENCES auth.users(id) NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';

-- Step 8: Add indexes for performance
CREATE INDEX idx_properties_user_id ON properties(user_id);
CREATE INDEX idx_capital_structures_user_id ON capital_structures(user_id);
CREATE INDEX idx_loans_user_id ON loans(user_id);
CREATE INDEX idx_valuation_snapshots_user_id ON valuation_snapshots(user_id);
CREATE INDEX idx_loan_balance_snapshots_user_id ON loan_balance_snapshots(user_id);
CREATE INDEX idx_leases_user_id ON leases(user_id);
CREATE INDEX idx_expenses_user_id ON expenses(user_id);

COMMENT ON COLUMN properties.user_id IS 'Owner of the property';
COMMENT ON COLUMN capital_structures.user_id IS 'Owner of the capital structure';
COMMENT ON COLUMN loans.user_id IS 'Owner of the loan';
COMMENT ON COLUMN valuation_snapshots.user_id IS 'Owner of the valuation';
COMMENT ON COLUMN loan_balance_snapshots.user_id IS 'Owner of the loan balance';
COMMENT ON COLUMN leases.user_id IS 'Owner of the lease';
COMMENT ON COLUMN expenses.user_id IS 'Owner of the expense';
```

### Step 1.2: Run the Migration

**In Supabase Dashboard:**

1. Go to **SQL Editor**
2. Click **"New query"**
3. Copy and paste the migration SQL above
4. Click **"Run"** (or Cmd+Enter)
5. Verify: "Success. No rows returned"

**Expected Result**: All tables now have a `user_id` column

---

## Phase 2: Row Level Security (RLS)

### Step 2.1: Enable RLS and Create Policies

**File**: Create `supabase-migrations/004_enable_rls_policies.sql`

```sql
-- ============================================
-- Migration: Enable Row Level Security
-- ============================================

-- ============================================
-- PROPERTIES TABLE
-- ============================================

ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own properties
CREATE POLICY "Users can view their own properties" 
ON properties FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Users can insert their own properties
CREATE POLICY "Users can insert their own properties" 
ON properties FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own properties
CREATE POLICY "Users can update their own properties" 
ON properties FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own properties
CREATE POLICY "Users can delete their own properties" 
ON properties FOR DELETE 
USING (auth.uid() = user_id);

-- ============================================
-- CAPITAL_STRUCTURES TABLE
-- ============================================

ALTER TABLE capital_structures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own capital structures" 
ON capital_structures FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own capital structures" 
ON capital_structures FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own capital structures" 
ON capital_structures FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own capital structures" 
ON capital_structures FOR DELETE 
USING (auth.uid() = user_id);

-- ============================================
-- LOANS TABLE
-- ============================================

ALTER TABLE loans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own loans" 
ON loans FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own loans" 
ON loans FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own loans" 
ON loans FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own loans" 
ON loans FOR DELETE 
USING (auth.uid() = user_id);

-- ============================================
-- VALUATION_SNAPSHOTS TABLE
-- ============================================

ALTER TABLE valuation_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own valuations" 
ON valuation_snapshots FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own valuations" 
ON valuation_snapshots FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own valuations" 
ON valuation_snapshots FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own valuations" 
ON valuation_snapshots FOR DELETE 
USING (auth.uid() = user_id);

-- ============================================
-- LOAN_BALANCE_SNAPSHOTS TABLE
-- ============================================

ALTER TABLE loan_balance_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own loan balances" 
ON loan_balance_snapshots FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own loan balances" 
ON loan_balance_snapshots FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own loan balances" 
ON loan_balance_snapshots FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own loan balances" 
ON loan_balance_snapshots FOR DELETE 
USING (auth.uid() = user_id);

-- ============================================
-- LEASES TABLE
-- ============================================

ALTER TABLE leases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own leases" 
ON leases FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own leases" 
ON leases FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own leases" 
ON leases FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own leases" 
ON leases FOR DELETE 
USING (auth.uid() = user_id);

-- ============================================
-- EXPENSES TABLE
-- ============================================

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own expenses" 
ON expenses FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own expenses" 
ON expenses FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expenses" 
ON expenses FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own expenses" 
ON expenses FOR DELETE 
USING (auth.uid() = user_id);
```

### Step 2.2: Run RLS Migration

**In Supabase Dashboard:**

1. Go to **SQL Editor**
2. Click **"New query"**
3. Copy and paste the RLS SQL above
4. Click **"Run"**
5. Verify: "Success. No rows returned"

**Expected Result**: All tables now have RLS enabled with proper policies

---

## Phase 3: Install Auth Dependencies

### Step 3.1: Install Required Packages

```bash
npm install @supabase/auth-helpers-nextjs @supabase/ssr
```

**What these do:**
- `@supabase/auth-helpers-nextjs`: Next.js-specific auth utilities
- `@supabase/ssr`: Server-side rendering auth support

---

## Phase 4: Update Supabase Client

### Step 4.1: Create Browser Client

**File**: `src/lib/supabase/client.ts` (replace existing)

```typescript
/**
 * Supabase Client Configuration
 * 
 * This file creates Supabase clients for both browser and server contexts.
 */

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './database.types';

/**
 * Browser client for client components
 * Automatically manages sessions and cookies
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * Legacy export for backward compatibility
 */
export const supabase = createClient();

/**
 * Check if Supabase is enabled
 */
export const isSupabaseEnabled = (): boolean => {
  return process.env.NEXT_PUBLIC_USE_SUPABASE === 'true';
};
```

### Step 4.2: Create Server Client

**File**: `src/lib/supabase/server.ts` (new file)

```typescript
/**
 * Server-side Supabase Client
 * 
 * Use this in Server Components, Server Actions, and Route Handlers
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './database.types';

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from Server Component - cookies are read-only
          }
        },
      },
    }
  );
}
```

### Step 4.3: Update Database Types

**File**: `src/lib/supabase/database.types.ts` (update properties interface)

Add `user_id` to all table definitions:

```typescript
// In each table's Row interface, add:
user_id: string

// In each table's Insert interface, add:
user_id?: string  // Optional because it can be set automatically

// In each table's Update interface, add:
user_id?: string
```

---

## Phase 5: Create Auth Components

### Step 5.1: Create Login Page

**File**: `src/app/login/page.tsx` (new file)

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600">
              Sign in to your Real Estate Dashboard
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Don't have an account?{' '}
              <a href="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Step 5.2: Create Signup Page

**File**: `src/app/signup/page.tsx` (new file)

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { UserPlus, Mail, Lock, User } from 'lucide-react';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Account Created!
          </h2>
          <p className="text-gray-600 mb-4">
            Check your email to verify your account.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create Account
            </h1>
            <p className="text-gray-600">
              Start managing your real estate portfolio
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSignup} className="space-y-6">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Already have an account?{' '}
              <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Step 5.3: Add Logout Functionality to Sidebar

**File**: Update `src/components/layout/Sidebar.tsx`

Add logout button at the bottom of the sidebar:

```typescript
// At the top, add imports:
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LogOut } from 'lucide-react';

// Inside the component, before the return:
const router = useRouter();
const supabase = createClient();

const handleLogout = async () => {
  await supabase.auth.signOut();
  router.push('/login');
  router.refresh();
};

// Add this at the bottom of your sidebar (before closing </div>):
<div className="mt-auto pt-4 border-t border-gray-200">
  <button
    onClick={handleLogout}
    className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
  >
    <LogOut className="w-5 h-5" />
    <span className="font-medium">Logout</span>
  </button>
</div>
```

---

## Phase 6: Add Middleware Protection

### Step 6.1: Create Auth Middleware

**File**: `src/middleware.ts` (new file at root of src/)

```typescript
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired
  const { data: { user } } = await supabase.auth.getUser();

  // Protected routes
  const isProtectedRoute = !request.nextUrl.pathname.startsWith('/login') &&
                          !request.nextUrl.pathname.startsWith('/signup') &&
                          !request.nextUrl.pathname.startsWith('/_next') &&
                          !request.nextUrl.pathname.startsWith('/api/auth');

  // Redirect to login if not authenticated
  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Redirect to home if authenticated and trying to access login/signup
  if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup')) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

---

## Phase 7: Update Repository Layer

### Step 7.1: Update Properties Repository

**File**: `src/lib/supabase/repositories/properties.repository.ts`

Update all functions to include `user_id`:

```typescript
// Add this helper at the top:
async function getCurrentUserId(supabase: any): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  return user.id;
}

// Update getAllProperties:
export async function getAllProperties(): Promise<PropertyWithRelations[]> {
  const userId = await getCurrentUserId(supabase);
  
  const { data: properties, error: propertiesError } = await supabase
    .from('properties')
    .select('*')
    .eq('user_id', userId)  // ← ADD THIS LINE
    .order('created_at', { ascending: false });

  // ... rest of the function remains the same
}

// Update getPropertyById:
export async function getPropertyById(id: string): Promise<PropertyWithRelations | null> {
  const userId = await getCurrentUserId(supabase);
  
  const { data: property, error: propertyError } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)  // ← ADD THIS LINE
    .single();

  // ... rest of the function remains the same
}

// Update createProperty:
export async function createProperty(data: {
  property: PropertyInsert;
  capitalStructure: Omit<CapitalStructureInsert, 'property_id'>;
  loan?: Omit<LoanInsert, 'property_id'>;
  initialValuation: Omit<ValuationSnapshotInsert, 'property_id'>;
  initialLoanBalance?: Omit<LoanBalanceSnapshotInsert, 'loan_id'>;
  lease?: Omit<LeaseInsert, 'property_id'>;
}): Promise<PropertyWithRelations> {
  const userId = await getCurrentUserId(supabase);
  
  // 1. Create property with user_id
  const { data: property, error: propertyError } = await supabase
    .from('properties')
    .insert({
      ...data.property,
      user_id: userId,  // ← ADD THIS LINE
    })
    .select()
    .single();

  // ... in each subsequent insert, add user_id: userId
  
  // Example for capital structure:
  const { error: capitalError } = await supabase
    .from('capital_structures')
    .insert({
      property_id: property.id,
      user_id: userId,  // ← ADD THIS LINE
      ...data.capitalStructure,
    });

  // Repeat for all other inserts (loans, valuations, leases, etc.)
  // ...
}

// Update updateProperty:
export async function updateProperty(
  id: string,
  updates: PropertyUpdate
): Promise<PropertyRow> {
  const userId = await getCurrentUserId(supabase);
  
  const { data, error } = await supabase
    .from('properties')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', userId)  // ← ADD THIS LINE
    .select()
    .single();

  // ... rest remains the same
}

// Update deleteProperty:
export async function deleteProperty(id: string): Promise<void> {
  const userId = await getCurrentUserId(supabase);
  
  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)  // ← ADD THIS LINE

  // ... rest remains the same
}
```

### Step 7.2: Update Service Layer

**File**: `src/lib/supabase/services/property.service.ts`

The service layer should already work correctly since it delegates to the repository layer, but ensure it properly handles authentication errors:

```typescript
// Add error handling for auth errors:
export async function getAllProperties(): Promise<Property[]> {
  if (!isSupabaseEnabled()) {
    return mockProperties;
  }

  try {
    const data = await propertiesRepository.getAllProperties();
    return data.map(transformSupabaseToProperty);
  } catch (error: any) {
    if (error.message === 'Not authenticated') {
      throw error; // Re-throw auth errors
    }
    console.error('Error fetching properties:', error);
    return [];
  }
}

// Apply similar error handling to other functions
```

---

## Phase 8: Migrate Existing Data

### Step 8.1: Assign Your User ID to Existing Properties

**In Supabase Dashboard:**

1. Create your account through the signup page
2. Get your user ID from **Authentication** → **Users** → Copy the `id` column
3. Go to **SQL Editor**
4. Run this query (replace `YOUR_USER_ID` with your actual ID):

```sql
-- Update all existing properties to your user_id
UPDATE properties 
SET user_id = 'YOUR_USER_ID' 
WHERE user_id = '00000000-0000-0000-0000-000000000000';

UPDATE capital_structures 
SET user_id = 'YOUR_USER_ID' 
WHERE user_id = '00000000-0000-0000-0000-000000000000';

UPDATE loans 
SET user_id = 'YOUR_USER_ID' 
WHERE user_id = '00000000-0000-0000-0000-000000000000';

UPDATE valuation_snapshots 
SET user_id = 'YOUR_USER_ID' 
WHERE user_id = '00000000-0000-0000-0000-000000000000';

UPDATE loan_balance_snapshots 
SET user_id = 'YOUR_USER_ID' 
WHERE user_id = '00000000-0000-0000-0000-000000000000';

UPDATE leases 
SET user_id = 'YOUR_USER_ID' 
WHERE user_id = '00000000-0000-0000-0000-000000000000';

UPDATE expenses 
SET user_id = 'YOUR_USER_ID' 
WHERE user_id = '00000000-0000-0000-0000-000000000000';
```

### Step 8.2: Remove Default Value

After migrating, remove the default value:

```sql
-- Remove default user_id from properties
ALTER TABLE properties ALTER COLUMN user_id DROP DEFAULT;
ALTER TABLE capital_structures ALTER COLUMN user_id DROP DEFAULT;
ALTER TABLE loans ALTER COLUMN user_id DROP DEFAULT;
ALTER TABLE valuation_snapshots ALTER COLUMN user_id DROP DEFAULT;
ALTER TABLE loan_balance_snapshots ALTER COLUMN user_id DROP DEFAULT;
ALTER TABLE leases ALTER COLUMN user_id DROP DEFAULT;
ALTER TABLE expenses ALTER COLUMN user_id DROP DEFAULT;
```

---

## Phase 9: Testing

### Step 9.1: Test Authentication Flow

1. **Restart Dev Server:**
   ```bash
   npm run dev
   ```

2. **Test Signup:**
   - Go to `http://localhost:3000/signup`
   - Create a new account
   - Check email for verification

3. **Test Login:**
   - Go to `http://localhost:3000/login`
   - Login with your credentials
   - Should redirect to dashboard

4. **Test Protected Routes:**
   - Try accessing `/properties` without logging in
   - Should redirect to login

5. **Test Logout:**
   - Click logout button
   - Should clear session and redirect to login

### Step 9.2: Test Data Isolation

1. **Login as User 1:**
   - Create a test property
   - Note the property ID

2. **Logout and create User 2:**
   - Signup with a different email
   - Login as User 2
   - Verify you can't see User 1's properties

3. **Try Direct Access:**
   - As User 2, try to access User 1's property by ID
   - Should return "not found" or redirect

### Step 9.3: Test CRUD Operations

- **Create**: Add new property (should have your user_id)
- **Read**: View all properties (should only see yours)
- **Update**: Edit a property (should only work on yours)
- **Delete**: Delete a property (should only work on yours)

---

## Troubleshooting

### Common Issues

#### "Not authenticated" error

**Cause**: Session expired or not set  
**Fix**: 
```typescript
// Check if user is logged in
const { data: { user } } = await supabase.auth.getUser();
console.log('User:', user);
```

#### RLS blocks all queries

**Cause**: RLS policies not set correctly  
**Fix**: 
```sql
-- Check if policies exist
SELECT * FROM pg_policies WHERE tablename = 'properties';

-- Temporarily disable RLS to test (dev only!)
ALTER TABLE properties DISABLE ROW LEVEL SECURITY;
```

#### Middleware redirect loop

**Cause**: Middleware redirecting authenticated users incorrectly  
**Fix**: Check the matcher pattern excludes static files and API routes

#### Can't see existing data after enabling RLS

**Cause**: Data not assigned to your user_id  
**Fix**: Run Phase 8 migration again with correct user ID

### Debug Commands

```sql
-- Check your user ID
SELECT id, email FROM auth.users;

-- Check property ownership
SELECT id, address, user_id FROM properties;

-- Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

---

## Next Steps After Implementation

1. **Email Verification**: Configure email templates in Supabase
2. **Password Reset**: Add forgot password functionality
3. **Profile Management**: Allow users to update email/password
4. **OAuth**: Add Google/GitHub login
5. **Team Features**: Add organization/team support (future)

---

## Summary Checklist

Use this checklist when implementing:

- [ ] Run database migration (add `user_id` columns)
- [ ] Enable RLS and create policies
- [ ] Install `@supabase/auth-helpers-nextjs` and `@supabase/ssr`
- [ ] Update Supabase client for browser/server
- [ ] Create login page
- [ ] Create signup page
- [ ] Add logout functionality
- [ ] Create middleware for route protection
- [ ] Update repository layer with `user_id` filtering
- [ ] Update service layer error handling
- [ ] Migrate existing data to your user
- [ ] Remove default `user_id` value
- [ ] Test signup flow
- [ ] Test login flow
- [ ] Test logout flow
- [ ] Test data isolation between users
- [ ] Test CRUD operations

---

**Estimated Total Time**: 4-6 hours

**Difficulty**: Intermediate

**When to Do This**: Before production launch or when adding additional users

---

Good luck with implementation! Keep this guide handy when you're ready to add authentication. 🚀
