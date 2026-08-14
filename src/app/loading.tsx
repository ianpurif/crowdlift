import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <main className="shell route-main route-state-page" aria-busy="true">
      <div className="route-loading" role="status">
        <Loader2 aria-hidden="true" className="animate-spin" size={20} />
        <span>Loading CrowdLift…</span>
      </div>
    </main>
  );
}
