import { prisma } from "@/lib/db";
import { getOrCreateAnonUser } from "@/lib/session";
import MatchCard from "@/components/MatchCard";

export default async function MatchesPage() {
  const user = await getOrCreateAnonUser();
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
          <MatchCard key={o.id} offer={o} />
        ))}
      </div>
    </section>
  );
}
