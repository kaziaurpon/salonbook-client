"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { SalonBookLogo } from "@/components/salonbook-logo";
import { AuthVisual } from "@/components/auth-visual";
import { GoogleMark } from "@/components/google-mark";
import { authCompletePath, postAuthPath } from "@/lib/auth-redirect";
import { queueAuthFeedback } from "@/lib/auth-feedback";

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const [loading, setLoading] = useState(false);

  const callbackUrl = search.get("callbackUrl");
  const authenticationError = search.get("error");

  useEffect(() => {
    if (!authenticationError) return;
    toast.error(authenticationError === "google-link-required" || authenticationError === "account_not_linked"
      ? "This Google account needs to be linked from your SalonBook profile first."
      : "Google sign in could not be completed. Check the OAuth setup and try again.");
  }, [authenticationError]);

  // Keep already-authenticated users on the same role-aware redirect path.
  useEffect(() => {
    if (loading || sessionPending || !session) return;
    const user = session.user as typeof session.user & { role?: string; isBlocked?: boolean };
    if (user.isBlocked) {
      void authClient.signOut().then(() => router.replace("/account/blocked"));
      return;
    }
    window.location.replace(postAuthPath(user.role, callbackUrl));
  }, [callbackUrl, loading, router, session, sessionPending]);

  async function finishLogin() {
    const result = await authClient.getSession();
    if (result.error || !result.data) throw new Error("Could not read your account session.");
    const user = result.data.user as typeof result.data.user & { role?: string; isBlocked?: boolean };
    if (user.isBlocked) {
      await authClient.signOut();
      router.replace("/account/blocked");
      return;
    }
    const destination = postAuthPath(user.role, callbackUrl);
    queueAuthFeedback({ type: "success", message: "Signed in successfully." });
    // A full navigation ensures the freshly issued Better Auth cookie is
    // present when the protected App Router dashboard loads.
    window.location.assign(destination);
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
      const errorUrl = new URLSearchParams({ error: "google-link-required", ...(callbackUrl ? { callbackUrl } : {}) });
      const result = await authClient.signIn.social({ provider: "google", callbackURL: authCompletePath(callbackUrl), errorCallbackURL: `/login?${errorUrl.toString()}` });
      if (result.error) throw new Error(result.error.message || "Google sign in is not configured yet.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not start Google sign in.");
      setLoading(false);
    }
  }

  return (
    <main className="auth-page auth-page-split">
      <div className="auth-layout">
      <section className="auth-card">
        <SalonBookLogo className="brand" />
        <p className="eyebrow">WELCOME BACK</p>
        <h1>Sign in to your account</h1>
        {sessionPending && <p className="auth-hint">Checking your current sign-in…</p>}
        {search.get("error") === "google-link-required" || search.get("error") === "account_not_linked" ? <p className="form-error">This Google email may already have a SalonBook account. First sign in here with that account’s email and password, then open My profile and choose “Link Google account”. Use the same email address.</p> : search.get("error") && <p className="form-error">Google sign-in could not be completed. Check the OAuth setup and try again.</p>}
        <form onSubmit={onSubmit} className="auth-form">
          <label>Email<input name="email" type="email" autoComplete="email" required /></label>
          <label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
          <button disabled={loading}>{loading ? "Signing in…" : "Sign in"}</button>
        </form>
        <div className="auth-divider"><span>or</span></div>
        <button className="secondary-button google-auth-button" disabled={loading} onClick={googleLogin}><GoogleMark />Continue with Google</button>
        <p className="auth-switch">New to SalonBook? <Link href={`/register${callbackUrl ? `?${new URLSearchParams({ callbackUrl }).toString()}` : ""}`}>Create an account</Link></p>
      </section>
      <AuthVisual />
      </div>
    </main>
  );
}

export default function LoginPage() {
  return <Suspense fallback={<main className="auth-page"><p>Loading sign in…</p></main>}><LoginForm /></Suspense>;
}
