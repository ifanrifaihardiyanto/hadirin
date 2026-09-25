"use client";

import { useMemo, useState } from "react";
import {
  Download,
  TriangleAlert,
  Filter,
  CheckCircle2,
  Activity,
  Clock,
  AlertTriangle,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  Search,
} from "lucide-react";
import { rekapBulanIni, kelasSeluruhSekolah } from "@/lib/mock-data";
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

export default function AdminLaporanPage() {
  const [kelasFilter, setKelasFilter] = useState<string>("Semua kelas");
  const [tingkatFilter, setTingkatFilter] = useState<string>("Semua");
  const [cariSiswa, setCariSiswa] = useState<string>("");
  const [bukaSemuaPerhatian, setBukaSemuaPerhatian] = useState(false);
  const [fokusPerhatian, setFokusPerhatian] = useState(false);

  const daftarKelas = useMemo(
    () => ["Semua kelas", ...Array.from(new Set(rekapBulanIni.map((r) => r.kelas)))],
    []
  );

  const data = useMemo(
    () =>
      kelasFilter === "Semua kelas"
        ? rekapBulanIni
        : rekapBulanIni.filter((r) => r.kelas === kelasFilter),
    [kelasFilter]
  );

  const totalHadir = data.reduce((a, r) => a + r.hadir, 0);
  const totalSakit = data.reduce((a, r) => a + r.sakit, 0);
  const totalIzin = data.reduce((a, r) => a + r.izin, 0);
  const totalAlpha = data.reduce((a, r) => a + r.alpha, 0);
  const totalCatatan = totalHadir + totalSakit + totalIzin + totalAlpha;
  const persenHadir = totalCatatan
    ? Math.round((totalHadir / totalCatatan) * 100)
    : 0;

  const perluPerhatian = useMemo(
    () =>
      [...data]
        .filter((r) => r.alpha >= 2)
        .sort((a, b) => b.alpha - a.alpha),
    [data]
  );

  const dataTampil = useMemo(() => {
    let res = data;
    if (fokusPerhatian) {
      res = res.filter((r) => r.alpha >= 2);
    }
    if (cariSiswa.trim()) {
      const q = cariSiswa.toLowerCase();
      res = res.filter(
        (r) => r.nama.toLowerCase().includes(q) || r.nis.includes(q)
      );
    }
    return res;
  }, [data, fokusPerhatian, cariSiswa]);

  const perhatianDitampilkan = bukaSemuaPerhatian
    ? perluPerhatian
    : perluPerhatian.slice(0, 3);

  // Grouping by grade level (Tingkat X, XI, XII)
  const ringkasanTingkat = useMemo(() => {
    const listTingkat = [
      { key: "X", label: "Kelas X (Sepuluh)", prefix: "X " },
      { key: "XI", label: "Kelas XI (Sebelas)", prefix: "XI " },
      { key: "XII", label: "Kelas XII (Dua Belas)", prefix: "XII " },
    ];

    return listTingkat.map((t) => {
      const kelasList = kelasSeluruhSekolah.filter((k) => k.kelas.startsWith(t.prefix));
      const totalSiswa = kelasList.reduce((a, b) => a + b.jumlahSiswa, 0);
      const avg = kelasList.length
        ? Math.round(kelasList.reduce((a, b) => a + b.rataKehadiran, 0) / kelasList.length)
        : 0;
      return {
        ...t,
        jumlahKelas: kelasList.length,
        totalSiswa,
        rataKehadiran: avg,
      };
    });
  }, []);

  const kelasTersaring = useMemo(() => {
    if (tingkatFilter === "Semua") return kelasSeluruhSekolah;
    return kelasSeluruhSekolah.filter((k) => k.kelas.startsWith(tingkatFilter + " "));
  }, [tingkatFilter]);

  function unduhCSV() {
    const header = "Nama,NIS,Kelas,Hadir,Sakit,Izin,Alpha,Total Sesi\n";
    const rows = dataTampil
      .map(
        (r) =>
          `${r.nama},${r.nis},${r.kelas},${r.hadir},${r.sakit},${r.izin},${r.alpha},${r.totalSesi}`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `laporan-sekolah-${kelasFilter.replace(/\s+/g, "-").toLowerCase()}.csv`;
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
            Monitoring rekapitulasi kehadiran seluruh siswa dan analitik absensi
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400" />
            <select
              value={kelasFilter}
              onChange={(e) => setKelasFilter(e.target.value)}
              className="h-9 rounded-lg border border-border bg-white px-3 text-xs font-medium text-navy-900 shadow-xs outline-none focus:border-navy-600"
            >
              {daftarKelas.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>

          <Button
            size="sm"
            onClick={unduhCSV}
            className="gap-1.5 bg-navy-900 text-white hover:bg-navy-800"
          >
            <Download size={14} />
            Unduh Laporan CSV
          </Button>
        </div>
      </div>

      {/* Row 1: KPI Metrics Row (Presisi, Proporsional & Rapi) */}
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
                Sangat Baik
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
              <span className="text-xs text-muted-foreground">siswa terdata</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Tercatat dengan surat izin dokter
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
              <span className="text-xs text-muted-foreground">siswa terdata</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Pemberitahuan resmi orang tua/wali
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Akumulasi Alpha */}
        <Card className="border-border bg-white shadow-2xs transition-all hover:shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Akumulasi Alpha
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                <AlertTriangle size={18} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-mono text-3xl font-bold tracking-tight text-rose-600">
                {totalAlpha}
              </span>
              <span className="text-xs text-muted-foreground">sesi tanpa keterangan</span>
            </div>
            <p className="mt-2 text-xs font-medium text-rose-600/80">
              Perlu tindak lanjut wali kelas &amp; BK
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Analisis Kehadiran per Tingkat & Kelas (Scalable & Structured) */}
      <Card className="border-border bg-white shadow-xs">
        <CardHeader className="border-b border-border py-4 px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base font-bold text-navy-950 flex items-center gap-2">
                <GraduationCap size={18} className="text-navy-700" />
                Performa Kehadiran per Jenjang &amp; Kelas
              </CardTitle>
              <CardDescription className="text-xs">
                Monitoring terstruktur per tingkat (Kelas X, XI, XII) untuk kemudahan navigasi banyak kelas
              </CardDescription>
            </div>

            {/* Filter Tabs Tingkat Jenjang */}
            <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 text-xs">
              {["Semua", "X", "XI", "XII"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTingkatFilter(t)}
                  className={`rounded-md px-3 py-1 font-medium transition-all ${
                    tingkatFilter === t
                      ? "bg-white text-navy-950 font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-navy-950"
                  }`}
                >
                  {t === "Semua" ? "Semua Jenjang" : `Tingkat ${t}`}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Overview 3 Ringkasan Tingkat (X, XI, XII) */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {ringkasanTingkat.map((t) => {
              const isSelected = tingkatFilter === t.key;
              return (
                <div
                  key={t.key}
                  onClick={() => setTingkatFilter(tingkatFilter === t.key ? "Semua" : t.key)}
                  className={`cursor-pointer rounded-xl border p-4 transition-all ${
                    isSelected
                      ? "border-navy-900 bg-navy-50/50 ring-1 ring-navy-900 shadow-2xs"
                      : "border-border bg-slate-50/60 hover:bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-navy-950">{t.label}</span>
                    <Badge variant="outline" className="text-[10px] bg-white text-navy-700">
                      {t.jumlahKelas} Kelas · {t.totalSiswa} Siswa
                    </Badge>
                  </div>
                  <div className="mt-2.5 flex items-baseline justify-between">
                    <span className="text-xs text-muted-foreground">Rata-rata Hadir</span>
                    <span className="font-mono text-xl font-bold text-navy-950">
                      {t.rataKehadiran}%
                    </span>
                  </div>
                  <Progress
                    value={t.rataKehadiran}
                    className="h-1.5 mt-2 bg-slate-200"
                    indicatorClassName={
                      t.rataKehadiran >= 90 ? "bg-emerald-600" : "bg-amber-600"
                    }
                  />
                </div>
              );
            })}
          </div>

          {/* Grid Kelas Terfilter dengan Visual Progress Bar yang Presisi */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold text-navy-900">
                Detail Kelas {tingkatFilter !== "Semua" ? `(Tingkat ${tingkatFilter})` : ""}
                <span className="ml-1 text-muted-foreground font-normal">
                  — {kelasTersaring.length} kelas aktif
                </span>
              </p>
              <span className="text-[11px] text-muted-foreground">
                Klik kelas untuk memfilter tabel siswa di bawah
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {kelasTersaring.map((k) => {
                const isFilterActive = kelasFilter === k.kelas;
                return (
                  <div
                    key={k.kelas}
                    onClick={() => setKelasFilter(isFilterActive ? "Semua kelas" : k.kelas)}
                    className={`group cursor-pointer rounded-xl border p-3.5 transition-all ${
                      isFilterActive
                        ? "border-navy-900 bg-navy-50/80 ring-1 ring-navy-900 shadow-xs"
                        : "border-border bg-white hover:border-navy-300 hover:shadow-xs"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-navy-950 group-hover:text-navy-700">
                        {k.kelas}
                      </p>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {k.jumlahSiswa} murid
                      </span>
                    </div>
                    <div className="mt-2.5 flex items-baseline justify-between">
                      <span
                        className={`font-mono text-lg font-bold ${
                          k.rataKehadiran >= 90 ? "text-emerald-600" : "text-amber-600"
                        }`}
                      >
                        {k.rataKehadiran}%
                      </span>
                      <span className="text-[10px] text-muted-foreground">Kehadiran</span>
                    </div>
                    <Progress
                      value={k.rataKehadiran}
                      className="h-1 mt-1.5 bg-slate-100"
                      indicatorClassName={
                        k.rataKehadiran >= 90 ? "bg-emerald-500" : "bg-amber-500"
                      }
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scalable Alert Banner for At-risk Students */}
      {perluPerhatian.length > 0 && (
        <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-4 transition-all shadow-2xs">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-100 text-rose-700">
                <AlertTriangle size={15} />
              </div>
              <div>
                <span className="text-xs font-bold text-rose-900">
                  Indikasi Siswa Membutuhkan Pembinaan BK (&gt;1x Alpha)
                </span>
                <span className="ml-2 inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-800">
                  {perluPerhatian.length} Siswa
                </span>
              </div>
            </div>

            {/* Action Buttons for At-Risk Students */}
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

          {/* List of at-risk students (smoothly scrollable if many) */}
          <div className="mt-3">
            <div className={`grid grid-cols-1 gap-2 text-xs text-rose-900 sm:grid-cols-2 lg:grid-cols-3 ${
              bukaSemuaPerhatian && perluPerhatian.length > 6
                ? "max-h-64 overflow-y-auto pr-1"
                : ""
            }`}>
              {perhatianDitampilkan.map((r) => (
                <div
                  key={r.nis}
                  onClick={() => {
                    setCariSiswa(r.nama);
                  }}
                  className="flex cursor-pointer items-center justify-between rounded-lg border border-rose-200/80 bg-white p-2.5 transition-all hover:border-rose-300 hover:shadow-xs"
                  title="Klik untuk mencari siswa ini di tabel"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-100 text-[10px] font-bold text-rose-800">
                      {r.nama.slice(0, 2).toUpperCase()}
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

            {!bukaSemuaPerhatian && perluPerhatian.length > 3 && (
              <p className="mt-2 text-[11px] text-rose-700/80">
                + {perluPerhatian.length - 3} siswa lainnya membutuhkan pembinaan. Klik &quot;Lihat Semua&quot; untuk menampilkan seluruh daftar.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Main Table */}
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataTampil.map((r) => (
                <TableRow key={r.nis} className="hover:bg-slate-50/80">
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
                </TableRow>
              ))}

              {dataTampil.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-xs text-muted-foreground">
                    Tidak ada data siswa ditemukan untuk kriteria filter ini.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
