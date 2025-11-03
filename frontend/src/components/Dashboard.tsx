import React, { useState, useEffect } from 'react'
import { fetchLatestMarketData, ZMCPrice } from '../lib/supabase'
import { MarketTable } from './MarketTable'
import { TrendChart } from './TrendChart'

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<ZMCPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        const marketData = await fetchLatestMarketData()
        setData(marketData)
        setLastUpdate(new Date())
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load market data')
        console.error('Error loading market data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
    // Refresh every 5 minutes
    const interval = setInterval(loadData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (loading && data.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading market data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️ Error</div>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                ⓩ ZEC Market Cap
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Cryptocurrency prices denominated in Zcash
              </p>
            </div>
            {lastUpdate && (
              <div className="text-right">
                <p className="text-sm text-gray-500">Last updated</p>
                <p className="text-sm font-medium text-gray-900">
                  {lastUpdate.toLocaleTimeString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Trend Chart */}
        <div className="mb-6">
          <TrendChart data={data} />
        </div>

        {/* Market Table */}
        <div>
          <MarketTable data={data} />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            Data sourced from{' '}
            <a
              href="https://www.coingecko.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700"
            >
              CoinGecko
            </a>
            {' '}• Updated hourly
          </p>
        </div>
      </footer>
    </div>
  )
}

