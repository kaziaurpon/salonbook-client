"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

export function CustomerDashboardTopbar() {
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
      toast.success("Signed out successfully.", { duration: 2500 });
      router.replace("/");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not sign out. Please try again.");
    }
  }

  if (!user) return <header className="customer-dashboard-topbar"><span className="admin-topbar-loading" aria-label="Loading account" /></header>;

  return <header className="customer-dashboard-topbar">
    <div className="admin-topbar-account" ref={wrapperRef}>
      <button className="admin-topbar-trigger" type="button" aria-expanded={open} aria-controls="customer-account-menu" onClick={() => setOpen((value) => !value)}>
        {user.image ? <img src={user.image} alt="" referrerPolicy="no-referrer" /> : <span className="admin-topbar-avatar-fallback">{user.name?.slice(0, 1).toUpperCase() || "C"}</span>}
        <span className="admin-topbar-name">{user.name || "My account"}</span><span aria-hidden="true">⌄</span>
      </button>
      {open && <nav className="admin-topbar-menu" id="customer-account-menu" aria-label="Customer account menu">
        <p>CUSTOMER ACCOUNT<strong>{user.name || "SalonBook customer"}</strong></p>
        <Link href="/dashboard/customer" onClick={() => setOpen(false)}>Dashboard</Link>
        <Link href="/dashboard/customer/profile" onClick={() => setOpen(false)}>My profile</Link>
        <button type="button" onClick={() => void signOut()}>Log out</button>
      </nav>}
    </div>
  </header>;
}
