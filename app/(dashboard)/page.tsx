"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronRight,
  CheckCircle2,
  Clock,
  BookOpen,
  FileCheck,
  UserCheck,
  Megaphone,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api-client";

interface JadwalHariIniItem {
  id: number;
  kelas_id: number;
  kelas: string;
  mapel_id: number;
  mapel: string;
  kode_mapel: string;
  ruangan: string;
  jam_mulai: string;
  jam_selesai: string;
  jam: string;
  sudah_diambil: boolean;
  sesi_id: number | null;
}

export default function BerandaPage() {
  const [jadwalHariIni, setJadwalHariIni] = useState<JadwalHariIniItem[]>([]);
  const [guruNama, setGuruNama] = useState<string>("Guru");
  const [sekolahNama, setSekolahNama] = useState<string>("SMA Negeri 3 Contoh");
  const [hariIni, setHariIni] = useState<string>("Senin");
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [resJadwal, resMe] = await Promise.all([
        api.getJadwalHariIni().catch(() => ({ success: false, hari: "Senin", data: [] })),
        api.getMe().catch(() => null),
      ]);

      if (resMe?.data?.user) {
        setGuruNama(resMe.data.user.name || "Guru");
        setSekolahNama(resMe.data.user.sekolah?.nama || "Sekolah Hadirin");
      }

      if (resJadwal?.data) {
        setJadwalHariIni(resJadwal.data);
      }
      if (resJadwal?.hari) {
        setHariIni(resJadwal.hari);
      }
    } catch (err: any) {
      console.warn("Gagal memuat jadwal hari ini:", err?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const totalKelas = jadwalHariIni.length;
  const selesai = jadwalHariIni.filter((j) => j.sudah_diambil).length;
  const progres = totalKelas > 0 ? Math.round((selesai / totalKelas) * 100) : 0;

  return (
    <div className="w-full space-y-6">
      {/* Welcome & Banner */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-navy-950 md:text-3xl">
            Selamat Datang, {guruNama}
          </h1>
          <p className="text-xs text-muted-foreground">
            {sekolahNama} · Ringkasan jadwal presensi hari {hariIni}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <Badge variant="navy" className="px-3 py-1.5 text-xs">
            Hari {hariIni} Aktif
          </Badge>
        </div>
      </div>

      {/* Progres Presensi Card */}
      <Card className="border-none bg-gradient-to-r from-navy-950 via-navy-900 to-navy-800 text-white shadow-md">
        <CardContent className="p-6 md:p-7">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-4 w-32 bg-white/20" />
              <Skeleton className="h-10 w-48 bg-white/20" />
              <Skeleton className="h-3 w-64 bg-white/20" />
            </div>
          ) : (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Badge variant="outline" className="border-white/20 bg-white/10 text-white text-[11px] font-medium">
                  Progres Presensi Hari Ini
                </Badge>
                <div className="mt-2 flex items-baseline gap-3">
                  <p className="font-display text-4xl font-bold tracking-tight md:text-5xl">
                    {selesai}
                    <span className="text-2xl text-navy-300">/{totalKelas}</span>
                  </p>
                  <span className="text-sm font-medium text-navy-200">
                    kelas telah selesai diambil presensi
                  </span>
                </div>
                <p className="mt-1 text-xs text-navy-300">
                  {selesai === totalKelas && totalKelas > 0
                    ? "✓ Hebat! Seluruh kelas hari ini telah selesai dipresensi."
                    : `Masih ada ${totalKelas - selesai} kelas lagi yang perlu diambil presensi.`}
                </p>
              </div>

              <div className="flex flex-col items-end sm:w-64">
                <span className="font-mono text-xl font-bold text-navy-200 mb-1.5">
                  {progres}% Selesai
                </span>
                <Progress
                  value={progres}
                  className="h-2.5 w-full bg-white/20"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fitur Utama Quick Actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/presensi-guru" className="group block">
          <Card className="border border-slate-200/90 bg-white p-4 shadow-xs transition-all hover:border-navy-400 hover:shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-700 group-hover:bg-purple-700 group-hover:text-white transition-colors">
                <UserCheck size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-navy-950 group-hover:text-primary">
                    Presensi Mandiri Guru
                  </h3>
                  <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-[10px] py-0 px-1.5 font-medium">
                    PTK
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 truncate">
                  Check-in jam kedatangan &amp; permohonan dinas luar
                </p>
              </div>
              <ChevronRight size={18} className="text-slate-400 group-hover:text-navy-950 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Card>
        </Link>

        <Link href="/jurnal" className="group block">
          <Card className="border border-slate-200/90 bg-white p-4 shadow-xs transition-all hover:border-navy-400 hover:shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-800 group-hover:bg-navy-900 group-hover:text-white transition-colors">
                <BookOpen size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-navy-950 group-hover:text-primary">
                    Jurnal Mengajar Digital
                  </h3>
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] py-0 px-1.5 font-medium">
                    Kurikulum Merdeka
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 truncate">
                  Agenda KBM, capaian materi (TP/CP), &amp; cetak lembar supervisi
                </p>
              </div>
              <ChevronRight size={18} className="text-slate-400 group-hover:text-navy-950 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Card>
        </Link>

        <Link href="/izin" className="group block">
          <Card className="border border-slate-200/90 bg-white p-4 shadow-xs transition-all hover:border-navy-400 hover:shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <FileCheck size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-navy-950 group-hover:text-primary">
                    Izin &amp; Sakit Siswa
                  </h3>
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] py-0 px-1.5 font-medium">
                    Verifikasi
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 truncate">
                  Validasi surat dokter, izin ortu, &amp; dispensasi kegiatan dinas
                </p>
              </div>
              <ChevronRight size={18} className="text-slate-400 group-hover:text-navy-950 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Card>
        </Link>
      </div>

      {/* Jadwal Kelas Hari Ini */}
      <Card className="border-border bg-white shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border py-4">
          <div>
            <CardTitle className="text-base font-bold text-navy-950">
              Jadwal Mengajar Hari Ini
            </CardTitle>
            <CardDescription className="text-xs">
              Klik pada kelas untuk memulai atau memeriksa presensi siswa
            </CardDescription>
          </div>
          <Badge variant="navy" className="text-xs">
            {jadwalHariIni.length} Sesi Terjadwal
          </Badge>
        </CardHeader>
        <CardContent className="p-5">
          {loading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-border bg-slate-50/60 p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-xl" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </div>
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <div className="pt-2 border-t border-border flex justify-between">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-3.5 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : jadwalHariIni.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Tidak ada jadwal mengajar pada hari {hariIni}.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {jadwalHariIni.map((j, i) => (
                <Link key={j.id} href={`/absensi/${j.id}`} className="group block">
                  <div className="rounded-xl border border-border bg-slate-50/60 p-4 transition-all duration-200 hover:border-navy-400 hover:bg-white hover:shadow-xs group-hover:-translate-y-0.5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-navy-100 font-mono text-sm font-bold text-navy-900">
                          {i + 1}
                        </span>
                        <div>
                          <p className="font-bold text-sm text-navy-950 group-hover:text-navy-700">
                            {j.mapel}
                          </p>
                          <Badge variant="outline" className="mt-0.5 text-[11px] font-semibold text-navy-800">
                            {j.kelas}
                          </Badge>
                        </div>
                      </div>

                      {j.sudah_diambil ? (
                        <Badge variant="hadir" className="gap-1 py-0.5 text-[11px]">
                          <CheckCircle2 size={12} />
                          Selesai
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-0.5 py-0.5 text-[11px] text-navy-700">
                          Presensi
                          <ChevronRight size={12} />
                        </Badge>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-border/80 pt-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Clock size={12} className="text-slate-400" />
                        {j.jam_mulai?.substring(0, 5)}–{j.jam_selesai?.substring(0, 5)} WIB
                      </span>
                      <span className="font-medium text-navy-800 group-hover:underline">
                        Buka Kelas →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
