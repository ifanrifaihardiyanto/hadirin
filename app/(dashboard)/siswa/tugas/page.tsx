"use client";

import { useState } from "react";
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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore, HARI_INI, type Tugas } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function SiswaTugasPage() {
  const { daftarTugas, currentUser } = useStore();
  const [filterTab, setFilterTab] = useState<"SEMUA" | "AKTIF" | "SELESAI">("SEMUA");
  const [selectedTugas, setSelectedTugas] = useState<Tugas | null>(null);
  const [jawabanTeks, setJawabanTeks] = useState("");
  const [sudahKumpulMap, setSudahKumpulMap] = useState<Record<string, boolean>>({
    "t-1": true,
  });

  const filtered = daftarTugas.filter((t) => {
    if (filterTab === "AKTIF") return t.status === "AKTIF" && !sudahKumpulMap[t.id];
    if (filterTab === "SELESAI") return sudahKumpulMap[t.id] || t.status === "SELESAI";
    return true;
  });

  function handleKirimTugas(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTugas) return;
    setSudahKumpulMap((prev) => ({ ...prev, [selectedTugas.id]: true }));
    setSelectedTugas(null);
    setJawabanTeks("");
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-1">
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

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-1 shadow-2xs">
          <button
            onClick={() => setFilterTab("SEMUA")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer",
              filterTab === "SEMUA" ? "bg-navy-900 text-white" : "text-slate-600 hover:bg-slate-100"
            )}
          >
            Semua ({daftarTugas.length})
          </button>
          <button
            onClick={() => setFilterTab("AKTIF")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer",
              filterTab === "AKTIF" ? "bg-navy-900 text-white" : "text-slate-600 hover:bg-slate-100"
            )}
          >
            Perlu Dikerjakan
          </button>
          <button
            onClick={() => setFilterTab("SELESAI")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer",
              filterTab === "SELESAI" ? "bg-navy-900 text-white" : "text-slate-600 hover:bg-slate-100"
            )}
          >
            Selesai / Terkumpul
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((t) => {
          const isKumpul = sudahKumpulMap[t.id];
          return (
            <Card key={t.id} className="border-border bg-white shadow-xs hover:border-navy-300 transition-all flex flex-col justify-between">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="outline" className="text-xs font-semibold bg-slate-50 text-slate-700">
                    {t.mapel}
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
                  <span>Guru: {t.guruNama}</span>
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
        })}
      </div>

      {/* MODAL KUMPULKAN TUGAS */}
      {selectedTugas && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-fade-up space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display text-base font-bold text-navy-950 flex items-center gap-2">
                  <Upload size={18} className="text-navy-900" />
                  Kumpulkan Tugas KBM
                </h3>
                <p className="text-xs text-slate-500">{selectedTugas.mapel} &bull; {selectedTugas.judul}</p>
              </div>
              <button onClick={() => setSelectedTugas(null)} className="text-slate-400 hover:text-slate-600">
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
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-5 text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                  <Upload size={24} className="mx-auto text-slate-400 mb-1" />
                  <p className="font-medium text-xs text-navy-950">Pilih file dari perangkat Anda</p>
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
                  className="rounded-xl text-xs"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-navy-900 text-white hover:bg-navy-800 rounded-xl text-xs shadow-xs gap-1.5"
                >
                  <Send size={13} />
                  Serahkan Tugas Sekarang
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
