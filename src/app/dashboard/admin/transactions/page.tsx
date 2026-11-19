"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { authenticatedApiFetch } from "@/lib/api";

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

export default function AdminTransactionsPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [items, setItems] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await authenticatedApiFetch("/api/admin/transactions");
      const result = await response.json() as { transactions?: TransactionItem[]; message?: string };
      if (!response.ok || !result.transactions) throw new Error(result.message || "Could not load transactions.");
      setItems(result.transactions);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not load transactions."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (isPending) return;
    if (!session) { router.replace("/login"); return; }
    const user = session.user as typeof session.user & { role?: string; isBlocked?: boolean };
    if (user.isBlocked) void authClient.signOut().then(() => router.replace("/login"));
    else if (user.role !== "admin") router.replace("/dashboard/customer");
    else void load();
  }, [isPending, load, router, session]);

  if (isPending || !session) return <main className="admin-services-page"><p>Checking admin access…</p></main>;
  return <main className="admin-services-page">
    <header className="admin-services-heading"><div><Link className="brand" href="/dashboard/admin">← Admin dashboard</Link><p className="eyebrow">PAYMENT LEDGER · READ ONLY</p><h1>Transactions</h1><p>Successful Stripe payments, recorded by verified webhooks.</p></div><button className="secondary-button" onClick={() => void load()} disabled={loading}>Refresh</button></header>
    {loading ? <p className="service-message">Loading transactions…</p> : error ? <div className="service-message service-error"><p>{error}</p><button onClick={() => void load()}>Try again</button></div> : items.length === 0 ? <p className="service-message">No successful payments have been recorded yet.</p> : <div className="transaction-list">{items.map((item) => <article className="transaction-item" key={item._id}><div><p className="eyebrow">{item.status}</p><h2>{item.appointment?.serviceId?.serviceName || "Salon appointment"}</h2><p>{item.customer?.name || "Customer"} · {item.customer?.email || item.customerId}</p><p>Appointment: {item.appointment ? `${new Date(item.appointment.appointmentDate).toLocaleDateString()} · ${item.appointment.timeSlot}` : "Appointment details unavailable"}</p><small>Stripe session: <code>{item.stripeSessionId}</code></small><small>Paid {new Date(item.createdAt).toLocaleString()}</small></div><strong>{new Intl.NumberFormat("en-BD", { style: "currency", currency: item.currency.toUpperCase() }).format(item.amount)}</strong></article>)}</div>}
  </main>;
}
