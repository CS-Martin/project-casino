# Offer Dashboard Architecture

## Component Structure

```
src/features/offer-dashboard/
├── components/
│   ├── OfferKpis.tsx          # Main KPI grid component
│   └── OfferKpiCard.tsx       # Enhanced KPI card with trends
├── hooks/
│   └── use-offer-kpis.ts      # React hook for data fetching
├── index.ts                   # Feature exports
├── README.md                  # Documentation
└── ARCHITECTURE.md            # This file
```

## Data Flow

```
Convex Backend
├── convex/offers/queries/getOfferKpis.ts
│   └── Calculates all KPI metrics
├── convex/offers/index.ts
│   └── Exports getOfferKpis query
└── convex/offers/offers.model.ts
    └── Database schema with optimized indexes

React Frontend
├── useOfferKpis hook
│   └── Fetches data using Convex useQuery
├── OfferKpis component
│   └── Renders grid of KPI cards
└── OfferKpiCard component
    └── Individual KPI with trends & tooltips
```

## KPI Metrics

1. **Active Offers** - Latest offers per casino with recent checks
2. **New Offers (7d/30d)** - Offers created in time periods
3. **Expired Offers (7d/30d)** - Deprecated/expired offers
4. **Average Lifetime** - Duration from creation to expiration
5. **Casinos Updated (7d/30d)** - Casinos with offer updates

## Features

- ✅ Real-time data with Convex
- ✅ Responsive grid layout
- ✅ Trend indicators (7d vs 30d)
- ✅ Tooltips with explanations
- ✅ Loading states & error handling
- ✅ Animated number tickers
- ✅ Color-coded variants
- ✅ Performance optimized queries
