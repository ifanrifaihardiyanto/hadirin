"use client";

import { useState } from "react";
import {
  FileCheck,
  Plus,
  Calendar,
  Clock,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  X,
  FileText,
  ShieldCheck,
  LayoutGrid,
  List,
  Filter,
  Check,
} from "lucide-react";
import { useStore, type JenisIzin, type StatusIzin } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const JENIS_BADGE: Record<JenisIzin, { label: string; className: string }> = {
  SAKIT: {
    label: "Sakit (Surat Dokter)",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  IZIN: {
    label: "Izin Keluarga",
    className: "bg-sky-50 text-sky-700 border-sky-200",
  },
  DISPENSASI: {
    label: "Dispensasi Sekolah",
    className: "bg-purple-50 text-purple-700 border-purple-200",
  },
};

const STATUS_BADGE: Record<StatusIzin, { label: string; className: string; icon: typeof CheckCircle2 }> = {
  MENUNGGU: {
    label: "Menunggu Verifikasi",
    className: "bg-amber-50 text-amber-700 border-amber-200 font-bold",
    icon: Clock,
  },
  DISETUJUI: {
    label: "Disetujui Resmi",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200 font-bold",
    icon: CheckCircle2,
  },
  DITOLAK: {
    label: "Ditolak",
    className: "bg-rose-50 text-rose-700 border-rose-200 font-bold",
    icon: XCircle,
  },
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function IzinSiswaPage() {
  const { daftarIzin, tambahIzin, updateStatusIzin, currentUser, daftarKelas } = useStore();
  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterKelas, setFilterKelas] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    namaSiswa: "",
    nis: "",
    kelas: "X IPA 1",
    jenis: "SAKIT" as JenisIzin,
    tanggalMulai: "24 Juli 2026",
    tanggalSelesai: "24 Juli 2026",
    alasan: "",
    diajukanOleh: "Wali Murid",
  });

  const filtered = daftarIzin.filter((item) => {
    const matchQuery =
      item.namaSiswa.toLowerCase().includes(query.toLowerCase()) ||
      item.kelas.toLowerCase().includes(query.toLowerCase()) ||
      item.nis.includes(query) ||
      item.alasan.toLowerCase().includes(query.toLowerCase());
    const matchStatus = filterStatus === "ALL" || item.status === filterStatus;
    const matchKelas = filterKelas === "ALL" || item.kelas === filterKelas;
    return matchQuery && matchStatus && matchKelas;
  });

  const totalIzin = daftarIzin.length;
  const menungguCount = daftarIzin.filter((i) => i.status === "MENUNGGU").length;
  const disetujuiCount = daftarIzin.filter((i) => i.status === "DISETUJUI").length;
  const ditolakCount = daftarIzin.filter((i) => i.status === "DITOLAK").length;
  const sakitCount = daftarIzin.filter((i) => i.jenis === "SAKIT").length;
  const dispensasiCount = daftarIzin.filter((i) => i.jenis === "DISPENSASI").length;

  const handleSubmitNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaSiswa || !formData.alasan) return;

    tambahIzin({
      ...formData,
      disetujuiOleh: currentUser ? `${currentUser.nama} (Wali Kelas)` : undefined,
    });

    setIsModalOpen(false);
    setFormData({
      namaSiswa: "",
      nis: "",
      kelas: "X IPA 1",
      jenis: "SAKIT",
      tanggalMulai: "24 Juli 2026",
      tanggalSelesai: "24 Juli 2026",
      alasan: "",
      diajukanOleh: "Wali Murid",
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold tracking-tight text-navy-950 md:text-3xl">
              Izin &amp; Sakit Siswa
            </h1>
            <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-medium">
              Validasi Presensi
            </Badge>
          </div>
          <p className="text-sm text-slate-500">
            Arsip surat keterangan sakit dokter, izin orang tua, dan dispensasi dinas siswa.
          </p>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-navy-900 hover:bg-navy-800 text-white gap-2 font-medium shadow-xs"
        >
          <Plus className="h-4 w-4" />
          Catat Surat Izin Baru
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-slate-200/80 bg-white shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Pengajuan
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-50 text-navy-700">
              <FileCheck className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="font-display text-3xl font-bold tracking-tight text-navy-950">
              {totalIzin}
            </div>
            <p className="mt-1 text-xs text-slate-500">Surat terdaftar semester ini</p>
          </CardContent>
        </Card>

        <Card className="border border-amber-200 bg-amber-50/50 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">
              Menunggu Approval
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <Clock className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="font-display text-3xl font-bold tracking-tight text-amber-800">
              {menungguCount}
            </div>
            <p className="mt-1 text-xs text-amber-700 font-medium">Perlu verifikasi wali kelas</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Surat Sakit Medis
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
              <AlertCircle className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="font-display text-3xl font-bold tracking-tight text-navy-950">
              {sakitCount}
            </div>
            <p className="mt-1 text-xs text-slate-500">Surat dokter / klinik terlampir</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Dispensasi Sekolah
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="font-display text-3xl font-bold tracking-tight text-purple-700">
              {dispensasiCount}
            </div>
            <p className="mt-1 text-xs text-slate-500">Lomba / delegasi resmi</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border border-slate-200/80 bg-white shadow-xs">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama siswa, NIS, kelas, atau alasan izin..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filter Kelas & Layout Switcher */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5 text-slate-400" />
                <select
                  value={filterKelas}
                  onChange={(e) => setFilterKelas(e.target.value)}
                  className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                >
                  <option value="ALL">Semua Kelas</option>
                  {daftarKelas.map((k) => (
                    <option key={k.id} value={k.nama}>
                      {k.nama}
                    </option>
                  ))}
                </select>
              </div>

              {/* View Switcher Toggle */}
              <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setViewMode("cards")}
                  className={`p-1.5 rounded-md text-xs transition-colors ${
                    viewMode === "cards"
                      ? "bg-white text-navy-950 shadow-2xs font-semibold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                  title="Tampilan Kartu 2-Kolom"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`p-1.5 rounded-md text-xs transition-colors ${
                    viewMode === "table"
                      ? "bg-white text-navy-950 shadow-2xs font-semibold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                  title="Tampilan Tabel Rekap"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Status Tabs with Counters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-t border-slate-100 pt-3">
            {[
              { id: "ALL", label: "Semua", count: totalIzin },
              { id: "MENUNGGU", label: "Menunggu", count: menungguCount, highlight: true },
              { id: "DISETUJUI", label: "Disetujui", count: disetujuiCount },
              { id: "DITOLAK", label: "Ditolak", count: ditolakCount },
            ].map((tab) => {
              const active = filterStatus === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setFilterStatus(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    active
                      ? "bg-navy-900 text-white shadow-xs"
                      : tab.highlight && tab.count > 0
                      ? "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
                      : "bg-slate-100/80 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      active
                        ? "bg-white/20 text-white"
                        : tab.highlight && tab.count > 0
                        ? "bg-amber-200 text-amber-900"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Main Content: Card Grid (2 Kolom Desktop, 1 Kolom Mobile) vs Table */}
      {filtered.length === 0 ? (
        <Card className="border border-slate-200/80 bg-white shadow-xs p-12 text-center">
          <FileCheck className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-3 text-base font-semibold text-slate-800">
            Tidak ada data permohonan izin
          </h3>
          <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
            Tidak ditemukan pengajuan izin yang cocok dengan filter atau kata kunci pencarian Anda.
          </p>
        </Card>
      ) : viewMode === "cards" ? (
        /* 2-KOLOM GRID DI DESKTOP: Tetap proporsional seperti mobile dan tidak melar 1400px! */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
          {filtered.map((item) => {
            const jenisCfg = JENIS_BADGE[item.jenis];
            const statusCfg = STATUS_BADGE[item.status];
            const StatusIcon = statusCfg.icon;

            return (
              <Card
                key={item.id}
                className="border border-slate-200/80 bg-white shadow-xs hover:border-slate-300 hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <CardContent className="p-5 space-y-3.5">
                  {/* Top Bar: Profile & Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-slate-200 shrink-0">
                        <AvatarFallback className="bg-navy-100 text-navy-800 font-bold text-xs">
                          {getInitials(item.namaSiswa)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-navy-950 leading-tight">
                            {item.namaSiswa}
                          </h4>
                          <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-bold text-navy-800 bg-navy-50/50">
                            {item.kelas}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                          NIS: {item.nis}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] border shrink-0 ${statusCfg.className}`}
                    >
                      <StatusIcon className="h-3 w-3" />
                      <span>{statusCfg.label}</span>
                    </div>
                  </div>

                  {/* Kategori Izin & Masa Berlaku */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border ${jenisCfg.className}`}
                    >
                      {jenisCfg.label}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      {item.tanggalMulai} {item.tanggalMulai !== item.tanggalSelesai ? `— ${item.tanggalSelesai}` : ""}
                    </span>
                  </div>

                  {/* Alasan Surat (Kotak Kompak Proporsional, tidak memanjang kosong) */}
                  <div className="border-l-3 border-navy-500 bg-slate-50/80 p-3 rounded-r-lg text-xs space-y-1">
                    <span className="font-bold text-slate-700 block text-[11px]">Alasan / Keterangan:</span>
                    <p className="text-slate-800 leading-relaxed italic text-xs">
                      &ldquo;{item.alasan}&rdquo;
                    </p>
                  </div>

                  {/* Footer Informasi & Tombol Aksi Langsung di Dalam Kartu */}
                  <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                    <div className="space-y-0.5 text-slate-500 min-w-0 flex-1">
                      <p className="truncate">
                        Diajukan: <span className="font-medium text-slate-700">{item.diajukanOleh}</span>
                      </p>
                      {item.disetujuiOleh ? (
                        <p className="text-emerald-700 font-semibold flex items-center gap-1 truncate">
                          <Check className="h-3 w-3 shrink-0" />
                          {item.disetujuiOleh}
                        </p>
                      ) : (
                        <p className="text-slate-400 text-[11px]">
                          Tgl Pengajuan: {item.tanggalPengajuan}
                        </p>
                      )}
                    </div>

                    {/* Quick Action Button Setujui / Tolak */}
                    {item.status === "MENUNGGU" ? (
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          onClick={() =>
                            updateStatusIzin(
                              item.id,
                              "DISETUJUI",
                              currentUser?.nama ? `${currentUser.nama} (Wali Kelas)` : "Wali Kelas"
                            )
                          }
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 font-medium shadow-xs h-8 px-3"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Setujui
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateStatusIzin(
                              item.id,
                              "DITOLAK",
                              currentUser?.nama ? `${currentUser.nama} (Wali Kelas)` : "Wali Kelas"
                            )
                          }
                          className="border-rose-200 text-rose-700 hover:bg-rose-50 text-xs gap-1.5 font-medium h-8 px-3"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Tolak
                        </Button>
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-[11px] text-slate-500 font-normal border-slate-200 shrink-0">
                        Arsip Terverifikasi
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW (Untuk pengguna yang lebih suka tabel rapi) */
        <Card className="border border-slate-200/80 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Siswa</th>
                  <th className="py-3 px-3">Kelas</th>
                  <th className="py-3 px-3">Kategori Izin</th>
                  <th className="py-3 px-3">Masa Berlaku</th>
                  <th className="py-3 px-4">Keterangan / Alasan</th>
                  <th className="py-3 px-3">Diajukan Oleh</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => {
                  const jenisCfg = JENIS_BADGE[item.jenis];
                  const statusCfg = STATUS_BADGE[item.status];
                  const StatusIcon = statusCfg.icon;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-navy-950">{item.namaSiswa}</div>
                        <div className="text-[10px] text-slate-400 font-mono">NIS: {item.nis}</div>
                      </td>
                      <td className="py-3 px-3">
                        <Badge variant="outline" className="text-[10px] font-bold text-navy-800">
                          {item.kelas}
                        </Badge>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${jenisCfg.className}`}>
                          {jenisCfg.label}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                        {item.tanggalMulai}
                      </td>
                      <td className="py-3 px-4 text-slate-700 max-w-xs truncate" title={item.alasan}>
                        {item.alasan}
                      </td>
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                        {item.diajukanOleh}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] border ${statusCfg.className}`}>
                          <StatusIcon className="h-3 w-3" />
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {item.status === "MENUNGGU" ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              onClick={() =>
                                updateStatusIzin(
                                  item.id,
                                  "DISETUJUI",
                                  currentUser?.nama ? `${currentUser.nama} (Wali Kelas)` : "Wali Kelas"
                                )
                              }
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] h-7 px-2.5 gap-1"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              Setujui
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateStatusIzin(
                                  item.id,
                                  "DITOLAK",
                                  currentUser?.nama ? `${currentUser.nama} (Wali Kelas)` : "Wali Kelas"
                                )
                              }
                              className="border-rose-200 text-rose-700 hover:bg-rose-50 text-[11px] h-7 px-2.5"
                            >
                              Tolak
                            </Button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">Selesai</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal Tambah Izin Baru */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4 my-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="space-y-0.5">
                <h3 className="font-display font-bold text-navy-950 text-lg">
                  Catat Surat Izin / Sakit Baru
                </h3>
                <p className="text-xs text-slate-500">
                  Masukkan data permohonan ketidakhadiran siswa resmi
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNew} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">
                    Nama Siswa *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Aisyah Zahra"
                    value={formData.namaSiswa}
                    onChange={(e) => setFormData({ ...formData, namaSiswa: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">
                    NIS Siswa
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 24003"
                    value={formData.nis}
                    onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">
                    Kelas Siswa
                  </label>
                  <select
                    value={formData.kelas}
                    onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                  >
                    {daftarKelas.map((k) => (
                      <option key={k.id} value={k.nama}>
                        {k.nama}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">
                    Kategori Izin
                  </label>
                  <select
                    value={formData.jenis}
                    onChange={(e) =>
                      setFormData({ ...formData, jenis: e.target.value as JenisIzin })
                    }
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                  >
                    <option value="SAKIT">Sakit (Surat Dokter)</option>
                    <option value="IZIN">Izin Keperluan Keluarga</option>
                    <option value="DISPENSASI">Dispensasi Lomba / Dinas</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">
                    Mulai Tanggal
                  </label>
                  <input
                    type="text"
                    value={formData.tanggalMulai}
                    onChange={(e) => setFormData({ ...formData, tanggalMulai: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">
                    Sampai Tanggal
                  </label>
                  <input
                    type="text"
                    value={formData.tanggalSelesai}
                    onChange={(e) => setFormData({ ...formData, tanggalSelesai: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">
                  Diajukan Oleh
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Wali Murid (Ibu Ratna) / Pembina OSIS"
                  value={formData.diajukanOleh}
                  onChange={(e) => setFormData({ ...formData, diajukanOleh: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">
                  Keterangan / Alasan Lengkap *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Contoh: Demam tinggi, dokter menyarankan istirahat 2 hari..."
                  value={formData.alasan}
                  onChange={(e) => setFormData({ ...formData, alasan: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-navy-900 hover:bg-navy-800 text-white font-medium shadow-xs"
                >
                  Simpan Surat Izin
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
