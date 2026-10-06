"use client";

import { useState, useMemo, useEffect } from "react";
import {
  BookOpen,
  Search,
  Plus,
  Trash2,
  Clock,
  Award,
  Layers,
  BookOpenCheck,
  RefreshCw,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useStore, type MataPelajaran } from "@/lib/store";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";

export default function AdminMapelPage() {
  const { tahunAjaranAktif, semesterAktif } = useStore();

  const [mapelList, setMapelList] = useState<MataPelajaran[]>([]);
  const [guruList, setGuruList] = useState<{ id: number; nama: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [search, setSearch] = useState("");
  const [filterKelompok, setFilterKelompok] = useState("SEMUA");
  const [openModal, setOpenModal] = useState(false);

  // Form State Tambah Mapel
  const [formMapel, setFormMapel] = useState({
    kode: "",
    nama: "",
    kelompok: "A (Wajib)" as const,
    tingkat: "Semua Tingkat" as const,
    bebanJam: 3,
    guruId: "",
    status: "AKTIF" as const,
  });

  const kelompokOptions = ["A (Wajib)", "B (Umum)", "C (Peminatan)", "Muatan Lokal"];
  const tingkatOptions = ["Semua Tingkat", "Kelas X", "Kelas XI", "Kelas XII"];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resMapel, resGuru] = await Promise.all([
        api.getMapelList().catch(() => ({ data: [] })),
        api.getGuruList().catch(() => ({ data: [] })),
      ]);

      if (resGuru?.data) {
        setGuruList(resGuru.data.map((g: any) => ({ id: g.id, nama: g.nama })));
      }

      if (resMapel?.data) {
        const mapped: MataPelajaran[] = resMapel.data.map((m: any) => ({
          id: String(m.id),
          kode: m.kode || `MP-${m.id}`,
          nama: m.nama,
          kelompok: (m.kelompok || "A (Wajib)") as any,
          tingkat: (m.tingkat || "Semua Tingkat") as any,
          bebanJam: Number(m.beban_jam || 2),
          guruPengampu: m.guru?.nama || "Belum Ditentukan",
          status: (m.status || "AKTIF") as any,
        }));
        setMapelList(mapped);
      }
    } catch (err: any) {
      console.warn("Gagal memuat mata pelajaran:", err?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered List
  const filteredList = useMemo(() => {
    return mapelList.filter((m) => {
      const matchSearch =
        m.nama.toLowerCase().includes(search.toLowerCase()) ||
        m.kode.toLowerCase().includes(search.toLowerCase()) ||
        m.guruPengampu.toLowerCase().includes(search.toLowerCase());
      const matchKelompok = filterKelompok === "SEMUA" || m.kelompok === filterKelompok;
      return matchSearch && matchKelompok;
    });
  }, [mapelList, search, filterKelompok]);

  // Statistics
  const totalMapel = mapelList.length;
  const totalWajib = mapelList.filter((m) => m.kelompok === "A (Wajib)" || m.kelompok === "B (Umum)").length;
  const totalPeminatan = mapelList.filter((m) => m.kelompok === "C (Peminatan)").length;
  const totalBebanJP = mapelList.reduce((acc, curr) => acc + curr.bebanJam, 0);

  async function handleSubmitTambah(e: React.FormEvent) {
    e.preventDefault();
    if (!formMapel.nama || !formMapel.kode) return;

    setSubmitting(true);
    try {
      const payload = {
        kode: formMapel.kode,
        nama: formMapel.nama,
        kelompok: formMapel.kelompok,
        tingkat: formMapel.tingkat,
        beban_jam: Number(formMapel.bebanJam),
        guru_id: formMapel.guruId ? Number(formMapel.guruId) : null,
        status: formMapel.status,
      };

      const res = await api.createMapel(payload);
      const newId = String(res?.data?.id || Date.now());
      const guruObj = guruList.find((g) => String(g.id) === String(formMapel.guruId));

      const newMapel: MataPelajaran = {
        id: newId,
        kode: formMapel.kode,
        nama: formMapel.nama,
        kelompok: formMapel.kelompok,
        tingkat: formMapel.tingkat,
        bebanJam: Number(formMapel.bebanJam),
        guruPengampu: guruObj?.nama || "Belum Ditentukan",
        status: formMapel.status,
      };

      setMapelList((prev) => [newMapel, ...prev]);
      setOpenModal(false);
      setFormMapel({
        kode: "",
        nama: "",
        kelompok: "A (Wajib)",
        tingkat: "Semua Tingkat",
        bebanJam: 3,
        guruId: "",
        status: "AKTIF",
      });
    } catch (err: any) {
      alert("Gagal menambahkan mata pelajaran: " + (err?.message || "Terjadi kesalahan"));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleHapusMapel(id: string) {
    if (!confirm("Apakah Anda yakin ingin menghapus mata pelajaran ini?")) return;

    try {
      await api.deleteMapel(id);
      setMapelList((prev) => prev.filter((m) => m.id !== id));
    } catch (err: any) {
      alert("Gagal menghapus mata pelajaran: " + (err?.message || "Terjadi kesalahan"));
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Title & Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-navy-900 text-white shadow-xs">
              <BookOpenCheck size={19} />
            </span>
            <h1 className="font-display text-2xl font-bold tracking-tight text-navy-950">
              Master Data Mata Pelajaran
            </h1>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Struktur kurikulum sekolah, kelompok mata pelajaran, dan beban jam mengajar mingguan ({tahunAjaranAktif} - {semesterAktif})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={loading}
            className="text-xs h-9 gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => setOpenModal(true)}
            className="gap-2 bg-navy-900 text-white hover:bg-navy-800 text-xs cursor-pointer shadow-xs h-9"
          >
            <Plus size={14} />
            Tambah Mapel Baru
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-border bg-white shadow-2xs">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-8 rounded-xl" />
                </div>
                <Skeleton className="h-7 w-16" />
                <Skeleton className="h-3.5 w-28" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card className="border-border bg-white shadow-2xs">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">Total Mata Pelajaran</span>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-navy-50 text-navy-900">
                    <BookOpen size={16} />
                  </span>
                </div>
                <div className="mt-2 text-2xl font-bold font-mono text-navy-950">{totalMapel}</div>
                <div className="mt-1 text-[11px] text-emerald-600 font-medium">● Seluruh Jenjang</div>
              </CardContent>
            </Card>

            <Card className="border-border bg-white shadow-2xs">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">Mapel Wajib / Umum</span>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-blue-50 text-blue-800">
                    <Award size={16} />
                  </span>
                </div>
                <div className="mt-2 text-2xl font-bold font-mono text-navy-950">{totalWajib}</div>
                <div className="mt-1 text-[11px] text-slate-500">Kelompok A &amp; B</div>
              </CardContent>
            </Card>

            <Card className="border-border bg-white shadow-2xs">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">Mapel Peminatan</span>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-purple-50 text-purple-900">
                    <Layers size={16} />
                  </span>
                </div>
                <div className="mt-2 text-2xl font-bold font-mono text-navy-950">{totalPeminatan}</div>
                <div className="mt-1 text-[11px] text-slate-500">IPA, IPS &amp; Bahasa</div>
              </CardContent>
            </Card>

            <Card className="border-border bg-white shadow-2xs">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">Total Beban JP / Minggu</span>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-amber-50 text-amber-900">
                    <Clock size={16} />
                  </span>
                </div>
                <div className="mt-2 text-2xl font-bold font-mono text-navy-950">{totalBebanJP} JP</div>
                <div className="mt-1 text-[11px] text-slate-500">Jam Pelajaran Aktif</div>
              </CardContent>
            </Card>
          </>
        )}
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
                placeholder="Cari kode mapel, nama, atau guru pengampu..."
                className="h-9 pl-9 text-xs rounded-xl bg-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filterKelompok}
                onChange={(e) => setFilterKelompok(e.target.value)}
                className="h-9 rounded-xl border border-input bg-white px-3 text-xs text-slate-700 outline-none focus:border-navy-600 shadow-2xs"
              >
                <option value="SEMUA">Semua Kelompok Mapel</option>
                {kelompokOptions.map((k) => (
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
                  <th className="px-5 py-3">Kode Mapel</th>
                  <th className="px-5 py-3">Nama Mata Pelajaran</th>
                  <th className="px-5 py-3">Kelompok Kurikulum</th>
                  <th className="px-5 py-3">Tingkat Kelas</th>
                  <th className="px-5 py-3">Beban Jam</th>
                  <th className="px-5 py-3">Guru Pengampu Utama</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-5 py-3.5"><Skeleton className="h-5 w-16 rounded" /></td>
                      <td className="px-5 py-3.5 space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-16" />
                      </td>
                      <td className="px-5 py-3.5"><Skeleton className="h-5 w-20 rounded-full" /></td>
                      <td className="px-5 py-3.5"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-5 py-3.5"><Skeleton className="h-4 w-16" /></td>
                      <td className="px-5 py-3.5"><Skeleton className="h-4 w-28" /></td>
                      <td className="px-5 py-3.5"><Skeleton className="h-5 w-14 rounded-full" /></td>
                      <td className="px-5 py-3.5 text-right"><Skeleton className="h-7 w-7 ml-auto rounded-lg" /></td>
                    </tr>
                  ))
                ) : filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-400">
                      Tidak ada mata pelajaran yang cocok dengan filter pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredList.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5 font-mono">
                        <span className="font-bold text-navy-950 bg-navy-50 px-2 py-0.5 rounded border border-navy-100">
                          {m.kode}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="font-bold text-navy-950 text-sm">{m.nama}</div>
                        <div className="text-[11px] text-slate-400">ID: {m.id}</div>
                      </td>

                      <td className="px-5 py-3.5">
                        <Badge
                          variant="outline"
                          className={cn(
                            "font-bold text-[10px]",
                            m.kelompok.includes("Wajib")
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : m.kelompok.includes("Peminatan")
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : "bg-slate-50 text-slate-700 border-slate-200"
                          )}
                        >
                          {m.kelompok}
                        </Badge>
                      </td>

                      <td className="px-5 py-3.5 font-medium text-slate-700">
                        {m.tingkat}
                      </td>

                      <td className="px-5 py-3.5 font-mono font-bold text-navy-950">
                        {m.bebanJam} JP / mgg
                      </td>

                      <td className="px-5 py-3.5 font-semibold text-navy-900">
                        {m.guruPengampu}
                      </td>

                      <td className="px-5 py-3.5">
                        <Badge variant={m.status === "AKTIF" ? "hadir" : "alpha"} className="text-[10px]">
                          {m.status}
                        </Badge>
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleHapusMapel(m.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Hapus Mapel"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal Dialog: Tambah Mapel */}
      {openModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-fade-up space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display text-lg font-bold text-navy-950 flex items-center gap-2">
                <Plus size={18} className="text-navy-900" />
                Tambah Mata Pelajaran Baru
              </h3>
              <button onClick={() => setOpenModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitTambah} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Kode Mapel *</label>
                  <Input
                    required
                    value={formMapel.kode}
                    onChange={(e) => setFormMapel({ ...formMapel, kode: e.target.value.toUpperCase() })}
                    placeholder="Contoh: BIO-W"
                    className="h-9 font-mono text-xs rounded-xl uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Beban Jam / Minggu (JP)</label>
                  <Input
                    required
                    type="number"
                    min={1}
                    max={10}
                    value={formMapel.bebanJam}
                    onChange={(e) => setFormMapel({ ...formMapel, bebanJam: Number(e.target.value) })}
                    className="h-9 font-mono text-xs rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Nama Mata Pelajaran *</label>
                <Input
                  required
                  value={formMapel.nama}
                  onChange={(e) => setFormMapel({ ...formMapel, nama: e.target.value })}
                  placeholder="Contoh: Biologi Lanjutan"
                  className="h-9 text-xs rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Kelompok Kurikulum</label>
                  <select
                    value={formMapel.kelompok}
                    onChange={(e) => setFormMapel({ ...formMapel, kelompok: e.target.value as any })}
                    className="h-9 w-full rounded-xl border border-input bg-white px-3 text-xs text-slate-700 outline-none"
                  >
                    {kelompokOptions.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Tingkat Sasaran</label>
                  <select
                    value={formMapel.tingkat}
                    onChange={(e) => setFormMapel({ ...formMapel, tingkat: e.target.value as any })}
                    className="h-9 w-full rounded-xl border border-input bg-white px-3 text-xs text-slate-700 outline-none"
                  >
                    {tingkatOptions.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Guru Pengampu Utama</label>
                <select
                  value={formMapel.guruId}
                  onChange={(e) => setFormMapel({ ...formMapel, guruId: e.target.value })}
                  className="h-9 w-full rounded-xl border border-input bg-white px-3 text-xs text-slate-700 outline-none"
                >
                  <option value="">-- Pilih Guru Pengampu (Opsional) --</option>
                  {guruList.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.nama}
                    </option>
                  ))}
                </select>
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
                  {submitting ? "Menyimpan..." : "Simpan Mata Pelajaran"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
