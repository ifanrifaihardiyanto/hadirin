"use client";

import { useState } from "react";
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
} from "lucide-react";
import { useStore, HARI_INI } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function PortalSiswaPage() {
  const { currentUser, logout } = useStore();

  const jadwalSiswaHariIni = [
    { jam: "07.00 - 08.30", mapel: "Matematika Peminatan", guru: "Sari Wulandari, S.Pd", ruang: "Ruang X IPA 1", status: "SELESAI" },
    { jam: "08.30 - 10.00", mapel: "Fisika", guru: "Budi Santoso, S.Pd", ruang: "Lab Fisika", status: "SELESAI" },
    { jam: "10.15 - 11.45", mapel: "Bahasa Inggris", guru: "Rina Marlina, M.Pd", ruang: "Ruang X IPA 1", status: "BERLANGSUNG" },
    { jam: "12.30 - 14.00", mapel: "Informatika", guru: "Hendra Setiawan, S.Kom", ruang: "Lab Komputer 2", status: "AKAN_DATANG" },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-1">
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
            {currentUser?.nama || "Ahmad Fadillah"} · {currentUser?.jabatan || "Kelas X IPA 1 (NIS 24001)"} · {currentUser?.sekolah || "SMA Negeri 3 Contoh"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="navy" className="px-3 py-1 text-xs">
            Hari {HARI_INI}, 24 Juli 2026
          </Badge>
        </div>
      </div>

      {/* Status Presensi Hari Ini Banner */}
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
              Waktu Check-In: <strong>06.48 WIB</strong> · Lokasi: Gerbang Depan SMA Negeri 3 Contoh
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-xs px-4 py-3 rounded-xl border border-white/15 text-center">
              <span className="text-[10px] text-navy-300 uppercase tracking-wider block font-medium">Persentase Hadir</span>
              <span className="font-mono text-2xl font-black text-emerald-400">95.2%</span>
            </div>
          </div>
        </div>
      </Card>

      {/* 4 KPI Ringkasan Semester */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-border bg-white shadow-xs">
          <div className="p-4 md:p-5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Hadir KBM</span>
            <p className="font-mono text-2xl md:text-3xl font-bold text-navy-950 mt-1">
              38 <span className="text-xs font-normal text-slate-400">Hari</span>
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
              1 <span className="text-xs font-normal text-slate-400">Hari</span>
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Surat Dokter Valid</p>
          </div>
        </Card>

        <Card className="border border-border bg-white shadow-xs">
          <div className="p-4 md:p-5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Izin Resmi</span>
            <p className="font-mono text-2xl md:text-3xl font-bold text-sky-700 mt-1">
              1 <span className="text-xs font-normal text-slate-400">Hari</span>
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Dispensasi Lomba</p>
          </div>
        </Card>

        <Card className="border border-border bg-white shadow-xs">
          <div className="p-4 md:p-5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Alpha (Tanpa Ket.)</span>
            <p className="font-mono text-2xl md:text-3xl font-bold text-emerald-800 mt-1">
              0 <span className="text-xs font-normal text-slate-400">Hari</span>
            </p>
            <p className="text-[11px] text-emerald-700 mt-1 font-semibold">Bebas Pelanggaran</p>
          </div>
        </Card>
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
                  4 Sesi KBM
                </Badge>
              </div>
            </CardHeader>
            <div className="p-0">
              <div className="divide-y divide-border">
                {jadwalSiswaHariIni.map((item, idx) => (
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
                ))}
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
                <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-navy-950">Juara 2 OSN Tingkat Kota</span>
                    <span className="text-emerald-700 font-mono">+25 Poin</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Kategori Prestasi Akademik · 18 Juli 2026</p>
                </div>
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
