"use client";

import { useState } from "react";
import {
  Heart,
  CheckCircle2,
  Clock,
  Calendar,
  AlertTriangle,
  User,
  GraduationCap,
  Phone,
  ShieldCheck,
  FileCheck,
  Award,
} from "lucide-react";
import { useStore, HARI_INI } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function PortalOrangTuaPage() {
  const { currentUser } = useStore();

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-1">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold tracking-tight text-navy-950 md:text-3xl">
              Portal Orang Tua &amp; Wali Murid
            </h1>
            <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-xs font-semibold">
              Parent Portal
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Pantauan kehadiran harian, ketertiban KBM, dan perkembangan karakter ananda di sekolah
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="navy" className="px-3 py-1 text-xs">
            Semester Ganjil 2026/2027
          </Badge>
        </div>
      </div>

      {/* Profil Ananda Card */}
      <Card className="border border-slate-200 bg-white shadow-xs">
        <div className="p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-navy-900 text-white flex items-center justify-center font-display font-bold text-xl shadow-xs">
              AF
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-navy-950">Ahmad Fadillah</h3>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-semibold">
                  Siswa Aktif
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                NIS: 24001 · Kelas X IPA 1 · SMA Negeri 3 Contoh Kota Bogor
              </p>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                Wali Kelas: <strong>Sari Wulandari, S.Pd</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
              onClick={() => alert("Menghubungi Ruang Konsultasi Wali Kelas: (0251) 8321000 ext. 104")}
            >
              <Phone size={13} className="text-primary" />
              Kontak Wali Kelas
            </Button>
          </div>
        </div>
      </Card>

      {/* Status Kehadiran Hari Ini (Live Notification Box) */}
      <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50/90 to-teal-50/60 shadow-xs">
        <div className="p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Pemberitahuan Kehadiran Hari Ini ({HARI_INI}, 24 Juli 2026)
              </span>
            </div>
            <h3 className="font-display text-xl font-bold text-emerald-950">
              ✓ Ananda Telah Hadir Tepat Waktu di Sekolah
            </h3>
            <p className="text-xs text-emerald-800 flex items-center gap-2">
              <Clock size={13} />
              Check-in tervalidasi pukul <strong>06.48 WIB</strong> di Gerbang Kampus Sekolah (Apel Pagi: Hadir).
            </p>
          </div>

          <div className="bg-white/80 border border-emerald-200 px-4 py-3 rounded-xl text-center shrink-0">
            <span className="text-[10px] text-slate-500 block uppercase font-medium">Status KBM Hari Ini</span>
            <span className="font-mono text-lg font-bold text-emerald-800">Normal (4 Sesi)</span>
          </div>
        </div>
      </Card>

      {/* Rekapitulasi Presensi Semester Ini */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-border bg-white shadow-xs">
          <div className="p-4 md:p-5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Total Hadir</span>
            <p className="font-mono text-2xl md:text-3xl font-bold text-emerald-700 mt-1">38 Hari</p>
            <p className="text-[11px] text-emerald-800 mt-1 font-semibold">95.2% Disiplin</p>
          </div>
        </Card>

        <Card className="border border-border bg-white shadow-xs">
          <div className="p-4 md:p-5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Sakit (Dokter)</span>
            <p className="font-mono text-2xl md:text-3xl font-bold text-amber-700 mt-1">1 Hari</p>
            <p className="text-[11px] text-slate-500 mt-1">Surat Dokter Diterima</p>
          </div>
        </Card>

        <Card className="border border-border bg-white shadow-xs">
          <div className="p-4 md:p-5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Izin Resmi</span>
            <p className="font-mono text-2xl md:text-3xl font-bold text-sky-700 mt-1">1 Hari</p>
            <p className="text-[11px] text-slate-500 mt-1">Dispensasi Lomba</p>
          </div>
        </Card>

        <Card className="border border-border bg-white shadow-xs">
          <div className="p-4 md:p-5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Alpha (Tanpa Ket.)</span>
            <p className="font-mono text-2xl md:text-3xl font-bold text-emerald-800 mt-1">0 Hari</p>
            <p className="text-[11px] text-emerald-700 mt-1 font-semibold">Bebas Pelanggaran</p>
          </div>
        </Card>
      </div>

      {/* Perkembangan Karakter & Catatan Prestasi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border border-border bg-white shadow-xs">
          <CardHeader className="border-b border-border py-4">
            <CardTitle className="text-base font-bold text-navy-950 flex items-center gap-2">
              <Award size={18} className="text-primary" />
              Catatan Karakter &amp; Prestasi Ananda
            </CardTitle>
            <CardDescription className="text-xs">
              Pencatatan resmi pembinaan kesiswaan sekolah
            </CardDescription>
          </CardHeader>
          <div className="p-5 space-y-3">
            <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/60 flex items-start gap-3">
              <CheckCircle2 size={18} className="text-emerald-700 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <h4 className="font-bold text-xs text-emerald-950">Apresiasi Prestasi Akademik (+25 Poin)</h4>
                <p className="text-xs text-emerald-800">
                  Meraih Juara 2 Olimpiade Sains Nasional (OSN) Tingkat Kota Bogor bidang Fisika.
                </p>
                <span className="text-[10px] text-emerald-700/80 block pt-1 font-mono">18 Juli 2026</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-600">
              <p className="font-semibold text-navy-950 mb-1">Catatan Sikap Wali Kelas:</p>
              <p className="italic">
                &quot;Ahmad menunjukkan komitmen belajar dan sopan santun yang sangat baik selama pembelajaran di kelas X IPA 1.&quot;
              </p>
            </div>
          </div>
        </Card>

        <Card className="border border-border bg-white shadow-xs">
          <CardHeader className="border-b border-border py-4">
            <CardTitle className="text-base font-bold text-navy-950 flex items-center gap-2">
              <Calendar size={18} className="text-primary" />
              Agenda Penting Sekolah Bulan Ini
            </CardTitle>
            <CardDescription className="text-xs">
              Jadwal kegiatan akademik &amp; evaluasi belajar
            </CardDescription>
          </CardHeader>
          <div className="p-5 space-y-3 text-xs">
            <div className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
              <div>
                <p className="font-bold text-navy-950">Pertemuan Wali Murid &amp; Komite Sekolah</p>
                <p className="text-[11px] text-slate-500">Sosialisasi Kurikulum Merdeka Fase E</p>
              </div>
              <Badge variant="outline" className="text-[11px] font-mono shrink-0">
                1 Agustus 2026
              </Badge>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
              <div>
                <p className="font-bold text-navy-950">Penilaian Tengah Semester (PTS) Ganjil</p>
                <p className="text-[11px] text-slate-500">Evaluasi Capaian Pembelajaran</p>
              </div>
              <Badge variant="outline" className="text-[11px] font-mono shrink-0">
                15 - 22 Sept 2026
              </Badge>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
              <div>
                <p className="font-bold text-navy-950">Pentas Seni &amp; Projek Penguatan Profil Pelajar Pancasila (P5)</p>
                <p className="text-[11px] text-slate-500">Gelar Karya Siswa Kelas X &amp; XI</p>
              </div>
              <Badge variant="outline" className="text-[11px] font-mono shrink-0">
                10 Oktober 2026
              </Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
