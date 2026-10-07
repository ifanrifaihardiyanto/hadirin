import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Paket & Harga Langganan Sekolah",
  description:
    "Pilihan paket lisensi sistem informasi sekolah Hadirin. Mulai dari uji coba gratis 1 semester penuh, paket standar hingga premium multi-kampus.",
  openGraph: {
    title: "Paket & Harga Lisensi Hadirin SaaS Sekolah",
    description: "Investasi hemat digitalisasi sekolah: Presensi GPS, Jurnal Mengajar, CBT Online, dan E-Rapor.",
  },
};

export default function HargaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

