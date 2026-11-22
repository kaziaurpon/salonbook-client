import type { Metadata } from "next";
import { ToastProvider } from "@/components/toast-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "SalonBook",
  description: "Discover salon services and request your next appointment.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(()=>{try{document.documentElement.classList.toggle("dark",localStorage.getItem("salonbook-theme")==="dark")}catch{}})()` }} />
      </head>
      <body>{children}<ToastProvider /></body>
    </html>
  );
}
