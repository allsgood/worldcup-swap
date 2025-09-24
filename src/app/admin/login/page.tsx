"use client";

import { useState } from "react";

export default function AdminLogin() {
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/login", { method: "POST", body: fd });
    if (res.ok) window.location.href = "/admin";
    else setErr("Invalid password");
  };

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 12, maxWidth: 360 }}>
      <h1>Admin Login</h1>
      <input type="password" name="password" placeholder="Admin password" required />
      <button type="submit">Sign in</button>
      {err && <div style={{ color: "crimson" }}>{err}</div>}
    </form>
  );
}
