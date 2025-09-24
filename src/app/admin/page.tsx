import { cookies } from "next/headers";
import { prisma } from "@/src/lib/db";

export default async function AdminHome() {
  const isAuthed = cookies().get("admin_auth")?.value === "1";
  if (!isAuthed) {
    return (
      <div>
        <h1>Unauthorized</h1>
        <a href="/admin/login">Go to admin login →</a>
      </div>
    );
  }

  const listings = await prisma.listing.findMany({
    orderBy: { createdAt: "desc" },
    take: 50
  });

  return (
    <section>
      <h1>Admin • Listings</h1>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr><th align="left">City</th><th align="left">Stadium</th><th align="left">Date</th><th>Cat</th><th>Featured</th><th>Toggle</th></tr>
        </thead>
        <tbody>
        {listings.map(l => (
          <tr key={l.id} style={{ borderTop: "1px solid #eee" }}>
            <td>{l.city}</td>
            <td>{l.stadium}</td>
            <td>{new Date(l.date).toDateString()}</td>
            <td>{l.category}</td>
            <td style={{ textAlign: "center" }}>{l.featured ? "⭐" : "—"}</td>
            <td style={{ textAlign: "center" }}>
              <form action={`/api/admin/feature?id=${l.id}`} method="post">
                <button>{l.featured ? "Unfeature" : "Feature"}</button>
              </form>
            </td>
          </tr>
        ))}
        </tbody>
      </table>
    </section>
  );
}
