"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

export function CustomerAppointments() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

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
    else void load();
  }, [isPending, load, router, session]);

  async function cancel(id: string) {
    setBusyId(id);
    try {
      const response = await authenticatedApiFetch(`/api/appointments/${id}/cancel`, { method: "PATCH" });
      const result = await response.json() as { message?: string };
      if (!response.ok) throw new Error(result.message || "Could not cancel the appointment.");
      toast.success(result.message || "Appointment cancelled.");
      await load();
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "Could not cancel the appointment.");
    } finally {
      setBusyId("");
    }
  }

  if (isPending || !session || (session.user as typeof session.user & { role?: string }).role !== "customer") return <main className="auth-page"><p>Checking customer access…</p></main>;

  const count = (status: Appointment["status"]) => appointments.filter((item) => item.status === status).length;
  return (
    <section className="customer-appointments">
      <div className="appointments-heading"><div><p className="eyebrow">YOUR VISITS</p><h2>My appointments</h2></div><button className="secondary-button appointments-refresh" onClick={() => void load()} disabled={loading}>Refresh</button></div>
      <div className="appointment-stats">
        <article><span>Total requests</span><strong>{appointments.length}</strong></article>
        <article><span>Pending</span><strong>{count("pending")}</strong></article>
        <article><span>Confirmed</span><strong>{count("confirmed")}</strong></article>
        <article><span>Cancelled</span><strong>{count("cancelled")}</strong></article>
      </div>
      {loading ? <p className="service-message">Loading your appointments…</p> : error ? <div className="service-message service-error"><p>{error}</p><button onClick={() => void load()}>Try again</button></div> : appointments.length === 0 ? <p className="service-message">You have no appointment requests yet.</p> : (
        <div className="appointment-list">
          {appointments.map((appointment) => (
            <article className="appointment-item" key={appointment._id}>
              {appointment.serviceId?.image && <img src={appointment.serviceId.image} alt="" />}
              <div className="appointment-main"><p className="service-category">{appointment.serviceId?.category || "Salon service"}</p><h3>{appointment.serviceId?.serviceName || "Service unavailable"}</h3><p>{new Date(appointment.appointmentDate).toLocaleDateString()} · {appointment.timeSlot}</p><p>Requested {new Date(appointment.createdAt).toLocaleDateString()}</p>{appointment.message && <p className="appointment-message">“{appointment.message}”</p>}</div>
              <div className="appointment-statuses"><span className={`status-pill ${appointment.status}`}>{appointment.status}</span><span className={`status-pill ${appointment.paymentStatus}`}>{appointment.paymentStatus}</span><strong>৳{appointment.servicePrice.toLocaleString()}</strong></div>
              {appointment.status === "pending" && <button className="text-button danger-text" disabled={busyId === appointment._id} onClick={() => void cancel(appointment._id)}>{busyId === appointment._id ? "Cancelling…" : "Cancel request"}</button>}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
