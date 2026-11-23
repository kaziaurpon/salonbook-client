"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, X } from "lucide-react";
import { toast } from "sonner";
import { authenticatedApiFetch } from "@/lib/api";
import { minimumLoader, ScissorsLoader, Skeleton } from "@/components/loading-system";

export type PaymentReceipt = {
  id?: string;
  appointmentId: string;
  serviceName: string;
  category: string;
  appointmentDate: string;
  timeSlot: string;
  amount: number;
  currency: string;
  paymentDate: string;
  stripeSessionId: string;
  paymentStatus: "paid";
};

type PaymentReceiptModalProps = {
  appointmentId?: string;
  receipt?: PaymentReceipt;
  onClose: () => void;
};

export function PaymentReceiptModal({ appointmentId, receipt, onClose }: PaymentReceiptModalProps) {
  const [details, setDetails] = useState<PaymentReceipt | null>(receipt || null);
  const [loading, setLoading] = useState(!receipt);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [retry, setRetry] = useState(0);
  const dialogRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeys(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
      ));
      if (!focusable.length) {
        event.preventDefault();
        dialogRef.current.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || !dialogRef.current.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeys);
    return () => {
      document.removeEventListener("keydown", handleKeys);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, []);

  useEffect(() => {
    if (receipt) return;
    if (!appointmentId) {
      queueMicrotask(() => {
        setError("Receipt details are unavailable.");
        setLoading(false);
      });
      return;
    }

    let active = true;
    const minimumLoading = minimumLoader(400);
    void (async () => {
      try {
        const response = await authenticatedApiFetch(`/api/appointments/${appointmentId}/payment-status`);
        const result = await response.json() as {
          paymentStatus?: string;
          appointment?: Omit<PaymentReceipt, "id" | "appointmentId" | "paymentStatus">;
          message?: string;
        };
        if (!response.ok || result.paymentStatus !== "paid" || !result.appointment) {
          throw new Error(result.message || "A verified payment receipt could not be found.");
        }
        if (active) setDetails({ ...result.appointment, appointmentId, paymentStatus: "paid" });
      } catch (reason) {
        if (active) setError(reason instanceof Error ? reason.message : "Could not load this payment receipt.");
      } finally {
        await minimumLoading;
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [appointmentId, receipt, retry]);

  async function copySessionId() {
    if (!details?.stripeSessionId) return;
    try {
      await navigator.clipboard.writeText(details.stripeSessionId);
      setCopied(true);
      toast.success("Stripe session ID copied.");
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Could not copy the Stripe session ID.");
    }
  }

  const appointmentDate = details ? new Date(details.appointmentDate).toLocaleDateString("en-BD", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : "";
  const paymentDate = details ? new Date(details.paymentDate).toLocaleString("en-BD", { dateStyle: "medium", timeStyle: "short" }) : "";
  const shortenedSessionId = details?.stripeSessionId
    ? `${details.stripeSessionId.slice(0, 12)}…${details.stripeSessionId.slice(-8)}`
    : "Unavailable";

  return <div className="payment-receipt-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="payment-receipt-dialog" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="payment-receipt-title" aria-describedby="payment-receipt-message" tabIndex={-1}>
      <button ref={closeButtonRef} className="payment-receipt-close" type="button" onClick={onClose} aria-label="Close payment receipt" title="Close"><X size={19} aria-hidden="true" /></button>
      <header className="payment-receipt-header">
        <span className="payment-receipt-check" aria-hidden="true"><svg viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="27" /><path d="m19 33 9 9 18-20" /></svg></span>
        <p className="eyebrow">SALONBOOK · PAYMENT RECEIPT</p>
        <h2 id="payment-receipt-title">Payment verified</h2>
        <p id="payment-receipt-message">Your payment was confirmed securely by Stripe.</p>
      </header>
      {loading ? <div className="payment-receipt-loading" role="status" aria-live="polite" aria-busy="true"><ScissorsLoader label="Loading your receipt..." compact /><Skeleton height="5rem" radius=".85rem" /><Skeleton height="2.5rem" radius="999px" /><Skeleton height="2rem" radius=".55rem" /></div>
        : error ? <div className="payment-receipt-error" role="alert"><p>{error}</p><div><button className="button-primary" type="button" onClick={() => { setDetails(null); setError(""); setLoading(true); setRetry((value) => value + 1); }}>Retry</button><button className="secondary-button" type="button" onClick={onClose}>Close</button></div></div>
          : details && <div className="payment-receipt-body">
            <section className="payment-receipt-service"><p className="eyebrow">YOUR SALON VISIT</p><h3>{details.serviceName}</h3><span>{details.category}</span><div className="payment-receipt-dash" aria-hidden="true" /><div className="payment-receipt-visit"><div><small>APPOINTMENT DATE</small><strong>{appointmentDate}</strong></div><div><small>TIME</small><strong>{details.timeSlot}</strong></div></div></section>
            <div className="payment-receipt-amount"><span>Amount paid <small>{details.currency.toUpperCase()}</small></span><strong>৳{details.amount.toLocaleString("en-BD")}</strong></div>
            <div className="payment-receipt-meta"><span>Payment date</span><strong>{paymentDate}</strong></div>
            <div className="payment-receipt-meta"><span>Payment status</span><strong className="payment-receipt-paid"><Check size={15} aria-hidden="true" /> Paid</strong></div>
            <div className="payment-receipt-session"><span>Stripe session ID</span><div><code title={details.stripeSessionId}>{shortenedSessionId}</code><button type="button" onClick={() => void copySessionId()} aria-label={copied ? "Stripe session ID copied" : "Copy Stripe session ID"} title={copied ? "Copied" : "Copy session ID"}>{copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}</button></div></div>
          </div>}
    </section>
  </div>;
}
