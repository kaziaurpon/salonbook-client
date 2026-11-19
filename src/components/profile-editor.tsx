"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { authenticatedApiFetch } from "@/lib/api";

type Profile = { name: string; email: string; image?: string | null; phone?: string | null; role: "admin" | "customer"; isBlocked: boolean };

export function ProfileEditor({ role }: { role: "admin" | "customer" }) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const { refetch } = authClient.useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [linkingGoogle, setLinkingGoogle] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isPending) return;
    if (!session) { router.replace("/login"); return; }
    const user = session.user as typeof session.user & { role?: string; isBlocked?: boolean };
    if (user.isBlocked) { void authClient.signOut().then(() => router.replace("/login")); return; }
    if (user.role !== role) { router.replace(user.role === "admin" ? "/dashboard/admin" : "/dashboard/customer"); return; }
    void (async () => {
      setLoading(true); setError("");
      try {
        const response = await authenticatedApiFetch("/api/profile/me");
        const result = await response.json() as { profile?: Profile; message?: string };
        if (!response.ok || !result.profile) throw new Error(result.message || "Could not load your profile.");
        setProfile(result.profile); setName(result.profile.name); setImage(result.profile.image || ""); setPhone(result.profile.phone || "");
      } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not load your profile."); }
      finally { setLoading(false); }
    })();
  }, [isPending, role, router, session]);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (name.trim().length < 2 || name.trim().length > 80) { toast.error("Name must be 2–80 characters."); return; }
    if (image && !/^https?:\/\//i.test(image)) { toast.error("Profile image must be an http or https URL."); return; }
    if (phone && !/^[+\d().\-\s]{5,30}$/.test(phone)) { toast.error("Enter a valid phone number."); return; }
    setSaving(true);
    try {
      const response = await authenticatedApiFetch("/api/profile/me", { method: "PATCH", body: JSON.stringify({ name: name.trim(), image: image.trim(), phone: phone.trim() }) });
      const result = await response.json() as { profile?: Profile; message?: string };
      if (!response.ok || !result.profile) throw new Error(result.message || "Could not save your profile.");
      setProfile(result.profile);
      await refetch();
      toast.success("Profile updated successfully.");
    } catch (reason) { toast.error(reason instanceof Error ? reason.message : "Could not save your profile."); }
    finally { setSaving(false); }
  }

  async function linkGoogleAccount() {
    setLinkingGoogle(true);
    try {
      const result = await authClient.linkSocial({
        provider: "google",
        callbackURL: "/auth/complete",
        errorCallbackURL: window.location.href,
      });
      if (result.error) throw new Error(result.error.message || "Could not start Google account linking.");
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "Could not link your Google account.");
      setLinkingGoogle(false);
    }
  }

  if (isPending || !session || loading) return <main className="admin-services-page"><p>Loading your profile…</p></main>;
  if (error || !profile) return <main className="admin-services-page"><div className="service-message service-error"><p>{error || "Profile unavailable."}</p><button className="secondary-button" onClick={() => router.refresh()}>Try again</button></div></main>;

  return <main className="admin-services-page profile-page"><header className="admin-services-heading"><div><p className="eyebrow">ACCOUNT SETTINGS · {role.toUpperCase()}</p><h1>Your profile</h1><p>Update the contact details used for your SalonBook account.</p></div>{profile.image ? <img className="profile-avatar" src={profile.image} alt="Profile" /> : <span className="profile-avatar profile-avatar-fallback">{profile.name.slice(0, 1).toUpperCase()}</span>}</header>
    <form className="profile-form" onSubmit={save}>
      <label>Full name<input required minLength={2} maxLength={80} value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" /></label>
      <label>Email address<input value={profile.email} readOnly disabled /><small>Email is managed by your authentication account.</small></label>
      <label>Phone number<input type="tel" maxLength={30} value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" placeholder="+880 1XXXXXXXXX" /></label>
      <label className="profile-form-wide">Profile image URL<input type="url" maxLength={2048} value={image} onChange={(event) => setImage(event.target.value)} placeholder="https://example.com/photo.jpg" /><small>Leave blank to remove your profile image.</small></label>
      <section className="profile-form-wide profile-google-link">
        <div><strong>Google sign-in</strong><small>Link the Google account that uses this same email address. You will be asked to sign in with your current Google account.</small></div>
        <button className="secondary-button" type="button" onClick={linkGoogleAccount} disabled={linkingGoogle}>{linkingGoogle ? "Opening Google…" : "Link Google account"}</button>
      </section>
      <div className="profile-form-wide profile-locked-fields"><span>Account role <strong>{profile.role}</strong></span><span>Account status <strong>{profile.isBlocked ? "Blocked" : "Active"}</strong></span><small>Role and access status are managed by the platform and cannot be changed here.</small></div>
      <div className="profile-form-wide"><button className="primary-button" disabled={saving}>{saving ? "Saving…" : "Save profile"}</button></div>
    </form>
  </main>;
}
