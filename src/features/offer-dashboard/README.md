# Offer Dashboard Feature

This feature provides comprehensive KPI components for monitoring offer performance in the casino intelligence platform.

## Components

### OfferKpis

Main component that displays a grid of KPI cards for offer metrics.

**Features:**

- Total active offers (latest offers per casino with recent checks)
- Total offers in the system
- Total expired/deprecated offers
- Average offer lifetime
- Number of casinos with updated offers
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

- `totalActiveOffers`: Latest offers per casino with recent checks
- `totalNewOffers`: Total offers in the system
- `totalExpiredOffers`: Total expired/deprecated offers
- `averageOfferLifetime`: Average duration in days
- `totalCasinosWithUpdatedOffers`: Casinos with updated offers
- Additional context metrics

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
