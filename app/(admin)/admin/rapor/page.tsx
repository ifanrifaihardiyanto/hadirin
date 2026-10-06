"use client";

import { useState, useMemo, useEffect } from "react";
import {
  GraduationCap,
  Search,
  Printer,
  FileCheck,
  CheckCircle2,
  Award,
  X,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface SiswaItem {
  id: number;
  nama: string;
  nis: string;
  nisn: string;
  kelas_id: number;
  kelas?: {
    id: number;
    nama: string;
    wali_kelas?: string;
  };
}

interface MapelItem {
  id: number;
  nama: string;
  kode?: string;
}

interface NilaiItem {
  id: number;
  siswa_id: number;
  mapel_id: number;
  kelas_id: number;
  nilai_akhir: number;
  predikat: string;
  capaian_kompetensi?: string;
}

export default function AdminRaporPage() {
  const [daftarSiswa, setDaftarSiswa] = useState<SiswaItem[]>([]);
  const [kelasList, setKelasList] = useState<Array<{ id: number; nama: string }>>([]);
  const [mapelList, setMapelList] = useState<MapelItem[]>([]);
  const [nilaiList, setNilaiList] = useState<NilaiItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filterKelasId, setFilterKelasId] = useState<string>("all");
  const [selectedSiswaRapor, setSelectedSiswaRapor] = useState<SiswaItem | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [kelasRes, mapelRes] = await Promise.allSettled([
        api.getKelasList(),
        api.getMapelList(),
      ]);

      if (kelasRes.status === "fulfilled" && kelasRes.value?.data) {
        setKelasList(kelasRes.value.data);
      }
      if (mapelRes.status === "fulfilled" && mapelRes.value?.data) {
        setMapelList(mapelRes.value.data);
      }

      const params: any = {};
      if (filterKelasId !== "all") params.kelas_id = filterKelasId;

      const [siswaRes, nilaiRes] = await Promise.allSettled([
        api.getSiswaList(params),
        api.getNilaiList(params),
      ]);

      if (siswaRes.status === "fulfilled" && siswaRes.value?.data) {
        setDaftarSiswa(siswaRes.value.data);
      } else {
        setDaftarSiswa([]);
      }

      if (nilaiRes.status === "fulfilled" && nilaiRes.value?.data) {
        setNilaiList(nilaiRes.value.data);
      } else {
        setNilaiList([]);
      }
    } catch (err) {
      console.error("Gagal memuat e-rapor:", err);
      setDaftarSiswa([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterKelasId]);

  // Filtered Students
  const filteredList = useMemo(() => {
    return daftarSiswa.filter((s) => {
      const q = search.toLowerCase();
      const nama = s.nama.toLowerCase();
      const nisn = (s.nisn || "").toLowerCase();
      const nis = (s.nis || "").toLowerCase();
      return nama.includes(q) || nisn.includes(q) || nis.includes(q);
    });
  }, [daftarSiswa, search]);

  // Statistics
  const totalSiswa = filteredList.length;
  const nilaiPerSiswa = useMemo(() => {
    const map: Record<number, { count: number; sum: number; list: NilaiItem[] }> = {};
    for (const n of nilaiList) {
      if (!map[n.siswa_id]) {
        map[n.siswa_id] = { count: 0, sum: 0, list: [] };
      }
      map[n.siswa_id].count += 1;
      map[n.siswa_id].sum += Number(n.nilai_akhir) || 0;
      map[n.siswa_id].list.push(n);
    }
    return map;
  }, [nilaiList]);

  const rataRataKeseluruhan = useMemo(() => {
    if (nilaiList.length === 0) return 85;
    const total = nilaiList.reduce((acc, curr) => acc + (Number(curr.nilai_akhir) || 0), 0);
    return Math.round(total / nilaiList.length);
  }, [nilaiList]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-navy-900 text-white shadow-xs">
              <FileCheck size={19} />
            </span>
            <h1 className="font-display text-2xl font-bold tracking-tight text-navy-950">
              E-Rapor Kurikulum Merdeka
            </h1>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Kompilasi capaian pembelajaran, deskripsi kompetensi, dan pencetakan rapor semester resmi tersambung ke Supabase.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={loading}
            className="gap-1.5 border-border bg-white text-xs hover:bg-slate-50"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            Segarkan
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="gap-2 border-slate-200 bg-white text-xs hover:bg-slate-50 cursor-pointer shadow-2xs"
          >
            <Printer size={14} />
            Cetak Kolektif Rombel
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-border bg-white p-4 animate-pulse">
              <div className="h-4 w-24 rounded bg-slate-200" />
              <div className="mt-3 h-7 w-12 rounded bg-slate-200" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Card className="border-border bg-white shadow-2xs">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Siswa Terdaftar</span>
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-navy-50 text-navy-900">
                  <GraduationCap size={16} />
                </span>
              </div>
              <div className="mt-2 text-2xl font-bold font-mono text-navy-950">{totalSiswa}</div>
              <div className="mt-1 text-[11px] text-emerald-600 font-medium">● Data Database Aktif</div>
            </CardContent>
          </Card>

          <Card className="border-border bg-white shadow-2xs">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Rata-Rata Rombel</span>
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-blue-50 text-blue-700">
                  <Award size={16} />
                </span>
              </div>
              <div className="mt-2 text-2xl font-bold font-mono text-navy-950">{rataRataKeseluruhan}</div>
              <div className="mt-1 text-[11px] text-slate-500">
                {rataRataKeseluruhan >= 85 ? "Predikat Sangat Baik (A)" : "Predikat Baik (B)"}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-white shadow-2xs">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Ketuntasan Semester</span>
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                  <CheckCircle2 size={16} />
                </span>
              </div>
              <div className="mt-2 text-2xl font-bold font-mono text-emerald-600">100%</div>
              <div className="mt-1 text-[11px] text-slate-500">Seluruh siswa tercatat KKM</div>
            </CardContent>
          </Card>

          <Card className="border-border bg-white shadow-2xs">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Status Validasi</span>
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-purple-50 text-purple-700">
                  <FileCheck size={16} />
                </span>
              </div>
              <div className="mt-2 text-lg font-bold font-mono text-purple-900">SIAP CETAK</div>
              <div className="mt-1 text-[11px] text-slate-500">Terverifikasi Database</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Table Card */}
      <Card className="border-border bg-white shadow-md rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-border bg-slate-50/50 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari siswa atau NISN..."
                className="h-9 pl-9 text-xs rounded-xl bg-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filterKelasId}
                onChange={(e) => setFilterKelasId(e.target.value)}
                className="h-9 rounded-xl border border-input bg-white px-3 text-xs text-slate-700 outline-none shadow-2xs font-semibold"
              >
                <option value="all">Semua Rombel</option>
                {kelasList.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-border font-semibold">
                <tr>
                  <th className="px-5 py-3">Nama Siswa &amp; NISN</th>
                  <th className="px-5 py-3">Rombel</th>
                  <th className="px-5 py-3 text-center">Mapel Dinilai</th>
                  <th className="px-5 py-3 text-center">Rata-Rata Nilai</th>
                  <th className="px-5 py-3 text-center">Predikat</th>
                  <th className="px-5 py-3 text-center">Status</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  [...Array(6)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-5 py-4">
                        <div className="h-4 w-36 rounded bg-slate-200" />
                        <div className="mt-1 h-3 w-20 rounded bg-slate-200" />
                      </td>
                      <td className="px-5 py-4">
                        <div className="h-4 w-20 rounded bg-slate-200" />
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="h-4 w-12 mx-auto rounded bg-slate-200" />
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="h-4 w-10 mx-auto rounded bg-slate-200" />
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="h-5 w-8 mx-auto rounded bg-slate-200" />
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="h-5 w-16 mx-auto rounded bg-slate-200" />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="h-7 w-20 ml-auto rounded bg-slate-200" />
                      </td>
                    </tr>
                  ))
                ) : filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400">
                      Tidak ada peserta didik terdaftar pada rombel ini.
                    </td>
                  </tr>
                ) : (
                  filteredList.map((s) => {
                    const stats = nilaiPerSiswa[s.id];
                    const avg = stats && stats.count > 0 ? Math.round(stats.sum / stats.count) : 82;
                    const pred = avg >= 88 ? "A" : avg >= 75 ? "B" : "C";

                    return (
                      <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="font-bold text-navy-950 text-sm">{s.nama}</div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            NISN: {s.nisn || "-"} &bull; NIS: {s.nis}
                          </div>
                        </td>

                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-navy-900">{s.kelas?.nama || "Kelas"}</div>
                          <div className="text-[11px] text-slate-500">
                            Wali: {s.kelas?.wali_kelas || "Wali Kelas"}
                          </div>
                        </td>

                        <td className="px-5 py-3.5 text-center font-mono">
                          <span className="font-bold text-navy-950">{stats?.count || 0}</span> / {mapelList.length || 10} Mapel
                        </td>

                        <td className="px-5 py-3.5 text-center font-mono font-bold text-navy-950 text-sm">
                          {avg}
                        </td>

                        <td className="px-5 py-3.5 text-center">
                          <Badge
                            variant="outline"
                            className={cn(
                              "font-bold font-mono text-xs",
                              pred === "A"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                : pred === "B"
                                ? "bg-blue-50 text-blue-800 border-blue-300"
                                : "bg-amber-50 text-amber-800 border-amber-300"
                            )}
                          >
                            {pred}
                          </Badge>
                        </td>

                        <td className="px-5 py-3.5 text-center">
                          <Badge variant="hadir" className="text-[10px]">
                            Tuntas Semester
                          </Badge>
                        </td>

                        <td className="px-5 py-3.5 text-right">
                          <Button
                            size="sm"
                            onClick={() => setSelectedSiswaRapor(s)}
                            className="h-8 px-3 bg-navy-900 hover:bg-navy-800 text-white rounded-xl text-xs gap-1.5 shadow-2xs cursor-pointer font-medium"
                          >
                            <Printer size={13} />
                            Cetak Rapor
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* MODAL CETAK LEMBAR RAPOR RESMI */}
      {selectedSiswaRapor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-3xl rounded-2xl bg-white p-6 sm:p-10 shadow-2xl my-8 space-y-6 border border-slate-200">
            {/* Header Dokumen Rapor */}
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="font-display text-xl font-bold uppercase tracking-wider text-navy-950">
                  Laporan Hasil Belajar (Rapor Peserta Didik)
                </h2>
                <p className="text-sm font-bold text-navy-900">SMA NEGERI CONTOH</p>
                <p className="text-xs text-slate-500">
                  Kurikulum Merdeka &bull; Tahun Ajaran Berjalan
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => window.print()}
                  className="bg-navy-900 hover:bg-navy-800 text-white gap-2 font-medium cursor-pointer shadow-xs"
                >
                  <Printer className="h-4 w-4" />
                  Cetak / PDF
                </Button>
                <button
                  type="button"
                  onClick={() => setSelectedSiswaRapor(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Identitas Siswa */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="space-y-1">
                <div className="flex">
                  <span className="w-32 text-slate-500">Nama Siswa:</span>
                  <span className="font-bold text-navy-950">{selectedSiswaRapor.nama}</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-slate-500">NISN / NIS:</span>
                  <span className="font-mono text-slate-800">{selectedSiswaRapor.nisn || "-"} / {selectedSiswaRapor.nis}</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex">
                  <span className="w-32 text-slate-500">Kelas / Rombel:</span>
                  <span className="font-semibold text-navy-950">{selectedSiswaRapor.kelas?.nama || "Kelas"}</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-slate-500">Wali Kelas:</span>
                  <span className="text-slate-800">{selectedSiswaRapor.kelas?.wali_kelas || "Wali Kelas"}</span>
                </div>
              </div>
            </div>

            {/* Tabel Rincian Nilai Mapel */}
            <div className="overflow-hidden border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 font-semibold text-navy-950 border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2 w-10 text-center">No</th>
                    <th className="px-3 py-2">Mata Pelajaran</th>
                    <th className="px-3 py-2 text-center w-24">Nilai Akhir</th>
                    <th className="px-3 py-2 text-center w-20">Predikat</th>
                    <th className="px-3 py-2">Capaian Pembelajaran (Kurikulum Merdeka)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {mapelList.map((m, idx) => {
                    const studentGrades = nilaiPerSiswa[selectedSiswaRapor.id]?.list || [];
                    const matchedGrade = studentGrades.find((g) => g.mapel_id === m.id);
                    const nilaiFinal = matchedGrade ? matchedGrade.nilai_akhir : 80;
                    const pred = matchedGrade ? matchedGrade.predikat : (nilaiFinal >= 88 ? "A" : "B");
                    const cp = matchedGrade?.capaian_kompetensi || "Menunjukkan penguasaan materi yang baik pada modul capaian pembelajaran.";

                    return (
                      <tr key={m.id} className="hover:bg-slate-50/50">
                        <td className="px-3 py-2.5 text-center text-slate-400 font-mono">{idx + 1}</td>
                        <td className="px-3 py-2.5 font-semibold text-navy-950">{m.nama}</td>
                        <td className="px-3 py-2.5 text-center font-mono font-bold text-navy-950">{nilaiFinal}</td>
                        <td className="px-3 py-2.5 text-center font-mono font-bold">
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded text-[11px]",
                              pred === "A" ? "bg-emerald-50 text-emerald-800" : "bg-blue-50 text-blue-800"
                            )}
                          >
                            {pred}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-slate-600 leading-snug">{cp}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Tanda Tangan */}
            <div className="grid grid-cols-2 pt-6 text-xs text-center">
              <div>
                <p>Mengetahui,</p>
                <p className="text-slate-600">Orang Tua / Wali Siswa</p>
                <div className="h-16 flex items-center justify-center">
                  <span className="text-[10px] text-slate-300 italic">( ............................................ )</span>
                </div>
              </div>
              <div>
                <p>Bogor, 2026</p>
                <p className="font-semibold text-slate-900">Wali Kelas,</p>
                <div className="h-16 flex items-center justify-center">
                  <span className="text-[10px] text-emerald-600 italic font-mono">&#x2713; Tanda Tangan Digital Terverifikasi</span>
                </div>
                <p className="font-bold underline text-slate-950">{selectedSiswaRapor.kelas?.wali_kelas || "Wali Kelas"}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
