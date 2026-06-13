import { NextResponse } from 'next/server';

export function middleware(request) {
  const url = request.nextUrl;
  
  // Read the environment variable. 
  // Modes: 'website', 'cms'. If not set (like in local development), it acts as 'full' and allows everything.
  const mode = process.env.APP_MODE || 'full';

  // 1. PUBLIC WEBSITE MODE: Block any access to the /admin route
  if (mode === 'website' && url.pathname.startsWith('/admin')) {
    // Redirect sneaky visitors back to the main portfolio page
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 2. SECRET CMS MODE: Block the public portfolio page
  if (mode === 'cms') {
    // If they try to go to the root domain '/' or anything other than '/admin', redirect them into the admin panel
    if (!url.pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  // Allow the request to proceed normally if no rules were broken
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  // We apply this middleware to almost everything except Next.js system files and backend API proxies
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|avatar.jpg).*)'],
};
