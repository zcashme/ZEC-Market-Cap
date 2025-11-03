import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { ZMCPrice } from '../lib/supabase'

interface TrendChartProps {
  data: ZMCPrice[]
}

export const TrendChart: React.FC<TrendChartProps> = ({ data }) => {
  // Prepare data for chart (show top 10 by market cap)
  const chartData = data
    .slice(0, 10)
    .map(asset => ({
      symbol: asset.asset_symbol,
      name: asset.asset_name,
      change: asset.pct_change_24h_zec ?? 0,
    }))

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        24h Price Change (Top 10 by Market Cap)
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="symbol"
            angle={-45}
            textAnchor="end"
            height={80}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            label={{ value: 'Change (%)', angle: -90, position: 'insideLeft' }}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={(value: number) => [
              `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`,
              '24h Change',
            ]}
            labelFormatter={(label, payload) => {
              if (payload && payload[0]) {
                return payload[0].payload.name
              }
              return label
            }}
          />
          <Bar dataKey="change" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.change >= 0 ? '#10b981' : '#ef4444'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

