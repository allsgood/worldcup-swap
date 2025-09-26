import { prisma } from "@/lib/db";
import { findUserFromCookie } from "@/lib/session";
import MatchCard from "@/components/MatchCard";

export default async function MatchesPage() {
  const user = await findUserFromCookie(); // read-only, no cookie set
  if (!user) {
    return (
      <section>
        <h1>Your Matches</h1>
        <p style={{ color: "#666" }}>
          We couldn’t find your session. Please create a listing on the homepage first, then return here.
        </p>
        <a href="/">Go to Create Listing →</a>
      </section>
    );
  }

  const offers = await prisma.offer.findMany({
    where: { OR: [{ fromUserId: user.id }, { toUserId: user.id }], status: "open" },
    include: {
      fromListing: true,
      toListing: true
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <section>
      <h1>Your Matches</h1>
      <p style={{ color: "#666" }}>
        When both parties accept and pay the matchmaking fee, head to <b>/success</b> to complete the FIFA handoff.
      </p>
      <div style={{ display: "grid", gap: 12 }}>
        {offers.length === 0 && <div>No matches yet—create or update your listing filters.</div>}
        {offers.map((o) => (
          <MatchCard key={o.id} offer={o as any} />
        ))}
      </div>
    </section>
  );
}
