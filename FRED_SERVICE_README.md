# FRED API Service Documentation

## Overview

The FRED (Federal Reserve Economic Data) service provides real-time mortgage interest rate data from the St. Louis Federal Reserve. This service is a core component of the alert system, enabling refinance opportunity detection.

## Features

- ✅ Fetch latest mortgage rates (30-year, 15-year, 5/1 ARM)
- ✅ Historical rate data with date range queries
- ✅ Rate difference calculations for refinance analysis
- ✅ Automated refinance opportunity detection
- ✅ Built-in caching (1-hour revalidation)
- ✅ Comprehensive error handling
- ✅ TypeScript type safety

## Setup

### 1. Get a FRED API Key (Free)

1. Visit: https://fred.stlouisfed.org/docs/api/api_key.html
2. Create a free account
3. Request an API key (instant approval)
4. Copy your API key

### 2. Configure Environment Variable

Add your API key to `.env.local`:

```bash
FRED_API_KEY=your_actual_api_key_here
```

### 3. Verify Installation

Run the test suite to verify everything works:

```bash
npx tsx src/lib/services/__tests__/fred.service.test.ts
```

## API Reference

### `getLatestMortgageRate(seriesId?)`

Fetch the most recent mortgage rate for a specific series.

**Parameters:**
- `seriesId` (optional): `'MORTGAGE30US'` | `'MORTGAGE15US'` | `'MORTGAGE5US'`
  - Default: `'MORTGAGE30US'`

**Returns:** `Promise<MortgageRate | null>`

**Example:**

```typescript
import { getLatestMortgageRate } from '@/lib/services/fred.service';

const rate = await getLatestMortgageRate('MORTGAGE30US');
console.log(`Current 30-year rate: ${rate?.rate}%`);
// Output: Current 30-year rate: 6.82%
```

---

### `getMortgageRateHistory(seriesId?, startDate?, endDate?)`

Fetch historical mortgage rates for a date range.

**Parameters:**
- `seriesId` (optional): Mortgage rate series
- `startDate` (optional): Start date (string `'YYYY-MM-DD'` or `Date` object)
- `endDate` (optional): End date (string `'YYYY-MM-DD'` or `Date` object)

**Returns:** `Promise<MortgageRate[]>`

**Example:**

```typescript
import { getMortgageRateHistory } from '@/lib/services/fred.service';

// Get last 90 days of rates
const ninetyDaysAgo = new Date();
ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

const rates = await getMortgageRateHistory('MORTGAGE30US', ninetyDaysAgo);
console.log(`Fetched ${rates.length} rate observations`);

// Find min/max rates in period
const minRate = Math.min(...rates.map(r => r.rate));
const maxRate = Math.max(...rates.map(r => r.rate));
console.log(`Rate range: ${minRate}% - ${maxRate}%`);
```

---

### `getAllCurrentMortgageRates()`

Fetch the latest rates for all mortgage types (30-year, 15-year, 5/1 ARM).

**Returns:** `Promise<{ thirtyYear, fifteenYear, fiveOneARM }>`

**Example:**

```typescript
import { getAllCurrentMortgageRates } from '@/lib/services/fred.service';

const rates = await getAllCurrentMortgageRates();

console.log('Current Rates:');
console.log(`30-Year Fixed: ${rates.thirtyYear?.rate}%`);
console.log(`15-Year Fixed: ${rates.fifteenYear?.rate}%`);
console.log(`5/1 ARM: ${rates.fiveOneARM?.rate}%`);
```

---

### `calculateRateDifference(seriesId, originalDate, comparisonDate?)`

Calculate the rate difference between two dates.

**Parameters:**
- `seriesId`: Mortgage rate series
- `originalDate`: Date of original loan
- `comparisonDate` (optional): Date to compare (defaults to latest)

**Returns:** `Promise<number>` (positive = rates decreased)

**Example:**

```typescript
import { calculateRateDifference } from '@/lib/services/fred.service';

const loanDate = new Date('2022-01-15');
const difference = await calculateRateDifference('MORTGAGE30US', loanDate);

if (difference > 0.75) {
  console.log(`Refinance opportunity! Rates dropped ${difference.toFixed(2)}%`);
}
```

---

### `checkRefinanceOpportunity(currentRate, loanDate, seriesId?, threshold?)`

Check if a property qualifies for refinancing based on rate difference.

**Parameters:**
- `currentRate`: Property's current mortgage interest rate (%)
- `loanDate`: When the loan was originated
- `seriesId` (optional): Mortgage rate series (default: `'MORTGAGE30US'`)
- `threshold` (optional): Minimum rate difference to trigger (default: `0.75`)

**Returns:** `Promise<{ isOpportunity, currentMarketRate, rateDifference, potentialSavings }>`

**Example:**

```typescript
import { checkRefinanceOpportunity } from '@/lib/services/fred.service';

const opportunity = await checkRefinanceOpportunity(
  6.5,                          // Current loan rate
  new Date('2022-06-01'),       // Loan origination date
  'MORTGAGE30US',               // 30-year fixed
  0.75                          // 0.75% threshold
);

if (opportunity.isOpportunity) {
  console.log(`💰 Save ${opportunity.potentialSavings.toFixed(2)}% by refinancing!`);
  console.log(`Current market rate: ${opportunity.currentMarketRate}%`);
}
```

## Data Types

### `MortgageRate`

```typescript
interface MortgageRate {
  date: Date;           // Observation date
  rate: number;         // Interest rate percentage (e.g., 6.82)
  seriesId: string;     // FRED series ID
}
```

### `MortgageRateSeries`

```typescript
type MortgageRateSeries = 
  | 'MORTGAGE30US'   // 30-year fixed rate mortgage
  | 'MORTGAGE15US'   // 15-year fixed rate mortgage
  | 'MORTGAGE5US';   // 5/1 adjustable rate mortgage
```

## Integration with Alert System

### Refinance Alert Generation

The FRED service integrates with the alert system to automatically detect refinance opportunities:

```typescript
import { checkRefinanceOpportunity } from '@/lib/services/fred.service';
import { generateAlertId } from '@/lib/domain/alerts';

async function generateRefinanceAlert(property: Property) {
  // Get loan details from property
  const activeLoan = property.loans.find(l => l.status === 'active');
  if (!activeLoan || !activeLoan.interest_rate) {
    return null; // No loan or missing interest rate
  }

  // Check for refinance opportunity
  const opportunity = await checkRefinanceOpportunity(
    activeLoan.interest_rate,
    new Date(activeLoan.origination_date),
    'MORTGAGE30US',
    0.75 // Alert threshold: 0.75% rate drop
  );

  if (!opportunity.isOpportunity) {
    return null; // No opportunity
  }

  // Calculate equity percentage
  const currentValue = property.valuations[0]?.estimated_value || property.purchase_price;
  const loanBalance = property.loanBalances[0]?.principal_balance || activeLoan.original_principal;
  const equityPercentage = ((currentValue - loanBalance) / currentValue) * 100;

  // Require at least 20% equity
  if (equityPercentage < 20) {
    return null;
  }

  // Calculate estimated monthly savings
  const monthlyPayment = activeLoan.monthly_payment;
  const savingsPercentage = opportunity.potentialSavings / activeLoan.interest_rate;
  const estimatedMonthlySavings = monthlyPayment * savingsPercentage;
  const estimatedAnnualSavings = estimatedMonthlySavings * 12;

  // Generate alert
  return {
    id: generateAlertId('refinance_opportunity', property.id, new Date()),
    ruleId: 'refinance_opportunity_rule',
    propertyId: property.id,
    severity: opportunity.potentialSavings >= 1.5 ? 'high' : 'medium',
    title: 'Refinance Opportunity',
    description: `Current rates are ${opportunity.potentialSavings.toFixed(2)}% lower than your mortgage. You could save approximately $${estimatedMonthlySavings.toFixed(0)}/month.`,
    estimatedValue: estimatedAnnualSavings,
    triggeredAt: new Date(),
  };
}
```

## Caching Strategy

The service uses Next.js's built-in caching with a 1-hour revalidation period:

```typescript
fetch(url, {
  next: { revalidate: 3600 }, // Cache for 1 hour
});
```

This means:
- First request fetches from FRED API
- Subsequent requests within 1 hour use cached data
- After 1 hour, Next.js revalidates in the background
- Reduces API calls and improves performance

## Rate Limits

FRED API has generous rate limits:
- **120 requests per minute**
- **No daily limit**

With 1-hour caching, typical usage will be well below limits.

## Error Handling

The service includes comprehensive error handling:

```typescript
try {
  const rate = await getLatestMortgageRate();
} catch (error) {
  if (error.message.includes('FRED_API_KEY')) {
    // API key not configured
    console.error('Please configure FRED_API_KEY in .env.local');
  } else if (error.message.includes('failed')) {
    // Network or API error
    console.error('Failed to fetch from FRED API:', error);
  }
}
```

## Testing

Run the comprehensive test suite:

```bash
npx tsx src/lib/services/__tests__/fred.service.test.ts
```

The test suite validates:
- ✅ Latest rate fetching
- ✅ Historical data retrieval
- ✅ All rate types (30-year, 15-year, ARM)
- ✅ Rate difference calculations
- ✅ Refinance opportunity detection
- ✅ Error handling

## Data Sources

### MORTGAGE30US - 30-Year Fixed Rate Mortgage Average
- **Update Frequency**: Weekly (Thursday)
- **Source**: Freddie Mac Primary Mortgage Market Survey
- **Coverage**: 1971-present
- **URL**: https://fred.stlouisfed.org/series/MORTGAGE30US

### MORTGAGE15US - 15-Year Fixed Rate Mortgage Average
- **Update Frequency**: Weekly (Thursday)
- **Source**: Freddie Mac Primary Mortgage Market Survey
- **Coverage**: 1991-present
- **URL**: https://fred.stlouisfed.org/series/MORTGAGE15US

### MORTGAGE5US - 5/1-Year Adjustable Rate Mortgage Average
- **Update Frequency**: Weekly (Thursday)
- **Source**: Freddie Mac Primary Mortgage Market Survey
- **Coverage**: 2005-present
- **URL**: https://fred.stlouisfed.org/series/MORTGAGE5US

## Best Practices

### 1. Always Check for Null Returns

```typescript
const rate = await getLatestMortgageRate();
if (!rate) {
  console.log('No rate data available');
  return;
}
```

### 2. Handle Errors Gracefully

```typescript
try {
  const rates = await getAllCurrentMortgageRates();
} catch (error) {
  // Fallback to cached data or show user-friendly message
  console.error('Unable to fetch current rates:', error);
}
```

### 3. Use Appropriate Date Ranges

```typescript
// Good: Specific date range
const lastYear = new Date();
lastYear.setFullYear(lastYear.getFullYear() - 1);
const rates = await getMortgageRateHistory('MORTGAGE30US', lastYear);

// Avoid: Fetching entire history (slow, unnecessary)
const allRates = await getMortgageRateHistory('MORTGAGE30US');
```

### 4. Cache Results When Possible

```typescript
// Cache rates at the application level for repeated use
let cachedRates: MortgageRate[] | null = null;
let cacheTime: number = 0;

async function getCachedRates() {
  const now = Date.now();
  if (cachedRates && now - cacheTime < 3600000) { // 1 hour
    return cachedRates;
  }
  
  cachedRates = await getMortgageRateHistory('MORTGAGE30US', /* ... */);
  cacheTime = now;
  return cachedRates;
}
```

## Troubleshooting

### Issue: "Missing env.FRED_API_KEY"

**Solution:** Add your API key to `.env.local`:

```bash
FRED_API_KEY=your_actual_api_key_here
```

### Issue: "FRED API request failed: 400"

**Possible causes:**
- Invalid series ID
- Malformed date parameters
- Invalid API key

**Solution:** Check your parameters and API key.

### Issue: "No rate data available"

**Possible causes:**
- FRED API is down (rare)
- Date range has no data
- Series ID doesn't exist

**Solution:** Check FRED website to verify data availability.

## Next Steps

1. ✅ FRED service implemented
2. ⏳ Create market_data repository to store rates in database
3. ⏳ Build scheduled job to fetch rates weekly
4. ⏳ Integrate with alert generation engine
5. ⏳ Add UI components for displaying refinance opportunities

## Resources

- **FRED API Documentation**: https://fred.stlouisfed.org/docs/api/fred/
- **Get API Key**: https://fred.stlouisfed.org/docs/api/api_key.html
- **Rate Data Series**: https://fred.stlouisfed.org/categories/22
- **Support**: https://fred.stlouisfed.org/contactus/

## License

This service uses data from the Federal Reserve Economic Data (FRED) API, which is provided by the Federal Reserve Bank of St. Louis. The data is in the public domain.
