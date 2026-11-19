"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PublicShell } from "@/components/public-shell";
import { authClient } from "@/lib/auth-client";
import { authenticatedApiFetch } from "@/lib/api";

type Stage = "checking" | "paid" | "waiting" | "error";

export function PaymentSuccessStatus() {
  const params = useSearchParams();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const appointmentId = params.get("appointment_id") || "";
  const [stage, setStage] = useState<Stage>("checking");
  const [message, setMessage] = useState("Stripe is confirming your payment. This page will update when the verified webhook is recorded.");

  useEffect(() => {
    if (isPending) return;
    if (!session) { router.replace("/login"); return; }
    const user = session.user as typeof session.user & { role?: string; isBlocked?: boolean };
    if (user.isBlocked) { void authClient.signOut().then(() => router.replace("/login")); return; }
    if (user.role !== "customer") { router.replace("/dashboard/admin"); return; }
    if (!appointmentId) { setStage("error"); setMessage("The appointment reference is missing. Check your appointment history for the latest status."); return; }

    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;
    const checkStatus = async () => {
      try {
        const response = await authenticatedApiFetch(`/api/appointments/${encodeURIComponent(appointmentId)}/payment-status`);
        const result = await response.json() as { status?: string; paymentStatus?: string; message?: string };
        if (!response.ok) throw new Error(result.message || "Could not verify this appointment.");
        if (stopped) return;
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

  return <PublicShell><main className="payment-return-page"><section className={`payment-return-card ${stage === "paid" ? "payment-return-paid" : ""}`} aria-live="polite"><p className="eyebrow">SALONBOOK · CHECKOUT</p><span className="payment-return-mark" aria-hidden="true">{stage === "paid" ? "✓" : stage === "error" ? "!" : "…"}</span><h1>{stage === "paid" ? "Payment confirmed" : stage === "waiting" ? "Still confirming" : stage === "error" ? "Payment status" : "Thank you"}</h1><p>{message}</p>{stage === "waiting" && <p>Stripe has not delivered a verified confirmation yet. Your appointment will remain unpaid until the webhook arrives.</p>}<div><Link className="button-primary" href="/dashboard/customer">View appointments</Link>{stage === "waiting" && <button className="secondary-button" onClick={() => window.location.reload()}>Check again</button>}</div></section></main></PublicShell>;
}
