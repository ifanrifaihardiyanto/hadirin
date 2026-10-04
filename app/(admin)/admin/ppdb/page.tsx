"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  UserPlus,
  Search,
  Filter,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  XCircle,
  FileText,
  FileCheck,
  ChevronRight,
  ExternalLink,
  Edit3,
  Award,
  Users,
  Building,
  Printer,
  Sparkles,
  Phone,
  Check,
  X,
  Eye,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore, type PendaftarPPDB } from "@/lib/store";
import { cn } from "@/lib/utils";

const JALUR_CONFIG: Record<PendaftarPPDB["jalur"], { label: string; badgeClass: string }> = {
  ZONASI: { label: "Zonasi Domisili (50%)", badgeClass: "bg-sky-100 text-sky-900 border-sky-200" },
  PRESTASI: { label: "Prestasi Akademik (30%)", badgeClass: "bg-purple-100 text-purple-900 border-purple-200" },
  AFIRMASI: { label: "Afirmasi / KIP (15%)", badgeClass: "bg-emerald-100 text-emerald-900 border-emerald-200" },
  MUTASI: { label: "Perpindahan Ortu (5%)", badgeClass: "bg-amber-100 text-amber-900 border-amber-200" },
};

const VERIF_CONFIG: Record<PendaftarPPDB["statusVerifikasi"], { label: string; badgeClass: string; icon: any }> = {
  TERVERIFIKASI: { label: "Lolos Berkas", badgeClass: "bg-emerald-100 text-emerald-800", icon: CheckCircle2 },
  MENUNGGU: { label: "Menunggu Verifikasi", badgeClass: "bg-amber-100 text-amber-800", icon: Clock },
  PERBAIKAN: { label: "Perlu Perbaikan", badgeClass: "bg-orange-100 text-orange-800", icon: AlertCircle },
  DITOLAK: { label: "Berkas Ditolak", badgeClass: "bg-rose-100 text-rose-800", icon: XCircle },
};

export default function AdminPPDBPage() {
  const {
    daftarPPDB,
    updateStatusVerifikasiPPDB,
    updateStatusKelulusanPPDB,
    tahunAjaranAktif,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [jalurFilter, setJalurFilter] = useState<string>("SEMUA");
  const [statusFilter, setStatusFilter] = useState<string>("SEMUA");

  // Verification Modal
  const [selectedPendaftar, setSelectedPendaftar] = useState<PendaftarPPDB | null>(null);
  const [modalStatus, setModalStatus] = useState<PendaftarPPDB["statusVerifikasi"]>("TERVERIFIKASI");
  const [modalKelulusan, setModalKelulusan] = useState<PendaftarPPDB["statusKelulusan"]>("PROSES");
  const [modalCatatan, setModalCatatan] = useState("");

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const openVerifikasiDialog = (p: PendaftarPPDB) => {
    setSelectedPendaftar(p);
    setModalStatus(p.statusVerifikasi);
    setModalKelulusan(p.statusKelulusan);
    setModalCatatan(p.catatanVerifikasi || "");
  };

  const handleSaveVerifikasi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPendaftar) return;

    updateStatusVerifikasiPPDB(selectedPendaftar.id, modalStatus, modalCatatan);
    updateStatusKelulusanPPDB(selectedPendaftar.id, modalKelulusan);
    showToast(`Status pendaftar ${selectedPendaftar.nama} berhasil diperbarui.`);
    setSelectedPendaftar(null);
  };

  // Filtered List
  const filteredList = useMemo(() => {
    return daftarPPDB.filter((p) => {
      const matchSearch =
        p.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.noPendaftaran.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.nisn.includes(searchQuery) ||
        p.asalSekolah.toLowerCase().includes(searchQuery.toLowerCase());

      const matchJalur = jalurFilter === "SEMUA" || p.jalur === jalurFilter;
      const matchStatus = statusFilter === "SEMUA" || p.statusVerifikasi === statusFilter;

      return matchSearch && matchJalur && matchStatus;
    });
  }, [daftarPPDB, searchQuery, jalurFilter, statusFilter]);

  // Summary Metrics
  const totalPendaftar = daftarPPDB.length;
  const totalLolosBerkas = daftarPPDB.filter((p) => p.statusVerifikasi === "TERVERIFIKASI").length;
  const totalMenunggu = daftarPPDB.filter((p) => p.statusVerifikasi === "MENUNGGU").length;
  const totalDiterima = daftarPPDB.filter((p) => p.statusKelulusan === "LULUS").length;
  const kuotaPagu = 240;

  // CSV Export
  const handleExportCSV = () => {
    const headers = ["No Pendaftaran", "Nama Siswa", "NISN", "Asal Sekolah", "Jalur", "Jurusan", "Nilai Rapor", "Nama Wali", "Telepon", "Status Verifikasi", "Status Kelulusan"];
    const rows = daftarPPDB.map((p) => [
      p.noPendaftaran,
      `"${p.nama}"`,
      p.nisn,
      `"${p.asalSekolah}"`,
      p.jalur,
      p.pilihanJurusan,
      p.nilaiRataRapor,
      `"${p.namaWali}"`,
      `"${p.teleponWali}"`,
      p.statusVerifikasi,
      p.statusKelulusan,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Data_Pendaftar_PPDB_${tahunAjaranAktif.replace("/", "-")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Data PPDB berhasil diekspor ke CSV.");
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-2xl bg-navy-950 px-4 py-3 text-sm font-medium text-white shadow-2xl animate-in fade-in slide-in-from-top-4 border border-navy-800">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Page Title */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>Kesiswaan &amp; Admisi</span>
            <ChevronRight size={13} />
            <span className="text-navy-900">PPDB Online</span>
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-navy-950 sm:text-3xl flex items-center gap-2.5">
            <UserPlus className="text-navy-900 h-7 w-7" />
            Penerimaan Peserta Didik Baru (PPDB)
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm mt-0.5">
            Verifikasi berkas calon siswa baru, seleksi perangkingan jalur pendaftaran, dan penetapan kelulusan ({tahunAjaranAktif}).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/ppdb"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-semibold text-navy-950 shadow-2xs transition-colors cursor-pointer"
          >
            <ExternalLink size={14} className="text-navy-700" />
            <span>Lihat Portal Publik PPDB</span>
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="gap-1.5 text-xs font-semibold border-slate-200 bg-white hover:bg-slate-50 text-navy-950 shadow-2xs cursor-pointer"
          >
            <Download size={14} className="text-slate-600" />
            <span>Ekspor CSV</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="gap-1.5 text-xs font-semibold border-slate-200 bg-white hover:bg-slate-50 text-navy-950 shadow-2xs cursor-pointer"
          >
            <Printer size={14} className="text-slate-600" />
            <span>Cetak Rekap</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <Card className="border border-border shadow-xs bg-white">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-navy-50 text-navy-900 shrink-0">
              <Users size={22} />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Pendaftar</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="font-display text-xl font-bold text-navy-950 sm:text-2xl">
                  {totalPendaftar}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">/ {kuotaPagu} Pagu</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-xs bg-white">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-50 text-emerald-900 shrink-0">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Lolos Berkas</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="font-display text-xl font-bold text-navy-950 sm:text-2xl">
                  {totalLolosBerkas}
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold">Terverifikasi</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-xs bg-white">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-50 text-amber-900 shrink-0">
              <Clock size={22} />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Menunggu Antrean</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="font-display text-xl font-bold text-navy-950 sm:text-2xl">
                  {totalMenunggu}
                </span>
                <span className="text-[10px] text-amber-700 font-semibold">Perlu Dicek</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-xs bg-white">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-purple-50 text-purple-900 shrink-0">
              <Award size={22} />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Diterima / Lulus</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="font-display text-xl font-bold text-navy-950 sm:text-2xl">
                  {totalDiterima}
                </span>
                <span className="text-[10px] text-purple-700 font-medium">Calon Siswa</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <Card className="border border-border shadow-xs bg-white">
        <CardContent className="p-4 space-y-3.5">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Cari nomor reg, nama calon siswa, NISN, atau sekolah asal..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs bg-slate-50/70 border-slate-200 focus-visible:ring-navy-900"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Menampilkan <span className="font-bold text-navy-950 font-mono">{filteredList.length}</span> pendaftar
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mr-1">
              <Filter size={12} /> Jalur:
            </span>
            <button
              type="button"
              onClick={() => setJalurFilter("SEMUA")}
              className={cn(
                "rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer",
                jalurFilter === "SEMUA"
                  ? "bg-navy-900 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
              )}
            >
              Semua Jalur
            </button>
            {(Object.keys(JALUR_CONFIG) as PendaftarPPDB["jalur"][]).map((j) => (
              <button
                key={j}
                type="button"
                onClick={() => setJalurFilter(j)}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer",
                  jalurFilter === j
                    ? "bg-navy-900 text-white shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                )}
              >
                {j}
              </button>
            ))}

            <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mr-1">
              Verifikasi:
            </span>
            {(["SEMUA", "MENUNGGU", "TERVERIFIKASI", "PERBAIKAN", "DITOLAK"] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer",
                  statusFilter === st
                    ? "bg-navy-900 text-white shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                )}
              >
                {st === "SEMUA" ? "Semua Status" : st}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Table */}
      <Card className="border border-border shadow-xs bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/90 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-border">
              <tr>
                <th className="py-3 px-4">No. Registrasi</th>
                <th className="py-3 px-4">Nama Calon Siswa</th>
                <th className="py-3 px-4">Asal Sekolah</th>
                <th className="py-3 px-4">Jalur &amp; Pilihan</th>
                <th className="py-3 px-4 text-center">Nilai Rata-rata</th>
                <th className="py-3 px-4">Kelengkapan Berkas</th>
                <th className="py-3 px-4">Status Verifikasi</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.map((p) => {
                const jalurCfg = JALUR_CONFIG[p.jalur];
                const verifCfg = VERIF_CONFIG[p.statusVerifikasi];
                const VerifIcon = verifCfg.icon;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-navy-950">
                      {p.noPendaftaran}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-navy-950 text-sm leading-tight">{p.nama}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">NISN: {p.nisn}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {p.asalSekolah}
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <Badge variant="outline" className={cn("text-[10px] font-bold uppercase font-mono px-1.5 py-0.5", jalurCfg.badgeClass)}>
                          {p.jalur}
                        </Badge>
                        <p className="text-[11px] text-slate-500 font-medium">Pilihan: {p.pilihanJurusan}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-navy-950 text-sm">
                      {p.nilaiRataRapor}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-mono font-bold", p.berkasKK ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-400")}>
                          KK
                        </span>
                        <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-mono font-bold", p.berkasAkta ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-400")}>
                          Akta
                        </span>
                        <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-mono font-bold", p.berkasRapor ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-400")}>
                          Rapor
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold", verifCfg.badgeClass)}>
                          <VerifIcon size={12} />
                          <span>{verifCfg.label}</span>
                        </span>
                        {p.statusKelulusan === "LULUS" && (
                          <Badge className="bg-purple-600 text-white text-[9px] font-bold block w-fit">
                            Diterima
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        onClick={() => openVerifikasiDialog(p)}
                        className="h-7 text-xs font-semibold bg-navy-900 hover:bg-navy-800 text-white gap-1 px-2.5 cursor-pointer shadow-2xs"
                      >
                        <FileCheck size={13} />
                        <span>Verifikasi</span>
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* MODAL VERIFIKASI BERKAS */}
      {selectedPendaftar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400">
                  {selectedPendaftar.noPendaftaran}
                </span>
                <h3 className="font-display text-lg font-bold text-navy-950">
                  Verifikasi Berkas: {selectedPendaftar.nama}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPendaftar(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Info Box */}
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 space-y-2">
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[10px]">NISN / NIK:</span>
                    <strong className="text-navy-950 font-mono">{selectedPendaftar.nisn}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Asal Sekolah:</span>
                    <strong className="text-navy-950">{selectedPendaftar.asalSekolah}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Jalur &amp; Jurusan:</span>
                    <strong className="text-navy-950">{selectedPendaftar.jalur} - {selectedPendaftar.pilihanJurusan}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Nilai Rata-rata Rapor:</span>
                    <strong className="text-navy-950 font-mono text-sm">{selectedPendaftar.nilaiRataRapor}</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-slate-600">
                  <span>Wali: {selectedPendaftar.namaWali}</span>
                  <span className="font-mono">Telp: {selectedPendaftar.teleponWali}</span>
                </div>
              </div>

              {/* Status Verifikasi Form */}
              <form onSubmit={handleSaveVerifikasi} className="space-y-3.5 pt-1">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Keputusan Verifikasi Berkas *</label>
                  <select
                    value={modalStatus}
                    onChange={(e) => setModalStatus(e.target.value as any)}
                    className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none focus:ring-2 focus:ring-navy-900 font-semibold"
                  >
                    <option value="TERVERIFIKASI">Lolos Berkas &amp; Data Valid</option>
                    <option value="MENUNGGU">Menunggu Pemeriksaan Ulang</option>
                    <option value="PERBAIKAN">Perlu Perbaikan / Dokumen Buram</option>
                    <option value="DITOLAK">Tolak Pendaftaran (Tidak Memenuhi Syarat)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Status Seleksi &amp; Kelulusan</label>
                  <select
                    value={modalKelulusan}
                    onChange={(e) => setModalKelulusan(e.target.value as any)}
                    className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none focus:ring-2 focus:ring-navy-900 font-semibold"
                  >
                    <option value="PROSES">Masih Dalam Proses Seleksi</option>
                    <option value="LULUS">Dinyatakan Lulus / Diterima</option>
                    <option value="CADANGAN">Cadangan / Waiting List</option>
                    <option value="TIDAK_LULUS">Tidak Lulus Seleksi</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Catatan Hasil Verifikasi untuk Calon Siswa</label>
                  <textarea
                    rows={3}
                    placeholder="Tuliskan catatan evaluasi atau kekurangan berkas yang harus diunggah ulang..."
                    value={modalCatatan}
                    onChange={(e) => setModalCatatan(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs outline-none focus:ring-2 focus:ring-navy-900 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedPendaftar(null)}
                    className="text-xs cursor-pointer"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold cursor-pointer"
                  >
                    Simpan Keputusan Verifikasi
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
