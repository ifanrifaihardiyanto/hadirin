"use client";

import { useState, useMemo, useEffect } from "react";
import {
  FileCheck,
  Clock,
  Search,
  CheckCircle2,
  Printer,
  RefreshCw,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface IzinItem {
  id: number;
  siswa_id: number;
  tipe: "SAKIT" | "IZIN" | "DISPENSASI";
  tanggal_mulai: string;
  tanggal_selesai: string;
  keterangan: string;
  status: "MENUNGGU" | "DISETUJUI" | "DITOLAK";
  diajukan_oleh?: string;
  disetujui_oleh?: string;
  bukti_url?: string;
  siswa?: {
    id: number;
    nama: string;
    nis: string;
    kelas?: {
      id: number;
      nama: string;
    };
  };
}

export default function AdminIzinMonitoringPage() {
  const [daftarIzin, setDaftarIzin] = useState<IzinItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedJenis, setSelectedJenis] = useState("ALL");

  const fetchIzinList = async () => {
    setLoading(true);
    try {
      const res = await api.getIzinList();
      if (res && res.data) {
        setDaftarIzin(res.data);
      } else {
        setDaftarIzin([]);
      }
    } catch (err) {
      console.error("Gagal memuat daftar permohonan izin:", err);
      setDaftarIzin([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIzinList();
  }, []);

  const handleUpdateStatus = async (id: number, status: "DISETUJUI" | "DITOLAK") => {
    try {
      await api.updateIzinStatus(id, status);
      await fetchIzinList();
    } catch (err) {
      console.error("Gagal memperbarui status izin:", err);
      alert("Gagal memperbarui status izin.");
    }
  };

  const filtered = useMemo(() => {
    return daftarIzin.filter((i) => {
      const nama = i.siswa?.nama || "";
      const nis = i.siswa?.nis || "";
      const kelas = i.siswa?.kelas?.nama || "";
      const ket = i.keterangan || "";

      const q = query.toLowerCase();
      const matchQuery =
        nama.toLowerCase().includes(q) ||
        kelas.toLowerCase().includes(q) ||
        nis.includes(q) ||
        ket.toLowerCase().includes(q);

      const matchStatus = selectedStatus === "ALL" || i.status === selectedStatus;
      const matchJenis = selectedJenis === "ALL" || i.tipe === selectedJenis;
      return matchQuery && matchStatus && matchJenis;
    });
  }, [daftarIzin, query, selectedStatus, selectedJenis]);

  const totalIzin = daftarIzin.length;
  const menungguCount = daftarIzin.filter((i) => i.status === "MENUNGGU").length;
  const disetujuiCount = daftarIzin.filter((i) => i.status === "DISETUJUI").length;
  const sakitCount = daftarIzin.filter((i) => i.tipe === "SAKIT").length;

  return (
    <div className="w-full space-y-6">
      {/* Page Title & Status */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold tracking-tight text-navy-950 md:text-3xl">
              Monitoring Izin, Sakit &amp; Dispensasi Siswa
            </h1>
            <Badge variant="navy" className="text-[10px]">
              Kesiswaan &amp; BK
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Pengawasan terpusat izin ketidakhadiran murid seluruh tingkatan kelas langsung dari Supabase
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchIzinList}
            disabled={loading}
            className="gap-1.5 border-border bg-white text-xs hover:bg-slate-50"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            Segarkan
          </Button>

          <Button
            onClick={() => window.print()}
            variant="outline"
            size="sm"
            className="gap-2 border-border bg-white text-navy-950 hover:bg-slate-50 font-medium cursor-pointer shadow-2xs text-xs"
          >
            <Printer size={15} />
            <span>Cetak Rekap Izin (PDF)</span>
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="border-border bg-white p-5 animate-pulse">
              <div className="h-3 w-28 rounded bg-slate-200" />
              <div className="mt-3 h-8 w-16 rounded bg-slate-200" />
              <div className="mt-3 h-3 w-40 rounded bg-slate-200" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="border-border bg-white shadow-2xs">
            <CardContent className="p-5 flex flex-col justify-between h-full space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Menunggu Konfirmasi
                </span>
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-amber-50 text-amber-700">
                  <Clock size={16} />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="font-display text-3xl font-bold tracking-tight text-amber-700">
                  {menungguCount}
                </span>
                <Badge variant="secondary" className="text-[10px] bg-amber-50 text-amber-800 border-amber-200">
                  Pending
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground pt-2 border-t border-slate-100">
                Perlu tinjauan wali kelas / guru piket
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-white shadow-2xs">
            <CardContent className="p-5 flex flex-col justify-between h-full space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Total Izin Tervalidasi
                </span>
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
                  <CheckCircle2 size={16} />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="font-display text-3xl font-bold tracking-tight text-emerald-700">
                  {disetujuiCount}
                </span>
                <span className="text-xs text-muted-foreground font-medium">dari {totalIzin} Permohonan</span>
              </div>
              <p className="text-[11px] text-muted-foreground pt-2 border-t border-slate-100">
                Tercatat resmi dalam riwayat kehadiran
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-white shadow-2xs">
            <CardContent className="p-5 flex flex-col justify-between h-full space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Sakit dengan Surat Dokter
                </span>
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-sky-50 text-sky-800">
                  <FileCheck size={16} />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="font-display text-3xl font-bold tracking-tight text-navy-950">
                  {sakitCount}
                </span>
                <Badge variant="sakit" className="text-[10px]">
                  UKS &amp; BK
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground pt-2 border-t border-slate-100">
                Siswa terpantau kondisi kesehatannya
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter and Search Bar */}
      <Card className="border-border bg-white shadow-2xs">
        <CardContent className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-slate-50/70 px-3 py-1.5 text-xs text-muted-foreground">
            <Search size={14} className="text-slate-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama siswa, kelas, NIS, atau alasan..."
              className="w-full bg-transparent outline-none placeholder:text-slate-400 text-navy-950"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-8 rounded-lg border border-border bg-white px-2.5 text-xs font-medium text-navy-950 outline-none"
            >
              <option value="ALL">Semua Status</option>
              <option value="MENUNGGU">Menunggu</option>
              <option value="DISETUJUI">Disetujui</option>
              <option value="DITOLAK">Ditolak</option>
            </select>

            <select
              value={selectedJenis}
              onChange={(e) => setSelectedJenis(e.target.value)}
              className="h-8 rounded-lg border border-border bg-white px-2.5 text-xs font-medium text-navy-950 outline-none"
            >
              <option value="ALL">Semua Jenis</option>
              <option value="SAKIT">Sakit</option>
              <option value="IZIN">Izin</option>
              <option value="DISPENSASI">Dispensasi</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Table of Excuse Passes */}
      <Card className="border-border bg-white shadow-xs overflow-hidden">
        <CardHeader className="border-b border-border py-4 px-6">
          <CardTitle className="text-base font-bold text-navy-950">
            Daftar Arsip Izin Siswa Seluruh Sekolah
          </CardTitle>
          <CardDescription className="text-xs mt-0.5">
            Menampilkan data terintegrasi presensi kelas tersimpan di database
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-border text-[11px] font-bold uppercase text-slate-500">
                <tr>
                  <th className="py-3 px-6">Siswa &amp; Kelas</th>
                  <th className="py-3 px-4">Jenis Izin</th>
                  <th className="py-3 px-4">Periode Tanggal</th>
                  <th className="py-3 px-6">Alasan &amp; Keterangan</th>
                  <th className="py-3 px-4">Pengaju</th>
                  <th className="py-3 px-6 text-center">Status &amp; Verifikator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-4 px-6">
                        <div className="h-4 w-32 rounded bg-slate-200" />
                        <div className="mt-1 h-3 w-20 rounded bg-slate-200" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 w-14 rounded bg-slate-200" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 w-24 rounded bg-slate-200" />
                      </td>
                      <td className="py-4 px-6">
                        <div className="h-4 w-40 rounded bg-slate-200" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 w-16 rounded bg-slate-200" />
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="h-6 w-20 mx-auto rounded bg-slate-200" />
                      </td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400">
                      Tidak ada data permohonan izin yang sesuai filter.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-2">
                          <Badge variant="navy" className="text-[10px] font-bold">
                            {item.siswa?.kelas?.nama || "Kelas"}
                          </Badge>
                          <div>
                            <p className="font-bold text-navy-950">{item.siswa?.nama || "Siswa"}</p>
                            <p className="text-[11px] text-muted-foreground font-mono">NIS: {item.siswa?.nis || "-"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {item.tipe === "SAKIT" && (
                          <Badge variant="sakit" className="text-[10px]">
                            Sakit
                          </Badge>
                        )}
                        {item.tipe === "IZIN" && (
                          <Badge variant="izin" className="text-[10px]">
                            Izin
                          </Badge>
                        )}
                        {item.tipe === "DISPENSASI" && (
                          <Badge variant="outline" className="border-indigo-300 bg-indigo-50 text-indigo-800 text-[10px]">
                            Dispensasi
                          </Badge>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                        <p className="font-medium text-navy-950">{item.tanggal_mulai}</p>
                        {item.tanggal_mulai !== item.tanggal_selesai && (
                          <p className="text-[11px] text-muted-foreground">s/d {item.tanggal_selesai}</p>
                        )}
                      </td>
                      <td className="py-3.5 px-6 max-w-xs text-slate-700 leading-snug">
                        {item.keterangan}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {item.diajukan_oleh || "Orang Tua/Wali"}
                      </td>
                      <td className="py-3.5 px-6 text-center whitespace-nowrap">
                        {item.status === "MENUNGGU" ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <Button
                              size="sm"
                              onClick={() => handleUpdateStatus(item.id, "DISETUJUI")}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white h-7 text-[11px] px-2.5 font-semibold cursor-pointer"
                            >
                              Setujui
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateStatus(item.id, "DITOLAK")}
                              className="border-rose-200 text-rose-600 hover:bg-rose-50 h-7 text-[11px] px-2.5 font-semibold cursor-pointer"
                            >
                              Tolak
                            </Button>
                          </div>
                        ) : item.status === "DISETUJUI" ? (
                          <div>
                            <Badge variant="hadir" className="text-[10px] gap-1 py-0.5">
                              <CheckCircle2 size={11} />
                              Disetujui
                            </Badge>
                            {item.disetujui_oleh && (
                              <p className="text-[10px] text-slate-400 mt-0.5 max-w-[160px] truncate mx-auto">
                                {item.disetujui_oleh}
                              </p>
                            )}
                          </div>
                        ) : (
                          <Badge variant="alpha" className="text-[10px]">
                            Ditolak
                          </Badge>
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
    </div>
  );
}
