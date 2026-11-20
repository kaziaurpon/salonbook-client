"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { authenticatedApiFetch } from "@/lib/api";

type Overview = { customers: number; blockedCustomers: number; activeServices: number; totalAppointments: number; pendingAppointments: number; confirmedAppointments: number; cancelledAppointments: number; successfulPayments: number };

export default function AdminDashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (isPending) return;
    if (!session) { router.replace("/login"); return; }
    const user = session.user as typeof session.user & { role?: string; isBlocked?: boolean };
    if (user.isBlocked) { void authClient.signOut().then(() => router.replace("/login")); return; }
    if (user.role !== "admin") { router.replace("/dashboard/customer"); return; }
    void (async () => {
      setLoading(true); setError("");
      try {
        const response = await authenticatedApiFetch("/api/admin/overview");
        const result = await response.json() as { overview?: Overview; message?: string };
        if (!response.ok || !result.overview) throw new Error(result.message || "Could not load the dashboard overview.");
        setOverview(result.overview);
      } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not load the dashboard overview."); }
      finally { setLoading(false); }
    })();
  }, [isPending, reloadKey, router, session]);

  if (isPending || !session) return <main className="admin-services-page"><p>Checking admin access…</p></main>;
  const stats = overview ? [
    ["Registered customers", overview.customers, "All customer accounts"],
    ["Active services", overview.activeServices, "Visible in the public catalog"],
    ["Appointment requests", overview.totalAppointments, "All submitted bookings"],
    ["Pending appointments", overview.pendingAppointments, "Awaiting salon review"],
    ["Confirmed appointments", overview.confirmedAppointments, "Approved for a salon visit"],
    ["Successful payments", overview.successfulPayments, "Payments marked as paid"],
  ] as const : [];

  return <main className="admin-services-page admin-dashboard-page">
    <header className="admin-services-heading"><div><p className="eyebrow">SALONBOOK CONTROL ROOM</p><h1>Good to see you, {session.user.name.split(" ")[0]}</h1><p>Keep the service menu polished and the day running smoothly.</p></div><span className="admin-dashboard-mark" aria-hidden="true">S</span></header>
    {loading ? <section className="admin-overview-grid" aria-label="Loading overview">{[1,2,3,4,5,6].map((item) => <div className="admin-overview-card overview-skeleton" key={item}>Loading overview…</div>)}</section> : error ? <div className="service-message service-error"><p>{error}</p><button onClick={() => setReloadKey((key) => key + 1)}>Try again</button></div> : <section className="admin-overview-grid" aria-label="Salon overview">{stats.map(([label, value, detail], index) => <article className={`admin-overview-card overview-card-${index + 1}`} key={label}><p>{label}</p><strong>{value.toLocaleString()}</strong><span>{detail}</span></article>)}</section>}
    <section className="admin-dashboard-actions"><div><p className="eyebrow">QUICK ACCESS</p><h2>What would you like to manage?</h2><p>Changes to active services are reflected in the public catalog.</p></div><div className="admin-action-links"><Link className="admin-action-card" href="/dashboard/admin/services"><span>01 / CATALOG</span><strong>Manage services</strong><small>Add, edit, activate, or archive salon treatments →</small></Link><Link className="admin-action-card" href="/dashboard/admin/appointments"><span>02 / SCHEDULE</span><strong>Appointments</strong><small>Review requests and update booking status →</small></Link><Link className="admin-action-card" href="/dashboard/admin/customers"><span>03 / PEOPLE</span><strong>Customer accounts</strong><small>Review profiles and manage protected access →</small></Link><Link className="admin-action-card" href="/dashboard/admin/transactions"><span>04 / LEDGER</span><strong>Transactions</strong><small>Review successful payments from verified webhooks →</small></Link></div></section>
  </main>;
}
