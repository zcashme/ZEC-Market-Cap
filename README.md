# ⓩ ZEC Market Cap (ZMC)

A production-ready cryptocurrency market data platform that displays all asset prices and market caps **denominated in Zcash (ZEC)** instead of USD.

## 🎯 Concept

Instead of showing Bitcoin or Ethereum in USD, ZMC normalizes all values using ZEC's USD rate to represent everything in ZEC terms.

**Example:**
- If 1 BTC = $68,000 and 1 ZEC = $26 → **BTC = 2,615 ⓩ**

## 🏗️ Architecture

- **Backend**: Python scripts that fetch from CoinGecko API, compute ZEC values, and store in Supabase
- **Database**: Supabase (PostgreSQL) for data storage
- **Frontend**: Vite.js + React + TypeScript dashboard
- **Deployment**: 
  - Backend: GitHub Actions (hourly automated updates)
  - Frontend: GitHub Pages (static hosting)

## 📋 Prerequisites

- Python 3.11+
- Node.js 20+
- Supabase account and project
- GitHub repository

## 🚀 Setup Instructions

### 1. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from `supabase/schema.sql`
3. Navigate to Project Settings → API
4. Copy your:
   - Project URL
   - `service_role` key (for backend)
   - `anon` key (for frontend)

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file (copy from `.env.example`):
   ```bash
   # On Windows PowerShell
   Copy-Item .env.example .env
   ```

5. Fill in your Supabase credentials in `.env`:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your-service-role-key
   SUPABASE_ANON_KEY=your-anon-key
   ```

6. Test the backend:
   ```bash
   python scripts/update_supabase.py
   ```

### 3. GitHub Actions Setup

1. Go to your GitHub repository → Settings → Secrets and variables → Actions
2. Add the following secrets:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_KEY`: Your Supabase service role key
   - `VITE_SUPABASE_URL`: Your Supabase project URL (for frontend build)
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key (for frontend build)

3. The workflow will automatically run hourly and update data in Supabase.

### 4. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file:
   ```bash
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

### 5. GitHub Pages Deployment

The frontend will automatically deploy to GitHub Pages when you push to the `main` branch. Make sure:

1. GitHub Pages is enabled in repository settings
2. Source is set to "GitHub Actions"
3. The workflow secrets (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`) are configured

## 📁 Project Structure

```
zec-market-cap/
├── backend/
│   ├── scripts/
│   │   ├── fetch_prices.py          # Fetch from CoinGecko
│   │   ├── compute_zec_values.py   # Compute ZEC values
│   │   └── update_supabase.py       # Main orchestrator
│   ├── config/
│   │   ├── assets.json              # Tracked assets
│   │   └── supabase_config.py       # Config loader
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/              # React components
│   │   ├── lib/                     # Supabase client
│   │   └── ...
│   └── package.json
├── supabase/
│   └── schema.sql                   # Database schema
└── .github/
    └── workflows/                   # GitHub Actions
```

## 🔧 Configuration

### Adding New Assets

Edit `backend/config/assets.json` to add or remove cryptocurrencies:

```json
[
  "bitcoin",
  "ethereum",
  "solana",
  "your-asset-id"
]
```

Use CoinGecko asset IDs (lowercase, no spaces).

## 📊 Data Flow

1. **GitHub Actions** triggers hourly (or manually)
2. **fetch_prices.py** fetches data from CoinGecko API
3. **compute_zec_values.py** computes ZEC-denominated values
4. **update_supabase.py** uploads to Supabase database
5. **Frontend** queries Supabase and displays data

## 🌐 API Reference

### CoinGecko API

- Endpoint: `https://api.coingecko.com/api/v3/simple/price`
- Rate Limit: 50 calls/minute (free tier)
- Parameters: `ids`, `vs_currencies=usd`, `include_market_cap=true`, `include_24hr_change=true`

### Supabase Table

The `zmc_prices` table stores:
- `timestamp`: When data was fetched
- `asset_symbol`: Asset symbol (BTC, ETH, etc.)
- `asset_name`: Full asset name
- `asset_price_zec`: Price in ZEC
- `market_cap_zec`: Market cap in ZEC
- `rank`: Rank by market cap
- `pct_change_24h_zec`: 24-hour change percentage
- `zec_price_usd`: ZEC price in USD

## 🐛 Troubleshooting

### Backend Issues

- **"SUPABASE_URL environment variable is not set"**: Make sure `.env` file exists and has correct values
- **"ZEC price data not found"**: Check that "zcash" is in your assets list
- **Rate limiting**: CoinGecko free tier has limits; the script includes retry logic

### Frontend Issues

- **"Supabase credentials not configured"**: Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local`
- **No data showing**: Check Supabase RLS policies allow public read access
- **Build fails**: Ensure all environment variables are set in GitHub Secrets for Actions

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a pull request.

## 🔗 Links

- [CoinGecko API](https://www.coingecko.com/en/api)
- [Supabase](https://supabase.com)
- [Zcash](https://z.cash)

---

Built with ❤️ for the Zcash community

