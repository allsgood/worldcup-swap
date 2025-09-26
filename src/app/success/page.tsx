import { prisma } from "@/lib/db";
import { findUserFromCookie } from "@/lib/session";
import ConfirmationForm from "@/components/ConfirmationForm";

export default async function SuccessPage({ searchParams }: { searchParams: { offer?: string } }) {
  const user = await findUserFromCookie(); // read-only; do not set cookie here
  if (!user) {
    return (
      <section>
        <h1>Not signed in</h1>
        <p>We couldn’t find your session. Please create a listing on the homepage, then return to your success link.</p>
        <a href="/">Go to Create Listing →</a>
      </section>
    );
  }
  if (!offerId) {
    return (
      <section>
        <h1>Payment successful</h1>
        <p>We couldn’t find an offer ID in the URL, but your payment was received. Check <a href="/matches">Your Matches</a>.</p>
      </section>
    );
  }

  const user = await getOrCreateAnonUser();
  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
    include: { fromListing: true, toListing: true }
  });

  if (!offer || (offer.fromUserId !== user.id && offer.toUserId !== user.id)) {
    return (
      <section>
        <h1>Not found</h1>
        <p>This offer is unavailable or not associated with your session.</p>
      </section>
    );
  }

  const youGive   = offer.fromUserId === user.id ? offer.fromListing : offer.toListing;
  const youGet    = offer.fromUserId === user.id ? offer.toListing   : offer.fromListing;
  const yourRef   = offer.fromUserId === user.id ? offer.fromConfirmationRef : offer.toConfirmationRef;
  const partnerRef= offer.fromUserId === user.id ? offer.toConfirmationRef   : offer.fromConfirmationRef;

  return (
    <section>
      <h1>Next step: complete the FIFA handoff</h1>
      <ol>
        <li>Open your FIFA ticketing account.</li>
        <li>Use <b>Ticket Transfer</b> or the official <b>Resale</b> route to complete the swap.</li>
        <li>Paste your FIFA confirmation ID below so your partner and our system can verify.</li>
      </ol>

      <div style={{ border: "1px solid #eee", borderRadius: 8, padding: 12, marginTop: 12 }}>
        <h3>Your Swap Summary</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 24px 1fr", gap: 12 }}>
          <div>
            <div style={{ fontWeight: 600 }}>You give</div>
            <small>{youGive.city} • {youGive.stadium}</small><br />
            <small>{new Date(youGive.date).toDateString()} • {youGive.category}</small>
          </div>
          <div style={{ textAlign: "center", alignSelf: "center" }}>↔</div>
          <div>
            <div style={{ fontWeight: 600 }}>You get</div>
            <small>{youGet.city} • {youGet.stadium}</small><br />
            <small>{new Date(youGet.date).toDateString()} • {youGet.category}</small>
          </div>
        </div>
        <div style={{ marginTop: 10 }}>
          Net top-up noted in the offer: <b>${(offer.cashDeltaCents/100).toFixed(2)}</b>
        </div>
      </div>

      <ConfirmationForm offerId={offer.id} existingRef={yourRef ?? ""} />

      <div style={{ marginTop: 16, padding: 12, border: "1px dashed #ddd", borderRadius: 8 }}>
        <b>Partner status:</b>{" "}
        {partnerRef ? <>Confirmation received ✓ (<code>{partnerRef}</code>)</> : "Waiting on partner…"}
        <br />
        {offer.completedAt ? <b>All set! Swap completed on {new Date(offer.completedAt).toLocaleString()}.</b> : null}
      </div>

      <p style={{ color: "#666", marginTop: 16 }}>
        Reminder: we never sell or hold tickets. All transfers/resales occur on FIFA’s official platform.
      </p>
    </section>
  );
}
