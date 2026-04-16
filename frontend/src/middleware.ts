import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;

    const isAuthRoute = request.nextUrl.pathname.startsWith('/login');

    if (!token && !isAuthRoute) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (token && isAuthRoute) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|themes|layout).*)'],
};
