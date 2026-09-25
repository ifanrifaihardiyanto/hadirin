"use client";

import { Building2, ChevronRight, Clock, LogOut, Palette, Users, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { profilSekolah } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AdminPengaturanPage() {
  const router = useRouter();

  function handleLogout() {
    router.push("/login");
  }

  return (
    <div className="w-full space-y-6 max-w-5xl">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-navy-950 md:text-3xl">
          Pengaturan Sekolah &amp; Sistem
        </h1>
        <p className="text-xs text-muted-foreground">
          Konfigurasi profil institusi, jam pelajaran, dan akun administrator
        </p>
      </div>

      {/* School Card */}
      <Card className="border-none bg-gradient-to-r from-navy-950 via-navy-900 to-navy-800 text-white shadow-md">
        <CardContent className="flex items-center gap-5 p-6 md:p-7">
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-white/10 text-white border border-white/20">
            <Building2 size={28} />
          </span>
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <p className="font-display text-xl font-bold text-white md:text-2xl">
                {profilSekolah.nama}
              </p>
              <Badge variant="outline" className="border-white/20 bg-white/10 text-white text-[10px]">
                Akun Terverifikasi
              </Badge>
            </div>
            <p className="text-xs text-navy-200">
              NPSN: {profilSekolah.npsn} · Jenjang: {profilSekolah.jenjang}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Pengaturan Konfigurasi */}
        <section className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-navy-900/60">
            Konfigurasi Akademik
          </h2>
          <Card className="border-border bg-white shadow-xs">
            <CardContent className="divide-y divide-border p-0">
              <button
                type="button"
                className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-slate-50"
              >
                <span className="flex items-center gap-3 text-sm font-medium text-navy-950">
                  <Building2 size={16} className="text-navy-600" />
                  Profil &amp; Identitas Sekolah
                </span>
                <ChevronRight size={16} className="text-muted-foreground" />
              </button>

              <button
                type="button"
                className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-slate-50"
              >
                <span className="flex items-center gap-3 text-sm font-medium text-navy-950">
                  <Clock size={16} className="text-navy-600" />
                  Jam Pelajaran &amp; Durasi Sesi
                </span>
                <ChevronRight size={16} className="text-muted-foreground" />
              </button>

              <button
                type="button"
                className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-slate-50"
              >
                <span className="flex items-center gap-3 text-sm font-medium text-navy-950">
                  <Users size={16} className="text-navy-600" />
                  Kelola Hak Akses Guru &amp; Tenaga Kependidikan ({profilSekolah.totalGuru})
                </span>
                <ChevronRight size={16} className="text-muted-foreground" />
              </button>

              <button
                type="button"
                className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-slate-50"
              >
                <span className="flex items-center gap-3 text-sm font-medium text-navy-950">
                  <Palette size={16} className="text-navy-600" />
                  Tema &amp; Desain Antarmuka (Navy Classic)
                </span>
                <Badge variant="navy" className="text-[10px]">
                  Aktif
                </Badge>
              </button>
            </CardContent>
          </Card>
        </section>

        {/* Status Langganan */}
        <section className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-navy-900/60">
            Paket &amp; Langganan
          </h2>
          <Card className="border-border bg-white shadow-xs">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-navy-700" />
                  <span className="text-sm font-bold text-navy-950">Paket Sekolah Modern Pro</span>
                </div>
                <Badge variant="hadir">Aktif</Badge>
              </div>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Mencakup hingga {profilSekolah.totalSiswa} siswa dan {profilSekolah.totalGuru} dewan guru aktif. Seluruh fitur sinkronisasi, cetak laporan Excel &amp; PDF, serta notifikasi presensi aktif penuh.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>

      <div>
        <Button
          variant="outline"
          onClick={handleLogout}
          className="gap-2 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
        >
          <LogOut size={16} />
          Keluar dari Sesi Admin
        </Button>
      </div>
    </div>
  );
}
