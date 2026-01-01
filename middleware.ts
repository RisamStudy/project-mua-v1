import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiting (for production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function rateLimit(ip: string, limit: number = 10, windowMs: number = 15 * 60 * 1000): boolean {
  const now = Date.now();
  const key = ip;
  
  const record = rateLimitMap.get(key);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= limit) {
    return false;
  }
  
  record.count++;
  return true;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Enforce HTTPS in production
  if (
    process.env.NODE_ENV === 'production' && 
    request.headers.get('x-forwarded-proto') !== 'https'
  ) {
    return NextResponse.redirect(
      `https://${request.headers.get('host')}${pathname}`,
      301
    );
  }
  
  // Rate limiting for login endpoint
  if (pathname === '/api/auth/login') {
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    if (!rateLimit(ip, 5, 15 * 60 * 1000)) { // 5 attempts per 15 minutes
      return NextResponse.json(
        { message: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      );
    }
  }
  
  // Rate limiting for sensitive endpoints
  if (pathname.includes('/download-') || pathname.includes('/generate-')) {
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    if (!rateLimit(ip, 20, 60 * 1000)) { // 20 requests per minute
      return NextResponse.json(
        { message: 'Rate limit exceeded. Please slow down.' },
        { status: 429 }
      );
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/auth/login',
    '/api/:path*/download-:type*',
    '/api/:path*/generate-:type*',
  ],
};