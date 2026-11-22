"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getServiceImage } from "@/lib/service-images";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { authenticatedApiFetch } from "@/lib/api";

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
};

export function CustomerAppointments({ view = "overview" }: { view?: "overview" | "list" }) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [payingId, setPayingId] = useState("");
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const [detailsTarget, setDetailsTarget] = useState<Appointment | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | Appointment["status"]>("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await authenticatedApiFetch("/api/appointments/mine");
      const result = await response.json() as { appointments?: Appointment[]; message?: string };
      if (!response.ok || !result.appointments) throw new Error(result.message || "Could not load your appointments.");
      setAppointments(result.appointments);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not load your appointments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isPending) return;
    if (!session) { router.replace("/login"); return; }
    const user = session.user as typeof session.user & { role?: string; isBlocked?: boolean };
    if (user.isBlocked) void authClient.signOut().then(() => router.replace("/login"));
    else if (user.role !== "customer") router.replace("/dashboard/admin");
    else {
      let active = true;
      queueMicrotask(() => { if (active) void load(); });
      return () => { active = false; };
    }
  }, [isPending, load, router, session]);

  async function cancel(id: string) {
    setBusyId(id);
    try {
      const response = await authenticatedApiFetch(`/api/appointments/${id}/cancel`, { method: "PATCH" });
      const result = await response.json() as { message?: string };
      if (!response.ok) throw new Error(result.message || "Could not cancel the appointment.");
      toast.success(result.message || "Appointment cancelled.");
      setCancelTarget(null);
      await load();
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "Could not cancel the appointment.");
    } finally {
      setBusyId("");
    }
  }

  async function payNow(id: string) {
    setPayingId(id);
    try {
      const response = await authenticatedApiFetch(`/api/appointments/${id}/checkout`, { method: "POST" });
      const result = await response.json() as { url?: string; message?: string; paymentStatus?: "paid" | "unpaid" };
      if (response.ok && result.paymentStatus === "paid") {
        toast.success(result.message || "Payment confirmed.");
        await load();
        return;
      }
      if (!response.ok || !result.url) throw new Error(result.message || "Could not open Stripe Checkout.");
      const checkoutUrl = new URL(result.url);
      if (checkoutUrl.protocol !== "https:" || checkoutUrl.hostname !== "checkout.stripe.com") throw new Error("The payment provider returned an invalid checkout link.");
      window.location.assign(checkoutUrl.toString());
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "Could not open Stripe Checkout.");
      setPayingId("");
    }
  }

  if (isPending || !session || (session.user as typeof session.user & { role?: string }).role !== "customer") return <main className="auth-page"><p>Checking customer access…</p></main>;

  const count = (status: Appointment["status"]) => appointments.filter((item) => item.status === status).length;
  const filteredAppointments = statusFilter === "all" ? appointments : appointments.filter((item) => item.status === statusFilter);
  const visibleAppointments = view === "overview" ? appointments.slice(0, 3) : filteredAppointments;
  return (
    <section className={`customer-appointments customer-${view}`}>
      <div className="appointments-heading"><div><p className="eyebrow">{view === "overview" ? "YOUR SALONBOOK" : "YOUR BOOKINGS"}</p><h1>{view === "overview" ? `Welcome back, ${session.user.name?.split(" ")[0] || "there"}` : "My appointments"}</h1><p>{view === "overview" ? "Your appointments and details, all in one calm place." : "Track every request, cancel pending appointments, or pay after confirmation."}</p></div><div className="customer-heading-actions">{view === "list" && <button className="secondary-button appointments-refresh" onClick={() => void load()} disabled={loading}>Refresh</button>}<Link className="button-primary" href="/services">Browse services <span aria-hidden="true">↗</span></Link></div></div>
      {view === "overview" && <div className="customer-welcome-strip"><div><span>YOUR NEXT MOMENT OF CARE</span><strong>{appointments.find((item) => item.status === "confirmed" && new Date(item.appointmentDate) >= new Date())?.serviceId?.serviceName || "A little time, just for you."}</strong><small>Browse salon services and choose a time that works for you.</small></div><Link href="/services">Explore services <span aria-hidden="true">↗</span></Link></div>}
      <div className="appointment-stats customer-stats">
        <article><span>Total requests</span><strong>{loading ? "—" : appointments.length}</strong><small>All your submitted requests</small></article>
        <article><span>Pending</span><strong>{loading ? "—" : count("pending")}</strong><small>Awaiting salon confirmation</small></article>
        <article><span>Confirmed</span><strong>{loading ? "—" : count("confirmed")}</strong><small>Ready for your visit</small></article>
        <article><span>Cancelled</span><strong>{loading ? "—" : count("cancelled")}</strong><small>Past cancelled requests</small></article>
      </div>
      {view === "list" && <div className="customer-appointment-filters" role="tablist" aria-label="Filter appointments">{(["all", "pending", "confirmed", "cancelled"] as const).map((status) => <button key={status} role="tab" aria-selected={statusFilter === status} className={statusFilter === status ? "active" : ""} onClick={() => setStatusFilter(status)}>{status === "all" ? "All" : status[0].toUpperCase() + status.slice(1)}<span>{status === "all" ? appointments.length : count(status)}</span></button>)}</div>}
      <div className={`customer-appointments-panel ${view === "list" ? "customer-appointments-table" : ""}`}><header><div><p className="eyebrow">{view === "overview" ? "RECENT ACTIVITY" : "BOOKING HISTORY"}</p><h2>{view === "overview" ? "Recent appointments" : "Every appointment"}</h2><p>{view === "overview" ? "Your latest requests and their current status." : "Service, timing, price and payment details for each request."}</p></div>{view === "overview" && <Link href="/dashboard/customer/appointments">View all <span aria-hidden="true">→</span></Link>}</header>
      {view === "list" && appointments.length > 0 && <div className="customer-table-head"><span>Service</span><span>Date & time</span><span>Price</span><span>Appointment</span><span>Payment</span><span>Requested</span><span>Actions</span></div>}
      {loading ? <p className="service-message">Loading your appointments…</p> : error ? <div className="service-message service-error"><p>{error}</p><button onClick={() => void load()}>Try again</button></div> : appointments.length === 0 ? <div className="customer-empty"><span>✳</span><h3>Your next visit starts here</h3><p>You have no appointment requests yet. Find a service that feels right for you.</p><Link className="button-primary" href="/services">Explore services ↗</Link></div> : (
        <div className="appointment-list customer-appointment-list">
          {visibleAppointments.length === 0 ? <div className="customer-filter-empty">No {statusFilter} appointments yet.</div> : visibleAppointments.map((appointment) => view === "list" ? (
            <article className="customer-table-row" key={appointment._id}>
              <div className="customer-table-service">{appointment.serviceId?.image ? <img src={getServiceImage(appointment.serviceId.serviceName, appointment.serviceId.image)} alt="" /> : <span className="customer-service-placeholder">✳</span>}<div><p className="service-category">{appointment.serviceId?.category || "Salon service"}</p><h3>{appointment.serviceId?.serviceName || "Service unavailable"}</h3></div></div>
              <div className="customer-table-date"><strong>{new Date(appointment.appointmentDate).toLocaleDateString()}</strong><span>{appointment.timeSlot}</span></div>
              <strong className="customer-table-price">৳{appointment.servicePrice.toLocaleString()}</strong>
              <span className={`status-pill ${appointment.status}`}>{appointment.status}</span>
              <span className={`status-pill ${appointment.paymentStatus}`}>{appointment.paymentStatus}</span>
              <span className="customer-table-requested">{new Date(appointment.createdAt).toLocaleString()}</span>
              <div className="customer-table-actions"><button className="secondary-button" onClick={() => setDetailsTarget(appointment)}>Details</button>{appointment.status === "confirmed" && appointment.paymentStatus === "unpaid" && <button className="button-primary" disabled={payingId === appointment._id} onClick={() => void payNow(appointment._id)}>{payingId === appointment._id ? "Opening…" : "Pay now"}</button>}{appointment.status === "pending" && <button className="text-button danger-text" disabled={busyId === appointment._id} onClick={() => setCancelTarget(appointment)}>Cancel</button>}</div>
            </article>
          ) : (
            <article className="appointment-item" key={appointment._id}>
              {appointment.serviceId?.image ? <img src={getServiceImage(appointment.serviceId.serviceName, appointment.serviceId.image)} alt={appointment.serviceId?.serviceName || "Salon service"} /> : <span className="customer-service-placeholder">✳</span>}
              <div className="appointment-main"><p className="service-category">{appointment.serviceId?.category || "Salon service"}</p><h3>{appointment.serviceId?.serviceName || "Service unavailable"}</h3><p>{new Date(appointment.appointmentDate).toLocaleDateString()} · {appointment.timeSlot}</p><p className="customer-requested-date">Requested {new Date(appointment.createdAt).toLocaleString()}</p>{appointment.message && <p className="appointment-message">“{appointment.message}”</p>}</div>
              <div className="appointment-statuses"><span className={`status-pill ${appointment.status}`}>{appointment.status}</span><span className={`status-pill ${appointment.paymentStatus}`}>{appointment.paymentStatus}</span><strong>৳{appointment.servicePrice.toLocaleString()}</strong></div>
              {appointment.paymentStatus === "unpaid" && <p className="appointment-payment-note">{appointment.status === "confirmed" ? "Secure test-mode checkout is available for this confirmed appointment." : "Payment is unavailable while an appointment is pending or cancelled."}</p>}
              <div className="customer-appointment-actions"><button className="secondary-button" onClick={() => setDetailsTarget(appointment)}>Details</button>
              {appointment.status === "confirmed" && appointment.paymentStatus === "unpaid" && <button className="button-primary appointment-pay-button" disabled={payingId === appointment._id} onClick={() => void payNow(appointment._id)}>{payingId === appointment._id ? "Opening Checkout…" : "Pay now"}</button>}
              {appointment.status === "pending" && <button className="text-button danger-text" disabled={busyId === appointment._id} onClick={() => setCancelTarget(appointment)}>Cancel request</button>}
              </div>
            </article>
          ))}
        </div>
      )}</div>
      {detailsTarget && <div className="admin-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setDetailsTarget(null); }}><section className="admin-confirm-dialog customer-appointment-details" role="dialog" aria-modal="true" aria-labelledby="appointment-details-title"><p className="eyebrow">APPOINTMENT DETAILS</p><h2 id="appointment-details-title">{detailsTarget.serviceId?.serviceName || "Salon service"}</h2><dl><div><dt>Category</dt><dd>{detailsTarget.serviceId?.category || "Salon service"}</dd></div><div><dt>Date & time</dt><dd>{new Date(detailsTarget.appointmentDate).toLocaleDateString()} · {detailsTarget.timeSlot}</dd></div><div><dt>Price</dt><dd>৳{detailsTarget.servicePrice.toLocaleString()}</dd></div><div><dt>Appointment status</dt><dd><span className={`status-pill ${detailsTarget.status}`}>{detailsTarget.status}</span></dd></div><div><dt>Payment status</dt><dd><span className={`status-pill ${detailsTarget.paymentStatus}`}>{detailsTarget.paymentStatus}</span></dd></div><div><dt>Requested on</dt><dd>{new Date(detailsTarget.createdAt).toLocaleString()}</dd></div></dl>{detailsTarget.message && <p className="appointment-message">Your note: “{detailsTarget.message}”</p>}<div><button className="secondary-button" onClick={() => setDetailsTarget(null)}>Close</button>{detailsTarget.status === "confirmed" && detailsTarget.paymentStatus === "unpaid" && <button className="button-primary" disabled={payingId === detailsTarget._id} onClick={() => void payNow(detailsTarget._id)}>Pay now</button>}</div></section></div>}
      {cancelTarget && <div className="admin-dialog-backdrop" role="presentation"><section className="admin-confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="customer-cancel-title"><p className="eyebrow">YOUR APPOINTMENT</p><h2 id="customer-cancel-title">Cancel this request?</h2><p>Your pending {cancelTarget.serviceId?.serviceName || "salon service"} request for {new Date(cancelTarget.appointmentDate).toLocaleDateString()} at {cancelTarget.timeSlot} will be cancelled.</p><div><button className="secondary-button" onClick={() => setCancelTarget(null)} disabled={busyId === cancelTarget._id}>Keep request</button><button className="primary-button" onClick={() => void cancel(cancelTarget._id)} disabled={busyId === cancelTarget._id}>{busyId === cancelTarget._id ? "Cancelling…" : "Confirm cancellation"}</button></div></section></div>}
    </section>
  );
}
