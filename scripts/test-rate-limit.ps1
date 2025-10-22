# Rate Limit Test Script (PowerShell)
# Tests the rate limiting functionality by making multiple requests

param(
    [string]$Url = "http://localhost:3000/api/test-rate-limit",
    [int]$Requests = 15
)

Write-Host "🧪 Testing Rate Limit (10 requests/minute)" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Making $Requests requests to: $Url"
Write-Host ""

for ($i = 1; $i -le $Requests; $i++) {
    Write-Host "Request ${i}:" -NoNewline
    
    try {
        $response = Invoke-WebRequest -Uri $Url -Method Get -UseBasicParsing
        $body = $response.Content | ConvertFrom-Json
        
        if ($response.StatusCode -eq 200) {
            Write-Host " ✅ SUCCESS - Remaining: $($body.rateLimit.remaining)" -ForegroundColor Green
        }
    }
    catch {
        if ($_.Exception.Response.StatusCode -eq 429) {
            $errorBody = $_.ErrorDetails.Message | ConvertFrom-Json
            Write-Host " ❌ RATE LIMITED - Retry after: $($errorBody.retryAfter)s" -ForegroundColor Red
        }
        else {
            Write-Host " ⚠️  ERROR: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
    
    Start-Sleep -Milliseconds 500
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Test complete!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Expected: First 10 requests succeed (✅), remaining 5 get rate limited (❌)"

