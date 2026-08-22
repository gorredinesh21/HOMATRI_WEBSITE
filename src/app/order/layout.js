import { Suspense } from "react";

export default function OrderLayout({ children }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-sm text-homatri-muted">
          Loading Homatri kitchens…
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
