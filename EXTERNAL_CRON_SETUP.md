# External Cron Service Setup Guide

This guide shows you how to set up the alert system jobs using external cron services.

---

## Option A: Cron-job.org (Recommended - FREE)

### Step 1: Sign Up
1. Go to https://cron-job.org/
2. Create a free account
3. Verify your email

### Step 2: Add Update Rates Job
1. Click "Create cronjob"
2. Fill in the details:
   - **Title**: Update Mortgage Rates
   - **URL**: `https://your-app.vercel.app/api/jobs/update-rates`
   - **Schedule**: 
     - Minute: `0`
     - Hour: `18` (6 PM)
     - Day of Month: `*`
     - Month: `*`
     - Day of Week: `5` (Friday)
   - **Timezone**: UTC
   - **Request Method**: GET
3. Click "Create cronjob"

### Step 3: Add Generate Alerts Job
1. Click "Create cronjob"
2. Fill in the details:
   - **Title**: Generate Alerts
   - **URL**: `https://your-app.vercel.app/api/jobs/generate-alerts`
   - **Schedule**:
     - Minute: `0`
     - Hour: `6` (6 AM)
     - Day of Month: `*`
     - Month: `*`
     - Day of Week: `*` (Every day)
   - **Timezone**: UTC
   - **Request Method**: GET
3. Click "Create cronjob"

### Step 4: Test
1. Click the "Execute now" button on each job
2. Check the execution history
3. Verify alerts appear in your dashboard

---

## Option B: EasyCron (FREE Tier)

### Step 1: Sign Up
1. Go to https://www.easycron.com/
2. Create a free account (25 cron jobs included)
3. Verify your email

### Step 2: Add Update Rates Job
1. Click "Add Cron Job"
2. Fill in:
   - **Cron Job Name**: Update Mortgage Rates
   - **URL**: `https://your-app.vercel.app/api/jobs/update-rates`
   - **Cron Expression**: `0 18 * * 5`
   - **Timezone**: UTC
   - **HTTP Method**: GET
3. Click "Create Cron Job"

### Step 3: Add Generate Alerts Job
1. Click "Add Cron Job"
2. Fill in:
   - **Cron Job Name**: Generate Alerts
   - **URL**: `https://your-app.vercel.app/api/jobs/generate-alerts`
   - **Cron Expression**: `0 6 * * *`
   - **Timezone**: UTC
   - **HTTP Method**: GET
3. Click "Create Cron Job"

### Step 4: Configure Notifications (Optional)
1. Go to Settings → Notifications
2. Add your email for failure notifications
3. Save settings

---

## Option C: AWS EventBridge (Advanced)

### Prerequisites
- AWS Account
- AWS CLI installed
- Basic AWS knowledge

### Step 1: Create Lambda Functions
1. Create two Lambda functions:
   - `update-mortgage-rates`
   - `generate-alerts`
2. Each function should make an HTTP GET request to your API

### Step 2: Create EventBridge Rules
1. Go to AWS EventBridge console
2. Create rule for update rates:
   - **Name**: update-mortgage-rates-weekly
   - **Schedule**: `cron(0 18 ? * FRI *)`
   - **Target**: Lambda function `update-mortgage-rates`
3. Create rule for generate alerts:
   - **Name**: generate-alerts-daily
   - **Schedule**: `cron(0 6 * * ? *)`
   - **Target**: Lambda function `generate-alerts`

### Step 3: Configure Permissions
1. Add IAM permissions for Lambda to invoke your API
2. Test each Lambda function
3. Verify EventBridge rules are enabled

---

## Cron Expression Reference

```
 ┌───────────── minute (0 - 59)
 │ ┌───────────── hour (0 - 23)
 │ │ ┌───────────── day of month (1 - 31)
 │ │ │ ┌───────────── month (1 - 12)
 │ │ │ │ ┌───────────── day of week (0 - 6) (Sunday to Saturday)
 │ │ │ │ │
 * * * * *
```

### Examples
- `0 18 * * 5` = Every Friday at 6 PM
- `0 6 * * *` = Every day at 6 AM
- `0 */6 * * *` = Every 6 hours
- `0 0 1 * *` = First day of every month at midnight

---

## Security Considerations

### Option 1: Add API Key Authentication (Recommended)

1. Generate a secret key:
```bash
openssl rand -hex 32
```

2. Add to your `.env.local`:
```bash
CRON_SECRET=your_generated_secret_here
```

3. Update your API routes to check for the secret:
```typescript
// In /api/jobs/update-rates/route.ts
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;
  
  if (authHeader !== expectedAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // ... rest of your code
}
```

4. Add the header in your cron service:
   - **Header Name**: `Authorization`
   - **Header Value**: `Bearer your_generated_secret_here`

### Option 2: Use Vercel's Built-in Protection

If using Vercel, you can use their built-in cron secret:
```typescript
import { verifySignature } from '@vercel/functions';

export async function GET(request: Request) {
  const isValid = await verifySignature(request);
  if (!isValid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // ... rest of your code
}
```

---

## Monitoring

### Check Job Execution
1. **Cron-job.org**: View execution history in dashboard
2. **EasyCron**: Check execution logs
3. **AWS**: View CloudWatch logs

### Set Up Alerts
1. Configure email notifications for failures
2. Set up Slack webhooks (optional)
3. Monitor API response times

### Verify Jobs Are Running
```bash
# Check if rates are being updated
curl https://your-app.vercel.app/api/alerts

# Check last update time in your database
# Query market_data table for latest effective_date
```

---

## Troubleshooting

### Job Not Running
1. Check cron expression is correct
2. Verify URL is accessible (test in browser)
3. Check timezone settings
4. Review execution logs

### Job Failing
1. Check API endpoint returns 200 status
2. Verify environment variables are set
3. Check Supabase connection
4. Review application logs

### Rate Limits
1. Most services limit requests per minute
2. Ensure jobs don't overlap
3. Add delays between retries if needed

---

## Cost Comparison

| Service | Free Tier | Paid Plans |
|---------|-----------|------------|
| **Cron-job.org** | Unlimited (with ads) | $4.99/month (no ads) |
| **EasyCron** | 25 jobs | $0.99/month (100 jobs) |
| **AWS EventBridge** | 1M events/month free | $1.00 per million events |

---

## Recommendation

For most users, **Cron-job.org** is the best external option:
- ✅ Completely free
- ✅ Reliable
- ✅ Easy to set up
- ✅ Good monitoring dashboard
- ✅ Email notifications

Just remember to add API key authentication for security!
