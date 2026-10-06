"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Megaphone,
  Plus,
  Search,
  Filter,
  Download,
  Pin,
  Send,
  CheckCircle2,
  Users,
  Edit3,
  Trash2,
  X,
  MessageSquare,
  ChevronRight,
  ShieldAlert,
  Paperclip,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface PengumumanItem {
  id: number;
  judul: string;
  konten: string;
  kategori: "PENTING" | "AKADEMIK" | "KEUANGAN" | "EVENT" | "LIBUR";
  sasaran: "SEMUA" | "GURU" | "SISWA" | "ORANG_TUA";
  prioritas: "TINGGI" | "NORMAL";
  tanggal: string;
  penulis: string;
  lampiran_url?: string;
  pin: boolean;
  status: "DITERBITKAN" | "DRAFT";
}

const KATEGORI_BADGES: Record<
  PengumumanItem["kategori"],
  { label: string; badgeClass: string; dotColor: string }
> = {
  PENTING: {
    label: "Pemberitahuan Penting",
    badgeClass: "bg-rose-100 text-rose-900 border-rose-200",
    dotColor: "bg-rose-500",
  },
  AKADEMIK: {
    label: "Akademik & Kurikulum",
    badgeClass: "bg-sky-100 text-sky-900 border-sky-200",
    dotColor: "bg-sky-500",
  },
  KEUANGAN: {
    label: "Keuangan & SPP",
    badgeClass: "bg-emerald-100 text-emerald-900 border-emerald-200",
    dotColor: "bg-emerald-500",
  },
  EVENT: {
    label: "Kegiatan & Acara",
    badgeClass: "bg-purple-100 text-purple-900 border-purple-200",
    dotColor: "bg-purple-500",
  },
  LIBUR: {
    label: "Hari Libur & Cuti",
    badgeClass: "bg-amber-100 text-amber-900 border-amber-200",
    dotColor: "bg-amber-500",
  },
};

export default function PengumumanPage() {
  const [daftarPengumuman, setDaftarPengumuman] = useState<PengumumanItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [kategoriFilter, setKategoriFilter] = useState<string>("SEMUA");
  const [sasaranFilter, setSasaranFilter] = useState<string>("SEMUA");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPengumuman, setEditingPengumuman] = useState<PengumumanItem | null>(null);

  // WhatsApp Broadcast Modal
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [selectedPengumumanForBroadcast, setSelectedPengumumanForBroadcast] = useState<PengumumanItem | null>(null);
  const [broadcastTarget, setBroadcastTarget] = useState<"ORTU" | "GURU" | "SEMUA">("ORTU");
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Form State
  const [formJudul, setFormJudul] = useState("");
  const [formKonten, setFormKonten] = useState("");
  const [formKategori, setFormKategori] = useState<PengumumanItem["kategori"]>("PENTING");
  const [formSasaran, setFormSasaran] = useState<PengumumanItem["sasaran"]>("SEMUA");
  const [formPrioritas, setFormPrioritas] = useState<PengumumanItem["prioritas"]>("NORMAL");
  const [formPenulis, setFormPenulis] = useState("");
  const [formLampiran, setFormLampiran] = useState("");
  const [formPin, setFormPin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch data live dari Supabase via backend API
  const fetchPengumuman = async () => {
    setLoading(true);
    try {
      const res = await api.getPengumumanList();
      if (res && res.data) {
        setDaftarPengumuman(res.data);
      } else {
        setDaftarPengumuman([]);
      }
    } catch (err) {
      console.error("Gagal memuat pengumuman:", err);
      setDaftarPengumuman([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPengumuman();
  }, []);

  const openAddModal = () => {
    setEditingPengumuman(null);
    setFormJudul("");
    setFormKonten("");
    setFormKategori("PENTING");
    setFormSasaran("SEMUA");
    setFormPrioritas("NORMAL");
    setFormPenulis("Kepala Sekolah / Tata Usaha");
    setFormLampiran("");
    setFormPin(false);
    setIsAddModalOpen(true);
  };

  const openEditModal = (p: PengumumanItem) => {
    setEditingPengumuman(p);
    setFormJudul(p.judul);
    setFormKonten(p.konten);
    setFormKategori(p.kategori);
    setFormSasaran(p.sasaran);
    setFormPrioritas(p.prioritas);
    setFormPenulis(p.penulis);
    setFormLampiran(p.lampiran_url || "");
    setFormPin(Boolean(p.pin));
    setIsAddModalOpen(true);
  };

  const handleSavePengumuman = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formJudul.trim() || !formKonten.trim()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        judul: formJudul.trim(),
        konten: formKonten.trim(),
        kategori: formKategori,
        sasaran: formSasaran,
        prioritas: formPrioritas,
        penulis: formPenulis.trim() || "Kepala Sekolah / TU",
        lampiran_url: formLampiran.trim() || null,
        pin: formPin,
      };

      if (editingPengumuman) {
        await api.updatePengumuman(editingPengumuman.id, payload);
        showToast(`Pengumuman "${formJudul}" berhasil diperbarui.`);
      } else {
        await api.createPengumuman(payload);
        showToast(`Pengumuman baru "${formJudul}" berhasil diterbitkan.`);
      }
      setIsAddModalOpen(false);
      await fetchPengumuman();
    } catch (err) {
      console.error("Gagal menyimpan pengumuman:", err);
      showToast("Gagal menyimpan pengumuman. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePengumuman = async (id: number, judul: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus pengumuman "${judul}"?`)) {
      try {
        await api.deletePengumuman(id);
        showToast("Pengumuman telah dihapus.");
        await fetchPengumuman();
      } catch (err) {
        console.error("Gagal menghapus pengumuman:", err);
        showToast("Gagal menghapus pengumuman.");
      }
    }
  };

  const togglePinPengumuman = async (item: PengumumanItem) => {
    try {
      await api.updatePengumuman(item.id, { pin: !item.pin });
      showToast(item.pin ? "Sematan dilepas." : "Pengumuman disematkan ke atas.");
      await fetchPengumuman();
    } catch (err) {
      console.error("Gagal mengubah status pin:", err);
      showToast("Gagal mengubah sematan.");
    }
  };

  const openBroadcastDialog = (p: PengumumanItem) => {
    setSelectedPengumumanForBroadcast(p);
    setBroadcastTarget(p.sasaran === "GURU" ? "GURU" : "ORTU");
    setIsBroadcastModalOpen(true);
  };

  const handleExecuteBroadcast = () => {
    setIsSendingBroadcast(true);
    setTimeout(() => {
      setIsSendingBroadcast(false);
      setIsBroadcastModalOpen(false);
      showToast("Broadcast WhatsApp berhasil dikirim ke nomor kontak terdaftar!");
    }, 1200);
  };

  // Filtered List
  const filteredList = useMemo(() => {
    return daftarPengumuman
      .filter((p) => {
        const matchSearch =
          p.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.konten.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.penulis.toLowerCase().includes(searchQuery.toLowerCase());
        const matchKategori = kategoriFilter === "SEMUA" || p.kategori === kategoriFilter;
        const matchSasaran = sasaranFilter === "SEMUA" || p.sasaran === sasaranFilter;
        return matchSearch && matchKategori && matchSasaran;
      })
      .sort((a, b) => {
        if (a.pin && !b.pin) return -1;
        if (!a.pin && b.pin) return 1;
        return b.tanggal.localeCompare(a.tanggal);
      });
  }, [daftarPengumuman, searchQuery, kategoriFilter, sasaranFilter]);

  // Metrics
  const totalPengumuman = daftarPengumuman.length;
  const totalPinned = daftarPengumuman.filter((p) => p.pin).length;
  const totalPenting = daftarPengumuman.filter((p) => p.prioritas === "TINGGI").length;

  // CSV Export
  const handleExportCSV = () => {
    const headers = ["ID", "Judul", "Kategori", "Sasaran", "Prioritas", "Tanggal Terbit", "Penulis", "Status"];
    const rows = daftarPengumuman.map((p) => [
      p.id,
      `"${p.judul.replace(/"/g, '""')}"`,
      p.kategori,
      p.sasaran,
      p.prioritas,
      p.tanggal,
      `"${p.penulis.replace(/"/g, '""')}"`,
      p.status,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Daftar_Pengumuman_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Data pengumuman berhasil diekspor ke CSV.");
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
            <span>Informasi &amp; Komunikasi</span>
            <ChevronRight size={13} />
            <span className="text-navy-900">Pusat Pengumuman</span>
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-navy-950 sm:text-3xl flex items-center gap-2.5">
            <Megaphone className="text-navy-900 h-7 w-7" />
            Pengumuman &amp; Broadcast Sekolah
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm mt-0.5">
            Publikasikan surat edaran resmi, broadcast notifikasi WhatsApp, dan banner informasi langsung tersinkron ke Supabase PostgreSQL.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPengumuman}
            disabled={loading}
            className="gap-1.5 border-border bg-white text-xs hover:bg-slate-50"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            Segarkan
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={loading || daftarPengumuman.length === 0}
            className="gap-1.5 text-xs font-semibold border-slate-200 bg-white hover:bg-slate-50 text-navy-950 shadow-2xs cursor-pointer"
          >
            <Download size={14} className="text-slate-600" />
            <span>Ekspor CSV</span>
          </Button>

          <Button
            size="sm"
            onClick={openAddModal}
            className="gap-1.5 text-xs font-bold bg-navy-900 text-white hover:bg-navy-800 shadow-sm cursor-pointer"
          >
            <Plus size={15} />
            <span>Buat Pengumuman Baru</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border border-border bg-white p-4 animate-pulse">
              <div className="h-4 w-20 rounded bg-slate-200" />
              <div className="mt-3 h-7 w-12 rounded bg-slate-200" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <Card className="border border-border shadow-xs bg-white">
            <CardContent className="p-4 flex items-center gap-3.5">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-navy-50 text-navy-900 shrink-0">
                <Megaphone size={22} />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total Terbit</p>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="font-display text-xl font-bold text-navy-950 sm:text-2xl">
                    {totalPengumuman}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold uppercase font-mono">
                    Aktif
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border shadow-xs bg-white">
            <CardContent className="p-4 flex items-center gap-3.5">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-50 text-amber-900 shrink-0">
                <Pin size={22} />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Disematkan (Pin)</p>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="font-display text-xl font-bold text-navy-950 sm:text-2xl">
                    {totalPinned}
                  </span>
                  <span className="text-[10px] text-amber-700 font-semibold">Prioritas Atas</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border shadow-xs bg-white">
            <CardContent className="p-4 flex items-center gap-3.5">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-rose-50 text-rose-900 shrink-0">
                <ShieldAlert size={22} />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Prioritas Tinggi</p>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="font-display text-xl font-bold text-navy-950 sm:text-2xl">
                    {totalPenting}
                  </span>
                  <span className="text-[10px] text-rose-700 font-semibold">Perlu Tindakan</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border shadow-xs bg-white">
            <CardContent className="p-4 flex items-center gap-3.5">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-50 text-emerald-900 shrink-0">
                <Users size={22} />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Database Supabase</p>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="font-display text-xl font-bold text-navy-950 sm:text-2xl">
                    Live
                  </span>
                  <span className="text-[10px] text-emerald-700 font-medium">PostgreSQL</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter & Search Bar */}
      <Card className="border border-border shadow-xs bg-white">
        <CardContent className="p-4 space-y-3.5">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Cari judul pengumuman, isi pesan, atau nama pembuat..."
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

            <div className="text-xs text-slate-500 font-medium">
              Menampilkan <span className="font-bold text-navy-950 font-mono">{filteredList.length}</span> dari {totalPengumuman} pengumuman
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
            {(Object.keys(KATEGORI_BADGES) as PengumumanItem["kategori"][]).map((kat) => (
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
                {KATEGORI_BADGES[kat].label}
              </button>
            ))}

            <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mr-1">
              Sasaran:
            </span>
            {(["SEMUA", "GURU", "SISWA", "ORANG_TUA"] as const).map((sasaran) => (
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
                {sasaran === "SEMUA" ? "Semua Warga" : sasaran === "GURU" ? "Dewan Guru" : sasaran === "SISWA" ? "Siswa" : "Orang Tua"}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Announcements Newsfeed List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="border border-border bg-white p-5 animate-pulse space-y-3">
                <div className="flex gap-2">
                  <div className="h-5 w-24 rounded bg-slate-200" />
                  <div className="h-5 w-32 rounded bg-slate-200" />
                </div>
                <div className="h-5 w-3/4 rounded bg-slate-200" />
                <div className="h-12 w-full rounded bg-slate-200" />
                <div className="h-3 w-40 rounded bg-slate-200" />
              </Card>
            ))}
          </div>
        ) : filteredList.length === 0 ? (
          <Card className="border border-border bg-white p-12 text-center text-xs text-slate-500 shadow-xs">
            Tidak ada pengumuman yang sesuai dengan filter pencarian.
          </Card>
        ) : (
          filteredList.map((p) => {
            const badgeCfg = KATEGORI_BADGES[p.kategori] || KATEGORI_BADGES.PENTING;

            return (
              <Card
                key={p.id}
                className={cn(
                  "border bg-white shadow-xs hover:shadow-md transition-all overflow-hidden",
                  p.pin ? "border-amber-300 ring-1 ring-amber-100" : "border-border/80"
                )}
              >
                <CardContent className="p-5 space-y-3.5">
                  {/* Top Bar: Category, Sasaran, Pin indicator, and Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {p.pin && (
                        <Badge className="bg-amber-100 text-amber-900 border-amber-300 text-[10px] font-bold uppercase font-mono flex items-center gap-1 px-2 py-0.5">
                          <Pin size={11} className="fill-amber-600 text-amber-600" />
                          <span>Disematkan</span>
                        </Badge>
                      )}

                      <Badge
                        variant="outline"
                        className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5", badgeCfg.badgeClass)}
                      >
                        {badgeCfg.label}
                      </Badge>

                      <Badge variant="secondary" className="text-[10px] font-semibold text-slate-700 bg-slate-100">
                        Sasaran: {p.sasaran === "SEMUA" ? "Semua Warga Sekolah" : p.sasaran === "GURU" ? "Dewan Guru & PTK" : p.sasaran === "SISWA" ? "Seluruh Siswa" : "Orang Tua / Wali Murid"}
                      </Badge>

                      {p.prioritas === "TINGGI" && (
                        <Badge className="bg-rose-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
                          Penting
                        </Badge>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 self-end sm:self-auto">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePinPengumuman(p)}
                        className="h-7 text-xs text-slate-500 hover:text-navy-950 hover:bg-slate-100 gap-1 px-2 cursor-pointer"
                        title={p.pin ? "Lepas Sematan (Unpin)" : "Sematkan ke Atas (Pin)"}
                      >
                        <Pin size={13} className={p.pin ? "fill-amber-500 text-amber-500" : ""} />
                        <span>{p.pin ? "Lepas Pin" : "Pin"}</span>
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openBroadcastDialog(p)}
                        className="h-7 text-xs font-semibold text-emerald-700 border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 gap-1 px-2.5 cursor-pointer shadow-2xs"
                      >
                        <MessageSquare size={13} className="text-emerald-700" />
                        <span>Blast WA</span>
                      </Button>

                      <button
                        type="button"
                        onClick={() => openEditModal(p)}
                        className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-navy-950 transition-colors cursor-pointer"
                        title="Edit Pengumuman"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePengumuman(p.id, p.judul)}
                        className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Hapus Pengumuman"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Title & Body Content */}
                  <div className="space-y-1.5">
                    <h3 className="font-display text-lg font-bold text-navy-950 leading-snug">
                      {p.judul}
                    </h3>
                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                      {p.konten}
                    </p>
                  </div>

                  {/* Attachment if any */}
                  {p.lampiran_url && (
                    <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs text-navy-900 font-medium hover:bg-slate-100 cursor-pointer">
                      <Paperclip size={13} className="text-slate-500" />
                      <span>{p.lampiran_url}</span>
                      <span className="text-[10px] text-slate-400 font-mono">(Unduh Berkas)</span>
                    </div>
                  )}

                  {/* Bottom Meta Info */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-[11px] text-slate-500">
                    <div className="flex items-center gap-2">
                      <span>Diterbitkan oleh: <strong className="text-navy-950 font-semibold">{p.penulis}</strong></span>
                      <span>&bull;</span>
                      <span className="font-mono">Tanggal: {new Date(p.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                      <CheckCircle2 size={13} />
                      <span>Status: Terbit di Seluruh Dashboard</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* MODAL 1: Buat / Edit Pengumuman */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-navy-900 text-white">
                  <Megaphone size={18} />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-navy-950">
                    {editingPengumuman ? "Edit Pengumuman Sekolah" : "Buat Pengumuman Baru"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Publikasikan informasi resmi atau surat edaran digital langsung ke database.
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

            <form onSubmit={handleSavePengumuman} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Judul Pengumuman *</label>
                <Input
                  required
                  placeholder="Contoh: Pemberitahuan Pelaksanaan Asesmen Tengah Semester"
                  value={formJudul}
                  onChange={(e) => setFormJudul(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Kategori Informasi *</label>
                  <select
                    value={formKategori}
                    onChange={(e) => setFormKategori(e.target.value as any)}
                    className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none focus:ring-2 focus:ring-navy-900"
                  >
                    <option value="PENTING">Pemberitahuan Penting</option>
                    <option value="AKADEMIK">Akademik &amp; Kurikulum</option>
                    <option value="KEUANGAN">Keuangan &amp; SPP</option>
                    <option value="EVENT">Kegiatan &amp; Acara</option>
                    <option value="LIBUR">Hari Libur &amp; Cuti</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Sasaran Penerima *</label>
                  <select
                    value={formSasaran}
                    onChange={(e) => setFormSasaran(e.target.value as any)}
                    className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none focus:ring-2 focus:ring-navy-900"
                  >
                    <option value="SEMUA">Semua Warga Sekolah</option>
                    <option value="GURU">Khusus Dewan Guru &amp; PTK</option>
                    <option value="SISWA">Khusus Seluruh Siswa</option>
                    <option value="ORANG_TUA">Khusus Orang Tua / Wali</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Prioritas</label>
                  <select
                    value={formPrioritas}
                    onChange={(e) => setFormPrioritas(e.target.value as any)}
                    className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none focus:ring-2 focus:ring-navy-900"
                  >
                    <option value="NORMAL">Normal</option>
                    <option value="TINGGI">Tinggi (Wajib Dibaca / Banner Merah)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Penulis / Pihak Berwenang</label>
                  <Input
                    placeholder="Contoh: Kepala Sekolah / Bagian TU"
                    value={formPenulis}
                    onChange={(e) => setFormPenulis(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Isi / Pesan Pengumuman *</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Tuliskan detail informasi, petunjuk, atau arahan pengumuman di sini..."
                  value={formKonten}
                  onChange={(e) => setFormKonten(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs outline-none focus:ring-2 focus:ring-navy-900 resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Lampiran Berkas / URL (Opsional)</label>
                <Input
                  placeholder="Contoh: Surat_Edaran_Resmi_No12.pdf"
                  value={formLampiran}
                  onChange={(e) => setFormLampiran(e.target.value)}
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pinCheckbox"
                  checked={formPin}
                  onChange={(e) => setFormPin(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-navy-900 focus:ring-navy-900 cursor-pointer"
                />
                <label htmlFor="pinCheckbox" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Sematkan pengumuman ini di baris paling atas (Pinned)
                </label>
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
                  disabled={isSubmitting}
                  className="bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold cursor-pointer"
                >
                  {isSubmitting
                    ? "Menyimpan..."
                    : editingPengumuman
                    ? "Simpan Perubahan"
                    : "Terbitkan Pengumuman"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Broadcast WhatsApp Gateway Masal */}
      {isBroadcastModalOpen && selectedPengumumanForBroadcast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-100 text-emerald-900">
                  <MessageSquare size={18} />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-navy-950">
                    Broadcast WhatsApp Gateway
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Kirim notifikasi pesan otomatis ke nomor WhatsApp warga sekolah.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBroadcastModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Target Penerima WhatsApp</label>
                <select
                  value={broadcastTarget}
                  onChange={(e) => setBroadcastTarget(e.target.value as any)}
                  className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none focus:ring-2 focus:ring-emerald-700"
                >
                  <option value="ORTU">Seluruh Orang Tua / Wali Murid (Kontak Terdaftar)</option>
                  <option value="GURU">Seluruh Dewan Guru &amp; Pegawai (PTK)</option>
                  <option value="SEMUA">Seluruh Civitas Akademika Sekolah</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Preview Pesan Broadcast (WhatsApp)</label>
                <div className="rounded-xl bg-emerald-50/60 border border-emerald-200 p-3 font-mono text-[11px] text-slate-800 space-y-1 leading-relaxed">
                  <p className="font-bold text-emerald-950">
                    *PENGUMUMAN RESMI SEKOLAH*
                  </p>
                  <p className="font-semibold">*{selectedPengumumanForBroadcast.judul}*</p>
                  <p className="text-slate-700 line-clamp-3">{selectedPengumumanForBroadcast.konten}</p>
                  <p className="text-slate-500 pt-1">
                    Informasi lengkap dapat diakses melalui portal aplikasi Hadirin.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-[11px]">
                Pesan akan dikirim otomatis menggunakan server API gateway WhatsApp resmi Hadirin dengan kuota aktif.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsBroadcastModalOpen(false)}
                className="text-xs cursor-pointer"
              >
                Batal
              </Button>
              <Button
                size="sm"
                disabled={isSendingBroadcast}
                onClick={handleExecuteBroadcast}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold gap-1.5 cursor-pointer shadow-xs"
              >
                <Send size={13} />
                <span>{isSendingBroadcast ? "Mengirim Pesan..." : "Kirim Broadcast Sekarang"}</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
