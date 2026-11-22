import Link from "next/link";
import { headers } from "next/headers";
import { SalonBookLogo } from "@/components/salonbook-logo";
import { CustomerDashboardTopbar } from "@/components/customer-dashboard-topbar";

export default async function CustomerLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const requestHeaders = await headers();
  const pathname = requestHeaders.get("x-salonbook-request-path")?.split("?")[0] || "/dashboard/customer";
  const links = [["Overview", "/dashboard/customer"], ["My appointments", "/dashboard/customer/appointments"], ["My profile", "/dashboard/customer/profile"]];
  return <div className="dashboard-frame customer-dashboard-frame">
    <aside className="dashboard-sidebar"><SalonBookLogo href="/" className="dashboard-brand" badge="YOUR SPACE" /><p className="dashboard-nav-label">ACCOUNT</p><nav aria-label="Customer navigation">{links.map(([label, href]) => {
      const active = href === "/dashboard/customer" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
      return <Link key={href} href={href} aria-current={active ? "page" : undefined}>{label}</Link>;
    })}</nav><Link href="/services" className="dashboard-site-link">Browse services ↗</Link></aside>
    <div className="dashboard-content"><CustomerDashboardTopbar />{children}</div>
  </div>;
}
