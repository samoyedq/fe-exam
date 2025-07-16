import { NextResponse } from 'next/server';

export function middleware(request) {

  if (request.nextUrl.pathname.startsWith('/dashboard')) {

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*']
};
