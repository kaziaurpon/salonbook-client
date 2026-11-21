import { AdminSidebar } from "@/components/admin-sidebar";
import { AdminDashboardTopbar } from "@/components/admin-dashboard-topbar";
import { requireSalonBookUser } from "@/lib/server-auth-redirect";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await requireSalonBookUser("admin");
  return <div className="dashboard-frame admin-dashboard-frame">
    <AdminSidebar />
    <div className="dashboard-content"><AdminDashboardTopbar />{children}</div>
  </div>;
}
