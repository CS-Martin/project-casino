# Promotional Offer Research System

This system provides AI-powered research and management of casino promotional offers for the casino intelligence platform.

## Overview

The system automatically researches current promotional offers for tracked casinos using AI, compares them with existing offers, and updates the database with new or improved offers. It's designed to scale to thousands of casinos while managing API costs and rate limits.

## Architecture

### Database Schema

#### Casinos Table Updates

- `last_offer_check`: Optional timestamp field recording the last research time for each casino
- New indexes: `by_offer_check`, `tracked_by_offer_check`

#### Offers Table Updates

- `source`: Optional string field to tag offers (e.g., "ai_research")
- `is_deprecated`: Boolean flag for offers no longer present in recent research
- `created_at`, `updated_at`: Timestamps for tracking offer lifecycle
- New indexes: `by_source`, `by_casino_source`, `by_deprecated`

### Core Components

1. **Batch Selection Logic** (`getCasinosForOfferResearch`)
   - Prioritizes tracked casinos with oldest `last_offer_check` timestamps
   - Falls back to untracked casinos when all tracked casinos are up-to-date
   - Configurable batch size (default: 30 casinos)

2. **AI Research Service** (`offer-research.service.ts`)
   - Uses OpenAI GPT-4o-mini with web search capabilities
   - Structured prompts for consistent offer extraction
   - Comprehensive error handling and logging

3. **Offer Comparison & Update** (`upsertOffers`)
   - Fuzzy matching on offer name, type, and bonus amounts
   - Intelligent change detection to avoid unnecessary updates
   - Automatic deprecation of offers no longer found

4. **Scheduling & Execution**
   - Daily cron job for automatic batch processing
   - Manual trigger API for on-demand research
   - Configurable batch sizes and intervals

## Usage

### Automatic Processing

The system runs automatically via a daily cron job:

```typescript
// Runs daily at midnight
crons.interval('AI offer research daily', { days: 1 }, internal.offers.processOfferResearchBatch);
```

### Manual Triggering

Trigger research for specific casinos or a batch:

```typescript
// Research specific casinos
await convex.mutation(api.offers.triggerOfferResearch, {
  casinoIds: ['casino1', 'casino2'],
});

// Research next batch of casinos needing updates
await convex.mutation(api.offers.triggerOfferResearch, {
  batchSize: 50,
});
```

### API Endpoints

#### POST `/api/offer/research`

Manually trigger offer research.

**Request Body:**

```json
{
  "casinoIds": ["casino1", "casino2"], // Optional: specific casinos
  "batchSize": 30 // Optional: batch size
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "processed": 25,
    "created": 12,
    "updated": 8,
    "skipped": 5,
    "duration": 45000
  }
}
```

#### GET `/api/offer/research/status`

Get offer research status and statistics.

**Response:**

```json
{
  "success": true,
  "data": {
    "trackedCasinos": {
      "total": 150,
      "neverChecked": 25,
      "checkedToday": 45,
      "checkedThisWeek": 120
    },
    "recentOffers": {
      "totalRecent": 300,
      "createdThisWeek": 45,
      "updatedThisWeek": 23
    },
    "nextCandidates": [...]
  }
}
```

## Monitoring & Logging

### Status Monitoring

```typescript
// Get comprehensive status
const status = await convex.query(api.offers.getOfferResearchStatus, {});

// Get recent activity logs
const logs = await convex.query(api.offers.getOfferResearchLogs, {
  limit: 100,
  level: 'error', // Optional: filter by log level
});
```

### Key Metrics

- **Coverage**: Percentage of tracked casinos researched recently
- **Update Rate**: Number of offers created/updated per batch
- **Error Rate**: Failed research attempts and reasons
- **Performance**: Average processing time per casino

## Configuration

### Batch Size

Adjust batch size based on API limits and processing capacity:

```typescript
// In cron job or manual trigger
{
  batchSize: 50;
} // Larger batches for faster processing
{
  batchSize: 10;
} // Smaller batches for more frequent updates
```

### Research Frequency

Modify cron schedule in `convex/crons.ts`:

```typescript
// More frequent updates
crons.interval('AI offer research every 12 hours', { hours: 12 }, ...);

// Less frequent updates
crons.interval('AI offer research weekly', { days: 7 }, ...);
```

## Error Handling

The system includes comprehensive error handling:

1. **AI Research Failures**: Logged with context, batch continues with remaining casinos
2. **Database Errors**: Individual casino failures don't stop batch processing
3. **Rate Limiting**: Built-in delays and retry logic
4. **Validation**: Schema validation for all AI responses

## Extensibility

### Adding New Offer Types

Update the schema in `offer-research.schema.ts`:

```typescript
export const OfferSchema = z.object({
  // ... existing fields
  offer_type: z.enum([
    // ... existing types
    'new_offer_type', // Add new types here
  ]),
});
```

### Custom Matching Logic

Modify the fuzzy matching in `upsertOffers.ts`:

```typescript
function findMatchingOffer(existingOffers: any[], newOffer: any) {
  // Add custom matching logic here
  // Consider additional fields, different similarity thresholds, etc.
}
```

### Multi-State Research

Extend the system to research offers by state:

```typescript
// Add state-based batch selection
const casinosByState = await ctx.db
  .query('casinos')
  .withIndex('by_state', (q) => q.eq('state_id', stateId))
  .collect();
```

## Performance Considerations

1. **Batch Size**: Balance between processing speed and API rate limits
2. **Indexing**: Proper database indexes for efficient queries
3. **Caching**: Consider caching AI responses for similar requests
4. **Parallel Processing**: Process multiple casinos simultaneously where possible

## Security

1. **API Keys**: Store OpenAI API key securely in environment variables
2. **Rate Limiting**: Implement proper rate limiting for manual triggers
3. **Validation**: Validate all inputs and AI responses
4. **Logging**: Log all operations for audit trails

## Troubleshooting

### Common Issues

1. **No offers found**: Check casino websites are accessible, verify AI prompts
2. **High error rate**: Review API limits, check network connectivity
3. **Slow processing**: Reduce batch size, optimize database queries
4. **Duplicate offers**: Adjust fuzzy matching thresholds

### Debug Mode

Enable detailed logging:

```typescript
import { logger } from '../lib/logger';

logger.debug('Processing casino', { casinoId, casinoName });
```

## Future Enhancements

1. **User Preferences**: Allow users to customize research frequency per casino
2. **Offer Alerts**: Notify users when new high-value offers are found
3. **Historical Tracking**: Track offer changes over time
4. **Multi-Language Support**: Research offers in different languages
5. **Integration**: Connect with external offer aggregation services
