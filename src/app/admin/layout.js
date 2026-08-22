"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminAuthProvider, useAdminAuth } from "@/context/AdminAuthContext";
import AdminSidebar from "./_components/AdminSidebar";

function AdminGate({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { ready, isAuthenticated } = useAdminAuth();
  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    if (!ready) return;
    if (!isAuthenticated && !isLogin) router.replace("/admin/login");
    if (isAuthenticated && isLogin) router.replace("/admin");
  }, [ready, isAuthenticated, isLogin, router]);

  if (isLogin) return children;

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-homatri-muted">
        Loading control tower…
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-homatri-muted">
        Redirecting to admin sign in…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-homatri-cream flex flex-col lg:flex-row">
      <AdminSidebar />
      <main className="flex-1 px-4 sm:px-8 py-6 lg:py-10 max-w-6xl w-full">{children}</main>
    </div>
  );
}

export default function AdminLayout({ children }) {
  return (
    <AdminAuthProvider>
      <AdminGate>{children}</AdminGate>
    </AdminAuthProvider>
  );
}
