"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Library,
  BookOpen,
  Search,
  Plus,
  ArrowLeft,
  Download,
  BookMarked,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  Building,
  User,
  Calendar,
  Trash2,
  Edit,
  ExternalLink,
  Printer,
  FileText,
  BadgeAlert,
  Coins,
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
  type BukuPerpus,
  type PeminjamanBuku,
} from "@/lib/store";
import { cn } from "@/lib/utils";

const KATEGORI_CONFIG: Record<
  BukuPerpus["kategori"],
  { label: string; badgeClass: string }
> = {
  BUKU_TEKS: {
    label: "Buku Teks Wajib",
    badgeClass: "bg-blue-100 text-blue-900 border-blue-200",
  },
  FIKSI: {
    label: "Fiksi & Sastra",
    badgeClass: "bg-purple-100 text-purple-900 border-purple-200",
  },
  SAINS: {
    label: "Sains & Teknologi",
    badgeClass: "bg-emerald-100 text-emerald-900 border-emerald-200",
  },
  SEJARAH: {
    label: "Sejarah & Sosial",
    badgeClass: "bg-amber-100 text-amber-900 border-amber-200",
  },
  AGAMA: {
    label: "Agama & Budi Pekerti",
    badgeClass: "bg-teal-100 text-teal-900 border-teal-200",
  },
  REFERENSI: {
    label: "Ensiklopedia & Ref.",
    badgeClass: "bg-rose-100 text-rose-900 border-rose-200",
  },
};

export default function AdminPerpusPage() {
  const {
    daftarBuku,
    tambahBuku,
    updateBuku,
    hapusBuku,
    daftarPeminjamanBuku,
    pinjamBuku,
    kembalikanBuku,
    bayarDendaBuku,
  } = useStore();

  const [activeTab, setActiveTab] = useState<"katalog" | "sirkulasi" | "rak">("katalog");
  const [searchQuery, setSearchQuery] = useState("");
  const [kategoriFilter, setKategoriFilter] = useState<string>("SEMUA");
  const [formatFilter, setFormatFilter] = useState<string>("SEMUA");
  const [statusSirkulasiFilter, setStatusSirkulasiFilter] = useState<string>("SEMUA");

  // Modals
  const [isTambahBukuOpen, setTambahBukuOpen] = useState(false);
  const [isPinjamOpen, setPinjamOpen] = useState(false);
  const [isKembaliOpen, setKembaliOpen] = useState(false);
  const [isEditOpen, setEditOpen] = useState(false);
  const [isCetakOpen, setCetakOpen] = useState(false);

  // Selected items
  const [selectedBuku, setSelectedBuku] = useState<BukuPerpus | null>(null);
  const [selectedPinjam, setSelectedPinjam] = useState<PeminjamanBuku | null>(null);

  // Form Tambah Buku
  const [formBuku, setFormBuku] = useState({
    isbn: "",
    kodeBuku: "",
    judul: "",
    pengarang: "",
    penerbit: "",
    tahunTerbit: new Date().getFullYear(),
    kategori: "BUKU_TEKS" as BukuPerpus["kategori"],
    lokasiRak: "Rak A-01 (MIPA)",
    jumlahEksemplar: 5,
    tipeFormat: "FISIK" as BukuPerpus["tipeFormat"],
    ebookUrl: "",
    sinopsis: "",
  });

  // Form Pinjam Buku
  const [formPinjam, setFormPinjam] = useState({
    bukuId: "",
    namaPeminjam: "",
    nomorIdentitas: "",
    rolePeminjam: "SISWA" as PeminjamanBuku["rolePeminjam"],
    kelasAtauUnit: "X IPA 1",
    tanggalPinjam: new Date().toISOString().split("T")[0],
    batasKembali: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
  });

  // Form Pengembalian Buku
  const [formKembali, setFormKembali] = useState({
    denda: 0,
    catatanPetugas: "",
  });

  // KPI Calculations
  const totalJudul = daftarBuku.length;
  const totalEksemplar = useMemo(
    () => daftarBuku.reduce((acc, b) => acc + b.jumlahEksemplar, 0),
    [daftarBuku]
  );
  const totalTersedia = useMemo(
    () => daftarBuku.reduce((acc, b) => acc + b.eksemplarTersedia, 0),
    [daftarBuku]
  );
  const totalDipinjamAktif = useMemo(
    () =>
      daftarPeminjamanBuku.filter(
        (p) => p.status === "DIPINJAM" || p.status === "TERLAMBAT"
      ).length,
    [daftarPeminjamanBuku]
  );
  const totalTerlambat = useMemo(
    () => daftarPeminjamanBuku.filter((p) => p.status === "TERLAMBAT").length,
    [daftarPeminjamanBuku]
  );
  const totalDendaTertunggak = useMemo(
    () =>
      daftarPeminjamanBuku
        .filter((p) => p.statusDenda === "BELUM_LUNAS")
        .reduce((acc, p) => acc + p.denda, 0),
    [daftarPeminjamanBuku]
  );

  // List of distinct book racks
  const daftarRakUnik = useMemo(() => {
    const s = new Set<string>();
    daftarBuku.forEach((b) => s.add(b.lokasiRak));
    return Array.from(s);
  }, [daftarBuku]);

  // Filtered Books
  const bukuFiltered = useMemo(() => {
    return daftarBuku.filter((b) => {
      const matchSearch =
        searchQuery === "" ||
        b.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.pengarang.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.penerbit.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.isbn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.kodeBuku.toLowerCase().includes(searchQuery.toLowerCase());

      const matchKategori =
        kategoriFilter === "SEMUA" || b.kategori === kategoriFilter;

      const matchFormat =
        formatFilter === "SEMUA" ||
        (formatFilter === "EBOOK" && (b.tipeFormat === "EBOOK" || b.tipeFormat === "FISIK_DAN_EBOOK")) ||
        (formatFilter === "FISIK" && (b.tipeFormat === "FISIK" || b.tipeFormat === "FISIK_DAN_EBOOK"));

      return matchSearch && matchKategori && matchFormat;
    });
  }, [daftarBuku, searchQuery, kategoriFilter, formatFilter]);

  // Filtered Loans
  const sirkulasiFiltered = useMemo(() => {
    return daftarPeminjamanBuku.filter((p) => {
      const matchSearch =
        searchQuery === "" ||
        p.namaPeminjam.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.judulBuku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.kodePinjam.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.nomorIdentitas.includes(searchQuery);

      const matchStatus =
        statusSirkulasiFilter === "SEMUA" || p.status === statusSirkulasiFilter;

      return matchSearch && matchStatus;
    });
  }, [daftarPeminjamanBuku, searchQuery, statusSirkulasiFilter]);

  // Submit Tambah Buku
  const handleSimpanBuku = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formBuku.judul.trim()) return;

    const kodeAuto =
      formBuku.kodeBuku.trim() ||
      `BK-${formBuku.kategori.substring(0, 3)}-${String(daftarBuku.length + 1).padStart(3, "0")}`;

    tambahBuku({
      ...formBuku,
      kodeBuku: kodeAuto,
      isbn: formBuku.isbn.trim() || `978-602-${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}-1`,
      jumlahEksemplar: Number(formBuku.jumlahEksemplar) || 1,
      eksemplarTersedia: Number(formBuku.jumlahEksemplar) || 1,
      tahunTerbit: Number(formBuku.tahunTerbit) || new Date().getFullYear(),
    });

    setFormBuku({
      isbn: "",
      kodeBuku: "",
      judul: "",
      pengarang: "",
      penerbit: "",
      tahunTerbit: new Date().getFullYear(),
      kategori: "BUKU_TEKS",
      lokasiRak: "Rak A-01 (MIPA)",
      jumlahEksemplar: 5,
      tipeFormat: "FISIK",
      ebookUrl: "",
      sinopsis: "",
    });
    setTambahBukuOpen(false);
  };

  // Buka Modal Pinjam Cepat dari item buku
  const handleBukaPinjamBuku = (buku: BukuPerpus) => {
    setFormPinjam({
      bukuId: buku.id,
      namaPeminjam: "",
      nomorIdentitas: "",
      rolePeminjam: "SISWA",
      kelasAtauUnit: "X IPA 1",
      tanggalPinjam: new Date().toISOString().split("T")[0],
      batasKembali: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
    });
    setPinjamOpen(true);
  };

  // Submit Peminjaman
  const handleSimpanPinjam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPinjam.bukuId || !formPinjam.namaPeminjam.trim()) return;

    const targetBuku = daftarBuku.find((b) => b.id === formPinjam.bukuId);
    if (!targetBuku) return;

    pinjamBuku({
      bukuId: targetBuku.id,
      judulBuku: targetBuku.judul,
      kodeBuku: targetBuku.kodeBuku,
      namaPeminjam: formPinjam.namaPeminjam,
      nomorIdentitas: formPinjam.nomorIdentitas || "00xxxxxxx",
      rolePeminjam: formPinjam.rolePeminjam,
      kelasAtauUnit: formPinjam.kelasAtauUnit,
      tanggalPinjam: formPinjam.tanggalPinjam,
      batasKembali: formPinjam.batasKembali,
    });

    setPinjamOpen(false);
  };

  // Buka Modal Pengembalian
  const handleBukaKembali = (p: PeminjamanBuku) => {
    setSelectedPinjam(p);
    // Hitung estimasi denda jika terlambat
    const hariIni = new Date();
    const tenggat = new Date(p.batasKembali);
    const diffTime = hariIni.getTime() - tenggat.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const dendaHitung = diffDays > 0 ? diffDays * 1000 : 0;

    setFormKembali({
      denda: dendaHitung,
      catatanPetugas: dendaHitung > 0 ? `Terlambat ${diffDays} hari pengembalian.` : "Kondisi buku baik dan lengkap.",
    });
    setKembaliOpen(true);
  };

  // Submit Pengembalian
  const handleSimpanKembali = () => {
    if (!selectedPinjam) return;
    kembalikanBuku(
      selectedPinjam.id,
      Number(formKembali.denda) || 0,
      formKembali.catatanPetugas
    );
    setKembaliOpen(false);
    setSelectedPinjam(null);
  };

  // Export Katalog CSV
  const handleExportCSV = () => {
    const headers = [
      "Kode Buku",
      "ISBN",
      "Judul Buku",
      "Pengarang",
      "Penerbit",
      "Tahun Terbit",
      "Kategori",
      "Lokasi Rak",
      "Total Eksemplar",
      "Tersedia",
      "Format",
      "Link E-Book",
    ];

    const rows = daftarBuku.map((b) => [
      `"${b.kodeBuku}"`,
      `"${b.isbn}"`,
      `"${b.judul}"`,
      `"${b.pengarang}"`,
      `"${b.penerbit}"`,
      b.tahunTerbit,
      `"${KATEGORI_CONFIG[b.kategori]?.label || b.kategori}"`,
      `"${b.lokasiRak}"`,
      b.jumlahEksemplar,
      b.eksemplarTersedia,
      `"${b.tipeFormat}"`,
      `"${b.ebookUrl || ""}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Katalog_Perpustakaan_${new Date().toISOString().split("T")[0]}.csv`);
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
              E-Library & Sirkulasi
            </Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Library className="h-6 w-6 text-emerald-600" />
            Perpustakaan & Manajemen Sirkulasi Buku
          </h1>
          <p className="text-sm text-muted-foreground">
            Katalog buku fisik dan modul ajar digital Kurikulum Merdeka, sirkulasi peminjaman siswa/guru, serta tata kelola denda.
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
              if (daftarBuku.length > 0) {
                setFormPinjam((prev) => ({ ...prev, bukuId: daftarBuku[0].id }));
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
            onClick={() => setTambahBukuOpen(true)}
            className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
          >
            <Plus className="h-4 w-4" />
            Tambah Judul Buku
          </Button>
        </div>
      </div>

      {/* KPI METRICS */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card className="border border-border/60 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Judul Koleksi</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold tracking-tight text-foreground">{totalJudul}</span>
                <span className="text-xs text-muted-foreground">judul ({totalEksemplar} eks.)</span>
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-sky-50 text-sky-700">
              <BookMarked className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Eksemplar Tersedia di Rak</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold tracking-tight text-emerald-700">{totalTersedia}</span>
                <span className="text-xs text-muted-foreground">
                  ({Math.round((totalTersedia / (totalEksemplar || 1)) * 100)}% siap pinjam)
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
              <p className="text-xs text-muted-foreground font-medium">Buku Sedang Dipinjam</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold tracking-tight text-amber-700">{totalDipinjamAktif}</span>
                <span className="text-xs text-muted-foreground">transaksi aktif</span>
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
              <p className="text-xs text-muted-foreground font-medium">Terlambat & Tunggakan Denda</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold tracking-tight text-rose-700">{totalTerlambat}</span>
                <span className="text-xs text-muted-foreground font-medium">
                  (Rp {totalDendaTertunggak.toLocaleString("id-ID")})
                </span>
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-rose-50 text-rose-700">
              <BadgeAlert className="h-5 w-5" />
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
          <BookOpen className="h-4 w-4" />
          Katalog Koleksi Buku ({daftarBuku.length})
        </button>

        <button
          onClick={() => setActiveTab("sirkulasi")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
            activeTab === "sirkulasi"
              ? "border-emerald-600 text-emerald-700 font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <RotateCcw className="h-4 w-4" />
          Sirkulasi Peminjaman ({daftarPeminjamanBuku.length})
        </button>

        <button
          onClick={() => setActiveTab("rak")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
            activeTab === "rak"
              ? "border-emerald-600 text-emerald-700 font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Building className="h-4 w-4" />
          Klasifikasi Rak ({daftarRakUnik.length})
        </button>
      </div>

      {/* TAB 1: KATALOG KOLEKSI BUKU */}
      {activeTab === "katalog" && (
        <div className="space-y-4">
          {/* SEARCH & FILTERS */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-card p-3 rounded-lg border border-border">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari judul buku, pengarang, ISBN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-sm h-9"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                aria-label="Filter Kategori Buku"
                value={kategoriFilter}
                onChange={(e) => setKategoriFilter(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs focus:ring-1 focus:ring-ring"
              >
                <option value="SEMUA">Semua Kategori</option>
                <option value="BUKU_TEKS">Buku Teks Wajib</option>
                <option value="FIKSI">Fiksi & Sastra</option>
                <option value="SAINS">Sains & Teknologi</option>
                <option value="SEJARAH">Sejarah & Sosial</option>
                <option value="AGAMA">Agama & Budi Pekerti</option>
                <option value="REFERENSI">Ensiklopedia & Ref.</option>
              </select>

              <select
                aria-label="Filter Format Koleksi"
                value={formatFilter}
                onChange={(e) => setFormatFilter(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs focus:ring-1 focus:ring-ring"
              >
                <option value="SEMUA">Semua Format</option>
                <option value="FISIK">Buku Fisik</option>
                <option value="EBOOK">E-Book Digital</option>
              </select>
            </div>
          </div>

          {/* TABLE OF BOOKS */}
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-xs font-semibold uppercase text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-4 py-3">Kode & Judul Buku</th>
                    <th className="px-4 py-3">Kategori</th>
                    <th className="px-4 py-3">Pengarang & Penerbit</th>
                    <th className="px-4 py-3">Lokasi Rak</th>
                    <th className="px-4 py-3">Ketersediaan</th>
                    <th className="px-4 py-3">Format</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {bukuFiltered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground text-sm">
                        Tidak ada buku yang cocok dengan kata kunci pencarian.
                      </td>
                    </tr>
                  ) : (
                    bukuFiltered.map((buku) => {
                      const KategoriConf = KATEGORI_CONFIG[buku.kategori];
                      const persentaseTersedia = Math.round(
                        (buku.eksemplarTersedia / (buku.jumlahEksemplar || 1)) * 100
                      );

                      return (
                        <tr key={buku.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-semibold text-foreground">{buku.judul}</div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="font-mono text-xs text-muted-foreground font-medium bg-muted px-1.5 py-0.5 rounded">
                                {buku.kodeBuku}
                              </span>
                              <span className="text-xs text-muted-foreground font-mono">
                                ISBN: {buku.isbn}
                              </span>
                            </div>
                            {buku.sinopsis && (
                              <p className="text-[11px] text-muted-foreground line-clamp-1 italic mt-0.5">
                                {buku.sinopsis}
                              </p>
                            )}
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap">
                            <Badge
                              variant="outline"
                              className={cn("text-[11px] font-medium", KategoriConf?.badgeClass)}
                            >
                              {KategoriConf?.label || buku.kategori}
                            </Badge>
                          </td>

                          <td className="px-4 py-3 text-xs">
                            <div className="font-medium text-foreground">{buku.pengarang}</div>
                            <div className="text-muted-foreground">
                              {buku.penerbit} ({buku.tahunTerbit})
                            </div>
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
                              <Building className="h-3.5 w-3.5 text-muted-foreground" />
                              {buku.lokasiRak}
                            </div>
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="text-xs font-semibold text-foreground">
                                {buku.eksemplarTersedia} / {buku.jumlahEksemplar} eks.
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
                                    : persentaseTersedia > 0
                                    ? "bg-amber-500"
                                    : "bg-rose-500"
                                )}
                                style={{ width: `${persentaseTersedia}%` }}
                              />
                            </div>
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap text-xs">
                            <div className="flex items-center gap-1">
                              <Badge variant="outline" className="text-[10px]">
                                {buku.tipeFormat.replace("_", " ")}
                              </Badge>
                              {buku.ebookUrl && (
                                <a
                                  href={buku.ebookUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-600 hover:text-emerald-800 p-1"
                                  title="Buka E-Book"
                                >
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                              )}
                            </div>
                          </td>

                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={buku.eksemplarTersedia === 0}
                                onClick={() => handleBukaPinjamBuku(buku)}
                                className="h-7 text-xs px-2 gap-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border-emerald-200"
                                title="Pinjamkan Buku"
                              >
                                <RotateCcw className="h-3 w-3" />
                                Pinjam
                              </Button>

                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedBuku(buku);
                                  setEditOpen(true);
                                }}
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                                title="Edit Buku"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>

                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  if (confirm(`Yakin ingin menghapus ${buku.judul}?`)) {
                                    hapusBuku(buku.id);
                                  }
                                }}
                                className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                                title="Hapus Buku"
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
      {activeTab === "sirkulasi" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-card p-3 rounded-lg border border-border">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari peminjam, buku, atau nomor transaksi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-sm h-9"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                aria-label="Filter Status Sirkulasi"
                value={statusSirkulasiFilter}
                onChange={(e) => setStatusSirkulasiFilter(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs focus:ring-1 focus:ring-ring"
              >
                <option value="SEMUA">Semua Status</option>
                <option value="DIPINJAM">Sedang Dipinjam</option>
                <option value="TERLAMBAT">Terlambat</option>
                <option value="KEMBALI">Selesai Kembali</option>
              </select>

              <Button
                size="sm"
                onClick={() => {
                  if (daftarBuku.length > 0) {
                    setFormPinjam((prev) => ({ ...prev, bukuId: daftarBuku[0].id }));
                  }
                  setPinjamOpen(true);
                }}
                className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Plus className="h-4 w-4" />
                Catat Peminjaman
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-xs font-semibold uppercase text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-4 py-3">No. Transaksi</th>
                    <th className="px-4 py-3">Judul Buku Dipinjam</th>
                    <th className="px-4 py-3">Peminjam</th>
                    <th className="px-4 py-3">Jadwal Pinjam</th>
                    <th className="px-4 py-3">Status & Denda</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sirkulasiFiltered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground text-sm">
                        Belum ada data sirkulasi peminjaman.
                      </td>
                    </tr>
                  ) : (
                    sirkulasiFiltered.map((p) => {
                      const isTerlambat = p.status === "TERLAMBAT";
                      const isKembali = p.status === "KEMBALI";

                      return (
                        <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="font-mono text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              {p.kodePinjam}
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            <div className="font-semibold text-foreground">{p.judulBuku}</div>
                            <span className="font-mono text-xs text-muted-foreground">
                              {p.kodeBuku}
                            </span>
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="font-medium text-foreground">{p.namaPeminjam}</div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Badge variant="outline" className="text-[10px] py-0 px-1">
                                {p.rolePeminjam}
                              </Badge>
                              <span>{p.kelasAtauUnit}</span>
                              <span>•</span>
                              <span className="font-mono text-[11px]">{p.nomorIdentitas}</span>
                            </div>
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap text-xs">
                            <div>Pinjam: {p.tanggalPinjam}</div>
                            <div
                              className={cn(
                                "font-medium",
                                isTerlambat ? "text-rose-600 font-semibold" : "text-muted-foreground"
                              )}
                            >
                              Batas: {p.batasKembali}
                            </div>
                            {p.tanggalKembali && (
                              <div className="text-emerald-700 text-[11px]">
                                Dikembalikan: {p.tanggalKembali}
                              </div>
                            )}
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="space-y-1">
                              {isKembali ? (
                                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs">
                                  Sudah Kembali
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

                              {p.denda > 0 && (
                                <div className="flex items-center gap-1.5 text-xs">
                                  <span className="text-rose-600 font-semibold">
                                    Rp {p.denda.toLocaleString("id-ID")}
                                  </span>
                                  {p.statusDenda === "LUNAS" ? (
                                    <Badge variant="outline" className="text-[10px] text-emerald-700 bg-emerald-50">
                                      Lunas
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-[10px] text-rose-700 bg-rose-50">
                                      Belum Lunas
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>

                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {!isKembali ? (
                                <Button
                                  size="sm"
                                  onClick={() => handleBukaKembali(p)}
                                  className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                                >
                                  <Check className="h-3 w-3" />
                                  Kembalikan
                                </Button>
                              ) : (
                                <>
                                  {p.statusDenda === "BELUM_LUNAS" && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => bayarDendaBuku(p.id)}
                                      className="h-7 text-xs gap-1 border-rose-200 text-rose-700 hover:bg-rose-50"
                                      title="Lunasi Denda"
                                    >
                                      <Coins className="h-3 w-3" />
                                      Bayar Denda
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedPinjam(p);
                                      setCetakOpen(true);
                                    }}
                                    className="h-7 text-xs gap-1"
                                  >
                                    <Printer className="h-3 w-3" />
                                    Bukti
                                  </Button>
                                </>
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

      {/* TAB 3: KLASIFIKASI RAK */}
      {activeTab === "rak" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {daftarRakUnik.map((rak) => {
              const bukuRak = daftarBuku.filter((b) => b.lokasiRak === rak);
              const totalEks = bukuRak.reduce((acc, b) => acc + b.jumlahEksemplar, 0);
              const totalAda = bukuRak.reduce((acc, b) => acc + b.eksemplarTersedia, 0);
              const totalPinjam = totalEks - totalAda;
              const persentaseAda = Math.round((totalAda / (totalEks || 1)) * 100);

              return (
                <Card key={rak} className="border border-border/70 shadow-xs hover:border-emerald-300 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                          <Building className="h-4 w-4" />
                        </div>
                        <div>
                          <CardTitle className="text-base font-bold text-foreground">{rak}</CardTitle>
                          <p className="text-xs text-muted-foreground">{bukuRak.length} judul tersusun</p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-3 gap-2 p-2.5 bg-muted/40 rounded-lg text-center">
                      <div>
                        <div className="text-lg font-bold text-foreground">{totalEks}</div>
                        <div className="text-[10px] text-muted-foreground">Total Eks.</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-emerald-600">{totalAda}</div>
                        <div className="text-[10px] text-muted-foreground">Tersedia</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-amber-600">{totalPinjam}</div>
                        <div className="text-[10px] text-muted-foreground">Dipinjam</div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Ketersediaan Fisik</span>
                        <span className="font-semibold text-emerald-700">{persentaseAda}%</span>
                      </div>
                      <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full rounded-full transition-all"
                          style={{ width: `${persentaseAda}%` }}
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {bukuRak.map((b) => b.kategori).filter((v, i, a) => a.indexOf(v) === i).join(", ")}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSearchQuery(rak.split(" ")[0]);
                          setActiveTab("katalog");
                        }}
                        className="text-xs text-emerald-700 hover:text-emerald-800 h-7 px-2"
                      >
                        Buka Rak
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL TAMBAH BUKU */}
      <Dialog open={isTambahBukuOpen} onOpenChange={setTambahBukuOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <BookOpen className="h-5 w-5 text-emerald-600" />
              Katalogisasi Judul Buku Baru
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSimpanBuku} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground">Judul Buku *</label>
              <Input
                required
                placeholder="Contoh: Matematika Tingkat Lanjut SMA/MA Kelas XI"
                value={formBuku.judul}
                onChange={(e) => setFormBuku({ ...formBuku, judul: e.target.value })}
                className="mt-1 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground">ISBN</label>
                <Input
                  placeholder="978-602-xxx-xxx-x"
                  value={formBuku.isbn}
                  onChange={(e) => setFormBuku({ ...formBuku, isbn: e.target.value })}
                  className="mt-1 text-sm font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Kode Buku (Opsional)</label>
                <Input
                  placeholder="Kosongkan untuk auto-generate"
                  value={formBuku.kodeBuku}
                  onChange={(e) => setFormBuku({ ...formBuku, kodeBuku: e.target.value })}
                  className="mt-1 text-sm font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground">Pengarang / Penulis</label>
                <Input
                  placeholder="Nama pengarang..."
                  value={formBuku.pengarang}
                  onChange={(e) => setFormBuku({ ...formBuku, pengarang: e.target.value })}
                  className="mt-1 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Penerbit</label>
                <Input
                  placeholder="Kemendikbudristek / Erlangga / Gramedia"
                  value={formBuku.penerbit}
                  onChange={(e) => setFormBuku({ ...formBuku, penerbit: e.target.value })}
                  className="mt-1 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground">Kategori Buku</label>
                <select
                  value={formBuku.kategori}
                  onChange={(e) =>
                    setFormBuku({
                      ...formBuku,
                      kategori: e.target.value as BukuPerpus["kategori"],
                    })
                  }
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="BUKU_TEKS">Buku Teks Wajib</option>
                  <option value="FIKSI">Fiksi & Sastra</option>
                  <option value="SAINS">Sains & Teknologi</option>
                  <option value="SEJARAH">Sejarah & Sosial</option>
                  <option value="AGAMA">Agama & Budi Pekerti</option>
                  <option value="REFERENSI">Ensiklopedia & Ref.</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Tahun Terbit</label>
                <Input
                  type="number"
                  value={formBuku.tahunTerbit}
                  onChange={(e) =>
                    setFormBuku({
                      ...formBuku,
                      tahunTerbit: Number(e.target.value) || new Date().getFullYear(),
                    })
                  }
                  className="mt-1 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Jumlah Eksemplar</label>
                <Input
                  type="number"
                  min="1"
                  value={formBuku.jumlahEksemplar}
                  onChange={(e) =>
                    setFormBuku({
                      ...formBuku,
                      jumlahEksemplar: Number(e.target.value) || 1,
                    })
                  }
                  className="mt-1 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground">Lokasi Rak Buku</label>
                <Input
                  placeholder="Contoh: Rak A-01 (MIPA)"
                  value={formBuku.lokasiRak}
                  onChange={(e) => setFormBuku({ ...formBuku, lokasiRak: e.target.value })}
                  className="mt-1 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Format Koleksi</label>
                <select
                  value={formBuku.tipeFormat}
                  onChange={(e) =>
                    setFormBuku({
                      ...formBuku,
                      tipeFormat: e.target.value as BukuPerpus["tipeFormat"],
                    })
                  }
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="FISIK">Buku Fisik Saja</option>
                  <option value="EBOOK">E-Book Digital Saja</option>
                  <option value="FISIK_DAN_EBOOK">Buku Fisik & E-Book</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">Tautan / Link E-Book (Opsional)</label>
              <Input
                placeholder="https://buku.kemdikbud.go.id/katalog/..."
                value={formBuku.ebookUrl}
                onChange={(e) => setFormBuku({ ...formBuku, ebookUrl: e.target.value })}
                className="mt-1 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">Sinopsis / Ringkasan Buku</label>
              <textarea
                rows={2}
                placeholder="Deskripsi singkat isi materi..."
                value={formBuku.sinopsis}
                onChange={(e) => setFormBuku({ ...formBuku, sinopsis: e.target.value })}
                className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm"
              />
            </div>

            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setTambahBukuOpen(false)}>
                Batal
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Simpan ke Katalog
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL PINJAM BUKU */}
      <Dialog open={isPinjamOpen} onOpenChange={setPinjamOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <RotateCcw className="h-5 w-5 text-emerald-600" />
              Pencatatan Peminjaman Buku
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSimpanPinjam} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground">Pilih Judul Buku *</label>
              <select
                required
                value={formPinjam.bukuId}
                onChange={(e) => setFormPinjam({ ...formPinjam, bukuId: e.target.value })}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {daftarBuku.map((buku) => (
                  <option key={buku.id} value={buku.id} disabled={buku.eksemplarTersedia === 0}>
                    {buku.judul} ({buku.kodeBuku}) - Tersedia: {buku.eksemplarTersedia} eks.
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground">Nama Peminjam *</label>
                <Input
                  required
                  placeholder="Nama siswa atau guru"
                  value={formPinjam.namaPeminjam}
                  onChange={(e) => setFormPinjam({ ...formPinjam, namaPeminjam: e.target.value })}
                  className="mt-1 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Role / Peran</label>
                <select
                  value={formPinjam.rolePeminjam}
                  onChange={(e) =>
                    setFormPinjam({
                      ...formPinjam,
                      rolePeminjam: e.target.value as PeminjamanBuku["rolePeminjam"],
                    })
                  }
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="SISWA">Siswa</option>
                  <option value="GURU">Guru / Pendidik</option>
                  <option value="STAF">Staf / Tata Usaha</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground">Nomor Induk (NISN / NIP)</label>
                <Input
                  required
                  placeholder="006789xxxx / 1985xxxx"
                  value={formPinjam.nomorIdentitas}
                  onChange={(e) =>
                    setFormPinjam({ ...formPinjam, nomorIdentitas: e.target.value })
                  }
                  className="mt-1 text-sm font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Kelas / Unit Kerja</label>
                <Input
                  required
                  placeholder="X IPA 1 / Guru Matematika"
                  value={formPinjam.kelasAtauUnit}
                  onChange={(e) =>
                    setFormPinjam({ ...formPinjam, kelasAtauUnit: e.target.value })
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
                <label className="text-xs font-semibold text-foreground">Batas Pengembalian (7-14 hari)</label>
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

      {/* MODAL PENGEMBALIAN BUKU */}
      <Dialog open={isKembaliOpen} onOpenChange={setKembaliOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              Penerimaan Pengembalian Buku
            </DialogTitle>
          </DialogHeader>

          {selectedPinjam && (
            <div className="space-y-4">
              <div className="p-3 bg-muted/50 rounded-lg space-y-1 text-xs">
                <div className="font-semibold text-foreground text-sm">
                  {selectedPinjam.judulBuku}
                </div>
                <div className="text-muted-foreground">
                  Peminjam: <span className="font-medium text-foreground">{selectedPinjam.namaPeminjam}</span> ({selectedPinjam.kelasAtauUnit})
                </div>
                <div className="text-muted-foreground">
                  Batas Waktu: <span className="font-medium">{selectedPinjam.batasKembali}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Denda Keterlambatan (Rp 1.000 / hari)</label>
                <Input
                  type="number"
                  min="0"
                  step="500"
                  value={formKembali.denda}
                  onChange={(e) =>
                    setFormKembali({ ...formKembali, denda: Number(e.target.value) || 0 })
                  }
                  className="mt-1 text-sm"
                />
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Isi 0 jika dikembalikan tepat waktu tanpa denda.
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Catatan Petugas Perpustakaan</label>
                <textarea
                  rows={2}
                  value={formKembali.catatanPetugas}
                  onChange={(e) =>
                    setFormKembali({ ...formKembali, catatanPetugas: e.target.value })
                  }
                  className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm"
                />
              </div>

              <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={() => setKembaliOpen(false)}>
                  Batal
                </Button>
                <Button onClick={handleSimpanKembali} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Verifikasi Pengembalian
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* MODAL EDIT BUKU */}
      <Dialog open={isEditOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Edit className="h-5 w-5 text-emerald-600" />
              Edit Data Buku
            </DialogTitle>
          </DialogHeader>

          {selectedBuku && (
            <div className="space-y-4">
              <div className="p-2.5 bg-muted/40 rounded-lg text-xs space-y-0.5">
                <div className="font-semibold text-foreground">{selectedBuku.judul}</div>
                <div className="font-mono text-muted-foreground">{selectedBuku.kodeBuku} • {selectedBuku.isbn}</div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Lokasi Rak Buku</label>
                <Input
                  value={selectedBuku.lokasiRak}
                  onChange={(e) => setSelectedBuku({ ...selectedBuku, lokasiRak: e.target.value })}
                  className="mt-1 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground">Total Eksemplar</label>
                  <Input
                    type="number"
                    min="1"
                    value={selectedBuku.jumlahEksemplar}
                    onChange={(e) =>
                      setSelectedBuku({
                        ...selectedBuku,
                        jumlahEksemplar: Number(e.target.value) || 1,
                      })
                    }
                    className="mt-1 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground">Eksemplar Tersedia</label>
                  <Input
                    type="number"
                    min="0"
                    max={selectedBuku.jumlahEksemplar}
                    value={selectedBuku.eksemplarTersedia}
                    onChange={(e) =>
                      setSelectedBuku({
                        ...selectedBuku,
                        eksemplarTersedia: Number(e.target.value) || 0,
                      })
                    }
                    className="mt-1 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Tautan E-Book</label>
                <Input
                  value={selectedBuku.ebookUrl || ""}
                  onChange={(e) => setSelectedBuku({ ...selectedBuku, ebookUrl: e.target.value })}
                  className="mt-1 text-sm"
                />
              </div>

              <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                  Batal
                </Button>
                <Button
                  onClick={() => {
                    if (selectedBuku) {
                      updateBuku(selectedBuku.id, selectedBuku);
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

      {/* MODAL CETAK BUKTI PENGEMBALIAN / BEBAS PUSTAKA */}
      <Dialog open={isCetakOpen} onOpenChange={setCetakOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Printer className="h-5 w-5 text-emerald-600" />
              Bukti Pengembalian Buku
            </DialogTitle>
          </DialogHeader>

          {selectedPinjam && (
            <div className="space-y-4">
              <div className="p-4 border border-dashed border-border rounded-lg bg-card space-y-3 text-xs">
                <div className="text-center pb-2 border-b border-border">
                  <div className="font-bold text-sm tracking-wide">PERPUSTAKAAN SEKOLAH</div>
                  <div className="text-muted-foreground text-[11px]">
                    SMA NEGERI CONTOH - BUKTI RESMI SIRKULASI BUKU
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1 text-[12px]">
                  <span className="text-muted-foreground">No. Transaksi:</span>
                  <span className="font-mono font-bold text-right">{selectedPinjam.kodePinjam}</span>
                  <span className="text-muted-foreground">Peminjam:</span>
                  <span className="font-semibold text-right">{selectedPinjam.namaPeminjam}</span>
                  <span className="text-muted-foreground">Kelas / Unit:</span>
                  <span className="text-right">{selectedPinjam.kelasAtauUnit}</span>
                  <span className="text-muted-foreground">Judul Buku:</span>
                  <span className="text-right">{selectedPinjam.judulBuku}</span>
                  <span className="text-muted-foreground">Tgl Pinjam:</span>
                  <span className="text-right">{selectedPinjam.tanggalPinjam}</span>
                  <span className="text-muted-foreground">Tgl Kembali:</span>
                  <span className="text-right font-medium text-emerald-700">
                    {selectedPinjam.tanggalKembali || selectedPinjam.batasKembali}
                  </span>
                  <span className="text-muted-foreground">Denda:</span>
                  <span className="text-right font-semibold">
                    {selectedPinjam.denda > 0
                      ? `Rp ${selectedPinjam.denda.toLocaleString("id-ID")} (${selectedPinjam.statusDenda})`
                      : "Tidak Ada"}
                  </span>
                </div>

                <div className="pt-2 border-t border-border text-center text-[10px] text-muted-foreground">
                  Buku telah diterima kembali oleh staf perpustakaan dalam keadaan baik.
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
