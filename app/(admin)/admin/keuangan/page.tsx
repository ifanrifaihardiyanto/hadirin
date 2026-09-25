"use client";

import * as XLSX from "xlsx";
import { useState, useMemo } from "react";
import {
  Printer,
  Search,
  CheckCircle2,
  Clock,
  Briefcase,
  Calendar,
  FileSpreadsheet,
  X,
  LayoutGrid,
  Table as TableIcon,
  Banknote,
  Receipt,
  Settings2,
  Check,
  TrendingUp,
  DollarSign,
  UserCheck,
  Building,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface KomponenTarif {
  tarifJP: number; // Tarif per Jam Pelajaran (JP)
  tarifTransportHarian: number; // Uang transport per kehadiran
  tunjanganWaliKelas: number; // Tunjangan bulanan wali kelas
  tunjanganPembina: number; // Tunjangan pembina ekstrakurikuler/OSIS
  potonganTerlambat: number; // Denda per keterlambatan
}

interface GuruPayrollItem {
  id: string;
  nama: string;
  nip: string;
  jabatan: string;
  statusPegawai: "GTT (Honorer)" | "GTY (Yayasan)" | "PNS / PPPK";
  rekeningBank: string;
  namaBank: string;
  totalJP: number; // Jam Pelajaran terlaksana
  hariHadir: number; // Hari hadir tepat waktu
  kaliTerlambat: number;
  tugasTambahan: string;
  tunjanganTambahan: number;
  statusBayar: "SIAP_CAIR" | "LUNAS" | "DRAFT";
}

const daftarPayrollAwal: GuruPayrollItem[] = [
  {
    id: "g1",
    nama: "Sari Wulandari, S.Pd",
    nip: "19850412 200902 2 003",
    jabatan: "Guru Matematika / Wali Kelas X IPA 1",
    statusPegawai: "GTT (Honorer)",
    rekeningBank: "132-00-98213-9",
    namaBank: "Bank BJB Cab. Bogor",
    totalJP: 28,
    hariHadir: 22,
    kaliTerlambat: 1,
    tugasTambahan: "Wali Kelas X IPA 1",
    tunjanganTambahan: 350000,
    statusBayar: "SIAP_CAIR",
  },
  {
    id: "g2",
    nama: "Budi Santoso, S.Pd",
    nip: "19820719 200801 1 005",
    jabatan: "Guru Fisika / Wali Kelas X IPA 2",
    statusPegawai: "GTT (Honorer)",
    rekeningBank: "091-22-44123-1",
    namaBank: "Bank BJB Cab. Bogor",
    totalJP: 24,
    hariHadir: 21,
    kaliTerlambat: 0,
    tugasTambahan: "Wali Kelas X IPA 2 & Lab Fisika",
    tunjanganTambahan: 450000,
    statusBayar: "SIAP_CAIR",
  },
  {
    id: "g3",
    nama: "Rina Marlina, M.Pd",
    nip: "19881105 201202 2 004",
    jabatan: "Guru Bahasa Inggris",
    statusPegawai: "GTT (Honorer)",
    rekeningBank: "541-11-20914-8",
    namaBank: "Bank BRI",
    totalJP: 20,
    hariHadir: 20,
    kaliTerlambat: 2,
    tugasTambahan: "Pembina OSIS & English Club",
    tunjanganTambahan: 300000,
    statusBayar: "SIAP_CAIR",
  },
  {
    id: "g4",
    nama: "Agus Prabowo, S.Pd",
    nip: "19790321 200501 1 002",
    jabatan: "Guru Biologi",
    statusPegawai: "PNS / PPPK",
    rekeningBank: "002-19-94301-2",
    namaBank: "Bank BJB",
    totalJP: 22,
    hariHadir: 19,
    kaliTerlambat: 0,
    tugasTambahan: "Koordinator KBM Lab Biologi",
    tunjanganTambahan: 250000,
    statusBayar: "LUNAS",
  },
  {
    id: "g5",
    nama: "Dewi Kusuma, S.Pd",
    nip: "19910214 201503 2 006",
    jabatan: "Guru Sejarah",
    statusPegawai: "GTT (Honorer)",
    rekeningBank: "401-23-88712-4",
    namaBank: "Bank Mandiri",
    totalJP: 18,
    hariHadir: 22,
    kaliTerlambat: 0,
    tugasTambahan: "Wali Kelas XI IPS 1",
    tunjanganTambahan: 350000,
    statusBayar: "SIAP_CAIR",
  },
  {
    id: "g6",
    nama: "Hendra Setiawan, S.Kom",
    nip: "19930618 201901 1 007",
    jabatan: "Guru Informatika & Tenaga IT",
    statusPegawai: "GTY (Yayasan)",
    rekeningBank: "821-44-12903-5",
    namaBank: "Bank BNI",
    totalJP: 26,
    hariHadir: 23,
    kaliTerlambat: 1,
    tugasTambahan: "Kepala Lab Komputer & Dapodik",
    tunjanganTambahan: 500000,
    statusBayar: "SIAP_CAIR",
  },
];

export default function AdminKeuanganPage() {
  const [payrollList, setPayrollList] = useState<GuruPayrollItem[]>(daftarPayrollAwal);
  const [filterStatusPegawai, setFilterStatusPegawai] = useState<string>("SEMUA");
  const [filterBayar, setFilterBayar] = useState<string>("SEMUA");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "card">("table");

  // Tarif settings state
  const [tarif, setTarif] = useState<KomponenTarif>({
    tarifJP: 45000, // Rp 45.000 / Jam Pelajaran
    tarifTransportHarian: 35000, // Rp 35.000 / hari kehadiran
    tunjanganWaliKelas: 350000,
    tunjanganPembina: 300000,
    potonganTerlambat: 15000, // Rp 15.000 potongan telat
  });
  const [isTarifModalOpen, setIsTarifModalOpen] = useState(false);
  const [tempTarif, setTempTarif] = useState<KomponenTarif>(tarif);

  // Print slips modals
  const [selectedSlipGuru, setSelectedSlipGuru] = useState<GuruPayrollItem | null>(null);
  const [isRekapPrintOpen, setIsRekapPrintOpen] = useState(false);

  // Calculations per teacher
  const hitungHonor = (item: GuruPayrollItem) => {
    const honorKBM = item.totalJP * tarif.tarifJP;
    const uangTransport = item.hariHadir * tarif.tarifTransportHarian;
    const tunjangan = item.tunjanganTambahan;
    const potongan = item.kaliTerlambat * tarif.potonganTerlambat;
    const totalBersih = honorKBM + uangTransport + tunjangan - potongan;
    return {
      honorKBM,
      uangTransport,
      tunjangan,
      potongan,
      totalBersih,
    };
  };

  // Filtered data
  const dataTampil = useMemo(() => {
    return payrollList.filter((item) => {
      const matchStatusPegawai =
        filterStatusPegawai === "SEMUA" || item.statusPegawai === filterStatusPegawai;
      const matchBayar =
        filterBayar === "SEMUA" || item.statusBayar === filterBayar;
      const matchSearch =
        searchQuery.trim() === "" ||
        item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nip.includes(searchQuery) ||
        item.jabatan.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatusPegawai && matchBayar && matchSearch;
    });
  }, [payrollList, filterStatusPegawai, filterBayar, searchQuery]);

  // Overall Totals
  const totalAnggaranBulanIni = useMemo(() => {
    return payrollList.reduce((acc, curr) => acc + hitungHonor(curr).totalBersih, 0);
  }, [payrollList, tarif]);

  const totalJPBulanIni = useMemo(() => {
    return payrollList.reduce((acc, curr) => acc + curr.totalJP, 0);
  }, [payrollList]);

  const totalHadirBulanIni = useMemo(() => {
    return payrollList.reduce((acc, curr) => acc + curr.hariHadir, 0);
  }, [payrollList]);

  const guruSiapCairCount = useMemo(() => {
    return payrollList.filter((g) => g.statusBayar === "SIAP_CAIR").length;
  }, [payrollList]);

  // Toggle mark paid
  const toggleBayar = (id: string) => {
    setPayrollList((prev) =>
      prev.map((g) =>
        g.id === id
          ? { ...g, statusBayar: g.statusBayar === "LUNAS" ? "SIAP_CAIR" : "LUNAS" }
          : g
      )
    );
  };

  // Export to Excel
  const handleExportExcel = () => {
    const dataExcel = payrollList.map((item, idx) => {
      const calc = hitungHonor(item);
      return {
        No: idx + 1,
        "Nama Pendidik": item.nama,
        NIP: item.nip,
        Status: item.statusPegawai,
        "Bank & No Rekening": `${item.namaBank} - ${item.rekeningBank}`,
        "Total JP": item.totalJP,
        "Honor KBM (Rp)": calc.honorKBM,
        "Hari Hadir": item.hariHadir,
        "Uang Transport (Rp)": calc.uangTransport,
        "Tugas Tambahan": item.tugasTambahan,
        "Tunjangan Tambahan (Rp)": calc.tunjangan,
        "Potongan Telat (Rp)": calc.potongan,
        "Total Diterima (Rp)": calc.totalBersih,
        "Status Pembayaran": item.statusBayar === "LUNAS" ? "Lunas Ditransfer" : "Siap Dicairkan",
      };
    });

    const ws = XLSX.utils.json_to_sheet(dataExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rekap_Honor_Guru");
    XLSX.writeFile(wb, `Rekap_Honor_Guru_SMAN3_Juli_2026.xlsx`);
  };

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(angka);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-1">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold tracking-tight text-navy-950 md:text-3xl">
              Administrasi &amp; Penggajian Honor Guru (Payroll PTK)
            </h1>
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-semibold">
              Periode Juli 2026
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Kalkulasi otomatis honor jam tatap muka (KBM), uang transport kehadiran, dan tunjangan tugas tambahan
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setTempTarif(tarif);
              setIsTarifModalOpen(true);
            }}
            className="border-slate-200 text-slate-700 hover:bg-slate-50 gap-1.5 text-xs font-medium cursor-pointer shadow-2xs"
          >
            <Settings2 size={15} />
            Atur Tarif Honor
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsRekapPrintOpen(true)}
            className="border-slate-200 text-slate-700 hover:bg-slate-50 gap-1.5 text-xs font-medium cursor-pointer shadow-2xs"
          >
            <Printer size={15} />
            Cetak SPJ Rekap
          </Button>

          <Button
            size="sm"
            onClick={handleExportExcel}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs font-medium cursor-pointer shadow-xs"
          >
            <FileSpreadsheet size={15} />
            Export Excel (.xlsx)
          </Button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Anggaran */}
        <Card className="border border-border bg-gradient-to-br from-navy-950 to-navy-900 text-white shadow-xs">
          <div className="p-5 md:p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-navy-200">
              Total Anggaran Honor Bulan Ini
            </p>
            <div className="mt-2 flex items-baseline justify-between">
              <p className="font-mono text-2xl md:text-3xl font-bold text-white tracking-tight">
                {formatRupiah(totalAnggaranBulanIni)}
              </p>
            </div>
            <p className="mt-2 text-[11px] text-navy-300">
              Alokasi Dana BOS &amp; Komite Sekolah
            </p>
          </div>
        </Card>

        {/* Card 2: Total Jam Mengajar */}
        <Card className="border border-border bg-white shadow-xs">
          <div className="p-5 md:p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Jam Pelajaran (JP)
            </p>
            <div className="mt-2 flex items-baseline justify-between">
              <p className="font-mono text-3xl font-bold text-navy-950">
                {totalJPBulanIni}
                <span className="text-sm font-normal text-slate-500 ml-1">JP</span>
              </p>
              <Badge variant="outline" className="text-[11px] font-medium bg-slate-50">
                {formatRupiah(tarif.tarifJP)} / JP
              </Badge>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Tervalidasi melalui Jurnal Mengajar Digital
            </p>
          </div>
        </Card>

        {/* Card 3: Kehadiran Guru */}
        <Card className="border border-border bg-white shadow-xs">
          <div className="p-5 md:p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Kehadiran Guru Tervalidasi
            </p>
            <div className="mt-2 flex items-baseline justify-between">
              <p className="font-mono text-3xl font-bold text-navy-950">
                {totalHadirBulanIni}
                <span className="text-sm font-normal text-slate-500 ml-1">hari</span>
              </p>
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[11px] font-semibold">
                {formatRupiah(tarif.tarifTransportHarian)} / hari
              </Badge>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Pencatatan Presensi Mandiri &amp; Geofence
            </p>
          </div>
        </Card>

        {/* Card 4: Status Pencairan */}
        <Card className="border border-emerald-200 bg-emerald-50/50 shadow-xs">
          <div className="p-5 md:p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
              Kesiapan Pencairan Dana
            </p>
            <div className="mt-2 flex items-baseline justify-between">
              <p className="font-mono text-3xl font-bold text-emerald-900">
                {guruSiapCairCount}
                <span className="text-sm font-normal text-emerald-700 ml-1">/ {payrollList.length} guru</span>
              </p>
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[11px] font-semibold">
                Siap Transfer
              </Badge>
            </div>
            <p className="mt-2 text-[11px] text-emerald-700">
              Data KBM &amp; paraf supervisi telah lengkap
            </p>
          </div>
        </Card>
      </div>

      {/* Filter and View Controls */}
      <Card className="border border-border bg-white shadow-xs">
        <div className="p-4 md:p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama guru, NIP, atau tugas..."
              className="h-9.5 pl-10 text-xs bg-slate-50/70 border-border"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground hover:text-navy-950"
              >
                Clear
              </button>
            )}
          </div>

          {/* Filter Pills & View Mode Switcher */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
              {[
                { label: "Semua", val: "SEMUA" },
                { label: "GTT (Honorer)", val: "GTT (Honorer)" },
                { label: "GTY (Yayasan)", val: "GTY (Yayasan)" },
                { label: "PNS / PPPK", val: "PNS / PPPK" },
              ].map((tab) => (
                <button
                  key={tab.val}
                  type="button"
                  onClick={() => setFilterStatusPegawai(tab.val)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    filterStatusPegawai === tab.val
                      ? "bg-white text-navy-950 shadow-xs"
                      : "text-slate-600 hover:text-navy-950"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === "table"
                    ? "bg-white text-navy-950 shadow-xs"
                    : "text-slate-400 hover:text-slate-700"
                }`}
                title="Tampilan Tabel"
              >
                <TableIcon size={16} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("card")}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === "card"
                    ? "bg-white text-navy-950 shadow-xs"
                    : "text-slate-400 hover:text-slate-700"
                }`}
                title="Tampilan Kartu"
              >
                <LayoutGrid size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Content View: Table Mode */}
        {viewMode === "table" ? (
          <div className="overflow-x-auto border-t border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/80">
                  <TableHead className="font-semibold text-navy-950 text-xs">Pendidik / PTK</TableHead>
                  <TableHead className="font-semibold text-navy-950 text-xs text-center">KBM (JP)</TableHead>
                  <TableHead className="font-semibold text-navy-950 text-xs text-center">Kehadiran</TableHead>
                  <TableHead className="font-semibold text-navy-950 text-xs">Tunjangan Tugas</TableHead>
                  <TableHead className="font-semibold text-navy-950 text-xs text-center">Potongan</TableHead>
                  <TableHead className="font-semibold text-navy-950 text-xs text-right">Total Bersih</TableHead>
                  <TableHead className="font-semibold text-navy-950 text-xs text-center">Status Bayar</TableHead>
                  <TableHead className="font-semibold text-navy-950 text-xs text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dataTampil.map((item) => {
                  const calc = hitungHonor(item);
                  return (
                    <TableRow key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <TableCell className="py-3.5">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-xs text-navy-950">{item.nama}</p>
                          <Badge variant="outline" className="text-[10px] font-medium">
                            {item.statusPegawai}
                          </Badge>
                        </div>
                        <p className="font-mono text-[11px] text-muted-foreground mt-0.5">
                          {item.namaBank} · {item.rekeningBank}
                        </p>
                      </TableCell>

                      <TableCell className="text-center">
                        <span className="font-mono font-bold text-xs text-navy-950">
                          {item.totalJP} JP
                        </span>
                        <span className="block text-[10px] text-slate-400 font-mono">
                          {formatRupiah(calc.honorKBM)}
                        </span>
                      </TableCell>

                      <TableCell className="text-center">
                        <span className="font-mono font-bold text-xs text-emerald-800">
                          {item.hariHadir} Hari
                        </span>
                        <span className="block text-[10px] text-slate-400 font-mono">
                          {formatRupiah(calc.uangTransport)}
                        </span>
                      </TableCell>

                      <TableCell>
                        <span className="text-xs text-slate-700 font-medium block truncate max-w-[170px]">
                          {item.tugasTambahan}
                        </span>
                        <span className="text-[11px] text-emerald-700 font-mono font-semibold">
                          +{formatRupiah(calc.tunjangan)}
                        </span>
                      </TableCell>

                      <TableCell className="text-center">
                        {calc.potongan > 0 ? (
                          <span className="font-mono text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            -{formatRupiah(calc.potongan)}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </TableCell>

                      <TableCell className="text-right">
                        <span className="font-mono font-bold text-sm text-navy-950 block">
                          {formatRupiah(calc.totalBersih)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">Take Home Pay</span>
                      </TableCell>

                      <TableCell className="text-center">
                        <button
                          type="button"
                          onClick={() => toggleBayar(item.id)}
                          className="cursor-pointer"
                          title="Klik untuk ubah status pembayaran"
                        >
                          {item.statusBayar === "LUNAS" ? (
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-semibold gap-1 hover:bg-emerald-100">
                              <CheckCircle2 size={12} />
                              Lunas
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-xs font-semibold gap-1 hover:bg-amber-100">
                              <Clock size={12} />
                              Siap Cair
                            </Badge>
                          )}
                        </button>
                      </TableCell>

                      <TableCell className="text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedSlipGuru(item)}
                          className="h-8 text-xs border-slate-200 text-navy-950 hover:bg-slate-100 gap-1 font-medium cursor-pointer shadow-2xs"
                        >
                          <Receipt size={13} />
                          Slip
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {dataTampil.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="py-12 text-center text-xs text-muted-foreground">
                      Tidak ada data guru yang sesuai dengan kriteria filter.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        ) : (
          /* Content View: Card Mode (Desktop 2-column or 3-column responsive grid) */
          <div className="p-4 md:p-6 border-t border-border">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dataTampil.map((item) => {
                const calc = hitungHonor(item);
                return (
                  <div
                    key={item.id}
                    className="rounded-xl border border-border bg-white p-5 shadow-xs hover:border-navy-300 hover:shadow-sm transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-sm text-navy-950">{item.nama}</h4>
                          <p className="font-mono text-[11px] text-muted-foreground">NIP. {item.nip}</p>
                        </div>
                        <Badge variant="outline" className="text-[10px]">
                          {item.statusPegawai}
                        </Badge>
                      </div>

                      <p className="text-xs text-slate-600 mt-2 font-medium bg-slate-50 px-2.5 py-1.5 rounded border border-slate-100">
                        {item.jabatan}
                      </p>

                      <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Honor KBM ({item.totalJP} JP):</span>
                          <span className="font-mono font-semibold text-slate-800">
                            {formatRupiah(calc.honorKBM)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Transport Hadir ({item.hariHadir} Hari):</span>
                          <span className="font-mono font-semibold text-slate-800">
                            {formatRupiah(calc.uangTransport)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Tunjangan Tugas:</span>
                          <span className="font-mono font-semibold text-emerald-700">
                            +{formatRupiah(calc.tunjangan)}
                          </span>
                        </div>
                        {calc.potongan > 0 && (
                          <div className="flex items-center justify-between text-rose-600">
                            <span>Potongan Terlambat:</span>
                            <span className="font-mono font-semibold">
                              -{formatRupiah(calc.potongan)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">TOTAL DITERIMA</span>
                        <span className="font-mono font-black text-base text-navy-950">
                          {formatRupiah(calc.totalBersih)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleBayar(item.id)}
                          className="cursor-pointer"
                        >
                          {item.statusBayar === "LUNAS" ? (
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-semibold">
                              Lunas
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-xs font-semibold">
                              Siap Cair
                            </Badge>
                          )}
                        </button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedSlipGuru(item)}
                          className="h-8 text-xs border-slate-200 text-navy-950 hover:bg-slate-100 gap-1 font-medium cursor-pointer shadow-2xs"
                        >
                          <Receipt size={13} />
                          Slip
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      {/* MODAL 1: ATUR TARIF & KOMPONEN HONOR */}
      {isTarifModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Settings2 size={18} className="text-primary" />
                <h3 className="font-display font-bold text-navy-950 text-lg">
                  Konfigurasi Komponen Honor PTK
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTarifModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Tarif per Jam Pelajaran (JP) Tatap Muka
                </label>
                <Input
                  type="number"
                  value={tempTarif.tarifJP}
                  onChange={(e) =>
                    setTempTarif({ ...tempTarif, tarifJP: Number(e.target.value) })
                  }
                  className="h-9 text-xs"
                />
                <p className="text-[11px] text-slate-400 mt-1">Standar honor jam mengajar BOS/Yayasan</p>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Uang Transport Harian (Per Kehadiran Tepat Waktu)
                </label>
                <Input
                  type="number"
                  value={tempTarif.tarifTransportHarian}
                  onChange={(e) =>
                    setTempTarif({
                      ...tempTarif,
                      tarifTransportHarian: Number(e.target.value),
                    })
                  }
                  className="h-9 text-xs"
                />
                <p className="text-[11px] text-slate-400 mt-1">Diberikan setiap kehadiran tervalidasi</p>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Tunjangan Bulanan Wali Kelas
                </label>
                <Input
                  type="number"
                  value={tempTarif.tunjanganWaliKelas}
                  onChange={(e) =>
                    setTempTarif({
                      ...tempTarif,
                      tunjanganWaliKelas: Number(e.target.value),
                    })
                  }
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Potongan Kedisiplinan per Keterlambatan
                </label>
                <Input
                  type="number"
                  value={tempTarif.potonganTerlambat}
                  onChange={(e) =>
                    setTempTarif({
                      ...tempTarif,
                      potonganTerlambat: Number(e.target.value),
                    })
                  }
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsTarifModalOpen(false)}
                className="text-xs cursor-pointer"
              >
                Batal
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setTarif(tempTarif);
                  setIsTarifModalOpen(false);
                }}
                className="bg-navy-900 hover:bg-navy-800 text-white text-xs gap-1.5 cursor-pointer shadow-xs"
              >
                <Check size={14} />
                Simpan &amp; Terapkan Tarif
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CETAK SLIP HONOR INDIVIDUAL */}
      {selectedSlipGuru && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full p-6 md:p-8 space-y-6 my-8">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="font-display font-bold text-navy-950 text-xl">
                  Pratinjau Slip Honor Pendidik
                </h3>
                <p className="text-xs text-slate-500">
                  Dokumen slip resmi penerimaan honorium mengajar &amp; insentif
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => window.print()}
                  className="bg-navy-900 hover:bg-navy-800 text-white gap-2 font-medium cursor-pointer shadow-xs"
                >
                  <Printer className="h-4 w-4" />
                  Cetak / PDF
                </Button>
                <button
                  type="button"
                  onClick={() => setSelectedSlipGuru(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* LEMBAR SLIP RESMI */}
            <div className="border border-slate-300 p-6 rounded-lg bg-white text-slate-900 space-y-5">
              <div className="text-center border-b-2 border-double border-slate-900 pb-3">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  SMA NEGERI 3 CONTOH KOTA BOGOR
                </h4>
                <p className="text-[10px] text-slate-500">
                  Jl. Pendidikan No. 45 Telp. (0251) 8321000 Email: bendahara@sman3contoh.sch.id
                </p>
                <h3 className="text-sm font-black tracking-tight uppercase underline text-slate-950 mt-2">
                  SLIP HONORARIUM MENGAJAR &amp; TRANSPORT PTK
                </h3>
                <p className="text-[11px] text-slate-600">
                  Bulan: Juli 2026 · Tahun Ajaran 2026/2027
                </p>
              </div>

              {/* Data Personil */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded border border-slate-200">
                <div>
                  <span className="text-slate-500 block text-[11px]">Nama Lengkap:</span>
                  <span className="font-bold text-slate-900">{selectedSlipGuru.nama}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">NIP / Identitas:</span>
                  <span className="font-mono font-medium text-slate-800">{selectedSlipGuru.nip}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Tugas Pokok:</span>
                  <span className="font-medium text-slate-800">{selectedSlipGuru.jabatan}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Rekening Bank:</span>
                  <span className="font-mono font-medium text-slate-800">
                    {selectedSlipGuru.namaBank} - {selectedSlipGuru.rekeningBank}
                  </span>
                </div>
              </div>

              {/* Tabel Komponen Rincian */}
              {(() => {
                const c = hitungHonor(selectedSlipGuru);
                return (
                  <div className="space-y-3">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-300 font-bold text-slate-800">
                          <th className="text-left py-1.5">Uraian Penerimaan</th>
                          <th className="text-center py-1.5">Volume</th>
                          <th className="text-right py-1.5">Tarif</th>
                          <th className="text-right py-1.5">Jumlah</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        <tr>
                          <td className="py-1.5 font-medium">Honor Jam Mengajar (KBM)</td>
                          <td className="py-1.5 text-center font-mono">{selectedSlipGuru.totalJP} JP</td>
                          <td className="py-1.5 text-right font-mono">{formatRupiah(tarif.tarifJP)}</td>
                          <td className="py-1.5 text-right font-mono font-bold">{formatRupiah(c.honorKBM)}</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 font-medium">Uang Transport Kehadiran</td>
                          <td className="py-1.5 text-center font-mono">{selectedSlipGuru.hariHadir} Hari</td>
                          <td className="py-1.5 text-right font-mono">{formatRupiah(tarif.tarifTransportHarian)}</td>
                          <td className="py-1.5 text-right font-mono font-bold">{formatRupiah(c.uangTransport)}</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 font-medium">{selectedSlipGuru.tugasTambahan}</td>
                          <td className="py-1.5 text-center font-mono">1 Bln</td>
                          <td className="py-1.5 text-right font-mono">{formatRupiah(c.tunjangan)}</td>
                          <td className="py-1.5 text-right font-mono font-bold text-emerald-800">+{formatRupiah(c.tunjangan)}</td>
                        </tr>
                        {c.potongan > 0 && (
                          <tr className="text-rose-700">
                            <td className="py-1.5 font-medium">Potongan Keterlambatan</td>
                            <td className="py-1.5 text-center font-mono">{selectedSlipGuru.kaliTerlambat} Kali</td>
                            <td className="py-1.5 text-right font-mono">{formatRupiah(tarif.potonganTerlambat)}</td>
                            <td className="py-1.5 text-right font-mono font-bold">-{formatRupiah(c.potongan)}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>

                    <div className="bg-slate-100 p-3 rounded border border-slate-300 flex items-center justify-between">
                      <span className="font-bold text-xs uppercase text-slate-800">
                        Total Honor Bersih Diterima:
                      </span>
                      <span className="font-mono font-black text-lg text-slate-950">
                        {formatRupiah(c.totalBersih)}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Tanda Tangan */}
              <div className="grid grid-cols-2 pt-6 text-xs text-center">
                <div>
                  <p>Penerima / Dewan Guru,</p>
                  <div className="h-14 flex items-center justify-center">
                    <span className="text-[10px] text-slate-400 italic">( Tanda Tangan )</span>
                  </div>
                  <p className="font-bold underline text-slate-950">{selectedSlipGuru.nama}</p>
                </div>
                <div>
                  <p>Bendahara Pengeluaran Sekolah,</p>
                  <div className="h-14 flex items-center justify-center">
                    <span className="text-[10px] text-slate-400 italic">( Tanda Tangan &amp; Stempel )</span>
                  </div>
                  <p className="font-bold underline text-slate-950">Dra. Hj. Sri Wahyuni, M.Ak</p>
                  <p className="text-[10px] text-slate-500 font-mono">NIP. 19750811 200212 2 001</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: CETAK SPJ REKAPITULASI KOLEKTIF */}
      {isRekapPrintOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-6 md:p-8 space-y-6 my-8">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="font-display font-bold text-navy-950 text-xl">
                  Pratinjau SPJ Rekapitulasi Honorium Guru (Kolektif)
                </h3>
                <p className="text-xs text-slate-500">
                  Dokumen laporan pertanggungjawaban dana BOS / Komite Sekolah
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => window.print()}
                  className="bg-navy-900 hover:bg-navy-800 text-white gap-2 font-medium cursor-pointer shadow-xs"
                >
                  <Printer className="h-4 w-4" />
                  Cetak / PDF
                </Button>
                <button
                  type="button"
                  onClick={() => setIsRekapPrintOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* KOP SURAT KOLEKTIF */}
            <div className="border border-slate-300 p-8 rounded-lg bg-white text-slate-900 space-y-6">
              <div className="text-center border-b-2 border-double border-slate-900 pb-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  PEMERINTAH DAERAH PROVINSI JAWA BARAT
                </h4>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  DINAS PENDIDIKAN CABANG DINAS WILAYAH I
                </h4>
                <h2 className="text-lg font-black tracking-wide text-slate-950 uppercase mt-1">
                  SMA NEGERI 3 CONTOH KOTA BOGOR
                </h2>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Jl. Pendidikan No. 45 Telp. (0251) 8321000 Fax. 8321001 Email: info@sman3contoh.sch.id
                </p>
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-sm font-bold tracking-tight uppercase underline text-slate-950">
                  DAFTAR PENERIMAAN HONORARIUM MENGAJAR &amp; TRANSPORT GURU (SPJ)
                </h3>
                <p className="text-xs text-slate-600">
                  Periode Bulan: Juli 2026 · Sumber Dana: BOS Reguler &amp; Komite Sekolah
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-[11px] border-collapse border border-slate-400">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 text-center font-bold">
                      <th className="border border-slate-400 p-2 w-8">No</th>
                      <th className="border border-slate-400 p-2">Nama Pendidik / Pegawai</th>
                      <th className="border border-slate-400 p-2 w-14">JP</th>
                      <th className="border border-slate-400 p-2 w-24">Honor KBM</th>
                      <th className="border border-slate-400 p-2 w-14">Hadir</th>
                      <th className="border border-slate-400 p-2 w-24">Transport</th>
                      <th className="border border-slate-400 p-2 w-24">Tunjangan</th>
                      <th className="border border-slate-400 p-2 w-28">Jumlah Bersih</th>
                      <th className="border border-slate-400 p-2 w-24">Tanda Tangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payrollList.map((item, idx) => {
                      const c = hitungHonor(item);
                      return (
                        <tr key={item.id} className="text-slate-900">
                          <td className="border border-slate-400 p-1.5 text-center">{idx + 1}</td>
                          <td className="border border-slate-400 p-1.5 font-medium">{item.nama}</td>
                          <td className="border border-slate-400 p-1.5 text-center font-mono">{item.totalJP}</td>
                          <td className="border border-slate-400 p-1.5 text-right font-mono">{formatRupiah(c.honorKBM)}</td>
                          <td className="border border-slate-400 p-1.5 text-center font-mono">{item.hariHadir}</td>
                          <td className="border border-slate-400 p-1.5 text-right font-mono">{formatRupiah(c.uangTransport)}</td>
                          <td className="border border-slate-400 p-1.5 text-right font-mono">{formatRupiah(c.tunjangan)}</td>
                          <td className="border border-slate-400 p-1.5 text-right font-mono font-bold text-slate-950">
                            {formatRupiah(c.totalBersih)}
                          </td>
                          <td className="border border-slate-400 p-1.5 text-center font-mono text-[10px] text-slate-400">
                            {idx + 1}. .........
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="bg-slate-100 font-bold text-slate-950">
                      <td colSpan={7} className="border border-slate-400 p-2 text-center uppercase">
                        Total Pembayaran Honorium PTK:
                      </td>
                      <td className="border border-slate-400 p-2 text-right font-mono font-black text-sm">
                        {formatRupiah(totalAnggaranBulanIni)}
                      </td>
                      <td className="border border-slate-400 p-2 text-center font-mono text-[10px]">
                        Lunas
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Tanda Tangan */}
              <div className="grid grid-cols-2 pt-8 text-xs text-center">
                <div>
                  <p>Lunas Dibayar,</p>
                  <p className="font-semibold text-slate-900">Bendahara Sekolah</p>
                  <div className="h-14 flex items-center justify-center">
                    <span className="text-[10px] text-slate-400 italic">( Tanda Tangan &amp; Stempel )</span>
                  </div>
                  <p className="font-bold underline text-slate-950">Dra. Hj. Sri Wahyuni, M.Ak</p>
                  <p className="text-[10px] text-slate-500 font-mono">NIP. 19750811 200212 2 001</p>
                </div>
                <div>
                  <p>Setuju Dibayar,</p>
                  <p className="font-semibold text-slate-900">Kepala SMA Negeri 3 Contoh</p>
                  <div className="h-14 flex items-center justify-center">
                    <span className="text-[10px] text-slate-400 italic">( Tanda Tangan &amp; Stempel )</span>
                  </div>
                  <p className="font-bold underline text-slate-950">Drs. Hendra Wijaya, M.Pd</p>
                  <p className="text-[10px] text-slate-500 font-mono">NIP. 19680512 199403 1 004</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
