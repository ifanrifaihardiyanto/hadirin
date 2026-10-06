"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Download,
  Filter,
  CheckCircle2,
  Activity,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Search,
  RefreshCw,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

interface KelasOption {
  id: number;
  nama: string;
}

export default function RekapPage() {
  const [kelasFilter, setKelasFilter] = useState<string>("all");
  const [cariSiswa, setCariSiswa] = useState<string>("");
  const [bukaSemuaPerhatian, setBukaSemuaPerhatian] = useState(false);
  const [fokusPerhatian, setFokusPerhatian] = useState(false);

  const [loading, setLoading] = useState(true);
  const [rekapList, setRekapList] = useState<RekapItem[]>([]);
  const [kelasList, setKelasList] = useState<KelasOption[]>([]);

  // Load daftar kelas untuk filter
  useEffect(() => {
    async function fetchKelas() {
      try {
        const res = await api.getKelasList();
        if (res && res.data) {
          setKelasList(res.data);
        }
      } catch (err) {
        console.error("Gagal memuat daftar kelas:", err);
      }
    }
    fetchKelas();
  }, []);

  // Fetch data rekap presensi live
  const loadRekap = async () => {
    setLoading(true);
    try {
      const res = await api.getRekapAbsensi(kelasFilter);
      if (res && res.data) {
        setRekapList(res.data);
      } else {
        setRekapList([]);
      }
    } catch (err) {
      console.error("Gagal memuat rekap absensi:", err);
      setRekapList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRekap();
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
    const kelasLabel = kelasFilter === "all" ? "semua-kelas" : `kelas-${kelasFilter}`;
    link.download = `rekap-absensi-${kelasLabel}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const perhatianDitampilkan = bukaSemuaPerhatian
    ? perluPerhatian
    : perluPerhatian.slice(0, 3);

  return (
    <div className="w-full space-y-6">
      {/* Header & Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-navy-950 md:text-3xl">
            Rekapitulasi Presensi Siswa
          </h1>
          <p className="text-xs text-muted-foreground">
            Ringkasan akumulasi kehadiran siswa semester berjalan langsung dari database
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={loadRekap}
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
            onClick={unduhCSV}
            disabled={loading || dataTampil.length === 0}
            className="gap-1.5 bg-navy-900 text-white hover:bg-navy-800"
          >
            <Download size={14} />
            Unduh CSV
          </Button>
        </div>
      </div>

      {/* Row 1: KPI Metrics Row */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-border bg-white p-5 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="h-3.5 w-24 rounded bg-slate-200" />
                <div className="h-8 w-8 rounded-lg bg-slate-200" />
              </div>
              <div className="mt-4 h-8 w-16 rounded bg-slate-200" />
              <div className="mt-3 h-3 w-36 rounded bg-slate-200" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Rata Kehadiran */}
          <Card className="border-border bg-white shadow-2xs transition-all hover:shadow-xs">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Rata Kehadiran
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
                  {persenHadir >= 90 ? "Sangat Baik" : persenHadir >= 75 ? "Baik" : "Perlu Evaluasi"}
                </Badge>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Rata-rata kehadiran semester berjalan
              </p>
            </CardContent>
          </Card>

          {/* Card 2: Total Sakit */}
          <Card className="border-border bg-white shadow-2xs transition-all hover:shadow-xs">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Total Sakit
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
                Tercatat dengan surat izin medis
              </p>
            </CardContent>
          </Card>

          {/* Card 3: Total Izin */}
          <Card className="border-border bg-white shadow-2xs transition-all hover:shadow-xs">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Total Izin
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
                Pemberitahuan resmi orang tua/wali
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
                <span className="text-xs text-muted-foreground">sesi tanpa keterangan</span>
              </div>
              <p className="mt-2 text-xs font-medium text-rose-600/80">
                Perlu tindak lanjut wali kelas &amp; BK
              </p>
            </CardContent>
          </Card>
        </div>
      )}

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

          {/* List of at-risk students */}
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
                  onClick={() => {
                    setCariSiswa(r.nama);
                  }}
                  className="flex cursor-pointer items-center justify-between rounded-lg border border-rose-200/80 bg-white p-2.5 transition-all hover:border-rose-300 hover:shadow-xs"
                  title="Klik untuk mencari siswa ini di tabel"
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

            {!bukaSemuaPerhatian && perluPerhatian.length > 3 && (
              <p className="mt-2 text-[11px] text-rose-700/80">
                + {perluPerhatian.length - 3} siswa lainnya membutuhkan pembinaan. Klik &quot;Lihat Semua&quot; untuk menampilkan seluruh daftar.
              </p>
            )}
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
    </div>
  );
}
