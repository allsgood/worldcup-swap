import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const pw = form.get("password")?.toString();
  if (!pw || pw !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const res = NextResponse.redirect(new URL("/admin", req.nextUrl));
  res.cookies.set("admin_auth", "1", { httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 60*60*8 });
  return res;
}
