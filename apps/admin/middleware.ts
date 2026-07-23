import { NextRequest, NextResponse } from "next/server";

function hasSessionCookie(req: NextRequest): boolean {
  const cookies = req.cookies.getAll();
  return cookies.some(
    (c) =>
      c.name === "next-auth.session-token" ||
      c.name === "__Secure-next-auth.session-token" ||
      c.name.endsWith(".next-auth.session-token") ||
      c.name.endsWith(".__Secure-next-auth.session-token")
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
  const isLoginPage = nextUrl.pathname === "/login";

  if (!isAuthenticated && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  if (isAuthenticated && isLoginPage) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
