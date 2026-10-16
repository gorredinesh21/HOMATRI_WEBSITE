"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Chef accounts are now created by the Homatri team with issued credentials
// (kitchen phone + password). Self-signup is closed — send everyone to the
// chef sign-in page.
export default function ChefOnboardingRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/chef");
  }, [router]);
  return (
    <div className="min-h-screen bg-homatri-cream flex items-center justify-center px-4">
      <div className="max-w-md bg-white border border-homatri-border rounded-3xl p-8 text-center space-y-2">
        <p className="font-display italic text-homatri-orange">Homatri Kitchen</p>
        <h1 className="font-display text-xl font-medium text-homatri-dark">
          Chef onboarding is now by invitation
        </h1>
        <p className="text-sm text-homatri-muted">
          The Homatri team creates your kitchen account and hands over your login. Taking you to
          sign in…
        </p>
      </div>
    </div>
  );
}
