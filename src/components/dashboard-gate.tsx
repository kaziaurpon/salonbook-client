"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { SalonBookLogo } from "@/components/salonbook-logo";
import { authenticatedApiFetch } from "@/lib/api";
import { toast } from "sonner";
import { minimumLoader, ScissorsLoader } from "@/components/loading-system";

export function DashboardGate({ role, title }: { role: "admin" | "customer"; title: string }) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [apiStatus, setApiStatus] = useState("Checking secure API connection…");
  const [apiLoading, setApiLoading] = useState(true);
  const [apiRetry, setApiRetry] = useState(0);

  async function signOut() {
    try {
      const result = await authClient.signOut();
      if (result.error) throw new Error(result.error.message || "Could not sign out. Please try again.");
      toast.success("Signed out successfully.");
      router.replace("/login");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not sign out. Please try again.");
    }
  }

  useEffect(() => {
    if (isPending) return;
    if (!session) {
      const requestedPath = typeof window === "undefined" ? "/" : `${window.location.pathname}${window.location.search}`;
      router.replace(`/login?${new URLSearchParams({ callbackUrl: requestedPath }).toString()}`);
      return;
    }
    const user = session.user as typeof session.user & { role?: string; isBlocked?: boolean };
    if (user.isBlocked) {
      void authClient.signOut().then(() => router.replace("/account/blocked"));
    } else if (user.role !== role) {
      router.replace(user.role === "admin" ? "/dashboard/admin" : "/dashboard/customer");
    }
  }, [isPending, router, role, session]);

  useEffect(() => {
    if (isPending || !session) return;
    const user = session.user as typeof session.user & { role?: string; isBlocked?: boolean };
    if (user.role !== role || user.isBlocked) return;
    let active = true;
    const minimumLoading = minimumLoader(400);
    queueMicrotask(() => {
      if (!active) return;
      setApiLoading(true);
      void authenticatedApiFetch(`/api/dashboard/${role}`)
        .then(async (response) => {
          if (!response.ok) {
            const body = await response.json().catch(() => ({})) as { message?: string };
            throw new Error(body.message || `API request failed (${response.status}).`);
          }
          if (active) setApiStatus("Express API verified your JWT and current account role.");
        })
        .catch((error: unknown) => {
          if (active) setApiStatus(error instanceof Error ? error.message : "Could not verify the API session.");
        }).finally(async () => { await minimumLoading; if (active) setApiLoading(false); });
    });
    return () => { active = false; };
  }, [apiRetry, isPending, role, session]);

  if (isPending || !session) return <main className="auth-page"><p>Checking your session…</p></main>;
  const user = session.user as typeof session.user & { role?: string; isBlocked?: boolean };
  if (user.role !== role || user.isBlocked) return <main className="auth-page"><p>Redirecting…</p></main>;

  return (
    <main className="auth-page">
      <section className="auth-card">
        <SalonBookLogo className="brand" />
        <p className="eyebrow">{role.toUpperCase()} DASHBOARD</p>
        <h1>{title}</h1>
        <p>Signed in as {session.user.name}.</p>
        {apiLoading ? <ScissorsLoader label="Preparing your dashboard..." /> : <p className="api-status" role="status" aria-live="polite">{apiStatus}</p>}
        {!apiLoading && !apiStatus.startsWith("Express API verified") && <button className="secondary-button" onClick={() => { setApiStatus("Checking secure API connection…"); setApiLoading(true); setApiRetry((retry) => retry + 1); }}>Retry connection</button>}
        {role === "admin" && <Link className="service-link" href="/dashboard/admin/services">Manage salon services →</Link>}
        {role === "admin" && <Link className="service-link" href="/dashboard/admin/appointments">Review appointment requests →</Link>}
        <button className="secondary-button" onClick={() => void signOut()}>Sign out</button>
      </section>
    </main>
  );
}
