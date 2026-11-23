"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { getServiceImage } from "@/lib/service-images";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authenticatedApiFetch } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { ButtonLoader, DashboardSkeleton, minimumLoader } from "@/components/loading-system";

type Appointment = {
  _id: string;
  appointmentDate: string;
  timeSlot: string;
  message?: string;
  servicePrice: number;
  status: "pending" | "confirmed" | "cancelled";
  paymentStatus: "unpaid" | "paid";
  createdAt: string;
  serviceId?: { serviceName: string; category: string; image: string } | null;
  customer?: { name: string; email: string } | null;
};
type AppointmentTotals = { total: number; pending: number; confirmed: number; cancelled: number };
type AppointmentQuery = { search: string; sort: string; page: number };

export function AdminAppointments() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState<AppointmentQuery>({ search: "", sort: "latest", page: 1 });
  const [pages, setPages] = useState(1);
  const [totals, setTotals] = useState<AppointmentTotals>({ total: 0, pending: 0, confirmed: 0, cancelled: 0 });
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const [detailsTarget, setDetailsTarget] = useState<Appointment | null>(null);
  const loadRequestId = useRef(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const search = searchInput.trim();
      setQuery((current) => current.search === search ? current : { ...current, search, page: 1 });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const load = useCallback(async () => {
    const requestId = ++loadRequestId.current;
    setLoading(true);
    setError("");
    const minimumLoading = minimumLoader(400);
    try {
      const params = new URLSearchParams({ page: String(query.page), limit: "10", sort: query.sort });
      if (query.search) params.set("q", query.search);
      const response = await authenticatedApiFetch(`/api/admin/appointments?${params.toString()}`);
      const result = await response.json() as { appointments?: Appointment[]; pagination?: { pages: number }; totals?: AppointmentTotals; message?: string };
      if (!response.ok || !result.appointments) throw new Error(result.message || "Could not load appointment requests.");
      if (requestId === loadRequestId.current) {
        setAppointments(result.appointments);
        setPages(result.pagination?.pages || 1);
        setTotals(result.totals || { total: 0, pending: 0, confirmed: 0, cancelled: 0 });
      }
    } catch (reason) {
      if (requestId === loadRequestId.current) setError(reason instanceof Error ? reason.message : "Could not load appointment requests.");
    } finally {
      await minimumLoading;
      if (requestId === loadRequestId.current) {
        setLoading(false);
        setHasLoaded(true);
      }
    }
  }, [query]);

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

  async function updateStatus(item: Appointment, status: "confirmed" | "cancelled") {
    setBusyId(item._id);
    const minimumLoading = minimumLoader(400);
    try {
      const response = await authenticatedApiFetch(`/api/admin/appointments/${item._id}/status`, {
        method: "PATCH", body: JSON.stringify({ status }),
      });
      const result = await response.json() as { message?: string };
      if (!response.ok) throw new Error(result.message || "Could not update appointment status.");
      toast.success(result.message || `Appointment ${status}.`);
      setCancelTarget(null);
      await load();
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "Could not update appointment.");
    } finally {
      await minimumLoading;
      setBusyId("");
    }
  }

  if (isPending || !session || (session.user as typeof session.user & { role?: string }).role !== "admin") return <main className="auth-page"><p>Checking admin access…</p></main>;
  return (
    <main className="admin-services-page">
      <header className="admin-services-heading"><div><Link className="brand" href="/dashboard/admin">← Admin dashboard</Link><p className="eyebrow">BOOKING QUEUE</p><h1>Appointment requests</h1><p>Review customer requests and update their status.</p></div><button className="secondary-button admin-refresh" onClick={() => void load()} disabled={loading}>Refresh</button></header>
      {!hasLoaded && loading ? <DashboardSkeleton rows={5} /> : <>
      <section className="appointment-stats" aria-label="Appointment request totals"><article><span>All requests</span><strong>{totals.total}</strong></article><article><span>Pending</span><strong>{totals.pending}</strong></article><article><span>Confirmed</span><strong>{totals.confirmed}</strong></article><article><span>Cancelled</span><strong>{totals.cancelled}</strong></article></section>
      <section className="admin-appointment-controls" aria-label="Search and sort appointments">
        <div className="admin-appointment-search">
          <Search size={19} aria-hidden="true" />
          <input type="search" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search by customer name or email" aria-label="Search by customer name or email" />
          {searchInput && <button type="button" onClick={() => { setSearchInput(""); setQuery((current) => ({ ...current, search: "", page: 1 })); }} aria-label="Clear search" title="Clear search"><X size={17} aria-hidden="true" /></button>}
        </div>
        <label className="admin-appointment-sort">Sort by
          <select aria-label="Sort appointments" value={query.sort} onChange={(event) => setQuery((current) => ({ ...current, sort: event.target.value, page: 1 }))}>
            <option value="latest">Latest requested</option>
            <option value="oldest">Oldest requested</option>
            <option value="appointment">Appointment date</option>
            <option value="price-desc">Price: High to low</option>
            <option value="price-asc">Price: Low to high</option>
          </select>
        </label>
      </section>
      {loading ? <DashboardSkeleton rows={5} /> : error ? <div className="service-message service-error"><p>{error}</p><button onClick={() => void load()}>Try again</button></div> : appointments.length === 0 ? <div className="service-message admin-appointments-empty"><h2>No appointments found</h2>{query.search && <button className="button-primary" onClick={() => { setSearchInput(""); setQuery((current) => ({ ...current, search: "", page: 1 })); }}>Clear search</button>}</div> : (
        <div className="admin-appointments-table">
          <div className="admin-appointments-table-header" aria-hidden="true"><span>Service &amp; customer</span><span>Date &amp; time</span><span>Price</span><span>Appointment / payment</span><span>Requested</span><span>Actions</span></div>
          <div className="appointment-list">
          {appointments.map((item) => (
            <article className="appointment-item admin-appointment-item" key={item._id}>
              {item.serviceId?.image ? <img src={getServiceImage(item.serviceId.serviceName, item.serviceId.image)} alt="" /> : <div className="admin-appointment-image-fallback" aria-hidden="true">S</div>}
              <div className="appointment-main admin-appointment-service"><p className="service-category">{item.serviceId?.category || "Salon service"}</p><h3>{item.serviceId?.serviceName || "Service unavailable"}</h3><p className="admin-appointment-customer">{item.customer?.name || "Unknown customer"}</p><p className="admin-appointment-email">{item.customer?.email || "No email available"}</p>{item.message && <p className="appointment-message">“{item.message}”</p>}</div>
              <div className="admin-appointment-cell admin-appointment-visit"><strong>{new Date(item.appointmentDate).toLocaleDateString()}</strong><small>{item.timeSlot}</small></div>
              <div className="admin-appointment-cell admin-appointment-price"><strong>৳{item.servicePrice.toLocaleString()}</strong></div>
              <div className="appointment-statuses admin-appointment-statuses"><span className={`status-pill ${item.status}`}>{item.status}</span><span className={`status-pill ${item.paymentStatus}`}>{item.paymentStatus}</span></div>
              <div className="admin-appointment-cell admin-appointment-requested"><strong>{new Date(item.createdAt).toLocaleDateString()}</strong><small>{new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</small></div>
              <div className="admin-item-actions">
                <button className="secondary-button" onClick={() => setDetailsTarget(item)}>Details</button>
                {item.status === "pending" && <button className="text-button" disabled={busyId === item._id} onClick={() => void updateStatus(item, "confirmed")}>{busyId === item._id ? <ButtonLoader label="Updating..." /> : "Confirm"}</button>}
                {(item.status === "pending" || item.status === "confirmed") && <button className="text-button danger-text" disabled={busyId === item._id} onClick={() => setCancelTarget(item)}>Cancel</button>}
              </div>
            </article>
          ))}
          </div>
        </div>
      )}
      {!loading && !error && appointments.length > 0 && pages > 1 && <nav className="admin-pagination" aria-label="Appointment pages"><button className="secondary-button" disabled={query.page <= 1} onClick={() => setQuery((current) => ({ ...current, page: current.page - 1 }))}>Previous</button><span>Page {query.page} of {pages} · {totals.total} requests</span><button className="secondary-button" disabled={query.page >= pages} onClick={() => setQuery((current) => ({ ...current, page: current.page + 1 }))}>Next</button></nav>}
      </>}
      {detailsTarget && <div className="admin-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setDetailsTarget(null); }}><section className="admin-confirm-dialog customer-appointment-details" role="dialog" aria-modal="true" aria-labelledby="admin-appointment-details-title"><p className="eyebrow">APPOINTMENT DETAILS</p><h2 id="admin-appointment-details-title">{detailsTarget.serviceId?.serviceName || "Salon service"}</h2><dl><div><dt>Customer</dt><dd>{detailsTarget.customer?.name || "Unknown customer"}</dd></div><div><dt>Email</dt><dd>{detailsTarget.customer?.email || "Unavailable"}</dd></div><div><dt>Service category</dt><dd>{detailsTarget.serviceId?.category || "Salon service"}</dd></div><div><dt>Date & time</dt><dd>{new Date(detailsTarget.appointmentDate).toLocaleDateString()} · {detailsTarget.timeSlot}</dd></div><div><dt>Service price</dt><dd>৳{detailsTarget.servicePrice.toLocaleString()}</dd></div><div><dt>Appointment status</dt><dd><span className={`status-pill ${detailsTarget.status}`}>{detailsTarget.status}</span></dd></div><div><dt>Payment status</dt><dd><span className={`status-pill ${detailsTarget.paymentStatus}`}>{detailsTarget.paymentStatus}</span></dd></div><div><dt>Booking request date</dt><dd>{new Date(detailsTarget.createdAt).toLocaleString()}</dd></div></dl>{detailsTarget.message && <p className="appointment-message">Customer message: “{detailsTarget.message}”</p>}<div><button className="secondary-button" onClick={() => setDetailsTarget(null)}>Close</button></div></section></div>}
      {cancelTarget && <div className="admin-dialog-backdrop" role="presentation"><section className="admin-confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="appointment-cancel-title"><p className="eyebrow">APPOINTMENT CHANGE</p><h2 id="appointment-cancel-title">Cancel this appointment?</h2><p>{cancelTarget.customer?.name || "This customer"}’s {cancelTarget.serviceId?.serviceName || "appointment"} request will be cancelled. Any open Stripe Checkout must expire before the API accepts this change.</p><div><button className="secondary-button" onClick={() => setCancelTarget(null)} disabled={busyId === cancelTarget._id}>Keep appointment</button><button className="primary-button" onClick={() => void updateStatus(cancelTarget, "cancelled")} disabled={busyId === cancelTarget._id}>{busyId === cancelTarget._id ? <ButtonLoader label="Cancelling..." /> : "Confirm cancellation"}</button></div></section></div>}
    </main>
  );
}
