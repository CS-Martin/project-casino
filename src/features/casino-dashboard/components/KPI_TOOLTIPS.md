# KPI Card Tooltips - User Guide

## Overview

KPI cards now include helpful tooltips that explain what each metric means, making the dashboard more intuitive and user-friendly.

## Features

### Desktop Experience

- **Hover to Learn**: Simply hover over any KPI card to see a detailed explanation
- **Cursor Indicator**: The cursor changes to a help pointer to indicate tooltip availability
- **Non-intrusive**: Tooltips appear on hover without blocking the view

### Mobile Experience

- **Info Icon**: A small info icon (ℹ️) appears next to the card title on mobile devices
- **Tap to View**: Tap the info icon to see the tooltip explanation
- **Easy to Discover**: The icon is visible but not distracting

## Casino Dashboard KPI Cards

### 1. Total Casinos

- **Tooltip**: "Total number of casinos discovered and stored in the database across all states"
- **Subtitle**: "All casinos"
- **Purpose**: Shows the complete inventory of casinos in the system

### 2. Tracked Casinos

- **Tooltip**: "Casinos actively monitored for promotional offers and updates. These casinos are being researched regularly."
- **Subtitle**: Shows percentage of total casinos
- **Purpose**: Indicates which casinos are being actively monitored
- **Color**: Green (positive metric)

### 3. Untracked Casinos

- **Tooltip**: "Casinos in the database that are not currently being monitored. These may need review or activation."
- **Subtitle**: Shows percentage of total casinos
- **Purpose**: Highlights opportunities to expand monitoring coverage
- **Color**: Red (attention needed)

### 4. Coverage Gap

- **Tooltip**: "Percentage of casinos not being tracked. A lower gap indicates better market coverage and monitoring."
- **Subtitle**: "Opportunity to improve"
- **Purpose**: Provides a quick metric for overall market coverage effectiveness
- **Color**: Red (attention needed)

## Offer Dashboard KPI Cards

### 1. Total Offers (All Time)

- **Tooltip**: "Total number of offers ever created in the system"
- **Subtitle**: "All time"

### 2. Casinos with Offers

- **Tooltip**: "Number of casinos that have offers"
- **Subtitle**: Shows percentage of total casinos

### 3. Active Offers (Current)

- **Tooltip**: "Offers that are currently active and not expired"
- **Subtitle**: "Currently valid"

### 4. Offers Researched Today

- **Tooltip**: "Number of offers researched and added today"
- **Subtitle**: "Today"

## Technical Implementation

### Responsive Design

```tsx
// Desktop: Hover on entire card
<Tooltip>
  <TooltipTrigger asChild className="hidden md:block cursor-help">
    {cardContent}
  </TooltipTrigger>
</Tooltip>

// Mobile: Clickable info icon in header
<Info className="h-3.5 w-3.5 text-muted-foreground cursor-help md:hidden" />
```

### Props

Both KPI card components now support:

- `tooltip?: string` - The explanation text to display
- `subtitle?: string` - Additional context shown below the value

## Benefits

1. **Self-Documenting UI**: Users can understand metrics without external documentation
2. **Better Onboarding**: New users can learn the system independently
3. **Mobile-Friendly**: Info icons make tooltips accessible on touch devices
4. **Progressive Disclosure**: Information is available when needed but doesn't clutter the interface
5. **Consistency**: Same pattern used across both Casino and Offer dashboards
