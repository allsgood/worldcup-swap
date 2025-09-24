import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/db";

export async function POST(req: NextRequest) {
  const admin = req.cookies.get("admin_auth")?.value === "1";
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.listing.update({
    where: { id },
    data: { featured: !listing.featured }
  });

  return NextResponse.redirect(new URL("/admin", req.nextUrl));
}
