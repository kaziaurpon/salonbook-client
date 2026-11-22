import { AdminSidebar } from "@/components/admin-sidebar";
import { AdminDashboardTopbar } from "@/components/admin-dashboard-topbar";

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="dashboard-frame admin-dashboard-frame">
    <AdminSidebar />
    <div className="dashboard-content"><AdminDashboardTopbar />{children}</div>
  </div>;
}
