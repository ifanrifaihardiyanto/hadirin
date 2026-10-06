"use client";

import { useState, useMemo, useEffect } from "react";
import {
  FileText,
  Search,
  Plus,
  Clock,
  CheckCircle2,
  Trash2,
  X,
  BookOpen,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { api } from "@/lib/api-client";

interface TugasItem {
  id: number;
  judul: string;
  deskripsi?: string;
  deadline: string;
  file_lampiran?: string;
  guru?: {
    id: number;
    nama: string;
  };
  mapel?: {
    id: number;
    nama: string;
  };
  kelas?: {
    id: number;
    nama: string;
    total_siswa?: number;
  };
  total_siswa?: number;
  sudah_mengumpulkan?: number;
  sudah_dinilai?: number;
}

export default function AdminTugasPage() {
  const [daftarTugas, setDaftarTugas] = useState<TugasItem[]>([]);
  const [kelasList, setKelasList] = useState<Array<{ id: number; nama: string }>>([]);
  const [mapelList, setMapelList] = useState<Array<{ id: number; nama: string }>>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filterKelas, setFilterKelas] = useState("SEMUA");
  const [filterMapel, setFilterMapel] = useState("SEMUA");
  const [openModal, setOpenModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formTugas, setFormTugas] = useState({
    judul: "",
    mapel_id: "",
    kelas_id: "",
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    deskripsi: "",
    file_lampiran: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tugasRes, kelasRes, mapelRes] = await Promise.allSettled([
        api.getTugasList(),
        api.getKelasList(),
        api.getMapelList(),
      ]);

      if (kelasRes.status === "fulfilled" && kelasRes.value?.data) {
        setKelasList(kelasRes.value.data);
      }
      if (mapelRes.status === "fulfilled" && mapelRes.value?.data) {
        setMapelList(mapelRes.value.data);
      }
      if (tugasRes.status === "fulfilled" && tugasRes.value?.data) {
        setDaftarTugas(tugasRes.value.data);
      } else {
        setDaftarTugas([]);
      }
    } catch (err) {
      console.error("Gagal memuat tugas LMS:", err);
      setDaftarTugas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered List
  const filteredList = useMemo(() => {
    return daftarTugas.filter((t) => {
      const guruNama = t.guru?.nama || "";
      const mapelNama = t.mapel?.nama || "";
      const kelasNama = t.kelas?.nama || "";

      const matchSearch =
        t.judul.toLowerCase().includes(search.toLowerCase()) ||
        guruNama.toLowerCase().includes(search.toLowerCase());
      const matchKelas = filterKelas === "SEMUA" || kelasNama === filterKelas;
      const matchMapel = filterMapel === "SEMUA" || mapelNama === filterMapel;
      return matchSearch && matchKelas && matchMapel;
    });
  }, [daftarTugas, search, filterKelas, filterMapel]);

  // Statistics
  const now = new Date().toISOString();
  const totalTugasAktif = daftarTugas.filter((t) => !t.deadline || t.deadline >= now).length;
  const totalPengumpulan = daftarTugas.reduce((acc, curr) => acc + (curr.sudah_mengumpulkan || 0), 0);
  const totalKapasitas = daftarTugas.reduce((acc, curr) => acc + (curr.total_siswa || 30), 0);
  const rasioPengumpulan = totalKapasitas > 0 ? Math.round((totalPengumpulan / totalKapasitas) * 100) : 0;
  const tugasPerluDinilai = daftarTugas.reduce(
    (acc, curr) => acc + ((curr.sudah_mengumpulkan || 0) - (curr.sudah_dinilai || 0)),
    0
  );

  async function handleSubmitTambah(e: React.FormEvent) {
    e.preventDefault();
    if (!formTugas.judul || !formTugas.mapel_id) {
      alert("Harap lengkapi judul tugas dan mata pelajaran.");
      return;
    }

    setSubmitting(true);
    try {
      await api.createTugas({
        judul: formTugas.judul,
        mapel_id: Number(formTugas.mapel_id),
        kelas_id: formTugas.kelas_id ? Number(formTugas.kelas_id) : null,
        deadline: formTugas.deadline,
        deskripsi: formTugas.deskripsi || null,
        file_lampiran: formTugas.file_lampiran || null,
      });

      setOpenModal(false);
      setFormTugas({
        judul: "",
        mapel_id: "",
        kelas_id: "",
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        deskripsi: "",
        file_lampiran: "",
      });
      await fetchData();
    } catch (err) {
      console.error("Gagal membuat tugas:", err);
      alert("Gagal membuat tugas. Periksa kembali form.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteTugas(id: number, judul: string) {
    if (confirm(`Apakah Anda yakin ingin menghapus tugas "${judul}"?`)) {
      try {
        await api.deleteTugas(id);
        await fetchData();
      } catch (err) {
        console.error("Gagal menghapus tugas:", err);
        alert("Gagal menghapus tugas.");
      }
    }
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
            Distribusi penugasan kelas, batas waktu (deadline), dan penilaian langsung tersambung ke Supabase PostgreSQL.
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
            size="sm"
            onClick={() => {
              if (mapelList.length > 0 && !formTugas.mapel_id) {
                setFormTugas((prev) => ({ ...prev, mapel_id: String(mapelList[0].id) }));
              }
              if (kelasList.length > 0 && !formTugas.kelas_id) {
                setFormTugas((prev) => ({ ...prev, kelas_id: String(kelasList[0].id) }));
              }
              setOpenModal(true);
            }}
            className="gap-2 bg-navy-900 text-white hover:bg-navy-800 text-xs cursor-pointer shadow-xs"
          >
            <Plus size={14} />
            Buat Tugas Baru
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
              <div className="mt-1 text-[11px] text-slate-500">{totalPengumpulan} siswa submit</div>
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
              <div className="mt-2 text-2xl font-bold font-mono text-amber-700">{Math.max(0, tugasPerluDinilai)}</div>
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
              <div className="mt-1 text-[11px] text-slate-500">Tersimpan di Supabase</div>
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
                {kelasList.map((k) => (
                  <option key={k.id} value={k.nama}>
                    {k.nama}
                  </option>
                ))}
              </select>

              <select
                value={filterMapel}
                onChange={(e) => setFilterMapel(e.target.value)}
                className="h-9 rounded-xl border border-input bg-white px-3 text-xs text-slate-700 outline-none shadow-2xs"
              >
                <option value="SEMUA">Semua Mapel</option>
                {mapelList.map((m) => (
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
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-5 py-4">
                        <div className="h-4 w-48 rounded bg-slate-200" />
                      </td>
                      <td className="px-5 py-4">
                        <div className="h-4 w-28 rounded bg-slate-200" />
                      </td>
                      <td className="px-5 py-4">
                        <div className="h-4 w-16 rounded bg-slate-200" />
                      </td>
                      <td className="px-5 py-4">
                        <div className="h-4 w-24 rounded bg-slate-200" />
                      </td>
                      <td className="px-5 py-4">
                        <div className="h-4 w-24 rounded bg-slate-200" />
                      </td>
                      <td className="px-5 py-4">
                        <div className="h-4 w-12 rounded bg-slate-200" />
                      </td>
                      <td className="px-5 py-4">
                        <div className="h-4 w-16 rounded bg-slate-200" />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="h-4 w-12 ml-auto rounded bg-slate-200" />
                      </td>
                    </tr>
                  ))
                ) : filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-400">
                      Tidak ada tugas yang sesuai dengan filter pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredList.map((t) => {
                    const totalSiswa = t.total_siswa || 30;
                    const sudahMengumpulkan = t.sudah_mengumpulkan || 0;
                    const pct = Math.min(100, Math.round((sudahMengumpulkan / totalSiswa) * 100));
                    const isPassed = t.deadline && t.deadline < now;

                    return (
                      <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-3.5 max-w-xs">
                          <div className="font-bold text-navy-950 text-sm leading-snug">{t.judul}</div>
                          {t.deskripsi && (
                            <div className="text-[11px] text-slate-500 truncate mt-0.5">{t.deskripsi}</div>
                          )}
                        </td>

                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-navy-900">{t.mapel?.nama || "Mapel Umum"}</div>
                          <div className="text-[11px] text-slate-500">{t.guru?.nama || "Guru Pengampu"}</div>
                        </td>

                        <td className="px-5 py-3.5 font-medium text-slate-700">
                          {t.kelas?.nama || "Semua Kelas"}
                        </td>

                        <td className="px-5 py-3.5 font-mono text-[11px] text-slate-700">
                          <div className="flex items-center gap-1">
                            <Clock size={12} className="text-slate-400" />
                            {t.deadline ? t.deadline.replace("T", " ").slice(0, 16) : "-"}
                          </div>
                        </td>

                        <td className="px-5 py-3.5 w-36">
                          <div className="flex justify-between text-[11px] font-mono mb-1">
                            <span className="font-bold text-navy-950">{sudahMengumpulkan}/{totalSiswa}</span>
                            <span className="text-slate-500">{pct}%</span>
                          </div>
                          <Progress value={pct} className="h-1.5" />
                        </td>

                        <td className="px-5 py-3.5 font-mono">
                          <span className="font-bold text-emerald-700">{t.sudah_dinilai || 0}</span>
                          <span className="text-slate-400">/{sudahMengumpulkan}</span>
                        </td>

                        <td className="px-5 py-3.5">
                          <Badge
                            variant={!isPassed ? "hadir" : "secondary"}
                            className="text-[10px]"
                          >
                            {!isPassed ? "AKTIF" : "SELESAI"}
                          </Badge>
                        </td>

                        <td className="px-5 py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteTugas(t.id, t.judul)}
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
                Buat Tugas Baru
              </h3>
              <button onClick={() => setOpenModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitTambah} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Judul Tugas / Penugasan *</label>
                <Input
                  required
                  value={formTugas.judul}
                  onChange={(e) => setFormTugas({ ...formTugas, judul: e.target.value })}
                  placeholder="Contoh: Tugas Individu 01 - Analisis Persamaan Linear"
                  className="h-9 text-xs rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Mata Pelajaran *</label>
                  <select
                    required
                    value={formTugas.mapel_id}
                    onChange={(e) => setFormTugas({ ...formTugas, mapel_id: e.target.value })}
                    className="h-9 w-full rounded-xl border border-input bg-white px-3 text-xs text-slate-700 outline-none"
                  >
                    <option value="">Pilih Mata Pelajaran</option>
                    {mapelList.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nama}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Kelas Target</label>
                  <select
                    value={formTugas.kelas_id}
                    onChange={(e) => setFormTugas({ ...formTugas, kelas_id: e.target.value })}
                    className="h-9 w-full rounded-xl border border-input bg-white px-3 text-xs text-slate-700 outline-none"
                  >
                    <option value="">Semua Kelas</option>
                    {kelasList.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.nama}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Batas Waktu Pengumpulan (Deadline) *</label>
                <Input
                  type="datetime-local"
                  required
                  value={formTugas.deadline}
                  onChange={(e) => setFormTugas({ ...formTugas, deadline: e.target.value })}
                  className="h-9 text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Petunjuk Tugas &amp; Instruksi</label>
                <textarea
                  rows={3}
                  value={formTugas.deskripsi}
                  onChange={(e) => setFormTugas({ ...formTugas, deskripsi: e.target.value })}
                  placeholder="Instruksi pengerjaan tugas bagi siswa..."
                  className="w-full rounded-xl border border-input bg-white p-2.5 text-xs text-slate-700 outline-none resize-none"
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
                  disabled={submitting}
                  className="bg-navy-900 text-white hover:bg-navy-800 rounded-xl text-xs shadow-xs"
                >
                  {submitting ? "Menerbitkan..." : "Terbitkan Tugas"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
