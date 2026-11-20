"use client";

import Link from "next/link";
import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { SalonBookLogo } from "@/components/salonbook-logo";

export default function BlockedAccountPage() {
  const { data: session } = authClient.useSession();

  useEffect(() => {
    if (session) void authClient.signOut();
  }, [session]);

  return <main className="auth-page"><section className="auth-card" role="alert">
    <SalonBookLogo className="brand" />
    <p className="eyebrow">ACCOUNT ACCESS</p>
    <h1>Your account is blocked</h1>
    <p className="auth-hint">Protected SalonBook features are unavailable for this account. Please contact the salon administrator if you think this is a mistake.</p>
    <Link className="button-primary" href="/">Return to SalonBook</Link>
  </section></main>;
}
