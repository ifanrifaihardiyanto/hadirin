"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Trophy,
  Users,
  Search,
  Plus,
  ArrowLeft,
  Download,
  CheckCircle2,
  Clock,
  Building,
  Trash2,
  Award,
  Compass,
  Check,
  RefreshCw,
  Loader2,
  Edit,
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

export interface EkskulItem {
  id: string | number;
  nama: string;
  kategori: "WAJIB" | "OLAHRAGA" | "KEPEMIMPINAN" | "SAINS_IPTEK" | "SENI_BUDAYA" | "KEAGAMAAN" | string;
  pembina: string;
  kontakPembina?: string;
  hariLatihan: string;
  jamMulai: string;
  jamSelesai: string;
  lokasiLatihan: string;
  kuotaMaksimal: number;
  deskripsi?: string;
  prestasiTerbaru?: string;
  anggotaCount?: number;
}

export interface AnggotaEkskulItem {
  id: string | number;
  ekskulId: string | number;
  namaEkskul: string;
  siswaId: string | number;
  namaSiswa: string;
  nisn: string;
  kelas: string;
  jabatan: "KETUA" | "WAKIL" | "SEKRETARIS" | "BENDAHARA" | "ANGGOTA" | string;
  predikatNilai: "SANGAT_BAIK" | "BAIK" | "CUKUP" | "KURANG" | string;
  kehadiranPersen: number;
  catatanPembina?: string;
}

const KATEGORI_CONFIG: Record<
  string,
  { label: string; badgeClass: string }
> = {
  WAJIB: {
    label: "Wajib Nasional",
    badgeClass: "bg-blue-100 text-blue-900 border-blue-200",
  },
  OLAHRAGA: {
    label: "Olahraga & Prestasi",
    badgeClass: "bg-orange-100 text-orange-900 border-orange-200",
  },
  KEPEMIMPINAN: {
    label: "Kepemimpinan & Bela Negara",
    badgeClass: "bg-emerald-100 text-emerald-900 border-emerald-200",
  },
  SAINS_IPTEK: {
    label: "Sains & Teknologi",
    badgeClass: "bg-purple-100 text-purple-900 border-purple-200",
  },
  SENI_BUDAYA: {
    label: "Seni & Budaya",
    badgeClass: "bg-pink-100 text-pink-900 border-pink-200",
  },
  KEAGAMAAN: {
    label: "Kerohanian & Agama",
    badgeClass: "bg-teal-100 text-teal-900 border-teal-200",
  },
};

const PREDIKAT_CONFIG: Record<
  string,
  { label: string; badgeClass: string }
> = {
  SANGAT_BAIK: {
    label: "Sangat Baik (A)",
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  BAIK: {
    label: "Baik (B)",
    badgeClass: "bg-blue-100 text-blue-800 border-blue-200",
  },
  CUKUP: {
    label: "Cukup (C)",
    badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
  },
  KURANG: {
    label: "Kurang (D)",
    badgeClass: "bg-rose-100 text-rose-800 border-rose-200",
  },
};

export default function AdminEkskulPage() {
  const [daftarEkskul, setDaftarEkskul] = useState<EkskulItem[]>([]);
  const [daftarAnggotaEkskul, setDaftarAnggotaEkskul] = useState<AnggotaEkskulItem[]>([]);
  const [daftarSiswaInduk, setDaftarSiswaInduk] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [activeTab, setActiveTab] = useState<"katalog" | "anggota" | "jadwal">("katalog");
  const [searchQuery, setSearchQuery] = useState("");
  const [kategoriFilter, setKategoriFilter] = useState<string>("SEMUA");
  const [ekskulFilter, setEkskulFilter] = useState<string>("SEMUA");
  const [predikatFilter, setPredikatFilter] = useState<string>("SEMUA");

  // Modals
  const [isTambahEkskulOpen, setTambahEkskulOpen] = useState(false);
  const [isTambahAnggotaOpen, setTambahAnggotaOpen] = useState(false);
  const [isNilaiOpen, setNilaiOpen] = useState(false);

  // Selected items
  const [selectedAnggota, setSelectedAnggota] = useState<AnggotaEkskulItem | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Form Tambah Ekskul
  const [formEkskul, setFormEkskul] = useState({
    nama: "",
    kategori: "OLAHRAGA",
    pembina: "",
    kontakPembina: "",
    hariLatihan: "Jumat",
    jamMulai: "15:30",
    jamSelesai: "17:00",
    lokasiLatihan: "Lapangan Utama",
    kuotaMaksimal: 30,
    deskripsi: "",
    prestasiTerbaru: "",
  });

  // Form Tambah Anggota
  const [formAnggota, setFormAnggota] = useState({
    ekskulId: "",
    siswaId: "",
    jabatan: "ANGGOTA",
  });

  // Form Nilai Anggota
  const [formNilai, setFormNilai] = useState({
    predikatNilai: "BAIK",
    kehadiranPersen: 90,
    catatanPembina: "",
  });

  const fetchData = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const [resEkskul, resAnggota, resSiswa] = await Promise.all([
        api.getEkskulList(),
        api.getAnggotaEkskulList(),
        api.getSiswaList(),
      ]);

      const rawEkskul = (resEkskul as any)?.data || (resEkskul as any) || [];
      const normalizedEkskul: EkskulItem[] = Array.isArray(rawEkskul)
        ? rawEkskul.map((item: any) => ({
            id: item.id,
            nama: item.nama || "Ekskul",
            kategori: item.kategori || "OLAHRAGA",
            pembina: item.pembina || item.pembinaGuru?.nama || "-",
            kontakPembina: item.kontak_pembina || item.kontakPembina || "",
            hariLatihan: item.hari_latihan || item.hariLatihan || "Jumat",
            jamMulai: item.jam_mulai || item.jamMulai || "15:30",
            jamSelesai: item.jam_selesai || item.jamSelesai || "17:00",
            lokasiLatihan: item.lokasi_latihan || item.lokasiLatihan || "Sekolah",
            kuotaMaksimal: Number(item.kuota_maksimal ?? item.kuotaMaksimal ?? 30),
            deskripsi: item.deskripsi || "",
            prestasiTerbaru: item.prestasi_terbaru || item.prestasiTerbaru || "",
            anggotaCount: Number(item.anggota_count ?? 0),
          }))
        : [];
      setDaftarEkskul(normalizedEkskul);

      const rawAnggota = (resAnggota as any)?.data || (resAnggota as any) || [];
      const normalizedAnggota: AnggotaEkskulItem[] = Array.isArray(rawAnggota)
        ? rawAnggota.map((item: any) => ({
            id: item.id,
            ekskulId: item.ekskul_id || item.ekskulId || (item.ekskul?.id || ""),
            namaEkskul: item.ekskul?.nama || item.nama_ekskul || item.namaEkskul || "Ekskul",
            siswaId: item.siswa_id || item.siswaId || (item.siswa?.id || ""),
            namaSiswa: item.siswa?.nama || item.nama_siswa || item.namaSiswa || "Siswa",
            nisn: item.siswa?.nisn || item.nisn || "-",
            kelas: item.siswa?.kelas?.nama || item.siswa?.kelas?.nama_kelas || item.kelas || "-",
            jabatan: item.jabatan || "ANGGOTA",
            predikatNilai: item.predikat_nilai || item.predikatNilai || "BAIK",
            kehadiranPersen: Number(item.kehadiran_persen ?? item.kehadiranPersen ?? 100),
            catatanPembina: item.catatan_pembina || item.catatanPembina || "",
          }))
        : [];
      setDaftarAnggotaEkskul(normalizedAnggota);

      const rawSiswa = (resSiswa as any)?.data || (resSiswa as any) || [];
      setDaftarSiswaInduk(Array.isArray(rawSiswa) ? rawSiswa : []);

      if (isManual) showToast("Data ekstrakurikuler berhasil diperbarui.");
    } catch (err: any) {
      console.error("Gagal memuat data ekskul:", err);
      showToast("Gagal memuat data ekskul dari server.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // KPIs
  const totalEkskul = daftarEkskul.length;
  const totalAnggota = daftarAnggotaEkskul.length;
  const avgKehadiran = useMemo(() => {
    if (daftarAnggotaEkskul.length === 0) return 0;
    const sum = daftarAnggotaEkskul.reduce((acc, a) => acc + a.kehadiranPersen, 0);
    return Math.round(sum / daftarAnggotaEkskul.length);
  }, [daftarAnggotaEkskul]);
  const totalPrestasi = useMemo(
    () => daftarEkskul.filter((e) => Boolean(e.prestasiTerbaru)).length,
    [daftarEkskul]
  );

  // Filtered Ekskul
  const ekskulFiltered = useMemo(() => {
    return daftarEkskul.filter((e) => {
      const matchSearch =
        searchQuery === "" ||
        e.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.pembina.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.lokasiLatihan.toLowerCase().includes(searchQuery.toLowerCase());

      const matchKategori =
        kategoriFilter === "SEMUA" || e.kategori === kategoriFilter;

      return matchSearch && matchKategori;
    });
  }, [daftarEkskul, searchQuery, kategoriFilter]);

  // Filtered Anggota
  const anggotaFiltered = useMemo(() => {
    return daftarAnggotaEkskul.filter((a) => {
      const matchSearch =
        searchQuery === "" ||
        a.namaSiswa.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.nisn.includes(searchQuery) ||
        a.namaEkskul.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.kelas.toLowerCase().includes(searchQuery.toLowerCase());

      const matchEkskul =
        ekskulFilter === "SEMUA" || String(a.ekskulId) === String(ekskulFilter);

      const matchPredikat =
        predikatFilter === "SEMUA" || a.predikatNilai === predikatFilter;

      return matchSearch && matchEkskul && matchPredikat;
    });
  }, [daftarAnggotaEkskul, searchQuery, ekskulFilter, predikatFilter]);

  // Submit Tambah Ekskul
  const handleSimpanEkskul = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEkskul.nama.trim() || !formEkskul.pembina.trim()) return;

    setIsSubmitting(true);
    const payload = {
      nama: formEkskul.nama,
      kategori: formEkskul.kategori,
      pembina: formEkskul.pembina,
      kontak_pembina: formEkskul.kontakPembina,
      hari_latihan: formEkskul.hariLatihan,
      jam_mulai: formEkskul.jamMulai,
      jam_selesai: formEkskul.jamSelesai,
      lokasi_latihan: formEkskul.lokasiLatihan,
      kuota_maksimal: Number(formEkskul.kuotaMaksimal) || 30,
      deskripsi: formEkskul.deskripsi,
      prestasi_terbaru: formEkskul.prestasiTerbaru,
    };

    try {
      await api.createEkskul(payload);
      showToast(`Ekstrakurikuler "${formEkskul.nama}" berhasil ditambahkan.`);
      setFormEkskul({
        nama: "",
        kategori: "OLAHRAGA",
        pembina: "",
        kontakPembina: "",
        hariLatihan: "Jumat",
        jamMulai: "15:30",
        jamSelesai: "17:00",
        lokasiLatihan: "Lapangan Utama",
        kuotaMaksimal: 30,
        deskripsi: "",
        prestasiTerbaru: "",
      });
      setTambahEkskulOpen(false);
      fetchData();
    } catch (err: any) {
      console.error("Gagal simpan ekskul:", err);
      showToast("Gagal menyimpan ekstrakurikuler.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Tambah Anggota
  const handleSimpanAnggota = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAnggota.ekskulId || !formAnggota.siswaId) return;

    setIsSubmitting(true);
    const payload = {
      ekskul_id: formAnggota.ekskulId,
      siswa_id: formAnggota.siswaId,
      jabatan: formAnggota.jabatan,
    };

    try {
      await api.createAnggotaEkskul(payload);
      showToast("Anggota ekskul berhasil didaftarkan.");
      setTambahAnggotaOpen(false);
      fetchData();
    } catch (err: any) {
      console.error("Gagal daftar anggota ekskul:", err);
      showToast("Gagal mendaftarkan anggota ekskul.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Nilai Anggota
  const handleSimpanNilai = async () => {
    if (!selectedAnggota) return;

    setIsSubmitting(true);
    const payload = {
      predikat_nilai: formNilai.predikatNilai,
      kehadiran_persen: Number(formNilai.kehadiranPersen) || 80,
      catatan_pembina: formNilai.catatanPembina,
    };

    try {
      await api.updateNilaiAnggotaEkskul(selectedAnggota.id, payload);
      showToast(`Nilai ekskul untuk ${selectedAnggota.namaSiswa} berhasil disimpan.`);
      setNilaiOpen(false);
      setSelectedAnggota(null);
      fetchData();
    } catch (err: any) {
      console.error("Gagal simpan nilai ekskul:", err);
      showToast("Gagal menyimpan nilai ekskul.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      "Nama Siswa",
      "NISN",
      "Kelas",
      "Nama Ekskul",
      "Jabatan",
      "Kehadiran (%)",
      "Predikat Nilai",
      "Catatan Pembina Rapor",
    ];

    const rows = daftarAnggotaEkskul.map((a) => [
      `"${a.namaSiswa}"`,
      `"${a.nisn}"`,
      `"${a.kelas}"`,
      `"${a.namaEkskul}"`,
      `"${a.jabatan}"`,
      a.kehadiranPersen,
      `"${PREDIKAT_CONFIG[a.predikatNilai]?.label || a.predikatNilai}"`,
      `"${a.catatanPembina || ""}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Rekap_Nilai_Ekskul_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Rekap nilai ekskul berhasil diekspor ke CSV.");
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
              Pengembangan Diri &amp; Prestasi
            </Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Trophy className="h-6 w-6 text-emerald-600" />
            Ekstrakurikuler &amp; Pengembangan Bakat Siswa
          </h1>
          <p className="text-sm text-muted-foreground">
            Direktori kegiatan ekskul, rotasi jadwal latihan, keanggotaan siswa, dan nilai rapor live dari database Supabase.
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
            disabled={daftarAnggotaEkskul.length === 0}
            className="gap-1.5 text-xs shadow-xs cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (daftarEkskul.length > 0 && daftarSiswaInduk.length > 0) {
                setFormAnggota({
                  ekskulId: String(daftarEkskul[0].id),
                  siswaId: String(daftarSiswaInduk[0].id),
                  jabatan: "ANGGOTA",
                });
              }
              setTambahAnggotaOpen(true);
            }}
            className="gap-1.5 text-xs bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border-emerald-200 cursor-pointer"
          >
            <Users className="h-3.5 w-3.5" />
            Daftarkan Anggota
          </Button>

          <Button
            size="sm"
            onClick={() => setTambahEkskulOpen(true)}
            className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Tambah Ekskul Baru
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
                  <p className="text-xs text-muted-foreground font-medium">Kegiatan Ekskul Aktif</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-bold tracking-tight text-foreground">{totalEkskul}</span>
                    <span className="text-xs text-muted-foreground">cabang kegiatan</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-sky-50 text-sky-700">
                  <Compass className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border/60 shadow-xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Total Anggota Siswa</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-bold tracking-tight text-emerald-700">{totalAnggota}</span>
                    <span className="text-xs text-muted-foreground">partisipan aktif</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700">
                  <Users className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border/60 shadow-xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Rata-rata Presensi Latihan</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-bold tracking-tight text-amber-700">{avgKehadiran}%</span>
                    <span className="text-xs text-muted-foreground">kehadiran siswa</span>
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
                  <p className="text-xs text-muted-foreground font-medium">Capaian Prestasi Ekskul</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-bold tracking-tight text-purple-700">{totalPrestasi}</span>
                    <span className="text-xs text-muted-foreground">penghargaan tercatat</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-purple-50 text-purple-700">
                  <Award className="h-5 w-5" />
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
          <Compass className="h-4 w-4" />
          Katalog Ekstrakurikuler ({daftarEkskul.length})
        </button>

        <button
          onClick={() => setActiveTab("anggota")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer",
            activeTab === "anggota"
              ? "border-emerald-600 text-emerald-700 font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Users className="h-4 w-4" />
          Keanggotaan &amp; Nilai Rapor ({daftarAnggotaEkskul.length})
        </button>

        <button
          onClick={() => setActiveTab("jadwal")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer",
            activeTab === "jadwal"
              ? "border-emerald-600 text-emerald-700 font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Clock className="h-4 w-4" />
          Jadwal Latihan Mingguan
        </button>
      </div>

      {/* TAB 1: KATALOG EKSKUL */}
      {activeTab === "katalog" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-card p-3 rounded-lg border border-border">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari ekskul, pembina, tempat latihan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-sm h-9"
              />
            </div>

            <select
              aria-label="Filter Kategori Ekskul"
              value={kategoriFilter}
              onChange={(e) => setKategoriFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs focus:ring-1 focus:ring-ring"
            >
              <option value="SEMUA">Semua Kategori</option>
              <option value="WAJIB">Wajib Nasional</option>
              <option value="OLAHRAGA">Olahraga &amp; Prestasi</option>
              <option value="KEPEMIMPINAN">Kepemimpinan &amp; Bela Negara</option>
              <option value="SAINS_IPTEK">Sains &amp; Teknologi</option>
              <option value="SENI_BUDAYA">Seni &amp; Budaya</option>
              <option value="KEAGAMAAN">Kerohanian &amp; Agama</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <Card key={idx} className="border border-border/70 shadow-xs animate-pulse">
                  <CardHeader className="pb-2 space-y-2">
                    <div className="h-5 w-36 bg-slate-200 rounded" />
                    <div className="h-3 w-20 bg-slate-100 rounded" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="h-12 bg-slate-100 rounded" />
                    <div className="h-4 w-28 bg-slate-200 rounded" />
                  </CardContent>
                </Card>
              ))
            ) : ekskulFiltered.length === 0 ? (
              <div className="col-span-3 py-12 text-center text-muted-foreground text-sm">
                Tidak ada kegiatan ekskul yang sesuai pencarian.
              </div>
            ) : (
              ekskulFiltered.map((ekskul) => {
                const KategoriConf = KATEGORI_CONFIG[ekskul.kategori] || {
                  label: ekskul.kategori,
                  badgeClass: "bg-slate-100 text-slate-800 border-slate-200",
                };

                return (
                  <Card key={ekskul.id} className="border border-border/70 shadow-xs hover:border-emerald-300 transition-colors">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base font-bold text-foreground">{ekskul.nama}</CardTitle>
                          <Badge variant="outline" className={cn("text-[10px] font-medium mt-1", KategoriConf.badgeClass)}>
                            {KategoriConf.label}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <span className="font-mono text-sm font-bold text-foreground">
                            {ekskul.anggotaCount ?? 0}
                          </span>
                          <span className="text-[10px] text-muted-foreground">/{ekskul.kuotaMaksimal} siswa</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {ekskul.deskripsi && (
                        <p className="text-xs text-muted-foreground line-clamp-2">{ekskul.deskripsi}</p>
                      )}

                      <div className="p-2.5 rounded-lg bg-muted/40 space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Pembina:</span>
                          <span className="font-medium text-foreground">{ekskul.pembina}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Jadwal:</span>
                          <span className="font-medium text-foreground">{ekskul.hariLatihan}, {ekskul.jamMulai} - {ekskul.jamSelesai}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Lokasi:</span>
                          <span className="text-foreground">{ekskul.lokasiLatihan}</span>
                        </div>
                      </div>

                      {ekskul.prestasiTerbaru && (
                        <div className="flex items-center gap-1.5 text-xs text-purple-800 bg-purple-50 p-2 rounded border border-purple-200">
                          <Trophy className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{ekskul.prestasiTerbaru}</span>
                        </div>
                      )}

                      <div className="pt-2 border-t border-border flex items-center justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setFormAnggota((prev) => ({ ...prev, ekskulId: String(ekskul.id) }));
                            setTambahAnggotaOpen(true);
                          }}
                          className="text-xs h-7 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border-emerald-200 cursor-pointer"
                        >
                          + Daftar Anggota
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

      {/* TAB 2: KEANGGOTAAN & NILAI */}
      {activeTab === "anggota" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-card p-3 rounded-lg border border-border">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari siswa, ekskul, kelas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-sm h-9"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                aria-label="Filter Ekskul Anggota"
                value={ekskulFilter}
                onChange={(e) => setEkskulFilter(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs focus:ring-1 focus:ring-ring"
              >
                <option value="SEMUA">Semua Ekskul</option>
                {daftarEkskul.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nama}
                  </option>
                ))}
              </select>

              <select
                aria-label="Filter Predikat Nilai"
                value={predikatFilter}
                onChange={(e) => setPredikatFilter(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs focus:ring-1 focus:ring-ring"
              >
                <option value="SEMUA">Semua Predikat</option>
                <option value="SANGAT_BAIK">Sangat Baik (A)</option>
                <option value="BAIK">Baik (B)</option>
                <option value="CUKUP">Cukup (C)</option>
                <option value="KURANG">Kurang (D)</option>
              </select>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-xs font-semibold uppercase text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-4 py-3">Nama Siswa</th>
                    <th className="px-4 py-3">Kegiatan Ekskul</th>
                    <th className="px-4 py-3">Jabatan</th>
                    <th className="px-4 py-3">Kehadiran</th>
                    <th className="px-4 py-3">Predikat Nilai</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, idx) => (
                      <tr key={idx} className="animate-pulse">
                        <td className="px-4 py-3"><div className="h-4 w-36 bg-slate-200 rounded" /></td>
                        <td className="px-4 py-3"><div className="h-4 w-28 bg-slate-200 rounded" /></td>
                        <td className="px-4 py-3"><div className="h-5 w-20 bg-slate-200 rounded" /></td>
                        <td className="px-4 py-3"><div className="h-4 w-16 bg-slate-200 rounded" /></td>
                        <td className="px-4 py-3"><div className="h-5 w-24 bg-slate-200 rounded" /></td>
                        <td className="px-4 py-3 text-right"><div className="h-7 w-16 bg-slate-200 rounded ml-auto" /></td>
                      </tr>
                    ))
                  ) : anggotaFiltered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground text-sm">
                        Belum ada anggota ekskul yang terdaftar.
                      </td>
                    </tr>
                  ) : (
                    anggotaFiltered.map((a) => {
                      const PredikatConf = PREDIKAT_CONFIG[a.predikatNilai] || {
                        label: a.predikatNilai,
                        badgeClass: "bg-slate-100 text-slate-800 border-slate-200",
                      };

                      return (
                        <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-semibold text-foreground">{a.namaSiswa}</div>
                            <span className="text-xs text-muted-foreground font-mono">
                              NISN: {a.nisn} • {a.kelas}
                            </span>
                          </td>

                          <td className="px-4 py-3 font-medium text-foreground">
                            {a.namaEkskul}
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap">
                            <Badge variant="outline" className="text-[10px]">
                              {a.jabatan}
                            </Badge>
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap font-mono text-xs">
                            {a.kehadiranPersen}%
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap">
                            <Badge variant="outline" className={cn("text-[11px] font-medium", PredikatConf.badgeClass)}>
                              {PredikatConf.label}
                            </Badge>
                          </td>

                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedAnggota(a);
                                setFormNilai({
                                  predikatNilai: a.predikatNilai,
                                  kehadiranPersen: a.kehadiranPersen,
                                  catatanPembina: a.catatanPembina || "",
                                });
                                setNilaiOpen(true);
                              }}
                              className="h-7 text-xs px-2 gap-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border-emerald-200 cursor-pointer"
                            >
                              <Edit className="h-3 w-3" />
                              Nilai
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

      {/* TAB 3: JADWAL LATIHAN */}
      {activeTab === "jadwal" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {daftarEkskul.map((e) => (
              <Card key={e.id} className="border border-border/70 shadow-xs">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold text-foreground flex items-center justify-between">
                    <span>{e.nama}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {e.hariLatihan}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Waktu:</span>
                    <span className="font-medium text-foreground">{e.jamMulai} - {e.jamSelesai} WIB</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tempat:</span>
                    <span className="font-medium text-foreground">{e.lokasiLatihan}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Pembina:</span>
                    <span className="font-medium text-foreground">{e.pembina}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* MODAL TAMBAH EKSKUL */}
      <Dialog open={isTambahEkskulOpen} onOpenChange={setTambahEkskulOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Trophy className="h-5 w-5 text-emerald-600" />
              Buka Cabang Ekstrakurikuler Baru
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSimpanEkskul} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground">Nama Ekstrakurikuler *</label>
              <Input
                required
                placeholder="Contoh: Basket Putra, Robotika, Pramuka..."
                value={formEkskul.nama}
                onChange={(e) => setFormEkskul({ ...formEkskul, nama: e.target.value })}
                className="mt-1 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground">Kategori</label>
                <select
                  value={formEkskul.kategori}
                  onChange={(e) => setFormEkskul({ ...formEkskul, kategori: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="WAJIB">Wajib Nasional</option>
                  <option value="OLAHRAGA">Olahraga &amp; Prestasi</option>
                  <option value="KEPEMIMPINAN">Kepemimpinan &amp; Bela Negara</option>
                  <option value="SAINS_IPTEK">Sains &amp; Teknologi</option>
                  <option value="SENI_BUDAYA">Seni &amp; Budaya</option>
                  <option value="KEAGAMAAN">Kerohanian &amp; Agama</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Guru / Pelatih Pembina *</label>
                <Input
                  required
                  placeholder="Nama pembina..."
                  value={formEkskul.pembina}
                  onChange={(e) => setFormEkskul({ ...formEkskul, pembina: e.target.value })}
                  className="mt-1 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground">Hari Latihan</label>
                <Input
                  placeholder="Jumat / Sabtu"
                  value={formEkskul.hariLatihan}
                  onChange={(e) => setFormEkskul({ ...formEkskul, hariLatihan: e.target.value })}
                  className="mt-1 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Jam Mulai</label>
                <Input
                  type="time"
                  value={formEkskul.jamMulai}
                  onChange={(e) => setFormEkskul({ ...formEkskul, jamMulai: e.target.value })}
                  className="mt-1 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Jam Selesai</label>
                <Input
                  type="time"
                  value={formEkskul.jamSelesai}
                  onChange={(e) => setFormEkskul({ ...formEkskul, jamSelesai: e.target.value })}
                  className="mt-1 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground">Lokasi Latihan</label>
                <Input
                  placeholder="Lapangan / Lab / Aula"
                  value={formEkskul.lokasiLatihan}
                  onChange={(e) => setFormEkskul({ ...formEkskul, lokasiLatihan: e.target.value })}
                  className="mt-1 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Kuota Siswa</label>
                <Input
                  type="number"
                  min="5"
                  value={formEkskul.kuotaMaksimal}
                  onChange={(e) => setFormEkskul({ ...formEkskul, kuotaMaksimal: Number(e.target.value) || 30 })}
                  className="mt-1 text-sm"
                />
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setTambahEkskulOpen(false)} disabled={isSubmitting}>
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5">
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>{isSubmitting ? "Menyimpan..." : "Simpan Ekskul"}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL DAFTARKAN ANGGOTA */}
      <Dialog open={isTambahAnggotaOpen} onOpenChange={setTambahAnggotaOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Users className="h-5 w-5 text-emerald-600" />
              Pendaftaran Anggota Ekskul
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSimpanAnggota} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground">Pilih Ekstrakurikuler *</label>
              <select
                required
                value={formAnggota.ekskulId}
                onChange={(e) => setFormAnggota({ ...formAnggota, ekskulId: e.target.value })}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">-- Pilih Ekskul --</option>
                {daftarEkskul.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nama}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">Pilih Siswa *</label>
              <select
                required
                value={formAnggota.siswaId}
                onChange={(e) => setFormAnggota({ ...formAnggota, siswaId: e.target.value })}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">-- Pilih Siswa --</option>
                {daftarSiswaInduk.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nama} ({s.kelas?.nama_kelas || s.kelas?.nama || "Siswa"})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">Jabatan Kepengurusan</label>
              <select
                value={formAnggota.jabatan}
                onChange={(e) => setFormAnggota({ ...formAnggota, jabatan: e.target.value })}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="ANGGOTA">Anggota</option>
                <option value="KETUA">Ketua Ekskul</option>
                <option value="WAKIL">Wakil Ketua</option>
                <option value="SEKRETARIS">Sekretaris</option>
                <option value="BENDAHARA">Bendahara</option>
              </select>
            </div>

            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setTambahAnggotaOpen(false)} disabled={isSubmitting}>
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5">
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>{isSubmitting ? "Mendaftarkan..." : "Daftarkan Siswa"}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL PENILAIAN EKSKUL */}
      <Dialog open={isNilaiOpen} onOpenChange={setNilaiOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Award className="h-5 w-5 text-emerald-600" />
              Penilaian Rapor Ekstrakurikuler
            </DialogTitle>
          </DialogHeader>

          {selectedAnggota && (
            <div className="space-y-4">
              <div className="p-3 bg-muted/50 rounded-lg space-y-1 text-xs">
                <div className="font-semibold text-foreground text-sm">{selectedAnggota.namaSiswa}</div>
                <div className="text-muted-foreground">{selectedAnggota.namaEkskul} • {selectedAnggota.kelas}</div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Predikat Nilai Kurikulum Merdeka *</label>
                <select
                  value={formNilai.predikatNilai}
                  onChange={(e) => setFormNilai({ ...formNilai, predikatNilai: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="SANGAT_BAIK">Sangat Baik (A)</option>
                  <option value="BAIK">Baik (B)</option>
                  <option value="CUKUP">Cukup (C)</option>
                  <option value="KURANG">Kurang (D)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Persentase Kehadiran Latihan (%)</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formNilai.kehadiranPersen}
                  onChange={(e) => setFormNilai({ ...formNilai, kehadiranPersen: Number(e.target.value) || 0 })}
                  className="mt-1 text-sm font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Catatan Deskripsi untuk Lembar Rapor</label>
                <textarea
                  rows={2}
                  placeholder="Catatan perkembangan karakter, ketekunan, dan prestasi..."
                  value={formNilai.catatanPembina}
                  onChange={(e) => setFormNilai({ ...formNilai, catatanPembina: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm"
                />
              </div>

              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setNilaiOpen(false)} disabled={isSubmitting}>
                  Batal
                </Button>
                <Button
                  onClick={handleSimpanNilai}
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>{isSubmitting ? "Menyimpan..." : "Simpan Nilai"}</span>
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
