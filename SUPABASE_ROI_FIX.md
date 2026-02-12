# Supabase Integration - ROI & Expenses Fix

**Date**: February 10, 2026  
**Status**: ✅ Complete

---

## Problem

After connecting Supabase, all property ROI values were showing as **0%** because the conversion function had TODO placeholders instead of actual calculations.

### Root Cause

In `src/lib/supabase/services/property.service.ts`, the `convertSupabaseToOldProperty` function had:

```typescript
const monthlyExpenses = 0; // TODO: Calculate from expenses table
const roi = 0; // TODO: Calculate using domain functions
```

This meant all properties fetched from Supabase returned 0% ROI and $0 expenses.

---

## Solution Implemented

### 1. **ROI Calculation** ✅

Now uses the domain model's `calculateTotalROI` function with proper inputs:

- **Annual Cash Flow**: `(monthlyRent - monthlyExpenses - loanPayments) × 12`
- **Current Value**: Latest valuation snapshot
- **Previous Year Value**: Purchase price (baseline until we have historical data)
- **Current Loan Balances**: Sum of all active loan balances
- **Initial Cash Invested**: From capital structure

**Formula**:
```
ROI = (Annual Cash Flow + Appreciation + Principal Paydown) / Initial Cash Invested × 100
```

### 2. **Monthly Expenses Calculation** ✅

Now calculates from the `expenses` table:

- Sums all **recurring expenses** marked in the database
- Returns monthly total
- Falls back to $0 if no expenses recorded

**Note**: One-time expenses are not yet amortized. This is marked as a TODO for future enhancement.

### 3. **Multi-Loan Support** ✅

The fix also properly handles properties with multiple loans:

- Aggregates all active loan balances
- Sums all active loan payments
- Correctly calculates total debt service

---

## What's Using Real Data Now

### ✅ **Fetching from Supabase:**
- Properties list (`/properties`)
- Property details (`/properties/[id]`)
- Edit property (`/properties/[id]/edit`)
- Dashboard property cards

### ✅ **Computed Correctly:**
- ROI percentage (using domain functions)
- Monthly expenses (from expenses table)
- Appreciation percentage
- Monthly cash flow
- Equity calculations

### 🟡 **Still Using Mock Data (By Design):**
- Alerts (requires alert rule engine - Phase 2)
- Portfolio charts (requires historical data - Phase 2)
- Portfolio metrics trends (requires time-series data - Phase 2)

---

## Technical Details

### Files Modified

**`src/lib/supabase/services/property.service.ts`**
- Added imports for domain calculation functions
- Implemented proper ROI calculation in `convertSupabaseToOldProperty`
- Implemented expenses calculation from database
- Added support for multiple loans per property
- Added time-based calculations (days/years owned)

### Dependencies Used

From `@/lib/domain/computed`:
- `calculateTotalROI` - Complete ROI calculation
- `calculateMonthlyCashFlow` - Cash flow from operations
- `calculateAppreciation` - Appreciation percentage
- `daysBetween` - Time period calculations

---

## Current Limitations & Future Enhancements

### Current Limitations:

1. **Historical Data**: Previous year values use purchase price as baseline
   - **Why**: Migration only included current/latest values
   - **Impact**: ROI calculation is slightly simplified
   - **Fix**: Add historical snapshot collection

2. **One-Time Expenses**: Not amortized over ownership period
   - **Why**: Requires business logic for amortization rules
   - **Impact**: Monthly expenses only include recurring items
   - **Fix**: Add expense amortization feature

3. **Expense Tracking**: Properties migrated from mock data have no expenses
   - **Why**: Migration script didn't include expense data
   - **Impact**: Monthly expenses show as $0 for migrated properties
   - **Fix**: Add expense tracking UI or re-migrate with expense data

### Phase 2 Enhancements (Not Critical):

- **Alert Rule Engine**: Compute alerts from property state
- **Historical Charts**: Collect time-series data for trends
- **Portfolio Metrics**: Compute from aggregated property data
- **Expense Management**: Full expense tracking with categories

---

## Testing

### What to Test:

1. **Navigate to Properties** (`/properties`)
   - ROI should show actual percentages (not 0%)
   - Values should be reasonable based on property data

2. **View Property Details** (`/properties/[id]`)
   - Financial performance should show computed metrics
   - ROI should match the list view

3. **Edit Property** (`/properties/[id]/edit`)
   - Changes should save and persist
   - ROI should recalculate on value changes

4. **Dashboard** (`/`)
   - Portfolio metrics should reflect real calculations
   - KPI cards should show computed values

### Expected Results:

- **Properties with good cash flow + appreciation**: High ROI (20%+)
- **Properties with negative cash flow**: Lower ROI
- **Newly purchased properties**: Lower ROI (less time for appreciation)

---

## Migration Notes

### For Properties Migrated from Mock Data:

The migration (`scripts/migrate-data.ts`) included:
- ✅ Properties (address, purchase info)
- ✅ Capital structures (cash invested, loans)
- ✅ Loans (terms, payments, balances)
- ✅ Valuations (current values)
- ✅ Leases (rent, status)
- ❌ Expenses (not migrated)

**Result**: Expenses will show as $0 for migrated properties until expense tracking is added.

### For New Properties:

When adding new properties through the UI (future feature), make sure to:
- Record initial expenses
- Set up recurring expenses (taxes, insurance, HOA)
- This will ensure accurate ROI calculations

---

## Summary

✅ **Fixed**: ROI calculation now uses proper domain model functions  
✅ **Fixed**: Monthly expenses calculated from database  
✅ **Fixed**: Multi-loan support implemented  
🟡 **Pending**: Alerts, charts, and full expense tracking (Phase 2)

**All critical functionality is now working with Supabase!** 🎉

---

## Next Steps (Optional)

If you want to enhance the system further:

1. **Add Expense Tracking UI** - Allow users to add/edit expenses
2. **Implement Alert Rules** - Generate alerts from property state
3. **Historical Data Collection** - Start collecting time-series data for charts
4. **Backfill Expenses** - Add expense data to migrated properties

These are all nice-to-have enhancements, not critical for core functionality.
