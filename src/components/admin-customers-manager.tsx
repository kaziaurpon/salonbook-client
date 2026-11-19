"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { authenticatedApiFetch } from "@/lib/api";

type Customer = { _id: string; name: string; email: string; image?: string | null; phone?: string | null; role: string; isBlocked: boolean; createdAt?: string };
type Appointment = { _id: string; appointmentDate: string; timeSlot: string; servicePrice: number; status: string; paymentStatus: string; createdAt: string; serviceId?: { serviceName: string; category: string; image?: string } | null };
type DetailPayload = { customer?: Customer; appointments?: Appointment[]; message?: string };

export function AdminCustomersManager({ detail = false }: { detail?: boolean }) {
  const router = useRouter();
  const params = useParams<{ customerId?: string }>();
  const customerId = params.customerId;
  const { data: session, isPending } = authClient.useSession();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selected, setSelected] = useState<Customer | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [totals, setTotals] = useState({ blocked: 0, unblocked: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingAction, setPendingAction] = useState<Customer | null>(null);
  const [saving, setSaving] = useState(false);
  const [reload, setReload] = useState(0);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      if (detail && customerId) {
        const response = await authenticatedApiFetch(`/api/admin/customers/${encodeURIComponent(customerId)}`);
        const result = await response.json() as DetailPayload;
        if (!response.ok || !result.customer) throw new Error(result.message || "Could not load customer details.");
        setSelected(result.customer); setAppointments(result.appointments || []);
      } else {
        const params = new URLSearchParams({ page: String(page), limit: "12" });
        if (search) params.set("q", search);
        const response = await authenticatedApiFetch(`/api/admin/customers?${params.toString()}`);
        const result = await response.json() as { customers?: Customer[]; pagination?: { pages: number }; totals?: { blocked: number; unblocked: number }; message?: string };
        if (!response.ok || !result.customers) throw new Error(result.message || "Could not load customers.");
        setCustomers(result.customers); setPages(result.pagination?.pages || 1); setTotals(result.totals || { blocked: 0, unblocked: 0 });
      }
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not load customer data."); }
    finally { setLoading(false); }
  }, [customerId, detail, page, reload, search]);

  useEffect(() => {
    if (isPending) return;
    if (!session) { router.replace("/login"); return; }
    const user = session.user as typeof session.user & { role?: string; isBlocked?: boolean };
    if (user.isBlocked) { void authClient.signOut().then(() => router.replace("/login")); return; }
    if (user.role !== "admin") { router.replace("/dashboard/customer"); return; }
    void load();
  }, [isPending, load, router, session]);

  async function changeBlockedStatus() {
    if (!pendingAction) return;
    setSaving(true);
    try {
      const response = await authenticatedApiFetch(`/api/admin/customers/${encodeURIComponent(pendingAction._id)}/status`, { method: "PATCH", body: JSON.stringify({ isBlocked: !pendingAction.isBlocked }) });
      const result = await response.json() as { customer?: Customer; message?: string };
      if (!response.ok || !result.customer) throw new Error(result.message || "Could not update customer access.");
      toast.success(result.message || "Customer access updated."); setPendingAction(null); setReload((value) => value + 1);
    } catch (reason) { toast.error(reason instanceof Error ? reason.message : "Could not update customer access."); }
    finally { setSaving(false); }
  }

  if (isPending || !session) return <main className="admin-services-page"><p>Checking administrator access…</p></main>;

  if (detail) return <main className="admin-services-page customer-detail-page">
    <header className="admin-services-heading"><div><Link className="brand" href="/dashboard/admin/customers">← All customers</Link><p className="eyebrow">CUSTOMER ACCOUNT</p><h1>{selected?.name || "Customer details"}</h1><p>Account details and appointment history.</p></div><button className="secondary-button" onClick={() => void load()} disabled={loading}>Refresh</button></header>
    {loading ? <p className="service-message">Loading customer…</p> : error ? <div className="service-message service-error"><p>{error}</p><button className="secondary-button" onClick={() => setReload((value) => value + 1)}>Try again</button></div> : selected ? <>
      <section className="customer-detail-card"><div className="customer-avatar">{selected.image ? <img src={selected.image} alt="" /> : selected.name.slice(0, 1).toUpperCase()}</div><div><p className="eyebrow">{selected.isBlocked ? "ACCESS BLOCKED" : "ACTIVE ACCOUNT"}</p><h2>{selected.name}</h2><p>{selected.email}</p><p>{selected.phone || "No phone number added"}</p><small>Joined {selected.createdAt ? new Date(selected.createdAt).toLocaleDateString() : "—"}</small></div></section>
      <section className="customer-history"><div className="section-heading"><div><p className="eyebrow">BOOKING RECORD</p><h2>Appointments</h2></div><span>{appointments.length} shown</span></div>{appointments.length ? <div className="customer-history-list">{appointments.map((item) => <article key={item._id}><div><strong>{item.serviceId?.serviceName || "Salon service"}</strong><p>{item.serviceId?.category || ""} · {new Date(item.appointmentDate).toLocaleDateString()} · {item.timeSlot}</p><small>Requested {new Date(item.createdAt).toLocaleDateString()}</small></div><div><span className={`status-pill status-${item.status}`}>{item.status}</span><span className="status-pill">{item.paymentStatus}</span><strong>৳{item.servicePrice.toLocaleString()}</strong></div></article>)}</div> : <p className="service-message">This customer has no appointment history.</p>}</section>
    </> : null}
  </main>;

  return <main className="admin-services-page customers-page">
    <header className="admin-services-heading"><div><p className="eyebrow">PEOPLE · ACCOUNT ACCESS</p><h1>Customers</h1><p>Review customer accounts, appointment history, and platform access.</p></div><button className="secondary-button" onClick={() => void load()} disabled={loading}>Refresh</button></header>
    <section className="customer-totals"><article><span>Active accounts</span><strong>{totals.unblocked.toLocaleString()}</strong></article><article><span>Blocked accounts</span><strong>{totals.blocked.toLocaleString()}</strong></article></section>
    <form className="customer-search" onSubmit={(event) => { event.preventDefault(); setPage(1); setSearch(query.trim()); }}><label htmlFor="customer-search">Search customers</label><div><input id="customer-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name or email" /><button className="primary-button">Search</button></div></form>
    {loading ? <p className="service-message">Loading customer accounts…</p> : error ? <div className="service-message service-error"><p>{error}</p><button className="secondary-button" onClick={() => setReload((value) => value + 1)}>Try again</button></div> : customers.length === 0 ? <p className="service-message">No customers match this search.</p> : <>
      <div className="customer-list">{customers.map((customer) => <article className="customer-row" key={customer._id}><div className="customer-avatar">{customer.image ? <img src={customer.image} alt="" /> : customer.name.slice(0, 1).toUpperCase()}</div><div className="customer-main"><strong>{customer.name}</strong><span>{customer.email}</span><small>{customer.phone || "No phone added"}{customer.createdAt ? ` · Joined ${new Date(customer.createdAt).toLocaleDateString()}` : ""}</small></div><span className={`status-pill ${customer.isBlocked ? "status-cancelled" : "status-confirmed"}`}>{customer.isBlocked ? "Blocked" : "Active"}</span><div className="customer-actions"><Link className="secondary-button" href={`/dashboard/admin/customers/${encodeURIComponent(customer._id)}`}>View details</Link><button className={customer.isBlocked ? "primary-button" : "text-button"} onClick={() => setPendingAction(customer)}>{customer.isBlocked ? "Unblock" : "Block"}</button></div></article>)}</div>
      <nav className="admin-pagination" aria-label="Customer pages"><button className="secondary-button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</button><span>Page {page} of {pages}</span><button className="secondary-button" disabled={page >= pages} onClick={() => setPage((value) => value + 1)}>Next</button></nav>
    </>}
    {pendingAction && <div className="admin-dialog-backdrop" role="presentation"><section className="admin-confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="customer-status-title"><p className="eyebrow">CUSTOMER ACCESS</p><h2 id="customer-status-title">{pendingAction.isBlocked ? "Unblock" : "Block"} {pendingAction.name}?</h2><p>{pendingAction.isBlocked ? "This customer will be able to use protected features again." : "This customer will immediately lose access to protected platform features and APIs."}</p><div><button className="secondary-button" onClick={() => setPendingAction(null)} disabled={saving}>Go back</button><button className="primary-button" onClick={() => void changeBlockedStatus()} disabled={saving}>{saving ? "Updating…" : pendingAction.isBlocked ? "Unblock customer" : "Block customer"}</button></div></section></div>}
  </main>;
}
