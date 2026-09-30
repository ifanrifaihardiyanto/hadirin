"use client";

import { useState, useMemo } from "react";
import {
  BookOpen,
  Search,
  Plus,
  FileText,
  Video,
  Presentation,
  File,
  Download,
  Trash2,
  Calendar,
  Layers,
  X,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useStore, type MateriAjar } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function AdminMateriPage() {
  const { daftarMateri, tambahMateri, hapusMateri, daftarMapel, tahunAjaranAktif, semesterAktif } = useStore();

  const [search, setSearch] = useState("");
  const [filterKelas, setFilterKelas] = useState("SEMUA");
  const [filterMapel, setFilterMapel] = useState("SEMUA");
  const [filterTipe, setFilterTipe] = useState("SEMUA");
  const [openModal, setOpenModal] = useState(false);

  // Form State
  const [formMateri, setFormMateri] = useState({
    judul: "",
    mapel: "Matematika Wajib",
    kelas: "X IPA 1",
    guruNama: "Sari Wulandari, S.Pd",
    tipe: "PDF" as const,
    fileUrl: "#",
    ukuranFile: "2.5 MB",
    tanggalUpload: new Date().toISOString().split("T")[0],
  });

  const kelasOptions = ["X IPA 1", "X IPA 2", "XI IPA 1", "XI IPA 2", "XII IPA 1", "XII IPS 1"];
  const tipeOptions = ["PDF", "VIDEO", "SLIDE", "DOKUMEN"];

  // Filtered List
  const filteredList = useMemo(() => {
    return daftarMateri.filter((m) => {
      const matchSearch =
        m.judul.toLowerCase().includes(search.toLowerCase()) ||
        m.guruNama.toLowerCase().includes(search.toLowerCase());
      const matchKelas = filterKelas === "SEMUA" || m.kelas === filterKelas;
      const matchMapel = filterMapel === "SEMUA" || m.mapel === filterMapel;
      const matchTipe = filterTipe === "SEMUA" || m.tipe === filterTipe;
      return matchSearch && matchKelas && matchMapel && matchTipe;
    });
  }, [daftarMateri, search, filterKelas, filterMapel, filterTipe]);

  // Statistics
  const totalMateri = daftarMateri.length;
  const totalPdf = daftarMateri.filter((m) => m.tipe === "PDF").length;
  const totalVideo = daftarMateri.filter((m) => m.tipe === "VIDEO").length;
  const totalSlide = daftarMateri.filter((m) => m.tipe === "SLIDE").length;

  function handleSubmitTambah(e: React.FormEvent) {
    e.preventDefault();
    if (!formMateri.judul) return;

    tambahMateri(formMateri);
    setOpenModal(false);
    setFormMateri({
      judul: "",
      mapel: "Matematika Wajib",
      kelas: "X IPA 1",
      guruNama: "Sari Wulandari, S.Pd",
      tipe: "PDF",
      fileUrl: "#",
      ukuranFile: "2.5 MB",
      tanggalUpload: new Date().toISOString().split("T")[0],
    });
  }

  function getIconTipe(tipe: string) {
    switch (tipe) {
      case "PDF":
        return <FileText size={18} className="text-rose-600" />;
      case "VIDEO":
        return <Video size={18} className="text-blue-600" />;
      case "SLIDE":
        return <Presentation size={18} className="text-amber-600" />;
      default:
        return <File size={18} className="text-slate-600" />;
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-navy-900 text-white shadow-xs">
              <BookOpen size={19} />
            </span>
            <h1 className="font-display text-2xl font-bold tracking-tight text-navy-950">
              Repositori Materi &amp; Modul Ajar
            </h1>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Perpustakaan digital bahan ajar: modul PDF, presentasi PPT, dan media pembelajaran ({tahunAjaranAktif} - {semesterAktif})
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setOpenModal(true)}
          className="gap-2 bg-navy-900 text-white hover:bg-navy-800 text-xs cursor-pointer shadow-xs"
        >
          <Plus size={14} />
          Upload Materi Baru
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="border-border bg-white shadow-2xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Total Bahan Ajar</span>
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-navy-50 text-navy-900">
                <BookOpen size={16} />
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-navy-950">{totalMateri}</div>
            <div className="mt-1 text-[11px] text-emerald-600 font-medium">● Siap Diakses Siswa</div>
          </CardContent>
        </Card>

        <Card className="border-border bg-white shadow-2xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Modul PDF</span>
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-rose-50 text-rose-700">
                <FileText size={16} />
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-navy-950">{totalPdf}</div>
            <div className="mt-1 text-[11px] text-slate-500">E-Book &amp; Handout</div>
          </CardContent>
        </Card>

        <Card className="border-border bg-white shadow-2xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Slide Presentasi</span>
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-amber-50 text-amber-700">
                <Presentation size={16} />
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-navy-950">{totalSlide}</div>
            <div className="mt-1 text-[11px] text-slate-500">PowerPoint &amp; Canva</div>
          </CardContent>
        </Card>

        <Card className="border-border bg-white shadow-2xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Video Pembelajaran</span>
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-blue-50 text-blue-700">
                <Video size={16} />
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-navy-950">{totalVideo}</div>
            <div className="mt-1 text-[11px] text-slate-500">Animasi &amp; Rekaman KBM</div>
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
                placeholder="Cari judul materi atau guru..."
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

              <select
                value={filterTipe}
                onChange={(e) => setFilterTipe(e.target.value)}
                className="h-9 rounded-xl border border-input bg-white px-3 text-xs text-slate-700 outline-none shadow-2xs"
              >
                <option value="SEMUA">Semua Format</option>
                {tipeOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
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
                  <th className="px-5 py-3">Materi Ajar</th>
                  <th className="px-5 py-3">Format</th>
                  <th className="px-5 py-3">Mata Pelajaran &amp; Guru</th>
                  <th className="px-5 py-3">Kelas</th>
                  <th className="px-5 py-3">Ukuran</th>
                  <th className="px-5 py-3">Tanggal Unggah</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400">
                      Tidak ada materi ajar yang cocok dengan filter pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredList.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-100 border border-slate-200">
                            {getIconTipe(m.tipe)}
                          </span>
                          <div>
                            <div className="font-bold text-navy-950 text-sm leading-snug">{m.judul}</div>
                            <div className="text-[11px] text-slate-400">ID: {m.id}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <Badge variant="outline" className="font-mono text-[10px]">
                          {m.tipe}
                        </Badge>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-navy-900">{m.mapel}</div>
                        <div className="text-[11px] text-slate-500">{m.guruNama}</div>
                      </td>

                      <td className="px-5 py-3.5 font-medium text-slate-700">
                        {m.kelas}
                      </td>

                      <td className="px-5 py-3.5 font-mono text-[11px] text-slate-600">
                        {m.ukuranFile}
                      </td>

                      <td className="px-5 py-3.5 font-mono text-[11px] text-slate-500">
                        {m.tanggalUpload}
                      </td>

                      <td className="px-5 py-3.5 text-right space-x-1">
                        <button
                          type="button"
                          onClick={() => alert("Mengunduh materi: " + m.judul)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-navy-900 hover:bg-slate-100 transition-colors"
                          title="Download Materi"
                        >
                          <Download size={15} />
                        </button>

                        <button
                          type="button"
                          onClick={() => hapusMateri(m.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Hapus Materi"
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

      {/* MODAL UPLOAD MATERI */}
      {openModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-fade-up space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display text-base font-bold text-navy-950 flex items-center gap-2">
                <Plus size={18} className="text-navy-900" />
                Upload Bahan Ajar Baru
              </h3>
              <button onClick={() => setOpenModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitTambah} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Judul Materi / Modul *</label>
                <Input
                  required
                  value={formMateri.judul}
                  onChange={(e) => setFormMateri({ ...formMateri, judul: e.target.value })}
                  placeholder="Contoh: Modul 02 - Barisan dan Deret Geometri"
                  className="h-9 text-xs rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Mata Pelajaran</label>
                  <select
                    value={formMateri.mapel}
                    onChange={(e) => setFormMateri({ ...formMateri, mapel: e.target.value })}
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
                  <label className="font-semibold text-slate-700">Kelas</label>
                  <select
                    value={formMateri.kelas}
                    onChange={(e) => setFormMateri({ ...formMateri, kelas: e.target.value })}
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
                  <label className="font-semibold text-slate-700">Format Bahan Ajar</label>
                  <select
                    value={formMateri.tipe}
                    onChange={(e) => setFormMateri({ ...formMateri, tipe: e.target.value as any })}
                    className="h-9 w-full rounded-xl border border-input bg-white px-3 text-xs text-slate-700 outline-none"
                  >
                    {tipeOptions.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Guru Pengampu</label>
                  <Input
                    value={formMateri.guruNama}
                    onChange={(e) => setFormMateri({ ...formMateri, guruNama: e.target.value })}
                    className="h-9 text-xs rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Pilih Berkas File (Simulasi)</label>
                <div className="border border-dashed border-slate-300 rounded-xl p-4 text-center bg-slate-50 text-slate-500 cursor-pointer hover:bg-slate-100">
                  <FileText size={24} className="mx-auto text-slate-400 mb-1" />
                  <p className="font-medium text-xs">Klik untuk memilih file PDF / PPT / MP4</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Maksimum ukuran file: 25 MB</p>
                </div>
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
                  Simpan &amp; Bagikan ke Kelas
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
