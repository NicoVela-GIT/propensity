# FRED Service Quick Reference

## 🚀 Setup (30 seconds)

1. Get free API key: https://fred.stlouisfed.org/docs/api/api_key.html
2. Add to `.env.local`:
   ```bash
   FRED_API_KEY=your_key_here
   ```
3. Test: `npx tsx src/lib/services/__tests__/fred.service.test.ts`

## 📖 Common Usage

### Get Current Rate

```typescript
import { getLatestMortgageRate } from '@/lib/services';

const rate = await getLatestMortgageRate('MORTGAGE30US');
// { date: Date, rate: 6.82, seriesId: 'MORTGAGE30US' }
```

### Get All Rates

```typescript
import { getAllCurrentMortgageRates } from '@/lib/services';

const rates = await getAllCurrentMortgageRates();
// { thirtyYear: {...}, fifteenYear: {...}, fiveOneARM: {...} }
```

### Check Refinance Opportunity

```typescript
import { checkRefinanceOpportunity } from '@/lib/services';

const result = await checkRefinanceOpportunity(
  6.5,                      // Current loan rate
  new Date('2022-06-01')    // Loan date
);

if (result.isOpportunity) {
  console.log(`Save ${result.potentialSavings}%!`);
}
```

### Get Rate History

```typescript
import { getMortgageRateHistory } from '@/lib/services';

const ninetyDaysAgo = new Date();
ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

const rates = await getMortgageRateHistory('MORTGAGE30US', ninetyDaysAgo);
// Array of { date, rate, seriesId }
```

## 🎯 Rate Series IDs

| Series | Description |
|--------|-------------|
| `MORTGAGE30US` | 30-year fixed rate (default) |
| `MORTGAGE15US` | 15-year fixed rate |
| `MORTGAGE5US` | 5/1 adjustable rate mortgage |

## 💡 Pro Tips

- ✅ Rates update weekly (Thursdays)
- ✅ Built-in 1-hour caching
- ✅ Always check for null returns
- ✅ Handle errors gracefully
- ✅ Use TypeScript for type safety

## 📚 Full Documentation

- **API Reference**: `FRED_SERVICE_README.md`
- **Integration Guide**: `FRED_INTEGRATION_GUIDE.md`
- **Examples**: `src/lib/services/examples/fred-usage-examples.ts`
- **Tests**: `src/lib/services/__tests__/fred.service.test.ts`

## 🆘 Troubleshooting

| Error | Solution |
|-------|----------|
| "Missing env.FRED_API_KEY" | Add key to `.env.local` |
| "FRED API request failed: 400" | Check series ID and parameters |
| "No rate data available" | Check FRED website for data availability |

## 🔗 Resources

- **Get API Key**: https://fred.stlouisfed.org/docs/api/api_key.html
- **API Docs**: https://fred.stlouisfed.org/docs/api/fred/
- **Data Series**: https://fred.stlouisfed.org/categories/22
