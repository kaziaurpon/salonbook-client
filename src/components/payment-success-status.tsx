"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PublicShell } from "@/components/public-shell";
import { authClient } from "@/lib/auth-client";
import { authenticatedApiFetch } from "@/lib/api";

type Stage = "checking" | "paid" | "waiting" | "error";
type PaymentDetails = {
  serviceName: string;
  category: string;
  appointmentDate: string;
  timeSlot: string;
  amount: number;
  currency: string;
  stripeSessionId: string | null;
};

export function PaymentSuccessStatus() {
  const params = useSearchParams();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const appointmentId = params.get("appointment_id") || "";
  const [stage, setStage] = useState<Stage>("checking");
  const [message, setMessage] = useState("Stripe is confirming your payment. This page will update when the verified webhook is recorded.");
  const [details, setDetails] = useState<PaymentDetails | null>(null);

  useEffect(() => {
    if (isPending) return;
    if (!session) { router.replace("/login"); return; }
    const user = session.user as typeof session.user & { role?: string; isBlocked?: boolean };
    if (user.isBlocked) { void authClient.signOut().then(() => router.replace("/login")); return; }
    if (user.role !== "customer") { router.replace("/dashboard/admin"); return; }
    if (!appointmentId) return;

    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;
    const checkStatus = async () => {
      try {
        const response = await authenticatedApiFetch(`/api/appointments/${encodeURIComponent(appointmentId)}/payment-status`);
        const result = await response.json() as { status?: string; paymentStatus?: string; message?: string; appointment?: PaymentDetails };
        if (!response.ok) throw new Error(result.message || "Could not verify this appointment.");
        if (stopped) return;
        if (result.appointment) setDetails(result.appointment);
        if (result.paymentStatus === "paid") {
          setStage("paid"); setMessage("Payment confirmed. Your appointment is marked paid."); toast.success("Payment confirmed."); return;
        }
        if (result.status === "cancelled") {
          setStage("error"); setMessage("This appointment was cancelled, so its payment was not recorded."); return;
        }
        attempts += 1;
        if (attempts >= 10) { setStage("waiting"); return; }
        timer = setTimeout(checkStatus, 2000);
      } catch (reason) {
        if (!stopped) { setStage("error"); setMessage(reason instanceof Error ? reason.message : "Could not verify this appointment."); }
      }
    };
    void checkStatus();
    return () => { stopped = true; if (timer) clearTimeout(timer); };
  }, [appointmentId, isPending, router, session]);

  const displayStage: Stage = !isPending && session && !appointmentId ? "error" : stage;
  const displayMessage = displayStage === "error" && !appointmentId ? "The appointment reference is missing. Check your appointment history for the latest status." : message;
  const shortSessionId = details?.stripeSessionId
    ? `${details.stripeSessionId.slice(0, 12)}…${details.stripeSessionId.slice(-8)}`
    : "Verifying with Stripe";
  const formattedDate = details ? new Date(details.appointmentDate).toLocaleDateString("en-BD", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : "";

  return <PublicShell><main className="payment-return-page">
    <section className={`payment-return-card ${displayStage === "paid" ? "payment-return-paid" : ""}`} aria-live="polite">
      <div className="payment-return-hero">
        <span className="payment-return-mark" aria-hidden="true">{displayStage === "paid" ? "✓" : displayStage === "error" ? "!" : "…"}</span>
        <p className="eyebrow">SALONBOOK · PAYMENT RECEIPT</p>
        <h1>{displayStage === "paid" ? "Payment verified" : displayStage === "waiting" ? "Payment is confirming" : displayStage === "error" ? "Payment status" : "Checking your payment"}</h1>
        <p>{displayMessage}</p>
        {displayStage === "waiting" && <p className="payment-waiting-note">Stripe has not confirmed this payment yet. Your appointment will remain unpaid until verification completes.</p>}
      </div>

      {displayStage === "paid" && details && <div className="payment-receipt-details">
        <div className="payment-receipt-statuses"><span>✓ Appointment confirmed</span><span>✓ Paid</span><span>✓ Stripe verified</span></div>
        <section className="payment-service-summary">
          <p className="eyebrow">YOUR SALON VISIT</p>
          <h2>{details.serviceName}</h2>
          <span>{details.category}</span>
          <div className="payment-visit-time"><div><small>DATE</small><strong>{formattedDate}</strong></div><div><small>TIME</small><strong>{details.timeSlot}</strong></div></div>
        </section>
        <div className="payment-receipt-row"><span>Amount paid <small>{details.currency.toUpperCase()}</small></span><strong>৳{details.amount.toLocaleString("en-BD")}</strong></div>
        <div className="payment-receipt-row payment-session-row"><span>Stripe session</span><code title={details.stripeSessionId || undefined}>{shortSessionId}</code></div>
      </div>}

      <div className="payment-return-actions">
        <Link className="button-primary" href="/dashboard/customer/appointments">View my appointments <span aria-hidden="true">→</span></Link>
        {displayStage === "waiting" && <button className="secondary-button" onClick={() => window.location.reload()}>Check again</button>}
      </div>
      {displayStage === "paid" && <p className="payment-security-note">SalonBook records a payment only after Stripe verifies it. Keep this confirmation for your reference.</p>}
    </section>
  </main></PublicShell>;
}
