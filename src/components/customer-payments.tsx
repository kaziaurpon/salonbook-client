"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ReceiptText } from "lucide-react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { authenticatedApiFetch } from "@/lib/api";
import { DashboardSkeleton, minimumLoader } from "@/components/loading-system";
import { PaymentReceiptModal, type PaymentReceipt } from "@/components/payment-receipt-modal";

export function CustomerPayments() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [payments, setPayments] = useState<PaymentReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null);

  useEffect(() => {
    if (isPending) return;
    if (!session) { router.replace("/login"); return; }
    const user = session.user as typeof session.user & { role?: string; isBlocked?: boolean };
    if (user.isBlocked) void authClient.signOut().then(() => router.replace("/login"));
    else if (user.role !== "customer") router.replace("/dashboard/admin");
    else {
      let active = true;
      queueMicrotask(() => {
        if (!active) return;
        setLoading(true);
        setError("");
        const minimumLoading = minimumLoader(400);
        void (async () => {
          try {
            const response = await authenticatedApiFetch("/api/appointments/payments");
            const result = await response.json() as { payments?: PaymentReceipt[]; message?: string };
            if (!response.ok || !result.payments) throw new Error(result.message || "Could not load your payment history.");
            if (active) setPayments(result.payments);
          } catch (reason) {
            if (active) setError(reason instanceof Error ? reason.message : "Could not load your payment history.");
          } finally {
            await minimumLoading;
            if (active) setLoading(false);
          }
        })();
      });
      return () => { active = false; };
    }
  }, [isPending, retry, router, session]);

  if (isPending || !session || (session.user as typeof session.user & { role?: string }).role !== "customer") {
    return <main className="auth-page"><p>Checking customer access…</p></main>;
  }

  const totalPaid = payments.reduce((total, payment) => total + payment.amount, 0);
  return <main className="customer-appointments customer-payments">
    <header className="appointments-heading">
      <div><p className="eyebrow">YOUR SALONBOOK · RECEIPTS</p><h1>Payment history</h1><p>Review your verified payments and keep each receipt handy.</p></div>
      <div className="customer-heading-actions"><button className="secondary-button appointments-refresh" type="button" onClick={() => setRetry((value) => value + 1)} disabled={loading}>Refresh</button></div>
    </header>

    {loading ? <DashboardSkeleton rows={4} /> : error ? <div className="service-message service-error" role="alert"><p>{error}</p><button type="button" onClick={() => setRetry((value) => value + 1)}>Try again</button></div> : <>
      <section className="payment-history-summary" aria-label="Payment totals">
        <article><span>Total paid</span><strong>৳{totalPaid.toLocaleString("en-BD")}</strong><small>Verified Stripe payments · BDT</small></article>
        <article><span>Number of payments</span><strong>{payments.length.toLocaleString()}</strong><small>{payments.length === 1 ? "Payment receipt" : "Payment receipts"}</small></article>
      </section>

      {payments.length === 0 ? <div className="payment-history-empty"><span aria-hidden="true"><ReceiptText size={24} /></span><h2>No payments yet</h2><p>Completed payments will appear here with their receipts.</p><Link className="button-primary" href="/services">Browse services <span aria-hidden="true">↗</span></Link></div> : <section className="payment-history-panel" aria-labelledby="payment-history-list-title">
        <header><div><p className="eyebrow">STRIPE · VERIFIED</p><h2 id="payment-history-list-title">Your payments</h2></div><span>{payments.length} {payments.length === 1 ? "receipt" : "receipts"}</span></header>
        <div className="payment-history-table-head" aria-hidden="true"><span>Date</span><span>Service</span><span>Amount</span><span>Status</span><span>Receipt</span></div>
        <div className="payment-history-list">
          {payments.map((payment) => <article className="payment-history-row" key={payment.id || payment.stripeSessionId}>
            <div className="payment-history-date"><strong>{new Date(payment.paymentDate).toLocaleDateString("en-BD", { year: "numeric", month: "short", day: "numeric" })}</strong><small>{new Date(payment.paymentDate).toLocaleTimeString("en-BD", { hour: "2-digit", minute: "2-digit" })}</small></div>
            <div className="payment-history-service"><strong>{payment.serviceName}</strong><small>{payment.category}</small></div>
            <strong className="payment-history-amount">৳{payment.amount.toLocaleString("en-BD")}</strong>
            <span className="status-pill paid">Paid</span>
            <button type="button" className="payment-history-receipt-button" onClick={() => setReceipt(payment)} aria-label={`View receipt for ${payment.serviceName}`}><ReceiptText size={16} aria-hidden="true" />Receipt</button>
          </article>)}
        </div>
      </section>}
    </>}
      {receipt && <PaymentReceiptModal key={receipt.id || receipt.stripeSessionId} receipt={receipt} onClose={() => setReceipt(null)} />}
  </main>;
}
