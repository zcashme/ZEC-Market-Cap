"""
Fetch cryptocurrency prices from CoinGecko API.
Handles rate limiting and retries.
"""
import json
import os
import time
import requests
from typing import Dict, Any, Optional
from pathlib import Path


# CoinGecko API endpoint
COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3"
COINGECKO_RATE_LIMIT_DELAY = 1.2  # seconds between requests (free tier: 50 calls/minute)


def load_assets() -> list[str]:
    """Load asset list from config file."""
    config_path = Path(__file__).parent.parent / "config" / "assets.json"
    with open(config_path, "r") as f:
        return json.load(f)


def fetch_prices(
    assets: Optional[list[str]] = None,
    max_retries: int = 3,
    retry_delay: float = 2.0
) -> Dict[str, Any]:
    """
    Fetch prices from CoinGecko API.
    
    Args:
        assets: List of CoinGecko asset IDs. If None, loads from config.
        max_retries: Maximum number of retry attempts.
        retry_delay: Delay between retries in seconds.
    
    Returns:
        Dictionary with price data from CoinGecko.
    
    Raises:
        requests.RequestException: If API request fails after retries.
    """
    if assets is None:
        assets = load_assets()
    
    # Build API URL - use /coins/markets endpoint to get 1h, 24h, and 7d price changes
    asset_ids = ",".join(assets)
    url = f"{COINGECKO_BASE_URL}/coins/markets"
    
    params = {
        "ids": asset_ids,
        "vs_currency": "usd",
        "order": "market_cap_desc",
        "per_page": 250,
        "page": 1,
        "sparkline": "false",
        "price_change_percentage": "1h,24h,7d"
    }
    
    # Retry logic
    last_error = None
    for attempt in range(max_retries):
        try:
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            market_data = response.json()
            
            # Validate that we got data
            if not market_data or not isinstance(market_data, list):
                raise ValueError("Invalid API response format")
            
            # Check if ZEC data exists
            zec_data = next((item for item in market_data if item.get("id") == "zcash"), None)
            if not zec_data or "current_price" not in zec_data:
                raise ValueError("ZEC price data not found in API response")
            
            # Convert market data format to the format expected by compute_zec_values
            # Transform from list of market objects to dict keyed by asset ID
            data = {}
            for item in market_data:
                asset_id = item.get("id")
                if asset_id:
                    data[asset_id] = {
                        "usd": item.get("current_price", 0),
                        "usd_market_cap": item.get("market_cap", 0),
                        "usd_24h_change": item.get("price_change_percentage_24h"),
                        "usd_1h_change": item.get("price_change_percentage_1h_in_currency"),
                        "usd_7d_change": item.get("price_change_percentage_7d_in_currency")
                    }
            
            # Optional: Save raw response for audit trail
            raw_dir = Path(__file__).parent.parent.parent / "data" / "raw"
            raw_dir.mkdir(parents=True, exist_ok=True)
            
            timestamp_str = time.strftime("%Y%m%d_%H%M%S")
            raw_file = raw_dir / f"coingecko_{timestamp_str}.json"
            with open(raw_file, "w") as f:
                json.dump(market_data, f, indent=2)
            
            return data
            
        except requests.RequestException as e:
            last_error = e
            if attempt < max_retries - 1:
                time.sleep(retry_delay * (attempt + 1))  # Exponential backoff
            else:
                raise
    
    raise last_error or Exception("Failed to fetch prices")


if __name__ == "__main__":
    # Test the fetch function
    try:
        data = fetch_prices()
        print("Successfully fetched prices:")
        for asset_id, price_data in data.items():
            print(f"  {asset_id}: ${price_data.get('usd', 'N/A')} (1h: {price_data.get('usd_1h_change', 'N/A')}%, 24h: {price_data.get('usd_24h_change', 'N/A')}%, 7d: {price_data.get('usd_7d_change', 'N/A')}%)")
    except Exception as e:
        print(f"Error fetching prices: {e}")
        exit(1)

