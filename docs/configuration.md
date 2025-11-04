# Configuration Documentation

## Overview

This document covers all configuration requirements for the ZEC Market Cap project.

## Backend Configuration

### Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
```

#### Getting Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **service_role key** (secret) → `SUPABASE_KEY`
   - **anon public key** → `SUPABASE_ANON_KEY`

**Important**: The `SUPABASE_KEY` is sensitive and should never be committed to git. It's only used by the backend for inserting data.

### Asset Configuration

Edit `backend/config/assets.json` to add or remove tracked cryptocurrencies:

```json
[
  "bitcoin",
  "ethereum",
  "solana",
  "binancecoin",
  "ripple",
  "dogecoin",
  "zcash"
]
```

Use CoinGecko asset IDs (lowercase, no spaces). Find asset IDs at [coingecko.com](https://www.coingecko.com).

### Python Dependencies

Dependencies are listed in `backend/requirements.txt`:

- `requests>=2.31.0` - HTTP requests to CoinGecko API
- `pandas>=2.0.0` - Data processing (if needed)
- `supabase>=2.0.0` - Supabase client library
- `python-dotenv>=1.0.0` - Environment variable loading

Install with:
```bash
cd backend
pip install -r requirements.txt
```

## Frontend Configuration

### Environment Variables

Create a `.env.local` file in the `frontend/` directory:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Note**: Frontend uses `VITE_` prefix for environment variables (Vite requirement).

### Dependencies

Key dependencies in `frontend/package.json`:

- `react` & `react-dom` - UI framework
- `@supabase/supabase-js` - Supabase client
- `recharts` - Chart library
- `tailwindcss` - CSS framework
- `typescript` - Type safety

Install with:
```bash
cd frontend
npm install
```

## GitHub Actions Configuration

### Required Secrets

Add these secrets in GitHub repository settings (**Settings** → **Secrets and variables** → **Actions**):

1. `SUPABASE_URL` - Your Supabase project URL
2. `SUPABASE_KEY` - Supabase service role key (for backend)
3. `VITE_SUPABASE_URL` - Supabase project URL (for frontend build)
4. `VITE_SUPABASE_ANON_KEY` - Supabase anon key (for frontend build)

### Workflow Configuration

Two workflows are configured:

1. **Update Data** (`.github/workflows/update-data.yml`)
   - Runs hourly via cron
   - Fetches data from CoinGecko and updates Supabase
   - Requires: `SUPABASE_URL`, `SUPABASE_KEY`

2. **Deploy Pages** (`.github/workflows/deploy-pages.yml`)
   - Deploys frontend to GitHub Pages on push to main
   - Requires: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

## CoinGecko API

### Rate Limits

- **Free Tier**: 50 calls/minute
- The backend includes retry logic with exponential backoff
- Raw API responses are saved to `data/raw/` for audit trail

### API Endpoint

Currently using: `/coins/markets`

Parameters:
- `ids`: Comma-separated asset IDs
- `vs_currency`: `usd`
- `price_change_percentage`: `1h,24h,7d`

## Verification

### Backend

Test configuration:
```bash
cd backend
python scripts/update_supabase.py
```

### Frontend

Test locally:
```bash
cd frontend
npm run dev
```

Visit `http://localhost:5173` and verify data loads from Supabase.

## Security Notes

- Never commit `.env` or `.env.local` files
- Add to `.gitignore`:
  ```
  .env
  .env.local
  backend/.env
  frontend/.env.local
  ```
- Use GitHub Secrets for CI/CD environments
- Service role key should only be used server-side (backend/GitHub Actions)

