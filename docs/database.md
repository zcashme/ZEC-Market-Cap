# Database Documentation

## Overview

The project uses **Supabase** (PostgreSQL) as the database to store cryptocurrency market data denominated in Zcash (ZEC).

## Schema

### Table: `zmc_prices`

Stores market data for all tracked cryptocurrencies, with prices and market caps normalized to ZEC.

#### Columns

| Column | Type | Description |
|--------|------|-------------|
| `id` | `uuid` | Primary key, auto-generated |
| `timestamp` | `timestamptz` | When the data was fetched |
| `asset_symbol` | `text` | Asset symbol (BTC, ETH, etc.) |
| `asset_name` | `text` | Full asset name (Bitcoin, Ethereum, etc.) |
| `asset_price_zec` | `numeric(20, 8)` | Price in ZEC (8 decimal places) |
| `market_cap_zec` | `numeric(30, 2)` | Market cap in ZEC |
| `rank` | `integer` | Rank by market cap (1 = highest) |
| `pct_change_1h_zec` | `numeric(10, 4)` | 1-hour price change percentage (nullable) |
| `pct_change_24h_zec` | `numeric(10, 4)` | 24-hour price change percentage (nullable) |
| `pct_change_7d_zec` | `numeric(10, 4)` | 7-day price change percentage (nullable) |
| `zec_price_usd` | `numeric(10, 4)` | ZEC price in USD at time of fetch |
| `data_source` | `text` | Source of data (default: 'coingecko') |
| `created_at` | `timestamptz` | Record creation timestamp |

#### Indexes

- `idx_zmc_timestamp` - On `timestamp DESC` (for querying latest data)
- `idx_zmc_rank` - On `rank` (for sorting)
- `idx_zmc_symbol` - On `asset_symbol` (for lookups)

## Row Level Security (RLS)

- **Public Read Access**: Anyone can read from `zmc_prices`
- **Service Role Insert**: Backend can insert new records using service role key

## Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor
3. Run the schema from `supabase/schema.sql`
4. Verify RLS policies are enabled

## Migrations

When adding new columns:

1. Update `supabase/schema.sql` with the new column definition
2. Run the ALTER TABLE statement in Supabase SQL Editor:

```sql
ALTER TABLE zmc_prices 
ADD COLUMN IF NOT EXISTS column_name data_type;
```

3. Update the frontend TypeScript interface in `frontend/src/lib/supabase.ts`
4. Update backend data processing to include the new field

## Querying Data

### Get Latest Market Data

```sql
-- Get the latest timestamp
SELECT timestamp 
FROM zmc_prices 
ORDER BY timestamp DESC 
LIMIT 1;

-- Get all assets for latest timestamp
SELECT * 
FROM zmc_prices 
WHERE timestamp = (SELECT MAX(timestamp) FROM zmc_prices)
ORDER BY rank ASC;
```

### Get Specific Asset

```sql
SELECT * 
FROM zmc_prices 
WHERE asset_symbol = 'BTC' 
  AND timestamp = (SELECT MAX(timestamp) FROM zmc_prices);
```

### Historical Data

```sql
SELECT * 
FROM zmc_prices 
WHERE asset_symbol = 'BTC' 
ORDER BY timestamp DESC 
LIMIT 10;
```

## Data Retention

Currently, all historical data is retained. Consider implementing data cleanup policies if storage becomes an issue:

```sql
-- Example: Delete records older than 30 days
DELETE FROM zmc_prices 
WHERE timestamp < NOW() - INTERVAL '30 days';
```

