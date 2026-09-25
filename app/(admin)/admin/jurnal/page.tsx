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
  Users,
  Award,
  Filter,
} from "lucide-react";
import { useStore, type Ketercapaian, type JurnalEntry } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function AdminJurnalSupervisiPage() {
  const { jurnalList, daftarGuru, daftarKelas } = useStore();
  const [search, setSearch] = useState("");
  const [selectedGuru, setSelectedGuru] = useState<string>("ALL");
  const [selectedKelas, setSelectedKelas] = useState<string>("ALL");
  const [selectedKetercapaian, setSelectedKetercapaian] = useState<string>("ALL");
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedJurnal, setSelectedJurnal] = useState<JurnalEntry | null>(null);

  const filtered = jurnalList.filter((j) => {
    const matchSearch =
      j.materiPokok.toLowerCase().includes(search.toLowerCase()) ||
      j.guruNama.toLowerCase().includes(search.toLowerCase()) ||
      j.mapel.toLowerCase().includes(search.toLowerCase()) ||
      j.kelas.toLowerCase().includes(search.toLowerCase());
    const matchGuru = selectedGuru === "ALL" || j.guruId === selectedGuru;
    const matchKelas = selectedKelas === "ALL" || j.kelas === selectedKelas;
    const matchKetercapaian =
      selectedKetercapaian === "ALL" || j.ketercapaian === selectedKetercapaian;
    return matchSearch && matchGuru && matchKelas && matchKetercapaian;
  });

  const totalSesi = jurnalList.length;
  const tercapaiCount = jurnalList.filter((j) => j.ketercapaian === "TERCAPAI").length;
  const penguatanCount = jurnalList.filter((j) => j.ketercapaian === "PENGUATAN").length;

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold tracking-tight text-navy-950 md:text-3xl">
              Supervisi Jurnal Mengajar Guru
            </h1>
            <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-medium">
              Kepala Sekolah &amp; Kurikulum
            </Badge>
          </div>
          <p className="text-sm text-slate-500">
            Monitoring keterlaksanaan KBM, audit kurikulum merdeka, dan rekap kepatuhan mengajar seluruh guru.
          </p>
        </div>

        <Button
          onClick={() => setIsPrintModalOpen(true)}
          variant="outline"
          className="gap-2 border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
        >
          <Printer className="h-4 w-4 text-slate-500" />
          Cetak Rekap Supervisi
        </Button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-slate-200/80 bg-white shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Jurnal Masuk
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-50 text-navy-700">
              <BookOpen className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="font-display text-3xl font-bold tracking-tight text-navy-950">
              {totalSesi}
            </div>
            <p className="mt-1 text-xs text-slate-500">Sesi KBM terdokumentasi rapi</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Kepatuhan Administrasi
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <Award className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="font-display text-3xl font-bold tracking-tight text-emerald-700">
              98.2%
            </div>
            <p className="mt-1 text-xs text-slate-500">Guru rutin mengisi agenda KBM</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Target CP Tercapai
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="font-display text-3xl font-bold tracking-tight text-blue-700">
              {tercapaiCount} <span className="text-xs font-normal text-slate-500">sesi</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {totalSesi > 0
                ? `${Math.round((tercapaiCount / totalSesi) * 100)}% materi tuntas`
                : "0%"}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Catatan Remidial
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <AlertCircle className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="font-display text-3xl font-bold tracking-tight text-amber-700">
              {penguatanCount} <span className="text-xs font-normal text-slate-500">sesi</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">Perlu pendampingan belajar</p>
          </CardContent>
        </Card>
      </div>

      {/* Multi Filters & Search */}
      <Card className="border border-slate-200/80 bg-white shadow-xs">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari materi pokok, nama guru pengajar, mata pelajaran..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedGuru}
                onChange={(e) => setSelectedGuru(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="ALL">Semua Guru ({daftarGuru.length})</option>
                {daftarGuru.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.nama}
                  </option>
                ))}
              </select>

              <select
                value={selectedKelas}
                onChange={(e) => setSelectedKelas(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="ALL">Semua Kelas</option>
                {daftarKelas.map((k) => (
                  <option key={k.id} value={k.nama}>
                    {k.nama}
                  </option>
                ))}
              </select>

              <select
                value={selectedKetercapaian}
                onChange={(e) => setSelectedKetercapaian(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="ALL">Semua Ketercapaian</option>
                <option value="TERCAPAI">Tercapai</option>
                <option value="PENGUATAN">Perlu Penguatan</option>
                <option value="REMEDIAL">Belum Tercapai (Remedial)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table of Supervised Journals */}
      <Card className="border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Waktu &amp; Tanggal</th>
                <th className="p-3.5">Guru Pengajar</th>
                <th className="p-3.5">Kelas &amp; Mapel</th>
                <th className="p-3.5">Materi Pokok &amp; Capaian (TP)</th>
                <th className="p-3.5">Ketercapaian</th>
                <th className="p-3.5 text-center">Presensi</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Tidak ada agenda jurnal yang sesuai dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const badgeCfg = KETERCAPAIAN_BADGE[item.ketercapaian];
                  const StatusIcon = badgeCfg.icon;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">{item.tanggal}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3" />
                          {item.jamMulai} - {item.jamSelesai}
                        </div>
                      </td>

                      <td className="p-3.5 font-medium whitespace-nowrap">
                        <div className="text-navy-950 font-bold">{item.guruNama}</div>
                        <div className="text-[11px] text-slate-400">NIP. 1987...</div>
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <Badge className="bg-navy-100 text-navy-800 font-bold border-navy-200">
                          {item.kelas}
                        </Badge>
                        <div className="text-[11px] text-slate-600 font-medium mt-1">
                          {item.mapel}
                        </div>
                      </td>

                      <td className="p-3.5 max-w-xs">
                        <div className="font-semibold text-slate-900 line-clamp-1">
                          {item.materiPokok}
                        </div>
                        <div className="text-slate-500 text-[11px] line-clamp-2 mt-0.5">
                          {item.tujuanPembelajaran}
                        </div>
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <div
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeCfg.className}`}
                        >
                          <StatusIcon className="h-3.5 w-3.5" />
                          {badgeCfg.label}
                        </div>
                      </td>

                      <td className="p-3.5 text-center whitespace-nowrap">
                        <span className="font-bold text-emerald-700">{item.hadir}</span>
                        <span className="text-slate-400">/{item.totalSiswa}</span>
                        {(item.sakit > 0 || item.izin > 0 || item.alpha > 0) && (
                          <div className="text-[10px] text-amber-600">
                            ({item.sakit + item.izin + item.alpha} absen)
                          </div>
                        )}
                      </td>

                      <td className="p-3.5 text-right whitespace-nowrap">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedJurnal(item)}
                          className="text-primary hover:text-primary hover:bg-primary/5 text-xs font-medium"
                        >
                          Lihat Detail
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Detail Jurnal Admin */}
      {selectedJurnal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-display font-bold text-navy-950 text-lg">
                  Supervisi Agenda KBM
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedJurnal.guruNama} • {selectedJurnal.kelas} ({selectedJurnal.mapel})
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
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/70">
                <span className="text-slate-500 block">Waktu KBM:</span>
                <span className="font-semibold text-slate-900">
                  {selectedJurnal.tanggal} ({selectedJurnal.jamMulai} - {selectedJurnal.jamSelesai})
                </span>
              </div>

              <div>
                <span className="font-semibold text-slate-700 block mb-1">Materi Pokok:</span>
                <p className="text-slate-800 bg-white p-2.5 rounded border border-slate-200">
                  {selectedJurnal.materiPokok}
                </p>
              </div>

              <div>
                <span className="font-semibold text-slate-700 block mb-1">
                  Capaian Pembelajaran (TP):
                </span>
                <p className="text-slate-800 bg-white p-2.5 rounded border border-slate-200">
                  {selectedJurnal.tujuanPembelajaran}
                </p>
              </div>

              <div>
                <span className="font-semibold text-slate-700 block mb-1">
                  Catatan Kejadian di Kelas:
                </span>
                <p className="text-slate-800 bg-white p-2.5 rounded border border-slate-200">
                  {selectedJurnal.catatanKejadian || "Tidak ada catatan khusus."}
                </p>
              </div>

              <div className="bg-emerald-50/70 p-3 rounded-lg border border-emerald-200/70">
                <span className="font-semibold text-emerald-950 block mb-1">
                  Evaluasi Ketercapaian Guru:
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

      {/* Modal Format Cetak Rekap Supervisi Resmi (Kop Sekolah) */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-8 space-y-6 my-8">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="font-display font-bold text-navy-950 text-xl">
                  Pratinjau Rekap Supervisi Akademik &amp; KBM
                </h3>
                <p className="text-xs text-slate-500">
                  Dokumen arsip penjaminan mutu dan akreditasi sekolah
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => window.print()}
                  className="bg-navy-900 hover:bg-navy-800 text-white gap-2 font-medium"
                >
                  <Printer className="h-4 w-4" />
                  Cetak / PDF
                </Button>
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* KOP SURAT RESMI */}
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
                  LAPORAN SUPERVISI KETERLAKSANAAN PEMBELAJARAN (KBM)
                </h3>
                <p className="text-xs text-slate-600">
                  Periode Semester Ganjil - Tahun Ajaran 2026/2027
                </p>
              </div>

              {/* Ringkasan Sekolah */}
              <div className="grid grid-cols-3 gap-3 text-xs bg-slate-50 p-3 rounded border border-slate-200">
                <div>
                  <span className="text-slate-500 block">Total Guru Aktif:</span>
                  <span className="font-bold text-slate-900">{daftarGuru.length} Orang Guru</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Sesi KBM Terdata:</span>
                  <span className="font-bold text-slate-900">{jurnalList.length} Sesi Pertemuan</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Tingkat Capaian Materi:</span>
                  <span className="font-bold text-emerald-700">
                    {Math.round((tercapaiCount / (totalSesi || 1)) * 100)}% Tuntas
                  </span>
                </div>
              </div>

              {/* Tabel Rekap */}
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] border-collapse border border-slate-400">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 text-center font-bold">
                      <th className="border border-slate-400 p-2 w-8">No</th>
                      <th className="border border-slate-400 p-2 w-28">Tanggal</th>
                      <th className="border border-slate-400 p-2">Guru Pengajar</th>
                      <th className="border border-slate-400 p-2 w-16">Kelas</th>
                      <th className="border border-slate-400 p-2">Materi Pokok &amp; Topik</th>
                      <th className="border border-slate-400 p-2 w-24">Ketercapaian</th>
                      <th className="border border-slate-400 p-2 w-20">Kehadiran</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jurnalList.map((item, idx) => (
                      <tr key={item.id} className="text-slate-900">
                        <td className="border border-slate-400 p-2 text-center">{idx + 1}</td>
                        <td className="border border-slate-400 p-2">{item.tanggal}</td>
                        <td className="border border-slate-400 p-2 font-medium">{item.guruNama}</td>
                        <td className="border border-slate-400 p-2 text-center font-bold">{item.kelas}</td>
                        <td className="border border-slate-400 p-2">
                          <div className="font-semibold text-slate-950">{item.materiPokok}</div>
                          <div className="text-slate-600 text-[10px] mt-0.5">{item.mapel}</div>
                        </td>
                        <td className="border border-slate-400 p-2 text-center font-medium">
                          {item.ketercapaian === "TERCAPAI" ? "Tuntas" : "Remidial"}
                        </td>
                        <td className="border border-slate-400 p-2 text-center">
                          {item.hadir}/{item.totalSiswa}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tanda Tangan Pengesahan */}
              <div className="grid grid-cols-2 pt-8 text-xs text-center">
                <div>
                  <p>Mengetahui,</p>
                  <p className="font-semibold">Pengawas Pembina Sekolah</p>
                  <div className="h-20" />
                  <p className="font-bold underline">Dr. Hj. Siti Nurhasanah, M.Pd</p>
                  <p className="text-slate-600">NIP. 19640810 198903 2 003</p>
                </div>
                <div>
                  <p>Bogor, 24 Juli 2026</p>
                  <p className="font-semibold">Kepala SMA Negeri 3 Contoh</p>
                  <div className="h-20" />
                  <p className="font-bold underline">Drs. Hendra Wijaya, M.Pd</p>
                  <p className="text-slate-600">NIP. 19680315 199412 1 002</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
