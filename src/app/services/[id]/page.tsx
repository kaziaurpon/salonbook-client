"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { authenticatedApiFetch } from "@/lib/api";

type Service = {
  serviceName: string;
  category: string;
  description: string;
  price: number;
  duration: number;
  image: string;
};
type Slot = { timeSlot: string; available: boolean };

export default function ServiceDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [service, setService] = useState<Service | null>(null);
  const [error, setError] = useState("");
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [message, setMessage] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [bookingError, setBookingError] = useState("");

  useEffect(() => {
    if (isPending) return;
    if (!session) {
      router.replace("/login");
      return;
    }
    const user = session.user as typeof session.user & { isBlocked?: boolean };
    if (user.isBlocked) {
      void authClient.signOut().then(() => router.replace("/login"));
      return;
    }
    const controller = new AbortController();
    void authenticatedApiFetch(`/api/services/${encodeURIComponent(params.id)}`, { signal: controller.signal })
      .then(async (response) => {
        const result = await response.json() as { service?: Service; message?: string };
        if (!response.ok || !result.service) throw new Error(result.message || "This service is unavailable.");
        setService(result.service);
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Could not load the service.");
      });
    return () => controller.abort();
  }, [isPending, params.id, router, session]);

  useEffect(() => {
    if (!date || !session) {
      setSlots([]);
      setTimeSlot("");
      return;
    }
    const controller = new AbortController();
    setSlotsLoading(true);
    setBookingError("");
    void authenticatedApiFetch(`/api/appointments/available-slots?date=${encodeURIComponent(date)}`, { signal: controller.signal })
      .then(async (response) => {
        const result = await response.json() as { slots?: Slot[]; message?: string };
        if (!response.ok || !result.slots) throw new Error(result.message || "Could not load available times.");
        setSlots(result.slots);
        setTimeSlot("");
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) setBookingError(reason instanceof Error ? reason.message : "Could not load available times.");
      })
      .finally(() => { if (!controller.signal.aborted) setSlotsLoading(false); });
    return () => controller.abort();
  }, [date, session]);

  async function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBooking(true);
    setBookingError("");
    try {
      const response = await authenticatedApiFetch("/api/appointments", {
        method: "POST",
        body: JSON.stringify({ serviceId: params.id, appointmentDate: date, timeSlot, message }),
      });
      const result = await response.json() as { message?: string };
      if (!response.ok) throw new Error(result.message || "Could not send your appointment request.");
      toast.success(result.message || "Appointment request sent.");
      router.push("/dashboard/customer");
    } catch (reason) {
      const note = reason instanceof Error ? reason.message : "Could not send the appointment request.";
      setBookingError(note);
      toast.error(note);
    } finally {
      setBooking(false);
    }
  }

  if (isPending || (!service && !error)) return <main className="auth-page"><p>Checking your sign-in and loading service…</p></main>;
  if (error) return <main className="service-message service-error"><h1>Service unavailable</h1><p>{error}</p><Link href="/services">Back to services</Link></main>;
  if (!service || !session) return null;
  const user = session.user as typeof session.user & { role?: string; isBlocked?: boolean };

  return (
    <main className="service-detail-page">
      <Link className="brand" href="/services">← All services</Link>
      <article className="service-detail-card">
        <img src={service.image} alt={service.serviceName} />
        <div>
          <p className="service-category">{service.category}</p>
          <h1>{service.serviceName}</h1>
          <p>{service.description}</p>
          <div className="service-meta"><strong>৳{service.price.toLocaleString()}</strong><span>{service.duration} minutes</span></div>
          {user.role === "admin" ? <p className="detail-note">Admin accounts cannot request customer appointments.</p> : (
            <form className="booking-form" onSubmit={submitBooking}>
              <h2>Request an appointment</h2>
              <label>Appointment date<input type="date" required min={new Date().toLocaleDateString("en-CA")} value={date} onChange={(event) => setDate(event.target.value)} /></label>
              <label>Available time
                <select required value={timeSlot} onChange={(event) => setTimeSlot(event.target.value)} disabled={!date || slotsLoading}>
                  <option value="">{!date ? "Choose a date first" : slotsLoading ? "Loading available times…" : "Choose a time"}</option>
                  {slots.map((slot) => <option key={slot.timeSlot} value={slot.timeSlot} disabled={!slot.available}>{slot.timeSlot}{slot.available ? "" : " — unavailable"}</option>)}
                </select>
              </label>
              <label>Message <span className="muted">(optional)</span><textarea rows={3} maxLength={1000} value={message} onChange={(event) => setMessage(event.target.value)} /></label>
              {bookingError && <p className="booking-error" role="alert">{bookingError}</p>}
              <p className="detail-note">Your request starts as pending and unpaid. You can cancel it while it is pending.</p>
              <button className="booking-submit" disabled={booking || slotsLoading || !timeSlot}>{booking ? "Sending request…" : "Request appointment"}</button>
            </form>
          )}
        </div>
      </article>
    </main>
  );
}
