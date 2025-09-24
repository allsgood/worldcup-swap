import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "WC26 Ticket Swap",
  description: "Matchmaking only. Complete transfers on FIFA’s official platform."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header style={{ padding: "16px", borderBottom: "1px solid #eee" }}>
          <nav style={{ display: "flex", gap: 16 }}>
            <a href="/">Create Listing</a>
            <a href="/matches">Your Matches</a>
            <a href="/terms">Terms</a>
            <a href="/admin">Admin</a>
          </nav>
        </header>
        <main style={{ maxWidth: 860, margin: "24px auto", padding: "0 16px" }}>{children}</main>
      </body>
    </html>
  );
}
