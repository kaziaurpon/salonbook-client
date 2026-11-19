import Link from "next/link";

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <>
    <header className="admin-shell-header"><Link href="/dashboard/admin" className="admin-shell-brand"><span>✳</span> SalonBook <small>ADMIN</small></Link><nav aria-label="Admin navigation"><Link href="/dashboard/admin">Overview</Link><Link href="/dashboard/admin/services">Services</Link><Link href="/dashboard/admin/appointments">Appointments</Link><Link href="/dashboard/admin/transactions">Transactions</Link></nav><Link href="/" className="admin-shell-exit">View site ↗</Link></header>
    {children}
  </>;
}
