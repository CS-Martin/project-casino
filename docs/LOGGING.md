# Logging Guide

## Overview

The Casino Intelligence Platform uses a structured logging system optimized for production environments to minimize resource consumption and costs.

## Production-First Approach

**Default Behavior:**

- **Development**: All log levels enabled (`debug`, `info`, `warn`, `error`)
- **Production**: Only `error` logs enabled by default
- **Test**: All logging disabled

This approach minimizes logging costs in production while maintaining full visibility during development.

## Configuration

### Environment Variable

Control log verbosity with the `LOG_LEVEL` environment variable:

```bash
# .env.local or production environment
LOG_LEVEL=error  # default in production
```

**Available Levels:**

- `error` - Only errors (recommended for production)
- `warn` - Warnings and errors
- `info` - Informational messages, warnings, and errors
- `debug` - All messages including debug information (development only)

### Deployment Configuration

**Vercel:**

```bash
vercel env add LOG_LEVEL
# Enter value: error (or warn for more visibility)
```

**Convex:**
Logging is handled in the Next.js layer, not in Convex functions.

## Log Levels

### 1. Error (`logger.error()`)

**When to use:** Critical failures, exceptions, unexpected errors

**Always logged in production** ✅

```typescript
try {
  await riskyOperation();
} catch (error) {
  logger.error('Operation failed', error, {
    function: 'myFunction',
    userId: user.id,
  });
}
```

**Output (production):**

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "error",
  "message": "Operation failed",
  "environment": "production",
  "function": "myFunction",
  "userId": "user_123",
  "errorMessage": "Connection timeout",
  "errorName": "TimeoutError",
  "errorStack": "..."
}
```

### 2. Warning (`logger.warn()`)

**When to use:** Recoverable issues, deprecated features, potential problems

**Logged when:** `LOG_LEVEL=warn` or lower

```typescript
if (!optionalConfig) {
  logger.warn('Optional configuration missing, using defaults', {
    function: 'initialize',
  });
}
```

### 3. Info (`logger.info()`)

**When to use:** Important business events, successful operations

**Logged when:** `LOG_LEVEL=info` or lower

```typescript
logger.info('User registration completed', {
  userId: user.id,
  duration: 1250,
});
```

### 4. Debug (`logger.debug()`)

**When to use:** Detailed debugging information, development insights

**Logged when:** `LOG_LEVEL=debug` (development only)

```typescript
logger.debug('Cache lookup', {
  cacheKey: key,
  found: !!result,
});
```

## Helper Methods

The logger provides specialized helper methods for common scenarios:

### API Logging

```typescript
// Log API errors only (in production)
logger.apiResponse('POST', '/api/offers/research', 500, 1250, {
  error: 'Database timeout',
});

// Success responses only logged in debug mode
logger.apiResponse('GET', '/api/offers', 200, 150);
```

**Production behavior:**

- ✅ Logs 4xx and 5xx responses (errors)
- ❌ Skips 2xx and 3xx responses (success)

### AI Operations

```typescript
// Logged in development only
logger.aiOperation('Casino discovery', 'gpt-4o-mini', {
  casinoId: casino.id,
  offersCount: 5,
});
```

**Production behavior:** ❌ Not logged (debug level)

### Cache Operations

```typescript
// Logged in development only
logger.cacheOperation('hit', cacheKey, {
  casinoId: casino.id,
});
```

**Production behavior:** ❌ Not logged (debug level)

## Best Practices

### 1. Always Log Errors

```typescript
try {
  await criticalOperation();
} catch (error) {
  // ✅ DO THIS - Always log errors
  logger.error('Critical operation failed', error, {
    function: 'criticalOperation',
    context: 'important-data',
  });
  throw error;
}
```

### 2. Add Contextual Information

```typescript
// ❌ BAD - No context
logger.error('Operation failed', error);

// ✅ GOOD - Rich context
logger.error('Failed to save casino', error, {
  function: 'saveDiscoveredCasinos',
  state: 'NJ',
  casinoCount: 5,
  attemptNumber: 2,
});
```

### 3. Don't Log Sensitive Data

```typescript
// ❌ BAD - Logging API keys
logger.error('API call failed', error, {
  apiKey: process.env.OPENAI_API_KEY,
});

// ✅ GOOD - No sensitive data
logger.error('API call failed', error, {
  provider: 'OpenAI',
  hasApiKey: !!process.env.OPENAI_API_KEY,
});
```

### 4. Use Appropriate Log Levels

```typescript
// ❌ BAD - Error for normal operations
if (cache.miss) {
  logger.error('Cache miss', undefined, { key }); // This isn't an error!
}

// ✅ GOOD - Debug for normal operations
if (cache.miss) {
  logger.debug('Cache miss', { key }); // This is expected
}
```

## Cost Optimization

### Production Costs

With `LOG_LEVEL=error`:

- **Only errors are logged** (typically < 0.1% of operations)
- **No success responses** logged
- **No debug/info messages**
- **Result:** ~99% reduction in log volume

### Example: API Endpoint

```typescript
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // ❌ NOT logged in production (debug level)
    logger.apiRequest('POST', '/api/offers/research', {
      batchSize: 30,
    });

    const result = await processOffers();
    const duration = Date.now() - startTime;

    // ❌ NOT logged in production (200 status)
    logger.apiResponse('POST', '/api/offers/research', 200, duration);

    return NextResponse.json({ success: true, result });
  } catch (error) {
    const duration = Date.now() - startTime;

    // ✅ LOGGED in production (error)
    logger.error('Offer research failed', error, {
      path: '/api/offers/research',
      duration,
    });

    // ✅ LOGGED in production (500 status)
    logger.apiResponse('POST', '/api/offers/research', 500, duration);

    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
```

**Production outcome:**

- 1000 successful requests: 0 logs
- 10 failed requests: 20 logs (error + apiResponse)
- **Total: 20 logs instead of 2020 logs** (99% reduction)

## Monitoring

### View Logs

**Development:**

```bash
bun dev
# Logs appear in terminal with emojis and formatting
```

**Production (Vercel):**

1. Open Vercel dashboard
2. Select your project
3. Click "Logs" tab
4. Filter by "Functions" to see server-side logs

**Production (Search):**

```bash
# Search for errors only
vercel logs --query "level:error"

# Search by function
vercel logs --query "function:determineBestOffer"

# Search by time range
vercel logs --since 1h
```

### Error Tracking

Consider integrating error tracking services for production:

- [Sentry](https://sentry.io) - Error tracking and monitoring
- [LogRocket](https://logrocket.com) - Session replay with logs
- [Datadog](https://datadog.com) - Full observability platform

## Debugging in Production

If you need more verbose logging temporarily:

1. **Update environment variable:**

   ```bash
   vercel env add LOG_LEVEL
   # Enter: info (or debug for maximum verbosity)
   ```

2. **Redeploy:**

   ```bash
   vercel --prod
   ```

3. **Investigate the issue**

4. **Revert to error-only:**
   ```bash
   vercel env rm LOG_LEVEL
   vercel --prod
   ```

## Migration from console.log

All `console.log`, `console.error`, `console.warn` statements have been replaced:

- ✅ 29 console statements removed
- ✅ Centralized logging with `logger` from `@/lib/logger`
- ✅ Structured JSON output in production
- ✅ Automatic cost optimization

## Summary

- **Production default:** `LOG_LEVEL=error` (errors only)
- **Development default:** `LOG_LEVEL=debug` (all logs)
- **Cost savings:** ~99% reduction in log volume
- **Always log:** Errors, exceptions, critical failures
- **Never log:** Sensitive data, tokens, passwords
- **Use helpers:** `apiResponse`, `aiOperation`, `cacheOperation`

For questions or issues, refer to the main [README.md](../README.md) or [ARCHITECTURE.md](./ARCHITECTURE.md).
