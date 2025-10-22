# Rate Limit Recommendations for AI Endpoints

## 💰 Cost-Based Rate Limiting Strategy

### Understanding AI Endpoint Costs

Different endpoints have vastly different costs. Here's how to think about rate limits based on cost per request:

## 📊 Current Rate Limits

| Tier             | Limit   | Endpoints                        | Cost/Request  | Max Hourly Cost (if abused) |
| ---------------- | ------- | -------------------------------- | ------------- | --------------------------- |
| **Chat**         | 5/min   | `/api/chat`                      | $0.0015-0.005 | $0.45-1.50                  |
| **Strict**       | 2/min   | Casino discovery, Offer research | $0.50-2.00    | $60-240 ⚠️                  |
| **Ultra-Strict** | 1/5min  | Bulk operations                  | $2.00-10.00   | $24-120/hour                |
| **API**          | 100/min | Database queries                 | $0            | $0                          |

## 🎯 Recommended Limits by Use Case

### 1. **User-Facing Chatbot** ✅ 5/min

**Endpoint**: `/api/chat`

**Current**: 5 requests/minute (1 every 12 seconds)

**Reasoning**:

- Allows natural conversation flow
- User can ask 5 questions in quick succession
- Prevents spam/abuse
- Cost capped at ~$1.50/hour per user max

**Alternative Options**:

```typescript
// More restrictive (if costs are too high)
maxRequests: 3; // 1 every 20 seconds

// More permissive (better UX, higher cost risk)
maxRequests: 10; // 1 every 6 seconds
```

**Recommendation**: **Keep at 5/min** - Good balance between UX and cost protection

---

### 2. **Casino Discovery** 🔴 2/min → **Recommend 1/5min**

**Endpoint**: `/api/casinos/research`

**Current**: 2 requests/minute

**Cost Analysis**:

- Uses web search (expensive)
- Uses GPT-4o-mini with large context
- ~$0.50-2.00 per request
- 2/min = potential $240/hour if abused!

**Better Limit**:

```typescript
// Ultra-strict: 1 request per 5 minutes
export const casinoDiscoveryRateLimiter = new RateLimiter({
  interval: 5 * 60 * 1000, // 5 minutes
  uniqueTokenPerInterval: 200,
  maxRequests: 1, // Only 1 per 5 minutes
});
```

**Recommendation**: **1 request per 5 minutes** - This is an admin operation, doesn't need to be frequent

---

### 3. **Offer Research** 🔴 2/min → **Recommend 1/3min**

**Endpoint**: `/api/offers/research`

**Current**: 2 requests/minute

**Cost**: $0.30-1.00 per request

**Better Limit**:

```typescript
export const offerResearchRateLimiter = new RateLimiter({
  interval: 3 * 60 * 1000, // 3 minutes
  uniqueTokenPerInterval: 200,
  maxRequests: 1,
});
```

**Recommendation**: **1 request per 3 minutes**

---

### 4. **Best Offer Analysis** 🟡 2/min → **Keep at 2/min**

**Endpoint**: `/api/offers/best` (POST)

**Current**: 2 requests/minute

**Cost**: $0.10-0.30 per request

**Reasoning**:

- Moderately expensive
- Uses caching (most requests are cache hits)
- 2/min is reasonable for this use case

**Recommendation**: **Keep at 2/min**

---

## 🛡️ Best Practices for AI Endpoint Rate Limiting

### 1. **Tier by Cost, Not Just Sensitivity**

```
Free (DB queries)     → 100/min
Cheap AI ($0.001)     → 20/min
Medium AI ($0.01)     → 5/min
Expensive AI ($0.10)  → 2/min
Very Expensive ($1+)  → 1/5min
```

### 2. **User-Based vs IP-Based**

**Current**: IP-based (anonymous users)

**Better** (with authentication):

```typescript
// Authenticated users get higher limits
const identifier = userId || clientIp;
const limit = userId
  ? chatRateLimiterAuthenticated // 10/min
  : chatRateLimiter; // 5/min
```

### 3. **Time Windows**

Different operations need different windows:

| Operation Type | Window | Reason                          |
| -------------- | ------ | ------------------------------- |
| Chatbot        | 1 min  | User expects quick responses    |
| Analysis       | 3 min  | Batch operations, can wait      |
| Discovery      | 5 min  | Very expensive, rare use        |
| Bulk           | 1 hour | Should be scheduled, not manual |

### 4. **Burst Allowance**

Consider allowing bursts for better UX:

```typescript
// Allow 3 quick requests, then throttle
export const chatRateLimiterWithBurst = new RateLimiter({
  interval: 60 * 1000,
  maxRequests: 5,
  burstAllowance: 3, // First 3 can be instant
});
```

### 5. **Cost-Based Dynamic Limits**

Track actual costs and adjust:

```typescript
// If daily cost > $10, reduce all limits by 50%
if (dailyCost > 10) {
  chatRateLimiter.config.maxRequests = 3;
  strictRateLimiter.config.maxRequests = 1;
}
```

## 📈 Monitoring Strategy

### Track These Metrics:

1. **Cost per endpoint per day**

   ```sql
   SELECT operation, SUM(estimated_cost)
   FROM ai_usage
   WHERE timestamp > NOW() - INTERVAL '1 day'
   GROUP BY operation
   ```

2. **Rate limit hits per endpoint**

   ```typescript
   logger.warn('Rate limit exceeded', {
     ip,
     endpoint,
     limit,
     cost_saved,
   });
   ```

3. **95th percentile response time**
   - If rate limits too strict → slow responses
   - If too loose → high costs

## 🎯 Recommended Configuration

Update `src/lib/rate-limiter.ts`:

```typescript
// User-facing chatbot: Allow conversation
export const chatRateLimiter = new RateLimiter({
  interval: 60 * 1000,
  maxRequests: 5, // ✅ Good for UX + cost
});

// Offer analysis: Moderate cost
export const offerAnalysisRateLimiter = new RateLimiter({
  interval: 60 * 1000,
  maxRequests: 2, // ✅ Reasonable
});

// Casino discovery: VERY expensive
export const casinoDiscoveryRateLimiter = new RateLimiter({
  interval: 5 * 60 * 1000, // 5 minutes
  maxRequests: 1, // ⚠️ Only 1 per 5 min
});

// Offer research: Expensive
export const offerResearchRateLimiter = new RateLimiter({
  interval: 3 * 60 * 1000, // 3 minutes
  maxRequests: 1,
});
```

## 💡 Quick Decision Matrix

**Is this endpoint:**

1. **User-facing chatbot?** → 5/min
2. **Costs < $0.01/request?** → 10-20/min
3. **Costs $0.01-0.10/request?** → 2-5/min
4. **Costs $0.10-1.00/request?** → 1/min
5. **Costs > $1.00/request?** → 1/5min

## 🚨 Emergency Cost Control

If costs spike, immediately:

```typescript
// Emergency mode: Reduce all AI limits by 80%
export const EMERGENCY_MODE = true;

export const chatRateLimiter = new RateLimiter({
  maxRequests: EMERGENCY_MODE ? 1 : 5,
});
```

## 📊 Example Cost Scenarios

### Scenario 1: Normal Usage

- 100 users/day
- 5 chat messages each
- Cost: 500 × $0.003 = **$1.50/day**

### Scenario 2: Bot Attack (Without Rate Limits)

- 1 bot
- 1000 requests/hour
- Cost: 1000 × $0.003 = **$3/hour = $72/day**

### Scenario 3: Bot Attack (With 5/min Limit)

- 1 bot
- Max 300 requests/hour
- Cost: 300 × $0.003 = **$0.90/hour = $21.60/day**
- Savings: **70% cost reduction**

### Scenario 4: Casino Discovery Attack

- Without limits: 1000/hour × $1 = **$1000/hour**
- With 1/5min limit: 12/hour × $1 = **$12/hour**
- Savings: **98.8% cost reduction**

---

## ✅ Final Recommendations

| Endpoint                | Current | Recommended         | Reason        |
| ----------------------- | ------- | ------------------- | ------------- |
| `/api/chat`             | 5/min   | ✅ Keep 5/min       | Good balance  |
| `/api/casinos/research` | 2/min   | 🔴 Change to 1/5min | Too expensive |
| `/api/offers/research`  | 2/min   | 🟡 Change to 1/3min | Expensive     |
| `/api/offers/best` POST | 2/min   | ✅ Keep 2/min       | Cached        |
| `/api/admin/ai-usage`   | 100/min | ✅ Keep 100/min     | Free          |

**Priority**: Update casino discovery limit ASAP - this is your biggest cost risk!
