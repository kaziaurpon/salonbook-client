import Link from "next/link";
import { SalonBookLogo } from "@/components/salonbook-logo";
import { requireSalonBookUser } from "@/lib/server-auth-redirect";

export default async function CustomerLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await requireSalonBookUser("customer");
  const links = [["Overview", "/dashboard/customer"], ["My appointments", "/dashboard/customer/appointments"], ["My profile", "/dashboard/customer/profile"]];
  return <div className="dashboard-frame customer-dashboard-frame">
    <aside className="dashboard-sidebar"><SalonBookLogo href="/" className="dashboard-brand" badge="YOUR SPACE" /><p className="dashboard-nav-label">ACCOUNT</p><nav aria-label="Customer navigation">{links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</nav><Link href="/services" className="dashboard-site-link">Browse services ↗</Link></aside>
    <div className="dashboard-content">{children}</div>
  </div>;
}
