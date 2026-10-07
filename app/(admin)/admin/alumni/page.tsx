"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Briefcase,
  GraduationCap,
  Search,
  Plus,
  ArrowLeft,
  Download,
  Building2,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  Users,
  Compass,
  Edit,
  Trash2,
  Globe,
  RefreshCw,
  Loader2,
  CheckCircle2,
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

export interface AlumniRecordLive {
  id: string | number;
  nisn: string;
  nama: string;
  gender: "L" | "P" | string;
  tahunLulus: number;
  jurusan: "MIPA" | "IPS" | "BAHASA" | "KEJURUAN" | string;
  statusTracer: "KULIAH_PTN" | "KULIAH_PTS" | "STUDI_LUAR_NEGERI" | "BEKERJA" | "WIRAUSAHA" | "MENCARI_KERJA" | string;
  instansiAtauKampus: string;
  posisiAtauJurusan: string;
  email: string;
  telepon: string;
  kotaDomisili: string;
  kesanPesan?: string;
  bersediaMentoring: boolean;
}

const TRACER_CONFIG: Record<
  string,
  { label: string; badgeClass: string }
> = {
  KULIAH_PTN: {
    label: "Kuliah PTN",
    badgeClass: "bg-blue-100 text-blue-900 border-blue-200",
  },
  KULIAH_PTS: {
    label: "Kuliah PTS",
    badgeClass: "bg-teal-100 text-teal-900 border-teal-200",
  },
  STUDI_LUAR_NEGERI: {
    label: "Studi Luar Negeri",
    badgeClass: "bg-purple-100 text-purple-900 border-purple-200",
  },
  BEKERJA: {
    label: "Bekerja di Industri",
    badgeClass: "bg-emerald-100 text-emerald-900 border-emerald-200",
  },
  WIRAUSAHA: {
    label: "Wirausaha / Bisnis",
    badgeClass: "bg-amber-100 text-amber-900 border-amber-200",
  },
  MENCARI_KERJA: {
    label: "Mencari Kerja / Gap Year",
    badgeClass: "bg-slate-100 text-slate-800 border-slate-200",
  },
};

export default function AdminAlumniPage() {
  const [daftarAlumni, setDaftarAlumni] = useState<AlumniRecordLive[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [activeTab, setActiveTab] = useState<"direktori" | "statistik" | "mentoring">("direktori");
  const [searchQuery, setSearchQuery] = useState("");
  const [tahunFilter, setTahunFilter] = useState<string>("SEMUA");
  const [statusFilter, setStatusFilter] = useState<string>("SEMUA");
  const [jurusanFilter, setJurusanFilter] = useState<string>("SEMUA");

  // Modals
  const [isTambahOpen, setTambahOpen] = useState(false);
  const [isEditOpen, setEditOpen] = useState(false);
  const [selectedAlumni, setSelectedAlumni] = useState<AlumniRecordLive | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Form Tambah Alumni
  const [formAlumni, setFormAlumni] = useState({
    nisn: "",
    nama: "",
    gender: "L",
    tahunLulus: new Date().getFullYear(),
    jurusan: "MIPA",
    statusTracer: "KULIAH_PTN",
    instansiAtauKampus: "",
    posisiAtauJurusan: "",
    email: "",
    telepon: "",
    kotaDomisili: "",
    kesanPesan: "",
    bersediaMentoring: true,
  });

  const fetchData = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const res = await api.getAlumniList();
      const raw = (res as any)?.data || (res as any) || [];
      const normalized: AlumniRecordLive[] = Array.isArray(raw)
        ? raw.map((item: any) => ({
            id: item.id,
            nisn: item.nisn || "-",
            nama: item.nama || "Alumni",
            gender: item.gender || "L",
            tahunLulus: Number(item.tahun_lulus ?? item.tahunLulus ?? new Date().getFullYear()),
            jurusan: item.jurusan || "MIPA",
            statusTracer: item.status_tracer || item.statusTracer || "KULIAH_PTN",
            instansiAtauKampus: item.instansi_atau_kampus || item.instansiAtauKampus || "-",
            posisiAtauJurusan: item.posisi_atau_jurusan || item.posisiAtauJurusan || "-",
            email: item.email || "",
            telepon: item.telepon || "",
            kotaDomisili: item.kota_domisili || item.kotaDomisili || "-",
            kesanPesan: item.kesan_pesan || item.kesanPesan || "",
            bersediaMentoring: Boolean(item.bersedia_mentoring ?? item.bersediaMentoring ?? true),
          }))
        : [];
      setDaftarAlumni(normalized);
      if (isManual) showToast("Data alumni berhasil diperbarui.");
    } catch (err: any) {
      console.error("Gagal memuat data alumni:", err);
      showToast("Gagal memuat data alumni dari server.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // KPIs
  const totalAlumni = daftarAlumni.length;

  const totalKuliah = useMemo(
    () =>
      daftarAlumni.filter(
        (a) =>
          a.statusTracer === "KULIAH_PTN" ||
          a.statusTracer === "KULIAH_PTS" ||
          a.statusTracer === "STUDI_LUAR_NEGERI"
      ).length,
    [daftarAlumni]
  );

  const totalBekerja = useMemo(
    () => daftarAlumni.filter((a) => a.statusTracer === "BEKERJA").length,
    [daftarAlumni]
  );

  const totalWirausaha = useMemo(
    () => daftarAlumni.filter((a) => a.statusTracer === "WIRAUSAHA").length,
    [daftarAlumni]
  );

  const totalMentor = useMemo(
    () => daftarAlumni.filter((a) => a.bersediaMentoring).length,
    [daftarAlumni]
  );

  // Filtered Alumni
  const alumniFiltered = useMemo(() => {
    return daftarAlumni.filter((a) => {
      const matchSearch =
        searchQuery === "" ||
        a.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.nisn.includes(searchQuery) ||
        a.instansiAtauKampus.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.posisiAtauJurusan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.kotaDomisili.toLowerCase().includes(searchQuery.toLowerCase());

      const matchTahun =
        tahunFilter === "SEMUA" || String(a.tahunLulus) === tahunFilter;

      const matchStatus =
        statusFilter === "SEMUA" || a.statusTracer === statusFilter;

      const matchJurusan =
        jurusanFilter === "SEMUA" || a.jurusan === jurusanFilter;

      return matchSearch && matchTahun && matchStatus && matchJurusan;
    });
  }, [daftarAlumni, searchQuery, tahunFilter, statusFilter, jurusanFilter]);

  // Submit Tambah Alumni
  const handleSimpanAlumni = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAlumni.nama.trim() || !formAlumni.instansiAtauKampus.trim()) return;

    setIsSubmitting(true);
    const payload = {
      nama: formAlumni.nama,
      nisn: formAlumni.nisn.trim() || `00${Math.floor(10000000 + Math.random() * 90000000)}`,
      gender: formAlumni.gender,
      tahun_lulus: Number(formAlumni.tahunLulus) || new Date().getFullYear(),
      jurusan: formAlumni.jurusan,
      status_tracer: formAlumni.statusTracer,
      instansi_atau_kampus: formAlumni.instansiAtauKampus,
      posisi_atau_jurusan: formAlumni.posisiAtauJurusan,
      email: formAlumni.email,
      telepon: formAlumni.telepon,
      kota_domisili: formAlumni.kotaDomisili,
      kesan_pesan: formAlumni.kesanPesan,
      bersedia_mentoring: formAlumni.bersediaMentoring,
    };

    try {
      await api.createAlumni(payload);
      showToast(`Data alumni "${formAlumni.nama}" berhasil disimpan.`);
      setFormAlumni({
        nisn: "",
        nama: "",
        gender: "L",
        tahunLulus: new Date().getFullYear(),
        jurusan: "MIPA",
        statusTracer: "KULIAH_PTN",
        instansiAtauKampus: "",
        posisiAtauJurusan: "",
        email: "",
        telepon: "",
        kotaDomisili: "",
        kesanPesan: "",
        bersediaMentoring: true,
      });
      setTambahOpen(false);
      fetchData();
    } catch (err: any) {
      console.error("Gagal simpan alumni:", err);
      showToast("Gagal menyimpan data alumni.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Edit Alumni
  const handleUpdateAlumni = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlumni) return;

    setIsSubmitting(true);
    const payload = {
      nama: selectedAlumni.nama,
      nisn: selectedAlumni.nisn,
      gender: selectedAlumni.gender,
      tahun_lulus: Number(selectedAlumni.tahunLulus),
      jurusan: selectedAlumni.jurusan,
      status_tracer: selectedAlumni.statusTracer,
      instansi_atau_kampus: selectedAlumni.instansiAtauKampus,
      posisi_atau_jurusan: selectedAlumni.posisiAtauJurusan,
      email: selectedAlumni.email,
      telepon: selectedAlumni.telepon,
      kota_domisili: selectedAlumni.kotaDomisili,
      kesan_pesan: selectedAlumni.kesanPesan,
      bersedia_mentoring: selectedAlumni.bersediaMentoring,
    };

    try {
      await api.updateAlumni(selectedAlumni.id, payload);
      showToast(`Data alumni "${selectedAlumni.nama}" berhasil diperbarui.`);
      setEditOpen(false);
      setSelectedAlumni(null);
      fetchData();
    } catch (err: any) {
      console.error("Gagal update alumni:", err);
      showToast("Gagal memperbarui data alumni.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hapus Alumni
  const handleHapusAlumni = async (id: string | number, nama: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus alumni "${nama}"?`)) {
      try {
        await api.deleteAlumni(id);
        showToast(`Alumni "${nama}" berhasil dihapus.`);
        fetchData();
      } catch (err: any) {
        console.error("Gagal hapus alumni:", err);
        showToast("Gagal menghapus alumni.");
      }
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      "NISN",
      "Nama Alumni",
      "Gender",
      "Tahun Lulus",
      "Jurusan SMA",
      "Status Tracer",
      "Kampus / Instansi Perusahaan",
      "Program Studi / Posisi Jabatan",
      "Email",
      "Nomor Telepon",
      "Kota Domisili",
      "Bersedia Mentoring",
      "Kesan & Pesan",
    ];

    const rows = daftarAlumni.map((a) => [
      `"${a.nisn}"`,
      `"${a.nama}"`,
      `"${a.gender}"`,
      a.tahunLulus,
      `"${a.jurusan}"`,
      `"${TRACER_CONFIG[a.statusTracer]?.label || a.statusTracer}"`,
      `"${a.instansiAtauKampus}"`,
      `"${a.posisiAtauJurusan}"`,
      `"${a.email}"`,
      `"${a.telepon}"`,
      `"${a.kotaDomisili}"`,
      a.bersediaMentoring ? "YA" : "TIDAK",
      `"${a.kesanPesan || ""}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Tracer_Study_Alumni_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Data tracer study alumni berhasil diekspor ke CSV.");
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
              Tracer Study &amp; Karir
            </Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-emerald-600" />
            Database Alumni &amp; Tracer Study
          </h1>
          <p className="text-sm text-muted-foreground">
            Penelusuran tamatan pendidikan tinggi/dunia kerja, rekam jejak lulusan, dan jaringan mentoring siswa live dari database Supabase.
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
            disabled={daftarAlumni.length === 0}
            className="gap-1.5 text-xs shadow-xs cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>

          <Button
            size="sm"
            onClick={() => setTambahOpen(true)}
            className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Tambah Data Alumni
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
                  <p className="text-xs text-muted-foreground font-medium">Total Alumni Terdata</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-bold tracking-tight text-foreground">{totalAlumni}</span>
                    <span className="text-xs text-muted-foreground">orang</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-sky-50 text-sky-700">
                  <Users className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border/60 shadow-xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Studi Lanjut (Kuliah)</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-bold tracking-tight text-emerald-700">{totalKuliah}</span>
                    <span className="text-xs text-muted-foreground">
                      ({Math.round((totalKuliah / (totalAlumni || 1)) * 100)}%)
                    </span>
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700">
                  <GraduationCap className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border/60 shadow-xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Bekerja &amp; Wirausaha</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-bold tracking-tight text-amber-700">{totalBekerja + totalWirausaha}</span>
                    <span className="text-xs text-muted-foreground">
                      ({Math.round(((totalBekerja + totalWirausaha) / (totalAlumni || 1)) * 100)}%)
                    </span>
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-amber-50 text-amber-700">
                  <Briefcase className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border/60 shadow-xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Siap Mentoring Adik Kelas</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-bold tracking-tight text-purple-700">{totalMentor}</span>
                    <span className="text-xs text-muted-foreground">mentor</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-purple-50 text-purple-700">
                  <Sparkles className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab("direktori")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer",
            activeTab === "direktori"
              ? "border-emerald-600 text-emerald-700 font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <GraduationCap className="h-4 w-4" />
          Direktori Alumni ({daftarAlumni.length})
        </button>

        <button
          onClick={() => setActiveTab("statistik")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer",
            activeTab === "statistik"
              ? "border-emerald-600 text-emerald-700 font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Compass className="h-4 w-4" />
          Statistik Sebaran Tracer
        </button>

        <button
          onClick={() => setActiveTab("mentoring")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer",
            activeTab === "mentoring"
              ? "border-emerald-600 text-emerald-700 font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Sparkles className="h-4 w-4" />
          Jaringan Mentoring Siswa ({totalMentor})
        </button>
      </div>

      {/* TAB 1: DIREKTORI ALUMNI */}
      {activeTab === "direktori" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-card p-3 rounded-lg border border-border">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama, kampus, perusahaan, domisili..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-sm h-9"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                aria-label="Filter Status Tracer"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs focus:ring-1 focus:ring-ring"
              >
                <option value="SEMUA">Semua Status Tracer</option>
                <option value="KULIAH_PTN">Kuliah PTN</option>
                <option value="KULIAH_PTS">Kuliah PTS</option>
                <option value="STUDI_LUAR_NEGERI">Studi Luar Negeri</option>
                <option value="BEKERJA">Bekerja di Industri</option>
                <option value="WIRAUSAHA">Wirausaha / Bisnis</option>
                <option value="MENCARI_KERJA">Mencari Kerja / Gap Year</option>
              </select>

              <select
                aria-label="Filter Jurusan Alumni"
                value={jurusanFilter}
                onChange={(e) => setJurusanFilter(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs focus:ring-1 focus:ring-ring"
              >
                <option value="SEMUA">Semua Jurusan</option>
                <option value="MIPA">MIPA</option>
                <option value="IPS">IPS</option>
                <option value="BAHASA">Bahasa</option>
                <option value="KEJURUAN">Kejuruan</option>
              </select>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-xs font-semibold uppercase text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-4 py-3">Nama Alumni &amp; Lulusan</th>
                    <th className="px-4 py-3">Status Tracer</th>
                    <th className="px-4 py-3">Kampus / Instansi &amp; Posisi</th>
                    <th className="px-4 py-3">Domisili</th>
                    <th className="px-4 py-3">Kontak</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, idx) => (
                      <tr key={idx} className="animate-pulse">
                        <td className="px-4 py-3"><div className="h-4 w-36 bg-slate-200 rounded" /></td>
                        <td className="px-4 py-3"><div className="h-5 w-24 bg-slate-200 rounded" /></td>
                        <td className="px-4 py-3"><div className="h-4 w-40 bg-slate-200 rounded" /></td>
                        <td className="px-4 py-3"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
                        <td className="px-4 py-3"><div className="h-4 w-28 bg-slate-200 rounded" /></td>
                        <td className="px-4 py-3 text-right"><div className="h-7 w-16 bg-slate-200 rounded ml-auto" /></td>
                      </tr>
                    ))
                  ) : alumniFiltered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground text-sm">
                        Tidak ada data alumni yang cocok dengan pencarian.
                      </td>
                    </tr>
                  ) : (
                    alumniFiltered.map((a) => {
                      const TracerConf = TRACER_CONFIG[a.statusTracer] || {
                        label: a.statusTracer,
                        badgeClass: "bg-slate-100 text-slate-800 border-slate-200",
                      };

                      return (
                        <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-semibold text-foreground">{a.nama}</div>
                            <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                              <span className="font-mono">{a.nisn}</span>
                              <span>•</span>
                              <span>Lulus {a.tahunLulus} ({a.jurusan})</span>
                            </div>
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap">
                            <Badge variant="outline" className={cn("text-[11px] font-medium", TracerConf.badgeClass)}>
                              {TracerConf.label}
                            </Badge>
                          </td>

                          <td className="px-4 py-3">
                            <div className="font-medium text-foreground">{a.instansiAtauKampus}</div>
                            <div className="text-xs text-muted-foreground">{a.posisiAtauJurusan}</div>
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap text-xs text-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <span>{a.kotaDomisili}</span>
                            </div>
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
                            <div>{a.telepon || "-"}</div>
                            <div className="text-[11px] truncate max-w-[150px]">{a.email}</div>
                          </td>

                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedAlumni(a);
                                  setEditOpen(true);
                                }}
                                className="h-7 w-7 p-0 text-slate-500 hover:text-navy-950 cursor-pointer"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleHapusAlumni(a.id, a.nama)}
                                className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
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

      {/* TAB 2: STATISTIK SEBARAN TRACER */}
      {activeTab === "statistik" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border border-border/70 shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold text-foreground">Sebaran Tracer Study</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(TRACER_CONFIG).map(([key, cfg]) => {
                const count = daftarAlumni.filter((a) => a.statusTracer === key).length;
                const percent = Math.round((count / (totalAlumni || 1)) * 100);

                return (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-foreground">{cfg.label}</span>
                      <span className="font-mono text-muted-foreground">{count} orang ({percent}%)</span>
                    </div>
                    <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-600 h-full rounded-full transition-all" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="border border-border/70 shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold text-foreground">Sebaran Angkatan Kelulusan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[2024, 2023, 2022, 2021, 2020].map((th) => {
                const count = daftarAlumni.filter((a) => a.tahunLulus === th).length;
                const percent = Math.round((count / (totalAlumni || 1)) * 100);

                return (
                  <div key={th} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-foreground">Angkatan {th}</span>
                      <span className="font-mono text-muted-foreground">{count} orang ({percent}%)</span>
                    </div>
                    <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                      <div className="bg-sky-600 h-full rounded-full transition-all" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 3: JARINGAN MENTORING */}
      {activeTab === "mentoring" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {daftarAlumni.filter((a) => a.bersediaMentoring).length === 0 ? (
            <div className="col-span-3 py-12 text-center text-muted-foreground text-sm">
              Belum ada alumni yang terdaftar dalam program mentoring.
            </div>
          ) : (
            daftarAlumni.filter((a) => a.bersediaMentoring).map((a) => (
              <Card key={a.id} className="border border-border/70 shadow-xs">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-sm font-bold text-foreground">{a.nama}</CardTitle>
                      <p className="text-xs text-muted-foreground">Lulusan {a.tahunLulus} ({a.jurusan})</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] bg-purple-50 text-purple-800 border-purple-200">
                      Mentor
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div className="p-2 bg-muted/40 rounded-lg space-y-1">
                    <div className="font-medium text-foreground">{a.instansiAtauKampus}</div>
                    <div className="text-muted-foreground">{a.posisiAtauJurusan}</div>
                  </div>
                  {a.kesanPesan && (
                    <p className="text-muted-foreground italic line-clamp-2">"{a.kesanPesan}"</p>
                  )}
                  <div className="pt-2 border-t border-border flex justify-between items-center text-muted-foreground">
                    <span>{a.kotaDomisili}</span>
                    <span className="font-mono">{a.telepon}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* MODAL TAMBAH ALUMNI */}
      <Dialog open={isTambahOpen} onOpenChange={setTambahOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <GraduationCap className="h-5 w-5 text-emerald-600" />
              Pencatatan Data Alumni Baru
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSimpanAlumni} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground">Nama Lengkap Alumni *</label>
              <Input
                required
                placeholder="Contoh: Muhammad Farhan"
                value={formAlumni.nama}
                onChange={(e) => setFormAlumni({ ...formAlumni, nama: e.target.value })}
                className="mt-1 text-sm"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground">NISN</label>
                <Input
                  placeholder="0012345678"
                  value={formAlumni.nisn}
                  onChange={(e) => setFormAlumni({ ...formAlumni, nisn: e.target.value })}
                  className="mt-1 text-sm font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Tahun Lulus</label>
                <Input
                  type="number"
                  value={formAlumni.tahunLulus}
                  onChange={(e) => setFormAlumni({ ...formAlumni, tahunLulus: Number(e.target.value) || 2024 })}
                  className="mt-1 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Jurusan SMA</label>
                <select
                  value={formAlumni.jurusan}
                  onChange={(e) => setFormAlumni({ ...formAlumni, jurusan: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="MIPA">MIPA</option>
                  <option value="IPS">IPS</option>
                  <option value="BAHASA">Bahasa</option>
                  <option value="KEJURUAN">Kejuruan</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground">Status Tracer</label>
                <select
                  value={formAlumni.statusTracer}
                  onChange={(e) => setFormAlumni({ ...formAlumni, statusTracer: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="KULIAH_PTN">Kuliah PTN</option>
                  <option value="KULIAH_PTS">Kuliah PTS</option>
                  <option value="STUDI_LUAR_NEGERI">Studi Luar Negeri</option>
                  <option value="BEKERJA">Bekerja di Industri</option>
                  <option value="WIRAUSAHA">Wirausaha / Bisnis</option>
                  <option value="MENCARI_KERJA">Mencari Kerja / Gap Year</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Kota Domisili</label>
                <Input
                  placeholder="Jakarta / Bandung / Surabaya"
                  value={formAlumni.kotaDomisili}
                  onChange={(e) => setFormAlumni({ ...formAlumni, kotaDomisili: e.target.value })}
                  className="mt-1 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground">Nama Kampus / Perusahaan *</label>
                <Input
                  required
                  placeholder="Universitas Indonesia / PT Telkom..."
                  value={formAlumni.instansiAtauKampus}
                  onChange={(e) => setFormAlumni({ ...formAlumni, instansiAtauKampus: e.target.value })}
                  className="mt-1 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Program Studi / Jabatan Karir</label>
                <Input
                  placeholder="Teknik Informatika / Software Engineer..."
                  value={formAlumni.posisiAtauJurusan}
                  onChange={(e) => setFormAlumni({ ...formAlumni, posisiAtauJurusan: e.target.value })}
                  className="mt-1 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground">Email</label>
                <Input
                  type="email"
                  placeholder="alumni@gmail.com"
                  value={formAlumni.email}
                  onChange={(e) => setFormAlumni({ ...formAlumni, email: e.target.value })}
                  className="mt-1 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Nomor Telepon / WhatsApp</label>
                <Input
                  placeholder="0812xxxxxxxx"
                  value={formAlumni.telepon}
                  onChange={(e) => setFormAlumni({ ...formAlumni, telepon: e.target.value })}
                  className="mt-1 text-sm font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">Kesan &amp; Pesan untuk Almamater</label>
              <textarea
                rows={2}
                placeholder="Pesan motivasi atau saran pengembangan sekolah..."
                value={formAlumni.kesanPesan}
                onChange={(e) => setFormAlumni({ ...formAlumni, kesanPesan: e.target.value })}
                className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm"
              />
            </div>

            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setTambahOpen(false)} disabled={isSubmitting}>
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5">
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>{isSubmitting ? "Menyimpan..." : "Simpan Data Alumni"}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL EDIT ALUMNI */}
      <Dialog open={isEditOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Edit className="h-5 w-5 text-emerald-600" />
              Edit Data Alumni
            </DialogTitle>
          </DialogHeader>

          {selectedAlumni && (
            <form onSubmit={handleUpdateAlumni} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground">Nama Lengkap</label>
                <Input
                  required
                  value={selectedAlumni.nama}
                  onChange={(e) => setSelectedAlumni({ ...selectedAlumni, nama: e.target.value })}
                  className="mt-1 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground">Status Tracer</label>
                  <select
                    value={selectedAlumni.statusTracer}
                    onChange={(e) => setSelectedAlumni({ ...selectedAlumni, statusTracer: e.target.value })}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="KULIAH_PTN">Kuliah PTN</option>
                    <option value="KULIAH_PTS">Kuliah PTS</option>
                    <option value="STUDI_LUAR_NEGERI">Studi Luar Negeri</option>
                    <option value="BEKERJA">Bekerja di Industri</option>
                    <option value="WIRAUSAHA">Wirausaha / Bisnis</option>
                    <option value="MENCARI_KERJA">Mencari Kerja / Gap Year</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground">Kota Domisili</label>
                  <Input
                    value={selectedAlumni.kotaDomisili}
                    onChange={(e) => setSelectedAlumni({ ...selectedAlumni, kotaDomisili: e.target.value })}
                    className="mt-1 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground">Kampus / Perusahaan</label>
                  <Input
                    required
                    value={selectedAlumni.instansiAtauKampus}
                    onChange={(e) => setSelectedAlumni({ ...selectedAlumni, instansiAtauKampus: e.target.value })}
                    className="mt-1 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground">Jurusan / Posisi</label>
                  <Input
                    value={selectedAlumni.posisiAtauJurusan}
                    onChange={(e) => setSelectedAlumni({ ...selectedAlumni, posisiAtauJurusan: e.target.value })}
                    className="mt-1 text-sm"
                  />
                </div>
              </div>

              <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={() => setEditOpen(false)} disabled={isSubmitting}>
                  Batal
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5">
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>{isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}</span>
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
