"""
Supabase configuration loader.
Loads credentials from environment variables.
"""
import os
from typing import Optional


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

