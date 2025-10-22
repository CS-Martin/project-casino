# Rate Limiting Documentation

## Overview

Rate limiting is implemented across all API endpoints to prevent abuse, spam, and excessive API costs. The system tracks requests per IP address and enforces limits based on endpoint sensitivity.

## Rate Limit Tiers

### 1. **Chat Endpoint** (Most Restrictive)

- **Endpoint**: `/api/chat`
- **Limit**: 20 requests per minute
- **Reason**: Protects expensive OpenAI API calls
- **Use Case**: User chatbot interactions

### 2. **Strict Rate Limit** (Highly Restrictive)

- **Endpoints**:
  - `/api/casinos/research` (Casino discovery)
  - `/api/offers/research` (Offer research)
  - `/api/offers/best` (POST - AI analysis)
- **Limit**: 5 requests per minute
- **Reason**: Very expensive AI operations
- **Use Case**: Admin/automated operations

### 3. **Standard API Limit** (Moderate)

- **Endpoints**:
  - `/api/admin/ai-usage`
  - `/api/offers/best` (GET - cache lookups)
  - Other general API endpoints
- **Limit**: 100 requests per minute
- **Reason**: Database queries, cache lookups
- **Use Case**: Regular API usage

## Implementation

### Architecture

```
Request → Get Client IP → Check Rate Limit → Process or Reject
                              ↓
                    Track in Memory Map
                    (identifier → TokenBucket)
```

### Token Bucket Algorithm

Each IP address has a token bucket:

- **Tokens**: Requests allowed
- **Refill**: Bucket resets after time window
- **Check**: Decrement token on request
- **Reject**: If no tokens available

### IP Detection

IP addresses are extracted in order of preference:

1. `x-forwarded-for` (Vercel/Next.js)
2. `cf-connecting-ip` (Cloudflare)
3. `x-real-ip` (Other proxies)
4. Fallback to 'unknown'

## Response Headers

All responses include rate limit headers:

```http
X-RateLimit-Limit: 20           # Total allowed per window
X-RateLimit-Remaining: 15       # Remaining requests
X-RateLimit-Reset: 1234567890   # Unix timestamp when limit resets
```

## Rate Limit Exceeded Response

**Status**: `429 Too Many Requests`

**Headers**:

```http
Retry-After: 45                 # Seconds until retry
X-RateLimit-Limit: 20
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1234567890
```

**Body**:

```json
{
  "error": "Too many requests",
  "message": "You have exceeded the rate limit. Please try again later.",
  "retryAfter": 45
}
```

## Logging

All rate limit events are logged:

### Successful Requests

```javascript
logger.info('Chat request accepted', {
  ip: '192.168.1.1',
  remaining: 15,
  limit: 20,
});
```

### Exceeded Limits

```javascript
logger.warn('Rate limit exceeded', {
  ip: '192.168.1.1',
  endpoint: '/api/chat',
  limit: 20,
});
```

## Configuration

Rate limiters are defined in `src/lib/rate-limiter.ts`:

```typescript
export const chatRateLimiter = new RateLimiter({
  interval: 60 * 1000, // 1 minute window
  uniqueTokenPerInterval: 500, // Track 500 unique IPs
  maxRequests: 20, // 20 requests per window
});
```

### Customizing Limits

To change rate limits, edit the configuration:

```typescript
// More restrictive
maxRequests: 10; // 10 requests per minute

// More permissive
maxRequests: 50; // 50 requests per minute

// Different time window
interval: 5 * 60 * 1000; // 5 minutes
```

## Production Upgrade: Upstash Redis

For production deployments with multiple serverless instances, upgrade to Upstash Redis for distributed rate limiting.

### Why Upgrade?

**Current (In-Memory)**:

- ❌ Each serverless instance has separate memory
- ❌ Rate limits not shared across instances
- ❌ Users can bypass by hitting different instances
- ✅ Simple, no external dependencies
- ✅ Free, no additional cost

**Upstash Redis**:

- ✅ Shared state across all instances
- ✅ Accurate rate limiting at scale
- ✅ Built-in analytics
- ✅ Automatic cleanup
- ❌ Requires Upstash account
- ❌ Small cost (free tier available)

### Migration Steps

1. **Create Upstash Redis Database**

   ```bash
   # Visit https://console.upstash.com/
   # Create new Redis database
   # Copy REST URL and Token
   ```

2. **Install Dependencies**

   ```bash
   npm install @upstash/ratelimit @upstash/redis
   ```

3. **Add Environment Variables**

   ```bash
   UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
   UPSTASH_REDIS_REST_TOKEN=your-token
   ```

4. **Use Upstash Rate Limiter**

   See `src/lib/rate-limiter.upstash.example.ts` for implementation.

   Replace imports in API routes:

   ```typescript
   // Before
   import { chatRateLimiter } from '@/lib/rate-limiter';

   // After
   import { chatRateLimiter } from '@/lib/rate-limiter.upstash';
   ```

5. **Deploy**

   The Upstash rate limiter will work seamlessly across all serverless instances.

## Testing Rate Limits

### Test Endpoint

A dedicated test endpoint is available at `/api/test-rate-limit`:

**Bash/Linux:**

```bash
# Make 15 requests (limit is 10/min)
for i in {1..15}; do
  curl http://localhost:3000/api/test-rate-limit
  echo ""
done

# Should succeed for first 10, then return 429
```

**PowerShell:**

```powershell
# Make 15 requests (limit is 10/min)
1..15 | ForEach-Object {
  Invoke-RestMethod http://localhost:3000/api/test-rate-limit
}

# Should succeed for first 10, then throw error
```

**Success Response (first 10 requests):**

```json
{
  "message": "Hi! Rate limit test successful.",
  "timestamp": "2025-10-22T12:34:56.789Z",
  "rateLimit": {
    "limit": 10,
    "remaining": 7,
    "resetsIn": "45 seconds",
    "resetAt": "2025-10-22T12:35:45.000Z"
  },
  "ip": "192.168.1.1"
}
```

**Rate Limited Response (11th+ request):**

```json
{
  "error": "Too many requests",
  "message": "You have exceeded the rate limit. Please try again later.",
  "retryAfter": 45
}
```

### Manual Testing

```bash
# Test chat endpoint (10/min limit)
for i in {1..15}; do
  curl -X POST http://localhost:3000/api/chat \
    -H "Content-Type: application/json" \
    -d '{"message":"test"}' \
    -w "\nStatus: %{http_code}\n"
done

# Should see 429 after 10 requests
```

### Automated Testing

```typescript
// Test rate limiter
import { chatRateLimiter } from '@/lib/rate-limiter';

async function testRateLimit() {
  const ip = '192.168.1.1';

  // Make 20 requests (should all succeed)
  for (let i = 0; i < 20; i++) {
    const result = await chatRateLimiter.check(ip);
    console.log(`Request ${i + 1}: ${result.success}`);
  }

  // 21st request (should fail)
  const result = await chatRateLimiter.check(ip);
  console.log(`Request 21: ${result.success}`); // false
}
```

## Security Headers

The middleware also adds security headers to all responses:

```typescript
// src/middleware.ts
response.headers.set('X-Content-Type-Options', 'nosniff');
response.headers.set('X-Frame-Options', 'DENY');
response.headers.set('X-XSS-Protection', '1; mode=block');
response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
```

## Monitoring

### Check Rate Limit Status

Monitor rate limits in logs:

```bash
# Filter rate limit events
grep "Rate limit" logs.txt

# Count exceeded attempts
grep "Rate limit exceeded" logs.txt | wc -l

# View by IP
grep "192.168.1.1" logs.txt | grep "Rate limit"
```

### Analytics (with Upstash)

Upstash provides built-in analytics:

- Request counts per identifier
- Hit/miss ratios
- Historical data
- Real-time dashboards

## Best Practices

1. **Set Appropriate Limits**
   - Too strict = bad UX
   - Too loose = vulnerable to abuse
   - Monitor and adjust based on usage

2. **Inform Users**
   - Show remaining requests in UI
   - Display helpful error messages
   - Indicate retry time

3. **Whitelist if Needed**

   ```typescript
   const WHITELISTED_IPS = ['192.168.1.100'];

   if (WHITELISTED_IPS.includes(clientIp)) {
     // Skip rate limiting
   }
   ```

4. **Different Limits for Authenticated Users**

   ```typescript
   const userId = await getUserId(request);
   const identifier = userId || clientIp; // Prefer user ID
   ```

5. **Graceful Degradation**
   - Cache responses when possible
   - Show cached data during rate limit
   - Queue requests for later

## Troubleshooting

### Issue: Rate limit too strict

**Solution**: Increase `maxRequests` or `interval`

```typescript
maxRequests: 30; // Instead of 20
```

### Issue: Users bypassing limits

**Solution**: Upgrade to Upstash Redis for distributed state

### Issue: Legitimate users blocked

**Solution**:

1. Implement user authentication
2. Use user ID instead of IP
3. Higher limits for authenticated users

### Issue: Rate limiter not working

**Check**:

1. IP detection: `console.log(clientIp)`
2. Rate limiter import: Correct instance?
3. Middleware: Applied to route?

## Future Enhancements

- [ ] User-based rate limiting (after auth)
- [ ] Dynamic limits based on user tier
- [ ] Burst allowance (allow short spikes)
- [ ] Rate limit warnings (at 80% usage)
- [ ] Admin dashboard for monitoring
- [ ] IP blacklisting/whitelisting
- [ ] Automatic ban for repeated violations

---

**Current Status**: ✅ In-memory rate limiting active on all API endpoints

**Recommended**: Upgrade to Upstash Redis for production deployments with high traffic
