"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { authenticatedApiFetch } from "@/lib/api";
import { loginPathFor } from "@/lib/auth-redirect";
import { PublicShell } from "@/components/public-shell";

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
      router.replace(loginPathFor(`${window.location.pathname}${window.location.search}`));
      return;
    }
    const user = session.user as typeof session.user & { isBlocked?: boolean };
    if (user.isBlocked) {
      void authClient.signOut().then(() => router.replace("/account/blocked"));
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
      return;
    }
    const controller = new AbortController();
    queueMicrotask(() => {
      if (controller.signal.aborted) return;
      setSlotsLoading(true);
      setBookingError("");
      void authenticatedApiFetch(`/api/appointments/available-slots?serviceId=${encodeURIComponent(params.id)}&date=${encodeURIComponent(date)}`, { signal: controller.signal })
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
    });
    return () => controller.abort();
  }, [date, params.id, session]);

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

  if (isPending || (!service && !error)) return <PublicShell><main className="service-state-page"><div className="public-state"><span className="state-symbol">✳</span><h1>One moment.</h1><p>Checking your sign-in and loading service details…</p></div></main></PublicShell>;
  if (error) return <PublicShell><main className="service-state-page"><div className="public-state error-state" role="alert"><span className="state-symbol">!</span><p className="eyebrow">SERVICE NOT FOUND</p><h1>This service isn’t available.</h1><p>{error}</p><Link className="button-primary" href="/services">Back to services <span aria-hidden="true">→</span></Link></div></main></PublicShell>;
  if (!service || !session) return null;
  const user = session.user as typeof session.user & { role?: string; isBlocked?: boolean; name?: string; email?: string; image?: string | null };

  return (
    <PublicShell><main className="service-detail-page">
      <Link className="service-back-link" href="/services"><span aria-hidden="true">←</span> Back to all services</Link>
      <div className="service-detail-layout">
        <article className="service-detail-main">
          <div className="service-detail-photo"><img src={service.image} alt={`${service.serviceName} at SalonBook`} /><span>{service.category}</span></div>
          <div className="service-detail-content">
            <div className="service-detail-badges"><span className="service-active-badge"><i aria-hidden="true" /> Active service</span><span>Salon experience</span></div>
            <p className="service-category">{service.category}</p>
            <h1>{service.serviceName}</h1>
            <p className="service-detail-description">{service.description}</p>
            <div className="service-detail-meta">
              <div><span>Service price</span><strong>৳{service.price.toLocaleString()}</strong></div>
              <div><span>Estimated time</span><strong>{service.duration} minutes</strong></div>
              <div><span>Booking</span><strong>Request a time</strong></div>
            </div>
            <div className="service-detail-notes">
              <article><span aria-hidden="true">✳</span><div><strong>Thoughtful care</strong><p>Your service details and estimated duration are ready before you request a visit.</p></div></article>
              <article><span aria-hidden="true">↗</span><div><strong>Flexible requests</strong><p>Choose an available time and follow the request from your customer dashboard.</p></div></article>
            </div>
          </div>
        </article>

        <aside className="service-booking-panel">
          <div className="booking-panel-heading"><p className="eyebrow">REQUEST AN APPOINTMENT</p><h2>Choose your time</h2><p>The salon will review and confirm your request.</p></div>
          {user.role === "admin" ? <p className="detail-note">Admin accounts cannot request customer appointments. Sign in with a customer account to book this service.</p> : (
            <form className="booking-form" onSubmit={submitBooking}>
              <label>Appointment date<input type="date" required min={new Date().toLocaleDateString("en-CA")} value={date} onChange={(event) => { setDate(event.target.value); setSlots([]); setTimeSlot(""); setBookingError(""); }} /></label>
              <label>Available time
                <select required value={timeSlot} onChange={(event) => setTimeSlot(event.target.value)} disabled={!date || slotsLoading}>
                  <option value="">{!date ? "Choose a date first" : slotsLoading ? "Loading available times…" : "Choose a time"}</option>
                  {slots.map((slot) => <option key={slot.timeSlot} value={slot.timeSlot} disabled={!slot.available}>{slot.timeSlot}{slot.available ? "" : " — unavailable"}</option>)}
                </select>
              </label>
              {date && <p className="available-time-hint">{slotsLoading ? "Checking the salon schedule…" : `${slots.filter((slot) => slot.available).length} of ${slots.length} times available on this date.`}</p>}
              <label>Message for the salon <span className="muted">(optional)</span><textarea rows={3} maxLength={1000} placeholder="Anything we should know before your visit?" value={message} onChange={(event) => setMessage(event.target.value)} /></label>
              {bookingError && <p className="booking-error" role="alert">{bookingError}</p>}
              <div className="booking-customer"><span className="booking-customer-avatar">{user.image ? <img src={user.image} alt="" referrerPolicy="no-referrer" /> : user.name?.slice(0, 1).toUpperCase() || "S"}</span><span><strong>{user.name || "SalonBook customer"}</strong><small>{user.email || "Signed in customer"}</small></span></div>
              <div className="booking-price-summary"><span><small>Service total</small><strong>৳{service.price.toLocaleString()}</strong></span><small>Payment is requested only after the salon confirms your appointment.</small></div>
              <button className="booking-submit" disabled={booking || slotsLoading || !timeSlot}>{booking ? "Sending request…" : <>Request appointment <span aria-hidden="true">→</span></>}</button>
              <p className="booking-privacy-note">Your request starts as pending and unpaid. You can cancel it while it is pending.</p>
            </form>
          )}
        </aside>
      </div>
    </main></PublicShell>
  );
}
