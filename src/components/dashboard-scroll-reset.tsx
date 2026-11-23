"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";

export function DashboardScrollReset() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    const resetScroll = () => {
      window.scrollTo(0, 0);
      document.querySelectorAll<HTMLElement>("[data-dashboard-scroll]").forEach((container) => {
        container.scrollTop = 0;
        container.scrollLeft = 0;
      });
    };

    resetScroll();
    const frame = window.requestAnimationFrame(resetScroll);

    return () => {
      window.cancelAnimationFrame(frame);
      window.history.scrollRestoration = previousRestoration;
    };
  }, [pathname]);

  return null;
}
