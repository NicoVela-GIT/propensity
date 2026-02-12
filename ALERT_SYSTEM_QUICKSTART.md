# Alert System Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Test the System (2 minutes)

```bash
# Start your dev server
npm run dev

# In another terminal, test the jobs
curl http://localhost:3000/api/jobs/update-rates
curl http://localhost:3000/api/jobs/generate-alerts

# View alerts
curl http://localhost:3000/api/alerts
```

### Step 2: Choose Job Scheduling (1 minute)

Read `JOB_SCHEDULING_OPTIONS.md` and pick one:

**Recommended: GitHub Actions (FREE)**
- Already configured in `.github/workflows/scheduled-jobs.yml`
- Just need to add `APP_URL` secret to GitHub

**Alternative: Vercel Cron**
- Already configured in `vercel.json`
- Requires Vercel Pro plan ($20/month)

### Step 3: Configure GitHub Actions (2 minutes)

1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Name: `APP_URL`
5. Value: `https://your-app.vercel.app` (your production URL)
6. Click "Add secret"

Done! Jobs will run automatically:
- **Update Rates**: Every Friday at 6 PM UTC
- **Generate Alerts**: Every day at 6 AM UTC

---

## 📋 What Happens Next

### Friday 6 PM (Weekly)
1. GitHub Actions triggers `/api/jobs/update-rates`
2. Fetches latest mortgage rates from FRED API
3. Stores in `market_data` table
4. Logs results

### Every Day 6 AM (Daily)
1. GitHub Actions triggers `/api/jobs/generate-alerts`
2. Checks all properties for refinance opportunities
3. Generates alerts for qualifying properties
4. Stores in `generated_alerts` table
5. Alerts appear on dashboard

---

## 🧪 Manual Testing

### Test Rate Update
```bash
curl -X GET http://localhost:3000/api/jobs/update-rates
```

Expected response:
```json
{
  "success": true,
  "message": "Successfully updated 3 mortgage rates",
  "data": {
    "success": true,
    "updatesCount": 3,
    "timestamp": "2026-02-11T..."
  }
}
```

### Test Alert Generation
```bash
curl -X GET http://localhost:3000/api/jobs/generate-alerts
```

Expected response:
```json
{
  "success": true,
  "message": "Successfully generated 2 alerts",
  "data": {
    "success": true,
    "refinanceAlerts": 2,
    "totalAlerts": 2,
    "timestamp": "2026-02-11T..."
  }
}
```

### View Alerts
```bash
curl -X GET http://localhost:3000/api/alerts
```

Expected response:
```json
{
  "success": true,
  "data": [
    {
      "id": "alert-abc123",
      "severity": "high",
      "title": "Refinance Opportunity",
      "description": "Current mortgage rates are 0.89% lower...",
      "estimated_value": 1524
    }
  ],
  "count": 1
}
```

---

## 🎯 Verify It's Working

### 1. Check Dashboard
- Open http://localhost:3000
- Look for "Alerts" section in right panel
- Should see any generated alerts

### 2. Check Database
```sql
-- Check if rates were stored
SELECT * FROM market_data 
ORDER BY effective_date DESC 
LIMIT 5;

-- Check if alerts were generated
SELECT * FROM generated_alerts 
ORDER BY triggered_at DESC;
```

### 3. Check GitHub Actions (After Deploy)
- Go to your GitHub repo
- Click "Actions" tab
- See scheduled workflow runs
- Check execution logs

---

## 🔧 Troubleshooting

### No Alerts Generated?
**Possible reasons:**
1. No properties have active loans with interest rates
2. Current market rates are higher than property rates
3. Properties don't have 20% equity

**Solution:** Add a property with:
- Active loan
- Interest rate (e.g., 7.0%)
- 20%+ equity

### Jobs Not Running?
**Check:**
1. GitHub Actions is enabled in your repo
2. `APP_URL` secret is set correctly
3. Workflow file is in `.github/workflows/`
4. Your app is deployed and accessible

### API Errors?
**Check:**
1. FRED_API_KEY is set in environment variables
2. Supabase connection is working
3. Migrations have been run
4. Check browser console for errors

---

## 📚 Documentation

- **Full Implementation**: `ALERT_SYSTEM_COMPLETE.md`
- **FRED API**: `FRED_SERVICE_README.md`
- **Job Scheduling**: `JOB_SCHEDULING_OPTIONS.md`
- **External Cron**: `EXTERNAL_CRON_SETUP.md`

---

## ✅ Success Checklist

- [ ] Dev server running
- [ ] Tested rate update job
- [ ] Tested alert generation job
- [ ] Alerts visible on dashboard
- [ ] GitHub Actions secret configured
- [ ] Deployed to production
- [ ] Verified jobs run automatically

---

## 🎉 You're Done!

Your alert system is now:
- ✅ Fetching real mortgage rates from FRED
- ✅ Generating personalized alerts
- ✅ Displaying on dashboard
- ✅ Running automatically on schedule

**Next:** Just deploy and monitor!
