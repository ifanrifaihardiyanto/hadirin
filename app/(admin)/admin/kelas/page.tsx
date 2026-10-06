"use client";

import { useState, useMemo, useEffect } from "react";
import {
  School,
  Plus,
  Search,
  Users,
  UserCheck,
  GraduationCap,
  ArrowRightLeft,
  Download,
  Edit3,
  Trash2,
  Filter,
  CheckCircle2,
  X,
  Building,
  BookOpen,
  Calendar,
  Layers,
  Sparkles,
  Printer,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useStore, type Kelas, type SiswaInduk } from "@/lib/store";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";

export default function ManajemenKelasPage() {
  const { tahunAjaranAktif, semesterAktif } = useStore();

  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [guruList, setGuruList] = useState<{ id: number; nama: string; mapel?: string[] }[]>([]);
  const [siswaList, setSiswaList] = useState<SiswaInduk[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [tingkatFilter, setTingkatFilter] = useState<string>("SEMUA");
  const [jurusanFilter, setJurusanFilter] = useState<string>("SEMUA");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingKelas, setEditingKelas] = useState<Kelas | null>(null);

  // Student list modal
  const [isSiswaModalOpen, setIsSiswaModalOpen] = useState(false);
  const [selectedKelasForSiswa, setSelectedKelasForSiswa] = useState<Kelas | null>(null);

  // Batch Promotion / Migration modal
  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);
  const [kelasAsal, setKelasAsal] = useState<string>("");
  const [kelasTujuan, setKelasTujuan] = useState<string>("");

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Form State for Add / Edit
  const [formNama, setFormNama] = useState("");
  const [formTingkat, setFormTingkat] = useState<"Kelas X" | "Kelas XI" | "Kelas XII">("Kelas X");
  const [formJurusan, setFormJurusan] = useState<"MIPA" | "IPS" | "Umum / Fase E" | "Bahasa">("MIPA");
  const [formWaliKelasId, setFormWaliKelasId] = useState<string>("");
  const [formRuangan, setFormRuangan] = useState("");
  const [formKapasitas, setFormKapasitas] = useState(36);
  const [formKurikulum, setFormKurikulum] = useState<"Kurikulum Merdeka" | "Kurikulum 2013">("Kurikulum Merdeka");
  const [formStatus, setFormStatus] = useState<"AKTIF" | "ARSIP">("AKTIF");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resKelas, resGuru, resSiswa] = await Promise.all([
        api.getKelasList().catch(() => ({ data: [] })),
        api.getGuruList().catch(() => ({ data: [] })),
        api.getSiswaList().catch(() => ({ data: [] })),
      ]);

      const gurus = (resGuru?.data || []).map((g: any) => ({
        id: g.id,
        nama: g.nama,
        mapel: g.mata_pelajarans?.map((m: any) => m.nama) || [],
      }));
      setGuruList(gurus);

      const siswas: SiswaInduk[] = (resSiswa?.data || []).map((s: any) => ({
        id: String(s.id),
        nis: s.nis || "-",
        nisn: s.nisn || "-",
        nama: s.nama,
        gender: (s.jenis_kelamin === "P" ? "P" : "L") as "L" | "P",
        kelas: s.kelas?.nama || "-",
        waliKelas: s.kelas?.wali_kelas?.nama || "-",
        namaWali: s.nama_wali || s.nama_ayah || "-",
        teleponWali: s.telepon_ortu || "-",
        status: "AKTIF",
      }));
      setSiswaList(siswas);

      if (resKelas?.data) {
        const mapped: Kelas[] = resKelas.data.map((k: any) => ({
          id: String(k.id),
          nama: k.nama,
          tingkat: (k.tingkat || "Kelas X") as any,
          jurusan: (k.jurusan || "MIPA") as any,
          waliKelas: k.wali_kelas?.nama || "Belum Ditugaskan",
          ruangan: k.ruangan || "R.101 (Gedung A)",
          kapasitas: 36,
          kurikulum: "Kurikulum Merdeka",
          tahunAjaran: k.tahun_ajaran || "2026/2027",
          semester: "Ganjil",
          status: "AKTIF",
        }));
        setKelasList(mapped);
      }
    } catch (err: any) {
      console.warn("Gagal memuat rombel kelas:", err?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingKelas(null);
    setFormNama("");
    setFormTingkat("Kelas X");
    setFormJurusan("MIPA");
    setFormWaliKelasId(guruList[0]?.id ? String(guruList[0].id) : "");
    setFormRuangan("R.101 (Gedung A)");
    setFormKapasitas(36);
    setFormKurikulum("Kurikulum Merdeka");
    setFormStatus("AKTIF");
    setIsAddModalOpen(true);
  };

  const openEditModal = (kelas: Kelas) => {
    setEditingKelas(kelas);
    setFormNama(kelas.nama);
    setFormTingkat(kelas.tingkat || "Kelas X");
    setFormJurusan(kelas.jurusan || "MIPA");
    const foundGuru = guruList.find((g) => g.nama === kelas.waliKelas);
    setFormWaliKelasId(foundGuru ? String(foundGuru.id) : "");
    setFormRuangan(kelas.ruangan || "");
    setFormKapasitas(kelas.kapasitas || 36);
    setFormKurikulum(kelas.kurikulum || "Kurikulum Merdeka");
    setFormStatus(kelas.status || "AKTIF");
    setIsAddModalOpen(true);
  };

  const handleSaveKelas = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama.trim()) return;

    const payload = {
      nama: formNama.trim(),
      tingkat: formTingkat,
      jurusan: formJurusan,
      wali_kelas_id: formWaliKelasId ? Number(formWaliKelasId) : null,
      tahun_ajaran: tahunAjaranAktif,
    };

    try {
      if (editingKelas) {
        await api.updateKelas(editingKelas.id, payload);
        const waliGuru = guruList.find((g) => String(g.id) === String(formWaliKelasId));
        setKelasList((prev) =>
          prev.map((k) =>
            k.id === editingKelas.id
              ? {
                  ...k,
                  nama: formNama.trim(),
                  tingkat: formTingkat,
                  jurusan: formJurusan,
                  waliKelas: waliGuru?.nama || k.waliKelas,
                  ruangan: formRuangan,
                  kapasitas: Number(formKapasitas) || 36,
                }
              : k
          )
        );
        showToast(`Rombel ${formNama} berhasil diperbarui.`);
      } else {
        const res = await api.createKelas(payload);
        const waliGuru = guruList.find((g) => String(g.id) === String(formWaliKelasId));
        const newKelas: Kelas = {
          id: String(res?.data?.id || Date.now()),
          nama: formNama.trim(),
          tingkat: formTingkat,
          jurusan: formJurusan,
          waliKelas: waliGuru?.nama || "Belum Ditugaskan",
          ruangan: formRuangan,
          kapasitas: Number(formKapasitas) || 36,
          kurikulum: formKurikulum,
          tahunAjaran: tahunAjaranAktif,
          semester: semesterAktif,
          status: formStatus,
        };
        setKelasList((prev) => [newKelas, ...prev]);
        showToast(`Rombel baru ${formNama} berhasil dibuat.`);
      }
      setIsAddModalOpen(false);
    } catch (err: any) {
      alert("Gagal menyimpan rombel: " + (err?.message || "Terjadi kesalahan"));
    }
  };

  const handleDeleteKelas = async (id: string, nama: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus rombel ${nama}?`)) return;

    try {
      await api.deleteKelas(id);
      setKelasList((prev) => prev.filter((k) => k.id !== id));
      showToast(`Rombel ${nama} telah dihapus.`);
    } catch (err: any) {
      alert("Gagal menghapus rombel: " + (err?.message || "Terjadi kesalahan"));
    }
  };

  // Filtered classes
  const filteredKelas = useMemo(() => {
    return kelasList.filter((k) => {
      const matchSearch =
        k.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (k.waliKelas && k.waliKelas.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (k.ruangan && k.ruangan.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchTingkat = tingkatFilter === "SEMUA" || k.tingkat === tingkatFilter;
      const matchJurusan = jurusanFilter === "SEMUA" || k.jurusan === jurusanFilter;

      return matchSearch && matchTingkat && matchJurusan;
    });
  }, [kelasList, searchQuery, tingkatFilter, jurusanFilter]);

  // Summary Metrics
  const totalRombel = kelasList.length;
  const totalRombelAktif = kelasList.filter((k) => k.status !== "ARSIP").length;
  const totalSiswaTerdistribusi = siswaList.length;
  const rataKapasitas = totalRombel > 0 ? Math.round(totalSiswaTerdistribusi / totalRombel) : 0;
  const waliKelasCount = new Set(kelasList.map((k) => k.waliKelas).filter(Boolean)).size;

  // Students in selected class modal
  const siswaDiRombel = useMemo(() => {
    if (!selectedKelasForSiswa) return [];
    return siswaList.filter((s) => s.kelas === selectedKelasForSiswa.nama);
  }, [selectedKelasForSiswa, siswaList]);

  const pindahSiswaRombel = (siswaId: string, rombelTujuan: string) => {
    setSiswaList((prev) =>
      prev.map((s) => (s.id === siswaId ? { ...s, kelas: rombelTujuan } : s))
    );
  };

  // Execute batch migration / promotion
  const handleBatchPromote = () => {
    if (!kelasAsal || !kelasTujuan) {
      alert("Silakan pilih kelas asal dan kelas tujuan terlebih dahulu.");
      return;
    }
    if (kelasAsal === kelasTujuan) {
      alert("Kelas asal dan kelas tujuan tidak boleh sama.");
      return;
    }

    const siswaToMove = siswaList.filter((s) => s.kelas === kelasAsal);
    if (siswaToMove.length === 0) {
      alert(`Tidak ada siswa di rombel ${kelasAsal} untuk dimutasi.`);
      return;
    }

    siswaToMove.forEach((s) => {
      pindahSiswaRombel(s.id, kelasTujuan);
    });

    showToast(`Berhasil memutasi ${siswaToMove.length} siswa dari ${kelasAsal} ke ${kelasTujuan}.`);
    setIsPromoteModalOpen(false);
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ["ID", "Nama Rombel", "Tingkat", "Jurusan", "Wali Kelas", "Ruangan", "Kapasitas", "Jumlah Siswa", "Kurikulum", "Status"];
    const rows = kelasList.map((k) => {
      const jumlahSiswa = siswaList.filter((s) => s.kelas === k.nama).length;
      return [
        k.id,
        `"${k.nama}"`,
        `"${k.tingkat || ""}"`,
        `"${k.jurusan || ""}"`,
        `"${k.waliKelas || ""}"`,
        `"${k.ruangan || ""}"`,
        k.kapasitas || 36,
        jumlahSiswa,
        `"${k.kurikulum || ""}"`,
        k.status || "AKTIF",
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Daftar_Rombel_Hadirin_${tahunAjaranAktif.replace("/", "-")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("File CSV berhasil diunduh.");
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
            <span>Akademik &amp; Data Induk</span>
            <ChevronRight size={13} />
            <span className="text-navy-900">Rombongan Belajar</span>
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-navy-950 sm:text-3xl flex items-center gap-2.5">
            <School className="text-navy-900 h-7 w-7" />
            Manajemen Rombel &amp; Kelas
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm mt-0.5">
            Kelola rombongan belajar (rombel), penetapan wali kelas, ruangan, dan distribusi siswa per kelas ({tahunAjaranAktif} - {semesterAktif}).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={loading}
            className="gap-1.5 text-xs font-semibold border-slate-200 bg-white hover:bg-slate-50 text-navy-950 shadow-2xs cursor-pointer h-9"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPromoteModalOpen(true)}
            className="gap-1.5 text-xs font-semibold border-slate-200 bg-white hover:bg-slate-50 text-navy-950 shadow-2xs cursor-pointer h-9"
          >
            <ArrowRightLeft size={14} className="text-navy-700" />
            <span>Kenaikan &amp; Mutasi</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="gap-1.5 text-xs font-semibold border-slate-200 bg-white hover:bg-slate-50 text-navy-950 shadow-2xs cursor-pointer h-9"
          >
            <Download size={14} className="text-slate-600" />
            <span>Ekspor CSV</span>
          </Button>

          <Button
            size="sm"
            onClick={openAddModal}
            className="gap-1.5 text-xs font-bold bg-navy-900 text-white hover:bg-navy-800 shadow-sm cursor-pointer h-9"
          >
            <Plus size={15} />
            <span>Tambah Rombel</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border border-border shadow-xs bg-white">
              <CardContent className="p-4 flex items-center gap-3.5">
                <Skeleton className="h-11 w-11 rounded-2xl shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-3.5 w-16" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card className="border border-border shadow-xs bg-white">
              <CardContent className="p-4 flex items-center gap-3.5">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-navy-50 text-navy-900 shrink-0">
                  <School size={22} />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Total Rombel</p>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="font-display text-xl font-bold text-navy-950 sm:text-2xl">
                      {totalRombel}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase font-mono">
                      {totalRombelAktif} Aktif
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border shadow-xs bg-white">
              <CardContent className="p-4 flex items-center gap-3.5">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-sky-50 text-sky-900 shrink-0">
                  <GraduationCap size={22} />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Siswa Terdaftar</p>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="font-display text-xl font-bold text-navy-950 sm:text-2xl">
                      {totalSiswaTerdistribusi}
                    </span>
                    <span className="text-[10px] text-slate-500">Siswa Induk</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border shadow-xs bg-white">
              <CardContent className="p-4 flex items-center gap-3.5">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-50 text-emerald-900 shrink-0">
                  <UserCheck size={22} />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Wali Kelas</p>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="font-display text-xl font-bold text-navy-950 sm:text-2xl">
                      {waliKelasCount}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold">Guru Ditugaskan</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border shadow-xs bg-white">
              <CardContent className="p-4 flex items-center gap-3.5">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-purple-50 text-purple-900 shrink-0">
                  <Building size={22} />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Rata-rata Kelas</p>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="font-display text-xl font-bold text-navy-950 sm:text-2xl">
                      {rataKapasitas}
                    </span>
                    <span className="text-[10px] text-purple-700 font-medium">Siswa / Rombel</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Filter & Search Bar */}
      <Card className="border border-border shadow-xs bg-white">
        <CardContent className="p-4 space-y-3.5">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Cari nama rombel, wali kelas, atau ruangan..."
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

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1.5 self-end sm:self-auto bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer",
                  viewMode === "grid" ? "bg-white text-navy-950 shadow-xs" : "text-slate-600 hover:text-navy-950"
                )}
              >
                Grid Kartu
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={cn(
                  "px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer",
                  viewMode === "table" ? "bg-white text-navy-950 shadow-xs" : "text-slate-600 hover:text-navy-950"
                )}
              >
                Tabel Rinci
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mr-1">
              <Filter size={12} /> Tingkat:
            </span>
            {(["SEMUA", "Kelas X", "Kelas XI", "Kelas XII"] as const).map((tingkat) => (
              <button
                key={tingkat}
                type="button"
                onClick={() => setTingkatFilter(tingkat)}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer",
                  tingkatFilter === tingkat
                    ? "bg-navy-900 text-white shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                )}
              >
                {tingkat}
              </button>
            ))}

            <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mr-1">
              Jurusan:
            </span>
            {(["SEMUA", "MIPA", "IPS", "Umum / Fase E", "Bahasa"] as const).map((jurusan) => (
              <button
                key={jurusan}
                type="button"
                onClick={() => setJurusanFilter(jurusan)}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer",
                  jurusanFilter === jurusan
                    ? "bg-navy-900 text-white shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                )}
              >
                {jurusan}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="border border-border/80 bg-white shadow-xs p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                  <Skeleton className="h-7 w-14 rounded-lg" />
                </div>
                <div className="space-y-2 py-2 border-y border-slate-100">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-7 w-7 rounded-full" />
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                  </div>
                  <Skeleton className="h-3.5 w-full" />
                </div>
                <div className="space-y-1.5">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-2 w-full rounded" />
                </div>
              </Card>
            ))
          ) : filteredKelas.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
              Tidak ada rombel kelas yang cocok dengan filter pencarian.
            </div>
          ) : (
            filteredKelas.map((kelas) => {
              const siswaCount = siswaList.filter((s) => s.kelas === kelas.nama).length;
              const kapasitas = kelas.kapasitas || 36;
              const persenTerisi = Math.min(100, Math.round((siswaCount / kapasitas) * 100));

            return (
              <Card
                key={kelas.id}
                className="border border-border/80 bg-white shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <CardContent className="p-5 space-y-4">
                  {/* Top: Tingkat Badge & Actions */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-[10px] font-bold uppercase font-mono px-2 py-0.5",
                            kelas.tingkat === "Kelas X"
                              ? "bg-sky-100 text-sky-900"
                              : kelas.tingkat === "Kelas XI"
                              ? "bg-amber-100 text-amber-900"
                              : "bg-purple-100 text-purple-900"
                          )}
                        >
                          {kelas.tingkat || "Kelas X"}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] font-semibold text-slate-600 bg-slate-50">
                          {kelas.jurusan || "Umum"}
                        </Badge>
                      </div>
                      <h3 className="font-display text-lg font-bold text-navy-950 group-hover:text-navy-800 transition-colors">
                        {kelas.nama}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(kelas)}
                        className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-navy-950 transition-colors cursor-pointer"
                        title="Edit Rombel"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteKelas(kelas.id, kelas.nama)}
                        className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Hapus Rombel"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Wali Kelas & Ruangan Info */}
                  <div className="space-y-2 py-2 border-y border-slate-100 text-xs">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-7 w-7 border border-navy-100">
                        <AvatarFallback className="text-[10px] font-bold bg-navy-50 text-navy-900">
                          {kelas.waliKelas?.slice(0, 2).toUpperCase() || "WK"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-medium text-slate-400 leading-none">Wali Kelas</p>
                        <p className="font-semibold text-navy-950 truncate leading-tight mt-0.5">
                          {kelas.waliKelas || "Belum Ditugaskan"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-slate-600 pt-1">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Building size={13} />
                        <span>Ruang:</span>
                      </span>
                      <span className="font-medium text-navy-950">{kelas.ruangan || "R. Belum Ditentukan"}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <BookOpen size={13} />
                        <span>Kurikulum:</span>
                      </span>
                      <span className="font-medium text-navy-950">{kelas.kurikulum || "Kurikulum Merdeka"}</span>
                    </div>
                  </div>

                  {/* Kapasitas Progress */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Users size={12} /> Kapasitas Siswa
                      </span>
                      <span className="font-bold font-mono text-navy-950">
                        {siswaCount} <span className="text-slate-400 font-normal">/ {kapasitas}</span>
                      </span>
                    </div>
                    <Progress value={persenTerisi} className="h-2 bg-slate-100" />
                  </div>
                </CardContent>

                {/* Bottom Card Footer */}
                <div className="bg-slate-50/70 border-t border-slate-100 px-5 py-3 flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-slate-500">
                    {persenTerisi}% Terisi
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedKelasForSiswa(kelas);
                      setIsSiswaModalOpen(true);
                    }}
                    className="h-7 text-xs font-semibold text-navy-900 hover:text-navy-950 hover:bg-navy-50 gap-1 px-2.5 cursor-pointer"
                  >
                    <span>Daftar Siswa ({siswaCount})</span>
                    <ChevronRight size={13} />
                  </Button>
                </div>
              </Card>
            );
          }))}
        </div>
      )}

      {/* Table View */}
      {viewMode === "table" && (
        <Card className="border border-border shadow-xs bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/90 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-border">
                <tr>
                  <th className="py-3 px-4">Nama Rombel</th>
                  <th className="py-3 px-4">Tingkat &amp; Jurusan</th>
                  <th className="py-3 px-4">Wali Kelas</th>
                  <th className="py-3 px-4">Ruangan</th>
                  <th className="py-3 px-4 text-center">Kapasitas</th>
                  <th className="py-3 px-4">Kurikulum</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-3 px-4"><Skeleton className="h-5 w-24" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-4 w-32" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-4 w-28" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="py-3 px-4 text-center"><Skeleton className="h-4 w-16 mx-auto" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-4 w-28" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-5 w-14 rounded" /></td>
                      <td className="py-3 px-4 text-right"><Skeleton className="h-7 w-20 ml-auto rounded" /></td>
                    </tr>
                  ))
                ) : filteredKelas.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-400">
                      Tidak ada rombel kelas yang cocok dengan filter pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredKelas.map((kelas) => {
                    const siswaCount = siswaList.filter((s) => s.kelas === kelas.nama).length;
                    const kapasitas = kelas.kapasitas || 36;
                    const persen = Math.min(100, Math.round((siswaCount / kapasitas) * 100));

                    return (
                      <tr key={kelas.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-navy-950 font-display text-sm">
                        {kelas.nama}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-navy-900">{kelas.tingkat || "Kelas X"}</span>
                          <span className="text-slate-400">&bull;</span>
                          <span className="text-slate-600">{kelas.jurusan || "Umum"}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-navy-900">
                        {kelas.waliKelas || "-"}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {kelas.ruangan || "-"}
                      </td>
                      <td className="py-3 px-4 text-center font-mono">
                        <span className="font-bold text-navy-950">{siswaCount}</span>
                        <span className="text-slate-400">/{kapasitas}</span>
                        <span className="text-[10px] text-slate-500 ml-1.5">({persen}%)</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {kelas.kurikulum || "Kurikulum Merdeka"}
                      </td>
                      <td className="py-3 px-4">
                        <span className="rounded-sm px-1.5 py-0.5 text-[9px] font-bold uppercase font-mono bg-emerald-100 text-emerald-800">
                          {kelas.status || "AKTIF"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedKelasForSiswa(kelas);
                              setIsSiswaModalOpen(true);
                            }}
                            className="h-7 text-[11px] px-2 border-slate-200 text-navy-900 hover:bg-slate-100"
                          >
                            Siswa ({siswaCount})
                          </Button>
                          <button
                            type="button"
                            onClick={() => openEditModal(kelas)}
                            className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-navy-950"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteKelas(kelas.id, kelas.nama)}
                            className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* MODAL 1: Tambah / Edit Rombel */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-navy-900 text-white">
                  <School size={18} />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-navy-950">
                    {editingKelas ? "Edit Rombongan Belajar" : "Tambah Rombongan Belajar Baru"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Isi spesifikasi kelas, wali kelas, ruangan, dan kurikulum.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveKelas} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5 col-span-2">
                  <label className="font-bold text-slate-700">Nama Rombel / Kelas *</label>
                  <Input
                    required
                    placeholder="Contoh: X MIPA 1, XI IPS 2, dsb."
                    value={formNama}
                    onChange={(e) => setFormNama(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Tingkat Jenjang *</label>
                  <select
                    value={formTingkat}
                    onChange={(e) => setFormTingkat(e.target.value as any)}
                    className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none focus:ring-2 focus:ring-navy-900"
                  >
                    <option value="Kelas X">Kelas X</option>
                    <option value="Kelas XI">Kelas XI</option>
                    <option value="Kelas XII">Kelas XII</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Peminatan / Jurusan *</label>
                  <select
                    value={formJurusan}
                    onChange={(e) => setFormJurusan(e.target.value as any)}
                    className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none focus:ring-2 focus:ring-navy-900"
                  >
                    <option value="MIPA">MIPA (Matematika &amp; IPA)</option>
                    <option value="IPS">IPS (Ilmu Pengetahuan Sosial)</option>
                    <option value="Umum / Fase E">Umum / Fase E</option>
                    <option value="Bahasa">Bahasa &amp; Budaya</option>
                  </select>
                </div>

                <div className="space-y-1.5 col-span-2">
                  <label className="font-bold text-slate-700">Wali Kelas Ditugaskan *</label>
                  <select
                    value={formWaliKelasId}
                    onChange={(e) => setFormWaliKelasId(e.target.value)}
                    className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none focus:ring-2 focus:ring-navy-900"
                  >
                    <option value="">-- Pilih Guru Wali Kelas --</option>
                    {guruList.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.nama} {g.mapel && g.mapel.length > 0 ? `(${g.mapel.join(", ")})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Ruangan Kelas</label>
                  <Input
                    placeholder="Contoh: R.101 (Gedung A)"
                    value={formRuangan}
                    onChange={(e) => setFormRuangan(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Kapasitas Maksimal (Siswa)</label>
                  <Input
                    type="number"
                    min="1"
                    max="60"
                    value={formKapasitas}
                    onChange={(e) => setFormKapasitas(Number(e.target.value))}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Kurikulum Acuan</label>
                  <select
                    value={formKurikulum}
                    onChange={(e) => setFormKurikulum(e.target.value as any)}
                    className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none focus:ring-2 focus:ring-navy-900"
                  >
                    <option value="Kurikulum Merdeka">Kurikulum Merdeka</option>
                    <option value="Kurikulum 2013">Kurikulum 2013 (K13)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Status Rombel</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none focus:ring-2 focus:ring-navy-900"
                  >
                    <option value="AKTIF">Aktif</option>
                    <option value="ARSIP">Arsip / Nonaktif</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-xs cursor-pointer"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold cursor-pointer"
                >
                  {editingKelas ? "Simpan Perubahan" : "Buat Rombel"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Daftar Siswa Rombel */}
      {isSiswaModalOpen && selectedKelasForSiswa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-navy-100 text-navy-900 text-[10px] font-mono font-bold">
                    {selectedKelasForSiswa.tingkat || "Kelas X"}
                  </Badge>
                  <h3 className="font-display text-lg font-bold text-navy-950">
                    Daftar Siswa {selectedKelasForSiswa.nama}
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Wali Kelas: <span className="font-semibold text-navy-900">{selectedKelasForSiswa.waliKelas || "-"}</span> &bull; Ruang: {selectedKelasForSiswa.ruangan || "-"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsSiswaModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* Table of students */}
            <div className="flex-1 overflow-y-auto min-h-0 border border-slate-200 rounded-xl">
              {siswaDiRombel.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  Belum ada siswa yang ditempatkan di rombel {selectedKelasForSiswa.nama}.
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold sticky top-0 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">No</th>
                      <th className="py-2.5 px-3">NISN / NIS</th>
                      <th className="py-2.5 px-3">Nama Siswa</th>
                      <th className="py-2.5 px-3">L/P</th>
                      <th className="py-2.5 px-3">Kontak Orang Tua</th>
                      <th className="py-2.5 px-3 text-right">Pindah Rombel</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {siswaDiRombel.map((siswa, idx) => (
                      <tr key={siswa.id} className="hover:bg-slate-50/60">
                        <td className="py-2 px-3 text-slate-400 font-mono">{idx + 1}</td>
                        <td className="py-2 px-3 font-mono font-medium text-slate-700">
                          {siswa.nisn} <span className="text-slate-400">({siswa.nis})</span>
                        </td>
                        <td className="py-2 px-3 font-semibold text-navy-950">
                          {siswa.nama}
                        </td>
                        <td className="py-2 px-3">
                          <span className={cn(
                            "px-1.5 py-0.5 rounded text-[10px] font-bold font-mono",
                            siswa.gender === "L" ? "bg-blue-50 text-blue-700" : "bg-pink-50 text-pink-700"
                          )}>
                            {siswa.gender}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-600">
                          <div>{siswa.namaWali || "-"}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{siswa.teleponWali}</div>
                        </td>
                        <td className="py-2 px-3 text-right">
                          <select
                            defaultValue={selectedKelasForSiswa.nama}
                            onChange={(e) => {
                              pindahSiswaRombel(siswa.id, e.target.value);
                              showToast(`${siswa.nama} berhasil dipindahkan ke ${e.target.value}.`);
                            }}
                            className="h-7 rounded-lg border border-slate-200 bg-white px-2 text-[11px] font-medium text-navy-950 outline-none focus:ring-1 focus:ring-navy-900 cursor-pointer"
                          >
                            {kelasList.map((k) => (
                              <option key={k.id} value={k.nama}>
                                {k.nama}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-3 shrink-0">
              <div className="text-xs text-slate-500">
                Total: <span className="font-bold text-navy-950 font-mono">{siswaDiRombel.length}</span> siswa terdaftar
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  className="text-xs gap-1.5 cursor-pointer"
                >
                  <Printer size={13} />
                  <span>Cetak Daftar Presensi</span>
                </Button>
                <Button
                  size="sm"
                  onClick={() => setIsSiswaModalOpen(false)}
                  className="bg-navy-900 hover:bg-navy-800 text-white text-xs cursor-pointer"
                >
                  Tutup
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Kenaikan & Mutasi Masal */}
      {isPromoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-purple-100 text-purple-900">
                  <ArrowRightLeft size={18} />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-navy-950">
                    Kenaikan Kelas &amp; Mutasi Masal
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Pindahkan seluruh siswa dari satu rombel ke rombel berikutnya.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPromoteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-amber-900 text-xs flex gap-2">
                <Sparkles size={16} className="text-amber-700 shrink-0 mt-0.5" />
                <p>
                  Gunakan fitur ini di akhir semester untuk menaikkan kelas seluruh siswa (misal: semua siswa <strong>X IPA 1</strong> dinaikkan ke <strong>XI IPA 1</strong>).
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Rombel Asal</label>
                <select
                  value={kelasAsal}
                  onChange={(e) => setKelasAsal(e.target.value)}
                  className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none focus:ring-2 focus:ring-navy-900"
                >
                  <option value="">-- Pilih Rombel Asal --</option>
                  {kelasList.map((k) => {
                    const count = siswaList.filter((s) => s.kelas === k.nama).length;
                    return (
                      <option key={k.id} value={k.nama}>
                        {k.nama} ({count} siswa)
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Rombel Tujuan (Kenaikan / Mutasi)</label>
                <select
                  value={kelasTujuan}
                  onChange={(e) => setKelasTujuan(e.target.value)}
                  className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none focus:ring-2 focus:ring-navy-900"
                >
                  <option value="">-- Pilih Rombel Tujuan --</option>
                  {kelasList.map((k) => (
                    <option key={k.id} value={k.nama}>
                      {k.nama} (Wali: {k.waliKelas || "-"})
                    </option>
                  ))}
                </select>
              </div>

              {kelasAsal && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="text-slate-500">Jumlah siswa yang akan dimutasi: </span>
                  <span className="font-bold text-navy-950 font-mono">
                    {siswaList.filter((s) => s.kelas === kelasAsal).length} Siswa
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPromoteModalOpen(false)}
                className="text-xs cursor-pointer"
              >
                Batal
              </Button>
              <Button
                size="sm"
                onClick={handleBatchPromote}
                className="bg-purple-900 hover:bg-purple-800 text-white text-xs font-semibold cursor-pointer"
              >
                Eksekusi Mutasi Masal
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
