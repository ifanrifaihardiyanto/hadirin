"use client";

import { useState, useMemo } from "react";
import {
  GraduationCap,
  Search,
  Printer,
  FileCheck,
  CheckCircle2,
  Award,
  ChevronRight,
  School,
  X,
  FileText,
  UserCheck,
  BookOpen,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useStore, type SiswaInduk } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function AdminRaporPage() {
  const { daftarSiswaInduk, daftarMapel, daftarNilai, tahunAjaranAktif, semesterAktif } = useStore();

  const [search, setSearch] = useState("");
  const [filterKelas, setFilterKelas] = useState("X IPA 1");
  const [selectedSiswaRapor, setSelectedSiswaRapor] = useState<SiswaInduk | null>(null);

  const kelasOptions = ["X IPA 1", "X IPA 2", "XI IPA 1", "XI IPA 2", "XII IPA 1", "XII IPS 1"];

  // Filtered Students
  const filteredList = useMemo(() => {
    return daftarSiswaInduk.filter((s) => {
      const matchSearch =
        s.nama.toLowerCase().includes(search.toLowerCase()) ||
        s.nisn.includes(search);
      const matchKelas = filterKelas === "SEMUA" || s.kelas === filterKelas;
      return matchSearch && matchKelas;
    });
  }, [daftarSiswaInduk, search, filterKelas]);

  // Statistics
  const totalSiswa = filteredList.length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-navy-900 text-white shadow-xs">
              <FileCheck size={19} />
            </span>
            <h1 className="font-display text-2xl font-bold tracking-tight text-navy-950">
              E-Rapor Kurikulum Merdeka
            </h1>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Kompilasi capaian pembelajaran, deskripsi kompetensi, dan pencetakan rapor semester resmi ({tahunAjaranAktif} - {semesterAktif})
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => window.print()}
          className="gap-2 border-slate-200 bg-white text-xs hover:bg-slate-50 cursor-pointer shadow-2xs"
        >
          <Printer size={14} />
          Cetak Rekap Kolektif Rombel
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="border-border bg-white shadow-2xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Siswa Terdaftar</span>
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-navy-50 text-navy-900">
                <GraduationCap size={16} />
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-navy-950">{totalSiswa}</div>
            <div className="mt-1 text-[11px] text-emerald-600 font-medium">● Rombel {filterKelas}</div>
          </CardContent>
        </Card>

        <Card className="border-border bg-white shadow-2xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Rata-Rata Rombel</span>
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-blue-50 text-blue-700">
                <Award size={16} />
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-navy-950">85.4</div>
            <div className="mt-1 text-[11px] text-slate-500">Predikat Sangat Baik (A/B)</div>
          </CardContent>
        </Card>

        <Card className="border-border bg-white shadow-2xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Ketuntasan Semester</span>
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                <CheckCircle2 size={16} />
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-emerald-600">100%</div>
            <div className="mt-1 text-[11px] text-slate-500">Seluruh siswa memenuhi KKM</div>
          </CardContent>
        </Card>

        <Card className="border-border bg-white shadow-2xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Status Validasi</span>
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-purple-50 text-purple-700">
                <FileCheck size={16} />
              </span>
            </div>
            <div className="mt-2 text-lg font-bold font-mono text-purple-900">SIAP CETAK</div>
            <div className="mt-1 text-[11px] text-slate-500">Disupervisi Kepala Sekolah</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="border-border bg-white shadow-md rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-border bg-slate-50/50 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari siswa atau NISN..."
                className="h-9 pl-9 text-xs rounded-xl bg-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filterKelas}
                onChange={(e) => setFilterKelas(e.target.value)}
                className="h-9 rounded-xl border border-input bg-white px-3 text-xs text-slate-700 outline-none shadow-2xs font-semibold"
              >
                <option value="SEMUA">Semua Rombel</option>
                {kelasOptions.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-border font-semibold">
                <tr>
                  <th className="px-5 py-3">Nama Siswa &amp; NISN</th>
                  <th className="px-5 py-3">Rombel &amp; Wali Kelas</th>
                  <th className="px-5 py-3 text-center">Mapel Tuntas</th>
                  <th className="px-5 py-3 text-center">Rata-Rata Nilai</th>
                  <th className="px-5 py-3 text-center">Predikat</th>
                  <th className="px-5 py-3 text-center">Status</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400">
                      Tidak ada peserta didik terdaftar pada rombel ini.
                    </td>
                  </tr>
                ) : (
                  filteredList.map((s, idx) => {
                    const nilaiContoh = 82 + (idx % 12);
                    const pred = nilaiContoh >= 88 ? "A" : "B";
                    return (
                      <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="font-bold text-navy-950 text-sm">{s.nama}</div>
                          <div className="text-[11px] text-slate-400 font-mono">NISN: {s.nisn} &bull; NIS: {s.nis}</div>
                        </td>

                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-navy-900">{s.kelas}</div>
                          <div className="text-[11px] text-slate-500">Wali: {s.waliKelas}</div>
                        </td>

                        <td className="px-5 py-3.5 text-center font-mono">
                          <span className="font-bold text-navy-950">{daftarMapel.length}</span> / {daftarMapel.length} Mapel
                        </td>

                        <td className="px-5 py-3.5 text-center font-mono font-bold text-navy-950 text-sm">
                          {nilaiContoh}
                        </td>

                        <td className="px-5 py-3.5 text-center">
                          <Badge
                            variant="outline"
                            className={cn(
                              "font-bold font-mono text-xs",
                              pred === "A"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                : "bg-blue-50 text-blue-800 border-blue-300"
                            )}
                          >
                            {pred}
                          </Badge>
                        </td>

                        <td className="px-5 py-3.5 text-center">
                          <Badge variant="hadir" className="text-[10px]">
                            Tuntas Semester
                          </Badge>
                        </td>

                        <td className="px-5 py-3.5 text-right">
                          <Button
                            size="sm"
                            onClick={() => setSelectedSiswaRapor(s)}
                            className="h-8 px-3 bg-navy-900 hover:bg-navy-800 text-white rounded-xl text-xs gap-1.5 shadow-2xs cursor-pointer font-medium"
                          >
                            <Printer size={13} />
                            Cetak Rapor
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* MODAL CETAK LEMBAR RAPOR RESMI */}
      {selectedSiswaRapor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-3xl rounded-2xl bg-white p-6 sm:p-10 shadow-2xl my-8 space-y-6 border border-slate-200">
            {/* Header Dokumen Rapor */}
            <div className="text-center border-b-2 border-navy-950 pb-4">
              <h2 className="font-display text-xl font-bold uppercase tracking-wider text-navy-950">
                Laporan Hasil Belajar (Rapor Peserta Didik)
              </h2>
              <p className="text-sm font-bold text-navy-900">SMA NEGERI 3 CONTOH</p>
              <p className="text-xs text-slate-500">
                NPSN: 20219842 &bull; Kurikulum Merdeka &bull; Tahun Ajaran {tahunAjaranAktif} - Semester {semesterAktif}
              </p>
            </div>

            {/* Identitas Siswa */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="space-y-1">
                <div className="flex">
                  <span className="w-32 text-slate-500">Nama Siswa:</span>
                  <span className="font-bold text-navy-950">{selectedSiswaRapor.nama}</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-slate-500">NISN / NIS:</span>
                  <span className="font-mono text-slate-800">{selectedSiswaRapor.nisn} / {selectedSiswaRapor.nis}</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex">
                  <span className="w-32 text-slate-500">Kelas / Fase:</span>
                  <span className="font-semibold text-navy-950">{selectedSiswaRapor.kelas} (Fase E)</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-slate-500">Wali Kelas:</span>
                  <span className="text-slate-800">{selectedSiswaRapor.waliKelas}</span>
                </div>
              </div>
            </div>

            {/* Tabel Rincian Nilai Mapel */}
            <div className="overflow-hidden border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 font-semibold text-navy-950 border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2 w-10 text-center">No</th>
                    <th className="px-3 py-2">Mata Pelajaran</th>
                    <th className="px-3 py-2 text-center w-24">Nilai Akhir</th>
                    <th className="px-3 py-2 text-center w-20">Predikat</th>
                    <th className="px-3 py-2">Capaian Pembelajaran (Kurikulum Merdeka)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {daftarMapel.slice(0, 6).map((m, i) => (
                    <tr key={m.id}>
                      <td className="px-3 py-2 text-center font-mono text-slate-500">{i + 1}</td>
                      <td className="px-3 py-2 font-semibold text-navy-950">{m.nama}</td>
                      <td className="px-3 py-2 text-center font-mono font-bold text-navy-900">{86 + (i % 8)}</td>
                      <td className="px-3 py-2 text-center font-mono font-bold text-emerald-700">A</td>
                      <td className="px-3 py-2 text-[11px] text-slate-600">
                        Menunjukkan penguasaan sangat baik dalam seluruh kompetensi dan pemahaman konsep materi.
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Presensi Kehadiran Siswa */}
            <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/70 text-xs">
              <div className="font-bold text-navy-950 mb-2">Rekapitulasi Kehadiran Semester Ini:</div>
              <div className="grid grid-cols-4 gap-2 text-center font-mono">
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Sakit</span>
                  <span className="font-bold text-navy-950 text-sm">1 Hari</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Izin</span>
                  <span className="font-bold text-navy-950 text-sm">0 Hari</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Tanpa Keterangan</span>
                  <span className="font-bold text-emerald-600 text-sm">0 Hari</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Tingkat Hadir</span>
                  <span className="font-bold text-emerald-700 text-sm">98.5%</span>
                </div>
              </div>
            </div>

            {/* Tanda Tangan Resmi */}
            <div className="pt-4 grid grid-cols-3 text-center text-xs text-slate-700">
              <div>
                <p>Mengetahui,</p>
                <p>Orang Tua / Wali Murid</p>
                <div className="h-16" />
                <p className="font-semibold text-navy-950">({selectedSiswaRapor.namaWali || "..........................."})</p>
              </div>

              <div>
                <p>Bandung, 23 Juli 2026</p>
                <p>Wali Kelas</p>
                <div className="h-16" />
                <p className="font-semibold text-navy-950">{selectedSiswaRapor.waliKelas}</p>
              </div>

              <div>
                <p>Kepala Sekolah,</p>
                <p>SMA Negeri 3 Contoh</p>
                <div className="h-16" />
                <p className="font-semibold text-navy-950">Drs. Hendra Wijaya, M.Pd.</p>
                <p className="text-[10px] font-mono text-slate-400">NIP. 19680512 199403 1 002</p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedSiswaRapor(null)}
                className="rounded-xl text-xs"
              >
                Tutup
              </Button>
              <Button
                size="sm"
                onClick={() => window.print()}
                className="bg-navy-900 hover:bg-navy-800 text-white rounded-xl text-xs gap-1.5 shadow-sm"
              >
                <Printer size={14} />
                Cetak Lembar Rapor Resmi
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
