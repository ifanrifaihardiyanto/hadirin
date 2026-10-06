"use client";

import * as XLSX from "xlsx";
import { useState, useMemo, useEffect } from "react";
import {
  Award,
  Search,
  Printer,
  Download,
  CheckCircle2,
  Edit2,
  X,
  TrendingUp,
  GraduationCap,
  RefreshCw,
  FileSpreadsheet,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface NilaiBackendItem {
  id: number;
  siswa_id: number;
  mapel_id: number;
  kelas_id: number;
  nilai_tugas: number;
  nilai_formatif: number;
  nilai_sumatif: number;
  nilai_akhir: number;
  predikat: string;
  capaian_kompetensi?: string;
  siswa?: {
    id: number;
    nama: string;
    nisn: string;
    nis: string;
  };
  mapel?: {
    id: number;
    nama: string;
  };
  kelas?: {
    id: number;
    nama: string;
  };
}

export default function AdminNilaiPage() {
  const [daftarNilai, setDaftarNilai] = useState<NilaiBackendItem[]>([]);
  const [kelasList, setKelasList] = useState<Array<{ id: number; nama: string }>>([]);
  const [mapelList, setMapelList] = useState<Array<{ id: number; nama: string }>>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filterKelasId, setFilterKelasId] = useState<string>("all");
  const [filterMapelId, setFilterMapelId] = useState<string>("all");

  // Edit Modal State
  const [editingItem, setEditingItem] = useState<NilaiBackendItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formEdit, setFormEdit] = useState({
    nilaiTugas: 80,
    nilaiFormatif: 80,
    nilaiSumatif: 80,
    capaianKompetensi: "",
  });

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
      if (filterMapelId !== "all") params.mapel_id = filterMapelId;

      const nilaiRes = await api.getNilaiList(params);
      if (nilaiRes && nilaiRes.data) {
        setDaftarNilai(nilaiRes.data);
      } else {
        setDaftarNilai([]);
      }
    } catch (err) {
      console.error("Gagal memuat buku nilai:", err);
      setDaftarNilai([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterKelasId, filterMapelId]);

  // Filtered List by search
  const filteredList = useMemo(() => {
    return daftarNilai.filter((n) => {
      const nama = n.siswa?.nama || "";
      const nisn = n.siswa?.nisn || n.siswa?.nis || "";
      const q = search.toLowerCase();
      return nama.toLowerCase().includes(q) || nisn.toLowerCase().includes(q);
    });
  }, [daftarNilai, search]);

  // Statistics
  const totalSiswa = filteredList.length;
  const rataRata =
    totalSiswa > 0
      ? Math.round(
          filteredList.reduce((acc, curr) => acc + (Number(curr.nilai_akhir) || 0), 0) /
            totalSiswa
        )
      : 0;
  const tertinggi =
    totalSiswa > 0
      ? Math.max(...filteredList.map((n) => Number(n.nilai_akhir) || 0))
      : 0;
  const tuntasKKM = filteredList.filter((n) => (Number(n.nilai_akhir) || 0) >= 75).length;

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingItem) return;

    setSubmitting(true);
    try {
      await api.saveNilai({
        siswa_id: editingItem.siswa_id,
        mapel_id: editingItem.mapel_id,
        kelas_id: editingItem.kelas_id,
        nilai_tugas: formEdit.nilaiTugas,
        nilai_formatif: formEdit.nilaiFormatif,
        nilai_sumatif: formEdit.nilaiSumatif,
        capaian_kompetensi: formEdit.capaianKompetensi || null,
      });

      setEditingItem(null);
      await fetchData();
    } catch (err) {
      console.error("Gagal menyimpan nilai:", err);
      alert("Gagal memperbarui nilai siswa.");
    } finally {
      setSubmitting(false);
    }
  }

  function unduhExcel() {
    const rows = filteredList.map((n, idx) => ({
      No: idx + 1,
      "Nama Siswa": n.siswa?.nama || "Siswa",
      NISN: n.siswa?.nisn || n.siswa?.nis || "-",
      Kelas: n.kelas?.nama || "-",
      "Mata Pelajaran": n.mapel?.nama || "-",
      "Tugas (20%)": n.nilai_tugas,
      "Formatif (40%)": n.nilai_formatif,
      "Sumatif (40%)": n.nilai_sumatif,
      "Nilai Akhir": n.nilai_akhir,
      Predikat: n.predikat,
      "Capaian Kompetensi": n.capaian_kompetensi || "-",
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leger Nilai");
    XLSX.writeFile(wb, `Buku_Nilai_Siswa_${new Date().toISOString().split("T")[0]}.xlsx`);
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-navy-900 text-white shadow-xs">
              <Award size={19} />
            </span>
            <h1 className="font-display text-2xl font-bold tracking-tight text-navy-950">
              Buku Nilai Siswa (Formatif &amp; Sumatif)
            </h1>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Rekapitulasi penilaian harian, tugas mandiri, dan asesmen sumatif Kurikulum Merdeka tersambung ke Supabase.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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
            size="sm"
            onClick={unduhExcel}
            disabled={loading || filteredList.length === 0}
            className="gap-1.5 bg-emerald-700 text-white hover:bg-emerald-800 text-xs shadow-xs"
          >
            <FileSpreadsheet size={14} />
            Unduh Excel (.xlsx)
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="gap-2 border-slate-200 bg-white text-xs hover:bg-slate-50 cursor-pointer shadow-2xs"
          >
            <Printer size={14} />
            Cetak Lembar Nilai
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
                <span className="text-xs font-medium text-slate-500">Rata-Rata Nilai</span>
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-blue-50 text-blue-700">
                  <TrendingUp size={16} />
                </span>
              </div>
              <div className="mt-2 text-2xl font-bold font-mono text-navy-950">{rataRata}</div>
              <div className="mt-1 text-[11px] text-slate-500">Skala 0 - 100</div>
            </CardContent>
          </Card>

          <Card className="border-border bg-white shadow-2xs">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Ketuntasan KKM (&ge;75)</span>
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                  <CheckCircle2 size={16} />
                </span>
              </div>
              <div className="mt-2 text-2xl font-bold font-mono text-emerald-600">
                {totalSiswa > 0 ? Math.round((tuntasKKM / totalSiswa) * 100) : 0}%
              </div>
              <div className="mt-1 text-[11px] text-slate-500">{tuntasKKM} dari {totalSiswa} siswa tuntas</div>
            </CardContent>
          </Card>

          <Card className="border-border bg-white shadow-2xs">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Nilai Tertinggi</span>
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-purple-50 text-purple-700">
                  <Award size={16} />
                </span>
              </div>
              <div className="mt-2 text-2xl font-bold font-mono text-navy-950">{tertinggi}</div>
              <div className="mt-1 text-[11px] text-slate-500">Peringkat 1 Kelas</div>
            </CardContent>
          </Card>

          <Card className="border-border bg-white shadow-2xs">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Total Terdata</span>
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-navy-50 text-navy-900">
                  <GraduationCap size={16} />
                </span>
              </div>
              <div className="mt-2 text-2xl font-bold font-mono text-navy-950">{totalSiswa}</div>
              <div className="mt-1 text-[11px] text-slate-500">Peserta Didik</div>
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
                placeholder="Cari nama siswa atau NISN..."
                className="h-9 pl-9 text-xs rounded-xl bg-white"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filterMapelId}
                onChange={(e) => setFilterMapelId(e.target.value)}
                className="h-9 rounded-xl border border-input bg-white px-3 text-xs text-slate-700 outline-none shadow-2xs font-semibold"
              >
                <option value="all">Semua Mapel</option>
                {mapelList.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nama}
                  </option>
                ))}
              </select>

              <select
                value={filterKelasId}
                onChange={(e) => setFilterKelasId(e.target.value)}
                className="h-9 rounded-xl border border-input bg-white px-3 text-xs text-slate-700 outline-none shadow-2xs"
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
                  <th className="px-5 py-3">Rombel &amp; Mapel</th>
                  <th className="px-5 py-3 text-center">Tugas (20%)</th>
                  <th className="px-5 py-3 text-center">Formatif (40%)</th>
                  <th className="px-5 py-3 text-center">Sumatif (40%)</th>
                  <th className="px-5 py-3 text-center">Nilai Akhir</th>
                  <th className="px-5 py-3 text-center">Predikat</th>
                  <th className="px-5 py-3">Deskripsi Capaian Kompetensi</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-5 py-4">
                        <div className="h-4 w-36 rounded bg-slate-200" />
                        <div className="mt-1 h-3 w-20 rounded bg-slate-200" />
                      </td>
                      <td className="px-5 py-4">
                        <div className="h-4 w-28 rounded bg-slate-200" />
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="h-4 w-10 mx-auto rounded bg-slate-200" />
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="h-4 w-10 mx-auto rounded bg-slate-200" />
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="h-4 w-10 mx-auto rounded bg-slate-200" />
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="h-6 w-12 mx-auto rounded bg-slate-200" />
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="h-5 w-8 mx-auto rounded bg-slate-200" />
                      </td>
                      <td className="px-5 py-4">
                        <div className="h-4 w-40 rounded bg-slate-200" />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="h-6 w-12 ml-auto rounded bg-slate-200" />
                      </td>
                    </tr>
                  ))
                ) : filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-10 text-center text-slate-400">
                      Tidak ada catatan nilai pada mata pelajaran &amp; rombel ini.
                    </td>
                  </tr>
                ) : (
                  filteredList.map((n) => (
                    <tr key={n.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-navy-950 text-sm">{n.siswa?.nama || "Siswa"}</div>
                        <div className="text-[11px] text-slate-400 font-mono">NISN: {n.siswa?.nisn || n.siswa?.nis || "-"}</div>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="font-medium text-slate-700">{n.kelas?.nama || "Kelas"}</div>
                        <div className="text-[11px] text-slate-500">{n.mapel?.nama || "Mapel"}</div>
                      </td>

                      <td className="px-5 py-3.5 font-mono text-center font-semibold text-slate-800">
                        {n.nilai_tugas}
                      </td>

                      <td className="px-5 py-3.5 font-mono text-center font-semibold text-slate-800">
                        {n.nilai_formatif}
                      </td>

                      <td className="px-5 py-3.5 font-mono text-center font-semibold text-slate-800">
                        {n.nilai_sumatif}
                      </td>

                      <td className="px-5 py-3.5 font-mono text-center">
                        <span
                          className={cn(
                            "px-2.5 py-1 rounded-lg font-bold text-sm",
                            n.nilai_akhir >= 88
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : n.nilai_akhir >= 75
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          )}
                        >
                          {n.nilai_akhir}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-center">
                        <Badge
                          variant="outline"
                          className={cn(
                            "font-bold font-mono text-xs",
                            n.predikat === "A"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                              : n.predikat === "B"
                              ? "bg-blue-50 text-blue-800 border-blue-300"
                              : "bg-amber-50 text-amber-800 border-amber-300"
                          )}
                        >
                          {n.predikat}
                        </Badge>
                      </td>

                      <td className="px-5 py-3.5 max-w-xs text-[11px] text-slate-600 leading-snug">
                        {n.capaian_kompetensi || "Menunjukkan penguasaan materi yang baik pada modul capaian pembelajaran."}
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingItem(n);
                            setFormEdit({
                              nilaiTugas: Number(n.nilai_tugas),
                              nilaiFormatif: Number(n.nilai_formatif),
                              nilaiSumatif: Number(n.nilai_sumatif),
                              capaianKompetensi: n.capaian_kompetensi || "",
                            });
                          }}
                          className="h-7 px-2 text-xs border-slate-200 gap-1 hover:bg-slate-100"
                        >
                          <Edit2 size={12} />
                          Ubah
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* MODAL UBAH NILAI */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-fade-up space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display text-base font-bold text-navy-950 flex items-center gap-2">
                <Edit2 size={16} className="text-navy-900" />
                Ubah Nilai Siswa
              </h3>
              <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 text-xs">
              <div className="font-bold text-navy-950">{editingItem.siswa?.nama || "Siswa"}</div>
              <div className="text-slate-500 font-mono text-[11px]">
                {editingItem.kelas?.nama} &bull; {editingItem.mapel?.nama}
              </div>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Nilai Tugas (20%)</label>
                <Input
                  required
                  type="number"
                  min={0}
                  max={100}
                  value={formEdit.nilaiTugas}
                  onChange={(e) => setFormEdit({ ...formEdit, nilaiTugas: Number(e.target.value) })}
                  className="h-9 font-mono text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Nilai Asesmen Formatif (40%)</label>
                <Input
                  required
                  type="number"
                  min={0}
                  max={100}
                  value={formEdit.nilaiFormatif}
                  onChange={(e) => setFormEdit({ ...formEdit, nilaiFormatif: Number(e.target.value) })}
                  className="h-9 font-mono text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Nilai Asesmen Sumatif (40%)</label>
                <Input
                  required
                  type="number"
                  min={0}
                  max={100}
                  value={formEdit.nilaiSumatif}
                  onChange={(e) => setFormEdit({ ...formEdit, nilaiSumatif: Number(e.target.value) })}
                  className="h-9 font-mono text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Catatan Capaian Kompetensi (Opsional)</label>
                <textarea
                  rows={2}
                  value={formEdit.capaianKompetensi}
                  onChange={(e) => setFormEdit({ ...formEdit, capaianKompetensi: e.target.value })}
                  placeholder="Catatan kemajuan belajar siswa..."
                  className="w-full rounded-xl border border-input bg-white p-2.5 text-xs text-slate-700 outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingItem(null)}
                  className="rounded-xl text-xs"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={submitting}
                  className="bg-navy-900 text-white hover:bg-navy-800 rounded-xl text-xs shadow-xs"
                >
                  {submitting ? "Menyimpan..." : "Simpan Nilai"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
