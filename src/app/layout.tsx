import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SalonBook",
  description: "Discover salon services and request your next appointment.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
