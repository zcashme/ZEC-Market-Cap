# Calculation Documentation

## Overview

This document explains how all values are calculated and converted from USD to ZEC-denominated terms.

## Core Concept

All cryptocurrency prices and market caps are normalized using Zcash (ZEC) as the base currency. Instead of showing values in USD, we show them in ZEC terms.

**Example**:
- If 1 BTC = $68,000 and 1 ZEC = $26
- Then BTC price = 68,000 / 26 = **2,615.38 ⓩ**

## Price Conversion

### Asset Price in ZEC

Formula:
```
asset_price_zec = asset_price_usd / zec_price_usd
```

Where:
- `asset_price_usd` = Current price in USD (from CoinGecko)
- `zec_price_usd` = Current ZEC price in USD (from CoinGecko)

**Example**:
- Bitcoin USD price: $105,183
- ZEC USD price: $464.93
- Bitcoin ZEC price: 105,183 / 464.93 = **226.45 ⓩ**

## Market Cap Conversion

### Market Cap in ZEC

Formula:
```
market_cap_zec = market_cap_usd / zec_price_usd
```

Where:
- `market_cap_usd` = Market cap in USD (from CoinGecko)
- `zec_price_usd` = Current ZEC price in USD

**Example**:
- Bitcoin market cap: $2,099,031,693,695
- ZEC price: $464.93
- Bitcoin market cap: 2,099,031,693,695 / 464.93 = **4,515,000,000 ⓩ**

## Price Change Percentage

### Why Percentage Changes Don't Need Conversion

The percentage change in ZEC terms equals the percentage change in USD terms.

**Mathematical Proof**:

```
pct_change_zec = (price_zec_new / price_zec_old) - 1

Substitute: price_zec = price_usd / zec_usd

pct_change_zec = (price_usd_new / zec_usd) / (price_usd_old / zec_usd) - 1
                = (price_usd_new / zec_usd) × (zec_usd / price_usd_old) - 1
                = price_usd_new / price_usd_old - 1
                = pct_change_usd
```

**Conclusion**: Percentage changes are identical in USD and ZEC terms.

### Implementation

For all assets (including Zcash itself):
- `pct_change_1h_zec` = `price_change_percentage_1h_in_currency` (from CoinGecko)
- `pct_change_24h_zec` = `price_change_percentage_24h_in_currency` (from CoinGecko)
- `pct_change_7d_zec` = `price_change_percentage_7d_in_currency` (from CoinGecko)

**Example**:
- If Bitcoin changed -2.19% in USD over 24h
- Then Bitcoin changed -2.19% in ZEC over 24h
- `pct_change_24h_zec` = -2.19

## Zcash Price Changes

Zcash (ZEC) itself is treated like any other asset:
- Its price changes are calculated from CoinGecko USD data
- The percentage changes are the same in USD and ZEC terms
- ZEC's price in ZEC terms is always **1.0 ⓩ** (by definition)

**ZEC Price Calculation**:
```
zec_price_zec = zec_price_usd / zec_price_usd = 1.0 ⓩ
```

## Ranking

Assets are ranked by market cap in ZEC terms:
1. Calculate all market caps in ZEC
2. Sort descending by `market_cap_zec`
3. Assign rank: 1 = highest market cap, 2 = second highest, etc.

**Example**:
- Bitcoin: 4,515,000,000 ⓩ → Rank 1
- Ethereum: 917,000,000 ⓩ → Rank 2
- Solana: 190,000,000 ⓩ → Rank 3

## Data Precision

- **Price**: 8 decimal places (`numeric(20, 8)`)
- **Market Cap**: 2 decimal places (`numeric(30, 2)`)
- **Price Changes**: 4 decimal places (`numeric(10, 4)`)
- **ZEC/USD Price**: 4 decimal places (`numeric(10, 4)`)

## Rounding

All calculations are rounded to appropriate precision:
- Prices: `round(price, 8)`
- Market caps: `round(market_cap, 2)`
- Percentages: `round(percentage, 4)`

## Timestamp

All records in a batch share the same `timestamp`:
- Generated when data is fetched
- Format: ISO 8601 with Z timezone (`2025-11-04T11:18:38Z`)
- Used to group records by fetch time

## Data Flow

1. **Fetch**: Get USD prices and market caps from CoinGecko
2. **Get ZEC Price**: Extract current ZEC/USD rate
3. **Convert Prices**: Divide all USD prices by ZEC price
4. **Convert Market Caps**: Divide all USD market caps by ZEC price
5. **Preserve Percentages**: Use CoinGecko percentage changes as-is
6. **Rank**: Sort by market cap and assign ranks
7. **Store**: Insert all values with same timestamp

## Edge Cases

### Missing Data

- If `usd_1h_change` is `null` → `pct_change_1h_zec` = `null`
- If `usd_market_cap` is 0 or missing → `market_cap_zec` = 0
- If `usd` price is missing → Asset is skipped

### Invalid ZEC Price

- If ZEC price ≤ 0 → Error raised (cannot compute)
- If ZEC data not found → Error raised

### Zero Market Cap

- Assets with market cap = 0 are still included
- Ranked at the bottom of the list

## Example Calculation

**Input from CoinGecko**:
```json
{
  "bitcoin": {
    "usd": 105183,
    "usd_market_cap": 2099031693695,
    "usd_1h_change": -1.569,
    "usd_24h_change": -2.188,
    "usd_7d_change": -7.745
  },
  "zcash": {
    "usd": 464.93,
    "usd_market_cap": 7619842536,
    "usd_1h_change": -2.590,
    "usd_24h_change": 19.572,
    "usd_7d_change": 39.723
  }
}
```

**Calculations**:
```
zec_price_usd = 464.93

Bitcoin:
  asset_price_zec = 105183 / 464.93 = 226.4523 ⓩ
  market_cap_zec = 2099031693695 / 464.93 = 4515234567.89 ⓩ
  pct_change_1h_zec = -1.569
  pct_change_24h_zec = -2.188
  pct_change_7d_zec = -7.745

Zcash:
  asset_price_zec = 464.93 / 464.93 = 1.0 ⓩ
  market_cap_zec = 7619842536 / 464.93 = 16388826.73 ⓩ
  pct_change_1h_zec = -2.590
  pct_change_24h_zec = 19.572
  pct_change_7d_zec = 39.723
```

**Output to Database**:
```json
{
  "asset_symbol": "BTC",
  "asset_price_zec": 226.4523,
  "market_cap_zec": 4515234567.89,
  "pct_change_1h_zec": -1.569,
  "pct_change_24h_zec": -2.188,
  "pct_change_7d_zec": -7.745,
  "zec_price_usd": 464.93,
  "rank": 1
}
```

