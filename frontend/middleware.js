import { NextResponse } from 'next/server';

export function middleware(request) {
  const url = request.nextUrl.clone();
  const pathname = url.pathname;
  
  // Read the environment variable. 
  // Modes: 'website', 'cms'. If not set (like in local development), it acts as 'full' and allows everything.
  const mode = process.env.APP_MODE || 'full';

  // 1. PUBLIC WEBSITE MODE: Block any access to the /admin route
  if (mode === 'website' && pathname.startsWith('/admin')) {
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  // 2. SECRET CMS MODE: Block the public portfolio page
  if (mode === 'cms') {
    // Redirect anything not starting with /admin to the /admin login
    if (!pathname.startsWith('/admin')) {
      url.pathname = '/admin';
      return NextResponse.redirect(url);
    }
  }

  // Allow the request to proceed normally
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|_next/data|uploads|favicon.ico).*)',
  ],
};
