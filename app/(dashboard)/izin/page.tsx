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
} from "lucide-react";
import { useStore, type JenisIzin, type StatusIzin } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
    className: "bg-yellow-50 text-yellow-700 border-yellow-200",
    icon: Clock,
  },
  DISETUJUI: {
    label: "Disetujui Resmi",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
  },
  DITOLAK: {
    label: "Ditolak / Tidak Sah",
    className: "bg-rose-50 text-rose-700 border-rose-200",
    icon: XCircle,
  },
};

export default function IzinSiswaPage() {
  const { daftarIzin, tambahIzin, updateStatusIzin, currentUser, daftarKelas } = useStore();
  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
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
    return matchQuery && matchStatus;
  });

  const totalIzin = daftarIzin.length;
  const menungguCount = daftarIzin.filter((i) => i.status === "MENUNGGU").length;
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
    <div className="w-full space-y-6">
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

        <Card className="border border-slate-200/80 bg-white shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Menunggu Approval
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-50 text-yellow-600">
              <Clock className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="font-display text-3xl font-bold tracking-tight text-yellow-700">
              {menungguCount}
            </div>
            <p className="mt-1 text-xs text-slate-500">Perlu verifikasi wali kelas</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Surat Sakit
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <AlertCircle className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="font-display text-3xl font-bold tracking-tight text-amber-700">
              {sakitCount}
            </div>
            <p className="mt-1 text-xs text-slate-500">Surat medis / klinik terlampir</p>
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

      {/* Filter and Search */}
      <Card className="border border-slate-200/80 bg-white shadow-xs">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama siswa, NIS, kelas, atau alasan izin..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
                Status:
              </span>
              {(["ALL", "MENUNGGU", "DISETUJUI", "DITOLAK"] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                    filterStatus === status
                      ? "bg-navy-900 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {status === "ALL"
                    ? "Semua"
                    : status === "MENUNGGU"
                    ? "Menunggu"
                    : status === "DISETUJUI"
                    ? "Disetujui"
                    : "Ditolak"}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Izin List Cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card className="border border-slate-200/80 bg-white shadow-xs p-10 text-center">
            <FileCheck className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-3 text-base font-semibold text-slate-800">
              Tidak ada data permohonan izin
            </h3>
            <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
              Klik &quot;Catat Surat Izin Baru&quot; di atas untuk mencatat surat izin atau sakit siswa.
            </p>
          </Card>
        ) : (
          filtered.map((item) => {
            const jenisCfg = JENIS_BADGE[item.jenis];
            const statusCfg = STATUS_BADGE[item.status];
            const StatusIcon = statusCfg.icon;

            return (
              <Card
                key={item.id}
                className="border border-slate-200/80 bg-white shadow-xs hover:border-slate-300 transition-colors"
              >
                <CardContent className="p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2 flex-1">
                      {/* Top Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className="bg-navy-100 text-navy-800 font-bold border-navy-200">
                          {item.kelas}
                        </Badge>
                        <span className="text-xs font-bold text-slate-900">
                          {item.namaSiswa}
                        </span>
                        <span className="text-xs text-slate-400">NIS: {item.nis}</span>
                        <div
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${jenisCfg.className}`}
                        >
                          {jenisCfg.label}
                        </div>
                        <div
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusCfg.className}`}
                        >
                          <StatusIcon className="h-3.5 w-3.5" />
                          {statusCfg.label}
                        </div>
                      </div>

                      {/* Detail Alasan */}
                      <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200/70">
                        <span className="font-semibold text-slate-800">Alasan: </span>
                        {item.alasan}
                      </p>

                      {/* Meta info */}
                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          Masa Berlaku: {item.tanggalMulai} {item.tanggalMulai !== item.tanggalSelesai ? `- ${item.tanggalSelesai}` : ""}
                        </span>
                        <span>Diajukan: {item.diajukanOleh} ({item.tanggalPengajuan})</span>
                        {item.disetujuiOleh && (
                          <span className="text-emerald-700 font-medium">
                            ✓ Diverifikasi: {item.disetujuiOleh}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {item.status === "MENUNGGU" && (
                      <div className="flex items-center gap-2 pt-2 md:pt-0">
                        <Button
                          size="sm"
                          onClick={() =>
                            updateStatusIzin(
                              item.id,
                              "DISETUJUI",
                              currentUser?.nama ? `${currentUser.nama} (Wali Kelas)` : "Wali Kelas"
                            )
                          }
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 font-medium shadow-xs"
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
                          className="border-rose-200 text-rose-700 hover:bg-rose-50 text-xs gap-1.5 font-medium"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Tolak
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Modal Tambah Izin Baru */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="space-y-0.5">
                <h3 className="font-display font-bold text-navy-950 text-lg">
                  Catat Surat Izin / Sakit Baru
                </h3>
                <p className="text-xs text-slate-500">
                  Input dokumen izin resmi siswa untuk sinkronisasi otomatis absensi
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNew} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Kelas Siswa
                  </label>
                  <select
                    value={formData.kelas}
                    onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {daftarKelas.map((k) => (
                      <option key={k.id} value={k.nama}>
                        {k.nama}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Jenis Izin
                  </label>
                  <select
                    value={formData.jenis}
                    onChange={(e) =>
                      setFormData({ ...formData, jenis: e.target.value as JenisIzin })
                    }
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="SAKIT">Sakit (Surat Dokter)</option>
                    <option value="IZIN">Izin Keperluan Keluarga</option>
                    <option value="DISPENSASI">Dispensasi Kegiatan Sekolah</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Nama Lengkap Siswa *
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
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
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
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Tanggal Mulai
                  </label>
                  <input
                    type="text"
                    value={formData.tanggalMulai}
                    onChange={(e) => setFormData({ ...formData, tanggalMulai: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Tanggal Selesai
                  </label>
                  <input
                    type="text"
                    value={formData.tanggalSelesai}
                    onChange={(e) => setFormData({ ...formData, tanggalSelesai: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Diajukan Oleh / Bukti Pendukung
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Orang Tua (dr. Sp.A Klinik Medika terlampir)"
                  value={formData.diajukanOleh}
                  onChange={(e) => setFormData({ ...formData, diajukanOleh: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Keterangan / Alasan Lengkap *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Deskripsikan alasan atau diagnosis singkat..."
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
                  Simpan &amp; Verifikasi
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
