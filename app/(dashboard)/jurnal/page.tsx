"use client";

import { useState } from "react";
import {
  BookOpen,
  Calendar,
  Clock,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  Printer,
  X,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { useStore, type Ketercapaian, type JurnalEntry } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const KETERCAPAIAN_BADGE: Record<
  Ketercapaian,
  { label: string; className: string; icon: typeof CheckCircle2 }
> = {
  TERCAPAI: {
    label: "Target Tercapai",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
  },
  PENGUATAN: {
    label: "Perlu Penguatan / Remidial",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    icon: AlertCircle,
  },
  REMEDIAL: {
    label: "Belum Tercapai (Remedial)",
    className: "bg-rose-50 text-rose-700 border-rose-200",
    icon: AlertCircle,
  },
};

export default function JurnalMengajarPage() {
  const { jurnalList, currentUser } = useStore();
  const [search, setSearch] = useState("");
  const [filterKetercapaian, setFilterKetercapaian] = useState<string>("ALL");
  const [selectedJurnal, setSelectedJurnal] = useState<JurnalEntry | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Filter journals for current teacher if role is guru
  const teacherJournals = jurnalList.filter((j) => {
    if (currentUser?.role === "guru") {
      return j.guruId === currentUser.id;
    }
    return true;
  });

  const filtered = teacherJournals.filter((j) => {
    const matchSearch =
      j.materiPokok.toLowerCase().includes(search.toLowerCase()) ||
      j.kelas.toLowerCase().includes(search.toLowerCase()) ||
      j.mapel.toLowerCase().includes(search.toLowerCase()) ||
      j.tanggal.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      filterKetercapaian === "ALL" || j.ketercapaian === filterKetercapaian;
    return matchSearch && matchStatus;
  });

  const totalSesi = teacherJournals.length;
  const tercapaiCount = teacherJournals.filter(
    (j) => j.ketercapaian === "TERCAPAI"
  ).length;
  const penguatanCount = teacherJournals.filter(
    (j) => j.ketercapaian === "PENGUATAN"
  ).length;

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold tracking-tight text-navy-950 md:text-3xl">
              Jurnal Mengajar Digital
            </h1>
            <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-medium">
              Kurikulum Merdeka
            </Badge>
          </div>
          <p className="text-sm text-slate-500">
            Agenda pembelajaran kelas, ketercapaian capaian pembelajaran (CP), dan arsip supervisi resmi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsPrintModalOpen(true)}
            variant="outline"
            className="gap-2 border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
          >
            <Printer className="h-4 w-4 text-slate-500" />
            Cetak Dokumen Supervisi
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-slate-200/80 bg-white shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Pertemuan
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-50 text-navy-700">
              <BookOpen className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="font-display text-3xl font-bold tracking-tight text-navy-950">
              {totalSesi}
            </div>
            <p className="mt-1 text-xs text-slate-500">Sesi KBM terdokumentasi</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Target Tercapai
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="font-display text-3xl font-bold tracking-tight text-emerald-700">
              {tercapaiCount}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {totalSesi > 0
                ? `${Math.round((tercapaiCount / totalSesi) * 100)}% dari total materi`
                : "Belum ada sesi"}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Perlu Penguatan
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <AlertCircle className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="font-display text-3xl font-bold tracking-tight text-amber-700">
              {penguatanCount}
            </div>
            <p className="mt-1 text-xs text-slate-500">Materi terjadwal tindak lanjut</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Beban Mengajar
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <GraduationCap className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="font-display text-3xl font-bold tracking-tight text-navy-950">
              24 <span className="text-base font-medium text-slate-500">JP/mg</span>
            </div>
            <p className="mt-1 text-xs text-emerald-600 font-medium">
              ✓ Memenuhi syarat sertifikasi
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <Card className="border border-slate-200/80 bg-white shadow-xs">
        <CardContent className="p-5 pt-5 sm:p-6 sm:pt-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari materi pokok, topik, tanggal, atau kelas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
                Filter Target:
              </span>
              {(["ALL", "TERCAPAI", "PENGUATAN", "REMEDIAL"] as const).map(
                (status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setFilterKetercapaian(status)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                      filterKetercapaian === status
                        ? "bg-navy-900 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {status === "ALL"
                      ? "Semua"
                      : status === "TERCAPAI"
                      ? "Tercapai"
                      : status === "PENGUATAN"
                      ? "Penguatan"
                      : "Belum"}
                  </button>
                )
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Journal Entry Timeline Cards */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <Card className="border border-slate-200/80 bg-white shadow-xs p-10 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-3 text-base font-semibold text-slate-800">
              Tidak ada jurnal mengajar ditemukan
            </h3>
            <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
              Jurnal mengajar otomatis tercatat saat Anda mengisi absensi kelas di menu Jadwal Mengajar.
            </p>
          </Card>
        ) : (
          filtered.map((item) => {
            const badgeCfg = KETERCAPAIAN_BADGE[item.ketercapaian];
            const StatusIcon = badgeCfg.icon;

            return (
              <Card
                key={item.id}
                className="border border-slate-200/80 bg-white shadow-xs hover:border-primary/40 transition-colors"
              >
                <CardContent className="p-5 pt-5 sm:p-6 sm:pt-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3 flex-1">
                      {/* Top Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className="bg-navy-100 text-navy-800 font-bold border-navy-200">
                          {item.kelas}
                        </Badge>
                        <Badge variant="outline" className="border-slate-300 text-slate-700 font-medium">
                          {item.mapel}
                        </Badge>
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Calendar className="h-3.5 w-3.5" />
                          {item.tanggal}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Clock className="h-3.5 w-3.5" />
                          {item.jamMulai} - {item.jamSelesai}
                        </span>
                        <div
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeCfg.className}`}
                        >
                          <StatusIcon className="h-3.5 w-3.5" />
                          {badgeCfg.label}
                        </div>
                      </div>

                      {/* Materi & Capaian */}
                      <div>
                        <h3 className="text-base font-bold text-navy-950">
                          {item.materiPokok}
                        </h3>
                        <p className="mt-1 text-xs text-slate-600">
                          <span className="font-semibold text-slate-700">Tujuan Pembelajaran (TP): </span>
                          {item.tujuanPembelajaran}
                        </p>
                      </div>

                      {/* Catatan Guru / Refleksi */}
                      {item.catatanKejadian && (
                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200/60 text-xs text-slate-600">
                          <span className="font-semibold text-slate-700 block mb-0.5">
                            Catatan KBM &amp; Siswa:
                          </span>
                          {item.catatanKejadian}
                        </div>
                      )}
                    </div>

                    {/* Right side: Kehadiran Breakdown & Actions */}
                    <div className="flex lg:flex-col items-center lg:items-end justify-between gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                      <div className="text-right">
                        <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">
                          Rekap Presensi
                        </span>
                        <div className="flex items-center gap-1.5 mt-1 text-xs font-semibold">
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {item.hadir} Hadir
                          </span>
                          {(item.sakit > 0 || item.izin > 0 || item.alpha > 0) && (
                            <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              {item.sakit + item.izin + item.alpha} Absen
                            </span>
                          )}
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedJurnal(item)}
                        className="text-primary hover:text-primary hover:bg-primary/5 text-xs font-medium"
                      >
                        Detail Jurnal →
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Modal Detail Jurnal */}
      {selectedJurnal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="space-y-0.5">
                <h3 className="font-display font-bold text-navy-950 text-lg">
                  Detail Jurnal Pembelajaran
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedJurnal.kelas} • {selectedJurnal.mapel}
                </p>
              </div>
              <button
                onClick={() => setSelectedJurnal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200/60">
                <div>
                  <span className="text-slate-500 block">Guru Pengajar</span>
                  <span className="font-semibold text-navy-950">{selectedJurnal.guruNama}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Waktu Pelaksanaan</span>
                  <span className="font-semibold text-navy-950">
                    {selectedJurnal.tanggal} ({selectedJurnal.jamMulai} - {selectedJurnal.jamSelesai})
                  </span>
                </div>
              </div>

              <div>
                <span className="font-semibold text-slate-700 block mb-1">Materi Pokok</span>
                <p className="text-slate-800 bg-white p-2.5 rounded border border-slate-200">
                  {selectedJurnal.materiPokok}
                </p>
              </div>

              <div>
                <span className="font-semibold text-slate-700 block mb-1">
                  Tujuan Pembelajaran / Capaian
                </span>
                <p className="text-slate-800 bg-white p-2.5 rounded border border-slate-200">
                  {selectedJurnal.tujuanPembelajaran}
                </p>
              </div>

              <div>
                <span className="font-semibold text-slate-700 block mb-1">
                  Catatan Refleksi &amp; Kejadian Siswa
                </span>
                <p className="text-slate-800 bg-white p-2.5 rounded border border-slate-200">
                  {selectedJurnal.catatanKejadian || "Tidak ada catatan khusus."}
                </p>
              </div>

              <div className="bg-blue-50/70 p-3 rounded-lg border border-blue-200/70">
                <span className="font-semibold text-blue-900 block mb-1">
                  Ketercapaian Pembelajaran
                </span>
                <Badge className={KETERCAPAIAN_BADGE[selectedJurnal.ketercapaian].className}>
                  {KETERCAPAIAN_BADGE[selectedJurnal.ketercapaian].label}
                </Badge>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedJurnal(null)}
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Format Cetak Resmi Supervisi (Kop Surat Sekolah & Tanda Tangan) */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-8 space-y-6 my-8">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="font-display font-bold text-navy-950 text-xl">
                  Pratinjau Dokumen Cetak Supervisi KBM
                </h3>
                <p className="text-xs text-slate-500">
                  Format resmi lampiran penilaian kinerja guru &amp; akreditasi sekolah
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => window.print()}
                  className="bg-navy-900 hover:bg-navy-800 text-white gap-2 font-medium"
                >
                  <Printer className="h-4 w-4" />
                  Cetak / Simpan PDF
                </Button>
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* KOP SURAT SEKOLAH */}
            <div className="border border-slate-300 p-8 rounded-lg bg-white text-slate-900 space-y-6">
              <div className="text-center border-b-2 border-double border-slate-900 pb-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  PEMERINTAH DAERAH PROVINSI JAWA BARAT
                </h4>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  DINAS PENDIDIKAN CABANG DINAS WILAYAH I
                </h4>
                <h2 className="text-lg font-black tracking-wide text-slate-950 uppercase mt-1">
                  SMA NEGERI 3 CONTOH KOTA BOGOR
                </h2>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Jl. Pendidikan No. 45 Telp. (0251) 8321000 Fax. 8321001 Email: info@sman3contoh.sch.id
                </p>
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-sm font-bold tracking-tight uppercase underline text-slate-950">
                  JURNAL AGENDA MENGAJAR GURU (KURIKULUM MERDEKA)
                </h3>
                <p className="text-xs text-slate-600">
                  Tahun Ajaran 2026/2027 • Semester Ganjil
                </p>
              </div>

              {/* Identitas Guru */}
              <div className="grid grid-cols-2 text-xs gap-y-1.5 max-w-xl">
                <div className="flex">
                  <span className="w-32 font-semibold text-slate-700">Nama Guru:</span>
                  <span className="font-bold text-slate-900">
                    {currentUser?.nama || "Sari Wulandari, S.Pd"}
                  </span>
                </div>
                <div className="flex">
                  <span className="w-32 font-semibold text-slate-700">NIP / NUPTK:</span>
                  <span className="text-slate-900">19870512 201101 2 008</span>
                </div>
                <div className="flex">
                  <span className="w-32 font-semibold text-slate-700">Mata Pelajaran:</span>
                  <span className="text-slate-900">Matematika (Fase E &amp; F)</span>
                </div>
                <div className="flex">
                  <span className="w-32 font-semibold text-slate-700">Beban Mengajar:</span>
                  <span className="text-slate-900">24 Jam Pelajaran (JP)</span>
                </div>
              </div>

              {/* Tabel Jurnal Resmi */}
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] border-collapse border border-slate-400">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 text-center font-bold">
                      <th className="border border-slate-400 p-2 w-8">No</th>
                      <th className="border border-slate-400 p-2 w-28">Hari, Tanggal</th>
                      <th className="border border-slate-400 p-2 w-16">Kelas</th>
                      <th className="border border-slate-400 p-2 w-20">Waktu</th>
                      <th className="border border-slate-400 p-2">Materi Pokok &amp; Capaian (TP)</th>
                      <th className="border border-slate-400 p-2 w-24">Ketercapaian</th>
                      <th className="border border-slate-400 p-2 w-24">Absensi Siswa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teacherJournals.map((item, idx) => (
                      <tr key={item.id} className="text-slate-900">
                        <td className="border border-slate-400 p-2 text-center">{idx + 1}</td>
                        <td className="border border-slate-400 p-2">{item.tanggal}</td>
                        <td className="border border-slate-400 p-2 text-center font-bold">{item.kelas}</td>
                        <td className="border border-slate-400 p-2 text-center">{item.jamMulai}-{item.jamSelesai}</td>
                        <td className="border border-slate-400 p-2">
                          <div className="font-semibold text-slate-950">{item.materiPokok}</div>
                          <div className="text-slate-600 text-[10px] mt-0.5">{item.tujuanPembelajaran}</div>
                          {item.catatanKejadian && (
                            <div className="text-slate-500 italic text-[10px] mt-0.5">
                              Cat: {item.catatanKejadian}
                            </div>
                          )}
                        </td>
                        <td className="border border-slate-400 p-2 text-center font-medium">
                          {item.ketercapaian === "TERCAPAI" ? "Tercapai (100%)" : "Remidial/Penguatan"}
                        </td>
                        <td className="border border-slate-400 p-2 text-center">
                          H: {item.hadir} | S: {item.sakit} | I: {item.izin} | A: {item.alpha}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tanda Tangan */}
              <div className="grid grid-cols-2 pt-8 text-xs text-center">
                <div>
                  <p>Mengetahui,</p>
                  <p className="font-semibold">Kepala Sekolah SMA Negeri 3 Contoh</p>
                  <div className="h-20" />
                  <p className="font-bold underline">Drs. Hendra Wijaya, M.Pd</p>
                  <p className="text-slate-600">NIP. 19680315 199412 1 002</p>
                </div>
                <div>
                  <p>Bogor, 24 Juli 2026</p>
                  <p className="font-semibold">Guru Mata Pelajaran</p>
                  <div className="h-20" />
                  <p className="font-bold underline">
                    {currentUser?.nama || "Sari Wulandari, S.Pd"}
                  </p>
                  <p className="text-slate-600">NIP. 19870512 201101 2 008</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
