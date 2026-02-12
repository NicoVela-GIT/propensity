# FRED Service Integration Guide

## Overview

This guide explains how the FRED API service integrates with the alert system to provide refinance opportunity alerts.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Alert System Flow                        │
└─────────────────────────────────────────────────────────────┘

1. Data Collection (Weekly Job)
   ┌──────────────┐
   │  FRED API    │ ──→ Fetch latest mortgage rates
   └──────────────┘
          ↓
   ┌──────────────┐
   │ market_data  │ ──→ Store rates in database
   │    table     │
   └──────────────┘

2. Alert Generation (Daily Job)
   ┌──────────────┐
   │ properties   │ ──→ Get all properties with loans
   │    table     │
   └──────────────┘
          ↓
   ┌──────────────┐
   │ Alert Engine │ ──→ Check refinance opportunities
   └──────────────┘
          ↓
   ┌──────────────┐
   │ generated_   │ ──→ Store alerts
   │   alerts     │
   └──────────────┘

3. User Interface
   ┌──────────────┐
   │  Dashboard   │ ──→ Display alerts
   └──────────────┘
          ↓
   ┌──────────────┐
   │ Alert Detail │ ──→ Show refinance details
   │     Page     │
   └──────────────┘
```

## Implementation Steps

### ✅ Step 1: FRED Service (COMPLETED)

The FRED service is now implemented with the following capabilities:

- Fetch latest mortgage rates
- Historical rate data
- Rate comparison and analysis
- Refinance opportunity detection

**Files created:**
- `src/lib/services/fred.service.ts` - Core service
- `src/lib/services/index.ts` - Export index
- `src/lib/services/__tests__/fred.service.test.ts` - Test suite
- `src/lib/services/examples/fred-usage-examples.ts` - Usage examples

### ⏳ Step 2: Market Data Repository (TODO)

Create a repository to store FRED data in the database.

**File to create:** `src/lib/supabase/repositories/market-data.repository.ts`

```typescript
/**
 * Market Data Repository
 * 
 * Manages storage and retrieval of external market data (rates, HPI, etc.)
 */

import { supabase } from '../client';

export interface MarketDataInsert {
  data_type: 'mortgage_rate' | 'hpi';
  region_type: 'national' | 'state' | 'metro' | 'zip3';
  region_code: string;
  series_id?: string;
  effective_date: string; // YYYY-MM-DD
  value: number;
  metadata?: Record<string, any>;
}

/**
 * Store or update market data
 */
export async function upsertMarketData(data: MarketDataInsert[]) {
  const { data: result, error } = await supabase
    .from('market_data')
    .upsert(data, {
      onConflict: 'data_type,region_type,region_code,effective_date',
    });

  if (error) {
    throw new Error(`Failed to upsert market data: ${error.message}`);
  }

  return result;
}

/**
 * Get latest mortgage rate from database
 */
export async function getLatestMortgageRate(seriesId: string = 'MORTGAGE30US') {
  const { data, error } = await supabase
    .from('market_data')
    .select('*')
    .eq('data_type', 'mortgage_rate')
    .eq('series_id', seriesId)
    .order('effective_date', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    throw new Error(`Failed to fetch latest rate: ${error.message}`);
  }

  return data;
}

/**
 * Get mortgage rate history from database
 */
export async function getMortgageRateHistory(
  seriesId: string,
  startDate: string,
  endDate?: string
) {
  let query = supabase
    .from('market_data')
    .select('*')
    .eq('data_type', 'mortgage_rate')
    .eq('series_id', seriesId)
    .gte('effective_date', startDate)
    .order('effective_date', { ascending: true });

  if (endDate) {
    query = query.lte('effective_date', endDate);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch rate history: ${error.message}`);
  }

  return data;
}
```

### ⏳ Step 3: Weekly Rate Update Job (TODO)

Create a scheduled job to fetch and store rates weekly.

**File to create:** `src/lib/jobs/update-mortgage-rates.ts`

```typescript
/**
 * Weekly Mortgage Rate Update Job
 * 
 * Fetches latest rates from FRED API and stores in database.
 * Run weekly (e.g., every Friday after FRED updates).
 */

import { getAllCurrentMortgageRates } from '../services/fred.service';
import { upsertMarketData } from '../supabase/repositories/market-data.repository';

export async function updateMortgageRates() {
  console.log('[Job] Starting weekly mortgage rate update...');

  try {
    // Fetch latest rates from FRED
    const rates = await getAllCurrentMortgageRates();

    // Prepare data for database
    const updates = [];

    if (rates.thirtyYear) {
      updates.push({
        data_type: 'mortgage_rate' as const,
        region_type: 'national' as const,
        region_code: 'US',
        series_id: 'MORTGAGE30US',
        effective_date: rates.thirtyYear.date.toISOString().split('T')[0],
        value: rates.thirtyYear.rate,
        metadata: {
          term: '30-year',
          type: 'fixed',
          source: 'FRED',
        },
      });
    }

    if (rates.fifteenYear) {
      updates.push({
        data_type: 'mortgage_rate' as const,
        region_type: 'national' as const,
        region_code: 'US',
        series_id: 'MORTGAGE15US',
        effective_date: rates.fifteenYear.date.toISOString().split('T')[0],
        value: rates.fifteenYear.rate,
        metadata: {
          term: '15-year',
          type: 'fixed',
          source: 'FRED',
        },
      });
    }

    if (rates.fiveOneARM) {
      updates.push({
        data_type: 'mortgage_rate' as const,
        region_type: 'national' as const,
        region_code: 'US',
        series_id: 'MORTGAGE5US',
        effective_date: rates.fiveOneARM.date.toISOString().split('T')[0],
        value: rates.fiveOneARM.rate,
        metadata: {
          term: '5/1',
          type: 'arm',
          source: 'FRED',
        },
      });
    }

    // Store in database
    await upsertMarketData(updates);

    console.log(`[Job] Successfully updated ${updates.length} mortgage rates`);

    return {
      success: true,
      updatesCount: updates.length,
    };
  } catch (error) {
    console.error('[Job] Failed to update mortgage rates:', error);
    throw error;
  }
}

// Schedule with cron (example using node-cron)
// import cron from 'node-cron';
// 
// // Run every Friday at 6 PM (after FRED updates)
// cron.schedule('0 18 * * 5', async () => {
//   await updateMortgageRates();
// });
```

### ⏳ Step 4: Refinance Alert Generator (TODO)

Create the alert generation logic for refinance opportunities.

**File to create:** `src/lib/alerts/generators/refinance-alert.generator.ts`

```typescript
/**
 * Refinance Alert Generator
 * 
 * Generates refinance opportunity alerts by comparing property loan rates
 * against current market rates from FRED.
 */

import { checkRefinanceOpportunity } from '../../services/fred.service';
import { generateAlertId } from '../../domain/alerts';
import type { PropertyWithRelations } from '../../supabase/repositories/properties.repository';

export interface RefinanceAlert {
  id: string;
  ruleId: string;
  propertyId: string;
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  estimatedValue: number;
  triggeredAt: Date;
  metadata: {
    currentRate: number;
    marketRate: number;
    rateDifference: number;
    estimatedMonthlySavings: number;
    estimatedAnnualSavings: number;
    equityPercentage: number;
  };
}

/**
 * Generate refinance alert for a single property
 */
export async function generateRefinanceAlert(
  property: PropertyWithRelations,
  ruleId: string = 'refinance_opportunity_rule',
  thresholdDifference: number = 0.75,
  minimumEquity: number = 20
): Promise<RefinanceAlert | null> {
  // Get active loan
  const activeLoan = property.loans.find(l => l.status === 'active');
  
  if (!activeLoan || !activeLoan.interest_rate) {
    return null; // No loan or missing interest rate
  }

  try {
    // Check for refinance opportunity
    const opportunity = await checkRefinanceOpportunity(
      activeLoan.interest_rate,
      new Date(activeLoan.origination_date),
      'MORTGAGE30US',
      thresholdDifference
    );

    if (!opportunity.isOpportunity) {
      return null; // No opportunity
    }

    // Calculate equity percentage
    const currentValue = property.valuations[0]?.estimated_value || property.property.purchase_price;
    const loanBalance = property.loanBalances[0]?.principal_balance || activeLoan.original_principal;
    const equityPercentage = ((currentValue - loanBalance) / currentValue) * 100;

    // Require minimum equity
    if (equityPercentage < minimumEquity) {
      return null;
    }

    // Calculate estimated savings
    const monthlyPayment = activeLoan.monthly_payment;
    const savingsPercentage = opportunity.potentialSavings / activeLoan.interest_rate;
    const estimatedMonthlySavings = monthlyPayment * savingsPercentage;
    const estimatedAnnualSavings = estimatedMonthlySavings * 12;

    // Determine severity
    const severity = opportunity.potentialSavings >= 1.5 
      ? 'high' 
      : opportunity.potentialSavings >= 1.0 
      ? 'medium' 
      : 'low';

    // Generate alert
    return {
      id: generateAlertId(ruleId, property.property.id, new Date()),
      ruleId,
      propertyId: property.property.id,
      severity,
      title: 'Refinance Opportunity',
      description: `Current mortgage rates are ${opportunity.potentialSavings.toFixed(2)}% lower than your loan rate. You could save approximately $${Math.round(estimatedMonthlySavings)}/month by refinancing.`,
      estimatedValue: Math.round(estimatedAnnualSavings),
      triggeredAt: new Date(),
      metadata: {
        currentRate: activeLoan.interest_rate,
        marketRate: opportunity.currentMarketRate!,
        rateDifference: opportunity.potentialSavings,
        estimatedMonthlySavings: Math.round(estimatedMonthlySavings),
        estimatedAnnualSavings: Math.round(estimatedAnnualSavings),
        equityPercentage: Math.round(equityPercentage * 10) / 10,
      },
    };
  } catch (error) {
    console.error(`Error generating refinance alert for property ${property.property.id}:`, error);
    return null;
  }
}

/**
 * Generate refinance alerts for all properties
 */
export async function generateRefinanceAlertsForPortfolio(
  properties: PropertyWithRelations[]
): Promise<RefinanceAlert[]> {
  const alerts: RefinanceAlert[] = [];

  for (const property of properties) {
    const alert = await generateRefinanceAlert(property);
    if (alert) {
      alerts.push(alert);
    }
  }

  return alerts;
}
```

### ⏳ Step 5: Daily Alert Generation Job (TODO)

Create a scheduled job to generate alerts daily.

**File to create:** `src/lib/jobs/generate-alerts.ts`

```typescript
/**
 * Daily Alert Generation Job
 * 
 * Runs all alert generators and stores results in database.
 */

import { getAllProperties } from '../supabase/repositories/properties.repository';
import { generateRefinanceAlertsForPortfolio } from '../alerts/generators/refinance-alert.generator';
import { supabase } from '../supabase/client';

export async function generateAllAlerts() {
  console.log('[Job] Starting daily alert generation...');

  try {
    // Fetch all properties
    const properties = await getAllProperties();
    console.log(`[Job] Analyzing ${properties.length} properties...`);

    // Generate refinance alerts
    const refinanceAlerts = await generateRefinanceAlertsForPortfolio(properties);
    console.log(`[Job] Generated ${refinanceAlerts.length} refinance alerts`);

    // Store alerts in database
    if (refinanceAlerts.length > 0) {
      const { error } = await supabase
        .from('generated_alerts')
        .upsert(
          refinanceAlerts.map(alert => ({
            id: alert.id,
            rule_id: alert.ruleId,
            property_id: alert.propertyId,
            severity: alert.severity,
            title: alert.title,
            description: alert.description,
            estimated_value: alert.estimatedValue,
            triggered_at: alert.triggeredAt.toISOString(),
            metadata: alert.metadata,
          })),
          {
            onConflict: 'id',
          }
        );

      if (error) {
        throw new Error(`Failed to store alerts: ${error.message}`);
      }
    }

    console.log('[Job] Alert generation completed successfully');

    return {
      success: true,
      refinanceAlerts: refinanceAlerts.length,
      totalAlerts: refinanceAlerts.length,
    };
  } catch (error) {
    console.error('[Job] Failed to generate alerts:', error);
    throw error;
  }
}

// Schedule with cron (example using node-cron)
// import cron from 'node-cron';
// 
// // Run daily at 6 AM
// cron.schedule('0 6 * * *', async () => {
//   await generateAllAlerts();
// });
```

## Testing the Integration

### 1. Test FRED Service

```bash
npx tsx src/lib/services/__tests__/fred.service.test.ts
```

### 2. Test Rate Update Job (Manual)

```typescript
// Create a test script: scripts/test-rate-update.ts
import { updateMortgageRates } from '../src/lib/jobs/update-mortgage-rates';

async function test() {
  const result = await updateMortgageRates();
  console.log('Result:', result);
}

test();
```

Run:
```bash
npx tsx scripts/test-rate-update.ts
```

### 3. Test Alert Generation (Manual)

```typescript
// Create a test script: scripts/test-alert-generation.ts
import { generateAllAlerts } from '../src/lib/jobs/generate-alerts';

async function test() {
  const result = await generateAllAlerts();
  console.log('Result:', result);
}

test();
```

Run:
```bash
npx tsx scripts/test-alert-generation.ts
```

## Deployment Considerations

### Environment Variables

Ensure the following are set in production:

```bash
# FRED API
FRED_API_KEY=your_production_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_production_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_key
```

### Scheduling Options

#### Option 1: Vercel Cron Jobs

Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/jobs/update-rates",
      "schedule": "0 18 * * 5"
    },
    {
      "path": "/api/jobs/generate-alerts",
      "schedule": "0 6 * * *"
    }
  ]
}
```

#### Option 2: GitHub Actions

Create `.github/workflows/scheduled-jobs.yml`:

```yaml
name: Scheduled Jobs

on:
  schedule:
    - cron: '0 18 * * 5'  # Weekly rate update
    - cron: '0 6 * * *'    # Daily alert generation

jobs:
  run-jobs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run jobs
        run: |
          npm install
          npm run jobs
```

#### Option 3: External Cron Service

Use services like:
- **Cron-job.org** (free)
- **EasyCron** (free tier)
- **AWS EventBridge**

## Monitoring

### Log Important Events

```typescript
// Add to your logging service
console.log('[FRED] Rate update completed', {
  timestamp: new Date().toISOString(),
  ratesUpdated: 3,
  success: true,
});

console.log('[Alerts] Generated refinance alerts', {
  timestamp: new Date().toISOString(),
  alertCount: 5,
  propertiesAnalyzed: 20,
});
```

### Error Tracking

Integrate with error tracking services:
- **Sentry**
- **LogRocket**
- **Datadog**

## Next Steps

1. ✅ FRED service implemented
2. ⏳ Create market_data repository
3. ⏳ Build weekly rate update job
4. ⏳ Build refinance alert generator
5. ⏳ Build daily alert generation job
6. ⏳ Create API routes for jobs
7. ⏳ Set up scheduling (Vercel Cron or GitHub Actions)
8. ⏳ Add UI components to display alerts
9. ⏳ Test end-to-end flow
10. ⏳ Deploy to production

## Resources

- [FRED API Documentation](https://fred.stlouisfed.org/docs/api/fred/)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
- [GitHub Actions Scheduled Events](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#schedule)
- [Alert System Plan](./alert_system_implementation_ac1d3544.plan.md)
