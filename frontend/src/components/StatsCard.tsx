import React from 'react'
import { ZMCPrice } from '../lib/supabase'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: string
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, subtitle, icon }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {icon && (
          <div className="text-4xl opacity-20">{icon}</div>
        )}
      </div>
    </div>
  )
}

interface StatsSummaryProps {
  data: ZMCPrice[]
}

export const StatsSummary: React.FC<StatsSummaryProps> = ({ data }) => {
  const totalMarketCap = data.reduce((sum, asset) => sum + asset.market_cap_zec, 0)
  const avgChange = data
    .filter(asset => asset.pct_change_24h_zec !== null)
    .reduce((sum, asset) => sum + (asset.pct_change_24h_zec || 0), 0) / data.length

  const zecPrice = data.find(a => a.asset_symbol === 'ZEC')?.zec_price_usd || 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <StatsCard
        title="Total Market Cap"
        value={`${(totalMarketCap / 1e6).toFixed(2)}M ⓩ`}
        subtitle={`≈ $${(totalMarketCap * zecPrice / 1e6).toFixed(2)}M USD`}
        icon="📊"
      />
      <StatsCard
        title="Tracked Assets"
        value={data.length}
        subtitle="Cryptocurrencies"
        icon="💰"
      />
      <StatsCard
        title="Avg 24h Change"
        value={`${avgChange >= 0 ? '+' : ''}${avgChange.toFixed(2)}%`}
        subtitle="All assets"
        icon="📈"
      />
    </div>
  )
}

