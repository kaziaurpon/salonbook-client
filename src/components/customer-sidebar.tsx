"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SalonBookLogo } from "@/components/salonbook-logo";

const links = [
  ["Overview", "/dashboard/customer"],
  ["My appointments", "/dashboard/customer/appointments"],
  ["My profile", "/dashboard/customer/profile"],
] as const;

export function CustomerSidebar() {
  const pathname = usePathname();

  return <aside className="dashboard-sidebar">
    <SalonBookLogo href="/" className="dashboard-brand" badge="YOUR SPACE" />
    <p className="dashboard-nav-label">ACCOUNT</p>
    <nav aria-label="Customer navigation">
      {links.map(([label, href]) => {
        const active = href === "/dashboard/customer"
          ? pathname === href
          : pathname === href || pathname.startsWith(`${href}/`);

        return <Link key={href} href={href} aria-current={active ? "page" : undefined}>{label}</Link>;
      })}
    </nav>
    <Link href="/services" className="dashboard-site-link">Browse services ↗</Link>
  </aside>;
}
