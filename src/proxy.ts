import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PASSWORD = process.env.SITE_PASSWORD || "twodots2024";
const DISABLE_LOGIN = process.env.DISABLE_LOGIN === "true";

const PUBLIC_PATHS = [
  "/login",
  "/api",
  "/_next",
  "/favicon",
];

export function proxy(request: NextRequest) {
  if (DISABLE_LOGIN) return NextResponse.next();

  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const cookie = request.cookies.get("site-auth");
  if (cookie?.value === PASSWORD) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg|.*\\.glb).*)"],
};
