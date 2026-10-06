"use client";

import * as XLSX from "xlsx";
import { useMemo, useState, useEffect } from "react";
import {
  Download,
  Filter,
  CheckCircle2,
  Activity,
  Clock,
  AlertTriangle,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  Search,
  Printer,
  FileSpreadsheet,
  X,
  RefreshCw,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface RekapItem {
  siswa_id: number;
  nama: string;
  nis: string;
  kelas: string;
  hadir: number;
  sakit: number;
  izin: number;
  alpha: number;
  total_sesi: number;
  persentase_hadir: number;
}

interface KelasItem {
  id: number;
  nama: string;
  tingkat?: string;
  jurusan?: string;
  total_siswa?: number;
}

export default function AdminLaporanPage() {
  const [kelasFilter, setKelasFilter] = useState<string>("all");
  const [tingkatFilter, setTingkatFilter] = useState<string>("Semua");
  const [cariSiswa, setCariSiswa] = useState<string>("");
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [bukaSemuaPerhatian, setBukaSemuaPerhatian] = useState(false);
  const [fokusPerhatian, setFokusPerhatian] = useState(false);

  const [loading, setLoading] = useState(true);
  const [rekapList, setRekapList] = useState<RekapItem[]>([]);
  const [kelasList, setKelasList] = useState<KelasItem[]>([]);

  const fetchLaporanData = async () => {
    setLoading(true);
    try {
      const [rekapRes, kelasRes] = await Promise.allSettled([
        api.getRekapAbsensi(kelasFilter),
        api.getKelasList(),
      ]);

      if (kelasRes.status === "fulfilled" && kelasRes.value?.data) {
        setKelasList(kelasRes.value.data);
      }
      if (rekapRes.status === "fulfilled" && rekapRes.value?.data) {
        setRekapList(rekapRes.value.data);
      } else {
        setRekapList([]);
      }
    } catch (err) {
      console.error("Gagal memuat laporan kehadiran:", err);
      setRekapList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLaporanData();
  }, [kelasFilter]);

  const totalHadir = useMemo(() => rekapList.reduce((a, r) => a + r.hadir, 0), [rekapList]);
  const totalSakit = useMemo(() => rekapList.reduce((a, r) => a + r.sakit, 0), [rekapList]);
  const totalIzin = useMemo(() => rekapList.reduce((a, r) => a + r.izin, 0), [rekapList]);
  const totalAlpha = useMemo(() => rekapList.reduce((a, r) => a + r.alpha, 0), [rekapList]);
  const totalCatatan = totalHadir + totalSakit + totalIzin + totalAlpha;
  const persenHadir = totalCatatan
    ? Math.round((totalHadir / totalCatatan) * 100)
    : 0;

  const perluPerhatian = useMemo(
    () =>
      [...rekapList]
        .filter((r) => r.alpha >= 2)
        .sort((a, b) => b.alpha - a.alpha),
    [rekapList]
  );

  const dataTampil = useMemo(() => {
    let res = rekapList;
    if (fokusPerhatian) {
      res = res.filter((r) => r.alpha >= 2);
    }
    if (cariSiswa.trim()) {
      const q = cariSiswa.toLowerCase();
      res = res.filter(
        (r) =>
          (r.nama && r.nama.toLowerCase().includes(q)) ||
          (r.nis && r.nis.toLowerCase().includes(q))
      );
    }
    return res;
  }, [rekapList, fokusPerhatian, cariSiswa]);

  const perhatianDitampilkan = bukaSemuaPerhatian
    ? perluPerhatian
    : perluPerhatian.slice(0, 3);

  // Grouping by grade level (Tingkat 10/X, 11/XI, 12/XII)
  const ringkasanTingkat = useMemo(() => {
    const listTingkat = [
      { key: "10", label: "Tingkat 10 / X", prefix: ["X", "10"] },
      { key: "11", label: "Tingkat 11 / XI", prefix: ["XI", "11"] },
      { key: "12", label: "Tingkat 12 / XII", prefix: ["XII", "12"] },
    ];

    return listTingkat.map((t) => {
      const kelasInTingkat = kelasList.filter((k) =>
        t.prefix.some((pfx) => k.nama.startsWith(pfx) || String(k.tingkat) === t.key)
      );
      const kelasNames = kelasInTingkat.map((k) => k.nama);
      const siswaInTingkat = rekapList.filter((r) => kelasNames.includes(r.kelas));
      const totalSiswa = siswaInTingkat.length;
      const hadirTingkat = siswaInTingkat.reduce((a, b) => a + b.hadir, 0);
      const sesiTingkat = siswaInTingkat.reduce((a, b) => a + b.total_sesi, 0);
      const avg = sesiTingkat > 0 ? Math.round((hadirTingkat / sesiTingkat) * 100) : 100;

      return {
        key: t.key,
        label: t.label,
        jumlahKelas: kelasInTingkat.length,
        totalSiswa,
        rataKehadiran: avg,
      };
    });
  }, [kelasList, rekapList]);

  const kelasTersaring = useMemo(() => {
    if (tingkatFilter === "Semua") return kelasList;
    return kelasList.filter((k) =>
      k.nama.startsWith(tingkatFilter) || String(k.tingkat) === tingkatFilter
    );
  }, [tingkatFilter, kelasList]);

  function unduhExcel() {
    const rows = dataTampil.map((r, idx) => ({
      No: idx + 1,
      "Nama Siswa": r.nama,
      NIS: r.nis,
      Kelas: r.kelas,
      "Hadir (H)": r.hadir,
      "Sakit (S)": r.sakit,
      "Izin (I)": r.izin,
      "Alpha (A)": r.alpha,
      "Total Sesi": r.total_sesi,
      "Persentase Kehadiran": `${r.persentase_hadir ?? Math.round((r.hadir / (r.total_sesi || 1)) * 100)}%`,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Kehadiran");
    XLSX.writeFile(
      workbook,
      `Laporan-Presensi-Siswa-${kelasFilter === "all" ? "Semua" : kelasFilter}.xlsx`
    );
  }

  function unduhCSV() {
    const header = "Nama,NIS,Kelas,Hadir,Sakit,Izin,Alpha,Total Sesi,Persentase\n";
    const rows = dataTampil
      .map(
        (r) =>
          `"${r.nama}","${r.nis}","${r.kelas}",${r.hadir},${r.sakit},${r.izin},${r.alpha},${r.total_sesi},${r.persentase_hadir}%`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `laporan-sekolah-${kelasFilter === "all" ? "semua" : kelasFilter}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="w-full space-y-6">
      {/* Header & Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-navy-950 md:text-3xl">
            Laporan Presensi Sekolah
          </h1>
          <p className="text-xs text-muted-foreground">
            Monitoring rekapitulasi kehadiran seluruh siswa dan analitik absensi langsung dari Supabase
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLaporanData}
            disabled={loading}
            className="gap-1.5 border-border bg-white text-xs hover:bg-slate-50"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            Segarkan
          </Button>

          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400" />
            <select
              value={kelasFilter}
              onChange={(e) => setKelasFilter(e.target.value)}
              className="h-9 rounded-lg border border-border bg-white px-3 text-xs font-medium text-navy-900 shadow-xs outline-none focus:border-navy-600"
            >
              <option value="all">Semua Kelas</option>
              {kelasList.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.nama}
                </option>
              ))}
            </select>
          </div>

          <Button
            size="sm"
            onClick={unduhExcel}
            disabled={loading || dataTampil.length === 0}
            className="gap-1.5 bg-emerald-700 text-white hover:bg-emerald-800 font-medium shadow-xs"
          >
            <FileSpreadsheet size={14} />
            Unduh Excel (.xlsx)
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsPrintModalOpen(true)}
            className="gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
          >
            <Printer size={14} />
            Cetak Rekap Resmi
          </Button>
        </div>
      </div>

      {/* Row 1: KPI Metrics Row */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-border bg-white p-5 animate-pulse">
              <div className="h-3.5 w-24 rounded bg-slate-200" />
              <div className="mt-4 h-8 w-16 rounded bg-slate-200" />
              <div className="mt-3 h-3 w-36 rounded bg-slate-200" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Presensi Keseluruhan */}
          <Card className="border-border bg-white shadow-2xs transition-all hover:shadow-xs">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Presensi Keseluruhan
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <CheckCircle2 size={18} />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-mono text-3xl font-bold tracking-tight text-navy-950">
                  {persenHadir}%
                </span>
                <Badge variant="hadir" className="text-[10px] py-0 px-1.5">
                  {persenHadir >= 90 ? "Sangat Baik" : persenHadir >= 75 ? "Baik" : "Evaluasi"}
                </Badge>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Rata-rata kehadiran seluruh tingkat siswa
              </p>
            </CardContent>
          </Card>

          {/* Card 2: Akumulasi Sakit */}
          <Card className="border-border bg-white shadow-2xs transition-all hover:shadow-xs">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Akumulasi Sakit
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <Activity size={18} />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-mono text-3xl font-bold tracking-tight text-amber-600">
                  {totalSakit}
                </span>
                <span className="text-xs text-muted-foreground">kali sesi</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Tercatat dengan surat dokter atau izin medis
              </p>
            </CardContent>
          </Card>

          {/* Card 3: Akumulasi Izin */}
          <Card className="border-border bg-white shadow-2xs transition-all hover:shadow-xs">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Akumulasi Izin
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                  <Clock size={18} />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-mono text-3xl font-bold tracking-tight text-sky-600">
                  {totalIzin}
                </span>
                <span className="text-xs text-muted-foreground">kali sesi</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Izin resmi terverifikasi orang tua / wali
              </p>
            </CardContent>
          </Card>

          {/* Card 4: Total Alpha */}
          <Card className="border-border bg-white shadow-2xs transition-all hover:shadow-xs">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Total Alpha
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                  <AlertTriangle size={18} />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-mono text-3xl font-bold tracking-tight text-rose-600">
                  {totalAlpha}
                </span>
                <span className="text-xs text-muted-foreground">kali tanpa kabar</span>
              </div>
              <p className="mt-2 text-xs font-medium text-rose-600/80">
                Peringatan otomatis &amp; koordinasi BK
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Row 2: Ringkasan per Tingkat Kelas */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {ringkasanTingkat.map((t) => (
          <Card key={t.key} className="border-border bg-white shadow-2xs">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-navy-50 text-navy-900">
                    <GraduationCap size={16} />
                  </div>
                  <span className="font-semibold text-sm text-navy-950">{t.label}</span>
                </div>
                <Badge variant="outline" className="text-[11px] font-mono">
                  {t.jumlahKelas} Rombel
                </Badge>
              </div>

              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-xs text-muted-foreground">Rata Kehadiran:</span>
                <span className="font-mono text-lg font-bold text-navy-950">
                  {t.rataKehadiran}%
                </span>
              </div>
              <div className="mt-2">
                <Progress value={t.rataKehadiran} className="h-1.5" />
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>{t.totalSiswa} Siswa terdata</span>
                <span className="text-emerald-600 font-medium">
                  {t.rataKehadiran >= 90 ? "Target tercapai" : "Perlu ditingkatkan"}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Scalable Alert Banner for At-risk Students */}
      {!loading && perluPerhatian.length > 0 && (
        <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-4 transition-all shadow-2xs">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-100 text-rose-700">
                <AlertTriangle size={15} />
              </div>
              <div>
                <span className="text-xs font-bold text-rose-900">
                  Perlu Perhatian Khusus (&gt;1x Alpha)
                </span>
                <span className="ml-2 inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-800">
                  {perluPerhatian.length} Siswa
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1 sm:pt-0">
              {perluPerhatian.length > 3 && (
                <button
                  type="button"
                  onClick={() => setBukaSemuaPerhatian((v) => !v)}
                  className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-2.5 py-1 text-xs font-medium text-rose-800 transition-colors hover:bg-rose-100/50"
                >
                  <span>
                    {bukaSemuaPerhatian
                      ? "Tampilkan 3 Teratas"
                      : `Lihat Semua (${perluPerhatian.length})`}
                  </span>
                  {bukaSemuaPerhatian ? (
                    <ChevronUp size={13} />
                  ) : (
                    <ChevronDown size={13} />
                  )}
                </button>
              )}

              <button
                type="button"
                onClick={() => setFokusPerhatian((v) => !v)}
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  fokusPerhatian
                    ? "bg-rose-700 text-white font-semibold shadow-xs"
                    : "border border-rose-200 bg-white text-rose-800 hover:bg-rose-100/50"
                }`}
              >
                <span>{fokusPerhatian ? "Tampilkan Semua" : "Fokuskan Tabel"}</span>
              </button>
            </div>
          </div>

          <div className="mt-3">
            <div
              className={`grid grid-cols-1 gap-2 text-xs text-rose-900 sm:grid-cols-2 lg:grid-cols-3 ${
                bukaSemuaPerhatian && perluPerhatian.length > 6
                  ? "max-h-64 overflow-y-auto pr-1"
                  : ""
              }`}
            >
              {perhatianDitampilkan.map((r) => (
                <div
                  key={r.siswa_id || r.nis}
                  onClick={() => setCariSiswa(r.nama)}
                  className="flex cursor-pointer items-center justify-between rounded-lg border border-rose-200/80 bg-white p-2.5 transition-all hover:border-rose-300 hover:shadow-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-100 text-[10px] font-bold text-rose-800">
                      {r.nama ? r.nama.slice(0, 2).toUpperCase() : "SW"}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-navy-950">
                        {r.nama}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {r.kelas} · NIS {r.nis}
                      </p>
                    </div>
                  </div>
                  <Badge variant="alpha" className="text-[11px] font-mono shrink-0 ml-2 font-bold">
                    {r.alpha}x alpha
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Table with Search & Record Count */}
      <Card className="border border-border bg-white shadow-xs overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between bg-white">
          <div className="relative flex-1 max-w-sm">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={cariSiswa}
              onChange={(e) => setCariSiswa(e.target.value)}
              placeholder="Cari siswa berdasarkan nama atau NIS..."
              className="h-9 pl-9 text-xs bg-slate-50/70 border-border"
            />
            {cariSiswa && (
              <button
                type="button"
                onClick={() => setCariSiswa("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground hover:text-navy-950"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {fokusPerhatian && (
              <Badge variant="alpha" className="text-[10px]">
                Filter: Perlu Perhatian
              </Badge>
            )}
            <span>
              Menampilkan <strong className="text-navy-950">{dataTampil.length}</strong> siswa
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-navy-50/60">
                <TableHead className="font-semibold text-navy-950">Nama Siswa</TableHead>
                <TableHead className="font-semibold text-navy-950">Kelas</TableHead>
                <TableHead className="text-center font-semibold text-emerald-700">Hadir</TableHead>
                <TableHead className="text-center font-semibold text-amber-700">Sakit</TableHead>
                <TableHead className="text-center font-semibold text-sky-700">Izin</TableHead>
                <TableHead className="text-center font-semibold text-rose-700">Alpha</TableHead>
                <TableHead className="text-center font-semibold text-navy-950">Persentase</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <TableRow key={i} className="animate-pulse">
                    <TableCell>
                      <div className="h-4 w-36 rounded bg-slate-200" />
                      <div className="mt-1 h-3 w-20 rounded bg-slate-200" />
                    </TableCell>
                    <TableCell>
                      <div className="h-3 w-16 rounded bg-slate-200" />
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="mx-auto h-4 w-8 rounded bg-slate-200" />
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="mx-auto h-4 w-8 rounded bg-slate-200" />
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="mx-auto h-4 w-8 rounded bg-slate-200" />
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="mx-auto h-4 w-8 rounded bg-slate-200" />
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="mx-auto h-4 w-12 rounded bg-slate-200" />
                    </TableCell>
                  </TableRow>
                ))
              ) : dataTampil.length > 0 ? (
                dataTampil.map((r) => (
                  <TableRow key={r.siswa_id || r.nis} className="hover:bg-slate-50/80">
                    <TableCell>
                      <p className="font-semibold text-navy-950">{r.nama}</p>
                      <p className="font-mono text-[11px] text-muted-foreground">NIS {r.nis}</p>
                    </TableCell>
                    <TableCell className="text-muted-foreground font-medium">{r.kelas}</TableCell>
                    <TableCell className="text-center font-mono font-semibold text-emerald-600">
                      {r.hadir}
                    </TableCell>
                    <TableCell className="text-center font-mono font-semibold text-amber-600">
                      {r.sakit}
                    </TableCell>
                    <TableCell className="text-center font-mono font-semibold text-sky-600">
                      {r.izin}
                    </TableCell>
                    <TableCell className="text-center font-mono font-semibold text-rose-600">
                      {r.alpha > 0 ? (
                        <Badge variant={r.alpha >= 2 ? "alpha" : "outline"} className="font-mono text-[11px]">
                          {r.alpha}
                        </Badge>
                      ) : (
                        "0"
                      )}
                    </TableCell>
                    <TableCell className="text-center font-mono text-xs font-medium text-navy-950">
                      {r.persentase_hadir ?? (r.total_sesi > 0 ? Math.round((r.hadir / r.total_sesi) * 100) : 100)}%
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-xs text-muted-foreground">
                    Tidak ada data siswa ditemukan untuk kriteria filter ini.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Modal Cetak Rekap Resmi */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-6 md:p-8 space-y-6 my-8">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="font-display font-bold text-navy-950 text-xl">
                  Pratinjau Cetak Laporan Kehadiran Siswa
                </h3>
                <p className="text-xs text-slate-500">
                  Laporan resmi semester berjalan untuk arsip sekolah &amp; Dinas Pendidikan
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => window.print()}
                  className="bg-navy-900 hover:bg-navy-800 text-white gap-2 font-medium cursor-pointer shadow-xs"
                >
                  <Printer className="h-4 w-4" />
                  Cetak / Simpan PDF
                </Button>
                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="border border-slate-300 p-8 rounded-lg bg-white text-slate-900 space-y-6">
              <div className="text-center border-b-2 border-double border-slate-900 pb-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  PEMERINTAH DAERAH PROVINSI
                </h4>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  DINAS PENDIDIKAN DAN KEBUDAYAAN
                </h4>
                <h2 className="text-lg font-black tracking-wide text-slate-950 uppercase mt-1">
                  SEKOLAH MENENGAH ATAS CONTOH
                </h2>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Jl. Pendidikan No. 45 Telp. (0251) 8321000 Fax. 8321001 Email: info@sekolah.sch.id
                </p>
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-sm font-bold tracking-tight uppercase underline text-slate-950">
                  LAPORAN AKUMULASI PRESENSI SISWA
                </h3>
                <p className="text-xs text-slate-600">
                  Filter: {kelasFilter === "all" ? "Seluruh Rombongan Belajar" : `Kelas ID ${kelasFilter}`} · Tahun Ajaran Berjalan
                </p>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center text-xs bg-slate-50 p-3 rounded border border-slate-200">
                <div>
                  <span className="text-slate-500 block">Total Siswa:</span>
                  <span className="font-bold text-slate-900">{dataTampil.length} Orang</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Rata Kehadiran:</span>
                  <span className="font-bold text-emerald-700">{persenHadir}%</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Total Sakit &amp; Izin:</span>
                  <span className="font-bold text-sky-700">{totalSakit + totalIzin} Kali</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Total Alpha:</span>
                  <span className="font-bold text-rose-700">{totalAlpha} Kali</span>
                </div>
              </div>

              <div className="overflow-x-auto max-h-80">
                <table className="w-full text-[11px] border-collapse border border-slate-400">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 text-center font-bold">
                      <th className="border border-slate-400 p-2 w-8">No</th>
                      <th className="border border-slate-400 p-2">Nama Siswa</th>
                      <th className="border border-slate-400 p-2 w-28">NIS</th>
                      <th className="border border-slate-400 p-2 w-28">Kelas</th>
                      <th className="border border-slate-400 p-2 w-16">Hadir</th>
                      <th className="border border-slate-400 p-2 w-16">Sakit</th>
                      <th className="border border-slate-400 p-2 w-16">Izin</th>
                      <th className="border border-slate-400 p-2 w-16">Alpha</th>
                      <th className="border border-slate-400 p-2 w-20">% Hadir</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataTampil.slice(0, 30).map((item, idx) => (
                      <tr key={item.siswa_id || idx} className="text-slate-900 text-center">
                        <td className="border border-slate-400 p-1.5">{idx + 1}</td>
                        <td className="border border-slate-400 p-1.5 text-left font-medium">{item.nama}</td>
                        <td className="border border-slate-400 p-1.5 font-mono">{item.nis}</td>
                        <td className="border border-slate-400 p-1.5">{item.kelas}</td>
                        <td className="border border-slate-400 p-1.5 font-bold text-emerald-700">{item.hadir}</td>
                        <td className="border border-slate-400 p-1.5 text-amber-700">{item.sakit}</td>
                        <td className="border border-slate-400 p-1.5 text-sky-700">{item.izin}</td>
                        <td className="border border-slate-400 p-1.5 text-rose-700">{item.alpha}</td>
                        <td className="border border-slate-400 p-1.5 font-bold">
                          {item.persentase_hadir ?? (item.total_sesi > 0 ? Math.round((item.hadir / item.total_sesi) * 100) : 100)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-2 pt-8 text-xs text-center">
                <div>
                  <p>Petugas Rekapitulasi Presensi,</p>
                  <div className="h-16 flex items-center justify-center">
                    <span className="text-[10px] text-slate-400 italic">( Terverifikasi Sistem Hadirin )</span>
                  </div>
                  <p className="font-bold underline text-slate-950">Tim Kesiswaan</p>
                  <p className="text-[10px] text-slate-500 font-mono">NIP. -</p>
                </div>
                <div>
                  <p>Mengetahui,</p>
                  <p className="font-semibold text-slate-900">Kepala Sekolah</p>
                  <div className="h-14 flex items-center justify-center">
                    <span className="text-[10px] text-slate-400 italic">( Tanda Tangan &amp; Stempel Resmi )</span>
                  </div>
                  <p className="font-bold underline text-slate-950">Pimpinan Lembaga</p>
                  <p className="text-[10px] text-slate-500 font-mono">NIP. -</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
