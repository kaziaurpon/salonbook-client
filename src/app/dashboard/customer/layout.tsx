import { CustomerDashboardTopbar } from "@/components/customer-dashboard-topbar";
import { CustomerSidebar } from "@/components/customer-sidebar";
import { DashboardScrollReset } from "@/components/dashboard-scroll-reset";

export default function CustomerLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="dashboard-frame customer-dashboard-frame">
    <DashboardScrollReset />
    <CustomerSidebar />
    <div className="dashboard-content" data-dashboard-scroll><CustomerDashboardTopbar />{children}</div>
  </div>;
}
