#!/bin/bash

# Rate Limit Test Script
# Tests the rate limiting functionality by making multiple requests

echo "🧪 Testing Rate Limit (10 requests/minute)"
echo "=========================================="
echo ""

URL="${1:-http://localhost:3000/api/test-rate-limit}"
REQUESTS=15

echo "Making $REQUESTS requests to: $URL"
echo ""

for i in $(seq 1 $REQUESTS); do
  echo "Request $i:"
  
  RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$URL")
  HTTP_CODE=$(echo "$RESPONSE" | grep HTTP_CODE | cut -d: -f2)
  BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE/d')
  
  if [ "$HTTP_CODE" = "200" ]; then
    REMAINING=$(echo "$BODY" | grep -o '"remaining":[0-9]*' | cut -d: -f2)
    echo "✅ SUCCESS - Remaining: $REMAINING"
  elif [ "$HTTP_CODE" = "429" ]; then
    RETRY_AFTER=$(echo "$BODY" | grep -o '"retryAfter":[0-9]*' | cut -d: -f2)
    echo "❌ RATE LIMITED - Retry after: ${RETRY_AFTER}s"
  else
    echo "⚠️  UNKNOWN STATUS: $HTTP_CODE"
  fi
  
  echo ""
  sleep 0.5
done

echo "=========================================="
echo "Test complete!"
echo ""
echo "Expected: First 10 requests succeed (✅), remaining 5 get rate limited (❌)"

