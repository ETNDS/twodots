import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PASSWORD = process.env.SITE_PASSWORD || "twodots2024";

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  if (password !== PASSWORD) {
    return NextResponse.json({ error: "Password errata" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("site-auth", PASSWORD, {
    httpOnly: true,
    secure: true,
    maxAge: 60 * 60 * 24 * 30, // 30 giorni
    path: "/",
  });
  return response;
}
