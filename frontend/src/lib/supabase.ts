import { createClient } from '@supabase/supabase-js'

// Supabase configuration
// These should be set as environment variables or in a config file
// For GitHub Pages, we can use public anon key (read-only)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
  console.error('Current VITE_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing')
  console.error('Current VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Missing')
}

// Create client with fallback to prevent crashes
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-key')

export interface ZMCPrice {
  id: string
  timestamp: string
  asset_symbol: string
  asset_name: string
  asset_price_zec: number
  market_cap_zec: number
  rank: number
  pct_change_1h_zec: number | null
  pct_change_24h_zec: number | null
  pct_change_7d_zec: number | null
  zec_price_usd: number
  data_source: string
  created_at: string
}

/**
 * Fetch the latest market data from Supabase.
 */
export async function fetchLatestMarketData(): Promise<ZMCPrice[]> {
  try {
    // Get the latest timestamp
    const { data: latestData, error: timestampError } = await supabase
      .from('zmc_prices')
      .select('timestamp')
      .order('timestamp', { ascending: false })
      .limit(1)
      .single()

    if (timestampError || !latestData) {
      throw new Error('Could not fetch latest timestamp')
    }

    // Fetch all records with that timestamp
    const { data, error } = await supabase
      .from('zmc_prices')
      .select('*')
      .eq('timestamp', latestData.timestamp)
      .order('rank', { ascending: true })

    if (error) {
      throw error
    }

    return data as ZMCPrice[]
  } catch (error) {
    console.error('Error fetching market data:', error)
    throw error
  }
}

