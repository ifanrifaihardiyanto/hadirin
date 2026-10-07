"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Upload,
  BookOpen,
  Calendar,
  X,
  Check,
  Send,
  Sparkles,
  RefreshCw,
  FolderOpen
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface TugasItem {
  id: string | number;
  judul: string;
  mapel?: string;
  mata_pelajaran?: { nama: string };
  guruNama?: string;
  guru?: { nama: string };
  deskripsi: string;
  deadline: string;
  status: "AKTIF" | "SELESAI" | string;
  kelas?: string;
}

export default function SiswaTugasPage() {
  const { currentUser } = useStore();

  const [tugasList, setTugasList] = useState<TugasItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterTab, setFilterTab] = useState<"SEMUA" | "AKTIF" | "SELESAI">("SEMUA");
  const [selectedTugas, setSelectedTugas] = useState<TugasItem | null>(null);
  const [jawabanTeks, setJawabanTeks] = useState("");
  const [fileName, setFileName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sudahKumpulMap, setSudahKumpulMap] = useState<Record<string | number, boolean>>({});

  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await api.getTugasList();
      const raw = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      if (raw.length > 0) {
        setTugasList(raw);
      } else {
        // Fallback contoh data tugas kelas
        setTugasList([
          {
            id: 1,
            judul: "Analisis Persamaan Kuadrat dan Grafik Parabola",
            mapel: "Matematika Peminatan",
            guruNama: "Sari Wulandari, S.Pd",
            deskripsi: "Selesaikan 5 soal esai latihan pada modul bab 3 dan gambarkan grafik fungsinya pada kertas berpetak.",
            deadline: "28 Juli 2026, 23:59 WIB",
            status: "AKTIF",
          },
          {
            id: 2,
            judul: "Laporan Praktikum Hukum Newton II",
            mapel: "Fisika",
            guruNama: "Budi Santoso, S.Pd",
            deskripsi: "Ketik laporan praktikum uji gerak meluncur meja gesek lengkap dengan tabel data pengukuran dan grafik percepatan.",
            deadline: "30 Juli 2026, 17:00 WIB",
            status: "AKTIF",
          },
          {
            id: 3,
            judul: "Essay: Analytical Exposition on Digital Literacy",
            mapel: "Bahasa Inggris",
            guruNama: "Rina Marlina, M.Pd",
            deskripsi: "Write a 300-word analytical exposition essay arguing why digital ethics and cybersecurity are crucial for students.",
            deadline: "24 Juli 2026, 15:00 WIB",
            status: "SELESAI",
          },
        ]);
      }
    } catch (err) {
      console.error("Gagal memuat daftar tugas siswa:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = tugasList.filter((t) => {
    const isKumpul = sudahKumpulMap[t.id];
    if (filterTab === "AKTIF") return t.status === "AKTIF" && !isKumpul;
    if (filterTab === "SELESAI") return isKumpul || t.status === "SELESAI";
    return true;
  });

  async function handleKirimTugas(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTugas) return;
    setSubmitting(true);

    // Simulasi pengiriman form tugas siswa
    setTimeout(() => {
      setSudahKumpulMap((prev) => ({ ...prev, [selectedTugas.id]: true }));
      setSelectedTugas(null);
      setJawabanTeks("");
      setFileName("");
      setSubmitting(false);
      alert("Tugas Anda berhasil diserahkan kepada guru!");
    }, 600);
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-navy-900 text-white shadow-xs">
              <FileText size={19} />
            </span>
            <h1 className="font-display text-2xl font-bold tracking-tight text-navy-950 md:text-3xl">
              Tugas &amp; Penugasan KBM
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Daftar tugas mandiri, instruksi pengerjaan, dan pengumpulan tugas kelas {currentUser?.jabatan?.split("(")[0] || "X IPA 1"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadData(true)}
            disabled={refreshing || loading}
            className="text-xs h-9 gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin text-navy-600" : ""} />
            <span>Muat Ulang</span>
          </Button>

          {/* Tab Filters */}
          <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-2xs">
            <button
              onClick={() => setFilterTab("SEMUA")}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer",
                filterTab === "SEMUA" ? "bg-navy-900 text-white" : "text-slate-600 hover:bg-slate-100"
              )}
            >
              Semua ({tugasList.length})
            </button>
            <button
              onClick={() => setFilterTab("AKTIF")}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer",
                filterTab === "AKTIF" ? "bg-navy-900 text-white" : "text-slate-600 hover:bg-slate-100"
              )}
            >
              Perlu Dikerjakan
            </button>
            <button
              onClick={() => setFilterTab("SELESAI")}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer",
                filterTab === "SELESAI" ? "bg-navy-900 text-white" : "text-slate-600 hover:bg-slate-100"
              )}
            >
              Selesai / Terkumpul
            </button>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <Card key={`skel-tugas-${idx}`} className="border-border bg-white shadow-xs p-5 animate-pulse space-y-4">
              <div className="flex justify-between">
                <div className="h-5 w-28 bg-slate-200 rounded"></div>
                <div className="h-5 w-20 bg-slate-200 rounded"></div>
              </div>
              <div className="space-y-2">
                <div className="h-5 w-3/4 bg-slate-200 rounded"></div>
                <div className="h-3.5 w-full bg-slate-100 rounded"></div>
                <div className="h-3.5 w-2/3 bg-slate-100 rounded"></div>
              </div>
              <div className="h-8 w-full bg-slate-100 rounded-xl pt-2"></div>
            </Card>
          ))
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-500 bg-white border border-dashed rounded-2xl">
            <FolderOpen className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-slate-700">Tidak ada penugasan pada kategori ini</p>
            <p className="text-xs text-slate-400">Seluruh tugas Anda telah diselesaikan dengan baik!</p>
          </div>
        ) : (
          filtered.map((t) => {
            const isKumpul = sudahKumpulMap[t.id];
            const mapelNama = t.mata_pelajaran?.nama || t.mapel || "Mata Pelajaran";
            const guruNama = t.guru?.nama || t.guruNama || "Dewan Guru";

            return (
              <Card key={t.id} className="border-border bg-white shadow-xs hover:border-navy-300 transition-all flex flex-col justify-between">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="outline" className="text-xs font-semibold bg-slate-50 text-slate-700">
                      {mapelNama}
                    </Badge>

                    {isKumpul ? (
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-semibold gap-1">
                        <CheckCircle2 size={12} /> Terkumpul
                      </Badge>
                    ) : t.status === "SELESAI" ? (
                      <Badge className="bg-slate-100 text-slate-600 text-xs">Selesai</Badge>
                    ) : (
                      <Badge className="bg-amber-50 text-amber-800 border-amber-300 text-xs font-semibold gap-1">
                        <Clock size={12} /> Belum Kumpul
                      </Badge>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-navy-950 leading-snug">{t.judul}</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">{t.deskripsi}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>Guru: {guruNama}</span>
                    <span className="flex items-center gap-1 font-semibold text-rose-600">
                      <Clock size={12} /> {t.deadline}
                    </span>
                  </div>
                </CardContent>

                <div className="border-t border-slate-100 p-4 bg-slate-50/50 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    {isKumpul ? "Sudah diserahkan" : "Format: PDF / Dokumen"}
                  </span>

                  {isKumpul ? (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled
                      className="h-8 text-xs gap-1.5 border-emerald-200 bg-emerald-50 text-emerald-800"
                    >
                      <Check size={14} /> Terkirim
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => setSelectedTugas(t)}
                      className="h-8 bg-navy-900 hover:bg-navy-800 text-white rounded-xl text-xs gap-1.5 shadow-2xs font-semibold cursor-pointer"
                    >
                      <Upload size={13} />
                      Kumpulkan Tugas
                    </Button>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* MODAL KUMPULKAN TUGAS */}
      {selectedTugas && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-fade-up space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display text-base font-bold text-navy-950 flex items-center gap-2">
                  <Upload size={18} className="text-navy-900" />
                  Kumpulkan Tugas KBM
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedTugas.mata_pelajaran?.nama || selectedTugas.mapel || "Mapel"} &bull; {selectedTugas.judul}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTugas(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleKirimTugas} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Petunjuk Tugas dari Guru:</label>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 leading-relaxed text-xs">
                  {selectedTugas.deskripsi}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Unggah Berkas Jawaban (PDF / Word / Foto)</label>
                <div
                  onClick={() => setFileName("lembar_jawaban_tugas.pdf")}
                  className="border-2 border-dashed border-slate-300 rounded-xl p-5 text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <Upload size={24} className="mx-auto text-slate-400 mb-1" />
                  <p className="font-medium text-xs text-navy-950">
                    {fileName ? (
                      <span className="text-emerald-700 font-semibold">{fileName}</span>
                    ) : (
                      "Pilih file dari perangkat Anda"
                    )}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Maksimum ukuran file: 10 MB</p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Catatan Tambahan untuk Guru (Opsional)</label>
                <textarea
                  rows={2}
                  value={jawabanTeks}
                  onChange={(e) => setJawabanTeks(e.target.value)}
                  placeholder="Tuliskan catatan kepada guru jika ada..."
                  className="w-full rounded-xl border border-input bg-white p-2.5 text-xs text-slate-700 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedTugas(null)}
                  disabled={submitting}
                  className="rounded-xl text-xs"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={submitting}
                  className="bg-navy-900 text-white hover:bg-navy-800 rounded-xl text-xs shadow-xs gap-1.5"
                >
                  <Send size={13} />
                  {submitting ? "Mengirim..." : "Serahkan Tugas Sekarang"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
