"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Package,
  Search,
  Plus,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Wrench,
  Download,
  Building,
  RotateCcw,
  Boxes,
  RefreshCw,
  Loader2,
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
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";

export interface AsetSarprasItem {
  id: string | number;
  kodeAset: string;
  namaAset: string;
  kategori: "ELEKTRONIK" | "MEDIA_AJAR" | "LABORATORIUM" | "OLAHRAGA" | "FURNITUR" | "KENDARAAN" | string;
  merkModel: string;
  kondisi: "BAIK" | "RUSAK_RINGAN" | "RUSAK_BERAT" | string;
  lokasi: string;
  jumlahTotal: number;
  jumlahTersedia: number;
  tahunPengadaan: number;
  sumberDana: "BOS_REGULER" | "BOS_KINERJA" | "DAK_FISIK" | "YAYASAN_KOMITE" | string;
  keterangan?: string;
}

export interface PeminjamanSarprasItem {
  id: string | number;
  asetId: string | number;
  namaAset: string;
  kodeAset: string;
  namaPeminjam: string;
  rolePeminjam: "GURU" | "SISWA" | "STAF_TU" | string;
  kontakPeminjam: string;
  jumlahUnit: number;
  tanggalPinjam: string;
  batasKembali: string;
  tanggalKembali?: string | null;
  status: "DIPINJAM" | "TERLAMBAT" | "DIKEMBALIKAN" | "KEMBALI" | string;
  keperluan: string;
  kondisiKembali?: string;
}

const KATEGORI_CONFIG: Record<
  string,
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
  string,
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
  const [daftarAsetSarpras, setDaftarAsetSarpras] = useState<AsetSarprasItem[]>([]);
  const [daftarPeminjamanSarpras, setDaftarPeminjamanSarpras] = useState<PeminjamanSarprasItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [activeTab, setActiveTab] = useState<"katalog" | "peminjaman" | "ruangan">("katalog");
  const [searchQuery, setSearchQuery] = useState("");
  const [kategoriFilter, setKategoriFilter] = useState<string>("SEMUA");
  const [kondisiFilter, setKondisiFilter] = useState<string>("SEMUA");
  const [lokasiFilter, setLokasiFilter] = useState<string>("SEMUA");

  // Modals
  const [isTambahAsetOpen, setTambahAsetOpen] = useState(false);
  const [isPinjamOpen, setPinjamOpen] = useState(false);
  const [isKembaliOpen, setKembaliOpen] = useState(false);

  // Modal states
  const [selectedPinjam, setSelectedPinjam] = useState<PeminjamanSarprasItem | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Form Tambah Aset
  const [formAset, setFormAset] = useState({
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

  // Form Pinjam
  const [formPinjam, setFormPinjam] = useState({
    asetId: "",
    namaPeminjam: "",
    rolePeminjam: "GURU",
    kontakPeminjam: "",
    jumlahUnit: 1,
    tanggalPinjam: new Date().toISOString().split("T")[0],
    batasKembali: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    keperluan: "",
  });

  // Form Pengembalian
  const [formKembali, setFormKembali] = useState({
    kondisiKembali: "BAIK",
    catatanPengembalian: "",
  });

  const fetchData = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const [resAset, resPinjam] = await Promise.all([
        api.getSarprasAsetList(),
        api.getSarprasPeminjamanList(),
      ]);

      const rawAset = (resAset as any)?.data || (resAset as any) || [];
      const normalizedAset: AsetSarprasItem[] = Array.isArray(rawAset)
        ? rawAset.map((item: any) => ({
            id: item.id,
            kodeAset: item.kode_aset || item.kodeAset || `AST-${item.id}`,
            namaAset: item.nama_aset || item.namaAset || "Aset Sekolah",
            kategori: item.kategori || "ELEKTRONIK",
            merkModel: item.merk_model || item.merkModel || "-",
            kondisi: item.kondisi || "BAIK",
            lokasi: item.lokasi || "Ruang Penyimpanan",
            jumlahTotal: Number(item.jumlah_total ?? item.jumlahTotal ?? 1),
            jumlahTersedia: Number(item.jumlah_tersedia ?? item.jumlahTersedia ?? item.jumlah_total ?? 1),
            tahunPengadaan: Number(item.tahun_pengadaan ?? item.tahunPengadaan ?? new Date().getFullYear()),
            sumberDana: item.sumber_dana || item.sumberDana || "BOS_REGULER",
            keterangan: item.keterangan || "",
          }))
        : [];
      setDaftarAsetSarpras(normalizedAset);

      const rawPinjam = (resPinjam as any)?.data || (resPinjam as any) || [];
      const normalizedPinjam: PeminjamanSarprasItem[] = Array.isArray(rawPinjam)
        ? rawPinjam.map((item: any) => ({
            id: item.id,
            asetId: item.aset_id || item.asetId || "",
            namaAset: item.aset?.nama_aset || item.nama_aset || item.namaAset || "Aset Sarpras",
            kodeAset: item.aset?.kode_aset || item.kode_aset || item.kodeAset || "-",
            namaPeminjam: item.peminjam_nama || item.nama_peminjam || item.namaPeminjam || "-",
            rolePeminjam: item.peminjam_role || item.role_peminjam || item.rolePeminjam || "GURU",
            kontakPeminjam: item.kontak_peminjam || item.kontakPeminjam || "-",
            jumlahUnit: Number(item.jumlah_pinjam ?? item.jumlah_unit ?? item.jumlahUnit ?? 1),
            tanggalPinjam: item.tanggal_pinjam || item.tanggalPinjam || "",
            batasKembali: item.tanggal_rencana_kembali || item.batas_kembali || item.batasKembali || "",
            tanggalKembali: item.tanggal_realisasi_kembali || item.tanggal_kembali || item.tanggalKembali || null,
            status: item.status || "DIPINJAM",
            keperluan: item.keperluan || "Kegiatan Sekolah",
            kondisiKembali: item.kondisi_kembali || "BAIK",
          }))
        : [];
      setDaftarPeminjamanSarpras(normalizedPinjam);

      if (isManual) showToast("Data inventaris sarpras berhasil diperbarui.");
    } catch (err: any) {
      console.error("Gagal memuat data sarpras:", err);
      showToast("Gagal memuat data sarpras dari server.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
      daftarPeminjamanSarpras
        .filter((p) => p.status === "DIPINJAM" || p.status === "TERLAMBAT")
        .reduce((acc, p) => acc + p.jumlahUnit, 0),
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
    daftarAsetSarpras.forEach((a) => {
      if (a.lokasi) setRuang.add(a.lokasi);
    });
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
        p.kodeAset.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.keperluan.toLowerCase().includes(searchQuery.toLowerCase());

      return matchSearch;
    });
  }, [daftarPeminjamanSarpras, searchQuery]);

  // Handle Submit Tambah Aset
  const handleSimpanAset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAset.namaAset.trim()) return;

    setIsSubmitting(true);
    const kodeAuto =
      formAset.kodeAset.trim() ||
      `AST-${formAset.kategori.substring(0, 3)}-${String(
        daftarAsetSarpras.length + 1
      ).padStart(3, "0")}`;

    const payload = {
      kode_aset: kodeAuto,
      nama_aset: formAset.namaAset,
      kategori: formAset.kategori,
      merk_model: formAset.merkModel || "-",
      kondisi: formAset.kondisi,
      lokasi: formAset.lokasi,
      jumlah_total: Number(formAset.jumlahTotal) || 1,
      tahun_pengadaan: Number(formAset.tahunPengadaan) || new Date().getFullYear(),
      sumber_dana: formAset.sumberDana,
      keterangan: formAset.keterangan,
    };

    try {
      await api.createSarprasAset(payload);
      showToast(`Aset "${formAset.namaAset}" berhasil ditambahkan ke inventaris.`);
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
      fetchData();
    } catch (err: any) {
      console.error("Gagal simpan aset sarpras:", err);
      showToast("Gagal menyimpan aset sarpras.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Buka Pinjam Cepat
  const handleBukaPinjamAset = (aset: AsetSarprasItem) => {
    setFormPinjam({
      asetId: String(aset.id),
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
  const handleSimpanPinjam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPinjam.asetId || !formPinjam.namaPeminjam.trim()) return;

    setIsSubmitting(true);
    const payload = {
      aset_id: formPinjam.asetId,
      peminjam_nama: formPinjam.namaPeminjam,
      peminjam_role: formPinjam.rolePeminjam,
      jumlah_pinjam: Number(formPinjam.jumlahUnit) || 1,
      tanggal_pinjam: formPinjam.tanggalPinjam,
      tanggal_rencana_kembali: formPinjam.batasKembali,
      keperluan: formPinjam.keperluan || "Kegiatan Pembelajaran",
    };

    try {
      await api.pinjamSarpras(payload);
      showToast(`Peminjaman sarpras untuk ${formPinjam.namaPeminjam} berhasil dicatat.`);
      setPinjamOpen(false);
      fetchData();
    } catch (err: any) {
      console.error("Gagal pinjam sarpras:", err);
      showToast("Gagal mencatat peminjaman sarpras.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Selesaikan Pengembalian
  const handleSimpanKembali = async () => {
    if (!selectedPinjam) return;
    setIsSubmitting(true);
    try {
      await api.kembalikanSarpras(selectedPinjam.id, {
        kondisi_kembali: formKembali.kondisiKembali,
      });
      showToast(`Aset "${selectedPinjam.namaAset}" berhasil dikembalikan.`);
      setKembaliOpen(false);
      setSelectedPinjam(null);
      fetchData();
    } catch (err: any) {
      console.error("Gagal mengembalikan sarpras:", err);
      showToast("Gagal memproses pengembalian sarpras.");
    } finally {
      setIsSubmitting(false);
    }
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
    showToast("Data inventaris sarpras berhasil diekspor ke CSV.");
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
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
              SIM Aset Terpadu
            </Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Package className="h-6 w-6 text-emerald-600" />
            Sarana, Prasarana &amp; Inventaris Sekolah
          </h1>
          <p className="text-sm text-muted-foreground">
            Pencatatan aset sarana, sirkulasi peminjaman alat KBM, dan tata kelola barang live dari database Supabase.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchData(true)}
            disabled={isRefreshing || isLoading}
            className="gap-1.5 text-xs shadow-xs cursor-pointer"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", (isRefreshing || isLoading) && "animate-spin")} />
            <span>{isRefreshing ? "Memuat..." : "Refresh"}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={daftarAsetSarpras.length === 0}
            className="gap-1.5 text-xs shadow-xs cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (daftarAsetSarpras.length > 0) {
                setFormPinjam((prev) => ({ ...prev, asetId: String(daftarAsetSarpras[0].id) }));
              }
              setPinjamOpen(true);
            }}
            className="gap-1.5 text-xs bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border-emerald-200 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Catat Peminjaman
          </Button>

          <Button
            size="sm"
            onClick={() => setTambahAsetOpen(true)}
            className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Tambah Aset Baru
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
          <Package className="h-4 w-4" />
          Katalog Inventaris ({daftarAsetSarpras.length})
        </button>

        <button
          onClick={() => setActiveTab("peminjaman")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer",
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
            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer",
            activeTab === "ruangan"
              ? "border-emerald-600 text-emerald-700 font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Building className="h-4 w-4" />
          Sebaran Ruangan ({daftarRuanganUnik.length})
        </button>
      </div>

      {/* TAB 1: KATALOG INVENTARIS */}
      {activeTab === "katalog" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-card p-3 rounded-lg border border-border">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari aset, merk, lokasi ruangan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-sm h-9"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                aria-label="Filter Kategori Sarpras"
                value={kategoriFilter}
                onChange={(e) => setKategoriFilter(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs focus:ring-1 focus:ring-ring"
              >
                <option value="SEMUA">Semua Kategori</option>
                <option value="ELEKTRONIK">Elektronik &amp; IT</option>
                <option value="MEDIA_AJAR">Media Pembelajaran</option>
                <option value="LABORATORIUM">Laboratorium IPA</option>
                <option value="OLAHRAGA">Alat Olahraga</option>
                <option value="FURNITUR">Mebel &amp; Furnitur</option>
                <option value="KENDARAAN">Kendaraan / Operasional</option>
              </select>

              <select
                aria-label="Filter Kondisi Sarpras"
                value={kondisiFilter}
                onChange={(e) => setKondisiFilter(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs focus:ring-1 focus:ring-ring"
              >
                <option value="SEMUA">Semua Kondisi</option>
                <option value="BAIK">Kondisi Baik</option>
                <option value="RUSAK_RINGAN">Rusak Ringan</option>
                <option value="RUSAK_BERAT">Rusak Berat</option>
              </select>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-xs font-semibold uppercase text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-4 py-3">Kode &amp; Nama Barang</th>
                    <th className="px-4 py-3">Kategori</th>
                    <th className="px-4 py-3">Lokasi Penempatan</th>
                    <th className="px-4 py-3">Kondisi</th>
                    <th className="px-4 py-3">Ketersediaan</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, idx) => (
                      <tr key={idx} className="animate-pulse">
                        <td className="px-4 py-3 space-y-1">
                          <div className="h-4 w-40 bg-slate-200 rounded" />
                          <div className="h-3 w-24 bg-slate-100 rounded" />
                        </td>
                        <td className="px-4 py-3"><div className="h-5 w-24 bg-slate-200 rounded" /></td>
                        <td className="px-4 py-3"><div className="h-4 w-32 bg-slate-200 rounded" /></td>
                        <td className="px-4 py-3"><div className="h-5 w-20 bg-slate-200 rounded" /></td>
                        <td className="px-4 py-3"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
                        <td className="px-4 py-3 text-right"><div className="h-7 w-16 bg-slate-200 rounded ml-auto" /></td>
                      </tr>
                    ))
                  ) : asetFiltered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground text-sm">
                        Tidak ada barang inventaris yang sesuai pencarian.
                      </td>
                    </tr>
                  ) : (
                    asetFiltered.map((a) => {
                      const KategoriConf = KATEGORI_CONFIG[a.kategori] || {
                        label: a.kategori,
                        badgeClass: "bg-slate-100 text-slate-800 border-slate-200",
                      };
                      const KondisiConf = KONDISI_CONFIG[a.kondisi] || {
                        label: a.kondisi,
                        badgeClass: "bg-slate-100 text-slate-800 border-slate-200",
                        icon: CheckCircle2,
                      };
                      const IconKondisi = KondisiConf.icon;

                      return (
                        <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-semibold text-foreground">{a.namaAset}</div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="font-mono text-xs text-muted-foreground font-medium bg-muted px-1.5 py-0.5 rounded">
                                {a.kodeAset}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {a.merkModel}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap">
                            <Badge variant="outline" className={cn("text-[11px] font-medium", KategoriConf?.badgeClass)}>
                              {KategoriConf?.label || a.kategori}
                            </Badge>
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap text-xs text-foreground font-medium">
                            <div className="flex items-center gap-1.5">
                              <Building className="h-3.5 w-3.5 text-muted-foreground" />
                              {a.lokasi}
                            </div>
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap">
                            <Badge variant="outline" className={cn("text-[11px] font-medium gap-1", KondisiConf.badgeClass)}>
                              <IconKondisi className="h-3 w-3" />
                              {KondisiConf.label}
                            </Badge>
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-xs font-semibold text-foreground">
                              {a.jumlahTersedia} / {a.jumlahTotal} unit
                            </div>
                            <span className="text-[11px] text-muted-foreground">
                              ({Math.round((a.jumlahTersedia / (a.jumlahTotal || 1)) * 100)}% siap)
                            </span>
                          </td>

                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={a.jumlahTersedia === 0}
                              onClick={() => handleBukaPinjamAset(a)}
                              className="h-7 text-xs px-2 gap-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border-emerald-200 cursor-pointer"
                            >
                              <RotateCcw className="h-3 w-3" />
                              Pinjam
                            </Button>
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
                placeholder="Cari peminjam, barang..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-sm h-9"
              />
            </div>

            <Button
              size="sm"
              onClick={() => {
                if (daftarAsetSarpras.length > 0) {
                  setFormPinjam((prev) => ({ ...prev, asetId: String(daftarAsetSarpras[0].id) }));
                }
                setPinjamOpen(true);
              }}
              className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Catat Peminjaman
            </Button>
          </div>

          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-xs font-semibold uppercase text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-4 py-3">Nama Barang</th>
                    <th className="px-4 py-3">Peminjam</th>
                    <th className="px-4 py-3">Jumlah &amp; Jadwal</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {isLoading ? (
                    Array.from({ length: 4 }).map((_, idx) => (
                      <tr key={idx} className="animate-pulse">
                        <td className="px-4 py-3"><div className="h-4 w-40 bg-slate-200 rounded" /></td>
                        <td className="px-4 py-3"><div className="h-4 w-32 bg-slate-200 rounded" /></td>
                        <td className="px-4 py-3"><div className="h-4 w-28 bg-slate-200 rounded" /></td>
                        <td className="px-4 py-3"><div className="h-5 w-20 bg-slate-200 rounded" /></td>
                        <td className="px-4 py-3 text-right"><div className="h-7 w-20 bg-slate-200 rounded ml-auto" /></td>
                      </tr>
                    ))
                  ) : pinjamFiltered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground text-sm">
                        Belum ada data peminjaman sarpras.
                      </td>
                    </tr>
                  ) : (
                    pinjamFiltered.map((p) => {
                      const isKembali = p.status === "DIKEMBALIKAN" || p.status === "KEMBALI";

                      return (
                        <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-semibold text-foreground">{p.namaAset}</div>
                            <span className="font-mono text-xs text-muted-foreground">{p.kodeAset}</span>
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="font-medium text-foreground">{p.namaPeminjam}</div>
                            <span className="text-xs text-muted-foreground">{p.rolePeminjam}</span>
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap text-xs">
                            <div className="font-semibold">{p.jumlahUnit} unit</div>
                            <div className="text-muted-foreground">Pinjam: {p.tanggalPinjam} | Batas: {p.batasKembali}</div>
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap">
                            {isKembali ? (
                              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs">
                                Sudah Kembali
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs">
                                Sedang Dipinjam
                              </Badge>
                            )}
                          </td>

                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            {!isKembali && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedPinjam(p);
                                  setKembaliOpen(true);
                                }}
                                className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1 cursor-pointer"
                              >
                                <Check className="h-3 w-3" />
                                Kembalikan
                              </Button>
                            )}
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

      {/* TAB 3: SEBARAN RUANGAN */}
      {activeTab === "ruangan" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {daftarRuanganUnik.length === 0 ? (
            <div className="col-span-3 py-12 text-center text-muted-foreground text-sm">
              Belum ada data penempatan ruangan sarpras.
            </div>
          ) : (
            daftarRuanganUnik.map((ruang) => {
              const asetRuang = daftarAsetSarpras.filter((a) => a.lokasi === ruang);
              const totalUnitRuang = asetRuang.reduce((acc, a) => acc + a.jumlahTotal, 0);

              return (
                <Card key={ruang} className="border border-border/70 shadow-xs">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                        <Building className="h-4 w-4" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-bold text-foreground">{ruang}</CardTitle>
                        <p className="text-xs text-muted-foreground">{asetRuang.length} jenis aset ({totalUnitRuang} unit)</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="divide-y divide-border text-xs">
                      {asetRuang.slice(0, 3).map((a) => (
                        <div key={a.id} className="py-1.5 flex justify-between items-center">
                          <span className="text-foreground font-medium truncate max-w-[200px]">{a.namaAset}</span>
                          <span className="font-mono text-muted-foreground">{a.jumlahTotal} unit</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* MODAL TAMBAH ASET */}
      <Dialog open={isTambahAsetOpen} onOpenChange={setTambahAsetOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Package className="h-5 w-5 text-emerald-600" />
              Pencatatan Aset Sarpras Baru
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSimpanAset} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground">Nama Barang / Aset *</label>
              <Input
                required
                placeholder="Contoh: Proyektor InFocus IN112x"
                value={formAset.namaAset}
                onChange={(e) => setFormAset({ ...formAset, namaAset: e.target.value })}
                className="mt-1 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground">Kategori Barang</label>
                <select
                  value={formAset.kategori}
                  onChange={(e) => setFormAset({ ...formAset, kategori: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="ELEKTRONIK">Elektronik &amp; IT</option>
                  <option value="MEDIA_AJAR">Media Pembelajaran</option>
                  <option value="LABORATORIUM">Laboratorium IPA</option>
                  <option value="OLAHRAGA">Alat Olahraga</option>
                  <option value="FURNITUR">Mebel &amp; Furnitur</option>
                  <option value="KENDARAAN">Kendaraan / Operasional</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Kode Aset (Opsional)</label>
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
                <label className="text-xs font-semibold text-foreground">Merk / Spesifikasi</label>
                <Input
                  placeholder="Merk, seri, atau tipe..."
                  value={formAset.merkModel}
                  onChange={(e) => setFormAset({ ...formAset, merkModel: e.target.value })}
                  className="mt-1 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Lokasi Penempatan</label>
                <Input
                  placeholder="Contoh: Lab Komputer 1 / Ruang Guru"
                  value={formAset.lokasi}
                  onChange={(e) => setFormAset({ ...formAset, lokasi: e.target.value })}
                  className="mt-1 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground">Kondisi Barang</label>
                <select
                  value={formAset.kondisi}
                  onChange={(e) => setFormAset({ ...formAset, kondisi: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="BAIK">Kondisi Baik</option>
                  <option value="RUSAK_RINGAN">Rusak Ringan</option>
                  <option value="RUSAK_BERAT">Rusak Berat</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Jumlah Unit</label>
                <Input
                  type="number"
                  min="1"
                  value={formAset.jumlahTotal}
                  onChange={(e) => setFormAset({ ...formAset, jumlahTotal: Number(e.target.value) || 1 })}
                  className="mt-1 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Tahun Pengadaan</label>
                <Input
                  type="number"
                  value={formAset.tahunPengadaan}
                  onChange={(e) => setFormAset({ ...formAset, tahunPengadaan: Number(e.target.value) || new Date().getFullYear() })}
                  className="mt-1 text-sm"
                />
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setTambahAsetOpen(false)} disabled={isSubmitting}>
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5">
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>{isSubmitting ? "Menyimpan..." : "Simpan Aset"}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL PINJAM SARPRAS */}
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
              <label className="text-xs font-semibold text-foreground">Pilih Barang / Aset *</label>
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
                  placeholder="Nama guru / staf..."
                  value={formPinjam.namaPeminjam}
                  onChange={(e) => setFormPinjam({ ...formPinjam, namaPeminjam: e.target.value })}
                  className="mt-1 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Jumlah Unit Dipinjam</label>
                <Input
                  type="number"
                  min="1"
                  value={formPinjam.jumlahUnit}
                  onChange={(e) => setFormPinjam({ ...formPinjam, jumlahUnit: Number(e.target.value) || 1 })}
                  className="mt-1 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground">Tanggal Pinjam</label>
                <Input
                  type="date"
                  required
                  value={formPinjam.tanggalPinjam}
                  onChange={(e) => setFormPinjam({ ...formPinjam, tanggalPinjam: e.target.value })}
                  className="mt-1 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Rencana Kembali</label>
                <Input
                  type="date"
                  required
                  value={formPinjam.batasKembali}
                  onChange={(e) => setFormPinjam({ ...formPinjam, batasKembali: e.target.value })}
                  className="mt-1 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">Keperluan Peminjaman</label>
              <Input
                placeholder="Contoh: KBM Praktik di Aula / Ujian Sekolah"
                value={formPinjam.keperluan}
                onChange={(e) => setFormPinjam({ ...formPinjam, keperluan: e.target.value })}
                className="mt-1 text-sm"
              />
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

      {/* MODAL PENGEMBALIAN SARPRAS */}
      <Dialog open={isKembaliOpen} onOpenChange={setKembaliOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              Penerimaan Pengembalian Aset
            </DialogTitle>
          </DialogHeader>

          {selectedPinjam && (
            <div className="space-y-4">
              <div className="p-3 bg-muted/50 rounded-lg space-y-1 text-xs">
                <div className="font-semibold text-foreground text-sm">
                  {selectedPinjam.namaAset} ({selectedPinjam.jumlahUnit} unit)
                </div>
                <div className="text-muted-foreground">
                  Peminjam: <span className="font-medium text-foreground">{selectedPinjam.namaPeminjam}</span> ({selectedPinjam.rolePeminjam})
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Kondisi Saat Dikembalikan</label>
                <select
                  value={formKembali.kondisiKembali}
                  onChange={(e) => setFormKembali({ ...formKembali, kondisiKembali: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="BAIK">Kondisi Baik &amp; Lengkap</option>
                  <option value="RUSAK">Ada Kerusakan</option>
                  <option value="HILANG">Barang / Aksesoris Hilang</option>
                </select>
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
                  <span>{isSubmitting ? "Menyimpan..." : "Barang Telah Kembali"}</span>
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
