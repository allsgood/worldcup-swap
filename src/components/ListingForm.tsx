"use client";

import { useState } from "react";

type Props = { action: (data: FormData) => Promise<any> };

export default function ListingForm({ action }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; listingId?: string; createdOffers?: number; error?: any } | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const res = await action(fd);
    setResult(res);
    setSubmitting(false);
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
      <h3>Your Ticket (Have)</h3>
      <input name="fifaMatchId" placeholder="FIFA Match ID (e.g., 100234)" required />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <input name="city" placeholder="City" required />
        <input name="stadium" placeholder="Stadium" required />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <input type="date" name="date" required />
        <input name="category" placeholder="Category (e.g., Cat 1)" required />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <input type="number" name="faceValueCents" placeholder="Face Value (cents)" required />
        <input name="packageType" placeholder="Package (optional)" />
      </div>

      <h3>What You Want</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <input name="desiredTeam" placeholder="Desired Team (optional)" />
        <input name="desiredCity" placeholder="Desired City (optional)" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <input type="date" name="dateFrom" placeholder="Earliest Date" />
        <input type="date" name="dateTo" placeholder="Latest Date" />
        <input name="desiredCategory" placeholder="Desired Category (optional)" />
      </div>
      <input type="number" name="priceDeltaCapCents" placeholder="Max acceptable price delta (cents)" />

      <button disabled={submitting} type="submit">
        {submitting ? "Submitting..." : "Create Listing & Find Matches"}
      </button>

      {result && (
        <div style={{ padding: 12, border: "1px solid #eee", borderRadius: 8 }}>
          {result.ok ? (
            <>
              <strong>Listing created!</strong> {result.createdOffers} match(es) found.{" "}
              <a href="/matches">View matches →</a>
            </>
          ) : (
            <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(result.error, null, 2)}</pre>
          )}
        </div>
      )}
    </form>
  );
}
