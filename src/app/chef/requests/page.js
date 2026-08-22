"use client";

import DietaryRequestCard from "../_components/DietaryRequestCard";
import { useChefDashboard } from "@/context/ChefDashboardContext";

export default function ChefRequestsPage() {
  const { dietaryRequests, acceptDietary, rejectDietary, counterDietary } = useChefDashboard();

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] uppercase tracking-widest text-homatri-orange">Dietary requests</p>
        <h1 className="font-display text-3xl font-medium text-homatri-dark mt-1">Customization notes</h1>
        <p className="text-sm text-homatri-muted mt-2">
          Accept, reject, or counter. The UI hides a third counter; FastAPI must still enforce `counter_turn_count &lt;= 2`.
        </p>
      </header>
      <div className="space-y-4">
        {dietaryRequests.map((request) => (
          <DietaryRequestCard
            key={request.requestId}
            {...request}
            onAccept={acceptDietary}
            onReject={rejectDietary}
            onCounterOffer={counterDietary}
          />
        ))}
      </div>
    </div>
  );
}
