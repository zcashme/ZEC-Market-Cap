-- ZEC Market Cap Database Schema
-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS zmc_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp timestamptz NOT NULL,
  asset_symbol text NOT NULL,
  asset_name text NOT NULL,
  asset_price_zec numeric(20, 8) NOT NULL,
  market_cap_zec numeric(30, 2) NOT NULL,
  rank integer NOT NULL,
  pct_change_1h_zec numeric(10, 4),
  pct_change_24h_zec numeric(10, 4),
  pct_change_7d_zec numeric(10, 4),
  zec_price_usd numeric(10, 4) NOT NULL,
  data_source text DEFAULT 'coingecko',
  created_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_zmc_timestamp ON zmc_prices(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_zmc_rank ON zmc_prices(rank);
CREATE INDEX IF NOT EXISTS idx_zmc_symbol ON zmc_prices(asset_symbol);

-- Row Level Security: Allow public read access
ALTER TABLE zmc_prices ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to read zmc_prices
CREATE POLICY "Public read access" ON zmc_prices
  FOR SELECT
  USING (true);

-- Policy: Allow service role to insert (for backend)
CREATE POLICY "Service role insert" ON zmc_prices
  FOR INSERT
  WITH CHECK (true);

