"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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
        callbackURL: "/dashboard/customer",
      });
      if (result.error) throw new Error(result.error.message || "Could not create your account.");
      toast.success("Your SalonBook account is ready.");
      router.replace("/dashboard/customer");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create your account.");
    } finally {
      setLoading(false);
    }
  }

  async function googleSignUp() {
    setLoading(true);
    try {
      const result = await authClient.signIn.social({ provider: "google", callbackURL: "/auth/complete", errorCallbackURL: "/login?error=google-link-required" });
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
        <p className="auth-switch">Already registered? <Link href="/login">Sign in</Link></p>
      </section>
    </main>
  );
}
