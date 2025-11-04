# Backend Documentation

## Overview

The backend is a Python-based system that fetches cryptocurrency data from CoinGecko API, computes ZEC-denominated values, and stores them in Supabase. It runs on GitHub Actions hourly or can be executed manually.

## Architecture

```
CoinGecko API → fetch_prices.py → compute_zec_values.py → update_supabase.py → Supabase
```

## Scripts

### 1. `fetch_prices.py`

Fetches market data from CoinGecko API.

**Function**: `fetch_prices(assets, max_retries, retry_delay)`

**What it does**:
- Uses CoinGecko `/coins/markets` endpoint
- Requests 1h, 24h, and 7d price changes
- Handles rate limiting and retries
- Saves raw JSON responses to `data/raw/` for audit
- Returns data dictionary keyed by asset ID

**API Response Format**:
```python
{
  "bitcoin": {
    "usd": 105183,
    "usd_market_cap": 2099031693695,
    "usd_1h_change": -1.569,
    "usd_24h_change": -2.188,
    "usd_7d_change": -7.745
  },
  ...
}
```

**Error Handling**:
- Retries up to 3 times with exponential backoff
- Validates ZEC data exists before proceeding
- Raises exceptions for fatal errors

### 2. `compute_zec_values.py`

Computes ZEC-denominated values from USD prices.

**Function**: `compute_zec_values(coingecko_data)`

**What it does**:
1. Extracts ZEC price in USD (required for all calculations)
2. For each asset:
   - Converts USD price to ZEC: `asset_price_zec = asset_price_usd / zec_price_usd`
   - Converts market cap to ZEC: `market_cap_zec = market_cap_usd / zec_price_usd`
   - Preserves price change percentages (they're the same in USD and ZEC terms)
3. Sorts assets by market cap and assigns ranks
4. Returns list of dictionaries ready for database insertion

**Key Calculation**:
Price changes in ZEC terms equal USD terms because:
```
(asset_price_zec_new / asset_price_zec_old) - 1
= (asset_price_usd_new / zec_usd) / (asset_price_usd_old / zec_usd) - 1
= (asset_price_usd_new / asset_price_usd_old) - 1
```

**Output Format**:
```python
[
  {
    "timestamp": "2025-11-04T11:18:38Z",
    "asset_symbol": "BTC",
    "asset_name": "Bitcoin",
    "asset_price_zec": 226.4523,
    "market_cap_zec": 45192345.67,
    "rank": 1,
    "pct_change_1h_zec": -1.569,
    "pct_change_24h_zec": -2.188,
    "pct_change_7d_zec": -7.745,
    "zec_price_usd": 464.93,
    "data_source": "coingecko"
  },
  ...
]
```

### 3. `update_supabase.py`

Main orchestrator script that runs the full pipeline.

**Function**: `main()`

**Workflow**:
1. Fetch prices from CoinGecko
2. Compute ZEC values
3. Upload to Supabase
4. Print summary

**Function**: `upload_to_supabase(data)`

- Initializes Supabase client using environment variables
- Inserts all records in a single batch operation
- Returns `True` on success, `False` on failure
- Logs all operations

## Configuration Files

### `config/assets.json`

List of CoinGecko asset IDs to track. Must include "zcash" for calculations to work.

### `config/supabase_config.py`

Loads Supabase credentials from environment variables:
- `get_supabase_url()` - Returns Supabase URL
- `get_supabase_key()` - Returns service role key
- `get_supabase_anon_key()` - Returns anon key (for reference)

Automatically loads `.env` file from backend directory.

## Running Locally

```bash
cd backend
python scripts/update_supabase.py
```

## Running on GitHub Actions

The workflow (`.github/workflows/update-data.yml`) runs:
- Hourly via cron schedule
- On push to main (if backend scripts change)
- Manually via workflow_dispatch

**Environment Variables** (set as GitHub Secrets):
- `SUPABASE_URL`
- `SUPABASE_KEY`

## Data Flow

1. **Fetch**: `fetch_prices()` calls CoinGecko API
2. **Transform**: Response converted from market objects to asset dictionary
3. **Compute**: USD values converted to ZEC using current ZEC price
4. **Rank**: Assets sorted by market cap and assigned ranks
5. **Store**: All records inserted into Supabase with same timestamp

## Error Handling

- **API Failures**: Retry logic with exponential backoff
- **Missing Data**: Skips assets with missing required fields
- **Invalid ZEC Price**: Raises error (can't compute without ZEC price)
- **Database Errors**: Logged and script exits with error code

## Logging

All scripts use Python's `logging` module:
- INFO level for normal operations
- ERROR level for failures
- Timestamps and module names included

## Testing

Test individual components:

```bash
# Test price fetching
python scripts/fetch_prices.py

# Test computation (with sample data)
python scripts/compute_zec_values.py
```

## Dependencies

See `requirements.txt`:
- `requests` - HTTP client
- `supabase` - Database client
- `python-dotenv` - Environment variables
- `pandas` - Data processing (optional)

