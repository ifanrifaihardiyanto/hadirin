"use client";

import { useState, useMemo } from "react";
import {
  Award,
  Search,
  Printer,
  Download,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Edit2,
  Check,
  X,
  TrendingUp,
  GraduationCap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useStore, type NilaiSiswa } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function AdminNilaiPage() {
  const { daftarNilai, updateNilaiSiswa, daftarMapel, tahunAjaranAktif, semesterAktif } = useStore();

  const [search, setSearch] = useState("");
  const [filterKelas, setFilterKelas] = useState("SEMUA");
  const [filterMapel, setFilterMapel] = useState("Matematika Wajib");

  // Edit Modal State
  const [editingItem, setEditingItem] = useState<NilaiSiswa | null>(null);
  const [formEdit, setFormEdit] = useState({
    nilaiTugas: 80,
    nilaiFormatif: 80,
    nilaiSumatif: 80,
  });

  const kelasOptions = ["X IPA 1", "X IPA 2", "XI IPA 1", "XI IPA 2", "XII IPA 1", "XII IPS 1"];

  // Filtered List
  const filteredList = useMemo(() => {
    return daftarNilai.filter((n) => {
      const matchSearch =
        n.siswaNama.toLowerCase().includes(search.toLowerCase()) ||
        n.nisn.includes(search);
      const matchKelas = filterKelas === "SEMUA" || n.kelas === filterKelas;
      const matchMapel = filterMapel === "SEMUA" || n.mapel === filterMapel;
      return matchSearch && matchKelas && matchMapel;
    });
  }, [daftarNilai, search, filterKelas, filterMapel]);

  // Statistics
  const totalSiswa = filteredList.length;
  const rataRata = totalSiswa > 0 ? Math.round(filteredList.reduce((acc, curr) => acc + curr.nilaiAkhir, 0) / totalSiswa) : 0;
  const tertinggi = totalSiswa > 0 ? Math.max(...filteredList.map((n) => n.nilaiAkhir)) : 0;
  const tuntasKKM = filteredList.filter((n) => n.nilaiAkhir >= 75).length;

  function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingItem) return;

    updateNilaiSiswa(editingItem.id, formEdit.nilaiTugas, formEdit.nilaiFormatif, formEdit.nilaiSumatif);
    setEditingItem(null);
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
            Rekapitulasi penilaian harian, tugas mandiri, dan asesmen sumatif Kurikulum Merdeka ({tahunAjaranAktif} - {semesterAktif})
          </p>
        </div>

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

      {/* KPI Cards */}
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
              <span className="text-xs font-medium text-slate-500">Total Dinilai</span>
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-navy-50 text-navy-900">
                <GraduationCap size={16} />
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-navy-950">{totalSiswa}</div>
            <div className="mt-1 text-[11px] text-slate-500">Peserta Didik</div>
          </CardContent>
        </Card>
      </div>

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
                value={filterMapel}
                onChange={(e) => setFilterMapel(e.target.value)}
                className="h-9 rounded-xl border border-input bg-white px-3 text-xs text-slate-700 outline-none shadow-2xs font-semibold"
              >
                <option value="SEMUA">Semua Mapel</option>
                {daftarMapel.map((m) => (
                  <option key={m.id} value={m.nama}>
                    {m.nama}
                  </option>
                ))}
              </select>

              <select
                value={filterKelas}
                onChange={(e) => setFilterKelas(e.target.value)}
                className="h-9 rounded-xl border border-input bg-white px-3 text-xs text-slate-700 outline-none shadow-2xs"
              >
                <option value="SEMUA">Semua Rombel</option>
                {kelasOptions.map((k) => (
                  <option key={k} value={k}>
                    {k}
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
                  <th className="px-5 py-3 text-center">Tugas (30%)</th>
                  <th className="px-5 py-3 text-center">Formatif (30%)</th>
                  <th className="px-5 py-3 text-center">Sumatif (40%)</th>
                  <th className="px-5 py-3 text-center">Nilai Akhir</th>
                  <th className="px-5 py-3 text-center">Predikat</th>
                  <th className="px-5 py-3">Deskripsi Capaian Kompetensi</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-10 text-center text-slate-400">
                      Tidak ada catatan nilai pada mata pelajaran &amp; rombel ini.
                    </td>
                  </tr>
                ) : (
                  filteredList.map((n) => (
                    <tr key={n.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-navy-950 text-sm">{n.siswaNama}</div>
                        <div className="text-[11px] text-slate-400 font-mono">NISN: {n.nisn}</div>
                      </td>

                      <td className="px-5 py-3.5 font-medium text-slate-700">
                        {n.kelas}
                      </td>

                      <td className="px-5 py-3.5 font-mono text-center font-semibold text-slate-800">
                        {n.nilaiTugas}
                      </td>

                      <td className="px-5 py-3.5 font-mono text-center font-semibold text-slate-800">
                        {n.nilaiFormatif}
                      </td>

                      <td className="px-5 py-3.5 font-mono text-center font-semibold text-slate-800">
                        {n.nilaiSumatif}
                      </td>

                      <td className="px-5 py-3.5 font-mono text-center">
                        <span className={cn(
                          "px-2.5 py-1 rounded-lg font-bold text-sm",
                          n.nilaiAkhir >= 88
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : n.nilaiAkhir >= 75
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        )}>
                          {n.nilaiAkhir}
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
                        {n.capaianKompetensi}
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingItem(n);
                            setFormEdit({
                              nilaiTugas: n.nilaiTugas,
                              nilaiFormatif: n.nilaiFormatif,
                              nilaiSumatif: n.nilaiSumatif,
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
              <div className="font-bold text-navy-950">{editingItem.siswaNama}</div>
              <div className="text-slate-500 font-mono text-[11px]">{editingItem.kelas} &bull; {editingItem.mapel}</div>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Nilai Tugas &amp; Praktikum (30%)</label>
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
                <label className="font-semibold text-slate-700">Nilai Asesmen Formatif / Kuis (30%)</label>
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
                <label className="font-semibold text-slate-700">Nilai Asesmen Sumatif / Ujian (40%)</label>
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
                  className="bg-navy-900 text-white hover:bg-navy-800 rounded-xl text-xs shadow-xs"
                >
                  Simpan Nilai
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
