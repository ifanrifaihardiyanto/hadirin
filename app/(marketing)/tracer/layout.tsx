import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tracer Study Alumni & Pusat Karir Sekolah",
  description:
    "Kuesioner pelacakan jejak alumni (Tracer Study). Bantu almamater memetakan capaian lulusan ke perguruan tinggi (PTN/PTS), dunia kerja industri, dan wirausaha.",
  openGraph: {
    title: "Tracer Study & Jejaring Alumni Sekolah | Hadirin",
    description: "Bangun jejaring karir dan bimbingan mentoring antar generasi alumni sekolah.",
  },
};

export default function TracerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

