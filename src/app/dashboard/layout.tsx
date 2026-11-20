import { requireSalonBookUser } from "@/lib/server-auth-redirect";

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await requireSalonBookUser();
  return children;
}
