import { NextRequest, NextResponse } from "next/server";

const publicPaths = ["/login", "/register", "/api/auth/register"];

function hasSessionCookie(req: NextRequest): boolean {
  return !!(
    req.cookies.get("next-auth.session-token")?.value ||
    req.cookies.get("__Secure-next-auth.session-token")?.value
  );
}

export default function middleware(req: NextRequest) {
  const { nextUrl } = req;

  // Skip auth checks for API routes and static assets
  if (
    nextUrl.pathname.startsWith("/api") ||
    nextUrl.pathname.startsWith("/_next") ||
    nextUrl.pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const isAuthenticated = hasSessionCookie(req);
  const isPublicPath = publicPaths.includes(nextUrl.pathname);

  if (!isAuthenticated && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  if (isAuthenticated && isPublicPath) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
