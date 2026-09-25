"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  ChevronDown,
  MessageCircleMore,
  Tag,
  WifiOff,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const paket = [
  {
    nama: "Trial",
    harga: "Gratis",
    satuan: "1 semester penuh",
    deskripsi: "Untuk sekolah yang mau coba langsung tanpa syarat apapun.",
    unggulan: false,
    fitur: [
      "Presensi cepat per kelas",
      "Dashboard guru & admin sekolah",
      "Hingga 100 siswa",
      "1 akun administrator",
    ],
  },
  {
    nama: "Standar",
    harga: "Rp 15.000",
    satuan: "per siswa / tahun",
    deskripsi: "Pilihan utama sekolah dasar hingga menengah.",
    unggulan: true,
    fitur: [
      "Semua fitur Trial",
      "Notifikasi WhatsApp otomatis ke wali murid",
      "Export laporan rekapitulasi (CSV & Excel)",
      "Kapasitas siswa tanpa batas",
      "Hingga 5 akun admin",
    ],
  },
  {
    nama: "Premium",
    harga: "Rp 25.000",
    satuan: "per siswa / tahun",
    deskripsi: "Untuk yayasan pendidikan atau sekolah multi-kampus.",
    unggulan: false,
    fitur: [
      "Semua fitur Standar",
      "Custom branding & logo instansi",
      "Dukungan prioritas tim teknis 24/7",
      "Administrator tanpa batas",
    ],
  },
];

const faq = [
  {
    q: "Apakah ada biaya tersembunyi selain yang tertera?",
    a: "Tidak ada. Harga per siswa/tahun sudah mencakup seluruh infrastruktur, pembaruan aplikasi, serta kuota notifikasi WhatsApp resmi. Bebas biaya setup instalasi.",
  },
  {
    q: "Sekolah kami berskala kecil, apakah tetap efisien?",
    a: "Sangat efisien. Anda dapat memulai secara gratis melalui paket Trial hingga 100 siswa untuk membuktikan kemudahan presensi bagi para guru.",
  },
  {
    q: "Bisakah beralih paket di tengah tahun ajaran?",
    a: "Tentu bisa. Upgrade dari Trial ke paket berbayar dapat dilakukan kapan pun dan sisa masa aktif akan disesuaikan secara proporsional.",
  },
  {
    q: "Bagaimana notifikasi WhatsApp ke wali murid dikirimkan?",
    a: "Saat guru menekan simpan absensi kelas, siswa yang berstatus Sakit, Izin, atau Alpha akan langsung memicu notifikasi ringkas ke nomor WhatsApp wali murid terdaftar tanpa perlu instalasi aplikasi tambahan.",
  },
];

export default function HargaPage() {
  const [faqTerbuka, setFaqTerbuka] = useState<number | null>(0);

  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-3xl px-5 pb-14 pt-16 text-center md:pt-24">
        <Badge variant="navy" className="mb-4 text-xs font-semibold">
          Platform Presensi Sekolah Modern
        </Badge>
        <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-navy-950 md:text-5xl">
          Absensi kelas digital yang
          <br />
          <span className="text-navy-700">disukai guru &amp; orang tua</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground md:text-base">
          Satu sentuhan untuk menandai seluruh siswa hadir — cukup tandai yang berhalangan. Laporan otomatis tersinkronisasi dan wali murid ternotifikasi secara instan.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" className="w-full bg-navy-900 text-white hover:bg-navy-800 sm:w-auto" asChild>
            <Link href="/onboarding">Mulai Coba Gratis 1 Semester</Link>
          </Button>
          <Button variant="outline" size="lg" className="w-full border-border text-navy-900 hover:bg-navy-50 sm:w-auto" asChild>
            <Link href="/login">Masuk ke Portal</Link>
          </Button>
        </div>
      </section>

      {/* Keunggulan */}
      <section className="mx-auto grid max-w-4xl grid-cols-1 gap-4 px-5 pb-16 sm:grid-cols-3">
        <Card className="border-border bg-white shadow-xs">
          <CardContent className="p-5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-navy-50 text-navy-800 mb-3">
              <Tag size={18} />
            </span>
            <p className="text-sm font-bold text-navy-950">Harga Transparan</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Perhitungan jelas per siswa per tahun, tanpa biaya tersembunyi atau biaya langganan server terpisah.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-white shadow-xs">
          <CardContent className="p-5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-navy-50 text-navy-800 mb-3">
              <MessageCircleMore size={18} />
            </span>
            <p className="text-sm font-bold text-navy-950">Terintegrasi WhatsApp</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Wali murid menerima laporan ketidakhadiran langsung di WhatsApp tanpa perlu login ke aplikasi lain.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-white shadow-xs">
          <CardContent className="p-5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-navy-50 text-navy-800 mb-3">
              <WifiOff size={18} />
            </span>
            <p className="text-sm font-bold text-navy-950">Dukungan Mode Offline</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Guru tetap leluasa mengambil presensi di ruang kelas meski sinyal internet lemah.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Paket Harga */}
      <section className="mx-auto max-w-5xl px-5 pb-16">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight text-navy-950 md:text-3xl">
            Pilihan Paket Sesuai Kebutuhan Sekolah
          </h2>
          <p className="mx-auto mt-2 max-w-md text-xs text-muted-foreground">
            Buktikan kenyamanan platform Hadirin dengan garansi uji coba tanpa syarat.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {paket.map((p) => (
            <Card
              key={p.nama}
              className={`relative flex flex-col transition-all duration-200 ${
                p.unggulan
                  ? "border-navy-900 bg-white shadow-xl ring-2 ring-navy-900 md:-translate-y-3"
                  : "border-border bg-white shadow-xs hover:border-slate-300"
              }`}
            >
              {p.unggulan && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-navy-900 text-white shadow-sm">
                    Paling Direkomendasikan
                  </Badge>
                </div>
              )}

              <CardContent className="flex flex-1 flex-col p-6">
                <div>
                  <p className="font-display text-lg font-bold text-navy-950">{p.nama}</p>
                  <p className="mt-2 font-display text-3xl font-bold text-navy-950">
                    {p.harga}
                  </p>
                  <p className="text-xs text-muted-foreground">{p.satuan}</p>
                  <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                    {p.deskripsi}
                  </p>
                </div>

                <ul className="my-6 flex flex-1 flex-col gap-2.5 border-t border-border pt-5">
                  {p.fitur.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-xs text-navy-900">
                      <Check size={14} className="mt-0.5 shrink-0 text-navy-800" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full ${
                    p.unggulan
                      ? "bg-navy-900 text-white hover:bg-navy-800"
                      : "bg-navy-50 text-navy-900 hover:bg-navy-100"
                  }`}
                  asChild
                >
                  <Link href="/onboarding">Pilih Paket {p.nama}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-2xl px-5 pb-20">
        <h2 className="mb-6 text-center font-display text-2xl font-bold text-navy-950">
          Pertanyaan Umum
        </h2>
        <div className="space-y-3">
          {faq.map((item, i) => {
            const terbuka = faqTerbuka === i;
            return (
              <Card
                key={item.q}
                className="border-border bg-white shadow-xs overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setFaqTerbuka(terbuka ? null : i)}
                  className="flex w-full items-center justify-between p-4 text-left font-medium text-sm text-navy-950 hover:bg-slate-50 transition-colors"
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    size={16}
                    className={`shrink-0 text-muted-foreground transition-transform duration-200 ${
                      terbuka ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {terbuka && (
                  <div className="border-t border-border bg-slate-50/50 p-4 text-xs text-muted-foreground leading-relaxed">
                    {item.a}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </section>
    </>
  );
}
