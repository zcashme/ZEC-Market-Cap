# Deployment Documentation

## Overview

The project uses GitHub Actions for automated deployment:
- **Backend**: Runs hourly via cron to update data
- **Frontend**: Deploys to GitHub Pages on push to main branch

## GitHub Actions Workflows

### 1. Data Update Workflow

**File**: `.github/workflows/update-data.yml`

**Triggers**:
- Cron schedule: Every hour (`0 * * * *`)
- Push to main (if backend scripts/config change)
- Manual trigger via workflow_dispatch

**What it does**:
1. Checks out repository
2. Sets up Python 3.11
3. Installs backend dependencies
4. Runs `update_supabase.py` script
5. Optionally commits raw data files to repo

**Required Secrets**:
- `SUPABASE_URL`
- `SUPABASE_KEY`

**Environment Variables**:
```yaml
SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
SUPABASE_KEY: ${{ secrets.SUPABASE_KEY }}
```

### 2. Frontend Deployment Workflow

**File**: `.github/workflows/deploy-pages.yml`

**Triggers**:
- Push to main (if frontend files change)
- Manual trigger via workflow_dispatch

**What it does**:
1. Checks out repository
2. Sets up Node.js 20
3. Installs frontend dependencies
4. Builds frontend with environment variables
5. Deploys to GitHub Pages

**Required Secrets**:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

**Environment Variables**:
```yaml
VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
```

## Setting Up GitHub Secrets

1. Go to repository **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add each secret:

| Secret Name | Value | Used By |
|------------|-------|---------|
| `SUPABASE_URL` | Your Supabase project URL | Backend workflow |
| `SUPABASE_KEY` | Supabase service_role key | Backend workflow |
| `VITE_SUPABASE_URL` | Your Supabase project URL | Frontend build |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key | Frontend build |

## GitHub Pages Setup

1. Go to repository **Settings** → **Pages**
2. Set source to **GitHub Actions**
3. Ensure workflow has `pages: write` permission (already configured)

## Manual Deployment

### Backend (Update Data)

Trigger manually:
1. Go to **Actions** tab
2. Select **🗓 ZEC Market Cap Data Update**
3. Click **Run workflow**
4. Select branch and click **Run workflow**

Or run locally:
```bash
cd backend
python scripts/update_supabase.py
```

### Frontend (Deploy to Pages)

Trigger manually:
1. Go to **Actions** tab
2. Select **🚀 Deploy to GitHub Pages**
3. Click **Run workflow**
4. Select branch and click **Run workflow**

Or build locally:
```bash
cd frontend
npm run build
# Upload dist/ folder to hosting
```

## Deployment Process

### Backend Workflow Steps

```
1. Checkout code
2. Setup Python 3.11
3. Install dependencies (pip install -r requirements.txt)
4. Run update_supabase.py
5. (Optional) Commit raw data files
```

### Frontend Workflow Steps

```
1. Checkout code
2. Setup Node.js 20
3. Install dependencies (npm ci)
4. Build with environment variables
5. Configure GitHub Pages
6. Upload artifact
7. Deploy to Pages
```

## Monitoring Deployments

### View Workflow Runs

1. Go to **Actions** tab
2. Click on workflow name
3. View run details, logs, and status

### Check Deployment Status

- Green checkmark = Success
- Red X = Failed (check logs)
- Yellow circle = In progress

## Troubleshooting

### Backend Workflow Fails

**Common Issues**:
- Missing or incorrect secrets
- Supabase connection error
- CoinGecko API rate limit
- Invalid asset IDs in config

**Solutions**:
- Verify secrets are set correctly
- Check Supabase project is active
- Wait for rate limit to reset
- Validate `assets.json` format

### Frontend Deployment Fails

**Common Issues**:
- Missing environment variables
- Build errors (TypeScript/ESLint)
- GitHub Pages not configured
- Permission issues

**Solutions**:
- Verify `VITE_*` secrets are set
- Fix TypeScript/ESLint errors locally first
- Enable GitHub Pages in settings
- Check workflow permissions

### Data Not Updating

- Check workflow runs successfully
- Verify cron schedule is correct
- Check Supabase for new records
- Review backend logs for errors

## Environment Variables Reference

### Backend
```bash
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Frontend Build
```bash
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Continuous Integration

Both workflows run automatically:
- **Data updates**: Every hour
- **Frontend deploys**: On every push to main (if frontend changes)

No manual intervention required once configured.

## Rollback

If deployment fails:
1. Fix the issue
2. Push fix to main
3. Workflow will automatically retry

For data rollback:
- Delete incorrect records from Supabase directly
- Or wait for next hourly update to overwrite

