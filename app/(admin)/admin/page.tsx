"use client";

import Link from "next/link";
import { TriangleAlert, Users, CheckCircle2, BookOpen, FileCheck, ChevronRight, HeartHandshake } from "lucide-react";
import { useStore, HARI_INI } from "@/lib/store";
import {
  kelasSeluruhSekolah,
  rekapBulanIni,
  profilSekolah,
  profilKepsek,
} from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function AdminBerandaPage() {
  const { daftarGuru, jadwal, absensiTersimpanHariIni } = useStore();

  const statusGuruHariIni = daftarGuru
    .map((g) => {
      const kelasHariIni = jadwal.filter(
        (j) => j.guruId === g.id && j.hari === HARI_INI
      );
      const kelasSelesai = kelasHariIni.filter((j) =>
        absensiTersimpanHariIni.includes(j.id)
      ).length;
      return { ...g, kelasHariIni: kelasHariIni.length, kelasSelesai };
    })
    .filter((g) => g.kelasHariIni > 0);

  const guruSudahSelesai = statusGuruHariIni.filter(
    (g) => g.kelasSelesai === g.kelasHariIni
  ).length;

  const kehadiranRataRata = Math.round(
    kelasSeluruhSekolah.reduce((a, k) => a + k.rataKehadiran, 0) /
      kelasSeluruhSekolah.length
  );
  const perluPerhatian = [...rekapBulanIni]
    .filter((r) => r.alpha >= 2)
    .sort((a, b) => b.alpha - a.alpha);

  return (
    <div className="w-full space-y-6">
      {/* Page Title & Status */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-navy-950 md:text-3xl">
            Dashboard Utama Sekolah
          </h1>
          <p className="text-xs text-muted-foreground">
            {profilSekolah.nama} · Ringkasan aktivitas presensi hari {HARI_INI}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="navy" className="px-3 py-1 text-xs">
            Semester Ganjil 2026/2027
          </Badge>
        </div>
      </div>

      {/* 4 Metric Cards across full width */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none bg-navy-900 text-white shadow-sm">
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-navy-200">
              Rata Presensi Hari Ini
            </p>
            <div className="mt-2 flex items-baseline justify-between">
              <p className="font-display text-3xl font-bold tracking-tight">
                {kehadiranRataRata}%
              </p>
              <Badge variant="outline" className="border-white/20 bg-white/10 text-white text-[10px]">
                Normal
              </Badge>
            </div>
            <p className="mt-2 text-[11px] text-navy-200">
              Dihitung dari 6 kelas berjalan
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-white shadow-xs">
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Guru Selesai Presensi
            </p>
            <div className="mt-2 flex items-baseline justify-between">
              <p className="font-mono text-3xl font-bold text-navy-950">
                {guruSudahSelesai}
                <span className="text-lg text-slate-400">/{statusGuruHariIni.length}</span>
              </p>
              <Badge variant={guruSudahSelesai === statusGuruHariIni.length ? "hadir" : "secondary"} className="text-[10px]">
                {statusGuruHariIni.length - guruSudahSelesai} Berjalan
              </Badge>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Total guru bertugas hari {HARI_INI}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-white shadow-xs">
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Siswa Terdaftar
            </p>
            <div className="mt-2 flex items-baseline justify-between">
              <p className="font-mono text-3xl font-bold text-navy-950">
                {profilSekolah.totalSiswa}
              </p>
              <Badge variant="navy" className="text-[10px]">
                {kelasSeluruhSekolah.length} Kelas
              </Badge>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Aktif pada jenjang {profilSekolah.jenjang}
            </p>
          </CardContent>
        </Card>

        <Card className="border-rose-200 bg-rose-50/70 shadow-xs">
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-rose-700">
              Siswa Perlu Perhatian
            </p>
            <div className="mt-2 flex items-baseline justify-between">
              <p className="font-mono text-3xl font-bold text-rose-800">
                {perluPerhatian.length}
              </p>
              <Badge variant="alpha" className="text-[10px]">
                &gt;1x Alpha
              </Badge>
            </div>
            <p className="mt-2 text-[11px] text-rose-700">
              Memerlukan tindak lanjut wali kelas &amp; BK
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: 2 Columns on large screens */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Activity & Classes */}
        <div className="space-y-6 lg:col-span-2">
          {/* Guru Status */}
          <Card className="border-border bg-white shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border py-4">
              <div>
                <CardTitle className="text-base font-bold text-navy-950">
                  Aktivitas Presensi Guru Hari Ini
                </CardTitle>
                <CardDescription className="text-xs">
                  Progres pengambilan presensi kelas oleh dewan guru
                </CardDescription>
              </div>
              <Badge variant="navy" className="text-xs">
                {statusGuruHariIni.length} Guru Bertugas
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-y divide-border">
                {statusGuruHariIni.map((g) => {
                  const selesai = g.kelasSelesai === g.kelasHariIni;
                  return (
                    <li
                      key={g.id}
                      className="flex items-center justify-between p-4 hover:bg-slate-50/70 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-bold text-navy-950">{g.nama}</p>
                        <p className="text-xs text-muted-foreground">
                          {g.mapel.join(" · ")}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-slate-500">
                          {g.kelasSelesai}/{g.kelasHariIni} sesi
                        </span>
                        {selesai ? (
                          <Badge variant="hadir" className="gap-1 py-1">
                            <CheckCircle2 size={13} />
                            Selesai
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="py-1">
                            Sedang Berjalan
                          </Badge>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>

          {/* Kehadiran per kelas */}
          <Card className="border-border bg-white shadow-xs">
            <CardHeader className="border-b border-border py-4">
              <CardTitle className="text-base font-bold text-navy-950">
                Rata-rata Presensi per Kelas
              </CardTitle>
              <CardDescription className="text-xs">
                Distribusi persentase kehadiran kumulatif seluruh kelas
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {kelasSeluruhSekolah.map((k) => (
                  <div
                    key={k.kelas}
                    className="rounded-xl border border-border bg-slate-50/50 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-sm text-navy-950">{k.kelas}</p>
                      <span className="font-mono text-xs font-bold text-navy-700">
                        {k.rataKehadiran}%
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Users size={12} />
                      {k.jumlahSiswa} siswa
                    </div>
                    <div className="mt-2">
                      <Progress
                        value={k.rataKehadiran}
                        className="h-1.5"
                        indicatorClassName={
                          k.rataKehadiran >= 90 ? "bg-emerald-500" : "bg-amber-500"
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: At-Risk Students & SaaS Management */}
        <div className="space-y-6">
          {/* Quick Access SaaS Features */}
          <div className="space-y-3">
            <Link href="/admin/jurnal" className="group block">
              <Card className="border border-slate-200/90 bg-white p-4 shadow-xs transition-all hover:border-navy-400 hover:shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-800 group-hover:bg-navy-900 group-hover:text-white transition-colors">
                    <BookOpen size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-xs text-navy-950 group-hover:text-primary">
                        Supervisi Jurnal Mengajar
                      </h4>
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] py-0 px-1 font-medium">
                        Baru
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                      Audit agenda KBM &amp; cetak berkas supervisi
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-slate-400 group-hover:text-navy-950 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Card>
            </Link>

            <Link href="/admin/izin" className="group block">
              <Card className="border border-slate-200/90 bg-white p-4 shadow-xs transition-all hover:border-navy-400 hover:shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <FileCheck size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-xs text-navy-950 group-hover:text-primary">
                        Monitoring Izin Siswa
                      </h4>
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[9px] py-0 px-1 font-medium">
                        BK
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                      Arsip surat sakit dokter &amp; dispensasi dinas
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-slate-400 group-hover:text-navy-950 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Card>
            </Link>
            <Link href="/admin/bk" className="group block">
              <Card className="border border-slate-200/90 bg-white p-4 shadow-xs transition-all hover:border-navy-400 hover:shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-700 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <HeartHandshake size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-xs text-navy-950 group-hover:text-primary">
                        Bimbingan Konseling (BK)
                      </h4>
                      <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-[9px] py-0 px-1 font-medium">
                        Layanan
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                      Poin kedisiplinan &amp; surat panggilan ortu
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-slate-400 group-hover:text-navy-950 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Card>
            </Link>
          </div>

          <Card className="border-rose-200 bg-rose-50/50 shadow-xs">
            <CardHeader className="border-b border-rose-200/80 py-4">
              <div className="flex items-center gap-2">
                <TriangleAlert size={18} className="text-rose-700" />
                <CardTitle className="text-base font-bold text-rose-950">
                  Siswa Perlu Perhatian
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-rose-800/80">
                Siswa dengan akumulasi alpha lebih dari 1 kali
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <ul className="space-y-2.5">
                {perluPerhatian.map((r) => (
                  <li
                    key={r.nis}
                    className="flex items-center justify-between rounded-lg border border-rose-200/60 bg-white p-3 shadow-2xs text-xs"
                  >
                    <div>
                      <p className="font-bold text-rose-950">{r.nama}</p>
                      <p className="text-[11px] text-muted-foreground">{r.kelas}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="alpha" className="font-mono text-[11px]">
                        {r.alpha}x alpha
                      </Badge>
                      <Link
                        href="/admin/bk"
                        className="text-primary hover:underline font-semibold text-[11px]"
                      >
                        Bina BK →
                      </Link>
                    </div>
                  </li>
                ))}
                {perluPerhatian.length === 0 && (
                  <li className="text-xs text-muted-foreground text-center py-4">
                    Tidak ada siswa bermasalah absensi.
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
