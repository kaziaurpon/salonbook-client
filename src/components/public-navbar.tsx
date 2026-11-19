"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function PublicNavbar() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  async function signOut() {
    await authClient.signOut();
    setMenuOpen(false);
    setProfileOpen(false);
    router.replace("/");
    router.refresh();
  }

  const user = session?.user as { role?: string; name?: string } | undefined;
  const dashboardHref = user?.role === "admin" ? "/dashboard/admin" : "/dashboard/customer";
  const profileHref = user?.role === "admin" ? "/dashboard/admin/profile" : "/dashboard/customer/profile";

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link className="site-brand" href="/" aria-label="SalonBook home">
          <span className="brand-mark" aria-hidden="true">S</span>
          <span>salon<span className="brand-light">book</span></span>
        </Link>
        <button className="nav-toggle" type="button" aria-expanded={menuOpen} aria-controls="site-navigation" onClick={() => setMenuOpen((open) => !open)}>
          <span className="sr-only">{menuOpen ? "Close" : "Open"} navigation menu</span>
          <span /><span />
        </button>
        <nav id="site-navigation" className={`site-nav${menuOpen ? " is-open" : ""}`} aria-label="Main navigation">
          <Link href="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link href="/services" onClick={() => setMenuOpen(false)}>Services</Link>
          {isPending ? <span className="nav-loading" aria-label="Loading account" /> : user ? (
            <>
              <div className="nav-profile-wrap">
                <button className="nav-profile-trigger" type="button" aria-expanded={profileOpen} aria-controls="profile-menu" onClick={() => setProfileOpen((open) => !open)}><span className="nav-profile-avatar">{user.name?.slice(0, 1).toUpperCase() || "S"}</span><span>{user.name || "My account"}</span><span aria-hidden="true">⌄</span></button>
                {profileOpen && <div className="nav-profile-menu" id="profile-menu"><p>Signed in as <strong>{user.name}</strong></p><Link href={dashboardHref} onClick={() => { setMenuOpen(false); setProfileOpen(false); }}>Dashboard</Link><Link href={profileHref} onClick={() => { setMenuOpen(false); setProfileOpen(false); }}>My profile</Link><button className="nav-signout" type="button" onClick={signOut}>Sign out</button></div>}
              </div>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setMenuOpen(false)}>Sign in</Link>
              <Link className="nav-cta" href="/register" onClick={() => setMenuOpen(false)}>Create account <span aria-hidden="true">↗</span></Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
