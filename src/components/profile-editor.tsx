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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUploadNotice, setImageUploadNotice] = useState("");
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
      // A session refresh is useful for the navbar, but it must not turn a
      // successful database update into a misleading save error.
      void refetch();
      toast.success(result.message || "Profile updated successfully.");
    } catch (reason) { toast.error(reason instanceof Error ? reason.message : "Could not save your profile."); }
    finally { setSaving(false); }
  }

  async function uploadProfileImage(file?: File) {
    if (!file) return;
    if (!file.type.match(/^image\/(jpeg|png|webp)$/) || file.size > 5 * 1024 * 1024) {
      toast.error("Choose a JPG, PNG, or WebP image smaller than 5 MB.");
      return;
    }
    setUploadingImage(true);
    try {
      const body = new FormData();
      body.append("image", file);
      const response = await authenticatedApiFetch("/api/profile/me/upload-image", { method: "POST", body });
      const result = await response.json() as { image?: string; message?: string };
      if (!response.ok || !result.image) throw new Error(result.message || "Could not upload your profile image.");
      setImage(result.image);
      setImageUploadNotice("Image ready. Save your profile to apply it.");
    } catch (reason) {
      setImageUploadNotice("");
      toast.error(reason instanceof Error ? reason.message : "Could not upload your profile image.");
    } finally {
      setUploadingImage(false);
    }
  }

  if (isPending || !session || loading) return <main className="admin-services-page"><p>Loading your profile…</p></main>;
  if (error || !profile) return <main className="admin-services-page"><div className="service-message service-error"><p>{error || "Profile unavailable."}</p><button className="secondary-button" onClick={() => router.refresh()}>Try again</button></div></main>;

  if (role === "admin") return <main className="admin-services-page profile-page"><header className="admin-services-heading"><div><p className="eyebrow">ACCOUNT SETTINGS · ADMIN</p><h1>Your profile</h1><p>Update the contact details used for your SalonBook account.</p></div>{image ? <img className="profile-avatar" src={image} alt="Profile" /> : <span className="profile-avatar profile-avatar-fallback">{profile.name.slice(0, 1).toUpperCase()}</span>}</header>
    <form className="profile-form" onSubmit={save}>
      <label>Full name<input required minLength={2} maxLength={80} value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" /></label>
      <label>Email address<input value={profile.email} readOnly disabled /><small>Email is managed by your authentication account.</small></label>
      <label>Phone number<input type="tel" maxLength={30} value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" placeholder="+880 1XXXXXXXXX" /></label>
      <label className="profile-form-wide">Profile image URL<input type="url" maxLength={2048} value={image} onChange={(event) => { setImage(event.target.value); setImageUploadNotice(""); }} placeholder="https://example.com/photo.jpg" /><small>Paste an image URL, or upload a JPG, PNG, or WebP image up to 5 MB.</small><input className="profile-image-file" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { void uploadProfileImage(event.currentTarget.files?.[0]); }} disabled={uploadingImage} /><small aria-live="polite">{uploadingImage ? "Uploading image…" : imageUploadNotice || "The selected image is not applied until you save your profile."}</small></label>
      <div className="profile-form-wide profile-locked-fields"><span>Account role <strong>{profile.role}</strong></span><span>Account status <strong>{profile.isBlocked ? "Blocked" : "Active"}</strong></span><small>Role and access status are managed by the platform and cannot be changed here.</small></div>
      <div className="profile-form-wide"><button className="primary-button" disabled={saving || uploadingImage}>{saving ? "Saving…" : "Save profile"}</button></div>
    </form>
  </main>;

  return <main className="admin-services-page profile-page customer-profile-page"><header className="admin-services-heading"><div><p className="eyebrow">ACCOUNT · CUSTOMER</p><h1>Your profile</h1><p>Keep the details used for your appointments current.</p></div></header>
    <div className="customer-profile-layout"><form className="profile-form customer-profile-form" onSubmit={save}>
      <section className="customer-profile-photo profile-form-wide"><div className="customer-profile-avatar">{image ? <img src={image} alt="Your profile" /> : <span>{name.slice(0, 1).toUpperCase()}</span>}</div><div><p className="eyebrow">YOUR SALONBOOK PROFILE</p><h2>Photo & details</h2><p>This is how your details appear with your appointment requests.</p></div></section>
      <label>Full name<input required minLength={2} maxLength={80} value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" /></label>
      <label>Phone number <small>(optional)</small><input type="tel" maxLength={30} value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" placeholder="+880 1XXXXXXXXX" /></label>
      <label className="profile-form-wide">Profile image URL<input type="url" maxLength={2048} value={image} onChange={(event) => { setImage(event.target.value); setImageUploadNotice(""); }} placeholder="https://example.com/photo.jpg" /><small>Paste an image URL, or upload a JPG, PNG, or WebP image up to 5 MB.</small><input className="profile-image-file" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { void uploadProfileImage(event.currentTarget.files?.[0]); }} disabled={uploadingImage} /><small aria-live="polite">{uploadingImage ? "Uploading image…" : imageUploadNotice || "The selected image is not applied until you save your profile."}</small></label>
      <label className="profile-form-wide">Email address<input value={profile.email} readOnly disabled /><small>Email is managed by your authentication account.</small></label>
      <div className="profile-form-wide customer-profile-submit"><small>Role and account status are managed by SalonBook.</small><button className="primary-button" disabled={saving || uploadingImage}>{saving ? "Saving…" : "Save changes"}</button></div>
    </form>
    <aside className="customer-profile-aside"><section><p className="eyebrow">ACCOUNT DETAILS</p><h2>Your account</h2><div><span>Role</span><strong>Customer</strong></div><div><span>Status</span><strong className={profile.isBlocked ? "blocked" : "active"}>{profile.isBlocked ? "Blocked" : "Active"}</strong></div><p>Your role and access status cannot be changed from your profile.</p></section></aside></div>
  </main>;
}
