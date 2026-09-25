"use client";

import { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Building,
  Briefcase,
  LogIn,
  LogOut,
  MapPin,
  Check,
  Send,
  FileCheck,
  UserCheck,
} from "lucide-react";
import { useStore, type StatusPresensiGuru } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function PresensiGuruMandiriPage() {
  const { presensiGuruList, checkInGuru, checkOutGuru, currentUser } = useStore();
  const [jamSekarang, setJamSekarang] = useState("06.45.12");
  const [sudahCheckIn, setSudahCheckIn] = useState(false);
  const [sudahCheckOut, setSudahCheckOut] = useState(false);
  const [isDinasModalOpen, setIsDinasModalOpen] = useState(false);
  const [dinasKeterangan, setDinasKeterangan] = useState("");

  const guruId = currentUser?.id || "g1";
  const myRecord = presensiGuruList.find((p) => p.guruId === guruId);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setJamSekarang(
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCheckIn = () => {
    checkInGuru(guruId);
    setSudahCheckIn(true);
  };

  const handleCheckOut = () => {
    checkOutGuru(guruId);
    setSudahCheckOut(true);
  };

  const handleDinasSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dinasKeterangan) return;
    checkInGuru(guruId, "IZIN_DINAS", dinasKeterangan);
    setIsDinasModalOpen(false);
    setDinasKeterangan("");
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-1">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold tracking-tight text-navy-950 md:text-3xl">
              Presensi Mandiri Pendidik &amp; Tenaga Kependidikan
            </h1>
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-semibold">
              Aktif Hari Ini
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Pencatatan jam kedatangan &amp; kepulangan resmi pengajar SMA Negeri 3 Contoh
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsDinasModalOpen(true)}
          className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs gap-1.5 font-medium cursor-pointer shadow-2xs"
        >
          <Briefcase className="h-4 w-4 text-primary" />
          Ajukan Izin Dinas Luar / Cuti
        </Button>
      </div>

      {/* Main Clock & Check-in Terminal Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Terminal Check-in */}
        <Card className="lg:col-span-2 border-none bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 text-white shadow-md overflow-hidden">
          <div className="p-6 md:p-8 flex flex-col justify-between h-full space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                    Terminal Presensi Online
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1">
                  {currentUser?.nama || "Sari Wulandari, S.Pd"}
                </h3>
                <p className="text-xs text-navy-200 font-mono">
                  NIP. 19850412 200902 2 003 · Guru Matematika
                </p>
              </div>

              <div className="flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-full backdrop-blur-xs border border-white/15 w-fit">
                <MapPin size={14} className="text-emerald-400 shrink-0" />
                <span className="text-xs font-medium text-white">
                  Radius Geofence: Sekolah Valid (12m)
                </span>
              </div>
            </div>

            {/* Big Live Digital Clock */}
            <div className="text-center py-4 sm:py-6">
              <p className="text-xs uppercase tracking-widest text-navy-300 font-medium">
                WAKTU SERVER RESMI INDONESIA BARAT (WIB)
              </p>
              <div className="mt-2 font-mono text-5xl sm:text-6xl font-black tracking-tight text-white drop-shadow-sm">
                {jamSekarang}
              </div>
              <p className="mt-2 text-xs sm:text-sm text-navy-200 flex items-center justify-center gap-1.5 font-medium">
                <Calendar size={14} className="text-navy-300" />
                Kamis, 24 Juli 2026 · Batas Masuk: 07.00 WIB
              </p>
            </div>

            {/* Check-In / Check-Out Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <Button
                type="button"
                onClick={handleCheckIn}
                disabled={sudahCheckIn || (myRecord && myRecord.jamMasuk !== "-")}
                className="h-14 bg-emerald-500 hover:bg-emerald-600 disabled:bg-white/10 disabled:text-white/40 text-white font-bold text-sm rounded-xl gap-2 shadow-sm transition-all cursor-pointer"
              >
                {sudahCheckIn || (myRecord && myRecord.jamMasuk !== "-") ? (
                  <>
                    <Check size={18} />
                    Sudah Check-In ({myRecord?.jamMasuk || "06.42 WIB"})
                  </>
                ) : (
                  <>
                    <LogIn size={18} />
                    Check-In Kedatangan
                  </>
                )}
              </Button>

              <Button
                type="button"
                onClick={handleCheckOut}
                disabled={sudahCheckOut || (myRecord && !!myRecord.jamPulang)}
                variant="outline"
                className="h-14 border-white/20 bg-white/5 hover:bg-white/15 text-white disabled:bg-white/5 disabled:text-white/30 font-bold text-sm rounded-xl gap-2 backdrop-blur-xs transition-all cursor-pointer"
              >
                {sudahCheckOut || (myRecord && myRecord.jamPulang) ? (
                  <>
                    <Check size={18} />
                    Sudah Check-Out ({myRecord?.jamPulang || "15.30 WIB"})
                  </>
                ) : (
                  <>
                    <LogOut size={18} />
                    Check-Out Kepulangan (15.00+)
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Right 1 Col: Status & Daily Summary Card */}
        <Card className="border border-border bg-white shadow-xs">
          <CardHeader className="border-b border-border py-4">
            <CardTitle className="text-base font-bold text-navy-950 flex items-center gap-2">
              <UserCheck size={18} className="text-primary" />
              Status Presensi Hari Ini
            </CardTitle>
            <CardDescription className="text-xs">
              Verifikasi mesin pencatatan waktu guru
            </CardDescription>
          </CardHeader>
          <div className="p-5 md:p-6 space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Status Kehadiran:</span>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-bold gap-1">
                  <CheckCircle2 size={13} />
                  Tepat Waktu
                </Badge>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Jam Datang:</span>
                <span className="font-mono font-bold text-navy-950">
                  {myRecord?.jamMasuk || "06.42 WIB"}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Jam Pulang:</span>
                <span className="font-mono font-bold text-slate-700">
                  {myRecord?.jamPulang || "15.30 WIB"}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Lokasi Presensi:</span>
                <span className="text-slate-700 font-medium truncate max-w-[150px]">
                  Gerbang Utama Sekolah
                </span>
              </div>
            </div>

            {/* Monthly Discipline Stats */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600">Disiplin Bulan Ini:</span>
                <span className="font-mono font-bold text-emerald-700">96% Tepat Waktu</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="bg-emerald-50/70 border border-emerald-200 p-2.5 rounded-lg">
                  <span className="text-[10px] text-emerald-700 block font-medium">Hadir</span>
                  <span className="text-sm font-bold font-mono text-emerald-900">22 Hari</span>
                </div>
                <div className="bg-amber-50/70 border border-amber-200 p-2.5 rounded-lg">
                  <span className="text-[10px] text-amber-700 block font-medium">Terlambat</span>
                  <span className="text-sm font-bold font-mono text-amber-900">1 Hari</span>
                </div>
                <div className="bg-sky-50/70 border border-sky-200 p-2.5 rounded-lg">
                  <span className="text-[10px] text-sky-700 block font-medium">Dinas Luar</span>
                  <span className="text-sm font-bold font-mono text-sky-900">2 Hari</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 italic text-center pt-1">
              Data terintegrasi otomatis ke sistem pelaporan TPP &amp; Honorium Dinas Pendidikan
            </p>
          </div>
        </Card>
      </div>

      {/* Log Presensi Minggu Ini (Desktop Responsive Table & Card) */}
      <Card className="border border-border bg-white shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border py-4">
          <div>
            <CardTitle className="text-base font-bold text-navy-950">
              Riwayat Presensi Mandiri (Minggu Berjalan)
            </CardTitle>
            <CardDescription className="text-xs">
              Log jam masuk dan jam pulang yang telah tervalidasi oleh sistem
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">
            Juli 2026
          </Badge>
        </CardHeader>
        <div className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50/80 text-navy-950 border-b border-border">
                <tr>
                  <th className="py-3 px-5 font-semibold">Hari / Tanggal</th>
                  <th className="py-3 px-4 font-semibold">Jam Masuk</th>
                  <th className="py-3 px-4 font-semibold">Jam Pulang</th>
                  <th className="py-3 px-4 font-semibold">Status Presensi</th>
                  <th className="py-3 px-4 font-semibold">Lokasi</th>
                  <th className="py-3 px-5 font-semibold">Catatan Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  {
                    hari: "Kamis, 24 Juli 2026 (Hari Ini)",
                    masuk: "06.42 WIB",
                    pulang: "15.30 WIB",
                    status: "TEPAT_WAKTU",
                    ket: "Hadir sebelum apel pagi guru",
                    lokasi: "Gerbang Utama Kampus SMAN 3",
                  },
                  {
                    hari: "Rabu, 23 Juli 2026",
                    masuk: "06.40 WIB",
                    pulang: "15.35 WIB",
                    status: "TEPAT_WAKTU",
                    ket: "Piket KBM Lab Komputer",
                    lokasi: "Kampus SMAN 3 Contoh",
                  },
                  {
                    hari: "Selasa, 22 Juli 2026",
                    masuk: "06.50 WIB",
                    pulang: "15.30 WIB",
                    status: "TEPAT_WAKTU",
                    ket: "Tepat waktu",
                    lokasi: "Kampus SMAN 3 Contoh",
                  },
                  {
                    hari: "Senin, 21 Juli 2026",
                    masuk: "07.12 WIB",
                    pulang: "15.30 WIB",
                    status: "TERLAMBAT",
                    ket: "Macet perbaikan jalan Tol Jagorawi",
                    lokasi: "Kampus SMAN 3 Contoh",
                  },
                ].map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-5 font-bold text-navy-950">{r.hari}</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700">{r.masuk}</td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-700">{r.pulang}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          r.status === "TEPAT_WAKTU"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {r.status === "TEPAT_WAKTU" ? "Tepat Waktu" : "Terlambat"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">{r.lokasi}</td>
                    <td className="py-3 px-5 text-slate-600 italic">
                      &quot;{r.ket}&quot;
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Modal Izin Dinas / Cuti */}
      {isDinasModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-display font-bold text-navy-950 text-lg">
                Pengajuan Izin Dinas Luar / Cuti
              </h3>
              <button
                type="button"
                onClick={() => setIsDinasModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDinasSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Jenis Penugasan / Izin
                </label>
                <select className="w-full h-9 rounded-md border border-slate-300 text-xs px-2.5 bg-white">
                  <option>Dinas Luar (Pelatihan / Workshop / Bimtek)</option>
                  <option>Tugas Mengantar Lomba / Pembina Ekskul</option>
                  <option>Cuti Sakit Resmi</option>
                  <option>Cuti Keperluan Pribadi</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Nomor Surat Tugas / Keterangan
                </label>
                <textarea
                  rows={3}
                  value={dinasKeterangan}
                  onChange={(e) => setDinasKeterangan(e.target.value)}
                  placeholder="Contoh: Menghadiri workshop kurikulum merdeka di BBGP, Surat Tugas No. 800/142/Disdik"
                  className="w-full rounded-md border border-slate-300 p-2.5 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDinasModalOpen(false)}
                  className="text-xs"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-navy-900 hover:bg-navy-800 text-white text-xs gap-1.5"
                >
                  <Send size={13} />
                  Kirim Laporan Dinas
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
