"use client";

import { useState, useMemo } from "react";
import {
  Receipt,
  Search,
  Plus,
  Printer,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileSpreadsheet,
  Download,
  CreditCard,
  Building,
  DollarSign,
  TrendingUp,
  X,
  Check,
  QrCode,
  Banknote,
  Send,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useStore, type TagihanSPP } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function AdminSPPPage() {
  const { daftarTagihanSPP, bayarTagihanSPP, tambahTagihanSPP, daftarSiswaInduk, tahunAjaranAktif, semesterAktif } = useStore();

  const [search, setSearch] = useState("");
  const [filterBulan, setFilterBulan] = useState("SEMUA");
  const [filterKelas, setFilterKelas] = useState("SEMUA");
  const [filterStatus, setFilterStatus] = useState("SEMUA");

  // Modal State
  const [openModalBayar, setOpenModalBayar] = useState(false);
  const [selectedTagihan, setSelectedTagihan] = useState<TagihanSPP | null>(null);
  const [metodeBayar, setMetodeBayar] = useState<"TRANSFER_BANK" | "TUNAI_KASIR" | "QRIS">("TRANSFER_BANK");
  const [catatanBayar, setCatatanBayar] = useState("");

  // Modal Kwitansi Print
  const [kwitansiPrint, setKwitansiPrint] = useState<TagihanSPP | null>(null);

  // Form State Tambah Tagihan Baru
  const [openModalTambah, setOpenModalTambah] = useState(false);
  const [formTambah, setFormTambah] = useState({
    siswaId: "",
    bulan: "Juli 2026",
    nominal: 350000,
    catatan: "SPP Reguler",
  });

  const bulanOptions = ["Juli 2026", "Agustus 2026", "September 2026", "Oktober 2026", "November 2026", "Desember 2026"];
  const kelasOptions = ["X IPA 1", "X IPA 2", "XI IPA 1", "XI IPA 2", "XII IPA 1", "XII IPS 1"];

  // Filtered List
  const filteredList = useMemo(() => {
    return daftarTagihanSPP.filter((t) => {
      const matchSearch =
        t.siswaNama.toLowerCase().includes(search.toLowerCase()) ||
        t.nisn.includes(search) ||
        t.noKwitansi.toLowerCase().includes(search.toLowerCase());
      const matchBulan = filterBulan === "SEMUA" || t.bulan === filterBulan;
      const matchKelas = filterKelas === "SEMUA" || t.kelas === filterKelas;
      const matchStatus = filterStatus === "SEMUA" || t.status === filterStatus;
      return matchSearch && matchBulan && matchKelas && matchStatus;
    });
  }, [daftarTagihanSPP, search, filterBulan, filterKelas, filterStatus]);

  // Statistics
  const totalNominalTagihan = filteredList.reduce((acc, curr) => acc + curr.nominal, 0);
  const totalPemasukanLunas = filteredList
    .filter((t) => t.status === "LUNAS")
    .reduce((acc, curr) => acc + curr.nominal, 0);
  const totalTunggakan = filteredList
    .filter((t) => t.status === "BELUM_BAYAR" || t.status === "MENUNGGU_KONFIRMASI")
    .reduce((acc, curr) => acc + curr.nominal, 0);
  const totalSiswaLunas = filteredList.filter((t) => t.status === "LUNAS").length;
  const persentaseLunas = totalNominalTagihan > 0 ? Math.round((totalPemasukanLunas / totalNominalTagihan) * 100) : 0;

  function handleKonfirmasiBayar() {
    if (!selectedTagihan) return;
    bayarTagihanSPP(selectedTagihan.id, metodeBayar, catatanBayar);
    setOpenModalBayar(false);
    setSelectedTagihan(null);
    setCatatanBayar("");
  }

  function handleTambahTagihan(e: React.FormEvent) {
    e.preventDefault();
    const siswa = daftarSiswaInduk.find((s) => s.id === formTambah.siswaId) || daftarSiswaInduk[0];
    if (!siswa) return;

    tambahTagihanSPP({
      siswaId: siswa.id,
      siswaNama: siswa.nama,
      nisn: siswa.nisn,
      kelas: siswa.kelas,
      bulan: formTambah.bulan,
      nominal: Number(formTambah.nominal),
      status: "BELUM_BAYAR",
      catatan: formTambah.catatan,
    });

    setOpenModalTambah(false);
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-navy-900 text-white shadow-xs">
              <Receipt size={19} />
            </span>
            <h1 className="font-display text-2xl font-bold tracking-tight text-navy-950">
              Pembayaran SPP &amp; Biaya Siswa
            </h1>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Rekapitulasi tagihan, verifikasi pembayaran SPP, dan pencetakan kwitansi resmi ({tahunAjaranAktif} - {semesterAktif})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setOpenModalTambah(true)}
            className="gap-2 bg-navy-900 text-white hover:bg-navy-800 text-xs cursor-pointer shadow-xs"
          >
            <Plus size={14} />
            Buat Tagihan SPP
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="border-border bg-white shadow-2xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Pemasukan SPP Lunas</span>
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                <TrendingUp size={16} />
              </span>
            </div>
            <div className="mt-2 text-xl font-bold font-mono text-emerald-600">
              Rp {totalPemasukanLunas.toLocaleString("id-ID")}
            </div>
            <div className="mt-1 text-[11px] text-slate-500">{totalSiswaLunas} dari {filteredList.length} tagihan lunas</div>
          </CardContent>
        </Card>

        <Card className="border-border bg-white shadow-2xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Tunggakan Belum Lunas</span>
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-rose-50 text-rose-700">
                <AlertCircle size={16} />
              </span>
            </div>
            <div className="mt-2 text-xl font-bold font-mono text-rose-600">
              Rp {totalTunggakan.toLocaleString("id-ID")}
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              {filteredList.filter((t) => t.status !== "LUNAS").length} siswa menunggak
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-white shadow-2xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Persentase Kelunasan</span>
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-blue-50 text-blue-700">
                <DollarSign size={16} />
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-navy-950">
              {persentaseLunas}%
            </div>
            <div className="mt-1 text-[11px] text-slate-500">Target ketertiban 95%</div>
          </CardContent>
        </Card>

        <Card className="border-border bg-white shadow-2xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Total Nilai Tagihan</span>
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-navy-50 text-navy-900">
                <Receipt size={16} />
              </span>
            </div>
            <div className="mt-2 text-xl font-bold font-mono text-navy-950">
              Rp {totalNominalTagihan.toLocaleString("id-ID")}
            </div>
            <div className="mt-1 text-[11px] text-slate-500">{filteredList.length} transaksi tercatat</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="border-border bg-white shadow-md rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-border bg-slate-50/50 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama siswa, NISN, atau no kwitansi..."
                className="h-9 pl-9 text-xs rounded-xl bg-white"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filterBulan}
                onChange={(e) => setFilterBulan(e.target.value)}
                className="h-9 rounded-xl border border-input bg-white px-3 text-xs text-slate-700 outline-none shadow-2xs"
              >
                <option value="SEMUA">Semua Periode</option>
                {bulanOptions.map((b) => (
                  <option key={b} value={b}>
                    {b}
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

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="h-9 rounded-xl border border-input bg-white px-3 text-xs text-slate-700 outline-none shadow-2xs"
              >
                <option value="SEMUA">Semua Status</option>
                <option value="LUNAS">Lunas</option>
                <option value="BELUM_BAYAR">Belum Bayar</option>
                <option value="MENUNGGU_KONFIRMASI">Menunggu Konfirmasi</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-border font-semibold">
                <tr>
                  <th className="px-5 py-3">No. Kwitansi</th>
                  <th className="px-5 py-3">Nama Siswa &amp; NISN</th>
                  <th className="px-5 py-3">Rombel</th>
                  <th className="px-5 py-3">Bulan Tagihan</th>
                  <th className="px-5 py-3">Nominal SPP</th>
                  <th className="px-5 py-3">Metode &amp; Tanggal Bayar</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-400">
                      Tidak ada tagihan SPP yang cocok dengan filter pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredList.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5 font-mono">
                        <span className="font-bold text-navy-950 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          {t.noKwitansi}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="font-bold text-navy-950 text-sm">{t.siswaNama}</div>
                        <div className="text-[11px] text-slate-400 font-mono">NISN: {t.nisn}</div>
                      </td>

                      <td className="px-5 py-3.5 font-medium text-slate-700">
                        {t.kelas}
                      </td>

                      <td className="px-5 py-3.5 font-semibold text-navy-900">
                        {t.bulan}
                      </td>

                      <td className="px-5 py-3.5 font-mono font-bold text-navy-950">
                        Rp {t.nominal.toLocaleString("id-ID")}
                      </td>

                      <td className="px-5 py-3.5">
                        {t.status === "LUNAS" ? (
                          <div>
                            <div className="font-medium text-slate-800 text-[11px]">{t.metodeBayar?.replace("_", " ")}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{t.tanggalBayar}</div>
                          </div>
                        ) : t.status === "MENUNGGU_KONFIRMASI" ? (
                          <span className="text-[11px] text-amber-700 font-medium">Bukti terunggah</span>
                        ) : (
                          <span className="text-[11px] text-slate-400">-</span>
                        )}
                      </td>

                      <td className="px-5 py-3.5">
                        <Badge
                          variant={
                            t.status === "LUNAS"
                              ? "hadir"
                              : t.status === "MENUNGGU_KONFIRMASI"
                              ? "izin"
                              : "alpha"
                          }
                          className="text-[10px]"
                        >
                          {t.status === "LUNAS"
                            ? "Lunas"
                            : t.status === "MENUNGGU_KONFIRMASI"
                            ? "Verifikasi"
                            : "Belum Bayar"}
                        </Badge>
                      </td>

                      <td className="px-5 py-3.5 text-right space-x-1">
                        {t.status !== "LUNAS" ? (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedTagihan(t);
                              setOpenModalBayar(true);
                            }}
                            className="h-7 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-medium"
                          >
                            Bayar
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setKwitansiPrint(t)}
                            className="h-7 px-2.5 border-slate-200 text-slate-700 hover:bg-slate-100 rounded-lg text-[11px] gap-1"
                          >
                            <Printer size={12} />
                            Kwitansi
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* MODAL BAYAR SPP */}
      {openModalBayar && selectedTagihan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-fade-up space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display text-base font-bold text-navy-950 flex items-center gap-2">
                <CreditCard size={18} className="text-navy-900" />
                Catat Pembayaran SPP
              </h3>
              <button onClick={() => setOpenModalBayar(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="rounded-xl bg-slate-50 p-3.5 space-y-1.5 border border-slate-200 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Nama Siswa:</span>
                <span className="font-bold text-navy-950">{selectedTagihan.siswaNama}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Kelas &amp; NISN:</span>
                <span className="font-mono">{selectedTagihan.kelas} &bull; {selectedTagihan.nisn}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Bulan Tagihan:</span>
                <span className="font-semibold text-navy-900">{selectedTagihan.bulan}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200">
                <span className="font-bold text-slate-700">Nominal Tagihan:</span>
                <span className="font-mono font-bold text-sm text-emerald-600">
                  Rp {selectedTagihan.nominal.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Metode Pembayaran</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setMetodeBayar("TRANSFER_BANK")}
                    className={cn(
                      "p-2 rounded-xl border text-center font-medium cursor-pointer transition-colors",
                      metodeBayar === "TRANSFER_BANK"
                        ? "bg-navy-900 text-white border-navy-900"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    Transfer Bank
                  </button>
                  <button
                    type="button"
                    onClick={() => setMetodeBayar("QRIS")}
                    className={cn(
                      "p-2 rounded-xl border text-center font-medium cursor-pointer transition-colors",
                      metodeBayar === "QRIS"
                        ? "bg-navy-900 text-white border-navy-900"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    QRIS
                  </button>
                  <button
                    type="button"
                    onClick={() => setMetodeBayar("TUNAI_KASIR")}
                    className={cn(
                      "p-2 rounded-xl border text-center font-medium cursor-pointer transition-colors",
                      metodeBayar === "TUNAI_KASIR"
                        ? "bg-navy-900 text-white border-navy-900"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    Tunai Kasir
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Catatan Transaksi (Opsional)</label>
                <Input
                  value={catatanBayar}
                  onChange={(e) => setCatatanBayar(e.target.value)}
                  placeholder="Contoh: Diterima kasir TU sekolah"
                  className="h-9 text-xs rounded-xl"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOpenModalBayar(false)}
                className="rounded-xl text-xs"
              >
                Batal
              </Button>
              <Button
                size="sm"
                onClick={handleKonfirmasiBayar}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold gap-1.5"
              >
                <Check size={14} />
                Konfirmasi Lunas
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CETAK KWITANSI RESMI */}
      {kwitansiPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 sm:p-8 shadow-2xl animate-fade-up space-y-5 border border-slate-200">
            {/* Header Kwitansi */}
            <div className="flex items-start justify-between border-b-2 border-navy-900 pb-4">
              <div>
                <h2 className="font-display text-lg font-bold text-navy-950 uppercase tracking-tight">
                  Kwitansi Pembayaran SPP
                </h2>
                <p className="text-xs font-semibold text-navy-800">SMA NEGERI 3 CONTOH</p>
                <p className="text-[10px] text-slate-500">Jl. Pendidikan No. 45, Kota Bandung &bull; NPSN: 20219842</p>
              </div>
              <div className="text-right">
                <div className="font-mono text-xs font-bold text-navy-950">{kwitansiPrint.noKwitansi}</div>
                <div className="text-[10px] text-slate-400">Tgl: {kwitansiPrint.tanggalBayar || "2026-07-05"}</div>
              </div>
            </div>

            {/* Rincian Kwitansi */}
            <div className="space-y-2.5 text-xs">
              <div className="grid grid-cols-3">
                <span className="text-slate-500">Telah diterima dari:</span>
                <span className="col-span-2 font-bold text-navy-950">{kwitansiPrint.siswaNama}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-slate-500">Nomor Induk / NISN:</span>
                <span className="col-span-2 font-mono text-slate-800">{kwitansiPrint.nisn} ({kwitansiPrint.kelas})</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-slate-500">Untuk Pembayaran:</span>
                <span className="col-span-2 font-semibold text-navy-900">Iuran SPP Sekolah Bulan {kwitansiPrint.bulan}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-slate-500">Metode Pembayaran:</span>
                <span className="col-span-2 font-medium text-slate-700">{kwitansiPrint.metodeBayar?.replace("_", " ")}</span>
              </div>
            </div>

            {/* Nominal Box with Stempel Lunas */}
            <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 p-4">
              <div>
                <span className="text-[11px] text-slate-500 uppercase font-semibold">Jumlah Terbayar:</span>
                <div className="font-mono text-2xl font-bold text-emerald-600">
                  Rp {kwitansiPrint.nominal.toLocaleString("id-ID")}
                </div>
              </div>
              <div className="rounded-lg border-2 border-dashed border-emerald-600 px-3 py-1 text-center font-bold text-xs uppercase tracking-wider text-emerald-700 rotate-[-4deg]">
                ✓ LUNAS
              </div>
            </div>

            {/* Footer Signatures */}
            <div className="pt-2 flex justify-between text-[11px] text-slate-500">
              <div className="text-center">
                <p>Wali Murid / Siswa</p>
                <div className="h-12" />
                <p className="font-semibold text-navy-950">({kwitansiPrint.siswaNama})</p>
              </div>
              <div className="text-center">
                <p>Bendahara / Petugas TU</p>
                <div className="h-12" />
                <p className="font-semibold text-navy-950">Dra. Hj. Sri Wahyuni, M.Ak</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setKwitansiPrint(null)}
                className="rounded-xl text-xs"
              >
                Tutup
              </Button>
              <Button
                size="sm"
                onClick={() => window.print()}
                className="bg-navy-900 hover:bg-navy-800 text-white rounded-xl text-xs gap-1.5 shadow-sm"
              >
                <Printer size={14} />
                Cetak Kwitansi (PDF)
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH TAGIHAN MANUAL */}
      {openModalTambah && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-fade-up space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display text-base font-bold text-navy-950 flex items-center gap-2">
                <Plus size={18} className="text-navy-900" />
                Buat Tagihan SPP Siswa
              </h3>
              <button onClick={() => setOpenModalTambah(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleTambahTagihan} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Pilih Siswa</label>
                <select
                  value={formTambah.siswaId}
                  onChange={(e) => setFormTambah({ ...formTambah, siswaId: e.target.value })}
                  className="h-9 w-full rounded-xl border border-input bg-white px-3 text-xs text-slate-700 outline-none"
                >
                  <option value="">-- Pilih Siswa --</option>
                  {daftarSiswaInduk.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nama} ({s.kelas} - {s.nisn})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Bulan Periode</label>
                  <select
                    value={formTambah.bulan}
                    onChange={(e) => setFormTambah({ ...formTambah, bulan: e.target.value })}
                    className="h-9 w-full rounded-xl border border-input bg-white px-3 text-xs text-slate-700 outline-none"
                  >
                    {bulanOptions.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Nominal Tagihan (Rp)</label>
                  <Input
                    required
                    type="number"
                    value={formTambah.nominal}
                    onChange={(e) => setFormTambah({ ...formTambah, nominal: Number(e.target.value) })}
                    className="h-9 font-mono text-xs rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Catatan</label>
                <Input
                  value={formTambah.catatan}
                  onChange={(e) => setFormTambah({ ...formTambah, catatan: e.target.value })}
                  placeholder="Contoh: SPP Reguler Bulanan"
                  className="h-9 text-xs rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setOpenModalTambah(false)}
                  className="rounded-xl text-xs"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-navy-900 text-white hover:bg-navy-800 rounded-xl text-xs shadow-xs"
                >
                  Terbitkan Tagihan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
