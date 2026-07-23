import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const publicPaths = ["/login", "/register", "/api/auth/register"];

export default auth((req) => {
  const { nextUrl } = req;
  const isAuthenticated = !!req.auth;
  const isPublicPath = publicPaths.includes(nextUrl.pathname);

  if (!isAuthenticated && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  if (isAuthenticated && isPublicPath) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
