"""
Compute ZEC-denominated values from USD prices.
Calculates prices, market caps, rankings, and percentage changes.
"""
from typing import Dict, Any, List
from datetime import datetime


# Asset ID to symbol mapping (for display)
ASSET_SYMBOLS = {
    "bitcoin": "BTC",
    "ethereum": "ETH",
    "solana": "SOL",
    "binancecoin": "BNB",
    "ripple": "XRP",
    "dogecoin": "DOGE",
    "zcash": "ZEC"
}

# Asset ID to name mapping
ASSET_NAMES = {
    "bitcoin": "Bitcoin",
    "ethereum": "Ethereum",
    "solana": "Solana",
    "binancecoin": "BNB",
    "ripple": "XRP",
    "dogecoin": "Dogecoin",
    "zcash": "Zcash"
}


def compute_zec_values(coingecko_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Compute ZEC-denominated values for all assets.
    
    Args:
        coingecko_data: Raw data from CoinGecko API.
    
    Returns:
        List of dictionaries with computed values, ready for database insertion.
    """
    # Get ZEC price in USD
    if "zcash" not in coingecko_data:
        raise ValueError("ZEC price data not found")
    
    zec_price_usd = coingecko_data["zcash"]["usd"]
    if not zec_price_usd or zec_price_usd <= 0:
        raise ValueError(f"Invalid ZEC price: {zec_price_usd}")
    
    # Current timestamp
    timestamp = datetime.utcnow().isoformat() + "Z"
    
    # Process each asset (excluding ZEC itself for price comparison)
    computed_data = []
    
    for asset_id, price_data in coingecko_data.items():
        # Skip if missing required fields
        if "usd" not in price_data:
            continue
        
        asset_price_usd = price_data["usd"]
        asset_market_cap_usd = price_data.get("usd_market_cap", 0)
        asset_change_24h_usd = price_data.get("usd_24h_change", None)
        
        # Compute ZEC-denominated values
        asset_price_zec = asset_price_usd / zec_price_usd
        
        # For market cap, handle the case where it might be missing
        if asset_market_cap_usd and asset_market_cap_usd > 0:
            market_cap_zec = asset_market_cap_usd / zec_price_usd
        else:
            market_cap_zec = 0
        
        # Compute 24h change in ZEC terms
        # The change percentage in ZEC terms is the same as USD terms
        # because: (asset_price_zec_new / asset_price_zec_old) - 1
        # = (asset_price_usd_new / zec_usd) / (asset_price_usd_old / zec_usd) - 1
        # = (asset_price_usd_new / asset_price_usd_old) - 1
        # So pct_change_24h_zec ≈ pct_change_24h_usd
        pct_change_24h_zec = asset_change_24h_usd if asset_change_24h_usd is not None else None
        
        # Get symbol and name
        asset_symbol = ASSET_SYMBOLS.get(asset_id, asset_id.upper()[:3])
        asset_name = ASSET_NAMES.get(asset_id, asset_id.capitalize())
        
        computed_data.append({
            "timestamp": timestamp,
            "asset_symbol": asset_symbol,
            "asset_name": asset_name,
            "asset_price_zec": round(asset_price_zec, 8),
            "market_cap_zec": round(market_cap_zec, 2),
            "pct_change_24h_zec": round(pct_change_24h_zec, 4) if pct_change_24h_zec is not None else None,
            "zec_price_usd": round(zec_price_usd, 4),
            "data_source": "coingecko"
        })
    
    # Sort by market cap descending and assign ranks
    computed_data.sort(key=lambda x: x["market_cap_zec"], reverse=True)
    
    for rank, asset_data in enumerate(computed_data, start=1):
        asset_data["rank"] = rank
    
    return computed_data


if __name__ == "__main__":
    # Test with sample data
    sample_data = {
        "bitcoin": {"usd": 68000, "usd_market_cap": 1300000000000, "usd_24h_change": 2.5},
        "ethereum": {"usd": 3400, "usd_market_cap": 400000000000, "usd_24h_change": -1.2},
        "zcash": {"usd": 26.32, "usd_market_cap": 400000000, "usd_24h_change": 0.8}
    }
    
    try:
        results = compute_zec_values(sample_data)
        print("Computed ZEC values:")
        for item in results:
            print(f"  {item['asset_symbol']}: {item['asset_price_zec']:.6f} ⓩ (Rank #{item['rank']})")
    except Exception as e:
        print(f"Error computing values: {e}")
        exit(1)

