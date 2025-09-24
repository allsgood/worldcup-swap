"use client";

import { useState, useTransition } from "react";
import { submitConfirmation } from "@/src/actions/confirmationActions";

export default function ConfirmationForm({ offerId, existingRef }: { offerId: string; existingRef: string }) {
  const [ref, setRef] = useState(existingRef);
  const [msg, setMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    startTransition(async () => {
      const res = await submitConfirmation(offerId, ref.trim());
      if (res?.ok) setMsg("Saved. Thanks! We’ll notify your partner automatically.");
      else setMsg(res?.error || "Something went wrong");
    });
  };

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: 8, marginTop: 16 }}>
      <label htmlFor="conf">Your FIFA confirmation ID</label>
      <input
        id="conf"
        placeholder="e.g., TRF-1234-ABCD"
        value={ref}
        onChange={(e) => setRef(e.target.value)}
        required
      />
      <button disabled={isPending} type="submit">{isPending ? "Saving…" : "Submit confirmation"}</button>
      {msg && <div style={{ color: "#0a0" }}>{msg}</div>}
    </form>
  );
}
