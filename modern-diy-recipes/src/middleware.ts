import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const publicPaths = ['/', '/signin', '/signup', '/_next', '/api', '/favicon.ico'];
  const isPublic = publicPaths.some((path) => req.nextUrl.pathname.startsWith(path));

  if (!session && !isPublic) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/signin';
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

// Configure matcher for middleware
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};