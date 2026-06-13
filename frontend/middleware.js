import { NextResponse } from 'next/server';

export function middleware(request) {
  try {
    const { pathname } = request.nextUrl;
    
    // Read the mode from Vercel
    const mode = process.env.APP_MODE || 'full';

    // Website: Block /admin
    if (mode === 'website' && pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // CMS: Block everything except /admin
    if (mode === 'cms' && !pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    return NextResponse.next();
  } catch (err) {
    // If Vercel Edge crashes for any reason, don't throw 500, just allow the page to load
    console.error('[Middleware Error]', err);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
