import { CustomerDashboardTopbar } from "@/components/customer-dashboard-topbar";
import { CustomerSidebar } from "@/components/customer-sidebar";

export default function CustomerLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="dashboard-frame customer-dashboard-frame">
    <CustomerSidebar />
    <div className="dashboard-content"><CustomerDashboardTopbar />{children}</div>
  </div>;
}
