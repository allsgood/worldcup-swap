"use client";

import { Offer, Listing } from "@prisma/client";
import { useTransition, useState } from "react";
import { acceptOffer, declineOffer } from "@/actions/offerActions";

type OfferWithListings = Offer & { fromListing: Listing; toListing: Listing };

export default function MatchCard({ offer }: { offer: OfferWithListings }) {
  const a = offer.fromListing;
  const b = offer.toListing;
  const [isPending, startTransition] = useTransition();
  const [local, setLocal] = useState(offer);

  const onAccept = () => {
    startTransition(async () => {
      const res = await acceptOffer(offer.id);
      if (res?.checkoutUrl) {
        window.location.href = res.checkoutUrl;
      }
    });
  };

  const onDecline = () => {
    startTransition(async () => {
      const res = await declineOffer(offer.id);
      if (res?.ok) setLocal({ ...local, status: "cancelled" as any });
    });
  };

  return (
    <div style={{ border: "1px solid #eee", borderRadius: 8, padding: 12, opacity: local.status !== "open" ? 0.6 : 1 }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>
        Direct Swap — {local.status === "open" ? "pending" : local.status}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 24px 1fr", gap: 12 }}>
        <div>
          <div style={{ fontWeight: 600 }}>Your Ticket</div>
          <small>{a.city} • {a.stadium}</small><br />
          <small>{new Date(a.date).toDateString()} • {a.category}</small><br />
          <small>Face: ${(a.faceValueCents/100).toFixed(2)}</small>
        </div>
        <div style={{ textAlign: "center", alignSelf: "center" }}>↔</div>
        <div>
          <div style={{ fontWeight: 600 }}>Their Ticket</div>
          <small>{b.city} • {b.stadium}</small><br />
          <small>{new Date(b.date).toDateString()} • {b.category}</small><br />
          <small>Face: ${(b.faceValueCents/100).toFixed(2)}</small>
        </div>
      </div>

      <div style={{ marginTop: 8 }}>
        Net top-up needed: <b>${(local.cashDeltaCents/100).toFixed(2)}</b> (positive = they pay you)
      </div>

      <details style={{ marginTop: 8 }}>
        <summary>How to complete the swap</summary>
        <ol style={{ marginTop: 8 }}>
          <li>Both parties accept here.</li>
          <li>Pay the matchmaking fee (Stripe checkout opens automatically when both have accepted).</li>
          <li>Use FIFA’s account to transfer or use the official resale route; exchange confirmation IDs.</li>
        </ol>
      </details>

      {local.status === "open" && (
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <button onClick={onAccept} disabled={isPending}>Accept</button>
          <button onClick={onDecline} disabled={isPending} style={{ background: "#fff" }}>Decline</button>
        </div>
      )}

      {local.feePaid && <div style={{ marginTop: 8, fontWeight: 600 }}>Fee paid ✓ — proceed with FIFA transfer</div>}
    </div>
  );
}
