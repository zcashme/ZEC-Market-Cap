# Frontend Documentation

## Overview

The frontend is a React + TypeScript application built with Vite, displaying cryptocurrency market data denominated in ZEC. It connects to Supabase for data and is deployed to GitHub Pages.

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Supabase JS** - Database client
- **Recharts** - Chart library

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx      # Main dashboard container
│   │   ├── MarketTable.tsx    # Sortable market data table
│   │   ├── StatsCard.tsx       # Summary statistics cards
│   │   └── TrendChart.tsx      # Price trend visualization
│   ├── lib/
│   │   └── supabase.ts         # Supabase client & types
│   ├── App.tsx                 # Root component
│   └── main.tsx                # Entry point
├── public/                     # Static assets
└── dist/                       # Build output (for deployment)
```

## Components

### Dashboard.tsx

Main container component that:
- Fetches latest market data from Supabase
- Displays loading and error states
- Renders StatsSummary and MarketTable

**State Management**:
- Uses React hooks (`useState`, `useEffect`)
- Fetches data on component mount
- Handles async data loading

### MarketTable.tsx

Sortable table displaying all market data.

**Features**:
- Sortable columns (rank, name, price, market cap, 1h/24h/7d changes)
- Click headers to sort ascending/descending
- Color-coded percentage changes (green = positive, red = negative)
- Responsive design with horizontal scroll on mobile

**Columns**:
1. Rank
2. Name (with symbol)
3. Price (in ZEC)
4. Market Cap (formatted: K/M/B)
5. 1h Change (%)
6. 24h Change (%)
7. 7d Change (%)

**Sorting**:
- Click column header to sort
- Click again to reverse order
- Arrow indicators (↑/↓) show current sort

### StatsCard.tsx & StatsSummary

Displays summary statistics:
- Total Market Cap (ZEC and USD equivalent)
- Number of tracked assets
- Average 24h change

### TrendChart.tsx

Visualizes price trends over time using Recharts.

## Data Fetching

### Supabase Client

Located in `src/lib/supabase.ts`:

```typescript
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
```

### Fetch Function

`fetchLatestMarketData()`:
1. Gets the latest timestamp from database
2. Fetches all records with that timestamp
3. Orders by rank ascending
4. Returns typed array of `ZMCPrice[]`

## Configuration

### Environment Variables

Create `frontend/.env.local`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Important**: Vite requires `VITE_` prefix for environment variables.

### Build Configuration

- **Vite Config**: `vite.config.ts`
- **TypeScript Config**: `tsconfig.json`
- **Tailwind Config**: `tailwind.config.js`

## Development

### Start Dev Server

```bash
cd frontend
npm install
npm run dev
```

Server runs on `http://localhost:5173`

### Build for Production

```bash
npm run build
```

Output in `frontend/dist/`

### Preview Production Build

```bash
npm run preview
```

## Styling

### Tailwind CSS

Utility-first CSS framework. Classes used:
- `bg-white`, `text-gray-900` - Colors
- `px-6 py-4` - Spacing
- `rounded-lg`, `shadow-md` - Effects
- `hover:bg-gray-50` - Interactions
- `flex`, `grid` - Layout

### Responsive Design

- Mobile-first approach
- Breakpoints: `md:` (768px+)
- Horizontal scroll on small screens for tables

## Type Safety

All components use TypeScript:
- Props are typed with interfaces
- Data from Supabase is typed with `ZMCPrice`
- No `any` types (ESLint enforced)

## Error Handling

- Network errors displayed to user
- Loading states during data fetch
- Graceful degradation if data missing

## Performance

- Data fetched once on mount
- Memoized sorting calculations
- Efficient re-renders with React hooks

## Deployment

See `docs/deployment.md` for GitHub Pages deployment details.

