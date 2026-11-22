"use client";

import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  function toggleTheme() {
    const nextDark = !document.documentElement.classList.contains("dark");
    const root = document.documentElement;
    root.classList.add("theme-transition");
    root.classList.toggle("dark", nextDark);
    try {
      window.localStorage.setItem("salonbook-theme", nextDark ? "dark" : "light");
    } catch {
      // The current page still changes theme when storage is unavailable.
    }
    window.dispatchEvent(new CustomEvent("salonbook-theme-change", { detail: nextDark ? "dark" : "light" }));
    window.setTimeout(() => root.classList.remove("theme-transition"), 220);
  }

  return (
    <button
      className="theme-toggle"
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
    >
      <Moon className="theme-icon-moon" aria-hidden="true" />
      <Sun className="theme-icon-sun" aria-hidden="true" />
    </button>
  );
}
