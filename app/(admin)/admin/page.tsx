"use client";

import Link from "next/link";
import {
  Users,
  CheckCircle2,
  X,
  BookOpen,
  FileCheck,
  ChevronRight,
  HeartHandshake,
  UserCheck,
  Banknote,
  Receipt,
  GraduationCap,
  School,
  BookOpenCheck,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  ArrowUpRight,
  CalendarDays,
  ShieldCheck,
  Activity,
} from "lucide-react";
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
import { cn } from "@/lib/utils";

export default function AdminBerandaPage() {
  const {
    daftarGuru,
    jadwal,
    absensiTersimpanHariIni,
    currentUser,
    daftarSiswaInduk,
    daftarMapel,
    daftarTagihanSPP,
    presensiGuruList,
    tahunAjaranAktif,
    semesterAktif,
  } = useStore();

  const isTU = currentUser?.role === "tu";
  const isKepsek = currentUser?.role === "kepsek";
  const roleName = isTU ? "Tata Usaha" : isKepsek ? "Kepala Sekolah" : "Admin Sekolah";

  // Financial Summary Calculation
  const totalPemasukanSPP = daftarTagihanSPP
    .filter((t) => t.status === "LUNAS")
    .reduce((acc, curr) => acc + curr.nominal, 0);

  // Estimasi pengeluaran honor & operasional
  const totalPengeluaranHonor = 3000000;
  const saldoKasSekolah = totalPemasukanSPP - totalPengeluaranHonor;

  // Attendance stats today
  const totalSiswaHadir = 18;
  const totalSiswaIzin = 2;
  const totalSiswaAlfa = 0;
  const totalStaffHadir = presensiGuruList.filter((p) => p.status === "TEPAT_WAKTU" || p.status === "TERLAMBAT").length;

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

  const perluPerhatian = [...rekapBulanIni]
    .filter((r) => r.alpha >= 2)
    .sort((a, b) => b.alpha - a.alpha);

  return (
    <div className="w-full space-y-6">
      {/* 1. WELCOME HERO BANNER (Standard SaaS EdTech) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy-950 via-navy-900 to-navy-800 p-6 md:p-8 text-white shadow-xl">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 h-56 w-56 rounded-full bg-navy-600/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur-xs border border-white/15">
              {roleName}
            </span>
            <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-200 border border-blue-400/20">
              {tahunAjaranAktif} &bull; {semesterAktif}
            </span>
          </div>

          <h1 className="font-display text-2xl font-bold tracking-tight text-white md:text-3xl">
            Halo, {currentUser?.nama || "Drs. Hendra Wijaya, M.Pd."} 👋
          </h1>
          <p className="max-w-2xl text-xs sm:text-sm text-slate-300">
            Pantau ringkasan data sekolah: peserta didik, dewan guru, arus kas keuangan SPP, dan status presensi KBM hari ini secara real-time.
          </p>
        </div>
      </div>

      {/* 2. TOP 4 METRIC STATS CARDS */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Link href="/admin/siswa" className="group">
          <Card className="border-border bg-white shadow-2xs group-hover:border-navy-400 transition-all cursor-pointer">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Total Siswa</span>
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-50 text-blue-700 group-hover:scale-105 transition-transform">
                  <GraduationCap size={20} />
                </span>
              </div>
              <div className="mt-2 text-3xl font-bold font-mono text-navy-950">
                {daftarSiswaInduk.length}
              </div>
              <p className="mt-1 text-[11px] text-emerald-600 font-medium">● 100% Terdaftar Aktif</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/guru" className="group">
          <Card className="border-border bg-white shadow-2xs group-hover:border-navy-400 transition-all cursor-pointer">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Total Guru</span>
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-purple-50 text-purple-700 group-hover:scale-105 transition-transform">
                  <Users size={20} />
                </span>
              </div>
              <div className="mt-2 text-3xl font-bold font-mono text-navy-950">
                {daftarGuru.length}
              </div>
              <p className="mt-1 text-[11px] text-slate-500">Tenaga Pendidik (PTK)</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/jadwal" className="group">
          <Card className="border-border bg-white shadow-2xs group-hover:border-navy-400 transition-all cursor-pointer">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Kelas Aktif</span>
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-50 text-emerald-700 group-hover:scale-105 transition-transform">
                  <School size={20} />
                </span>
              </div>
              <div className="mt-2 text-3xl font-bold font-mono text-navy-950">
                6
              </div>
              <p className="mt-1 text-[11px] text-slate-500">Rombongan Belajar</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/mapel" className="group">
          <Card className="border-border bg-white shadow-2xs group-hover:border-navy-400 transition-all cursor-pointer">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Mata Pelajaran</span>
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-50 text-amber-700 group-hover:scale-105 transition-transform">
                  <BookOpenCheck size={20} />
                </span>
              </div>
              <div className="mt-2 text-3xl font-bold font-mono text-navy-950">
                {daftarMapel.length}
              </div>
              <p className="mt-1 text-[11px] text-slate-500">Kurikulum Merdeka</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* 3. RINGKASAN KEUANGAN & PRESENSI HARI INI (Matches Reference Screenshot) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Ringkasan Keuangan Box */}
        <Card className="border-border bg-white shadow-md rounded-2xl lg:col-span-7">
          <CardHeader className="p-5 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-display text-base font-bold text-navy-950">
                  Ringkasan Keuangan
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Status arus kas dan realisasi keuangan sekolah saat ini
                </CardDescription>
              </div>
              <Link
                href="/admin/spp"
                className="text-xs font-semibold text-navy-900 hover:text-navy-700 flex items-center gap-1"
              >
                Detail SPP
                <ArrowUpRight size={13} />
              </Link>
            </div>
          </CardHeader>

          <CardContent className="p-5 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Pemasukan */}
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
                  <TrendingUp size={14} className="text-emerald-600" />
                  Pemasukan (SPP)
                </div>
                <div className="mt-2 text-lg sm:text-xl font-bold font-mono text-emerald-700">
                  Rp {totalPemasukanSPP.toLocaleString("id-ID")}
                </div>
                <div className="mt-1 text-[10px] text-emerald-600">Realisasi SPP Terbayar</div>
              </div>

              {/* Pengeluaran */}
              <div className="rounded-2xl border border-rose-100 bg-rose-50/70 p-4">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-800">
                  <TrendingDown size={14} className="text-rose-600" />
                  Pengeluaran
                </div>
                <div className="mt-2 text-lg sm:text-xl font-bold font-mono text-rose-700">
                  Rp {totalPengeluaranHonor.toLocaleString("id-ID")}
                </div>
                <div className="mt-1 text-[10px] text-rose-600">Honor &amp; Operasional</div>
              </div>

              {/* Saldo Kas */}
              <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-900">
                  <DollarSign size={14} className="text-blue-700" />
                  Saldo Kas
                </div>
                <div className="mt-2 text-lg sm:text-xl font-bold font-mono text-blue-800">
                  Rp {saldoKasSekolah.toLocaleString("id-ID")}
                </div>
                <div className="mt-1 text-[10px] text-blue-600">Kas Bersih Sekolah</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Presensi Hari Ini Box */}
        <Card className="border-border bg-white shadow-md rounded-2xl lg:col-span-5 flex flex-col justify-between">
          <CardHeader className="p-5 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-display text-base font-bold text-navy-950">
                  Presensi Hari Ini
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Hari {HARI_INI}, 23 Juli 2026
                </CardDescription>
              </div>
              <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-800 text-[10px] font-bold">
                KBM Berjalan
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-5 pt-2">
            <div className="grid grid-cols-2 gap-2.5">
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-100 text-emerald-700">
                  <CheckCircle2 size={16} />
                </span>
                <div>
                  <div className="text-[11px] text-slate-500">Siswa Hadir</div>
                  <div className="font-mono font-bold text-base text-navy-950">{totalSiswaHadir}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-100 text-amber-700">
                  <AlertTriangle size={16} />
                </span>
                <div>
                  <div className="text-[11px] text-slate-500">Sakit / Izin</div>
                  <div className="font-mono font-bold text-base text-navy-950">{totalSiswaIzin}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-rose-100 text-rose-700">
                  <X size={16} />
                </span>
                <div>
                  <div className="text-[11px] text-slate-500">Alfa</div>
                  <div className="font-mono font-bold text-base text-navy-950">{totalSiswaAlfa}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-100 text-blue-700">
                  <Activity size={16} />
                </span>
                <div>
                  <div className="text-[11px] text-slate-500">Staff &amp; PTK Hadir</div>
                  <div className="font-mono font-bold text-base text-navy-950">{totalStaffHadir}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. OPERATIONAL MONITORING (Kinerja Guru & Supervisi) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Guru Mengajar Hari Ini */}
        <Card className="border-border bg-white shadow-sm rounded-2xl">
          <CardHeader className="p-5 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="font-display text-base font-bold text-navy-950">
                Aktivitas Presensi Guru Hari Ini
              </CardTitle>
              <Badge variant="navy" className="text-[10px]">
                {guruSudahSelesai}/{statusGuruHariIni.length} Tuntas
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-1 space-y-3">
            {statusGuruHariIni.map((g) => (
              <div key={g.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-3 hover:bg-slate-50/70 transition-colors">
                <div>
                  <div className="font-bold text-xs text-navy-950">{g.nama}</div>
                  <div className="text-[11px] text-slate-500">{g.mapel.join(", ")}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={g.kelasSelesai === g.kelasHariIni ? "hadir" : "secondary"} className="text-[10px]">
                    {g.kelasSelesai}/{g.kelasHariIni} Selesai
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Perlu Perhatian / Alfa Siswa */}
        <Card className="border-border bg-white shadow-sm rounded-2xl">
          <CardHeader className="p-5 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="font-display text-base font-bold text-navy-950">
                Peringatan Disiplin Siswa (Alpha &ge; 2)
              </CardTitle>
              <Link href="/admin/bk" className="text-xs font-semibold text-navy-900 hover:underline">
                Buka BK
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-1 space-y-3">
            {perluPerhatian.slice(0, 4).map((p, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-xl border border-slate-100 p-3 hover:bg-slate-50/70 transition-colors">
                <div>
                  <div className="font-bold text-xs text-navy-950">{p.nama}</div>
                  <div className="text-[11px] text-slate-500">{p.kelas} &bull; NIS: {p.nis}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="alpha" className="text-[10px] font-bold">
                    {p.alpha}x Alpha
                  </Badge>
                  <Link href="/admin/bk" className="p-1 rounded-lg hover:bg-slate-200 text-slate-400">
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
