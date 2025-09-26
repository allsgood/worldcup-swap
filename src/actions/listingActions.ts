"use server";

import { z } from "zod";
import { prisma } from "@/src/lib/db";
import { getOrCreateAnonUser } from "@/src/lib/session";
import { addDays, isAfter, isBefore } from "date-fns";

const ListingSchema = z.object({
  // HAVE
  fifaMatchId: z.string().min(3),
  city: z.string().min(2),
  stadium: z.string().min(2),
  date: z.string().transform((s) => new Date(s)),
  category: z.string().min(1),
  faceValueCents: z.coerce.number().int().min(0),
  packageType: z.string().optional(),

  // WANT
  desiredTeam: z.string().optional(),
  desiredCity: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  desiredCategory: z.string().optional(),
  priceDeltaCapCents: z.coerce.number().int().optional()
});

function wantMatchesHave(
  want: {
    desiredTeam?: string | null;
    desiredCity?: string | null;
    dateFrom?: Date | null;
    dateTo?: Date | null;
    desiredCategory?: string | null;
  },
  have: {
    city: string;
    date: Date;
    category: string;
  }
) {
  if (want.desiredCity && want.desiredCity.toLowerCase() !== have.city.toLowerCase()) return false;
  if (want.desiredCategory && want.desiredCategory.toLowerCase() !== have.category.toLowerCase()) return false;
  if (want.dateFrom && isBefore(have.date, want.dateFrom)) return false;
  if (want.dateTo && isAfter(have.date, want.dateTo)) return false;
  return true;
}

export async function createListing(formData: FormData) {
  const user = await getOrCreateAnonUser();

  const parsed = ListingSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { ok: false, error: parsed.error.flatten() };
  }

  const v = parsed.data;

  const intent = await prisma.intent.create({
    data: {
      userId: user.id,
      desiredTeam: v.desiredTeam ?? null,
      desiredCity: v.desiredCity ?? null,
      dateFrom: v.dateFrom ? new Date(v.dateFrom) : null,
      dateTo: v.dateTo ? new Date(v.dateTo) : null,
      desiredCategory: v.desiredCategory ?? null,
      priceDeltaCapCents: v.priceDeltaCapCents ?? 0
    }
  });

const listing = await prisma.listing.create({
  data: {
    owner: { connect: { id: user.id } },   // ✅ not ownerId
    fifaMatchId: v.fifaMatchId,
    city: v.city,
    stadium: v.stadium,
    date: v.date,
    category: v.category,
    faceValueCents: v.faceValueCents,
    packageType: v.packageType,
    intent: { connect: { id: intent.id } }
  },
  include: { intent: true }
});

  // Run simple direct matching against other active listings
  const others = await prisma.listing.findMany({
    where: { status: "active", ownerId: { not: user.id } },
    include: { owner: true, intent: true }
  });

  const offersToCreate: any[] = [];

  for (const other of others) {
    const aWantsB = listing.intent
      ? wantMatchesHave(
          {
            desiredTeam: listing.intent.desiredTeam,
            desiredCity: listing.intent.desiredCity,
            dateFrom: listing.intent.dateFrom ?? undefined,
            dateTo: listing.intent.dateTo ?? undefined,
            desiredCategory: listing.intent.desiredCategory ?? undefined
          },
          { city: other.city, date: other.date, category: other.category }
        )
      : false;

    const bWantsA = other.intent
      ? wantMatchesHave(
          {
            desiredTeam: other.intent.desiredTeam ?? undefined,
            desiredCity: other.intent.desiredCity ?? undefined,
            dateFrom: other.intent.dateFrom ?? undefined,
            dateTo: other.intent.dateTo ?? undefined,
            desiredCategory: other.intent.desiredCategory ?? undefined
          },
          { city: listing.city, date: listing.date, category: listing.category }
        )
      : false;

    if (aWantsB && bWantsA) {
      const delta = listing.faceValueCents - other.faceValueCents;
      const aCap = listing.intent?.priceDeltaCapCents ?? 0;
      const bCap = other.intent?.priceDeltaCapCents ?? 0;
      const withinCaps = Math.abs(delta) <= aCap && Math.abs(delta) <= bCap;

      if (withinCaps) {
        offersToCreate.push({
          type: "direct",
          status: "open",
          expiresAt: addDays(new Date(), 2),
          fromListingId: listing.id,
          toListingId: other.id,
          cashDeltaCents: -delta,
          fromUserId: user.id,
          toUserId: other.ownerId
        });
      }
    }
  }

  if (offersToCreate.length) {
    await prisma.offer.createMany({ data: offersToCreate });
  }

  return { ok: true, listingId: listing.id, createdOffers: offersToCreate.length };
}
