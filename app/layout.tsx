import type { Metadata, Viewport } from "next";
import { StoreProvider } from "@/lib/store";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://hadirin.sch.id"),
  title: {
    default: "Hadirin — Platform Sistem Informasi Sekolah & Presensi Digital",
    template: "%s | Hadirin",
  },
  description:
    "Solusi platform manajemen sekolah terpadu: Presensi digital guru & siswa, Jurnal mengajar, E-Rapor Kurikulum Merdeka, CBT Online, SPP Digital, dan PPDB Online.",
  keywords: [
    "Hadirin",
    "Sistem Informasi Sekolah",
    "Aplikasi Absensi Guru",
    "Presensi Siswa Digital",
    "Kurikulum Merdeka",
    "E-Rapor Digital",
    "Ujian CBT Online",
    "Pembayaran SPP Digital",
    "PPDB Online",
    "SaaS Sekolah Indonesia",
  ],
  authors: [{ name: "Tim Pengembang Hadirin Education" }],
  creator: "Hadirin SaaS Platform",
  publisher: "Hadirin Education",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    siteName: "Hadirin Education Platform",
    title: "Hadirin — Platform Sistem Informasi Sekolah & Presensi Digital",
    description:
      "Transformasi digital tata kelola sekolah: Presensi GPS/QR, Jurnal Mengajar, CBT, E-Rapor Kurikulum Merdeka, dan Manajemen SPP.",
    images: [
      {
        url: "/icon.svg",
        width: 512,
        height: 512,
        alt: "Logo Hadirin Education",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hadirin — Sistem Informasi Sekolah & Presensi Digital",
    description:
      "Ambil absensi kelas, pantau jurnal mengajar, kelola CBT, dan cetak rapor Kurikulum Merdeka dalam satu aplikasi.",
    images: ["/icon.svg"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Hadirin",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#091E3A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
