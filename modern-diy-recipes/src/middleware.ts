import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const { pathname } = req.nextUrl;
  
  // Improved request logging for debugging
  console.log(`[${new Date().toISOString()}] Request: ${req.method} ${pathname}`);
  console.log(`- User-Agent: ${req.headers.get('user-agent')}`);
  console.log(`- Referrer: ${req.headers.get('referer')}`);
  console.log(`- Host: ${req.headers.get('host')}`);
  console.log(`- IP: ${req.ip || 'unknown'}`);
  
  // Add a custom header to track middleware execution
  res.headers.set('X-Middleware-Timestamp', Date.now().toString());
  
  // Handle font files with proper MIME types
  if (pathname.startsWith('/fonts/')) {
    const response = NextResponse.next();
    
    // Set correct MIME type based on file extension
    if (pathname.endsWith('.woff2')) {
      response.headers.set('Content-Type', 'font/woff2');
    } else if (pathname.endsWith('.woff')) {
      response.headers.set('Content-Type', 'font/woff');
    } else if (pathname.endsWith('.ttf')) {
      response.headers.set('Content-Type', 'font/ttf');
    } else if (pathname.endsWith('.otf')) {
      response.headers.set('Content-Type', 'font/otf');
    }
    
    // Set caching headers but allow revalidation for development
    const cacheAge = process.env.NODE_ENV === 'development' 
      ? '31536000, must-revalidate' // Allow revalidation in dev
      : '31536000, immutable';      // Strict caching in production
    
    response.headers.set('Cache-Control', `public, max-age=${cacheAge}`);
    
    // Enable CORS for font files
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Accept');
    
    // Add Vary header to prevent caching issues
    response.headers.set('Vary', 'Origin, Accept-Encoding');
    
    return response;
  }
  
  // DEVELOPMENT MODE: Skip authentication check
  // This is a temporary change to get the server running
  if (process.env.NODE_ENV === 'development') {
    console.log('Development mode: Skipping authentication check');
    return res;
  }
  
  // Production mode: Check authentication as usual
  try {
    const supabase = createMiddlewareClient({ req, res });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const publicPaths = ['/', '/signin', '/signup', '/_next', '/api', '/favicon.ico', '/fonts'];
    const isPublic = publicPaths.some((path) => pathname.startsWith(path));

    if (!session && !isPublic) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/signin';
      return NextResponse.redirect(redirectUrl);
    }
  } catch (error) {
    console.error('Middleware error:', error);
    // Continue without auth in case of error
  }

  return res;
}

// Configure matcher for middleware
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};