"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { SalonBookLogo } from "@/components/salonbook-logo";
import { authCompletePath, postAuthPath } from "@/lib/auth-redirect";

function RegisterForm() {
  const router = useRouter();
  const search = useSearchParams();
  const callbackUrl = search.get("callbackUrl");
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sessionPending || !session) return;
    const user = session.user as typeof session.user & { role?: string; isBlocked?: boolean };
    if (user.isBlocked) {
      void authClient.signOut().then(() => router.replace("/account/blocked"));
      return;
    }
    window.location.replace(postAuthPath(user.role, callbackUrl));
  }, [callbackUrl, router, session, sessionPending]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password"));
    if (password.length < 6 || !/[A-Z]/.test(password) || !/[a-z]/.test(password)) {
      toast.error("Password needs 6+ characters, including uppercase and lowercase letters.");
      return;
    }
    setLoading(true);
    try {
      const result = await authClient.signUp.email({
        name: String(form.get("name")),
        email: String(form.get("email")),
        password,
        ...(String(form.get("image")).trim() ? { image: String(form.get("image")).trim() } : {}),
        callbackURL: authCompletePath(callbackUrl),
      });
      if (result.error) throw new Error(result.error.message || "Could not create your account.");
      const current = await authClient.getSession();
      if (current.error || !current.data) {
        router.replace(`/login${callbackUrl ? `?${new URLSearchParams({ callbackUrl }).toString()}` : ""}`);
        return;
      }
      const user = current.data.user as typeof current.data.user & { role?: string; isBlocked?: boolean };
      if (user.isBlocked) {
        await authClient.signOut();
        router.replace("/account/blocked");
        return;
      }
      toast.success("Your SalonBook account is ready.");
      window.location.assign(postAuthPath(user.role, callbackUrl));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create your account.");
    } finally {
      setLoading(false);
    }
  }

  async function googleSignUp() {
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
    <main className="auth-page">
      <section className="auth-card">
        <SalonBookLogo className="brand" />
        <p className="eyebrow">YOUR SALON, YOUR TIME</p>
        <h1>Create your account</h1>
        <form onSubmit={onSubmit} className="auth-form">
          <label>Full name<input name="name" autoComplete="name" required maxLength={100} /></label>
          <label>Email<input name="email" type="email" autoComplete="email" required /></label>
          <label>Password<input name="password" type="password" autoComplete="new-password" minLength={6} maxLength={128} required /><small>At least 6 characters, with uppercase and lowercase letters.</small></label>
          <label>Profile image URL <span className="muted">(optional)</span><input name="image" type="url" placeholder="https://…" /></label>
          <button disabled={loading}>{loading ? "Creating account…" : "Create account"}</button>
        </form>
        <div className="auth-divider"><span>or</span></div>
        <button className="secondary-button" disabled={loading} onClick={googleSignUp}>Continue with Google</button>
        <p className="auth-switch">Already registered? <Link href={`/login${callbackUrl ? `?${new URLSearchParams({ callbackUrl }).toString()}` : ""}`}>Sign in</Link></p>
      </section>
    </main>
  );
}

export default function RegisterPage() {
  return <Suspense fallback={<main className="auth-page"><p>Loading account setup…</p></main>}><RegisterForm /></Suspense>;
}
