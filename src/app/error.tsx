"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("CrowdLift route error", error);
  }, [error]);

  return (
    <main className="shell route-main route-state-page">
      <section className="route-error" aria-labelledby="route-error-title">
        <AlertTriangle aria-hidden="true" size={24} />
        <strong id="route-error-title">This page could not be loaded</strong>
        <p>Your wallet and funds are safe. Retry the request or return to the campaign list.</p>
        <div className="route-state-actions">
          <button className="button-primary" type="button" onClick={unstable_retry}>
            <RefreshCw aria-hidden="true" size={16} />
            Try again
          </button>
          <Link className="button-secondary" href="/campaigns">
            Browse campaigns
          </Link>
        </div>
      </section>
    </main>
  );
}
