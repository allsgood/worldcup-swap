import ListingForm from "@/src/components/ListingForm";
import { createListing } from "@/src/actions/listingActions";

export default function Home() {
  return (
    <section>
      <h1>Got the wrong match? Swap into the right one.</h1>
      <p style={{ color: "#666" }}>
        We match your <b>Have</b> with someone else’s <b>Want</b>. You both finish the transfer on FIFA’s official system.
        We never sell or hold tickets.
      </p>
      <ListingForm action={createListing} />
    </section>
  );
}
