"use server";

import { prisma } from "@/lib/db";
import { getOrCreateAnonUser } from "@/lib/session";

export async function submitConfirmation(offerId: string, ref: string) {
  const user = await getOrCreateAnonUser();
  const offer = await prisma.offer.findUnique({ where: { id: offerId } });
  if (!offer) return { ok: false, error: "Offer not found" };
  if (offer.status !== "accepted" && !offer.feePaid) {
    return { ok: false, error: "This offer isn't ready for confirmation yet." };
  }
  if (offer.fromUserId !== user.id && offer.toUserId !== user.id) {
    return { ok: false, error: "Not your offer." };
  }

  const data: any = {};
  if (offer.fromUserId === user.id) data.fromConfirmationRef = ref;
  if (offer.toUserId === user.id)   data.toConfirmationRef = ref;

  const updated = await prisma.offer.update({
    where: { id: offerId },
    data
  });

  const nowHasBoth =
    (data.fromConfirmationRef || updated.fromConfirmationRef) &&
    (data.toConfirmationRef   || updated.toConfirmationRef);

  if (nowHasBoth && !updated.completedAt) {
    await prisma.offer.update({
      where: { id: offerId },
      data: { completedAt: new Date(), status: "accepted" }
    });
  }

  return { ok: true };
}
