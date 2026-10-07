"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  CalendarDays,
  Plus,
  Search,
  Download,
  Printer,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Clock,
  Award,
  BookOpen,
  Coffee,
  Briefcase,
  Sparkles,
  Edit3,
  Trash2,
  CheckCircle2,
  X,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";

export interface AgendaAkademikLive {
  id: string | number;
  judul: string;
  kategori: "UJIAN" | "LIBUR" | "KBM" | "RAPOR" | "KEGIATAN_SEKOLAH" | "RAPAT_GURU" | string;
  tanggalMulai: string;
  tanggalSelesai: string;
  sasaran: "SEMUA" | "GURU" | "SISWA" | "ORANG_TUA" | string;
  keterangan?: string;
  warna?: string;
}

const KATEGORI_CONFIG: Record<
  string,
  { label: string; badgeClass: string; icon: any; dotColor: string }
> = {
  UJIAN: {
    label: "Pekan Ujian & Asesmen",
    badgeClass: "bg-amber-100 text-amber-900 border-amber-200",
    icon: Award,
    dotColor: "bg-amber-500",
  },
  LIBUR: {
    label: "Hari Libur & Cuti",
    badgeClass: "bg-rose-100 text-rose-900 border-rose-200",
    icon: Coffee,
    dotColor: "bg-rose-500",
  },
  KBM: {
    label: "KBM & Pembelajaran",
    badgeClass: "bg-emerald-100 text-emerald-900 border-emerald-200",
    icon: BookOpen,
    dotColor: "bg-emerald-500",
  },
  RAPOR: {
    label: "Pembagian Rapor",
    badgeClass: "bg-sky-100 text-sky-900 border-sky-200",
    icon: CheckCircle2,
    dotColor: "bg-sky-500",
  },
  KEGIATAN_SEKOLAH: {
    label: "Kegiatan & Event Sekolah",
    badgeClass: "bg-purple-100 text-purple-900 border-purple-200",
    icon: Sparkles,
    dotColor: "bg-purple-500",
  },
  RAPAT_GURU: {
    label: "Rapat Dinas & PTK",
    badgeClass: "bg-indigo-100 text-indigo-900 border-indigo-200",
    icon: Briefcase,
    dotColor: "bg-indigo-500",
  },
};

export default function KalenderAkademikPage() {
  const [daftarAgendaAkademik, setDaftarAgendaAkademik] = useState<AgendaAkademikLive[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [kategoriFilter, setKategoriFilter] = useState<string>("SEMUA");
  const [sasaranFilter, setSasaranFilter] = useState<string>("SEMUA");
  const [viewMode, setViewMode] = useState<"timeline" | "calendar">("timeline");

  // Selected Month for Calendar Grid View
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAgenda, setEditingAgenda] = useState<AgendaAkademikLive | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Form State
  const [formJudul, setFormJudul] = useState("");
  const [formKategori, setFormKategori] = useState<string>("UJIAN");
  const [formTglMulai, setFormTglMulai] = useState("");
  const [formTglSelesai, setFormTglSelesai] = useState("");
  const [formSasaran, setFormSasaran] = useState<string>("SEMUA");
  const [formKeterangan, setFormKeterangan] = useState("");
  const [formWarna, setFormWarna] = useState<string>("amber");

  const fetchData = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const res = await api.getAgendaAkademikList();
      const raw = (res as any)?.data || (res as any) || [];
      const normalized: AgendaAkademikLive[] = Array.isArray(raw)
        ? raw.map((item: any) => ({
            id: item.id,
            judul: item.judul || "Agenda",
            kategori: item.kategori || "KEGIATAN_SEKOLAH",
            tanggalMulai: item.tanggal_mulai || item.tanggalMulai || new Date().toISOString().split("T")[0],
            tanggalSelesai: item.tanggal_selesai || item.tanggalSelesai || item.tanggal_mulai || item.tanggalMulai || new Date().toISOString().split("T")[0],
            sasaran: item.sasaran || "SEMUA",
            keterangan: item.keterangan || "",
            warna: item.warna || "sky",
          }))
        : [];
      setDaftarAgendaAkademik(normalized);
      if (isManual) showToast("Agenda akademik berhasil diperbarui.");
    } catch (err: any) {
      console.error("Gagal memuat agenda akademik:", err);
      showToast("Gagal memuat agenda akademik dari server.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openAddModal = () => {
    const todayStr = new Date().toISOString().split("T")[0];
    setEditingAgenda(null);
    setFormJudul("");
    setFormKategori("UJIAN");
    setFormTglMulai(todayStr);
    setFormTglSelesai(todayStr);
    setFormSasaran("SISWA");
    setFormKeterangan("");
    setFormWarna("amber");
    setIsAddModalOpen(true);
  };

  const openEditModal = (agenda: AgendaAkademikLive) => {
    setEditingAgenda(agenda);
    setFormJudul(agenda.judul);
    setFormKategori(agenda.kategori);
    setFormTglMulai(agenda.tanggalMulai);
    setFormTglSelesai(agenda.tanggalSelesai);
    setFormSasaran(agenda.sasaran);
    setFormKeterangan(agenda.keterangan || "");
    setFormWarna(agenda.warna || "sky");
    setIsAddModalOpen(true);
  };

  const handleSaveAgenda = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formJudul.trim() || !formTglMulai) return;

    setIsSubmitting(true);
    const payload = {
      judul: formJudul.trim(),
      kategori: formKategori,
      tanggal_mulai: formTglMulai,
      tanggal_selesai: formTglSelesai || formTglMulai,
      sasaran: formSasaran,
      keterangan: formKeterangan,
      warna: formWarna,
    };

    try {
      if (editingAgenda) {
        await api.updateAgendaAkademik(editingAgenda.id, payload);
        showToast(`Agenda "${formJudul}" berhasil diperbarui.`);
      } else {
        await api.createAgendaAkademik(payload);
        showToast(`Agenda "${formJudul}" berhasil ditambahkan.`);
      }
      setIsAddModalOpen(false);
      fetchData();
    } catch (err: any) {
      console.error("Gagal simpan agenda:", err);
      showToast("Gagal menyimpan agenda akademik.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAgenda = async (id: string | number, judul: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus agenda "${judul}"?`)) {
      try {
        await api.deleteAgendaAkademik(id);
        showToast(`Agenda "${judul}" telah dihapus.`);
        fetchData();
      } catch (err: any) {
        console.error("Gagal hapus agenda:", err);
        showToast("Gagal menghapus agenda.");
      }
    }
  };

  // Filtered Agendas
  const filteredAgendas = useMemo(() => {
    return daftarAgendaAkademik
      .filter((a) => {
        const matchSearch =
          a.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (a.keterangan && a.keterangan.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchKategori = kategoriFilter === "SEMUA" || a.kategori === kategoriFilter;
        const matchSasaran = sasaranFilter === "SEMUA" || a.sasaran === sasaranFilter;
        return matchSearch && matchKategori && matchSasaran;
      })
      .sort((a, b) => a.tanggalMulai.localeCompare(b.tanggalMulai));
  }, [daftarAgendaAkademik, searchQuery, kategoriFilter, sasaranFilter]);

  // Calendar Grid Calculation
  const namaBulanIndo = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  const startDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const formatTanggalRange = (mulai: string, selesai: string) => {
    const d1 = new Date(mulai);
    const d2 = new Date(selesai);

    const opt: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" };
    if (mulai === selesai) {
      return d1.toLocaleDateString("id-ID", opt);
    }
    return `${d1.toLocaleDateString("id-ID", { day: "numeric", month: "short" })} - ${d2.toLocaleDateString("id-ID", opt)}`;
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ["ID", "Judul Agenda", "Kategori", "Tanggal Mulai", "Tanggal Selesai", "Sasaran", "Keterangan"];
    const rows = daftarAgendaAkademik.map((a) => [
      a.id,
      `"${a.judul}"`,
      `"${KATEGORI_CONFIG[a.kategori]?.label || a.kategori}"`,
      a.tanggalMulai,
      a.tanggalSelesai,
      a.sasaran,
      `"${a.keterangan || ""}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Kalender_Akademik_${currentYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Kalender akademik berhasil diekspor ke CSV.");
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

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>Tata Usaha &amp; Kurikulum</span>
            <ChevronRight size={13} />
            <span className="text-navy-900">Kalender Akademik</span>
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-navy-950 sm:text-3xl flex items-center gap-2.5">
            <CalendarDays className="text-navy-900 h-7 w-7" />
            Kalender Pendidikan &amp; Agenda Sekolah
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm mt-0.5">
            Jadwal kegiatan KBM, pekan ujian, libur nasional, dan agenda dinas live dari database Supabase.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchData(true)}
            disabled={isRefreshing || isLoading}
            className="gap-1.5 text-xs font-semibold border-slate-200 bg-white hover:bg-slate-50 text-navy-950 shadow-2xs cursor-pointer"
          >
            <RefreshCw size={14} className={cn("text-slate-600", (isRefreshing || isLoading) && "animate-spin")} />
            <span>{isRefreshing ? "Memuat..." : "Refresh"}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={daftarAgendaAkademik.length === 0}
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
            <span>Cetak PDF</span>
          </Button>

          <Button
            size="sm"
            onClick={openAddModal}
            className="gap-1.5 text-xs font-semibold bg-navy-900 hover:bg-navy-800 text-white shadow-2xs cursor-pointer"
          >
            <Plus size={15} />
            <span>Tambah Agenda Baru</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border border-border shadow-xs bg-white animate-pulse">
              <CardContent className="p-4 flex items-center gap-3.5">
                <div className="h-11 w-11 rounded-2xl bg-slate-200 shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 w-20 bg-slate-200 rounded" />
                  <div className="h-5 w-14 bg-slate-200 rounded" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card className="border border-border shadow-xs bg-white">
              <CardContent className="p-4 flex items-center gap-3.5">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-navy-50 text-navy-900 shrink-0">
                  <Calendar size={22} />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Total Agenda Tercatat</p>
                  <span className="font-display text-xl font-bold text-navy-950 sm:text-2xl">
                    {daftarAgendaAkademik.length}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border shadow-xs bg-white">
              <CardContent className="p-4 flex items-center gap-3.5">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-50 text-amber-900 shrink-0">
                  <Award size={22} />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Pekan Ujian &amp; Asesmen</p>
                  <span className="font-display text-xl font-bold text-navy-950 sm:text-2xl">
                    {daftarAgendaAkademik.filter((a) => a.kategori === "UJIAN").length}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border shadow-xs bg-white">
              <CardContent className="p-4 flex items-center gap-3.5">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-rose-50 text-rose-900 shrink-0">
                  <Coffee size={22} />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Hari Libur &amp; Cuti</p>
                  <span className="font-display text-xl font-bold text-navy-950 sm:text-2xl">
                    {daftarAgendaAkademik.filter((a) => a.kategori === "LIBUR").length}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border shadow-xs bg-white">
              <CardContent className="p-4 flex items-center gap-3.5">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-purple-50 text-purple-900 shrink-0">
                  <Sparkles size={22} />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Event &amp; Kegiatan</p>
                  <span className="font-display text-xl font-bold text-navy-950 sm:text-2xl">
                    {daftarAgendaAkademik.filter((a) => a.kategori === "KEGIATAN_SEKOLAH").length}
                  </span>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Filter & View Mode Bar */}
      <Card className="border border-border shadow-xs bg-white">
        <CardContent className="p-4 space-y-3.5">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Cari nama agenda, pekan asesmen, kegiatan..."
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

            <div className="flex items-center gap-2">
              <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-0.5 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setViewMode("timeline")}
                  className={cn(
                    "rounded-lg px-3 py-1 transition-all cursor-pointer",
                    viewMode === "timeline" ? "bg-white text-navy-950 shadow-2xs font-bold" : "text-slate-600"
                  )}
                >
                  Daftar Timeline
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("calendar")}
                  className={cn(
                    "rounded-lg px-3 py-1 transition-all cursor-pointer",
                    viewMode === "calendar" ? "bg-white text-navy-950 shadow-2xs font-bold" : "text-slate-600"
                  )}
                >
                  Grid Kalender
                </button>
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setKategoriFilter("SEMUA")}
              className={cn(
                "rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer",
                kategoriFilter === "SEMUA"
                  ? "bg-navy-900 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
              )}
            >
              Semua Kategori
            </button>
            {Object.entries(KATEGORI_CONFIG).map(([key, cfg]) => (
              <button
                key={key}
                type="button"
                onClick={() => setKategoriFilter(key)}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer",
                  kategoriFilter === key
                    ? "bg-navy-900 text-white shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                )}
              >
                {cfg.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* VIEW MODE: TIMELINE */}
      {viewMode === "timeline" && (
        <Card className="border border-border shadow-xs bg-white overflow-hidden">
          <div className="p-4 sm:p-6 space-y-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-100 animate-pulse space-y-2">
                  <div className="h-4 w-48 bg-slate-200 rounded" />
                  <div className="h-3 w-32 bg-slate-100 rounded" />
                </div>
              ))
            ) : filteredAgendas.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Calendar className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-sm">Tidak ada agenda akademik ditemukan</p>
                <p className="text-xs text-slate-400">Silakan tambahkan agenda baru atau ganti filter pencarian.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredAgendas.map((item) => {
                  const cfg = KATEGORI_CONFIG[item.kategori] || {
                    label: item.kategori,
                    badgeClass: "bg-slate-100 text-slate-800",
                    dotColor: "bg-slate-400",
                    icon: Calendar,
                  };
                  const Icon = cfg.icon;

                  return (
                    <div key={item.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-slate-50/60 transition-colors rounded-xl px-3">
                      <div className="flex items-start gap-3">
                        <div className={cn("mt-1 grid h-8 w-8 place-items-center rounded-xl shrink-0 text-white", cfg.dotColor)}>
                          <Icon size={16} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-navy-950 text-sm">{item.judul}</h3>
                            <Badge variant="outline" className={cn("text-[10px] font-bold px-1.5 py-0.5", cfg.badgeClass)}>
                              {cfg.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5 font-medium">
                            <Clock size={12} className="text-slate-400" />
                            <span>{formatTanggalRange(item.tanggalMulai, item.tanggalSelesai)}</span>
                            {item.sasaran && (
                              <>
                                <span>•</span>
                                <span>Sasaran: {item.sasaran}</span>
                              </>
                            )}
                          </p>
                          {item.keterangan && (
                            <p className="text-xs text-slate-600 mt-1 italic">{item.keterangan}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 self-end sm:self-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(item)}
                          className="h-7 w-7 p-0 text-slate-500 hover:text-navy-950 cursor-pointer"
                        >
                          <Edit3 size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAgenda(item.id, item.judul)}
                          className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* VIEW MODE: CALENDAR GRID */}
      {viewMode === "calendar" && (
        <Card className="border border-border shadow-xs bg-white overflow-hidden p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="font-display text-lg font-bold text-navy-950">
              {namaBulanIndo[currentMonth]} {currentYear}
            </h2>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={prevMonth} className="h-8 w-8 p-0 cursor-pointer">
                <ChevronLeft size={16} />
              </Button>
              <Button variant="outline" size="sm" onClick={nextMonth} className="h-8 w-8 p-0 cursor-pointer">
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((d, i) => (
              <div key={d} className={cn("py-2 font-bold text-slate-500 uppercase text-[11px]", i === 6 && "text-rose-500")}>
                {d}
              </div>
            ))}

            {Array.from({ length: startDay }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[80px] p-1 bg-slate-50/40 rounded-lg" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
              const dayAgendas = daftarAgendaAkademik.filter(
                (a) => dateStr >= a.tanggalMulai && dateStr <= a.tanggalSelesai
              );

              return (
                <div key={dayNum} className="min-h-[80px] p-1.5 border border-slate-100 rounded-lg flex flex-col justify-between hover:bg-slate-50/60 transition-colors">
                  <span className="font-mono text-xs font-bold text-slate-700 text-left">{dayNum}</span>
                  <div className="space-y-1 mt-1">
                    {dayAgendas.slice(0, 2).map((ag) => (
                      <div
                        key={ag.id}
                        onClick={() => openEditModal(ag)}
                        className="text-[10px] font-semibold truncate rounded px-1 py-0.5 bg-navy-50 text-navy-900 border border-navy-200 cursor-pointer"
                        title={ag.judul}
                      >
                        {ag.judul}
                      </div>
                    ))}
                    {dayAgendas.length > 2 && (
                      <span className="text-[9px] text-slate-400 font-bold block text-left">
                        +{dayAgendas.length - 2} lagi
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* MODAL TAMBAH / EDIT AGENDA */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display text-lg font-bold text-navy-950">
                {editingAgenda ? "Edit Agenda Akademik" : "Tambah Agenda Akademik Baru"}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAgenda} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Judul Agenda *</label>
                <Input
                  required
                  placeholder="Contoh: Penilaian Tengah Semester (PTS) Ganjil"
                  value={formJudul}
                  onChange={(e) => setFormJudul(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Kategori Agenda</label>
                  <select
                    value={formKategori}
                    onChange={(e) => setFormKategori(e.target.value)}
                    className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none focus:ring-2 focus:ring-navy-900"
                  >
                    <option value="UJIAN">Pekan Ujian &amp; Asesmen</option>
                    <option value="LIBUR">Hari Libur &amp; Cuti</option>
                    <option value="KBM">KBM &amp; Pembelajaran</option>
                    <option value="RAPOR">Pembagian Rapor</option>
                    <option value="KEGIATAN_SEKOLAH">Kegiatan &amp; Event Sekolah</option>
                    <option value="RAPAT_GURU">Rapat Dinas &amp; PTK</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Sasaran Audiens</label>
                  <select
                    value={formSasaran}
                    onChange={(e) => setFormSasaran(e.target.value)}
                    className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none focus:ring-2 focus:ring-navy-900"
                  >
                    <option value="SEMUA">Semua Warga Sekolah</option>
                    <option value="SISWA">Khusus Siswa</option>
                    <option value="GURU">Khusus Guru / Pendidik</option>
                    <option value="ORANG_TUA">Khusus Orang Tua / Wali</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Tanggal Mulai *</label>
                  <Input
                    type="date"
                    required
                    value={formTglMulai}
                    onChange={(e) => setFormTglMulai(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Tanggal Selesai</label>
                  <Input
                    type="date"
                    value={formTglSelesai}
                    onChange={(e) => setFormTglSelesai(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Keterangan Tambahan</label>
                <textarea
                  rows={2}
                  placeholder="Catatan pelaksanaan, seragam, atau arahan khusus..."
                  value={formKeterangan}
                  onChange={(e) => setFormKeterangan(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs outline-none focus:ring-2 focus:ring-navy-900 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isSubmitting}
                  onClick={() => setIsAddModalOpen(false)}
                  className="cursor-pointer"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="bg-navy-900 hover:bg-navy-800 text-white font-semibold cursor-pointer gap-1.5"
                >
                  {isSubmitting && <Loader2 size={13} className="animate-spin" />}
                  <span>{isSubmitting ? "Menyimpan..." : "Simpan Agenda"}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
