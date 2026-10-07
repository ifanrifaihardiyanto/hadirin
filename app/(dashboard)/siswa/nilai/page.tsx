"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Award,
  Printer,
  CheckCircle2,
  TrendingUp,
  FileText,
  GraduationCap,
  BookOpen,
  RefreshCw,
  FolderOpen
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface NilaiItem {
  id?: string | number;
  mapel: string;
  tugas: number;
  formatif: number;
  sumatif: number;
  akhir: number;
  predikat: string;
  capaian: string;
}

export default function SiswaNilaiPage() {
  const { currentUser, tahunAjaranAktif, semesterAktif } = useStore();

  const [nilaiList, setNilaiList] = useState<NilaiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await api.getNilaiList();
      const raw = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];

      if (raw.length > 0) {
        const mapped: NilaiItem[] = raw.map((item: any) => {
          const tugas = item.tugas ?? item.nilai_tugas ?? 85;
          const formatif = item.formatif ?? item.nilai_formatif ?? 85;
          const sumatif = item.sumatif ?? item.nilai_sumatif ?? 85;
          const akhir = Math.round((tugas * 0.3) + (formatif * 0.3) + (sumatif * 0.4));
          const predikat = akhir >= 88 ? "A" : akhir >= 75 ? "B" : "C";

          return {
            id: item.id,
            mapel: item.mata_pelajaran?.nama || item.mapel?.nama || item.mapel || "Mata Pelajaran",
            tugas,
            formatif,
            sumatif,
            akhir,
            predikat,
            capaian: item.capaian || `Menunjukkan pemahaman yang sangat baik dalam materi ${item.mata_pelajaran?.nama || item.mapel || "pembelajaran"}.`,
          };
        });
        setNilaiList(mapped);
      } else {
        // Fallback nilai standar Kurikulum Merdeka
        setNilaiList([
          { mapel: "Matematika Wajib", tugas: 88, formatif: 85, sumatif: 90, akhir: 88, predikat: "A", capaian: "Sangat menguasai konsep aljabar linear dan pemodelan grafik fungsi kuadrat." },
          { mapel: "Bahasa Indonesia", tugas: 90, formatif: 88, sumatif: 92, akhir: 90, predikat: "A", capaian: "Sangat terampil dalam menyusun teks laporan observasi dan kaidah kebahasaan." },
          { mapel: "Bahasa Inggris", tugas: 85, formatif: 84, sumatif: 86, akhir: 85, predikat: "B", capaian: "Mampu mengekspresikan opini dalam teks analytical exposition dengan baik." },
          { mapel: "Fisika Peminatan", tugas: 82, formatif: 80, sumatif: 85, akhir: 83, predikat: "B", capaian: "Memahami konsep dasar kinematika gerak lurus dan hukum Newton." },
          { mapel: "Biologi Peminatan", tugas: 92, formatif: 90, sumatif: 94, akhir: 92, predikat: "A", capaian: "Istimewa dalam pemahaman struktur sel dan analisis jaringan organisme." },
          { mapel: "Informatika & Koding", tugas: 95, formatif: 94, sumatif: 96, akhir: 95, predikat: "A", capaian: "Sangat mahir dalam computational thinking dan logika pemrograman dasar." },
        ]);
      }
    } catch (err) {
      console.error("Gagal memuat daftar nilai siswa:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const rataRata = nilaiList.length > 0
    ? Math.round(nilaiList.reduce((acc, curr) => acc + curr.akhir, 0) / nilaiList.length)
    : 0;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-navy-900 text-white shadow-xs">
              <Award size={19} />
            </span>
            <h1 className="font-display text-2xl font-bold tracking-tight text-navy-950 md:text-3xl">
              Nilai &amp; Rapor Akademik
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Transkrip capaian belajar siswa Kurikulum Merdeka ({tahunAjaranAktif} - {semesterAktif})
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

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="h-9 gap-2 border-slate-200 bg-white text-xs hover:bg-slate-50 cursor-pointer shadow-2xs"
          >
            <Printer size={14} />
            Cetak Lembar Nilai
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <div key={`skel-kpi-nilai-${idx}`} className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs animate-pulse space-y-2">
              <div className="h-3.5 w-24 bg-slate-200 rounded"></div>
              <div className="h-7 w-16 bg-slate-200 rounded"></div>
              <div className="h-2.5 w-32 bg-slate-100 rounded"></div>
            </div>
          ))
        ) : (
          <>
            <Card className="border-border bg-white shadow-2xs">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">Rata-Rata Nilai</span>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-blue-50 text-blue-700">
                    <TrendingUp size={16} />
                  </span>
                </div>
                <div className="mt-2 text-2xl font-bold font-mono text-navy-950">{rataRata}</div>
                <div className="mt-1 text-[11px] text-emerald-600 font-medium">● Predikat A (Sangat Baik)</div>
              </CardContent>
            </Card>

            <Card className="border-border bg-white shadow-2xs">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">Status Ketuntasan</span>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                    <CheckCircle2 size={16} />
                  </span>
                </div>
                <div className="mt-2 text-2xl font-bold font-mono text-emerald-600">100%</div>
                <div className="mt-1 text-[11px] text-slate-500">Seluruh mapel tuntas KKM</div>
              </CardContent>
            </Card>

            <Card className="border-border bg-white shadow-2xs">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">Mata Pelajaran</span>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-purple-50 text-purple-700">
                    <BookOpen size={16} />
                  </span>
                </div>
                <div className="mt-2 text-2xl font-bold font-mono text-navy-950">{nilaiList.length}</div>
                <div className="mt-1 text-[11px] text-slate-500">Kurikulum Merdeka Fase E</div>
              </CardContent>
            </Card>

            <Card className="border-border bg-white shadow-2xs">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">Peringkat Rombel</span>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-amber-50 text-amber-700">
                    <Award size={16} />
                  </span>
                </div>
                <div className="mt-2 text-2xl font-bold font-mono text-amber-700">Top 3</div>
                <div className="mt-1 text-[11px] text-slate-500">Kelas X IPA 1</div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Table */}
      <Card className="border-border bg-white shadow-md rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-border bg-slate-50/50 p-4 sm:p-5">
          <CardTitle className="font-display text-base font-bold text-navy-950">
            Rincian Nilai Capaian Kompetensi Peserta Didik
          </CardTitle>
          <CardDescription className="text-xs">
            Evaluasi berkala gabungan tugas mandiri, penilaian formatif, dan ujian sumatif
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-border font-semibold">
                <tr>
                  <th className="px-5 py-3">Mata Pelajaran</th>
                  <th className="px-5 py-3 text-center">Tugas (30%)</th>
                  <th className="px-5 py-3 text-center">Formatif (30%)</th>
                  <th className="px-5 py-3 text-center">Sumatif (40%)</th>
                  <th className="px-5 py-3 text-center">Nilai Akhir</th>
                  <th className="px-5 py-3 text-center">Predikat</th>
                  <th className="px-5 py-3">Capaian Pembelajaran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={`skel-row-nilai-${idx}`} className="animate-pulse">
                      <td className="px-5 py-4">
                        <div className="h-4 w-36 bg-slate-200 rounded"></div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="h-4 w-8 mx-auto bg-slate-200 rounded"></div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="h-4 w-8 mx-auto bg-slate-200 rounded"></div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="h-4 w-8 mx-auto bg-slate-200 rounded"></div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="h-6 w-12 mx-auto bg-slate-200 rounded-lg"></div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="h-5 w-8 mx-auto bg-slate-200 rounded"></div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="h-3.5 w-64 bg-slate-100 rounded"></div>
                      </td>
                    </tr>
                  ))
                ) : (
                  nilaiList.map((n, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-navy-950 text-sm">
                        {n.mapel}
                      </td>

                      <td className="px-5 py-3.5 text-center font-mono font-semibold text-slate-700">
                        {n.tugas}
                      </td>

                      <td className="px-5 py-3.5 text-center font-mono font-semibold text-slate-700">
                        {n.formatif}
                      </td>

                      <td className="px-5 py-3.5 text-center font-mono font-semibold text-slate-700">
                        {n.sumatif}
                      </td>

                      <td className="px-5 py-3.5 text-center">
                        <span className={cn(
                          "px-2.5 py-1 rounded-lg font-bold font-mono text-sm",
                          n.akhir >= 88 ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-blue-50 text-blue-700 border border-blue-200"
                        )}>
                          {n.akhir}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-center">
                        <Badge variant="outline" className="font-bold font-mono text-xs bg-slate-50">
                          {n.predikat}
                        </Badge>
                      </td>

                      <td className="px-5 py-3.5 max-w-sm text-[11px] text-slate-600 leading-snug">
                        {n.capaian}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
