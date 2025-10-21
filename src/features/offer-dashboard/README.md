# Offer Dashboard Feature

This feature provides comprehensive KPI components for monitoring offer performance in the casino intelligence platform.

## Components

### OfferKpis

Main component that displays a grid of KPI cards for offer metrics.

**Features:**

- Total offers (all time) - Complete count of all offers ever created
- Casinos with offers - Count and percentage of casinos that have offers
- Active offers (current) - Currently valid offers that are not expired
- Superior offers found - High-value offers with bonus >= $100 or 100%+ match
- Percentage indicators for context
- Tooltips with detailed explanations
- Responsive grid layout

### OfferKpiCard

Enhanced KPI card component with advanced features.

**Features:**

- Animated number ticker
- Trend indicators with percentage changes
- Tooltips for detailed explanations
- Subtitle text for additional context
- Color-coded variants (positive/negative/default)
- Loading states with skeleton
- Hover effects

## Hooks

### useOfferKpis

Custom hook for fetching offer KPI data from Convex.

**Returns:**

- `kpis`: OfferKpis data object
- `isLoading`: Loading state
- `error`: Error state (if any)

## Data Structure

The KPI data includes:

- `totalOffers`: Total offers ever created (all time)
- `casinosWithOffers`: Number of casinos that have offers
- `totalCasinos`: Total number of casinos in the system
- `casinosWithOffersPercentage`: Percentage of casinos with offers
- `activeOffers`: Currently active offers (not expired)
- `superiorOffers`: High-value offers (bonus >= $100 or 100%+ match)

## Usage

```tsx
import { OfferKpis } from '@/features/offer-dashboard';

export default function OfferDashboard() {
  return (
    <div>
      <h1>Offer Dashboard</h1>
      <OfferKpis />
    </div>
  );
}
```

## Dependencies

- Convex for data fetching
- shadcn/ui components (Card, Tooltip, Skeleton)
- Lucide React for icons
- NumberTicker for animated values
