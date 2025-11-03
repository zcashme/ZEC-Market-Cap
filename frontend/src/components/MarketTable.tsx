import React, { useState, useMemo } from 'react'
import { ZMCPrice } from '../lib/supabase'

interface MarketTableProps {
  data: ZMCPrice[]
}

type SortField = 'rank' | 'asset_name' | 'asset_price_zec' | 'market_cap_zec' | 'pct_change_24h_zec'
type SortDirection = 'asc' | 'desc'

export const MarketTable: React.FC<MarketTableProps> = ({ data }) => {
  const [sortField, setSortField] = useState<SortField>('rank')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const sortedData = useMemo(() => {
    const sorted = [...data].sort((a, b) => {
      let aVal: number | string
      let bVal: number | string

      switch (sortField) {
        case 'rank':
          aVal = a.rank
          bVal = b.rank
          break
        case 'asset_name':
          aVal = a.asset_name
          bVal = b.asset_name
          break
        case 'asset_price_zec':
          aVal = a.asset_price_zec
          bVal = b.asset_price_zec
          break
        case 'market_cap_zec':
          aVal = a.market_cap_zec
          bVal = b.market_cap_zec
          break
        case 'pct_change_24h_zec':
          aVal = a.pct_change_24h_zec ?? 0
          bVal = b.pct_change_24h_zec ?? 0
          break
        default:
          return 0
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }

      return sortDirection === 'asc' 
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number)
    })

    return sorted
  }, [data, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const formatNumber = (num: number, decimals: number = 2): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num)
  }

  const formatMarketCap = (num: number): string => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B ⓩ`
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M ⓩ`
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K ⓩ`
    return `${formatNumber(num)} ⓩ`
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('rank')}
              >
                <div className="flex items-center gap-1">
                  Rank
                  {sortField === 'rank' && (
                    <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('asset_name')}
              >
                <div className="flex items-center gap-1">
                  Name
                  {sortField === 'asset_name' && (
                    <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('asset_price_zec')}
              >
                <div className="flex items-center gap-1">
                  Price
                  {sortField === 'asset_price_zec' && (
                    <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('market_cap_zec')}
              >
                <div className="flex items-center gap-1">
                  Market Cap
                  {sortField === 'market_cap_zec' && (
                    <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('pct_change_24h_zec')}
              >
                <div className="flex items-center gap-1">
                  24h Change
                  {sortField === 'pct_change_24h_zec' && (
                    <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.map((asset) => (
              <tr key={asset.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{asset.rank}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{asset.asset_name}</div>
                  <div className="text-sm text-gray-500">{asset.asset_symbol}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatNumber(asset.asset_price_zec, 6)} ⓩ
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatMarketCap(asset.market_cap_zec)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {asset.pct_change_24h_zec !== null ? (
                    <span
                      className={`font-medium ${
                        asset.pct_change_24h_zec >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {asset.pct_change_24h_zec >= 0 ? '+' : ''}
                      {formatNumber(asset.pct_change_24h_zec)}%
                    </span>
                  ) : (
                    <span className="text-gray-400">N/A</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

