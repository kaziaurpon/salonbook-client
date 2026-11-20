"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SalonBookLogo } from "@/components/salonbook-logo";

const links = [
  ["Overview", "/dashboard/admin"],
  ["Manage services", "/dashboard/admin/services"],
  ["Appointments", "/dashboard/admin/appointments"],
  ["Customers", "/dashboard/admin/customers"],
  ["Transactions", "/dashboard/admin/transactions"],
  ["My profile", "/dashboard/admin/profile"],
] as const;

export function AdminSidebar() {
  const pathname = usePathname();
  return <aside className="dashboard-sidebar admin-sidebar">
    <SalonBookLogo href="/dashboard/admin" className="dashboard-brand" badge="ADMIN" />
    <p className="dashboard-nav-label">WORKSPACE</p>
    <nav aria-label="Admin navigation">{links.map(([label, href]) => {
      const active = href === "/dashboard/admin" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
      return <Link key={href} href={href} aria-current={active ? "page" : undefined}>{label}</Link>;
    })}</nav>
    <Link href="/" className="dashboard-site-link">View public site ↗</Link>
  </aside>;
}
