"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function PublicNavbar() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  async function signOut() {
    await authClient.signOut();
    setMenuOpen(false);
    router.replace("/");
    router.refresh();
  }

  const user = session?.user as { role?: string } | undefined;

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
              <Link className="nav-dashboard" href={user.role === "admin" ? "/dashboard/admin" : "/dashboard/customer"} onClick={() => setMenuOpen(false)}>{user.role === "admin" ? "Admin dashboard" : "My appointments"}</Link>
              <button className="nav-signout" type="button" onClick={signOut}>Sign out</button>
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
