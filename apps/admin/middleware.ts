import { NextRequest, NextResponse } from "next/server";

function hasSessionCookie(req: NextRequest): boolean {
  return !!(
    req.cookies.get("next-auth.session-token")?.value ||
    req.cookies.get("__Secure-next-auth.session-token")?.value
  );
}

export default function middleware(req: NextRequest) {
  const { nextUrl } = req;
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
