"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
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
  RotateCcw,
  Building,
  Printer,
  BadgeAlert,
  Coins,
  Check,
  RefreshCw,
  ExternalLink,
  Edit,
  Trash2,
  Loader2,
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
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";

export interface PerpusBukuItem {
  id: string | number;
  kodeBuku: string;
  isbn: string;
  judul: string;
  pengarang: string;
  penerbit: string;
  tahunTerbit: number;
  kategori: "BUKU_TEKS" | "FIKSI" | "SAINS" | "SEJARAH" | "AGAMA" | "REFERENSI" | string;
  lokasiRak: string;
  jumlahEksemplar: number;
  eksemplarTersedia: number;
  tipeFormat: "FISIK" | "EBOOK" | "FISIK_DAN_EBOOK" | string;
  ebookUrl?: string;
  sinopsis?: string;
}

export interface PerpusPinjamItem {
  id: string | number;
  kodePinjam: string;
  bukuId: string | number;
  judulBuku: string;
  kodeBuku: string;
  namaPeminjam: string;
  nomorIdentitas: string;
  rolePeminjam: "SISWA" | "GURU" | "STAF" | string;
  kelasAtauUnit: string;
  tanggalPinjam: string;
  batasKembali: string;
  tanggalKembali?: string | null;
  status: "DIPINJAM" | "TERLAMBAT" | "DIKEMBALIKAN" | "KEMBALI" | string;
  denda: number;
  statusDenda?: "LUNAS" | "BELUM_LUNAS" | string;
  catatanPetugas?: string;
}

const KATEGORI_CONFIG: Record<
  string,
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
  const [daftarBuku, setDaftarBuku] = useState<PerpusBukuItem[]>([]);
  const [daftarPeminjamanBuku, setDaftarPeminjamanBuku] = useState<PerpusPinjamItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  const [selectedBuku, setSelectedBuku] = useState<PerpusBukuItem | null>(null);
  const [selectedPinjam, setSelectedPinjam] = useState<PerpusPinjamItem | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Form Tambah Buku
  const [formBuku, setFormBuku] = useState({
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

  // Form Pinjam Buku
  const [formPinjam, setFormPinjam] = useState({
    bukuId: "",
    namaPeminjam: "",
    nomorIdentitas: "",
    rolePeminjam: "SISWA",
    kelasAtauUnit: "X IPA 1",
    tanggalPinjam: new Date().toISOString().split("T")[0],
    batasKembali: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
  });

  // Form Pengembalian Buku
  const [formKembali, setFormKembali] = useState({
    denda: 0,
    catatanPetugas: "",
  });

  const fetchData = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const [resBuku, resPinjam] = await Promise.all([
        api.getPerpusBukuList(),
        api.getPerpusPeminjamanList(),
      ]);

      const rawBuku = (resBuku as any)?.data || (resBuku as any) || [];
      const normalizedBuku: PerpusBukuItem[] = Array.isArray(rawBuku)
        ? rawBuku.map((item: any) => ({
            id: item.id,
            kodeBuku: item.kode_buku || item.kodeBuku || `BK-${item.id}`,
            isbn: item.isbn || "-",
            judul: item.judul || "Tanpa Judul",
            pengarang: item.pengarang || "-",
            penerbit: item.penerbit || "-",
            tahunTerbit: Number(item.tahun_terbit ?? item.tahunTerbit ?? new Date().getFullYear()),
            kategori: item.kategori || "BUKU_TEKS",
            lokasiRak: item.lokasi_rak || item.lokasiRak || "Rak Utama",
            jumlahEksemplar: Number(item.jumlah_eksemplar ?? item.jumlahEksemplar ?? 1),
            eksemplarTersedia: Number(item.eksemplar_tersedia ?? item.eksemplarTersedia ?? 1),
            tipeFormat: item.tipe_format || item.tipeFormat || "FISIK",
            ebookUrl: item.ebook_url || item.ebookUrl || "",
            sinopsis: item.sinopsis || "",
          }))
        : [];
      setDaftarBuku(normalizedBuku);

      const rawPinjam = (resPinjam as any)?.data || (resPinjam as any) || [];
      const normalizedPinjam: PerpusPinjamItem[] = Array.isArray(rawPinjam)
        ? rawPinjam.map((item: any) => ({
            id: item.id,
            kodePinjam: item.kode_pinjam || item.kodePinjam || `TRX-${item.id}`,
            bukuId: item.buku_id ?? item.bukuId ?? (item.buku?.id || ""),
            judulBuku: item.buku?.judul || item.judul_buku || item.judulBuku || "Buku Perpustakaan",
            kodeBuku: item.buku?.kode_buku || item.kode_buku || item.kodeBuku || "-",
            namaPeminjam: item.peminjam_nama || item.nama_peminjam || item.namaPeminjam || "-",
            nomorIdentitas: item.nomor_identitas || item.nomorIdentitas || "-",
            rolePeminjam: item.peminjam_tipe || item.role_peminjam || item.rolePeminjam || "SISWA",
            kelasAtauUnit: item.kelas_atau_unit || item.kelasAtauUnit || "-",
            tanggalPinjam: item.tanggal_pinjam || item.tanggalPinjam || "",
            batasKembali: item.tanggal_jatuh_tempo || item.batas_kembali || item.batasKembali || "",
            tanggalKembali: item.tanggal_kembali || item.tanggalKembali || null,
            status: item.status || "DIPINJAM",
            denda: Number(item.denda || 0),
            statusDenda: item.status_denda || item.statusDenda || (Number(item.denda) > 0 ? "BELUM_LUNAS" : "LUNAS"),
            catatanPetugas: item.catatan_petugas || item.catatanPetugas || "",
          }))
        : [];
      setDaftarPeminjamanBuku(normalizedPinjam);

      if (isManual) showToast("Data perpustakaan & sirkulasi berhasil diperbarui.");
    } catch (err: any) {
      console.error("Gagal memuat data perpustakaan:", err);
      showToast("Gagal memuat data perpustakaan dari server.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
    daftarBuku.forEach((b) => {
      if (b.lokasiRak) s.add(b.lokasiRak);
    });
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
        statusSirkulasiFilter === "SEMUA" ||
        (statusSirkulasiFilter === "KEMBALI" && (p.status === "KEMBALI" || p.status === "DIKEMBALIKAN")) ||
        p.status === statusSirkulasiFilter;

      return matchSearch && matchStatus;
    });
  }, [daftarPeminjamanBuku, searchQuery, statusSirkulasiFilter]);

  // Submit Tambah Buku
  const handleSimpanBuku = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formBuku.judul.trim()) return;

    setIsSubmitting(true);
    const kodeAuto =
      formBuku.kodeBuku.trim() ||
      `BK-${formBuku.kategori.substring(0, 3)}-${String(daftarBuku.length + 1).padStart(3, "0")}`;

    const payload = {
      kode_buku: kodeAuto,
      isbn: formBuku.isbn.trim() || `978-602-${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}-1`,
      judul: formBuku.judul,
      pengarang: formBuku.pengarang || "Anonim",
      penerbit: formBuku.penerbit || "Penerbit Sekolah",
      tahun_terbit: Number(formBuku.tahunTerbit) || new Date().getFullYear(),
      kategori: formBuku.kategori,
      lokasi_rak: formBuku.lokasiRak,
      jumlah_eksemplar: Number(formBuku.jumlahEksemplar) || 1,
      tipe_format: formBuku.tipeFormat,
      sinopsis: formBuku.sinopsis,
    };

    try {
      await api.createPerpusBuku(payload);
      showToast(`Buku "${formBuku.judul}" berhasil ditambahkan ke katalog.`);
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
      fetchData();
    } catch (err: any) {
      console.error("Gagal simpan buku:", err);
      showToast("Gagal menyimpan buku ke database.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Buka Modal Pinjam Cepat dari item buku
  const handleBukaPinjamBuku = (buku: PerpusBukuItem) => {
    setFormPinjam({
      bukuId: String(buku.id),
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
  const handleSimpanPinjam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPinjam.bukuId || !formPinjam.namaPeminjam.trim()) return;

    setIsSubmitting(true);
    const payload = {
      buku_id: formPinjam.bukuId,
      peminjam_nama: formPinjam.namaPeminjam,
      peminjam_tipe: formPinjam.rolePeminjam,
      tanggal_pinjam: formPinjam.tanggalPinjam,
      tanggal_jatuh_tempo: formPinjam.batasKembali,
    };

    try {
      await api.pinjamPerpusBuku(payload);
      showToast(`Peminjaman buku untuk ${formPinjam.namaPeminjam} berhasil dicatat.`);
      setPinjamOpen(false);
      fetchData();
    } catch (err: any) {
      console.error("Gagal mencatat peminjaman:", err);
      showToast("Gagal mencatat peminjaman buku.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Buka Modal Pengembalian
  const handleBukaKembali = (p: PerpusPinjamItem) => {
    setSelectedPinjam(p);
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
  const handleSimpanKembali = async () => {
    if (!selectedPinjam) return;
    setIsSubmitting(true);
    try {
      await api.kembalikanPerpusBuku(selectedPinjam.id, {
        denda: Number(formKembali.denda) || 0,
      });
      showToast(`Buku "${selectedPinjam.judulBuku}" berhasil dikembalikan.`);
      setKembaliOpen(false);
      setSelectedPinjam(null);
      fetchData();
    } catch (err: any) {
      console.error("Gagal memproses pengembalian buku:", err);
      showToast("Gagal memproses pengembalian buku.");
    } finally {
      setIsSubmitting(false);
    }
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
    showToast("Katalog perpustakaan berhasil diekspor ke CSV.");
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
            Katalog buku fisik dan modul ajar digital, sirkulasi peminjaman siswa/guru live dari database Supabase.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchData(true)}
            disabled={isRefreshing || isLoading}
            className="gap-1.5 text-xs shadow-xs"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", (isRefreshing || isLoading) && "animate-spin")} />
            <span>{isRefreshing ? "Memuat..." : "Refresh"}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={daftarBuku.length === 0}
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
                setFormPinjam((prev) => ({ ...prev, bukuId: String(daftarBuku[0].id) }));
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
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border border-border/60 shadow-xs animate-pulse">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <div className="h-3 w-24 bg-slate-200 rounded" />
                  <div className="h-6 w-16 bg-slate-200 rounded" />
                </div>
                <div className="h-10 w-10 bg-slate-200 rounded-lg shrink-0" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
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
          </>
        )}
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab("katalog")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer",
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
            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer",
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
            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer",
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
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, idx) => (
                      <tr key={idx} className="animate-pulse">
                        <td className="px-4 py-3 space-y-1">
                          <div className="h-4 w-48 bg-slate-200 rounded" />
                          <div className="h-3 w-28 bg-slate-100 rounded" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-5 w-24 bg-slate-200 rounded" />
                        </td>
                        <td className="px-4 py-3 space-y-1">
                          <div className="h-4 w-32 bg-slate-200 rounded" />
                          <div className="h-3 w-20 bg-slate-100 rounded" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-4 w-28 bg-slate-200 rounded" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-4 w-20 bg-slate-200 rounded" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-4 w-16 bg-slate-200 rounded" />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="h-7 w-16 bg-slate-200 rounded ml-auto" />
                        </td>
                      </tr>
                    ))
                  ) : bukuFiltered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground text-sm">
                        Tidak ada buku yang cocok dengan kata kunci pencarian.
                      </td>
                    </tr>
                  ) : (
                    bukuFiltered.map((buku) => {
                      const KategoriConf = KATEGORI_CONFIG[buku.kategori] || {
                        label: buku.kategori,
                        badgeClass: "bg-slate-100 text-slate-800 border-slate-200",
                      };
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
                                className="h-7 text-xs px-2 gap-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border-emerald-200 cursor-pointer"
                                title="Pinjamkan Buku"
                              >
                                <RotateCcw className="h-3 w-3" />
                                Pinjam
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
                    setFormPinjam((prev) => ({ ...prev, bukuId: String(daftarBuku[0].id) }));
                  }
                  setPinjamOpen(true);
                }}
                className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
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
                  {isLoading ? (
                    Array.from({ length: 4 }).map((_, idx) => (
                      <tr key={idx} className="animate-pulse">
                        <td className="px-4 py-3"><div className="h-5 w-20 bg-slate-200 rounded" /></td>
                        <td className="px-4 py-3"><div className="h-4 w-40 bg-slate-200 rounded" /></td>
                        <td className="px-4 py-3"><div className="h-4 w-32 bg-slate-200 rounded" /></td>
                        <td className="px-4 py-3"><div className="h-4 w-28 bg-slate-200 rounded" /></td>
                        <td className="px-4 py-3"><div className="h-5 w-24 bg-slate-200 rounded" /></td>
                        <td className="px-4 py-3 text-right"><div className="h-7 w-20 bg-slate-200 rounded ml-auto" /></td>
                      </tr>
                    ))
                  ) : sirkulasiFiltered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground text-sm">
                        Belum ada data sirkulasi peminjaman.
                      </td>
                    </tr>
                  ) : (
                    sirkulasiFiltered.map((p) => {
                      const isTerlambat = p.status === "TERLAMBAT";
                      const isKembali = p.status === "KEMBALI" || p.status === "DIKEMBALIKAN";

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
                                  className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1 cursor-pointer"
                                >
                                  <Check className="h-3 w-3" />
                                  Kembalikan
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedPinjam(p);
                                    setCetakOpen(true);
                                  }}
                                  className="h-7 text-xs gap-1 cursor-pointer"
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

      {/* TAB 3: KLASIFIKASI RAK */}
      {activeTab === "rak" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {daftarRakUnik.length === 0 ? (
              <div className="col-span-3 py-12 text-center text-muted-foreground text-sm">
                Belum ada klasifikasi rak buku yang tercatat.
              </div>
            ) : (
              daftarRakUnik.map((rak) => {
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
                          className="text-xs text-emerald-700 hover:text-emerald-800 h-7 px-2 cursor-pointer"
                        >
                          Buka Rak
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
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
                      kategori: e.target.value,
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
                      tipeFormat: e.target.value,
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
              <Button type="button" variant="outline" onClick={() => setTambahBukuOpen(false)} disabled={isSubmitting}>
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5">
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>{isSubmitting ? "Menyimpan..." : "Simpan ke Katalog"}</span>
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
                {daftarBuku.length === 0 ? (
                  <option value="">Belum ada buku di katalog</option>
                ) : (
                  daftarBuku.map((buku) => (
                    <option key={buku.id} value={buku.id} disabled={buku.eksemplarTersedia === 0}>
                      {buku.judul} ({buku.kodeBuku}) - Tersedia: {buku.eksemplarTersedia} eks.
                    </option>
                  ))
                )}
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
                      rolePeminjam: e.target.value,
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
                <label className="text-xs font-semibold text-foreground">Batas Pengembalian</label>
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
              <Button type="button" variant="outline" onClick={() => setPinjamOpen(false)} disabled={isSubmitting}>
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5">
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>{isSubmitting ? "Memproses..." : "Konfirmasi Peminjaman"}</span>
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
                  Jatuh Tempo: <span className="font-mono">{selectedPinjam.batasKembali}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Denda Keterlambatan (Rp)</label>
                <Input
                  type="number"
                  min="0"
                  step="500"
                  value={formKembali.denda}
                  onChange={(e) =>
                    setFormKembali({ ...formKembali, denda: Number(e.target.value) || 0 })
                  }
                  className="mt-1 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Catatan Kondisi Buku</label>
                <Input
                  value={formKembali.catatanPetugas}
                  onChange={(e) =>
                    setFormKembali({ ...formKembali, catatanPetugas: e.target.value })
                  }
                  className="mt-1 text-sm"
                />
              </div>

              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setKembaliOpen(false)} disabled={isSubmitting}>
                  Batal
                </Button>
                <Button
                  onClick={handleSimpanKembali}
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>{isSubmitting ? "Menyimpan..." : "Buku Telah Diterima"}</span>
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* MODAL CETAK BUKTI PENGEMBALIAN */}
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
                    BUKTI RESMI SIRKULASI BUKU
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
                      ? `Rp ${selectedPinjam.denda.toLocaleString("id-ID")}`
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
