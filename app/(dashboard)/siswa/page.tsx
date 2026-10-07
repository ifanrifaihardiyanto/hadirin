"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  BookOpen,
  Award,
  FileText,
  User,
  LogOut,
  MapPin,
  Check,
  Megaphone,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  School
} from "lucide-react";
import { useStore, HARI_INI } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";

export default function PortalSiswaPage() {
  const { currentUser } = useStore();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pengumumanList, setPengumumanList] = useState<any[]>([]);
  const [jadwalList, setJadwalList] = useState<any[]>([]);
  const [prestasiBK, setPrestasiBK] = useState<any[]>([]);
  const [presensiStats, setPresensiStats] = useState({
    hadir: 38,
    sakit: 1,
    izin: 1,
    alpha: 0,
    persentase: 95.2,
  });

  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const [pengumumanRes, jadwalRes, bkRes] = await Promise.allSettled([
        api.getPengumumanList(),
        api.getJadwalList(),
        api.getKasusBKList(),
      ]);

      if (pengumumanRes.status === "fulfilled" && pengumumanRes.value?.data) {
        const raw = Array.isArray(pengumumanRes.value.data) ? pengumumanRes.value.data : [];
        setPengumumanList(
          raw.filter((p: any) => p.status === "DITERBITKAN" && (!p.sasaran || p.sasaran === "SEMUA" || p.sasaran === "SISWA"))
        );
      }

      if (jadwalRes.status === "fulfilled" && jadwalRes.value?.data) {
        const rawJadwal = Array.isArray(jadwalRes.value.data) ? jadwalRes.value.data : [];
        // Filter jadwal hari ini jika cocok atau gunakan jadwal aktif
        const hariIniList = rawJadwal.filter((j: any) => !j.hari || j.hari === HARI_INI);
        setJadwalList(hariIniList.length > 0 ? hariIniList : rawJadwal.slice(0, 4));
      }

      if (bkRes.status === "fulfilled" && bkRes.value?.data) {
        const rawBK = Array.isArray(bkRes.value.data) ? bkRes.value.data : [];
        setPrestasiBK(rawBK);
      }
    } catch (err) {
      console.error("Gagal memuat portal siswa:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Data default jika jadwal di DB belum terisi
  const jadwalTampil = jadwalList.length > 0 ? jadwalList.map((item, idx) => ({
    jam: item.jamMulai && item.jamSelesai ? `${item.jamMulai} - ${item.jamSelesai}` : `0${7 + idx * 2}.00 - 0${8 + idx * 2}.30`,
    mapel: item.mapel?.nama || item.mataPelajaran || item.mapel || "Matematika",
    guru: item.guru?.nama || item.guruNama || "Dewan Guru",
    ruang: item.ruangan || item.kelas?.nama || "Ruang Kelas",
    status: idx === 0 ? "SELESAI" : idx === 1 ? "BERLANGSUNG" : "AKAN_DATANG",
  })) : [
    { jam: "07.00 - 08.30", mapel: "Matematika Peminatan", guru: "Sari Wulandari, S.Pd", ruang: "Ruang X IPA 1", status: "SELESAI" },
    { jam: "08.30 - 10.00", mapel: "Fisika", guru: "Budi Santoso, S.Pd", ruang: "Lab Fisika", status: "SELESAI" },
    { jam: "10.15 - 11.45", mapel: "Bahasa Inggris", guru: "Rina Marlina, M.Pd", ruang: "Ruang X IPA 1", status: "BERLANGSUNG" },
    { jam: "12.30 - 14.00", mapel: "Informatika", guru: "Hendra Setiawan, S.Kom", ruang: "Lab Komputer 2", status: "AKAN_DATANG" },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-1">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold tracking-tight text-navy-950 md:text-3xl">
              Portal Siswa
            </h1>
            <Badge className="bg-sky-50 text-sky-800 border-sky-200 text-xs font-semibold">
              Peserta Didik Aktif
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {currentUser?.nama || "Ahmad Fadillah"} · {currentUser?.jabatan || "Kelas X IPA 1 (NIS 24001)"} · {currentUser?.sekolah || "SMA Negeri 3 Unggulan"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadData(true)}
            disabled={refreshing || loading}
            className="text-xs h-9 gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin text-navy-600" : ""} />
            <span>Muat Ulang</span>
          </Button>

          <Badge variant="navy" className="px-3 py-1.5 text-xs h-9 flex items-center gap-1.5">
            <Calendar size={13} />
            Hari {HARI_INI}, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
          </Badge>
        </div>
      </div>

      {/* Announcement Banner for Students */}
      {loading ? (
        <div className="rounded-2xl border border-sky-200 bg-sky-50/60 p-4 animate-pulse space-y-2">
          <div className="h-4 w-40 bg-sky-200 rounded"></div>
          <div className="h-5 w-72 bg-sky-200 rounded"></div>
          <div className="h-3.5 w-full bg-sky-100 rounded"></div>
        </div>
      ) : pengumumanList.length > 0 ? (
        <div className="rounded-2xl border border-sky-200 bg-sky-50/90 p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Megaphone size={16} className="text-sky-800 shrink-0" />
              <span className="text-xs font-bold text-sky-950 uppercase tracking-wide">
                Pengumuman Sekolah ({pengumumanList.length})
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded">
              {pengumumanList[0].kategori || "INFORMASI"}
            </span>
          </div>
          <div className="space-y-1 text-xs text-sky-950">
            <p className="font-bold text-sm">{pengumumanList[0].judul}</p>
            <p className="text-slate-700 leading-relaxed line-clamp-2">{pengumumanList[0].konten}</p>
          </div>
        </div>
      ) : null}

      {/* Status Presensi Hari Ini Banner */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs animate-pulse flex items-center justify-between">
          <div className="space-y-2.5">
            <div className="h-4 w-32 bg-slate-200 rounded"></div>
            <div className="h-7 w-80 bg-slate-200 rounded"></div>
            <div className="h-3 w-48 bg-slate-100 rounded"></div>
          </div>
          <div className="h-16 w-28 bg-slate-200 rounded-xl"></div>
        </div>
      ) : (
        <Card className="border-none bg-gradient-to-r from-navy-950 via-navy-900 to-navy-800 text-white shadow-md">
          <div className="p-6 md:p-7 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 text-[11px] font-semibold">
                Status Presensi Hari Ini
              </Badge>
              <h3 className="font-display text-2xl md:text-3xl font-bold text-white tracking-tight">
                Tercatat Hadir di Sekolah (Tepat Waktu)
              </h3>
              <p className="text-xs text-navy-200 flex items-center gap-2">
                <Clock size={14} className="text-emerald-400" />
                Waktu Check-In: <strong>06.48 WIB</strong> · Lokasi: Gerbang Depan {currentUser?.sekolah || "Sekolah"}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-white/10 backdrop-blur-xs px-4 py-3 rounded-xl border border-white/15 text-center">
                <span className="text-[10px] text-navy-300 uppercase tracking-wider block font-medium">Persentase Hadir</span>
                <span className="font-mono text-2xl font-black text-emerald-400">{presensiStats.persentase}%</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 4 KPI Ringkasan Semester */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <div key={`skel-kpi-${idx}`} className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs animate-pulse space-y-2">
              <div className="h-3 w-20 bg-slate-200 rounded"></div>
              <div className="h-7 w-16 bg-slate-200 rounded"></div>
              <div className="h-2.5 w-24 bg-slate-100 rounded"></div>
            </div>
          ))
        ) : (
          <>
            <Card className="border border-border bg-white shadow-xs">
              <div className="p-4 md:p-5">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Hadir KBM</span>
                <p className="font-mono text-2xl md:text-3xl font-bold text-navy-950 mt-1">
                  {presensiStats.hadir} <span className="text-xs font-normal text-slate-400">Hari</span>
                </p>
                <p className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1 font-medium">
                  <CheckCircle2 size={12} /> Disiplin Sangat Baik
                </p>
              </div>
            </Card>

            <Card className="border border-border bg-white shadow-xs">
              <div className="p-4 md:p-5">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Sakit (Dokter)</span>
                <p className="font-mono text-2xl md:text-3xl font-bold text-amber-700 mt-1">
                  {presensiStats.sakit} <span className="text-xs font-normal text-slate-400">Hari</span>
                </p>
                <p className="text-[11px] text-slate-500 mt-1">Surat Dokter Valid</p>
              </div>
            </Card>

            <Card className="border border-border bg-white shadow-xs">
              <div className="p-4 md:p-5">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Izin Resmi</span>
                <p className="font-mono text-2xl md:text-3xl font-bold text-sky-700 mt-1">
                  {presensiStats.izin} <span className="text-xs font-normal text-slate-400">Hari</span>
                </p>
                <p className="text-[11px] text-slate-500 mt-1">Dispensasi Kegiatan</p>
              </div>
            </Card>

            <Card className="border border-border bg-white shadow-xs">
              <div className="p-4 md:p-5">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Alpha (Tanpa Ket.)</span>
                <p className="font-mono text-2xl md:text-3xl font-bold text-emerald-800 mt-1">
                  {presensiStats.alpha} <span className="text-xs font-normal text-slate-400">Hari</span>
                </p>
                <p className="text-[11px] text-emerald-700 mt-1 font-semibold">Bebas Pelanggaran</p>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Main Grid: Jadwal KBM Hari Ini & Rekam Prestasi Siswa */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Jadwal Pelajaran Hari Ini */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border border-border bg-white shadow-xs">
            <CardHeader className="border-b border-border py-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-navy-950 flex items-center gap-2">
                    <BookOpen size={18} className="text-primary" />
                    Jadwal Belajar Hari Ini ({HARI_INI})
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Rangkaian jam pelajaran dan guru pengajar aktif
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs">
                  {jadwalTampil.length} Sesi KBM
                </Badge>
              </div>
            </CardHeader>
            <div className="p-0">
              <div className="divide-y divide-border">
                {loading ? (
                  Array.from({ length: 4 }).map((_, idx) => (
                    <div key={`skel-j-${idx}`} className="p-4 flex items-center justify-between animate-pulse">
                      <div className="space-y-1.5">
                        <div className="h-3 w-28 bg-slate-200 rounded"></div>
                        <div className="h-4 w-44 bg-slate-200 rounded"></div>
                        <div className="h-3 w-32 bg-slate-100 rounded"></div>
                      </div>
                      <div className="h-6 w-16 bg-slate-200 rounded"></div>
                    </div>
                  ))
                ) : (
                  jadwalTampil.map((item, idx) => (
                    <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50/70 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-slate-500">{item.jam}</span>
                          <span className="text-slate-300">·</span>
                          <span className="text-xs font-medium text-slate-600">{item.ruang}</span>
                        </div>
                        <h4 className="font-bold text-sm text-navy-950">{item.mapel}</h4>
                        <p className="text-xs text-muted-foreground">{item.guru}</p>
                      </div>

                      <div>
                        {item.status === "SELESAI" && (
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-semibold gap-1">
                            <Check size={12} /> Selesai
                          </Badge>
                        )}
                        {item.status === "BERLANGSUNG" && (
                          <Badge className="bg-amber-50 text-amber-800 border-amber-300 text-xs font-semibold animate-pulse">
                            Sedang Belajar
                          </Badge>
                        )}
                        {item.status === "AKAN_DATANG" && (
                          <Badge variant="outline" className="text-slate-600 text-xs font-medium">
                            Berikutnya
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Poin Kedisiplinan & Prestasi BK */}
        <div className="space-y-4">
          <Card className="border border-border bg-white shadow-xs">
            <CardHeader className="border-b border-border py-4">
              <CardTitle className="text-base font-bold text-navy-950 flex items-center gap-2">
                <Award size={18} className="text-primary" />
                Catatan Karakter &amp; Prestasi
              </CardTitle>
              <CardDescription className="text-xs">
                Poin pembinaan kesiswaan &amp; Bimbingan Konseling
              </CardDescription>
            </CardHeader>
            <div className="p-5 space-y-4">
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 text-center space-y-1">
                <span className="text-xs font-semibold text-emerald-800 block">Total Poin Positif (Prestasi):</span>
                <span className="font-mono text-3xl font-black text-emerald-900">+25 Poin</span>
                <p className="text-[11px] text-emerald-700">Status Kedisiplinan: <strong>Teladan / Sangat Baik</strong></p>
              </div>

              <div className="space-y-2 text-xs">
                <p className="font-bold text-slate-700">Riwayat Catatan:</p>
                {prestasiBK.length > 0 ? (
                  prestasiBK.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                      <div className="flex items-center justify-between font-semibold">
                        <span className="text-navy-950">{item.kategori || item.judul || "Prestasi Siswa"}</span>
                        <span className="text-emerald-700 font-mono">+{item.poin || 10} Poin</span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{item.deskripsi || "Kategori Prestasi Akademik"}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-navy-950">Juara 2 OSN Tingkat Kota</span>
                      <span className="text-emerald-700 font-mono">+25 Poin</span>
                    </div>
                    <p className="text-[11px] text-slate-500">Kategori Prestasi Akademik · 18 Juli 2026</p>
                  </div>
                )}
              </div>

              <div className="border-t pt-3">
                <p className="text-[11px] text-slate-400 text-center">
                  Data tersinkronisasi langsung dengan Guru Wali Kelas &amp; Koordinator BK
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
