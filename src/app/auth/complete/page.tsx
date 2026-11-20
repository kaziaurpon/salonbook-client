"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { postAuthPath } from "@/lib/auth-redirect";
import { queueAuthFeedback } from "@/lib/auth-feedback";

function AuthCompleteContent() {
  const router = useRouter();
  const search = useSearchParams();
  const callbackUrl = search.get("callbackUrl");
  useEffect(() => {
    let active = true;
    void authClient.getSession().then(async ({ data, error }) => {
      if (!active) return;
      if (error || !data) {
        toast.error("Could not finish authentication. Please sign in again.");
        router.replace(`/login${callbackUrl ? `?${new URLSearchParams({ callbackUrl }).toString()}` : ""}`);
        return;
      }
      const user = data.user as typeof data.user & { role?: string; isBlocked?: boolean };
      if (user.isBlocked) {
        await authClient.signOut();
        router.replace("/account/blocked");
        return;
      }
      queueAuthFeedback({ type: "success", message: "Signed in successfully." });
      window.location.replace(postAuthPath(user.role, callbackUrl));
    });
    return () => { active = false; };
  }, [callbackUrl, router]);
  return <main className="auth-page"><p>Finishing sign in…</p></main>;
}

export default function AuthCompletePage() {
  return <Suspense fallback={<main className="auth-page"><p>Finishing sign in…</p></main>}><AuthCompleteContent /></Suspense>;
}
