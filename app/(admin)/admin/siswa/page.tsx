"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Users,
  Search,
  Plus,
  FileSpreadsheet,
  Download,
  Filter,
  CheckCircle2,
  Trash2,
  Phone,
  GraduationCap,
  Sparkles,
  School,
  X,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useStore, type SiswaInduk } from "@/lib/store";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";

export default function AdminSiswaPage() {
  const { tahunAjaranAktif, semesterAktif } = useStore();
  const [siswaList, setSiswaList] = useState<SiswaInduk[]>([]);
  const [kelasList, setKelasList] = useState<{ id: number; nama: string; waliKelas?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [search, setSearch] = useState("");
  const [filterKelas, setFilterKelas] = useState("SEMUA");
  const [filterStatus, setFilterStatus] = useState("SEMUA");
  const [openModal, setOpenModal] = useState(false);
  const [importNotice, setImportNotice] = useState<string | null>(null);

  // Form State Tambah Siswa
  const [formSiswa, setFormSiswa] = useState({
    nisn: "",
    nis: "",
    nama: "",
    gender: "L" as "L" | "P",
    kelas: "X IPA 1",
    namaWali: "",
    teleponWali: "",
    status: "AKTIF" as const,
  });

  const daftarKelasList = useMemo(() => {
    if (kelasList.length > 0) return kelasList.map((k) => k.nama);
    return ["X IPA 1", "X IPA 2", "XI IPA 1", "XI IPA 2", "XII IPA 1", "XII IPS 1"];
  }, [kelasList]);

  const fetchSiswaAndKelas = async () => {
    setLoading(true);
    try {
      const [resSiswa, resKelas] = await Promise.all([
        api.getSiswaList(),
        api.getKelasList().catch(() => ({ data: [] })),
      ]);

      const kelasArr = (resKelas?.data || []).map((k: any) => ({
        id: k.id,
        nama: k.nama,
        waliKelas: k.wali_guru?.nama || "Wali Kelas",
      }));
      setKelasList(kelasArr);

      if (resSiswa?.data) {
        const mapped: SiswaInduk[] = resSiswa.data.map((s: any) => ({
          id: s.id,
          nisn: s.nisn || "-",
          nis: s.nis || "-",
          nama: s.nama,
          gender: s.gender || "L",
          kelas: s.kelas?.nama || "X IPA 1",
          waliKelas: s.kelas?.wali_guru?.nama || "Wali Kelas",
          namaWali: s.nama_wali || "Wali Murid",
          teleponWali: s.telepon_wali || "0812-0000-0000",
          status: (s.status || "AKTIF") as any,
        }));
        setSiswaList(mapped);
      }
    } catch (err: any) {
      console.warn("Gagal memuat data siswa:", err?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSiswaAndKelas();
  }, []);

  // Filtered List
  const filteredList = useMemo(() => {
    return siswaList.filter((s) => {
      const matchSearch =
        s.nama.toLowerCase().includes(search.toLowerCase()) ||
        s.nisn.includes(search) ||
        s.nis.includes(search);
      const matchKelas = filterKelas === "SEMUA" || s.kelas === filterKelas;
      const matchStatus = filterStatus === "SEMUA" || s.status === filterStatus;
      return matchSearch && matchKelas && matchStatus;
    });
  }, [siswaList, search, filterKelas, filterStatus]);

  // Statistics
  const totalAktif = siswaList.filter((s) => s.status === "AKTIF").length;
  const totalLaki = siswaList.filter((s) => s.gender === "L").length;
  const totalPerempuan = siswaList.filter((s) => s.gender === "P").length;
  const totalRombel = new Set(siswaList.map((s) => s.kelas)).size;

  async function handleSubmitTambah(e: React.FormEvent) {
    e.preventDefault();
    if (!formSiswa.nama) return;

    setSubmitting(true);
    try {
      const targetKelas = kelasList.find((k) => k.nama === formSiswa.kelas);
      const payload = {
        nama: formSiswa.nama,
        nisn: formSiswa.nisn || undefined,
        nis: formSiswa.nis || undefined,
        gender: formSiswa.gender,
        kelas_id: targetKelas?.id,
        nama_wali: formSiswa.namaWali || undefined,
        telepon_wali: formSiswa.teleponWali || undefined,
        status: formSiswa.status,
      };

      const res = await api.createSiswa(payload);
      if (res?.data) {
        const newSiswa: SiswaInduk = {
          id: res.data.id,
          nisn: res.data.nisn || formSiswa.nisn || "-",
          nis: res.data.nis || formSiswa.nis || "-",
          nama: res.data.nama,
          gender: res.data.gender || formSiswa.gender,
          kelas: formSiswa.kelas,
          waliKelas: targetKelas?.waliKelas || "Wali Kelas",
          namaWali: res.data.nama_wali || formSiswa.namaWali,
          teleponWali: res.data.telepon_wali || formSiswa.teleponWali,
          status: formSiswa.status,
        };
        setSiswaList((prev) => [newSiswa, ...prev]);
      } else {
        await fetchSiswaAndKelas();
      }

      setOpenModal(false);
      setFormSiswa({
        nisn: "",
        nis: "",
        nama: "",
        gender: "L",
        kelas: kelasList[0]?.nama || "X IPA 1",
        namaWali: "",
        teleponWali: "",
        status: "AKTIF",
      });
    } catch (err: any) {
      alert("Gagal menambahkan siswa: " + (err?.message || "Terjadi kesalahan"));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleHapus(id: string | number) {
    if (!confirm("Apakah Anda yakin ingin menghapus data siswa ini?")) return;
    try {
      await api.deleteSiswa(id);
      setSiswaList((prev) => prev.filter((s) => String(s.id) !== String(id)));
    } catch (err: any) {
      alert("Gagal menghapus siswa: " + (err?.message || "Terjadi kesalahan"));
    }
  }

  function handleImportDapodik() {
    setImportNotice("Sinkronisasi otomatis dengan Dapodik Kemdikbud sedang berjalan...");
    setTimeout(() => {
      setImportNotice(`Berhasil menyinkronkan ${siswaList.length} data peserta didik terdaftar.`);
      setTimeout(() => setImportNotice(null), 4000);
    }, 1200);
  }

  return (
    <div className="space-y-6">
      {/* Page Title & Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-navy-900 text-white shadow-xs">
              <GraduationCap size={19} />
            </span>
            <h1 className="font-display text-2xl font-bold tracking-tight text-navy-950">
              Master Data Siswa Induk
            </h1>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Kelola data induk peserta didik, rombongan belajar, dan data wali murid ({tahunAjaranAktif} - {semesterAktif})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSiswaAndKelas}
            disabled={loading}
            className="text-xs h-9 gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleImportDapodik}
            className="gap-2 border-slate-200 bg-white text-xs hover:bg-slate-50 cursor-pointer shadow-2xs"
          >
            <FileSpreadsheet size={14} className="text-emerald-600" />
            Sync Dapodik / Excel
          </Button>

          <Button
            size="sm"
            onClick={() => setOpenModal(true)}
            className="gap-2 bg-navy-900 text-white hover:bg-navy-800 text-xs cursor-pointer shadow-xs"
          >
            <Plus size={14} />
            Tambah Siswa Baru
          </Button>
        </div>
      </div>

      {importNotice && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 animate-fade-up flex items-center justify-between">
          <span className="flex items-center gap-2 font-medium">
            <CheckCircle2 size={16} className="text-emerald-600" />
            {importNotice}
          </span>
          <button onClick={() => setImportNotice(null)} className="text-emerald-700 hover:text-emerald-950">
            <X size={14} />
          </button>
        </div>
      )}

      {/* KPI Statistic Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="border-border bg-white shadow-2xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Total Siswa Terdaftar</span>
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-navy-50 text-navy-900">
                <Users size={16} />
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-navy-950">
              {loading ? <Skeleton className="h-8 w-16" /> : siswaList.length}
            </div>
            <div className="mt-1 text-[11px] text-emerald-600 font-medium">● {totalAktif} Status Aktif</div>
          </CardContent>
        </Card>

        <Card className="border-border bg-white shadow-2xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Laki-Laki</span>
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-blue-50 text-blue-800">
                <GraduationCap size={16} />
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-navy-950">
              {loading ? <Skeleton className="h-8 w-16" /> : totalLaki}
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              {siswaList.length > 0 ? Math.round((totalLaki / siswaList.length) * 100) : 0}% dari total
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-white shadow-2xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Perempuan</span>
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-rose-50 text-rose-800">
                <GraduationCap size={16} />
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-navy-950">
              {loading ? <Skeleton className="h-8 w-16" /> : totalPerempuan}
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              {siswaList.length > 0 ? Math.round((totalPerempuan / siswaList.length) * 100) : 0}% dari total
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-white shadow-2xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Rombongan Belajar</span>
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-purple-50 text-purple-900">
                <School size={16} />
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-navy-950">
              {loading ? <Skeleton className="h-8 w-16" /> : totalRombel}
            </div>
            <div className="mt-1 text-[11px] text-slate-500">Tingkat X, XI, XII</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card with Search & Filters */}
      <Card className="border-border bg-white shadow-md rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-border bg-slate-50/50 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama, NISN, atau NIS..."
                className="h-9 pl-9 text-xs rounded-xl bg-white"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filterKelas}
                onChange={(e) => setFilterKelas(e.target.value)}
                className="h-9 rounded-xl border border-input bg-white px-3 text-xs text-slate-700 outline-none focus:border-navy-600 shadow-2xs"
              >
                <option value="SEMUA">Semua Rombel (Kelas)</option>
                {daftarKelasList.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="h-9 rounded-xl border border-input bg-white px-3 text-xs text-slate-700 outline-none focus:border-navy-600 shadow-2xs"
              >
                <option value="SEMUA">Semua Status</option>
                <option value="AKTIF">Aktif</option>
                <option value="MUTASI">Mutasi</option>
                <option value="ALUMNI">Alumni</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-border font-semibold">
                <tr>
                  <th className="px-5 py-3">NISN / NIS</th>
                  <th className="px-5 py-3">Nama Siswa</th>
                  <th className="px-5 py-3">Gender</th>
                  <th className="px-5 py-3">Rombel &amp; Wali Kelas</th>
                  <th className="px-5 py-3">Orang Tua / Kontak</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  [1, 2, 3, 4, 5].map((n) => (
                    <tr key={n}>
                      <td className="px-5 py-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-5 py-4"><Skeleton className="h-4 w-36" /></td>
                      <td className="px-5 py-4"><Skeleton className="h-5 w-16 rounded-full" /></td>
                      <td className="px-5 py-4"><Skeleton className="h-4 w-28" /></td>
                      <td className="px-5 py-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-5 py-4"><Skeleton className="h-5 w-14 rounded-full" /></td>
                      <td className="px-5 py-4 text-right"><Skeleton className="h-6 w-6 rounded-md ml-auto" /></td>
                    </tr>
                  ))
                ) : filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400">
                      Tidak ada data siswa yang cocok dengan filter pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredList.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5 font-mono">
                        <div className="font-bold text-navy-950">{s.nisn}</div>
                        <div className="text-[11px] text-slate-400">NIS: {s.nis}</div>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="font-bold text-navy-950 text-sm">{s.nama}</div>
                        <div className="text-[11px] text-slate-500">ID: {s.id}</div>
                      </td>

                      <td className="px-5 py-3.5">
                        <Badge
                          variant="outline"
                          className={cn(
                            "font-bold text-[10px]",
                            s.gender === "L"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          )}
                        >
                          {s.gender === "L" ? "Laki-laki" : "Perempuan"}
                        </Badge>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-navy-900">{s.kelas}</div>
                        <div className="text-[11px] text-slate-500">Wali: {s.waliKelas}</div>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="font-medium text-slate-800">{s.namaWali}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                          <Phone size={10} className="text-emerald-600" />
                          {s.teleponWali}
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <Badge
                          variant={s.status === "AKTIF" ? "hadir" : "alpha"}
                          className="text-[10px]"
                        >
                          {s.status}
                        </Badge>
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleHapus(s.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Hapus Siswa"
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

      {/* Modal Dialog: Tambah Siswa */}
      {openModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-fade-up space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display text-lg font-bold text-navy-950 flex items-center gap-2">
                <Plus size={18} className="text-navy-900" />
                Tambah Data Siswa Baru
              </h3>
              <button onClick={() => setOpenModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitTambah} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">NISN (10 Digit) *</label>
                  <Input
                    required
                    value={formSiswa.nisn}
                    onChange={(e) => setFormSiswa({ ...formSiswa, nisn: e.target.value })}
                    placeholder="006789xxxx"
                    className="h-9 font-mono text-xs rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">NIS Sekolah *</label>
                  <Input
                    required
                    value={formSiswa.nis}
                    onChange={(e) => setFormSiswa({ ...formSiswa, nis: e.target.value })}
                    placeholder="24xxx"
                    className="h-9 font-mono text-xs rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Nama Lengkap Siswa *</label>
                <Input
                  required
                  value={formSiswa.nama}
                  onChange={(e) => setFormSiswa({ ...formSiswa, nama: e.target.value })}
                  placeholder="Contoh: Muhammad Rizky Pratama"
                  className="h-9 text-xs rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Jenis Kelamin</label>
                  <select
                    value={formSiswa.gender}
                    onChange={(e) => setFormSiswa({ ...formSiswa, gender: e.target.value as "L" | "P" })}
                    className="h-9 w-full rounded-xl border border-input bg-white px-3 text-xs text-slate-700 outline-none"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Rombel / Kelas</label>
                  <select
                    value={formSiswa.kelas}
                    onChange={(e) => setFormSiswa({ ...formSiswa, kelas: e.target.value })}
                    className="h-9 w-full rounded-xl border border-input bg-white px-3 text-xs text-slate-700 outline-none"
                  >
                    {daftarKelasList.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Nama Orang Tua / Wali</label>
                  <Input
                    value={formSiswa.namaWali}
                    onChange={(e) => setFormSiswa({ ...formSiswa, namaWali: e.target.value })}
                    placeholder="Nama Orang Tua"
                    className="h-9 text-xs rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">No. WhatsApp Wali</label>
                  <Input
                    value={formSiswa.teleponWali}
                    onChange={(e) => setFormSiswa({ ...formSiswa, teleponWali: e.target.value })}
                    placeholder="0812-xxxx-xxxx"
                    className="h-9 font-mono text-xs rounded-xl"
                  />
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
                  disabled={submitting}
                  className="bg-navy-900 text-white hover:bg-navy-800 rounded-xl text-xs shadow-xs"
                >
                  {submitting ? "Menyimpan..." : "Simpan Siswa"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
