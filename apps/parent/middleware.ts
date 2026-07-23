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
