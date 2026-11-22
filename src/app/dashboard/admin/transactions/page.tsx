"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { authenticatedApiFetch } from "@/lib/api";
import { DashboardSkeleton, minimumLoader } from "@/components/loading-system";

type TransactionItem = {
  _id: string;
  appointmentId: string;
  customerId: string;
  amount: number;
  currency: string;
  stripeSessionId: string;
  status: string;
  createdAt: string;
  customer?: { name: string; email: string } | null;
  appointment?: { appointmentDate: string; timeSlot: string; serviceId?: { serviceName: string; category: string } | null } | null;
};
type TransactionTotals = { total: number; successful: number; failed: number };

export default function AdminTransactionsPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [items, setItems] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [totals, setTotals] = useState<TransactionTotals>({ total: 0, successful: 0, failed: 0 });
  const load = useCallback(async () => {
    setLoading(true); setError("");
    const minimumLoading = minimumLoader(400);
    try {
      const response = await authenticatedApiFetch(`/api/admin/transactions?page=${page}&limit=12`);
      const result = await response.json() as { transactions?: TransactionItem[]; totals?: TransactionTotals; pagination?: { pages: number }; message?: string };
      if (!response.ok || !result.transactions) throw new Error(result.message || "Could not load transactions.");
      setItems(result.transactions);
      setTotals(result.totals || { total: 0, successful: 0, failed: 0 });
      setPages(result.pagination?.pages || 1);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not load transactions."); }
    finally { await minimumLoading; setLoading(false); }
  }, [page]);

  useEffect(() => {
    if (isPending) return;
    if (!session) { router.replace("/login"); return; }
    const user = session.user as typeof session.user & { role?: string; isBlocked?: boolean };
    if (user.isBlocked) void authClient.signOut().then(() => router.replace("/login"));
    else if (user.role !== "admin") router.replace("/dashboard/customer");
    else {
      let active = true;
      queueMicrotask(() => { if (active) void load(); });
      return () => { active = false; };
    }
  }, [isPending, load, router, session]);

  if (isPending || !session) return <main className="admin-services-page"><p>Checking admin access…</p></main>;
  return <main className="admin-services-page admin-transactions-page">
    <header className="admin-services-heading transaction-heading"><div><Link className="brand" href="/dashboard/admin">← Admin dashboard</Link><p className="eyebrow">PAYMENT LEDGER · READ ONLY</p><h1>Transactions</h1><p>Review Stripe checkout activity and verified payment records.</p></div><div className="transaction-heading-actions"><button className="secondary-button" onClick={() => void load()} disabled={loading}>Refresh</button></div></header>
    {!loading && !error && <section className="transaction-stats" aria-label="Transaction totals"><article><span>All records</span><strong>{totals.total.toLocaleString()}</strong><small>Verified checkout attempts</small></article><article><span>Successful payments</span><strong>{totals.successful.toLocaleString()}</strong><small>Confirmed by Stripe</small></article><article><span>Failed payments</span><strong>{totals.failed.toLocaleString()}</strong><small>Unsuccessful checkout attempts</small></article></section>}
    <section className="transaction-ledger">
      <header className="transaction-ledger-heading"><div><p className="eyebrow">SALONBOOK · STRIPE</p><h2>Payment ledger</h2><p>{loading ? "Loading records…" : `${totals.total.toLocaleString()} transaction${totals.total === 1 ? "" : "s"} recorded`}</p></div><span className="read-only-badge">READ ONLY</span></header>
      {loading ? <DashboardSkeleton rows={6} /> : error ? <div className="service-message service-error"><p>{error}</p><button onClick={() => void load()}>Try again</button></div> : items.length === 0 ? <p className="service-message transaction-empty">No payment transactions have been recorded yet.</p> : <>
        <div className="transaction-table-header" aria-hidden="true"><span>Customer</span><span>Service &amp; appointment</span><span>Amount</span><span>Payment status</span><span>Stripe session</span><span>Transaction date</span></div>
        <div className="transaction-list">{items.map((item) => <article className="transaction-item" key={item._id}>
          <div className="transaction-customer"><span className="transaction-avatar">{item.customer?.name?.slice(0, 1).toUpperCase() || "C"}</span><div><strong>{item.customer?.name || "Customer"}</strong><small>{item.customer?.email || item.customerId}</small></div></div>
          <div className="transaction-service"><strong>{item.appointment?.serviceId?.serviceName || "Salon appointment"}</strong><small>{item.appointment?.serviceId?.category || "Service"}</small><span>{item.appointment ? `${new Date(item.appointment.appointmentDate).toLocaleDateString()} · ${item.appointment.timeSlot}` : "Appointment details unavailable"}</span></div>
          <div className="transaction-amount"><strong>{new Intl.NumberFormat("en-BD", { style: "currency", currency: item.currency.toUpperCase() }).format(item.amount)}</strong><small>{item.currency.toUpperCase()}</small></div>
          <div className="transaction-status"><span className={`status-pill ${item.status}`}>{item.status === "paid" ? "Paid" : item.status}</span></div>
          <div className="transaction-session"><code title={item.stripeSessionId}>{item.stripeSessionId.length > 26 ? `${item.stripeSessionId.slice(0, 13)}…${item.stripeSessionId.slice(-8)}` : item.stripeSessionId}</code></div>
          <div className="transaction-date"><strong>{new Date(item.createdAt).toLocaleDateString()}</strong><small>{new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</small></div>
        </article>)}</div>
        <nav className="admin-pagination" aria-label="Transaction pages"><button className="secondary-button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</button><span>Page {page} of {pages}</span><button className="secondary-button" disabled={page >= pages} onClick={() => setPage((value) => value + 1)}>Next</button></nav>
      </>}
    </section>
    <p className="transaction-integrity-note"><span aria-hidden="true">◈</span> Payment status is recorded from Stripe events. Admins can review transaction details but cannot manually mark a payment as successful.</p>
  </main>;
}
