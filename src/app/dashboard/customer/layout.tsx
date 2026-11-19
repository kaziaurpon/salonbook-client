import Link from "next/link";

export default function CustomerLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const links = [["My appointments", "/dashboard/customer"], ["My profile", "/dashboard/customer/profile"]];
  return <div className="dashboard-frame customer-dashboard-frame">
    <aside className="dashboard-sidebar"><Link href="/" className="dashboard-brand"><span>✳</span> SalonBook <small>YOUR SPACE</small></Link><p className="dashboard-nav-label">ACCOUNT</p><nav aria-label="Customer navigation">{links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</nav><Link href="/services" className="dashboard-site-link">Browse services ↗</Link></aside>
    <div className="dashboard-content">{children}</div>
  </div>;
}
