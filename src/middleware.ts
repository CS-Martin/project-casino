/**
 * Next.js Middleware
 *
 * Global middleware for rate limiting and request filtering
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  // Add security headers to all responses
  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  if (url.pathname === '/') {
    url.pathname = '/dashboard/casino';
    return NextResponse.redirect(url);
  }

  return response;
}

// Configure which routes use middleware
export const config = {
  matcher: [
    // Apply to all API routes
    '/api/:path*',
    // Exclude static files
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
