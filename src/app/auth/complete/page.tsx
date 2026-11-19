"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

export default function AuthCompletePage() {
  const router = useRouter();
  useEffect(() => {
    let active = true;
    void authClient.getSession().then(async ({ data, error }) => {
      if (!active) return;
      if (error || !data) {
        toast.error("Could not finish authentication. Please sign in again.");
        router.replace("/login");
        return;
      }
      const user = data.user as typeof data.user & { role?: string; isBlocked?: boolean };
      if (user.isBlocked) {
        await authClient.signOut();
        toast.error("This account is blocked. Contact the salon administrator.");
        router.replace("/login");
        return;
      }
      toast.success("Signed in successfully.");
      window.location.replace(user.role === "admin" ? "/dashboard/admin" : "/dashboard/customer");
    });
    return () => { active = false; };
  }, [router]);
  return <main className="auth-page"><p>Finishing sign in…</p></main>;
}
