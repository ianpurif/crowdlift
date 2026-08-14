import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="shell route-main route-state-page">
      <section className="route-empty" aria-labelledby="not-found-title">
        <span className="eyebrow">404</span>
        <h1 id="not-found-title">Page not found</h1>
        <p>The page may have moved, or the link may be incorrect.</p>
        <div className="route-state-actions">
          <Link className="button-primary" href="/campaigns">
            <ArrowLeft aria-hidden="true" size={16} />
            Browse campaigns
          </Link>
          <Link className="button-secondary" href="/">
            Go home
          </Link>
        </div>
      </section>
    </main>
  );
}
