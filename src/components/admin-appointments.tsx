"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authenticatedApiFetch } from "@/lib/api";
import { authClient } from "@/lib/auth-client";

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

export function AdminAppointments() {
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
      const response = await authenticatedApiFetch("/api/admin/appointments");
      const result = await response.json() as { appointments?: Appointment[]; message?: string };
      if (!response.ok || !result.appointments) throw new Error(result.message || "Could not load appointment requests.");
      setAppointments(result.appointments);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not load appointment requests.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isPending) return;
    if (!session) { router.replace("/login"); return; }
    const user = session.user as typeof session.user & { role?: string; isBlocked?: boolean };
    if (user.isBlocked) void authClient.signOut().then(() => router.replace("/login"));
    else if (user.role !== "admin") router.replace("/dashboard/customer");
    else void load();
  }, [isPending, load, router, session]);

  async function updateStatus(item: Appointment, status: "confirmed" | "cancelled") {
    setBusyId(item._id);
    try {
      const response = await authenticatedApiFetch(`/api/admin/appointments/${item._id}/status`, {
        method: "PATCH", body: JSON.stringify({ status }),
      });
      const result = await response.json() as { message?: string };
      if (!response.ok) throw new Error(result.message || "Could not update appointment status.");
      toast.success(result.message || `Appointment ${status}.`);
      await load();
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "Could not update appointment.");
    } finally {
      setBusyId("");
    }
  }

  if (isPending || !session || (session.user as typeof session.user & { role?: string }).role !== "admin") return <main className="auth-page"><p>Checking admin access…</p></main>;
  return (
    <main className="admin-services-page">
      <header className="admin-services-heading"><div><Link className="brand" href="/dashboard/admin">← Admin dashboard</Link><p className="eyebrow">BOOKING QUEUE</p><h1>Appointment requests</h1><p>Review customer requests and update their status.</p></div><button className="secondary-button admin-refresh" onClick={() => void load()} disabled={loading}>Refresh</button></header>
      {loading ? <p className="service-message">Loading appointment requests…</p> : error ? <div className="service-message service-error"><p>{error}</p><button onClick={() => void load()}>Try again</button></div> : appointments.length === 0 ? <p className="service-message">There are no appointment requests yet.</p> : (
        <div className="appointment-list">
          {appointments.map((item) => (
            <article className="appointment-item admin-appointment-item" key={item._id}>
              {item.serviceId?.image && <img src={item.serviceId.image} alt="" />}
              <div className="appointment-main"><p className="service-category">{item.serviceId?.category || "Salon service"}</p><h3>{item.serviceId?.serviceName || "Service unavailable"}</h3><p>{new Date(item.appointmentDate).toLocaleDateString()} · {item.timeSlot}</p><p>Customer: {item.customer?.name || "Unknown"} · {item.customer?.email || "No email"}</p><p>Requested {new Date(item.createdAt).toLocaleDateString()}</p>{item.message && <p className="appointment-message">“{item.message}”</p>}</div>
              <div className="appointment-statuses"><span className={`status-pill ${item.status}`}>{item.status}</span><span className={`status-pill ${item.paymentStatus}`}>{item.paymentStatus}</span><strong>৳{item.servicePrice.toLocaleString()}</strong></div>
              <div className="admin-item-actions">
                {item.status === "pending" && <button className="text-button" disabled={busyId === item._id} onClick={() => void updateStatus(item, "confirmed")}>Confirm</button>}
                {(item.status === "pending" || item.status === "confirmed") && <button className="text-button danger-text" disabled={busyId === item._id} onClick={() => void updateStatus(item, "cancelled")}>Cancel</button>}
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
