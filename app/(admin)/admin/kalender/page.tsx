"use client";

import { useState, useMemo } from "react";
import {
  CalendarDays,
  Plus,
  Search,
  Filter,
  Download,
  Printer,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Clock,
  Users,
  Award,
  BookOpen,
  Coffee,
  Briefcase,
  Sparkles,
  Edit3,
  Trash2,
  CheckCircle2,
  X,
  AlertCircle,
  Flag,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore, type AgendaAkademik } from "@/lib/store";
import { cn } from "@/lib/utils";

const KATEGORI_CONFIG: Record<
  AgendaAkademik["kategori"],
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
  const {
    daftarAgendaAkademik,
    tambahAgendaAkademik,
    hapusAgendaAkademik,
    updateAgendaAkademik,
    tahunAjaranAktif,
    semesterAktif,
    setTahunAjaran,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [kategoriFilter, setKategoriFilter] = useState<string>("SEMUA");
  const [sasaranFilter, setSasaranFilter] = useState<string>("SEMUA");
  const [viewMode, setViewMode] = useState<"timeline" | "calendar">("timeline");

  // Selected Month for Calendar Grid View (0-indexed: 6 = July 2024, 11 = Dec 2024)
  const [currentYear, setCurrentYear] = useState(2024);
  const [currentMonth, setCurrentMonth] = useState(6); // Juli

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAgenda, setEditingAgenda] = useState<AgendaAkademik | null>(null);
  const [isSemesterModalOpen, setIsSemesterModalOpen] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Form State
  const [formJudul, setFormJudul] = useState("");
  const [formKategori, setFormKategori] = useState<AgendaAkademik["kategori"]>("UJIAN");
  const [formTglMulai, setFormTglMulai] = useState("");
  const [formTglSelesai, setFormTglSelesai] = useState("");
  const [formSasaran, setFormSasaran] = useState<AgendaAkademik["sasaran"]>("SEMUA");
  const [formKeterangan, setFormKeterangan] = useState("");
  const [formWarna, setFormWarna] = useState<AgendaAkademik["warna"]>("sky");

  // Semester Config State (Mock parameters for effective periods)
  const [semesterMulai, setSemesterMulai] = useState("2024-07-15");
  const [semesterSelesai, setSemesterSelesai] = useState("2024-12-20");
  const [pekanEfektif, setPekanEfektif] = useState(19);
  const [hariEfektif, setHariEfektif] = useState(108);

  const openAddModal = () => {
    setEditingAgenda(null);
    setFormJudul("");
    setFormKategori("UJIAN");
    setFormTglMulai("2024-09-16");
    setFormTglSelesai("2024-09-20");
    setFormSasaran("SISWA");
    setFormKeterangan("");
    setFormWarna("amber");
    setIsAddModalOpen(true);
  };

  const openEditModal = (agenda: AgendaAkademik) => {
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

  const handleSaveAgenda = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formJudul.trim() || !formTglMulai) return;

    if (editingAgenda) {
      updateAgendaAkademik(editingAgenda.id, {
        judul: formJudul.trim(),
        kategori: formKategori,
        tanggalMulai: formTglMulai,
        tanggalSelesai: formTglSelesai || formTglMulai,
        sasaran: formSasaran,
        keterangan: formKeterangan,
        warna: formWarna,
      });
      showToast(`Agenda "${formJudul}" berhasil diperbarui.`);
    } else {
      tambahAgendaAkademik({
        judul: formJudul.trim(),
        kategori: formKategori,
        tanggalMulai: formTglMulai,
        tanggalSelesai: formTglSelesai || formTglMulai,
        sasaran: formSasaran,
        keterangan: formKeterangan,
        warna: formWarna,
      });
      showToast(`Agenda "${formJudul}" berhasil ditambahkan.`);
    }
    setIsAddModalOpen(false);
  };

  const handleDeleteAgenda = (id: string, judul: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus agenda "${judul}"?`)) {
      hapusAgendaAkademik(id);
      showToast(`Agenda "${judul}" telah dihapus.`);
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
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday
  // Convert to Monday = 0, ..., Sunday = 6
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

  // Helper date format
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
    const headers = ["ID", "Judul Agenda", "Kategori", "Tanggal Mulai", "Tanggal Selesai", "Sasaran Audiens", "Keterangan"];
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
    link.setAttribute("download", `Kalender_Akademik_Hadirin_${tahunAjaranAktif.replace("/", "-")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Kalender akademik berhasil diekspor ke CSV.");
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
            <span>Akademik &amp; Kurikulum</span>
            <ChevronRight size={13} />
            <span className="text-navy-900">Kalender Pendidikan</span>
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-navy-950 sm:text-3xl flex items-center gap-2.5">
            <CalendarDays className="text-navy-900 h-7 w-7" />
            Kalender Akademik &amp; Tahun Ajaran
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm mt-0.5">
            Jadwal kegiatan akademik, pekan ujian, hari libur nasional, rapat PTK, dan target hari efektif KBM ({tahunAjaranAktif} - {semesterAktif}).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSemesterModalOpen(true)}
            className="gap-1.5 text-xs font-semibold border-slate-200 bg-white hover:bg-slate-50 text-navy-950 shadow-2xs cursor-pointer"
          >
            <Clock size={14} className="text-navy-700" />
            <span>Atur Semester</span>
          </Button>

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
            <span>Cetak Kalender</span>
          </Button>

          <Button
            size="sm"
            onClick={openAddModal}
            className="gap-1.5 text-xs font-bold bg-navy-900 text-white hover:bg-navy-800 shadow-sm cursor-pointer"
          >
            <Plus size={15} />
            <span>Tambah Agenda</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <Card className="border border-border shadow-xs bg-white">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-navy-50 text-navy-900 shrink-0">
              <Calendar size={22} />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Semester Aktif</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="font-display text-lg font-bold text-navy-950 sm:text-xl">
                  {semesterAktif}
                </span>
                <span className="text-[10px] font-bold text-emerald-600 uppercase font-mono">
                  {tahunAjaranAktif}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-xs bg-white">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-50 text-emerald-900 shrink-0">
              <BookOpen size={22} />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Hari Efektif KBM</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="font-display text-xl font-bold text-navy-950 sm:text-2xl">
                  {hariEfektif}
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold">Hari Kerja</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-xs bg-white">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-sky-50 text-sky-900 shrink-0">
              <Clock size={22} />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Pekan Efektif</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="font-display text-xl font-bold text-navy-950 sm:text-2xl">
                  {pekanEfektif}
                </span>
                <span className="text-[10px] text-sky-700 font-semibold">Minggu Belajar</span>
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
              <p className="text-xs font-medium text-muted-foreground">Total Agenda</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="font-display text-xl font-bold text-navy-950 sm:text-2xl">
                  {daftarAgendaAkademik.length}
                </span>
                <span className="text-[10px] text-purple-700 font-medium">Kegiatan Terjadwal</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter & View Mode Switcher */}
      <Card className="border border-border shadow-xs bg-white">
        <CardContent className="p-4 space-y-3.5">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Cari judul agenda kegiatan atau keterangan..."
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
                onClick={() => setViewMode("timeline")}
                className={cn(
                  "px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer",
                  viewMode === "timeline" ? "bg-white text-navy-950 shadow-xs" : "text-slate-600 hover:text-navy-950"
                )}
              >
                Linimasa Agenda
              </button>
              <button
                type="button"
                onClick={() => setViewMode("calendar")}
                className={cn(
                  "px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer",
                  viewMode === "calendar" ? "bg-white text-navy-950 shadow-xs" : "text-slate-600 hover:text-navy-950"
                )}
              >
                Grid Kalender
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mr-1">
              <Filter size={12} /> Kategori:
            </span>
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
              Semua
            </button>
            {(Object.keys(KATEGORI_CONFIG) as AgendaAkademik["kategori"][]).map((kat) => (
              <button
                key={kat}
                type="button"
                onClick={() => setKategoriFilter(kat)}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer",
                  kategoriFilter === kat
                    ? "bg-navy-900 text-white shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                )}
              >
                {KATEGORI_CONFIG[kat].label}
              </button>
            ))}

            <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mr-1">
              Sasaran:
            </span>
            {(["SEMUA", "SISWA", "GURU", "ORANG_TUA"] as const).map((sasaran) => (
              <button
                key={sasaran}
                type="button"
                onClick={() => setSasaranFilter(sasaran)}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer",
                  sasaranFilter === sasaran
                    ? "bg-navy-900 text-white shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                )}
              >
                {sasaran === "SEMUA" ? "Semua Warga" : sasaran === "SISWA" ? "Siswa" : sasaran === "GURU" ? "Guru & PTK" : "Orang Tua"}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* VIEW 1: Timeline Mode */}
      {viewMode === "timeline" && (
        <div className="space-y-3">
          {filteredAgendas.length === 0 ? (
            <Card className="border border-border bg-white p-12 text-center text-xs text-slate-500 shadow-xs">
              Tidak ada agenda akademik yang sesuai dengan filter pencarian.
            </Card>
          ) : (
            filteredAgendas.map((agenda, idx) => {
              const cfg = KATEGORI_CONFIG[agenda.kategori] || KATEGORI_CONFIG.KBM;
              const Icon = cfg.icon;
              const d1 = new Date(agenda.tanggalMulai);
              const d2 = new Date(agenda.tanggalSelesai);
              const durasiHari = Math.max(1, Math.round((d2.getTime() - d1.getTime()) / (1000 * 3600 * 24)) + 1);

              return (
                <Card
                  key={agenda.id}
                  className="border border-border/80 bg-white shadow-xs hover:shadow-md transition-all group overflow-hidden"
                >
                  <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    {/* Left: Date indicator badge + Details */}
                    <div className="flex items-start gap-4 flex-1">
                      {/* Date Block */}
                      <div className="flex flex-col items-center justify-center h-14 w-16 rounded-2xl bg-slate-50 border border-slate-200 shrink-0 text-center p-1">
                        <span className="text-[10px] font-bold uppercase text-slate-400 font-mono">
                          {d1.toLocaleDateString("id-ID", { month: "short" })}
                        </span>
                        <span className="font-display text-xl font-bold text-navy-950 leading-none">
                          {d1.getDate()}
                        </span>
                        <span className="text-[9px] text-slate-500 font-mono mt-0.5">
                          {durasiHari} Hari
                        </span>
                      </div>

                      {/* Content Details */}
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant="outline"
                            className={cn("text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 flex items-center gap-1", cfg.badgeClass)}
                          >
                            <Icon size={12} />
                            <span>{cfg.label}</span>
                          </Badge>

                          <Badge variant="secondary" className="text-[10px] font-semibold text-slate-600 bg-slate-100">
                            {agenda.sasaran === "SEMUA" ? "Semua Warga Sekolah" : agenda.sasaran === "SISWA" ? "Khusus Siswa" : agenda.sasaran === "GURU" ? "Khusus Pendidik / PTK" : "Orang Tua / Wali"}
                          </Badge>

                          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                            &bull; {formatTanggalRange(agenda.tanggalMulai, agenda.tanggalSelesai)}
                          </span>
                        </div>

                        <h3 className="font-display text-base font-bold text-navy-950 group-hover:text-navy-800 transition-colors">
                          {agenda.judul}
                        </h3>

                        {agenda.keterangan && (
                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                            {agenda.keterangan}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center border-t sm:border-t-0 pt-2 sm:pt-0 w-full sm:w-auto justify-end border-slate-100">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(agenda)}
                        className="h-8 text-xs text-slate-600 hover:text-navy-950 hover:bg-slate-100 gap-1 cursor-pointer"
                      >
                        <Edit3 size={13} />
                        <span>Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAgenda(agenda.id, agenda.judul)}
                        className="h-8 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 gap-1 cursor-pointer"
                      >
                        <Trash2 size={13} />
                        <span>Hapus</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* VIEW 2: Monthly Calendar Grid Mode */}
      {viewMode === "calendar" && (
        <Card className="border border-border shadow-xs bg-white overflow-hidden">
          <CardContent className="p-4 sm:p-6 space-y-4">
            {/* Month Navigation */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <h3 className="font-display text-xl font-bold text-navy-950">
                  {namaBulanIndo[currentMonth]} {currentYear}
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  ({tahunAjaranAktif} - {semesterAktif})
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={prevMonth}
                  className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-label="Bulan Sebelumnya"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={nextMonth}
                  className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-label="Bulan Berikutnya"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Calendar Days Table */}
            <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-xl overflow-hidden border border-slate-200 text-xs">
              {/* Day Headers (Senin - Minggu) */}
              {["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"].map((hari, i) => (
                <div
                  key={hari}
                  className={cn(
                    "bg-slate-50 py-2.5 text-center font-bold text-[11px] uppercase tracking-wider",
                    i === 6 ? "text-rose-600" : "text-slate-500"
                  )}
                >
                  {hari}
                </div>
              ))}

              {/* Empty leading cells */}
              {Array.from({ length: startDay }).map((_, i) => (
                <div key={`empty-${i}`} className="bg-white/50 min-h-[90px] p-1.5" />
              ))}

              {/* Days in Month */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                
                // Find all agendas that cover this date
                const agendasToday = daftarAgendaAkademik.filter((a) => {
                  return dateStr >= a.tanggalMulai && dateStr <= a.tanggalSelesai;
                });

                const isSunday = (startDay + i) % 7 === 6;

                return (
                  <div
                    key={dayNum}
                    className={cn(
                      "bg-white min-h-[90px] p-2 flex flex-col justify-between hover:bg-slate-50/80 transition-colors",
                      agendasToday.length > 0 && "bg-slate-50/40"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          "font-mono font-bold text-xs",
                          isSunday ? "text-rose-600" : "text-navy-950"
                        )}
                      >
                        {dayNum}
                      </span>
                      {agendasToday.length > 0 && (
                        <span className="h-1.5 w-1.5 rounded-full bg-navy-600" />
                      )}
                    </div>

                    <div className="space-y-1 mt-1 flex-1 overflow-hidden">
                      {agendasToday.slice(0, 2).map((agenda) => {
                        const cfg = KATEGORI_CONFIG[agenda.kategori];
                        return (
                          <div
                            key={agenda.id}
                            onClick={() => openEditModal(agenda)}
                            title={`${agenda.judul} (${cfg.label})`}
                            className={cn(
                              "truncate px-1.5 py-0.5 rounded text-[9px] font-semibold border cursor-pointer transition-transform hover:scale-[1.02]",
                              cfg.badgeClass
                            )}
                          >
                            {agenda.judul}
                          </div>
                        );
                      })}
                      {agendasToday.length > 2 && (
                        <span className="text-[9px] text-slate-500 font-semibold block px-1">
                          +{agendasToday.length - 2} agenda lainnya
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* MODAL 1: Tambah / Edit Agenda */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-navy-900 text-white">
                  <CalendarDays size={18} />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-navy-950">
                    {editingAgenda ? "Edit Agenda Kalender" : "Tambah Agenda Kalender Baru"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Jadwalkan kegiatan akademik, pekan ujian, atau hari libur sekolah.
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

            <form onSubmit={handleSaveAgenda} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Judul Agenda Kegiatan *</label>
                <Input
                  required
                  placeholder="Contoh: Penilaian Tengah Semester (PTS) Ganjil"
                  value={formJudul}
                  onChange={(e) => setFormJudul(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Kategori Agenda *</label>
                  <select
                    value={formKategori}
                    onChange={(e) => setFormKategori(e.target.value as any)}
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

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Sasaran Peserta *</label>
                  <select
                    value={formSasaran}
                    onChange={(e) => setFormSasaran(e.target.value as any)}
                    className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none focus:ring-2 focus:ring-navy-900"
                  >
                    <option value="SEMUA">Semua Warga Sekolah</option>
                    <option value="SISWA">Khusus Siswa</option>
                    <option value="GURU">Khusus Guru &amp; PTK</option>
                    <option value="ORANG_TUA">Khusus Orang Tua / Wali</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Tanggal Mulai *</label>
                  <Input
                    type="date"
                    required
                    value={formTglMulai}
                    onChange={(e) => setFormTglMulai(e.target.value)}
                    className="h-9 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Tanggal Selesai *</label>
                  <Input
                    type="date"
                    required
                    value={formTglSelesai}
                    onChange={(e) => setFormTglSelesai(e.target.value)}
                    className="h-9 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Keterangan &amp; Catatan Teknis</label>
                <textarea
                  rows={3}
                  placeholder="Tambahkan keterangan petunjuk teknis pelaksanaan, ruangan, atau perlengkapan yang diperlukan..."
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
                  {editingAgenda ? "Simpan Perubahan" : "Tambahkan Agenda"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Pengaturan Periode Semester */}
      {isSemesterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-sky-100 text-sky-900">
                  <Clock size={18} />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-navy-950">
                    Pengaturan Periode Semester
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Konfigurasi rentang hari belajar efektif dan pekan KBM.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSemesterModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Tahun Ajaran &amp; Semester Aktif</label>
                <div className="flex items-center gap-2">
                  <Input disabled value={tahunAjaranAktif} className="h-9 text-xs bg-slate-50 font-bold" />
                  <Input disabled value={semesterAktif} className="h-9 text-xs bg-slate-50 font-bold w-28 text-center" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Awal Semester</label>
                  <Input
                    type="date"
                    value={semesterMulai}
                    onChange={(e) => setSemesterMulai(e.target.value)}
                    className="h-9 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Akhir Semester</label>
                  <Input
                    type="date"
                    value={semesterSelesai}
                    onChange={(e) => setSemesterSelesai(e.target.value)}
                    className="h-9 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Target Pekan Efektif</label>
                  <Input
                    type="number"
                    value={pekanEfektif}
                    onChange={(e) => setPekanEfektif(Number(e.target.value))}
                    className="h-9 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Target Hari Efektif Belajar</label>
                  <Input
                    type="number"
                    value={hariEfektif}
                    onChange={(e) => setHariEfektif(Number(e.target.value))}
                    className="h-9 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSemesterModalOpen(false)}
                className="text-xs cursor-pointer"
              >
                Batal
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  showToast("Konfigurasi periode semester berhasil disimpan.");
                  setIsSemesterModalOpen(false);
                }}
                className="bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold cursor-pointer"
              >
                Simpan Konfigurasi
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
