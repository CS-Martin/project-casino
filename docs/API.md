# API Documentation

Complete API reference for the Casino Intelligence Platform.

## Base URL

- **Development**: `http://localhost:3000`
- **Production**: `https://your-app.vercel.app`

## REST API Endpoints

### Casino Endpoints

#### POST /api/casinos/research

Trigger AI-powered casino discovery across multiple states.

**Request:**

```bash
POST /api/casinos/research
Content-Type: application/json
```

**Response:**

```json
{
  "ok": true,
  "result": {
    "saved": 15,
    "skipped": 3,
    "savedCasinos": [
      {
        "name": "BetMGM Casino",
        "state": "NJ",
        "website": "https://casino.betmgm.com"
      }
    ],
    "duplicates": [
      {
        "discovered": "MGM Casino",
        "existing": "BetMGM Casino",
        "reason": "Similar name found",
        "score": 0.85
      }
    ]
  }
}
```

**Status Codes:**

- `200` - Success
- `500` - Internal server error

---

### Offer Endpoints

#### POST /api/offers/research/batch

Trigger batch offer research for multiple casinos.

**Request:**

```bash
POST /api/offers/research/batch
Content-Type: application/json

{
  "batchSize": 30
}
```

**Parameters:**

- `batchSize` (optional): Number of casinos to research. Default: 30

**Response:**

```json
{
  "ok": true,
  "result": {
    "processedCasinos": 30,
    "offersCreated": 45,
    "offersSkipped": 12,
    "errors": 0,
    "duration": 125000
  }
}
```

---

#### POST /api/offers/research

Research offers for specific casino(s).

**Request:**

```bash
POST /api/offers/research
Content-Type: application/json

{
  "casinoIds": ["casino-id-1", "casino-id-2"]
}
```

**Parameters:**

- `casinoIds` (optional): Array of casino IDs. If not provided, uses smart selection.

**Response:**

```json
{
  "ok": true,
  "offersFound": 12,
  "casinosProcessed": 2
}
```

---

#### GET /api/offers/best

Get the best current offers across all casinos.

**Request:**

```bash
GET /api/offers/best
```

**Response:**

```json
{
  "offers": [
    {
      "casinoName": "BetMGM Casino",
      "offerName": "$1000 Welcome Bonus",
      "expectedBonus": 1000,
      "offerType": "Welcome Bonus",
      "validUntil": "2024-12-31"
    }
  ]
}
```

---

## Convex Functions API

All Convex functions can be called from the client or server using the Convex client.

### Casino Queries

#### getCasinoStats

Get overall casino statistics.

**Usage:**

```typescript
const stats = await convex.query(api.casinos.index.getCasinoStats);
```

**Returns:**

```typescript
{
  total: number;
  tracked: number;
  untracked: number;
  coverageGapPercentage: number;
}
```

---

#### getCasinosPaginated

Get paginated list of casinos with filters.

**Usage:**

```typescript
const result = await convex.query(api.casinos.index.getCasinosPaginated, {
  page: 1,
  pageSize: 20,
  filters: {
    state: 'NJ',
    isTracked: true,
    searchTerm: 'MGM',
  },
});
```

**Parameters:**

- `page` (number): Page number (1-indexed)
- `pageSize` (number): Items per page
- `filters` (optional):
  - `state`: Filter by state abbreviation
  - `isTracked`: Filter by tracking status
  - `searchTerm`: Search casino names

**Returns:**

```typescript
{
  casinos: Casino[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
```

---

#### getCasinosByState

Get all casinos for a specific state.

**Usage:**

```typescript
const casinos = await convex.query(api.casinos.index.getCasinosByState, {
  stateAbbreviation: 'NJ',
});
```

---

#### getCasinosByStateStats

Get casino statistics grouped by state.

**Usage:**

```typescript
const stats = await convex.query(api.casinos.index.getCasinosByStateStats);
```

**Returns:**

```typescript
{
  state: string;
  stateName: string;
  total: number;
  tracked: number;
  untracked: number;
}
[];
```

---

### Casino Mutations

#### toggleTrackCasino

Toggle the tracking status of a casino.

**Usage:**

```typescript
await convex.mutation(api.casinos.index.toggleTrackCasino, {
  casinoId: 'casino-id-123',
});
```

---

#### createCasino

Create a new casino record.

**Usage:**

```typescript
const casinoId = await convex.mutation(api.casinos.index.createCasino, {
  name: 'New Casino',
  website: 'https://newcasino.com',
  license_status: 'Active',
  source_url: 'https://source.com',
  state_id: 'state-id-123',
  is_tracked: true,
});
```

---

### Offer Queries

#### getOfferKpis

Get offer KPI metrics.

**Usage:**

```typescript
const kpis = await convex.query(api.offers.index.getOfferKpis);
```

**Returns:**

```typescript
{
  totalOffers: number;
  casinosWithOffers: number;
  totalCasinos: number;
  casinosWithOffersPercentage: number;
  activeOffers: number;
  offersResearchedToday: number;
}
```

---

#### getOfferTimeline

Get offer research timeline data.

**Usage:**

```typescript
const timeline = await convex.query(api.offers.index.getOfferTimeline, {
  startDate: '2024-01-01',
  endDate: '2024-12-31',
});
```

**Returns:**

```typescript
{
  date: string;
  offersCreated: number;
  offersSkipped: number;
  expiredOffers: number;
  casinosResearched: number;
  researchRuns: number;
}
[];
```

---

#### getOfferTypeBreakdown

Get distribution of offer types.

**Usage:**

```typescript
const breakdown = await convex.query(api.offers.index.getOfferTypeBreakdown);
```

**Returns:**

```typescript
{
  type: string;
  count: number;
  percentage: number;
}
[];
```

---

#### getOfferResearchStatus

Get current research status and statistics.

**Usage:**

```typescript
const status = await convex.query(api.offers.index.getOfferResearchStatus);
```

---

### Discovery Log Queries

#### getDiscoveryLogs

Get casino discovery history.

**Usage:**

```typescript
const { logs, stats } = await convex.query(api.casino_discovery_logs.index.getDiscoveryLogs, { limit: 10 });
```

**Returns:**

```typescript
{
  logs: {
    timestamp: number;
    casinos_discovered: number;
    casinos_saved: number;
    casinos_skipped: number;
    saved_casinos?: Array<{
      name: string;
      state: string;
      website?: string;
    }>;
    duplicates?: Array<{
      discovered: string;
      existing: string;
      reason: string;
      score?: number;
    }>;
    duration_ms: number;
    success: boolean;
    triggered_by: string;
  }[];
  stats: {
    totalRuns: number;
    successfulRuns: number;
    totalDiscovered: number;
    totalSaved: number;
  };
}
```

---

## Error Handling

All API endpoints return errors in this format:

```json
{
  "ok": false,
  "error": "Error message description"
}
```

Common error status codes:

- `400` - Bad request (invalid parameters)
- `401` - Unauthorized (if auth is implemented)
- `404` - Not found
- `500` - Internal server error

## Rate Limiting

Currently, there are no enforced rate limits, but it's recommended to:

- Avoid excessive concurrent requests
- Batch operations when possible
- Cache responses when appropriate

## Authentication

⚠️ **Note**: This API currently has no authentication. All endpoints and Convex functions are publicly accessible.

For production use with sensitive data, implement authentication:

```typescript
// Example protected Convex function
export const protectedFunction = mutation({
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Unauthorized');
    }
    // Your logic here
  },
});
```

## Using the API

### From JavaScript/TypeScript

```typescript
// REST API
const response = await fetch('/api/casinos/research', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
});
const data = await response.json();

// Convex API
import { ConvexHttpClient } from 'convex/browser';
import { api } from './convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);
const stats = await convex.query(api.casinos.index.getCasinoStats);
```

### From cURL

```bash
# Casino discovery
curl -X POST http://localhost:3000/api/casinos/research

# Offer research
curl -X POST http://localhost:3000/api/offers/research/batch \
  -H "Content-Type: application/json" \
  -d '{"batchSize": 10}'
```

### From Python

```python
import requests

# Casino discovery
response = requests.post('http://localhost:3000/api/casinos/research')
data = response.json()

# Offer research
response = requests.post(
    'http://localhost:3000/api/offers/research/batch',
    json={'batchSize': 10}
)
data = response.json()
```
