"use client";

import { useEffect } from "react";
import { Toaster } from "sonner";
import { toast } from "sonner";
import { consumeAuthFeedback } from "@/lib/auth-feedback";

export function ToastProvider() {
  useEffect(() => {
    const feedback = consumeAuthFeedback();
    if (feedback?.type === "success") toast.success(feedback.message, { duration: 2500 });
    if (feedback?.type === "error") toast.error(feedback.message);
  }, []);

  return <Toaster richColors position="top-right" theme="light" toastOptions={{ classNames: { toast: "salon-toast" } }} />;
}
