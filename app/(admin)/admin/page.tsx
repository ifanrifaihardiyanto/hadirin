"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  CheckCircle2,
  X,
  BookOpen,
  ChevronRight,
  GraduationCap,
  School,
  BookOpenCheck,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  ArrowUpRight,
  Activity,
  RefreshCw,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api-client";

export default function AdminBerandaPage() {
  const { currentUser, tahunAjaranAktif, semesterAktif } = useStore();

  const [loading, setLoading] = useState(true);
  const [totalSiswa, setTotalSiswa] = useState(0);
  const [totalGuru, setTotalGuru] = useState(0);
  const [totalKelas, setTotalKelas] = useState(0);
  const [totalMapel, setTotalMapel] = useState(0);
  const [totalPemasukanSPP, setTotalPemasukanSPP] = useState(0);
  const [guruPresensiList, setGuruPresensiList] = useState<any[]>([]);
  const [bkAlertList, setBkAlertList] = useState<any[]>([]);

  const isTU = currentUser?.role === "tu";
  const isKepsek = currentUser?.role === "kepsek";
  const roleName = isTU ? "Tata Usaha" : isKepsek ? "Kepala Sekolah" : "Admin Sekolah";

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [resSiswa, resGuru, resKelas, resMapel, resSPP, resPresensiGuru, resBK] = await Promise.all([
        api.getSiswaList().catch(() => ({ data: [] })),
        api.getGuruList().catch(() => ({ data: [] })),
        api.getKelasList().catch(() => ({ data: [] })),
        api.getMapelList().catch(() => ({ data: [] })),
        api.getSPPList().catch(() => ({ data: [] })),
        api.getPresensiGuruToday().catch(() => ({ data: [] })),
        api.getKasusBKList().catch(() => ({ data: [] })),
      ]);

      if (resSiswa?.data) setTotalSiswa(resSiswa.data.length);
      if (resGuru?.data) setTotalGuru(resGuru.data.length);
      if (resKelas?.data) setTotalKelas(resKelas.data.length);
      if (resMapel?.data) setTotalMapel(resMapel.data.length);

      if (resSPP?.data) {
        const lunasSum = resSPP.data
          .filter((t: any) => t.status === "LUNAS")
          .reduce((acc: number, curr: any) => acc + Number(curr.nominal || 0), 0);
        setTotalPemasukanSPP(lunasSum);
      }

      if (resPresensiGuru?.data) {
        setGuruPresensiList(resPresensiGuru.data);
      }

      if (resBK?.data) {
        setBkAlertList(resBK.data.slice(0, 4));
      }
    } catch (err: any) {
      console.warn("Gagal memuat dashboard:", err?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Estimasi pengeluaran honor & operasional
  const totalPengeluaranHonor = totalPemasukanSPP > 0 ? Math.round(totalPemasukanSPP * 0.4) : 3000000;
  const saldoKasSekolah = totalPemasukanSPP - totalPengeluaranHonor;

  // Attendance stats today
  const totalStaffHadir = guruPresensiList.filter(
    (p: any) => p.status === "TEPAT_WAKTU" || p.status === "TERLAMBAT" || p.status === "HADIR"
  ).length;

  return (
    <div className="w-full space-y-6">
      {/* 1. WELCOME HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy-950 via-navy-900 to-navy-800 p-6 md:p-8 text-white shadow-xl">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 h-56 w-56 rounded-full bg-navy-600/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur-xs border border-white/15">
                {roleName}
              </span>
              <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-200 border border-blue-400/20">
                {tahunAjaranAktif} &bull; {semesterAktif}
              </span>
            </div>

            <h1 className="font-display text-2xl font-bold tracking-tight text-white md:text-3xl">
              Halo, {currentUser?.nama || "Administrator Sekolah"} 👋
            </h1>
            <p className="max-w-2xl text-xs sm:text-sm text-slate-300">
              Pantau ringkasan data sekolah: peserta didik, dewan guru, arus kas keuangan SPP, dan status presensi KBM secara real-time.
            </p>
          </div>

          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="self-start md:self-center flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white backdrop-blur-xs border border-white/20 transition-colors cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* 2. TOP 4 METRIC STATS CARDS */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-border bg-white shadow-2xs">
              <CardContent className="p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-10 rounded-2xl" />
                </div>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3.5 w-28" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
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
                    {totalSiswa}
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
                    {totalGuru}
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">Tenaga Pendidik (PTK)</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/kelas" className="group">
              <Card className="border-border bg-white shadow-2xs group-hover:border-navy-400 transition-all cursor-pointer">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Kelas Aktif</span>
                    <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-50 text-emerald-700 group-hover:scale-105 transition-transform">
                      <School size={20} />
                    </span>
                  </div>
                  <div className="mt-2 text-3xl font-bold font-mono text-navy-950">
                    {totalKelas}
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
                    {totalMapel}
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">Kurikulum Merdeka</p>
                </CardContent>
              </Card>
            </Link>
          </>
        )}
      </div>

      {/* 3. RINGKASAN KEUANGAN & PRESENSI HARI INI */}
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
                  Status arus kas dan realisasi pembayaran SPP sekolah
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
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Skeleton className="h-24 rounded-2xl" />
                <Skeleton className="h-24 rounded-2xl" />
                <Skeleton className="h-24 rounded-2xl" />
              </div>
            ) : (
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
                  <div className="mt-1 text-[10px] text-rose-600">Estimasi Beban Operasional</div>
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
            )}
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
                  Presensi PTK &amp; Kehadiran Sekolah
                </CardDescription>
              </div>
              <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-800 text-[10px] font-bold">
                KBM Aktif
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-5 pt-2">
            {loading ? (
              <div className="grid grid-cols-2 gap-2.5">
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-16 rounded-xl" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-100 text-emerald-700">
                    <CheckCircle2 size={16} />
                  </span>
                  <div>
                    <div className="text-[11px] text-slate-500">Guru Hadir</div>
                    <div className="font-mono font-bold text-base text-navy-950">{totalStaffHadir} PTK</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-100 text-amber-700">
                    <AlertTriangle size={16} />
                  </span>
                  <div>
                    <div className="text-[11px] text-slate-500">Izin / Sakit</div>
                    <div className="font-mono font-bold text-base text-navy-950">
                      {guruPresensiList.filter((p) => p.status === "IZIN" || p.status === "SAKIT").length} PTK
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-rose-100 text-rose-700">
                    <X size={16} />
                  </span>
                  <div>
                    <div className="text-[11px] text-slate-500">Total Rombel</div>
                    <div className="font-mono font-bold text-base text-navy-950">{totalKelas} Kelas</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-100 text-blue-700">
                    <Activity size={16} />
                  </span>
                  <div>
                    <div className="text-[11px] text-slate-500">Total Siswa</div>
                    <div className="font-mono font-bold text-base text-navy-950">{totalSiswa} Siswa</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 4. MONITORING OPERASIONAL */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Dewan Guru */}
        <Card className="border-border bg-white shadow-sm rounded-2xl">
          <CardHeader className="p-5 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="font-display text-base font-bold text-navy-950">
                Kehadiran Dewan Guru Hari Ini
              </CardTitle>
              <Link href="/admin/guru" className="text-xs font-semibold text-navy-900 hover:underline">
                Lihat Guru
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-1 space-y-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl">
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              ))
            ) : guruPresensiList.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                Belum ada data presensi guru masuk hari ini.
              </div>
            ) : (
              guruPresensiList.slice(0, 4).map((g: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between rounded-xl border border-slate-100 p-3 hover:bg-slate-50/70 transition-colors">
                  <div>
                    <div className="font-bold text-xs text-navy-950">{g.guru?.nama || g.nama || "Guru"}</div>
                    <div className="text-[11px] text-slate-500 font-mono">Masuk: {g.jam_masuk || "-"}</div>
                  </div>
                  <Badge variant={g.status === "TEPAT_WAKTU" ? "hadir" : "izin"} className="text-[10px]">
                    {g.status?.replace("_", " ")}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Kasus BK / Perlu Perhatian */}
        <Card className="border-border bg-white shadow-sm rounded-2xl">
          <CardHeader className="p-5 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="font-display text-base font-bold text-navy-950">
                Catatan Bimbingan Konseling (BK)
              </CardTitle>
              <Link href="/admin/bk" className="text-xs font-semibold text-navy-900 hover:underline">
                Buka BK
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-1 space-y-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl">
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              ))
            ) : bkAlertList.length === 0 ? (
              <div className="p-6 text-center text-xs text-emerald-600 bg-emerald-50/50 rounded-xl font-medium">
                ✓ Seluruh siswa dalam catatan kondusif dan disiplin.
              </div>
            ) : (
              bkAlertList.map((p: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between rounded-xl border border-slate-100 p-3 hover:bg-slate-50/70 transition-colors">
                  <div>
                    <div className="font-bold text-xs text-navy-950">{p.siswa?.nama || "Siswa"}</div>
                    <div className="text-[11px] text-slate-500">{p.masalah || "Catatan konseling"}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="alpha" className="text-[10px] font-bold">
                      {p.status || "Aktif"}
                    </Badge>
                    <Link href="/admin/bk" className="p-1 rounded-lg hover:bg-slate-200 text-slate-400">
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
