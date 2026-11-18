"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [loading, setLoading] = useState(false);

  async function finishLogin() {
    const result = await authClient.getSession();
    if (result.error || !result.data) throw new Error("Could not read your account session.");
    const user = result.data.user as typeof result.data.user & { role?: string; isBlocked?: boolean };
    if (user.isBlocked) {
      await authClient.signOut();
      throw new Error("This account is blocked. Contact the salon administrator.");
    }
    toast.success("Signed in successfully.");
    router.replace(user.role === "admin" ? "/dashboard/admin" : "/dashboard/customer");
    router.refresh();
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);
    try {
      const result = await authClient.signIn.email({
        email: String(form.get("email")),
        password: String(form.get("password")),
      });
      if (result.error) throw new Error(result.error.message || "Check your email and password.");
      await finishLogin();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function googleLogin() {
    setLoading(true);
    try {
      const result = await authClient.signIn.social({ provider: "google", callbackURL: "/auth/complete" });
      if (result.error) throw new Error(result.error.message || "Google sign in is not configured yet.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not start Google sign in.");
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link className="brand" href="/">SalonBook</Link>
        <p className="eyebrow">WELCOME BACK</p>
        <h1>Sign in to your account</h1>
        {search.get("error") && <p className="form-error">Sign in was not completed. Please try again.</p>}
        <form onSubmit={onSubmit} className="auth-form">
          <label>Email<input name="email" type="email" autoComplete="email" required /></label>
          <label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
          <button disabled={loading}>{loading ? "Signing in…" : "Sign in"}</button>
        </form>
        <div className="auth-divider"><span>or</span></div>
        <button className="secondary-button" disabled={loading} onClick={googleLogin}>Continue with Google</button>
        <p className="auth-switch">New to SalonBook? <Link href="/register">Create an account</Link></p>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return <Suspense fallback={<main className="auth-page"><p>Loading sign in…</p></main>}><LoginForm /></Suspense>;
}
