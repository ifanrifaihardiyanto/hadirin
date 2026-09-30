"use client";

import { useState, useMemo } from "react";
import {
  FileText,
  Search,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Calendar,
  Users,
  Check,
  X,
  BookOpen,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useStore, type Tugas } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function AdminTugasPage() {
  const { daftarTugas, tambahTugas, hapusTugas, daftarMapel, tahunAjaranAktif, semesterAktif } = useStore();

  const [search, setSearch] = useState("");
  const [filterKelas, setFilterKelas] = useState("SEMUA");
  const [filterMapel, setFilterMapel] = useState("SEMUA");
  const [openModal, setOpenModal] = useState(false);

  // Form State
  const [formTugas, setFormTugas] = useState({
    judul: "",
    mapel: "Matematika Wajib",
    kelas: "X IPA 1",
    guruNama: "Sari Wulandari, S.Pd",
    deadline: "2026-08-15 23:59",
    deskripsi: "",
    totalSiswa: 20,
    sudahMengumpulkan: 0,
    sudahDinilai: 0,
    status: "AKTIF" as const,
  });

  const kelasOptions = ["X IPA 1", "X IPA 2", "XI IPA 1", "XI IPA 2", "XII IPA 1", "XII IPS 1"];

  // Filtered List
  const filteredList = useMemo(() => {
    return daftarTugas.filter((t) => {
      const matchSearch =
        t.judul.toLowerCase().includes(search.toLowerCase()) ||
        t.guruNama.toLowerCase().includes(search.toLowerCase());
      const matchKelas = filterKelas === "SEMUA" || t.kelas === filterKelas;
      const matchMapel = filterMapel === "SEMUA" || t.mapel === filterMapel;
      return matchSearch && matchKelas && matchMapel;
    });
  }, [daftarTugas, search, filterKelas, filterMapel]);

  // Statistics
  const totalTugasAktif = daftarTugas.filter((t) => t.status === "AKTIF").length;
  const totalPengumpulan = daftarTugas.reduce((acc, curr) => acc + curr.sudahMengumpulkan, 0);
  const totalKapasitas = daftarTugas.reduce((acc, curr) => acc + curr.totalSiswa, 0);
  const rasioPengumpulan = totalKapasitas > 0 ? Math.round((totalPengumpulan / totalKapasitas) * 100) : 0;
  const tugasPerluDinilai = daftarTugas.reduce((acc, curr) => acc + (curr.sudahMengumpulkan - curr.sudahDinilai), 0);

  function handleSubmitTambah(e: React.FormEvent) {
    e.preventDefault();
    if (!formTugas.judul) return;

    tambahTugas(formTugas);
    setOpenModal(false);
    setFormTugas({
      judul: "",
      mapel: "Matematika Wajib",
      kelas: "X IPA 1",
      guruNama: "Sari Wulandari, S.Pd",
      deadline: "2026-08-15 23:59",
      deskripsi: "",
      totalSiswa: 20,
      sudahMengumpulkan: 0,
      sudahDinilai: 0,
      status: "AKTIF",
    });
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-navy-900 text-white shadow-xs">
              <FileText size={19} />
            </span>
            <h1 className="font-display text-2xl font-bold tracking-tight text-navy-950">
              Manajemen Tugas Siswa (LMS)
            </h1>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Distribusi penugasan kelas, batas waktu (deadline), dan rekapitulasi penilaian tugas ({tahunAjaranAktif} - {semesterAktif})
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setOpenModal(true)}
          className="gap-2 bg-navy-900 text-white hover:bg-navy-800 text-xs cursor-pointer shadow-xs"
        >
          <Plus size={14} />
          Buat Tugas Baru
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="border-border bg-white shadow-2xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Tugas Aktif</span>
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-blue-50 text-blue-700">
                <FileText size={16} />
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-navy-950">{totalTugasAktif}</div>
            <div className="mt-1 text-[11px] text-emerald-600 font-medium">● Dalam Masa Pengumpulan</div>
          </CardContent>
        </Card>

        <Card className="border-border bg-white shadow-2xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Tingkat Pengumpulan</span>
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                <CheckCircle2 size={16} />
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-navy-950">{rasioPengumpulan}%</div>
            <div className="mt-1 text-[11px] text-slate-500">{totalPengumpulan} dari {totalKapasitas} siswa</div>
          </CardContent>
        </Card>

        <Card className="border-border bg-white shadow-2xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Belum Dikoreksi</span>
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-amber-50 text-amber-700">
                <Clock size={16} />
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-amber-700">{tugasPerluDinilai}</div>
            <div className="mt-1 text-[11px] text-slate-500">Menunggu penilaian guru</div>
          </CardContent>
        </Card>

        <Card className="border-border bg-white shadow-2xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Total Tugas KBM</span>
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-navy-50 text-navy-900">
                <BookOpen size={16} />
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-navy-950">{daftarTugas.length}</div>
            <div className="mt-1 text-[11px] text-slate-500">Semester berjalan</div>
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
                placeholder="Cari judul tugas atau nama guru..."
                className="h-9 pl-9 text-xs rounded-xl bg-white"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filterKelas}
                onChange={(e) => setFilterKelas(e.target.value)}
                className="h-9 rounded-xl border border-input bg-white px-3 text-xs text-slate-700 outline-none shadow-2xs"
              >
                <option value="SEMUA">Semua Kelas</option>
                {kelasOptions.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>

              <select
                value={filterMapel}
                onChange={(e) => setFilterMapel(e.target.value)}
                className="h-9 rounded-xl border border-input bg-white px-3 text-xs text-slate-700 outline-none shadow-2xs"
              >
                <option value="SEMUA">Semua Mapel</option>
                {daftarMapel.map((m) => (
                  <option key={m.id} value={m.nama}>
                    {m.nama}
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
                  <th className="px-5 py-3">Judul Tugas</th>
                  <th className="px-5 py-3">Mata Pelajaran &amp; Guru</th>
                  <th className="px-5 py-3">Kelas</th>
                  <th className="px-5 py-3">Deadline</th>
                  <th className="px-5 py-3">Progress Kumpul</th>
                  <th className="px-5 py-3">Sudah Dinilai</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-400">
                      Tidak ada tugas yang sesuai dengan filter pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredList.map((t) => {
                    const pct = Math.round((t.sudahMengumpulkan / t.totalSiswa) * 100);
                    return (
                      <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-3.5 max-w-xs">
                          <div className="font-bold text-navy-950 text-sm leading-snug">{t.judul}</div>
                          <div className="text-[11px] text-slate-500 truncate mt-0.5">{t.deskripsi}</div>
                        </td>

                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-navy-900">{t.mapel}</div>
                          <div className="text-[11px] text-slate-500">{t.guruNama}</div>
                        </td>

                        <td className="px-5 py-3.5 font-medium text-slate-700">
                          {t.kelas}
                        </td>

                        <td className="px-5 py-3.5 font-mono text-[11px] text-slate-700">
                          <div className="flex items-center gap-1">
                            <Clock size={12} className="text-slate-400" />
                            {t.deadline}
                          </div>
                        </td>

                        <td className="px-5 py-3.5 w-36">
                          <div className="flex justify-between text-[11px] font-mono mb-1">
                            <span className="font-bold text-navy-950">{t.sudahMengumpulkan}/{t.totalSiswa}</span>
                            <span className="text-slate-500">{pct}%</span>
                          </div>
                          <Progress value={pct} className="h-1.5" />
                        </td>

                        <td className="px-5 py-3.5 font-mono">
                          <span className="font-bold text-emerald-700">{t.sudahDinilai}</span>
                          <span className="text-slate-400">/{t.sudahMengumpulkan}</span>
                        </td>

                        <td className="px-5 py-3.5">
                          <Badge
                            variant={t.status === "AKTIF" ? "hadir" : "secondary"}
                            className="text-[10px]"
                          >
                            {t.status}
                          </Badge>
                        </td>

                        <td className="px-5 py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => hapusTugas(t.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Hapus Tugas"
                          >
                            <Trash2 size={15} />
                          </button>
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

      {/* MODAL BUAT TUGAS */}
      {openModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-fade-up space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display text-base font-bold text-navy-950 flex items-center gap-2">
                <Plus size={18} className="text-navy-900" />
                Buat Tugas KBM Baru
              </h3>
              <button onClick={() => setOpenModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitTambah} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Judul Tugas *</label>
                <Input
                  required
                  value={formTugas.judul}
                  onChange={(e) => setFormTugas({ ...formTugas, judul: e.target.value })}
                  placeholder="Contoh: Latihan Soal Barisan dan Deret Geometri"
                  className="h-9 text-xs rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Mata Pelajaran</label>
                  <select
                    value={formTugas.mapel}
                    onChange={(e) => setFormTugas({ ...formTugas, mapel: e.target.value })}
                    className="h-9 w-full rounded-xl border border-input bg-white px-3 text-xs text-slate-700 outline-none"
                  >
                    {daftarMapel.map((m) => (
                      <option key={m.id} value={m.nama}>
                        {m.nama}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Kelas Sasaran</label>
                  <select
                    value={formTugas.kelas}
                    onChange={(e) => setFormTugas({ ...formTugas, kelas: e.target.value })}
                    className="h-9 w-full rounded-xl border border-input bg-white px-3 text-xs text-slate-700 outline-none"
                  >
                    {kelasOptions.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Batas Waktu (Deadline)</label>
                  <Input
                    required
                    value={formTugas.deadline}
                    onChange={(e) => setFormTugas({ ...formTugas, deadline: e.target.value })}
                    placeholder="YYYY-MM-DD HH:mm"
                    className="h-9 font-mono text-xs rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Guru Pengampu</label>
                  <Input
                    value={formTugas.guruNama}
                    onChange={(e) => setFormTugas({ ...formTugas, guruNama: e.target.value })}
                    className="h-9 text-xs rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Petunjuk Pengerjaan</label>
                <textarea
                  rows={3}
                  value={formTugas.deskripsi}
                  onChange={(e) => setFormTugas({ ...formTugas, deskripsi: e.target.value })}
                  placeholder="Tuliskan petunjuk pengerjaan atau format file yang diminta..."
                  className="w-full rounded-xl border border-input bg-white p-2.5 text-xs text-slate-700 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setOpenModal(false)}
                  className="rounded-xl text-xs"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-navy-900 text-white hover:bg-navy-800 rounded-xl text-xs shadow-xs"
                >
                  Terbitkan Tugas
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
