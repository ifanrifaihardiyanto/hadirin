import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Penerimaan Peserta Didik Baru (PPDB Online)",
  description:
    "Portal resmi pendaftaran peserta didik baru (PPDB). Daftarkan diri melalui jalur zonasi, prestasi, afirmasi, serta cek status verifikasi kelulusan secara online.",
  openGraph: {
    title: "PPDB Online — Penerimaan Peserta Didik Baru | Hadirin",
    description: "Pendaftaran calon siswa baru, unggah berkas KK/akta/rapor, dan pantau hasil seleksi secara real-time.",
  },
};

export default function PPDBLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

