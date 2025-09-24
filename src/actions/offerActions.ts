"use server";

import { prisma } from "@/src/lib/db";
import { getOrCreateAnonUser } from "@/src/lib/session";
import { stripe } from "@/src/lib/stripe";

const FEE_CENTS = parseInt(process.env.MATCHMAKING_FEE_CENTS || "299", 10);
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function acceptOffer(offerId: string) {
  const user = await getOrCreateAnonUser();
  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
    include: { fromListing: true, toListing: true }
  });
  if (!offer || offer.status !== "open") return { ok: false, error: "Offer not found" };

  const update = await prisma.offer.update({
    where: { id: offerId },
    data: {
      acceptedByFrom: offer.fromUserId === user.id ? true : offer.acceptedByFrom,
      acceptedByTo:   offer.toUserId   === user.id ? true : offer.acceptedByTo
    }
  });

  if (update.acceptedByFrom && update.acceptedByTo && !update.feePaid) {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${SITE_URL}/success?offer=${offerId}`,
      cancel_url: `${SITE_URL}/matches?cancelled=1&offer=${offerId}`,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: FEE_CENTS,
            product_data: {
              name: "Matchmaking Service Fee",
              description: "We match fans; FIFA handles the transfer."
            }
          }
        }
      ],
      metadata: { offerId },
    });

    await prisma.offer.update({
      where: { id: offerId },
      data: { stripeCheckoutSessionId: session.id }
    });

    return { ok: true, checkoutUrl: session.url };
  }

  return { ok: true };
}

export async function declineOffer(offerId: string) {
  const user = await getOrCreateAnonUser();
  const offer = await prisma.offer.findUnique({ where: { id: offerId } });
  if (!offer || offer.status !== "open") return { ok: false, error: "Offer not found" };
  if (offer.fromUserId !== user.id && offer.toUserId !== user.id) return { ok: false, error: "Forbidden" };

  await prisma.offer.update({
    where: { id: offerId },
    data: { status: "cancelled" }
  });
  return { ok: true };
}
