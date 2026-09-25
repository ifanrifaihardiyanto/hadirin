"use client";

import { useState } from "react";
import {
  FileCheck,
  Calendar,
  Clock,
  Search,
  CheckCircle2,
  XCircle,
  Users,
  ShieldAlert,
  Printer,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AdminIzinMonitoringPage() {
  const { daftarIzin, updateStatusIzin, currentUser } = useStore();
  const [query, setQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedJenis, setSelectedJenis] = useState("ALL");

  const filtered = daftarIzin.filter((i) => {
    const matchQuery =
      i.namaSiswa.toLowerCase().includes(query.toLowerCase()) ||
      i.kelas.toLowerCase().includes(query.toLowerCase()) ||
      i.nis.includes(query) ||
      i.alasan.toLowerCase().includes(query.toLowerCase());
    const matchStatus = selectedStatus === "ALL" || i.status === selectedStatus;
    const matchJenis = selectedJenis === "ALL" || i.jenis === selectedJenis;
    return matchQuery && matchStatus && matchJenis;
  });

  const totalIzin = daftarIzin.length;
  const menungguCount = daftarIzin.filter((i) => i.status === "MENUNGGU").length;
  const disetujuiCount = daftarIzin.filter((i) => i.status === "DISETUJUI").length;
  const sakitCount = daftarIzin.filter((i) => i.jenis === "SAKIT").length;

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
            Pengawasan terpusat izin ketidakhadiran murid seluruh tingkatan kelas
          </p>
        </div>

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

      {/* KPI Stats */}
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
            Menampilkan data terintegrasi presensi kelas
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
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-2">
                        <Badge variant="navy" className="text-[10px] font-bold">
                          {item.kelas}
                        </Badge>
                        <div>
                          <p className="font-bold text-navy-950">{item.namaSiswa}</p>
                          <p className="text-[11px] text-muted-foreground font-mono">NIS: {item.nis}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {item.jenis === "SAKIT" && (
                        <Badge variant="sakit" className="text-[10px]">
                          Sakit
                        </Badge>
                      )}
                      {item.jenis === "IZIN" && (
                        <Badge variant="izin" className="text-[10px]">
                          Izin
                        </Badge>
                      )}
                      {item.jenis === "DISPENSASI" && (
                        <Badge variant="outline" className="border-indigo-300 bg-indigo-50 text-indigo-800 text-[10px]">
                          Dispensasi
                        </Badge>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                      <p className="font-medium text-navy-950">{item.tanggalMulai}</p>
                      {item.tanggalMulai !== item.tanggalSelesai && (
                        <p className="text-[11px] text-muted-foreground">s/d {item.tanggalSelesai}</p>
                      )}
                    </td>
                    <td className="py-3.5 px-6 max-w-xs text-slate-700 leading-snug">
                      {item.alasan}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {item.diajukanOleh}
                    </td>
                    <td className="py-3.5 px-6 text-center whitespace-nowrap">
                      {item.status === "MENUNGGU" ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <Button
                            size="sm"
                            onClick={() =>
                              updateStatusIzin(
                                item.id,
                                "DISETUJUI",
                                `${currentUser?.nama || "Drs. Hendra Wijaya"} (Kepala Sekolah)`
                              )
                            }
                            className="bg-emerald-600 hover:bg-emerald-700 text-white h-7 text-[11px] px-2.5 font-semibold cursor-pointer"
                          >
                            Setujui
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatusIzin(item.id, "DITOLAK")}
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
                          {item.disetujuiOleh && (
                            <p className="text-[10px] text-slate-400 mt-0.5 max-w-[160px] truncate mx-auto">
                              {item.disetujuiOleh}
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
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
