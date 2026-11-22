"use client";

import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { toast } from "sonner";
import { consumeAuthFeedback } from "@/lib/auth-feedback";

export function ToastProvider() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const syncTheme = () => setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
    syncTheme();
    window.addEventListener("salonbook-theme-change", syncTheme);
    const feedback = consumeAuthFeedback();
    if (feedback?.type === "success") toast.success(feedback.message, { duration: 2500 });
    if (feedback?.type === "error") toast.error(feedback.message);
    return () => window.removeEventListener("salonbook-theme-change", syncTheme);
  }, []);

  return <Toaster richColors position="top-right" theme={theme} toastOptions={{ classNames: { toast: "salon-toast" } }} />;
}
