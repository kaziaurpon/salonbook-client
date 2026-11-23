import { AdminSidebar } from "@/components/admin-sidebar";
import { AdminDashboardTopbar } from "@/components/admin-dashboard-topbar";
import { DashboardScrollReset } from "@/components/dashboard-scroll-reset";

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="dashboard-frame admin-dashboard-frame">
    <DashboardScrollReset />
    <AdminSidebar />
    <div className="dashboard-content" data-dashboard-scroll><AdminDashboardTopbar />{children}</div>
  </div>;
}
