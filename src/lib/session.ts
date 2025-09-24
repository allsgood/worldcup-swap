import { cookies } from "next/headers";
import { prisma } from "./db";
import crypto from "crypto";

const COOKIE = process.env.SESSION_COOKIE_NAME || "wc_swap_uid";

export async function getOrCreateAnonUser() {
  const store = await cookies();
  let anonId = store.get(COOKIE)?.value;

  if (!anonId) {
    anonId = crypto.randomBytes(16).toString("hex");
    store.set(COOKIE, anonId, { httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 60 * 60 * 24 * 365 });
  }

  let user = await prisma.user.findUnique({ where: { anonId } });
  if (!user) {
    user = await prisma.user.create({ data: { anonId } });
  }
  return user;
}
