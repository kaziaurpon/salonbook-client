import { Suspense } from "react";
import { PaymentSuccessStatus } from "@/components/payment-success-status";

export default function PaymentSuccessPage() {
  return <Suspense fallback={<main className="payment-return-page"><p>Checking your payment status…</p></main>}><PaymentSuccessStatus /></Suspense>;
}
