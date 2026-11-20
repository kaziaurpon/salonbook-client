import { requireSalonBookUser } from "@/lib/server-auth-redirect";

export default async function ProtectedServiceLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await requireSalonBookUser();
  return children;
}
