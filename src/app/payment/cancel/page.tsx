import Link from "next/link";
import { PublicShell } from "@/components/public-shell";

export default function PaymentCancelPage() {
  return <PublicShell><main className="payment-return-page"><section className="payment-return-card"><p className="eyebrow">SALONBOOK · CHECKOUT</p><span className="payment-return-mark" aria-hidden="true">↩</span><h1>Checkout paused</h1><p>You left Stripe Checkout before completing payment. Your appointment remains unpaid; you can return to your confirmed appointment and try again.</p><div><Link className="button-primary" href="/dashboard/customer">Back to appointments</Link><Link className="secondary-button" href="/services">Browse services</Link></div></section></main></PublicShell>;
}
