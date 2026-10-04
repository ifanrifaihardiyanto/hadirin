"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Package,
  Search,
  Plus,
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Layers,
  Wrench,
  Download,
  Building,
  User,
  Calendar,
  Share2,
  Trash2,
  Edit,
  Filter,
  Check,
  RotateCcw,
  Sparkles,
  Phone,
  FileText,
  Printer,
  Boxes,
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
  type AsetSarpras,
  type PeminjamanSarpras,
} from "@/lib/store";
import { cn } from "@/lib/utils";

const KATEGORI_CONFIG: Record<
  AsetSarpras["kategori"],
  { label: string; badgeClass: string }
> = {
  ELEKTRONIK: {
    label: "Elektronik & IT",
    badgeClass: "bg-blue-100 text-blue-900 border-blue-200",
  },
  MEDIA_AJAR: {
    label: "Media Pembelajaran",
    badgeClass: "bg-purple-100 text-purple-900 border-purple-200",
  },
  LABORATORIUM: {
    label: "Laboratorium IPA",
    badgeClass: "bg-emerald-100 text-emerald-900 border-emerald-200",
  },
  OLAHRAGA: {
    label: "Alat Olahraga",
    badgeClass: "bg-orange-100 text-orange-900 border-orange-200",
  },
  FURNITUR: {
    label: "Mebel & Furnitur",
    badgeClass: "bg-amber-100 text-amber-900 border-amber-200",
  },
  KENDARAAN: {
    label: "Operasional / Kendaraan",
    badgeClass: "bg-slate-100 text-slate-900 border-slate-200",
  },
};

const KONDISI_CONFIG: Record<
  AsetSarpras["kondisi"],
  { label: string; badgeClass: string; icon: any }
> = {
  BAIK: {
    label: "Kondisi Baik",
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: CheckCircle2,
  },
  RUSAK_RINGAN: {
    label: "Rusak Ringan",
    badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
    icon: AlertTriangle,
  },
  RUSAK_BERAT: {
    label: "Rusak Berat",
    badgeClass: "bg-rose-100 text-rose-800 border-rose-200",
    icon: XCircle,
  },
};

export default function AdminSarprasPage() {
  const {
    daftarAsetSarpras,
    tambahAsetSarpras,
    updateAsetSarpras,
    hapusAsetSarpras,
    daftarPeminjamanSarpras,
    tambahPeminjamanSarpras,
    selesaikanPeminjamanSarpras,
  } = useStore();

  const [activeTab, setActiveTab] = useState<"katalog" | "peminjaman" | "ruangan">("katalog");
  const [searchQuery, setSearchQuery] = useState("");
  const [kategoriFilter, setKategoriFilter] = useState<string>("SEMUA");
  const [kondisiFilter, setKondisiFilter] = useState<string>("SEMUA");
  const [lokasiFilter, setLokasiFilter] = useState<string>("SEMUA");

  // Modals
  const [isTambahAsetOpen, setTambahAsetOpen] = useState(false);
  const [isPinjamOpen, setPinjamOpen] = useState(false);
  const [isKembaliOpen, setKembaliOpen] = useState(false);
  const [isEditOpen, setEditOpen] = useState(false);
  const [isCetakOpen, setCetakOpen] = useState(false);

  // Modal states
  const [selectedPinjam, setSelectedPinjam] = useState<PeminjamanSarpras | null>(null);
  const [selectedAset, setSelectedAset] = useState<AsetSarpras | null>(null);

  // Form Tambah Aset
  const [formAset, setFormAset] = useState({
    kodeAset: "",
    namaAset: "",
    kategori: "ELEKTRONIK" as AsetSarpras["kategori"],
    merkModel: "",
    kondisi: "BAIK" as AsetSarpras["kondisi"],
    lokasi: "Laboratorium Komputer 1",
    jumlahTotal: 1,
    tahunPengadaan: new Date().getFullYear(),
    sumberDana: "BOS_REGULER" as AsetSarpras["sumberDana"],
    keterangan: "",
  });

  // Form Pinjam
  const [formPinjam, setFormPinjam] = useState({
    asetId: "",
    namaPeminjam: "",
    rolePeminjam: "GURU" as PeminjamanSarpras["rolePeminjam"],
    kontakPeminjam: "",
    jumlahUnit: 1,
    tanggalPinjam: new Date().toISOString().split("T")[0],
    batasKembali: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    keperluan: "",
  });

  // Form Pengembalian
  const [formKembali, setFormKembali] = useState({
    kondisiKembali: "BAIK" as "BAIK" | "RUSAK" | "HILANG",
    catatanPengembalian: "",
  });

  // Statistics
  const totalUnitSemua = useMemo(
    () => daftarAsetSarpras.reduce((acc, a) => acc + a.jumlahTotal, 0),
    [daftarAsetSarpras]
  );

  const totalUnitTersedia = useMemo(
    () => daftarAsetSarpras.reduce((acc, a) => acc + a.jumlahTersedia, 0),
    [daftarAsetSarpras]
  );

  const totalDipinjam = useMemo(
    () =>
      daftarPeminjamanSarpras.filter(
        (p) => p.status === "DIPINJAM" || p.status === "TERLAMBAT"
      ).reduce((acc, p) => acc + p.jumlahUnit, 0),
    [daftarPeminjamanSarpras]
  );

  const totalPerluPerbaikan = useMemo(
    () =>
      daftarAsetSarpras
        .filter((a) => a.kondisi !== "BAIK")
        .reduce((acc, a) => acc + a.jumlahTotal, 0),
    [daftarAsetSarpras]
  );

  // Unique rooms list
  const daftarRuanganUnik = useMemo(() => {
    const setRuang = new Set<string>();
    daftarAsetSarpras.forEach((a) => setRuang.add(a.lokasi));
    return Array.from(setRuang);
  }, [daftarAsetSarpras]);

  // Filtered Inventory
  const asetFiltered = useMemo(() => {
    return daftarAsetSarpras.filter((a) => {
      const matchSearch =
        searchQuery === "" ||
        a.namaAset.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.kodeAset.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.merkModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.lokasi.toLowerCase().includes(searchQuery.toLowerCase());

      const matchKategori =
        kategoriFilter === "SEMUA" || a.kategori === kategoriFilter;

      const matchKondisi =
        kondisiFilter === "SEMUA" || a.kondisi === kondisiFilter;

      const matchLokasi =
        lokasiFilter === "SEMUA" || a.lokasi === lokasiFilter;

      return matchSearch && matchKategori && matchKondisi && matchLokasi;
    });
  }, [daftarAsetSarpras, searchQuery, kategoriFilter, kondisiFilter, lokasiFilter]);

  // Filtered Loans
  const pinjamFiltered = useMemo(() => {
    return daftarPeminjamanSarpras.filter((p) => {
      const matchSearch =
        searchQuery === "" ||
        p.namaPeminjam.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.namaAset.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.kodePinjam.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.keperluan.toLowerCase().includes(searchQuery.toLowerCase());

      return matchSearch;
    });
  }, [daftarPeminjamanSarpras, searchQuery]);

  // Handle Submit Tambah Aset
  const handleSimpanAset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAset.namaAset.trim()) return;

    const kodeAuto =
      formAset.kodeAset.trim() ||
      `AST-${formAset.kategori.substring(0, 3)}-${String(
        daftarAsetSarpras.length + 1
      ).padStart(3, "0")}`;

    tambahAsetSarpras({
      ...formAset,
      kodeAset: kodeAuto,
      jumlahTotal: Number(formAset.jumlahTotal) || 1,
      jumlahTersedia: Number(formAset.jumlahTotal) || 1,
      tahunPengadaan: Number(formAset.tahunPengadaan) || new Date().getFullYear(),
    });

    setFormAset({
      kodeAset: "",
      namaAset: "",
      kategori: "ELEKTRONIK",
      merkModel: "",
      kondisi: "BAIK",
      lokasi: "Laboratorium Komputer 1",
      jumlahTotal: 1,
      tahunPengadaan: new Date().getFullYear(),
      sumberDana: "BOS_REGULER",
      keterangan: "",
    });
    setTambahAsetOpen(false);
  };

  // Handle Buka Pinjam Cepat
  const handleBukaPinjamAset = (aset: AsetSarpras) => {
    setFormPinjam({
      asetId: aset.id,
      namaPeminjam: "",
      rolePeminjam: "GURU",
      kontakPeminjam: "",
      jumlahUnit: 1,
      tanggalPinjam: new Date().toISOString().split("T")[0],
      batasKembali: new Date(Date.now() + 86400000).toISOString().split("T")[0],
      keperluan: "",
    });
    setPinjamOpen(true);
  };

  // Handle Submit Pinjam
  const handleSimpanPinjam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPinjam.asetId || !formPinjam.namaPeminjam.trim()) return;

    const targetAset = daftarAsetSarpras.find((a) => a.id === formPinjam.asetId);
    if (!targetAset) return;

    tambahPeminjamanSarpras({
      asetId: targetAset.id,
      namaAset: targetAset.namaAset,
      kodeAset: targetAset.kodeAset,
      namaPeminjam: formPinjam.namaPeminjam,
      rolePeminjam: formPinjam.rolePeminjam,
      kontakPeminjam: formPinjam.kontakPeminjam || "0812-xxxx-xxxx",
      jumlahUnit: Math.min(
        Number(formPinjam.jumlahUnit) || 1,
        targetAset.jumlahTersedia
      ),
      tanggalPinjam: formPinjam.tanggalPinjam,
      batasKembali: formPinjam.batasKembali,
      keperluan: formPinjam.keperluan || "Kegiatan Pembelajaran",
    });

    setPinjamOpen(false);
  };

  // Handle Selesaikan Pengembalian
  const handleSimpanKembali = () => {
    if (!selectedPinjam) return;
    selesaikanPeminjamanSarpras(
      selectedPinjam.id,
      formKembali.kondisiKembali,
      formKembali.catatanPengembalian
    );
    setKembaliOpen(false);
    setSelectedPinjam(null);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      "Kode Aset",
      "Nama Barang",
      "Kategori",
      "Merk/Spesifikasi",
      "Kondisi",
      "Lokasi Ruangan",
      "Total Unit",
      "Tersedia",
      "Tahun Pengadaan",
      "Sumber Dana",
      "Keterangan",
    ];

    const rows = daftarAsetSarpras.map((a) => [
      `"${a.kodeAset}"`,
      `"${a.namaAset}"`,
      `"${KATEGORI_CONFIG[a.kategori]?.label || a.kategori}"`,
      `"${a.merkModel}"`,
      `"${a.kondisi}"`,
      `"${a.lokasi}"`,
      a.jumlahTotal,
      a.jumlahTersedia,
      a.tahunPengadaan,
      `"${a.sumberDana}"`,
      `"${a.keterangan || ""}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Inventaris_Sarpras_${new Date().toISOString().split("T")[0]}.csv`);
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
              SIM Aset Terpadu
            </Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Package className="h-6 w-6 text-emerald-600" />
            Sarana, Prasarana & Inventaris Sekolah
          </h1>
          <p className="text-sm text-muted-foreground">
            Pencatatan aset sarana, sirkulasi peminjaman alat KBM, audit kondisi ruangan, dan SPJ inventaris BOS.
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
            Export CSV
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (daftarAsetSarpras.length > 0) {
                setFormPinjam((prev) => ({ ...prev, asetId: daftarAsetSarpras[0].id }));
              }
              setPinjamOpen(true);
            }}
            className="gap-1.5 text-xs bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border-emerald-200"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Catat Peminjaman
          </Button>

          <Button
            size="sm"
            onClick={() => setTambahAsetOpen(true)}
            className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
          >
            <Plus className="h-4 w-4" />
            Tambah Aset Baru
          </Button>
        </div>
      </div>

      {/* KPI METRICS */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card className="border border-border/60 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Aset Terdaftar</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold tracking-tight text-foreground">{daftarAsetSarpras.length}</span>
                <span className="text-xs text-muted-foreground">katalog ({totalUnitSemua} unit)</span>
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-sky-50 text-sky-700">
              <Boxes className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Unit Siap Pakai (Tersedia)</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold tracking-tight text-emerald-700">{totalUnitTersedia}</span>
                <span className="text-xs text-muted-foreground">
                  ({Math.round((totalUnitTersedia / (totalUnitSemua || 1)) * 100)}% siap)
                </span>
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Sedang Dipinjam</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold tracking-tight text-amber-700">{totalDipinjam}</span>
                <span className="text-xs text-muted-foreground">unit aktif</span>
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-50 text-amber-700">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Perlu Perbaikan</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold tracking-tight text-rose-700">{totalPerluPerbaikan}</span>
                <span className="text-xs text-muted-foreground">unit rusak/servis</span>
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-rose-50 text-rose-700">
              <Wrench className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab("katalog")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
            activeTab === "katalog"
              ? "border-emerald-600 text-emerald-700 font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Package className="h-4 w-4" />
          Katalog & Inventaris Barang ({daftarAsetSarpras.length})
        </button>

        <button
          onClick={() => setActiveTab("peminjaman")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
            activeTab === "peminjaman"
              ? "border-emerald-600 text-emerald-700 font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <RotateCcw className="h-4 w-4" />
          Sirkulasi Peminjaman ({daftarPeminjamanSarpras.length})
        </button>

        <button
          onClick={() => setActiveTab("ruangan")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
            activeTab === "ruangan"
              ? "border-emerald-600 text-emerald-700 font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Building className="h-4 w-4" />
          Audit Ruangan ({daftarRuanganUnik.length})
        </button>
      </div>

      {/* TAB 1: KATALOG INVENTARIS */}
      {activeTab === "katalog" && (
        <div className="space-y-4">
          {/* SEARCH & FILTERS */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-card p-3 rounded-lg border border-border">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari aset, kode inventaris, merk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-sm h-9"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                aria-label="Filter Kategori"
                value={kategoriFilter}
                onChange={(e) => setKategoriFilter(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs focus:ring-1 focus:ring-ring"
              >
                <option value="SEMUA">Semua Kategori</option>
                <option value="ELEKTRONIK">Elektronik & IT</option>
                <option value="MEDIA_AJAR">Media Pembelajaran</option>
                <option value="LABORATORIUM">Laboratorium IPA</option>
                <option value="OLAHRAGA">Alat Olahraga</option>
                <option value="FURNITUR">Mebel & Furnitur</option>
                <option value="KENDARAAN">Kendaraan</option>
              </select>

              <select
                aria-label="Filter Kondisi"
                value={kondisiFilter}
                onChange={(e) => setKondisiFilter(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs focus:ring-1 focus:ring-ring"
              >
                <option value="SEMUA">Semua Kondisi</option>
                <option value="BAIK">Kondisi Baik</option>
                <option value="RUSAK_RINGAN">Rusak Ringan</option>
                <option value="RUSAK_BERAT">Rusak Berat</option>
              </select>

              <select
                aria-label="Filter Ruangan"
                value={lokasiFilter}
                onChange={(e) => setLokasiFilter(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs focus:ring-1 focus:ring-ring"
              >
                <option value="SEMUA">Semua Ruangan</option>
                {daftarRuanganUnik.map((ruang) => (
                  <option key={ruang} value={ruang}>
                    {ruang}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* TABLE OF ASSETS */}
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-xs font-semibold uppercase text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-4 py-3">Kode & Nama Barang</th>
                    <th className="px-4 py-3">Kategori</th>
                    <th className="px-4 py-3">Lokasi Ruangan</th>
                    <th className="px-4 py-3">Ketersediaan</th>
                    <th className="px-4 py-3">Kondisi</th>
                    <th className="px-4 py-3">Sumber Dana</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {asetFiltered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground text-sm">
                        Tidak ada barang yang cocok dengan kriteria filter pencarian.
                      </td>
                    </tr>
                  ) : (
                    asetFiltered.map((aset) => {
                      const KategoriConf = KATEGORI_CONFIG[aset.kategori];
                      const KondisiConf = KONDISI_CONFIG[aset.kondisi];
                      const KondisiIcon = KondisiConf?.icon || CheckCircle2;
                      const persentaseTersedia = Math.round(
                        (aset.jumlahTersedia / (aset.jumlahTotal || 1)) * 100
                      );

                      return (
                        <tr key={aset.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-semibold text-foreground">{aset.namaAset}</div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="font-mono text-xs text-muted-foreground font-medium bg-muted px-1.5 py-0.5 rounded">
                                {aset.kodeAset}
                              </span>
                              <span className="text-xs text-muted-foreground">{aset.merkModel}</span>
                            </div>
                            {aset.keterangan && (
                              <p className="text-[11px] text-muted-foreground italic mt-0.5">
                                {aset.keterangan}
                              </p>
                            )}
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap">
                            <Badge
                              variant="outline"
                              className={cn("text-[11px] font-medium", KategoriConf?.badgeClass)}
                            >
                              {KategoriConf?.label || aset.kategori}
                            </Badge>
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
                              <Building className="h-3.5 w-3.5 text-muted-foreground" />
                              {aset.lokasi}
                            </div>
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="text-xs font-semibold text-foreground">
                                {aset.jumlahTersedia} / {aset.jumlahTotal} unit
                              </div>
                              <span className="text-[11px] text-muted-foreground">
                                ({persentaseTersedia}%)
                              </span>
                            </div>
                            <div className="w-24 bg-muted h-1.5 rounded-full overflow-hidden mt-1">
                              <div
                                className={cn(
                                  "h-full rounded-full",
                                  persentaseTersedia > 50
                                    ? "bg-emerald-500"
                                    : persentaseTersedia > 20
                                    ? "bg-amber-500"
                                    : "bg-rose-500"
                                )}
                                style={{ width: `${persentaseTersedia}%` }}
                              />
                            </div>
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[11px] font-medium gap-1 flex items-center w-fit",
                                KondisiConf?.badgeClass
                              )}
                            >
                              <KondisiIcon className="h-3 w-3" />
                              {KondisiConf?.label || aset.kondisi}
                            </Badge>
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
                            <div>{aset.sumberDana.replace("_", " ")}</div>
                            <div className="text-[11px]">Thn {aset.tahunPengadaan}</div>
                          </td>

                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={aset.jumlahTersedia === 0}
                                onClick={() => handleBukaPinjamAset(aset)}
                                className="h-7 text-xs px-2 gap-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border-emerald-200"
                                title="Pinjamkan Barang"
                              >
                                <RotateCcw className="h-3 w-3" />
                                Pinjam
                              </Button>

                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedAset(aset);
                                  setEditOpen(true);
                                }}
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                                title="Edit Aset"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>

                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  if (confirm(`Yakin ingin menghapus ${aset.namaAset}?`)) {
                                    hapusAsetSarpras(aset.id);
                                  }
                                }}
                                className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                                title="Hapus Aset"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
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

      {/* TAB 2: SIRKULASI PEMINJAMAN */}
      {activeTab === "peminjaman" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-card p-3 rounded-lg border border-border">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama peminjam, barang, nomor pinjam..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-sm h-9"
              />
            </div>

            <Button
              size="sm"
              onClick={() => {
                if (daftarAsetSarpras.length > 0) {
                  setFormPinjam((prev) => ({ ...prev, asetId: daftarAsetSarpras[0].id }));
                }
                setPinjamOpen(true);
              }}
              className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Plus className="h-4 w-4" />
              Catat Peminjaman Baru
            </Button>
          </div>

          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-xs font-semibold uppercase text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-4 py-3">No. Transaksi</th>
                    <th className="px-4 py-3">Barang yang Dipinjam</th>
                    <th className="px-4 py-3">Peminjam</th>
                    <th className="px-4 py-3">Keperluan</th>
                    <th className="px-4 py-3">Jadwal Pinjam</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pinjamFiltered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground text-sm">
                        Belum ada data peminjaman yang tercatat.
                      </td>
                    </tr>
                  ) : (
                    pinjamFiltered.map((pinjam) => {
                      const isTerlambat = pinjam.status === "TERLAMBAT";
                      const isKembali = pinjam.status === "KEMBALI";

                      return (
                        <tr key={pinjam.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="font-mono text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              {pinjam.kodePinjam}
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            <div className="font-semibold text-foreground">{pinjam.namaAset}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                              <span className="font-mono">{pinjam.kodeAset}</span>
                              <span>•</span>
                              <span className="font-medium text-emerald-700">
                                {pinjam.jumlahUnit} unit
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="font-medium text-foreground">{pinjam.namaPeminjam}</div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Badge variant="outline" className="text-[10px] py-0 px-1">
                                {pinjam.rolePeminjam}
                              </Badge>
                              <span>{pinjam.kontakPeminjam}</span>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <div className="text-xs text-foreground line-clamp-2 max-w-xs">
                              {pinjam.keperluan}
                            </div>
                            {pinjam.catatanPengembalian && (
                              <div className="text-[11px] text-emerald-700 mt-0.5 italic">
                                Ket. Kembali: {pinjam.catatanPengembalian}
                              </div>
                            )}
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap text-xs">
                            <div>Pinjam: {pinjam.tanggalPinjam}</div>
                            <div
                              className={cn(
                                "font-medium",
                                isTerlambat ? "text-rose-600 font-semibold" : "text-muted-foreground"
                              )}
                            >
                              Tenggat: {pinjam.batasKembali}
                            </div>
                            {pinjam.tanggalKembali && (
                              <div className="text-emerald-700 text-[11px]">
                                Dikembalikan: {pinjam.tanggalKembali}
                              </div>
                            )}
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap">
                            {isKembali ? (
                              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs">
                                Selesai Kembali ({pinjam.kondisiKembali || "BAIK"})
                              </Badge>
                            ) : isTerlambat ? (
                              <Badge className="bg-rose-100 text-rose-800 border-rose-200 text-xs">
                                Terlambat
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs">
                                Sedang Dipinjam
                              </Badge>
                            )}
                          </td>

                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {!isKembali ? (
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setSelectedPinjam(pinjam);
                                    setFormKembali({
                                      kondisiKembali: "BAIK",
                                      catatanPengembalian: "",
                                    });
                                    setKembaliOpen(true);
                                  }}
                                  className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                                >
                                  <Check className="h-3 w-3" />
                                  Kembalikan
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedPinjam(pinjam);
                                    setCetakOpen(true);
                                  }}
                                  className="h-7 text-xs gap-1"
                                >
                                  <Printer className="h-3 w-3" />
                                  Bukti
                                </Button>
                              )}
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

      {/* TAB 3: AUDIT RUANGAN */}
      {activeTab === "ruangan" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {daftarRuanganUnik.map((ruang) => {
              const asetRuang = daftarAsetSarpras.filter((a) => a.lokasi === ruang);
              const totalUnit = asetRuang.reduce((acc, a) => acc + a.jumlahTotal, 0);
              const totalBaik = asetRuang
                .filter((a) => a.kondisi === "BAIK")
                .reduce((acc, a) => acc + a.jumlahTotal, 0);
              const totalRusak = asetRuang
                .filter((a) => a.kondisi !== "BAIK")
                .reduce((acc, a) => acc + a.jumlahTotal, 0);
              const persentaseBaik = Math.round((totalBaik / (totalUnit || 1)) * 100);

              return (
                <Card key={ruang} className="border border-border/70 shadow-xs hover:border-emerald-300 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                          <Building className="h-4 w-4" />
                        </div>
                        <div>
                          <CardTitle className="text-base font-bold text-foreground">{ruang}</CardTitle>
                          <p className="text-xs text-muted-foreground">{asetRuang.length} jenis item terdata</p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-3 gap-2 p-2.5 bg-muted/40 rounded-lg text-center">
                      <div>
                        <div className="text-lg font-bold text-foreground">{totalUnit}</div>
                        <div className="text-[10px] text-muted-foreground">Total Unit</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-emerald-600">{totalBaik}</div>
                        <div className="text-[10px] text-muted-foreground">Kondisi Baik</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-rose-600">{totalRusak}</div>
                        <div className="text-[10px] text-muted-foreground">Butuh Servis</div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Kelayakan Fasilitas</span>
                        <span className="font-semibold text-emerald-700">{persentaseBaik}%</span>
                      </div>
                      <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full rounded-full transition-all"
                          style={{ width: `${persentaseBaik}%` }}
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border flex items-center justify-between">
                      <div className="text-[11px] text-muted-foreground">
                        {totalRusak > 0 ? (
                          <span className="text-amber-600 font-medium flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" /> Ada alat rusak
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-medium flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Semua siap pakai
                          </span>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setLokasiFilter(ruang);
                          setActiveTab("katalog");
                        }}
                        className="text-xs text-emerald-700 hover:text-emerald-800 h-7 px-2"
                      >
                        Lihat Item
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL TAMBAH ASET BARU */}
      <Dialog open={isTambahAsetOpen} onOpenChange={setTambahAsetOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Package className="h-5 w-5 text-emerald-600" />
              Pencatatan Inventaris Aset Baru
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSimpanAset} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground">Nama Barang / Aset *</label>
                <Input
                  required
                  placeholder="Contoh: Proyektor Epson EB-E500"
                  value={formAset.namaAset}
                  onChange={(e) => setFormAset({ ...formAset, namaAset: e.target.value })}
                  className="mt-1 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Kode Register (Opsional)</label>
                <Input
                  placeholder="Kosongkan untuk auto-generate"
                  value={formAset.kodeAset}
                  onChange={(e) => setFormAset({ ...formAset, kodeAset: e.target.value })}
                  className="mt-1 text-sm font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground">Kategori Aset</label>
                <select
                  value={formAset.kategori}
                  onChange={(e) =>
                    setFormAset({
                      ...formAset,
                      kategori: e.target.value as AsetSarpras["kategori"],
                    })
                  }
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="ELEKTRONIK">Elektronik & IT</option>
                  <option value="MEDIA_AJAR">Media Pembelajaran</option>
                  <option value="LABORATORIUM">Laboratorium IPA</option>
                  <option value="OLAHRAGA">Alat Olahraga</option>
                  <option value="FURNITUR">Mebel & Furnitur</option>
                  <option value="KENDARAAN">Operasional / Kendaraan</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Merk & Seri Model</label>
                <Input
                  placeholder="Contoh: Asus ExpertBook B1400"
                  value={formAset.merkModel}
                  onChange={(e) => setFormAset({ ...formAset, merkModel: e.target.value })}
                  className="mt-1 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground">Lokasi Ruangan Penempatan</label>
                <Input
                  required
                  placeholder="Contoh: Laboratorium Komputer 1"
                  value={formAset.lokasi}
                  onChange={(e) => setFormAset({ ...formAset, lokasi: e.target.value })}
                  className="mt-1 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Jumlah Total Unit</label>
                <Input
                  type="number"
                  min="1"
                  required
                  value={formAset.jumlahTotal}
                  onChange={(e) =>
                    setFormAset({ ...formAset, jumlahTotal: Number(e.target.value) || 1 })
                  }
                  className="mt-1 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground">Kondisi Awal</label>
                <select
                  value={formAset.kondisi}
                  onChange={(e) =>
                    setFormAset({
                      ...formAset,
                      kondisi: e.target.value as AsetSarpras["kondisi"],
                    })
                  }
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="BAIK">Kondisi Baik</option>
                  <option value="RUSAK_RINGAN">Rusak Ringan</option>
                  <option value="RUSAK_BERAT">Rusak Berat</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Tahun Perolehan</label>
                <Input
                  type="number"
                  value={formAset.tahunPengadaan}
                  onChange={(e) =>
                    setFormAset({
                      ...formAset,
                      tahunPengadaan: Number(e.target.value) || new Date().getFullYear(),
                    })
                  }
                  className="mt-1 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Sumber Dana</label>
                <select
                  value={formAset.sumberDana}
                  onChange={(e) =>
                    setFormAset({
                      ...formAset,
                      sumberDana: e.target.value as AsetSarpras["sumberDana"],
                    })
                  }
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="BOS_REGULER">BOS Reguler</option>
                  <option value="BOS_KINERJA">BOS Kinerja</option>
                  <option value="KOMITE">Dana Komite</option>
                  <option value="HIBAH_PEMDA">Hibah Pemda</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">Keterangan Tambahan / Spesifikasi</label>
              <textarea
                rows={2}
                placeholder="Catatan serial number, garansi distributor, peruntukan KBM..."
                value={formAset.keterangan}
                onChange={(e) => setFormAset({ ...formAset, keterangan: e.target.value })}
                className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm"
              />
            </div>

            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setTambahAsetOpen(false)}>
                Batal
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Simpan ke Inventaris
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL PINJAM BARANG */}
      <Dialog open={isPinjamOpen} onOpenChange={setPinjamOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <RotateCcw className="h-5 w-5 text-emerald-600" />
              Pencatatan Peminjaman Sarpras
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSimpanPinjam} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground">Pilih Barang yang Dipinjam *</label>
              <select
                required
                value={formPinjam.asetId}
                onChange={(e) => setFormPinjam({ ...formPinjam, asetId: e.target.value })}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {daftarAsetSarpras.map((aset) => (
                  <option key={aset.id} value={aset.id} disabled={aset.jumlahTersedia === 0}>
                    {aset.namaAset} ({aset.kodeAset}) - Tersedia: {aset.jumlahTersedia} unit
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground">Nama Peminjam *</label>
                <Input
                  required
                  placeholder="Nama guru / perwakilan siswa"
                  value={formPinjam.namaPeminjam}
                  onChange={(e) => setFormPinjam({ ...formPinjam, namaPeminjam: e.target.value })}
                  className="mt-1 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Status / Role Peminjam</label>
                <select
                  value={formPinjam.rolePeminjam}
                  onChange={(e) =>
                    setFormPinjam({
                      ...formPinjam,
                      rolePeminjam: e.target.value as PeminjamanSarpras["rolePeminjam"],
                    })
                  }
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="GURU">Guru / Pengajar</option>
                  <option value="SISWA">Siswa / Pengurus OSIS</option>
                  <option value="STAF_TU">Staf Tata Usaha</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground">Nomor Telepon / WhatsApp</label>
                <Input
                  placeholder="0812-xxxx-xxxx"
                  value={formPinjam.kontakPeminjam}
                  onChange={(e) =>
                    setFormPinjam({ ...formPinjam, kontakPeminjam: e.target.value })
                  }
                  className="mt-1 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Jumlah Unit Dipinjam</label>
                <Input
                  type="number"
                  min="1"
                  required
                  value={formPinjam.jumlahUnit}
                  onChange={(e) =>
                    setFormPinjam({ ...formPinjam, jumlahUnit: Number(e.target.value) || 1 })
                  }
                  className="mt-1 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground">Tanggal Peminjaman</label>
                <Input
                  type="date"
                  required
                  value={formPinjam.tanggalPinjam}
                  onChange={(e) =>
                    setFormPinjam({ ...formPinjam, tanggalPinjam: e.target.value })
                  }
                  className="mt-1 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Batas Tanggal Pengembalian</label>
                <Input
                  type="date"
                  required
                  value={formPinjam.batasKembali}
                  onChange={(e) =>
                    setFormPinjam({ ...formPinjam, batasKembali: e.target.value })
                  }
                  className="mt-1 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">Keperluan / Acara</label>
              <textarea
                rows={2}
                required
                placeholder="Contoh: Praktikum Fisika Kelas XI, Rapat OSIS, Presentasi Kurikulum Merdeka..."
                value={formPinjam.keperluan}
                onChange={(e) => setFormPinjam({ ...formPinjam, keperluan: e.target.value })}
                className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm"
              />
            </div>

            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setPinjamOpen(false)}>
                Batal
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Konfirmasi Peminjaman
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL PENGEMBALIAN BARANG */}
      <Dialog open={isKembaliOpen} onOpenChange={setKembaliOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              Konfirmasi Pengembalian Barang
            </DialogTitle>
          </DialogHeader>

          {selectedPinjam && (
            <div className="space-y-4">
              <div className="p-3 bg-muted/50 rounded-lg space-y-1 text-xs">
                <div className="font-semibold text-foreground text-sm">
                  {selectedPinjam.namaAset} ({selectedPinjam.jumlahUnit} unit)
                </div>
                <div className="text-muted-foreground">
                  Peminjam: <span className="font-medium text-foreground">{selectedPinjam.namaPeminjam}</span> (
                  {selectedPinjam.rolePeminjam})
                </div>
                <div className="text-muted-foreground">
                  Tenggat Pengembalian: {selectedPinjam.batasKembali}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Kondisi Barang Saat Dikembalikan</label>
                <select
                  value={formKembali.kondisiKembali}
                  onChange={(e) =>
                    setFormKembali({
                      ...formKembali,
                      kondisiKembali: e.target.value as "BAIK" | "RUSAK" | "HILANG",
                    })
                  }
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="BAIK">Kondisi Baik & Lengkap</option>
                  <option value="RUSAK">Ada Kerusakan / Cacat</option>
                  <option value="HILANG">Barang Hilang / Kurang</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Catatan Petugas Sarpras</label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Kabel dan charger lengkap, telah dicek berfungsi normal."
                  value={formKembali.catatanPengembalian}
                  onChange={(e) =>
                    setFormKembali({ ...formKembali, catatanPengembalian: e.target.value })
                  }
                  className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm"
                />
              </div>

              <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={() => setKembaliOpen(false)}>
                  Batal
                </Button>
                <Button onClick={handleSimpanKembali} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Verifikasi Terima Kembali
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* MODAL EDIT ASET */}
      <Dialog open={isEditOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Edit className="h-5 w-5 text-emerald-600" />
              Edit Status & Lokasi Aset
            </DialogTitle>
          </DialogHeader>

          {selectedAset && (
            <div className="space-y-4">
              <div className="p-2.5 bg-muted/40 rounded-lg text-xs space-y-0.5">
                <div className="font-semibold text-foreground">{selectedAset.namaAset}</div>
                <div className="font-mono text-muted-foreground">{selectedAset.kodeAset}</div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Lokasi / Ruangan</label>
                <Input
                  value={selectedAset.lokasi}
                  onChange={(e) => setSelectedAset({ ...selectedAset, lokasi: e.target.value })}
                  className="mt-1 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground">Kondisi Terkini</label>
                  <select
                    value={selectedAset.kondisi}
                    onChange={(e) =>
                      setSelectedAset({
                        ...selectedAset,
                        kondisi: e.target.value as AsetSarpras["kondisi"],
                      })
                    }
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="BAIK">Kondisi Baik</option>
                    <option value="RUSAK_RINGAN">Rusak Ringan</option>
                    <option value="RUSAK_BERAT">Rusak Berat</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground">Unit Tersedia</label>
                  <Input
                    type="number"
                    min="0"
                    max={selectedAset.jumlahTotal}
                    value={selectedAset.jumlahTersedia}
                    onChange={(e) =>
                      setSelectedAset({
                        ...selectedAset,
                        jumlahTersedia: Number(e.target.value) || 0,
                      })
                    }
                    className="mt-1 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Keterangan / Catatan Teknis</label>
                <textarea
                  rows={2}
                  value={selectedAset.keterangan || ""}
                  onChange={(e) => setSelectedAset({ ...selectedAset, keterangan: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm"
                />
              </div>

              <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                  Batal
                </Button>
                <Button
                  onClick={() => {
                    if (selectedAset) {
                      updateAsetSarpras(selectedAset.id, selectedAset);
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

      {/* MODAL CETAK BUKTI PEMINJAMAN */}
      <Dialog open={isCetakOpen} onOpenChange={setCetakOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Printer className="h-5 w-5 text-emerald-600" />
              Bukti Pengembalian Sarana
            </DialogTitle>
          </DialogHeader>

          {selectedPinjam && (
            <div className="space-y-4">
              <div className="p-4 border border-dashed border-border rounded-lg bg-card space-y-3 text-xs">
                <div className="text-center pb-2 border-b border-border">
                  <div className="font-bold text-sm tracking-wide">SMA NEGERI CONTOH</div>
                  <div className="text-muted-foreground text-[11px]">
                    BUKTI RESMI SIRKULASI SARANA & PRASARANA SEKOLAH
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1 text-[12px]">
                  <span className="text-muted-foreground">No. Transaksi:</span>
                  <span className="font-mono font-bold text-right">{selectedPinjam.kodePinjam}</span>
                  <span className="text-muted-foreground">Peminjam:</span>
                  <span className="font-semibold text-right">{selectedPinjam.namaPeminjam}</span>
                  <span className="text-muted-foreground">Barang:</span>
                  <span className="text-right">{selectedPinjam.namaAset}</span>
                  <span className="text-muted-foreground">Jumlah:</span>
                  <span className="text-right">{selectedPinjam.jumlahUnit} unit</span>
                  <span className="text-muted-foreground">Tgl Pinjam:</span>
                  <span className="text-right">{selectedPinjam.tanggalPinjam}</span>
                  <span className="text-muted-foreground">Tgl Kembali:</span>
                  <span className="text-right font-medium text-emerald-700">
                    {selectedPinjam.tanggalKembali || selectedPinjam.batasKembali}
                  </span>
                  <span className="text-muted-foreground">Kondisi Akhir:</span>
                  <span className="text-right font-semibold">
                    {selectedPinjam.kondisiKembali || "BAIK"}
                  </span>
                </div>

                <div className="pt-2 border-t border-border text-center text-[10px] text-muted-foreground">
                  Barang telah diverifikasi dan diserahterimakan dengan tertib ke bagian Tata Usaha / Sarpras.
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setCetakOpen(false)}>
                  Tutup
                </Button>
                <Button
                  onClick={() => window.print()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                >
                  <Printer className="h-4 w-4" />
                  Cetak Dokumen
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
