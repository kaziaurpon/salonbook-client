"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { ThemeToggle } from "@/components/theme-toggle";

export function AdminDashboardTopbar() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const user = session?.user as { name?: string; image?: string | null } | undefined;

  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => {
      if (event.target instanceof Node && !wrapperRef.current?.contains(event.target)) setOpen(false);
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  async function signOut() {
    try {
      const result = await authClient.signOut();
      if (result.error) throw new Error(result.error.message || "Could not sign out. Please try again.");
      setOpen(false);
      toast.success("Signed out successfully.");
      router.replace("/");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not sign out. Please try again.");
    }
  }

  if (!user) return <header className="admin-dashboard-topbar"><ThemeToggle /><span className="admin-topbar-loading" /></header>;

  return <header className="admin-dashboard-topbar">
    <ThemeToggle />
    <div className="admin-topbar-account" ref={wrapperRef}>
      <button className="admin-topbar-trigger" type="button" aria-expanded={open} aria-controls="admin-account-menu" onClick={() => setOpen((value) => !value)}>
        {user.image ? <img src={user.image} alt="" referrerPolicy="no-referrer" /> : <span className="admin-topbar-avatar-fallback">{user.name?.slice(0, 1).toUpperCase() || "A"}</span>}
        <span className="admin-topbar-name">{user.name || "Admin"}</span><span aria-hidden="true">⌄</span>
      </button>
      {open && <nav className="admin-topbar-menu" id="admin-account-menu" aria-label="Admin account menu">
        <p>ADMIN ACCOUNT<strong>{user.name || "Administrator"}</strong></p>
        <Link href="/dashboard/admin" onClick={() => setOpen(false)}>Dashboard</Link>
        <Link href="/dashboard/admin/profile" onClick={() => setOpen(false)}>Admin profile</Link>
        <button type="button" onClick={() => void signOut()}>Log out</button>
      </nav>}
    </div>
  </header>;
}
