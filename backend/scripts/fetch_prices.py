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
    
    # Build API URL
    asset_ids = ",".join(assets)
    url = f"{COINGECKO_BASE_URL}/simple/price"
    
    params = {
        "ids": asset_ids,
        "vs_currencies": "usd",
        "include_market_cap": "true",
        "include_24hr_change": "true"
    }
    
    # Retry logic
    last_error = None
    for attempt in range(max_retries):
        try:
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            # Validate that ZEC data exists
            if "zcash" not in data or "usd" not in data["zcash"]:
                raise ValueError("ZEC price data not found in API response")
            
            # Optional: Save raw response for audit trail
            raw_dir = Path(__file__).parent.parent.parent / "data" / "raw"
            raw_dir.mkdir(parents=True, exist_ok=True)
            
            timestamp_str = time.strftime("%Y%m%d_%H%M%S")
            raw_file = raw_dir / f"coingecko_{timestamp_str}.json"
            with open(raw_file, "w") as f:
                json.dump(data, f, indent=2)
            
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
            print(f"  {asset_id}: ${price_data.get('usd', 'N/A')}")
    except Exception as e:
        print(f"Error fetching prices: {e}")
        exit(1)

