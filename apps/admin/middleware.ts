import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isAuthenticated = !!req.auth;
  const isLoginPage = nextUrl.pathname === "/login";

  if (!isAuthenticated && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  if (isAuthenticated && isLoginPage) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
