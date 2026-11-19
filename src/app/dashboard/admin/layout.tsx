import Link from "next/link";

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const links = [["Overview", "/dashboard/admin"], ["Services", "/dashboard/admin/services"], ["Appointments", "/dashboard/admin/appointments"], ["Customers", "/dashboard/admin/customers"], ["Transactions", "/dashboard/admin/transactions"], ["My profile", "/dashboard/admin/profile"]];
  return <div className="dashboard-frame admin-dashboard-frame">
    <aside className="dashboard-sidebar"><Link href="/dashboard/admin" className="dashboard-brand"><span>✳</span> SalonBook <small>ADMIN</small></Link><p className="dashboard-nav-label">WORKSPACE</p><nav aria-label="Admin navigation">{links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</nav><Link href="/" className="dashboard-site-link">View public site ↗</Link></aside>
    <div className="dashboard-content">{children}</div>
  </div>;
}
