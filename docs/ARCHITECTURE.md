# System Architecture

Technical architecture overview of the Casino Intelligence Platform.

## System Overview

The Casino Intelligence Platform is a full-stack application built on modern serverless architecture, combining Next.js for the frontend with Convex for the real-time backend and AI-powered data processing.

```
┌─────────────────────────────────────────────────────────┐
│                    Client Browser                        │
│  ┌─────────────────────────────────────────────────┐   │
│  │           Next.js Application                    │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐      │   │
│  │  │ Casino   │  │  Offer   │  │  Shared  │      │   │
│  │  │Dashboard │  │Dashboard │  │Components│      │   │
│  │  └──────────┘  └──────────┘  └──────────┘      │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────┬──────────────────┬────────────────────┘
                  │                  │
                  ▼                  ▼
         ┌────────────────┐  ┌──────────────────┐
         │   REST API     │  │  Convex Client   │
         │  (/api/*)      │  │   (WebSocket)    │
         └────────┬───────┘  └────────┬─────────┘
                  │                   │
                  │ ┌─────────────────┴─────────┐
                  │ │                           │
                  ▼ ▼                           ▼
         ┌──────────────────┐    ┌─────────────────────────┐
         │ Upstash Redis    │    │   Convex Backend        │
         │   (Caching)      │    │  ┌─────────────────┐   │
         │   [Optional]     │    │  │  Queries        │   │
         └──────────────────┘    │  └─────────────────┘   │
                                 │  ┌─────────────────┐   │
                                 │  │  Mutations      │   │
                                 │  └─────────────────┘   │
                                 │  ┌─────────────────┐   │
                                 │  │  Actions        │   │
                                 │  └─────────────────┘   │
                                 │  ┌─────────────────┐   │
                                 │  │  Cron Jobs      │   │
                                 │  └─────────────────┘   │
                                 └────────┬────────────────┘
                                          │
                                          ▼
                                 ┌────────────────┐
                                 │  OpenAI GPT-4  │
                                 │  (Web Search)  │
                                 └────────────────┘
```

## Technology Stack

### Frontend Layer

**Next.js 15.5**

- App Router for file-based routing
- React Server Components for performance
- Server-side rendering (SSR) and static generation (SSG)
- API routes for backend integration

**TypeScript 5.0**

- Full type safety across the application
- Enhanced developer experience with IntelliSense
- Compile-time error detection

**Tailwind CSS 4.0**

- Utility-first CSS framework
- Custom design system
- Dark mode support with next-themes

**UI Components**

- **shadcn/ui**: Pre-built accessible components
- **Radix UI**: Headless UI primitives
- **Recharts**: Data visualization
- **Lucide React**: Icon system

### Backend Layer

**Convex**

- Serverless real-time database
- TypeScript-native with automatic type generation
- Built-in reactivity and subscriptions
- Scheduled jobs (cron) support
- Optimistic UI updates

**Key Convex Features Used:**

- **Queries**: Real-time data fetching
- **Mutations**: Transactional database writes
- **Actions**: Long-running async operations (AI calls)
- **Cron Jobs**: Scheduled automation
- **Indexes**: Optimized query performance

### AI Layer

**OpenAI GPT-4o-mini**

- Function calling for structured outputs
- Web search capabilities via tools
- Zod schema validation
- Cost-optimized mini model

### Data Storage

**Convex Database**

- Document-based NoSQL database
- Real-time synchronization
- ACID transactions
- Automatic indexing

**Upstash Redis (Optional)**

- Response caching
- Rate limiting
- Session storage

## Architecture Patterns

### Feature-Based Organization

The codebase follows a feature-based architecture:

```
src/features/
├── casino-dashboard/       # Casino UI and logic
├── casino-discovery/       # AI discovery system
├── offer-dashboard/        # Offer UI and logic
└── promotional-research/   # AI research system
```

Each feature is self-contained with:

- Components (UI)
- Hooks (data fetching)
- Services (business logic)
- Schemas (validation)

### Separation of Concerns

**Frontend (src/)**

- UI Components
- Client-side state management
- Data presentation
- User interactions

**Backend (convex/)**

- Database operations
- Business logic
- AI integrations
- Scheduled tasks

**Services (src/features/\*/services/)**

- Reusable business logic
- External API integrations
- Data transformation

## Data Flow

### Casino Discovery Flow

```
User/Cron Trigger
     │
     ▼
POST /api/casinos/research
     │
     ▼
Convex Action: scheduledCasinoDiscovery
     │
     ├─► OpenAI GPT-4 (Web Search)
     │        │
     │        ▼
     │   Structured Casino Data
     │
     ├─► Duplicate Detection Service
     │        │
     │        ├─► String Similarity Check
     │        ├─► Website Comparison
     │        └─► Threshold Matching (80%)
     │
     ├─► Create Casino Records (Mutations)
     │
     └─► Create Discovery Log
          │
          ▼
     Dashboard Update (Real-time)
```

### Offer Research Flow

```
Cron Job (Daily) / Manual Trigger
     │
     ▼
Convex Action: processOfferResearchBatchAction
     │
     ├─► Select Casinos (70% tracked, 30% untracked)
     │
     ├─► For Each Casino:
     │    │
     │    ├─► OpenAI GPT-4 (Web Search)
     │    │        │
     │    │        ▼
     │    │   Promotional Offers Data
     │    │
     │    ├─► Zod Schema Validation
     │    │
     │    ├─► Create Offer Records
     │    │
     │    └─► Update Casino Timestamp
     │
     └─► Create Research Log
          │
          ▼
     Dashboard Update (Real-time)
```

## Database Schema

### Core Tables

**casinos**

- Primary entity for casino data
- Indexed by state and tracking status
- References state table

**offers**

- Promotional offer details
- References casino table
- Tracks creation and deprecation

**states**

- US state information
- Referenced by casinos

**casino_discovery_logs**

- Audit trail for discoveries
- Tracks saved and duplicate casinos
- Performance metrics

**offer_research_logs**

- Audit trail for offer research
- Success/failure tracking
- Performance metrics

### Indexes

```typescript
// casinos
.index('by_state', ['state_id'])
.index('by_tracking', ['is_tracked'])
.index('by_last_check', ['last_offer_check'])

// offers
.index('by_casino', ['casino_id'])
.index('by_created', ['created_at'])
.index('by_deprecated', ['is_deprecated'])

// logs
.index('by_timestamp', ['timestamp'])
.index('by_success', ['success'])
```

## Key Components

### Casino Dashboard

**Components:**

- KPI Cards with tooltips
- Market coverage pie chart
- State distribution bar chart
- Discovery history table with resizable panels
- Casino list with search and pagination

**Data Sources:**

- `getCasinoStats` - KPI metrics
- `getCasinosByStateStats` - State breakdown
- `getDiscoveryLogs` - Discovery history
- `getCasinosPaginated` - Casino list

### Offer Dashboard

**Components:**

- Offer KPI cards
- Timeline chart (5 metrics)
- Offer type breakdown chart
- Detailed offer cards

**Data Sources:**

- `getOfferKpis` - KPI metrics
- `getOfferTimeline` - Timeline data
- `getOfferTypeBreakdown` - Type distribution
- `getOfferResearchLogs` - Research history

## AI Integration

### Discovery AI Agent

**Model**: GPT-4o-mini with web search

**Process:**

1. Receives state abbreviation as input
2. Searches web for licensed casinos
3. Extracts structured data using function calling
4. Validates against Zod schema
5. Returns casino array

**Schema:**

```typescript
{
  state_abbreviation: string;
  casinos: Array<{
    casino_name: string;
    website?: string;
    license_status?: string;
    source_url?: string;
  }>;
}
```

### Research AI Agent

**Model**: GPT-4o-mini with web search

**Process:**

1. Receives casino name and website
2. Searches for promotional offers
3. Extracts offer details using function calling
4. Validates against Zod schema
5. Returns offer array

**Schema:**

```typescript
{
  offers: Array<{
    offer_name: string;
    offer_type?: string;
    expected_deposit?: number;
    expected_bonus?: number;
    description?: string;
    terms?: string;
    valid_until?: string;
    wagering_requirement?: number;
    min_deposit?: number;
    max_bonus?: number;
  }>;
}
```

## Performance Optimizations

### Frontend

- React Server Components for reduced bundle size
- Code splitting per route
- Image optimization with Next.js Image
- Lazy loading of heavy components

### Backend

- Indexed queries for fast lookups
- Batched operations to reduce function calls
- Caching with Redis (optional)
- Optimistic UI updates

### AI

- Batch processing to reduce API calls
- Efficient prompts to minimize tokens
- Caching of responses (when applicable)
- Error handling and retries

## Security Considerations

### Current State

⚠️ No authentication implemented - suitable for demos only

### Recommended for Production

- Implement Convex auth
- Add role-based access control
- API rate limiting
- Input validation on all mutations
- Secure environment variables

## Scalability

### Horizontal Scaling

- Convex handles auto-scaling
- Serverless architecture scales with demand
- No infrastructure management needed

### Optimization Opportunities

- Implement caching layer
- Add CDN for static assets
- Optimize database queries with indexes
- Batch AI operations more aggressively

## Monitoring & Observability

### Available Tools

- Convex dashboard for function metrics
- Vercel analytics for frontend performance
- OpenAI usage dashboard
- Custom logging in Convex functions

### Recommended Additions

- Error tracking (Sentry)
- Performance monitoring (New Relic)
- Custom dashboards (Grafana)
- Alert system for failures

## Future Architecture Enhancements

### Potential Improvements

1. **Authentication**: Add user auth with Clerk or Convex Auth
2. **Caching**: Implement Redis caching layer
3. **Queue System**: Add job queue for heavy operations
4. **Webhooks**: External integrations via webhooks
5. **GraphQL**: Optional GraphQL layer over Convex
6. **Testing**: Add comprehensive test suite
7. **CI/CD**: Automated testing and deployment

### Scaling Considerations

- Multi-region deployment
- Edge functions for global performance
- Database sharding if needed
- Rate limiting per user
- API versioning
