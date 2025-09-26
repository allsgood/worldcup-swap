import { cookies } from "next/headers";
import { prisma } from "./db";
import crypto from "crypto";

/**
 * IMPORTANT:
 * - Only set cookies in Server Actions or Route Handlers.
 * - In normal Server Components (like page.tsx), read-only access only.
 */
const COOKIE = process.env.SESSION_COOKIE_NAME || "wc_swap_uid";

/** Read the anonId from the cookie; do NOT set cookies here. */
export async function readAnonId(): Promise<string | null> {
  const store = cookies();
  const val = store.get(COOKIE)?.value || null;
  return val ?? null;
}

/** Ensure a user exists + set cookie. Call ONLY from a Server Action or Route Handler. */
export async function ensureAnonUserWithCookie() {
  const store = cookies(); // mutable in Server Actions/Route Handlers
  let anonId = store.get(COOKIE)?.value;

  if (!anonId) {
    anonId = crypto.randomBytes(16).toString("hex");
    // Setting cookie is allowed here (Server Action / Route Handler)
    store.set(COOKIE, anonId, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 365
    });
  }

  let user = await prisma.user.findUnique({ where: { anonId } });
  if (!user) {
    user = await prisma.user.create({ data: { anonId } });
  }
  return user;
}

/** Try to find the user based on cookie; does not set cookie. Safe in Server Components. */
export async function findUserFromCookie() {
  const anonId = await readAnonId();
  if (!anonId) return null;
  const user = await prisma.user.findUnique({ where: { anonId } });
  return user;
}
