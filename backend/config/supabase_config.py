"""
Supabase configuration loader.
Loads credentials from environment variables.
"""
import os
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv

# Load .env file from backend directory
backend_dir = Path(__file__).parent.parent
env_file = backend_dir / ".env"
if env_file.exists():
    load_dotenv(env_file)
else:
    # Try loading from current directory as fallback
    load_dotenv()


def get_supabase_url() -> str:
    """Get Supabase URL from environment variable."""
    url = os.getenv("SUPABASE_URL")
    if not url:
        raise ValueError("SUPABASE_URL environment variable is not set")
    return url


def get_supabase_key() -> str:
    """Get Supabase service role key from environment variable."""
    key = os.getenv("SUPABASE_KEY")
    if not key:
        raise ValueError("SUPABASE_KEY environment variable is not set")
    return key


def get_supabase_anon_key() -> Optional[str]:
    """Get Supabase anon key (for frontend)."""
    return os.getenv("SUPABASE_ANON_KEY")

