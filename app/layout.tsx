import type { Metadata, Viewport } from "next";
import { StoreProvider } from "@/lib/store";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hadirin — Absensi Sekolah Modern",
  description: "Ambil absensi kelas dalam hitungan detik, langsung dari HP.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Hadirin",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f2942",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-background font-sans text-foreground antialiased selection:bg-navy-900 selection:text-white">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
