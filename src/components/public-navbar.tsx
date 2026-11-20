"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { MouseEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { SalonBookLogo } from "@/components/salonbook-logo";

export function PublicNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [hash, setHash] = useState("");
  useEffect(() => {
    const syncHash = () => setHash(window.location.hash);
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [pathname]);

  function goHome(event: MouseEvent<HTMLAnchorElement>) {
    setMenuOpen(false);
    setProfileOpen(false);
    if (pathname !== "/") return;
    event.preventDefault();
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    setHash("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goToFooter(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    setMenuOpen(false);
    setProfileOpen(false);
    const footer = document.getElementById("footer");
    if (!footer) return;
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#footer`);
    setHash("#footer");
    footer.scrollIntoView({ behavior: "smooth", block: "start" });
  }

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
  const isActive = (href: string) => href === "/" ? pathname === "/" && hash !== "#footer" : href === "/services" ? hash !== "#footer" && (pathname === "/services" || pathname.startsWith("/services/")) : pathname === href;
  const linkProps = (href: string) => ({ "aria-current": isActive(href) ? "page" as const : undefined, onClick: () => setMenuOpen(false) });

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <SalonBookLogo className="site-brand" />
        <div className="site-nav-wrap">
        <button className="nav-toggle" type="button" aria-expanded={menuOpen} aria-controls="site-navigation" onClick={() => setMenuOpen((open) => !open)}>
          <span className="sr-only">{menuOpen ? "Close" : "Open"} navigation menu</span>
          <span /><span />
        </button>
        <nav id="site-navigation" className={`site-nav${menuOpen ? " is-open" : ""}`} aria-label="Main navigation">
          <div className="site-nav-links">
            <Link href="/" aria-current={isActive("/") ? "page" : undefined} onClick={goHome}>Home</Link>
            <Link href="/services" {...linkProps("/services")}>Services</Link>
            <Link className={hash === "#footer" ? "is-active" : undefined} href="#footer" aria-current={hash === "#footer" ? "location" : undefined} onClick={goToFooter}>About Us</Link>
          </div>
          <div className="site-account-actions">
            {isPending ? <span className="nav-loading" aria-label="Loading account" /> : user ? (
              <div className="nav-profile-wrap">
                <button className="nav-profile-trigger" type="button" aria-expanded={profileOpen} aria-controls="profile-menu" onClick={() => setProfileOpen((open) => !open)}><span className="nav-profile-avatar">{user.name?.slice(0, 1).toUpperCase() || "S"}</span><span>{user.name || "My account"}</span><span aria-hidden="true">⌄</span></button>
                {profileOpen && <div className="nav-profile-menu" id="profile-menu"><p>Signed in as <strong>{user.name}</strong></p><Link href={dashboardHref} onClick={() => { setMenuOpen(false); setProfileOpen(false); }}>Dashboard</Link><Link href={profileHref} onClick={() => { setMenuOpen(false); setProfileOpen(false); }}>My profile</Link><button className="nav-signout" type="button" onClick={signOut}>Log out</button></div>}
              </div>
            ) : <><Link className="nav-signin" href="/login" aria-current={pathname === "/login" ? "page" : undefined} onClick={() => setMenuOpen(false)}>Sign In</Link><Link className="nav-cta" href="/register" aria-current={pathname === "/register" ? "page" : undefined} onClick={() => setMenuOpen(false)}>Sign Up <span aria-hidden="true">↗</span></Link></>}
          </div>
        </nav>
        </div>
      </div>
    </header>
  );
}
