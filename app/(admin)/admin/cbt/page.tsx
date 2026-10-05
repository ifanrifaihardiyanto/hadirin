"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Laptop,
  Search,
  Plus,
  ArrowLeft,
  Download,
  KeyRound,
  RotateCw,
  CheckCircle2,
  Clock,
  AlertCircle,
  Play,
  FileCheck2,
  Calendar,
  BookOpen,
  Award,
  Users,
  Edit,
  Trash2,
  Eye,
  RotateCcw,
  Sparkles,
  Layers,
  ChevronRight,
  Filter,
  Check,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  useStore,
  type UjianCBT,
  type HasilSiswaCBT,
} from "@/lib/store";
import { cn } from "@/lib/utils";

const JENIS_UJIAN_CONFIG: Record<
  UjianCBT["jenisUjian"],
  { label: string; badgeClass: string }
> = {
  PTS: {
    label: "Penilaian Tengah Semester",
    badgeClass: "bg-blue-100 text-blue-900 border-blue-200",
  },
  PAS: {
    label: "Sumatif Akhir Semester",
    badgeClass: "bg-purple-100 text-purple-900 border-purple-200",
  },
  HARIAN: {
    label: "Formatif Harian",
    badgeClass: "bg-emerald-100 text-emerald-900 border-emerald-200",
  },
  SIMULASI_ANBK: {
    label: "Simulasi CBT ANBK",
    badgeClass: "bg-amber-100 text-amber-900 border-amber-200",
  },
  TRYOUT: {
    label: "Try Out Ujian",
    badgeClass: "bg-pink-100 text-pink-900 border-pink-200",
  },
};

const STATUS_UJIAN_CONFIG: Record<
  UjianCBT["status"],
  { label: string; badgeClass: string }
> = {
  AKTIF: {
    label: "Sesi Aktif",
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  DRAFT: {
    label: "Draft Terjadwal",
    badgeClass: "bg-slate-100 text-slate-800 border-slate-200",
  },
  SELESAI: {
    label: "Selesai",
    badgeClass: "bg-blue-100 text-blue-800 border-blue-200",
  },
};

export default function AdminCBTPage() {
  const {
    daftarUjianCBT,
    tambahUjianCBT,
    updateUjianCBT,
    hapusUjianCBT,
    regenerateTokenCBT,
    daftarHasilCBT,
    resetSesiCBT,
    daftarMapel,
  } = useStore();

  const [activeTab, setActiveTab] = useState<"jadwal" | "hasil" | "bank">("jadwal");
  const [searchQuery, setSearchQuery] = useState("");
  const [jenisFilter, setJenisFilter] = useState<string>("SEMUA");
  const [statusFilter, setStatusFilter] = useState<string>("SEMUA");
  const [ujianFilter, setUjianFilter] = useState<string>("SEMUA");

  // Modals
  const [isTambahOpen, setTambahOpen] = useState(false);
  const [isEditOpen, setEditOpen] = useState(false);
  const [selectedUjian, setSelectedUjian] = useState<UjianCBT | null>(null);

  // Form Tambah Ujian
  const [formUjian, setFormUjian] = useState({
    kodeUjian: "",
    judul: "",
    mapel: "Matematika Wajib",
    tingkatKelas: "Kelas X",
    jenisUjian: "PTS" as UjianCBT["jenisUjian"],
    tanggalUjian: new Date().toISOString().split("T")[0],
    jamMulai: "07:30",
    jamSelesai: "09:00",
    durasiMenit: 90,
    status: "AKTIF" as UjianCBT["status"],
    jumlahSoal: 25,
    kkm: 75,
    acakSoal: true,
    acakOpsi: true,
  });

  // KPIs
  const totalUjian = daftarUjianCBT.length;
  const ujianAktif = useMemo(
    () => daftarUjianCBT.filter((u) => u.status === "AKTIF").length,
    [daftarUjianCBT]
  );
  const totalPeserta = daftarHasilCBT.length;
  const rataRataNilai = useMemo(() => {
    if (daftarHasilCBT.length === 0) return 0;
    const total = daftarHasilCBT.reduce((acc, h) => acc + h.nilai, 0);
    return Math.round(total / daftarHasilCBT.length);
  }, [daftarHasilCBT]);

  const lulusKKMPct = useMemo(() => {
    if (daftarHasilCBT.length === 0) return 0;
    const lulus = daftarHasilCBT.filter((h) => h.statusKelulusan === "LULUS").length;
    return Math.round((lulus / daftarHasilCBT.length) * 100);
  }, [daftarHasilCBT]);

  // Filtered Exams
  const ujianFiltered = useMemo(() => {
    return daftarUjianCBT.filter((u) => {
      const matchSearch =
        searchQuery === "" ||
        u.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.kodeUjian.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.mapel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.tokenUjian.toLowerCase().includes(searchQuery.toLowerCase());

      const matchJenis = jenisFilter === "SEMUA" || u.jenisUjian === jenisFilter;
      const matchStatus = statusFilter === "SEMUA" || u.status === statusFilter;

      return matchSearch && matchJenis && matchStatus;
    });
  }, [daftarUjianCBT, searchQuery, jenisFilter, statusFilter]);

  // Filtered Student Results
  const hasilFiltered = useMemo(() => {
    return daftarHasilCBT.filter((h) => {
      const matchSearch =
        searchQuery === "" ||
        h.namaSiswa.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.nisn.includes(searchQuery) ||
        h.kelas.toLowerCase().includes(searchQuery.toLowerCase());

      const matchUjian = ujianFilter === "SEMUA" || h.ujianId === ujianFilter;

      return matchSearch && matchUjian;
    });
  }, [daftarHasilCBT, searchQuery, ujianFilter]);

  // Submit Tambah Ujian
  const handleSimpanUjian = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUjian.judul.trim()) return;

    const kodeAuto =
      formUjian.kodeUjian.trim() ||
      `CBT-${formUjian.jenisUjian}-${formUjian.mapel.substring(0, 3).toUpperCase()}-${String(
        daftarUjianCBT.length + 1
      ).padStart(2, "0")}`;

    tambahUjianCBT({
      ...formUjian,
      kodeUjian: kodeAuto,
      durasiMenit: Number(formUjian.durasiMenit) || 90,
      jumlahSoal: Number(formUjian.jumlahSoal) || 25,
      kkm: Number(formUjian.kkm) || 75,
    });

    setFormUjian({
      kodeUjian: "",
      judul: "",
      mapel: "Matematika Wajib",
      tingkatKelas: "Kelas X",
      jenisUjian: "PTS",
      tanggalUjian: new Date().toISOString().split("T")[0],
      jamMulai: "07:30",
      jamSelesai: "09:00",
      durasiMenit: 90,
      status: "AKTIF",
      jumlahSoal: 25,
      kkm: 75,
      acakSoal: true,
      acakOpsi: true,
    });
    setTambahOpen(false);
  };

  // Export CSV Hasil Ujian
  const handleExportCSV = () => {
    const headers = [
      "Nama Siswa",
      "NISN",
      "Kelas",
      "ID Ujian",
      "Jawaban Benar",
      "Jawaban Salah",
      "Nilai Skor",
      "Status Kelulusan",
      "Waktu Mulai",
      "Waktu Selesai",
      "Status Pengerjaan",
    ];

    const rows = daftarHasilCBT.map((h) => [
      `"${h.namaSiswa}"`,
      `"${h.nisn}"`,
      `"${h.kelas}"`,
      `"${h.ujianId}"`,
      h.jawabanBenar,
      h.jawabanSalah,
      h.nilai,
      `"${h.statusKelulusan}"`,
      `"${h.waktuMulai}"`,
      `"${h.waktuSelesai}"`,
      `"${h.statusPengerjaan}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Hasil_Ujian_CBT_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Kembali ke Dashboard
            </Link>
            <span className="text-muted-foreground">•</span>
            <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-800 border-emerald-200">
              Computer-Based Testing
            </Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Laptop className="h-6 w-6 text-emerald-600" />
            CBT & Bank Soal Asesmen Online
          </h1>
          <p className="text-sm text-muted-foreground">
            Penjadwalan ujian berbasis komputer, generate token rilis ujian, bank butir soal asesmen, dan rekapitulasi penilaian otomatis.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="gap-1.5 text-xs shadow-xs"
          >
            <Download className="h-3.5 w-3.5" />
            Export Hasil CSV
          </Button>

          <Button
            size="sm"
            onClick={() => setTambahOpen(true)}
            className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
          >
            <Plus className="h-4 w-4" />
            Buat Sesi Ujian Baru
          </Button>
        </div>
      </div>

      {/* KPI METRICS */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <Card className="border border-border/60 shadow-xs">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-medium">Total Sesi Ujian</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold tracking-tight text-foreground">{totalUjian}</span>
              <span className="text-xs text-muted-foreground">sesi terdaftar</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-xs">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-medium">Ujian Aktif Berjalan</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold tracking-tight text-emerald-700">{ujianAktif}</span>
              <span className="text-xs text-muted-foreground">sesi live</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-xs">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-medium">Peserta Mengerjakan</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold tracking-tight text-blue-700">{totalPeserta}</span>
              <span className="text-xs text-muted-foreground">siswa terekam</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-xs">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-medium">Rata-rata Skor Nilai</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold tracking-tight text-purple-700">{rataRataNilai}</span>
              <span className="text-xs text-muted-foreground">skala 100</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-xs col-span-2 md:col-span-1">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-medium">Tingkat Ketuntasan KKM</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold tracking-tight text-emerald-700">{lulusKKMPct}%</span>
              <span className="text-xs text-muted-foreground">lulus KKM</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab("jadwal")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
            activeTab === "jadwal"
              ? "border-emerald-600 text-emerald-700 font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Laptop className="h-4 w-4" />
          Jadwal & Sesi Ujian CBT ({daftarUjianCBT.length})
        </button>

        <button
          onClick={() => setActiveTab("hasil")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
            activeTab === "hasil"
              ? "border-emerald-600 text-emerald-700 font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Award className="h-4 w-4" />
          Monitoring Live & Hasil Siswa ({daftarHasilCBT.length})
        </button>

        <button
          onClick={() => setActiveTab("bank")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
            activeTab === "bank"
              ? "border-emerald-600 text-emerald-700 font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Layers className="h-4 w-4" />
          Bank Soal & Kisi-Kisi
        </button>
      </div>

      {/* TAB 1: JADWAL & SESI UJIAN */}
      {activeTab === "jadwal" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-card p-3 rounded-lg border border-border">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari judul ujian, mapel, token..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-sm h-9"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                aria-label="Filter Jenis Ujian"
                value={jenisFilter}
                onChange={(e) => setJenisFilter(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs focus:ring-1 focus:ring-ring"
              >
                <option value="SEMUA">Semua Jenis Ujian</option>
                <option value="PTS">Penilaian Tengah Semester</option>
                <option value="PAS">Sumatif Akhir Semester</option>
                <option value="HARIAN">Formatif Harian</option>
                <option value="SIMULASI_ANBK">Simulasi ANBK</option>
                <option value="TRYOUT">Try Out</option>
              </select>

              <select
                aria-label="Filter Status Ujian"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs focus:ring-1 focus:ring-ring"
              >
                <option value="SEMUA">Semua Status</option>
                <option value="AKTIF">Sesi Aktif</option>
                <option value="DRAFT">Draft Terjadwal</option>
                <option value="SELESAI">Selesai</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ujianFiltered.map((ujian) => {
              const JenisConf = JENIS_UJIAN_CONFIG[ujian.jenisUjian];
              const StatusConf = STATUS_UJIAN_CONFIG[ujian.status];
              const hasilUjianIni = daftarHasilCBT.filter((h) => h.ujianId === ujian.id);

              return (
                <Card key={ujian.id} className="border border-border/70 shadow-xs hover:border-emerald-300 transition-colors flex flex-col justify-between">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Badge
                            variant="outline"
                            className={cn("text-[10px] font-medium", JenisConf?.badgeClass)}
                          >
                            {JenisConf?.label || ujian.jenisUjian}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={cn("text-[10px] font-semibold", StatusConf?.badgeClass)}
                          >
                            {StatusConf?.label || ujian.status}
                          </Badge>
                        </div>
                        <CardTitle className="text-base font-bold text-foreground">
                          {ujian.judul}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                          <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-[11px]">
                            {ujian.kodeUjian}
                          </span>
                          <span>•</span>
                          <span>{ujian.mapel}</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-2 text-xs">
                      {/* TOKEN DISPLAY BOX */}
                      <div className="p-3 bg-muted/50 rounded-lg border border-border flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-muted-foreground uppercase font-semibold">
                            Token Rilis Ujian
                          </div>
                          <div className="text-xl font-bold font-mono tracking-widest text-emerald-700">
                            {ujian.tokenUjian}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => regenerateTokenCBT(ujian.id)}
                          className="h-8 text-xs gap-1 text-muted-foreground hover:text-foreground"
                          title="Generate Token Baru"
                        >
                          <RotateCw className="h-3.5 w-3.5" />
                          Refresh
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-muted-foreground p-2 rounded-lg bg-muted/30">
                        <div>
                          <span className="block text-[10px]">Jadwal Pelaksanaan:</span>
                          <span className="font-medium text-foreground">{ujian.tanggalUjian}</span>
                        </div>
                        <div>
                          <span className="block text-[10px]">Waktu & Durasi:</span>
                          <span className="font-medium text-foreground">
                            {ujian.jamMulai} ({ujian.durasiMenit}m)
                          </span>
                        </div>
                        <div>
                          <span className="block text-[10px]">Sasaran:</span>
                          <span className="font-medium text-foreground">{ujian.tingkatKelas}</span>
                        </div>
                        <div>
                          <span className="block text-[10px]">Komposisi:</span>
                          <span className="font-medium text-foreground">
                            {ujian.jumlahSoal} Soal • KKM {ujian.kkm}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                        <span>Acak Butir Soal: {ujian.acakSoal ? "Aktif" : "Tidak"}</span>
                        <span>Acak Opsi Pilihan: {ujian.acakOpsi ? "Aktif" : "Tidak"}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setUjianFilter(ujian.id);
                          setActiveTab("hasil");
                        }}
                        className="text-xs h-7 px-2.5 text-emerald-700 hover:text-emerald-800"
                      >
                        Live Monitoring ({hasilUjianIni.length} Siswa)
                      </Button>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedUjian(ujian);
                            setEditOpen(true);
                          }}
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                          title="Edit Ujian"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm(`Yakin ingin menghapus sesi ujian ${ujian.judul}?`)) {
                              hapusUjianCBT(ujian.id);
                            }
                          }}
                          className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                          title="Hapus Ujian"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: LIVE MONITORING & HASIL SISWA */}
      {activeTab === "hasil" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-card p-3 rounded-lg border border-border">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama siswa, NISN, kelas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-sm h-9"
              />
            </div>

            <select
              aria-label="Filter Sesi Ujian"
              value={ujianFilter}
              onChange={(e) => setUjianFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs focus:ring-1 focus:ring-ring"
            >
              <option value="SEMUA">Semua Sesi Ujian</option>
              {daftarUjianCBT.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.judul} ({u.kodeUjian})
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-xs font-semibold uppercase text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-4 py-3">Nama Siswa & Kelas</th>
                    <th className="px-4 py-3">Waktu Pengerjaan</th>
                    <th className="px-4 py-3">Jawaban Benar / Salah</th>
                    <th className="px-4 py-3">Nilai Akhir Skor</th>
                    <th className="px-4 py-3">Status KKM</th>
                    <th className="px-4 py-3">Status Sesi</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {hasilFiltered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground text-sm">
                        Belum ada rekaman pengerjaan siswa pada filter ini.
                      </td>
                    </tr>
                  ) : (
                    hasilFiltered.map((hasil) => {
                      const isLulus = hasil.statusKelulusan === "LULUS";
                      const isSelesai = hasil.statusPengerjaan === "SELESAI";

                      return (
                        <tr key={hasil.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="font-semibold text-foreground">{hasil.namaSiswa}</div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <span className="font-mono">{hasil.nisn}</span>
                              <span>•</span>
                              <Badge variant="outline" className="text-[10px] py-0 px-1">
                                {hasil.kelas}
                              </Badge>
                            </div>
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
                            <div>Mulai: {hasil.waktuMulai}</div>
                            <div>Selesai: {hasil.waktuSelesai}</div>
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap text-xs">
                            <span className="font-semibold text-emerald-700">{hasil.jawabanBenar} Benar</span>
                            <span className="text-muted-foreground"> / </span>
                            <span className="text-rose-600">{hasil.jawabanSalah} Salah</span>
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-lg font-bold font-mono text-foreground">
                              {hasil.nilai}
                            </div>
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap">
                            <Badge
                              className={cn(
                                "text-xs font-semibold",
                                isLulus
                                  ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                  : "bg-rose-100 text-rose-800 border-rose-200"
                              )}
                            >
                              {hasil.statusKelulusan}
                            </Badge>
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap">
                            {isSelesai ? (
                              <Badge variant="outline" className="text-xs text-emerald-700 bg-emerald-50 border-emerald-200">
                                Selesai
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs text-amber-700 bg-amber-50 border-amber-200 animate-pulse">
                                Sedang Mengerjakan
                              </Badge>
                            )}
                          </td>

                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  if (confirm(`Reset sesi ujian ${hasil.namaSiswa}? Siswa dapat login kembali.`)) {
                                    resetSesiCBT(hasil.id);
                                  }
                                }}
                                className="h-7 text-xs px-2 gap-1 border-amber-200 text-amber-800 hover:bg-amber-50"
                                title="Reset Sesi (Browser Crash / Mati Lampu)"
                              >
                                <RotateCcw className="h-3 w-3" />
                                Reset Sesi
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BANK BUTIR SOAL */}
      {activeTab === "bank" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { mapel: "Matematika Wajib", pg: 120, esai: 25, tingkat: "Kelas X, XI, XII" },
              { mapel: "Bahasa Indonesia", pg: 150, esai: 30, tingkat: "Semua Tingkat" },
              { mapel: "Bahasa Inggris", pg: 140, esai: 20, tingkat: "Semua Tingkat" },
              { mapel: "Fisika Peminatan", pg: 95, esai: 15, tingkat: "Kelas X & XI" },
              { mapel: "Biologi Peminatan", pg: 110, esai: 20, tingkat: "Kelas X & XI" },
              { mapel: "Kimia Peminatan", pg: 90, esai: 15, tingkat: "Kelas XI & XII" },
              { mapel: "Informatika & Koding", pg: 85, esai: 15, tingkat: "Kelas X" },
              { mapel: "Pendidikan Pancasila", pg: 80, esai: 10, tingkat: "Semua Tingkat" },
            ].map((bank) => (
              <Card key={bank.mapel} className="border border-border/70 shadow-xs hover:border-emerald-300 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge variant="outline" className="text-[10px] mb-1">
                        Bank Soal Terverifikasi
                      </Badge>
                      <CardTitle className="text-base font-bold text-foreground">
                        {bank.mapel}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">{bank.tingkat}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2 p-2.5 bg-muted/40 rounded-lg text-center">
                    <div>
                      <div className="text-lg font-bold text-foreground">{bank.pg}</div>
                      <div className="text-[10px] text-muted-foreground">Pilihan Ganda</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-emerald-600">{bank.esai}</div>
                      <div className="text-[10px] text-muted-foreground">Esai / Uraian</div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border flex items-center justify-between">
                    <span className="text-muted-foreground text-[11px]">
                      Total: {bank.pg + bank.esai} butir soal
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => alert(`Membuka bank butir soal untuk mata pelajaran ${bank.mapel}`)}
                      className="text-xs text-emerald-700 hover:text-emerald-800 h-7 px-2"
                    >
                      Buka Butir Soal
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* MODAL BUAT SESI UJIAN */}
      <Dialog open={isTambahOpen} onOpenChange={setTambahOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Laptop className="h-5 w-5 text-emerald-600" />
              Pembuatan Sesi Ujian CBT Baru
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSimpanUjian} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground">Judul Sesi Ujian *</label>
              <Input
                required
                placeholder="Contoh: PTS Ganjil Matematika Wajib Kelas X"
                value={formUjian.judul}
                onChange={(e) => setFormUjian({ ...formUjian, judul: e.target.value })}
                className="mt-1 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground">Mata Pelajaran</label>
                <select
                  value={formUjian.mapel}
                  onChange={(e) => setFormUjian({ ...formUjian, mapel: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {daftarMapel.map((m) => (
                    <option key={m.id} value={m.nama}>
                      {m.nama}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Jenis Asesmen</label>
                <select
                  value={formUjian.jenisUjian}
                  onChange={(e) =>
                    setFormUjian({
                      ...formUjian,
                      jenisUjian: e.target.value as UjianCBT["jenisUjian"],
                    })
                  }
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="PTS">Penilaian Tengah Semester (PTS)</option>
                  <option value="PAS">Sumatif Akhir Semester (SAS/PAS)</option>
                  <option value="HARIAN">Formatif Harian</option>
                  <option value="SIMULASI_ANBK">Simulasi CBT ANBK</option>
                  <option value="TRYOUT">Try Out Ujian</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground">Sasaran Tingkat</label>
                <select
                  value={formUjian.tingkatKelas}
                  onChange={(e) => setFormUjian({ ...formUjian, tingkatKelas: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="Kelas X">Kelas X</option>
                  <option value="Kelas XI">Kelas XI</option>
                  <option value="Kelas XII">Kelas XII</option>
                  <option value="Semua Tingkat">Semua Tingkat</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Jumlah Soal</label>
                <Input
                  type="number"
                  min="5"
                  value={formUjian.jumlahSoal}
                  onChange={(e) =>
                    setFormUjian({ ...formUjian, jumlahSoal: Number(e.target.value) || 25 })
                  }
                  className="mt-1 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Kriteria KKM</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formUjian.kkm}
                  onChange={(e) =>
                    setFormUjian({ ...formUjian, kkm: Number(e.target.value) || 75 })
                  }
                  className="mt-1 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground">Tanggal Ujian</label>
                <Input
                  type="date"
                  required
                  value={formUjian.tanggalUjian}
                  onChange={(e) => setFormUjian({ ...formUjian, tanggalUjian: e.target.value })}
                  className="mt-1 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Jam Mulai Sesi</label>
                <Input
                  type="time"
                  required
                  value={formUjian.jamMulai}
                  onChange={(e) => setFormUjian({ ...formUjian, jamMulai: e.target.value })}
                  className="mt-1 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Durasi (Menit)</label>
                <Input
                  type="number"
                  min="15"
                  required
                  value={formUjian.durasiMenit}
                  onChange={(e) =>
                    setFormUjian({ ...formUjian, durasiMenit: Number(e.target.value) || 90 })
                  }
                  className="mt-1 text-sm"
                />
              </div>
            </div>

            <div className="p-3 bg-muted/40 rounded-lg space-y-2">
              <div className="text-xs font-semibold text-foreground">Pengaturan Acak & Keamanan CBT</div>
              <div className="flex items-center gap-4 text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formUjian.acakSoal}
                    onChange={(e) => setFormUjian({ ...formUjian, acakSoal: e.target.checked })}
                    className="rounded border-input text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  <span>Acak Urutan Soal Siswa</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formUjian.acakOpsi}
                    onChange={(e) => setFormUjian({ ...formUjian, acakOpsi: e.target.checked })}
                    className="rounded border-input text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  <span>Acak Opsi Pilihan (A-B-C-D-E)</span>
                </label>
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setTambahOpen(false)}>
                Batal
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Rilis Sesi Ujian CBT
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL EDIT SESI */}
      <Dialog open={isEditOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Edit className="h-5 w-5 text-emerald-600" />
              Edit Sesi Ujian CBT
            </DialogTitle>
          </DialogHeader>

          {selectedUjian && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground">Judul Ujian</label>
                <Input
                  value={selectedUjian.judul}
                  onChange={(e) => setSelectedUjian({ ...selectedUjian, judul: e.target.value })}
                  className="mt-1 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground">Status Sesi</label>
                  <select
                    value={selectedUjian.status}
                    onChange={(e) =>
                      setSelectedUjian({
                        ...selectedUjian,
                        status: e.target.value as UjianCBT["status"],
                      })
                    }
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="AKTIF">Sesi Aktif</option>
                    <option value="DRAFT">Draft Terjadwal</option>
                    <option value="SELESAI">Selesai</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground">Durasi (Menit)</label>
                  <Input
                    type="number"
                    value={selectedUjian.durasiMenit}
                    onChange={(e) =>
                      setSelectedUjian({
                        ...selectedUjian,
                        durasiMenit: Number(e.target.value) || 90,
                      })
                    }
                    className="mt-1 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">KKM Kelulusan</label>
                <Input
                  type="number"
                  value={selectedUjian.kkm}
                  onChange={(e) =>
                    setSelectedUjian({ ...selectedUjian, kkm: Number(e.target.value) || 75 })
                  }
                  className="mt-1 text-sm"
                />
              </div>

              <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                  Batal
                </Button>
                <Button
                  onClick={() => {
                    if (selectedUjian) {
                      updateUjianCBT(selectedUjian.id, selectedUjian);
                      setEditOpen(false);
                    }
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Simpan Perubahan
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
