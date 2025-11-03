"""
Main orchestrator script.
Fetches prices, computes ZEC values, and uploads to Supabase.
"""
import sys
import logging
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from scripts.fetch_prices import fetch_prices
from scripts.compute_zec_values import compute_zec_values
from config.supabase_config import get_supabase_url, get_supabase_key
from supabase import create_client, Client


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def upload_to_supabase(data: list[dict]) -> bool:
    """
    Upload computed data to Supabase.
    
    Args:
        data: List of dictionaries ready for database insertion.
    
    Returns:
        True if successful, False otherwise.
    """
    try:
        # Initialize Supabase client
        supabase_url = get_supabase_url()
        supabase_key = get_supabase_key()
        
        supabase: Client = create_client(supabase_url, supabase_key)
        
        # Insert records (Supabase client handles batch insertion)
        logger.info(f"Uploading {len(data)} records to Supabase...")
        
        response = supabase.table("zmc_prices").insert(data).execute()
        
        if response.data:
            logger.info(f"Successfully inserted {len(response.data)} records")
            return True
        else:
            logger.error("No data returned from Supabase insert")
            return False
            
    except Exception as e:
        logger.error(f"Error uploading to Supabase: {e}", exc_info=True)
        return False


def main():
    """Main execution function."""
    try:
        # Step 1: Fetch prices from CoinGecko
        logger.info("Fetching prices from CoinGecko...")
        coingecko_data = fetch_prices()
        logger.info(f"Fetched data for {len(coingecko_data)} assets")
        
        # Step 2: Compute ZEC-denominated values
        logger.info("Computing ZEC-denominated values...")
        computed_data = compute_zec_values(coingecko_data)
        logger.info(f"Computed values for {len(computed_data)} assets")
        
        # Step 3: Upload to Supabase
        logger.info("Uploading to Supabase...")
        success = upload_to_supabase(computed_data)
        
        if success:
            logger.info("✅ Successfully updated Supabase with new market data")
            
            # Print summary
            print("\n📊 Market Data Summary:")
            print("-" * 60)
            for asset in computed_data[:10]:  # Show top 10
                change_str = f"{asset['pct_change_24h_zec']:+.2f}%" if asset['pct_change_24h_zec'] is not None else "N/A"
                print(
                    f"#{asset['rank']:2d} {asset['asset_symbol']:4s} | "
                    f"Price: {asset['asset_price_zec']:12.6f} ⓩ | "
                    f"Market Cap: {asset['market_cap_zec']:>15,.0f} ⓩ | "
                    f"24h: {change_str:>8s}"
                )
            return 0
        else:
            logger.error("❌ Failed to update Supabase")
            return 1
            
    except Exception as e:
        logger.error(f"Fatal error: {e}", exc_info=True)
        return 1


if __name__ == "__main__":
    exit(main())

