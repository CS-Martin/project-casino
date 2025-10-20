# Analytics Dashboard

## Overview

A comprehensive analytics dashboard for casino tracking application built with Next.js 14, TypeScript, Tailwind CSS, and shadcn/ui components.

## Features

### Executive Summary KPI Cards

- **Total Casinos**: Shows the total number of casinos in the system
- **Tracked Casinos**: Displays casinos currently being tracked (green theme)
- **Untracked Casinos**: Shows casinos not being tracked (red theme)
- **Coverage Gap Percentage**: Calculates the percentage of untracked casinos (red theme)

### State-by-State Market Analysis

- Interactive bar chart showing casino distribution by state
- Stacked bars displaying tracked vs untracked casinos
- Responsive design that works on mobile and desktop
- Professional color scheme with proper theming

### Additional Features

- Skeleton loading states for all components
- Responsive grid layout (2x2 on mobile, 4x1 on desktop)
- Professional styling with hover effects
- Summary section with actionable insights
- Navigation integration with sidebar

## Technical Implementation

### Backend (Convex)

- `getCasinoStats`: Calculates overall casino statistics
- `getCasinosByStateStats`: Groups casinos by state with tracked/untracked counts
- Proper TypeScript interfaces and error handling

### Frontend (Next.js)

- Client-side components with Convex React hooks
- shadcn/ui components for consistent design
- Recharts for data visualization
- Responsive design with Tailwind CSS
- Loading states with skeleton components

### Data Flow

1. Convex queries fetch casino data from database
2. Data is processed and aggregated on the server
3. React components consume the processed data
4. Charts and KPI cards display the information
5. Loading states provide smooth user experience

## File Structure

```
src/app/(main)/dashboard/analytics/
├── page.tsx                 # Main analytics page component

convex/casinos/queries/
├── getCasinoStats.ts        # Overall casino statistics
└── getCasinosByStateStats.ts # State-specific statistics

src/components/layout/
└── sidebar.tsx              # Updated with analytics navigation
```

## Usage

Navigate to `/dashboard/analytics` to view the comprehensive analytics dashboard. The page automatically loads casino data and displays:

1. KPI cards with real-time statistics
2. Interactive state-by-state bar chart
3. Summary section with actionable insights
4. Responsive design for all screen sizes

## Styling

- Uses shadcn/ui design system
- Consistent color scheme (green for positive, red for negative metrics)
- Professional hover effects and animations
- Mobile-first responsive design
- Dark/light theme support
