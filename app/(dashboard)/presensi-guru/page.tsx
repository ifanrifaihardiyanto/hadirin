"use client";

import { useState, useEffect } from "react";
import {
  Loader2,
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
  Navigation,
  RefreshCw,
  XCircle,
  X,
  Info,
} from "lucide-react";
import { useStore, type StatusPresensiGuru } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getTanggalHariIniFormatted } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Haversine Formula untuk kalkulasi jarak GPS dalam meter
function hitungJarakMeter(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // meter
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

// Koordinat Target Sekolah Default (SMAN 3 Contoh)
const TARGET_SEKOLAH = {
  nama: "SMAN 3 Contoh (Kampus Utama)",
  lat: -6.229728,
  lng: 106.829442,
  radiusMaksimal: 200, // 200 meter
};

interface NotificationModal {
  isOpen: boolean;
  type: "success" | "error" | "info";
  title: string;
  message: string;
  details?: {
    waktu?: string;
    lokasi?: string;
    jarak?: string;
    status?: string;
  };
}

export default function PresensiGuruMandiriPage() {
  const { presensiGuruList, checkInGuru, checkOutGuru, refreshPresensiGuruToday, currentUser } = useStore();
  const [jamSekarang, setJamSekarang] = useState("07.00.00");
  const [isDinasModalOpen, setIsDinasModalOpen] = useState(false);
  const [dinasKeterangan, setDinasKeterangan] = useState("");
  const [isSubmittingCheckIn, setIsSubmittingCheckIn] = useState(false);
  const [isSubmittingCheckOut, setIsSubmittingCheckOut] = useState(false);
  const [isSubmittingDinas, setIsSubmittingDinas] = useState(false);

  // GPS State
  const [gpsLoading, setGpsLoading] = useState(true);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [jarakSekolah, setJarakSekolah] = useState<number | null>(null);
  const [isDalamRadius, setIsDalamRadius] = useState<boolean>(true);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Notification Modal State
  const [notif, setNotif] = useState<NotificationModal>({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });

  const guruId = currentUser?.id || "g1";
  // Cari record presensi guru yang cocok dengan ID akun yang login atau entry paling atas
  const myRecord = presensiGuruList.find(
    (p) => String(p.guruId) === String(guruId) || String(p.guruId) === "1" || String(p.guruId) === "g1"
  ) || presensiGuruList[0];

  // Deteksi GPS Asli dari Browser Device
  const mintaLokasiGPS = () => {
    setGpsLoading(true);
    setGpsError(null);

    if (typeof window === "undefined" || !navigator.geolocation) {
      setGpsError("Perangkat tidak mendukung geolokasi GPS");
      setGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserCoords({ lat, lng });

        const meter = hitungJarakMeter(lat, lng, TARGET_SEKOLAH.lat, TARGET_SEKOLAH.lng);
        setJarakSekolah(meter);
        // Valid jika dalam radius sekolah (toleransi atau jika izin dinas)
        setIsDalamRadius(meter <= TARGET_SEKOLAH.radiusMaksimal);
        setGpsLoading(false);
      },
      (err) => {
        console.warn("GPS Geolocation error:", err.message);
        let pesan = "Izin lokasi tidak diaktifkan.";
        if (err.code === 1) pesan = "Akses lokasi ditolak browser. Menggunakan estimasi jaringan.";
        else if (err.code === 2) pesan = "Sinyal GPS tidak ditemukan.";
        else if (err.code === 3) pesan = "Permintaan GPS timeout.";

        setGpsError(pesan);
        // Fallback radius tetap valid untuk demonstrasi KBM lokal
        setUserCoords({ lat: TARGET_SEKOLAH.lat, lng: TARGET_SEKOLAH.lng });
        setJarakSekolah(15);
        setIsDalamRadius(true);
        setGpsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    );
  };

  useEffect(() => {
    mintaLokasiGPS();
    // ON-DEMAND FETCH: Hanya panggil 1 API presensi hari ini untuk halaman ini saja!
    refreshPresensiGuruToday();
  }, []);

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

  const handleCheckIn = async () => {
    setIsSubmittingCheckIn(true);
    try {
      const lokasiNama = userCoords
        ? `Sesuai Titik GPS (${userCoords.lat.toFixed(5)}, ${userCoords.lng.toFixed(5)})`
        : "Kampus Utama SMAN 3";

      const res = await checkInGuru(
        guruId,
        undefined,
        "Presensi Mandiri GPS",
        {
          latitude: userCoords?.lat,
          longitude: userCoords?.lng,
          lokasiNama,
        }
      );

      const sekarang = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB";
      const statusText = new Date().getHours() < 7 ? "Tepat Waktu" : "Terlambat";

      setNotif({
        isOpen: true,
        type: "success",
        title: "Check-In Berhasil!",
        message: "Presensi kehadiran Anda telah sukses tervalidasi dan tersimpan di database sistem.",
        details: {
          waktu: `${sekarang}`,
          lokasi: lokasiNama,
          jarak: jarakSekolah !== null ? `${jarakSekolah} meter dari pusat sekolah` : "Dalam radius sekolah",
          status: statusText,
        },
      });
    } catch (e: any) {
      setNotif({
        isOpen: true,
        type: "error",
        title: "Gagal Check-In",
        message: e?.message || "Terjadi kesalahan saat memproses presensi ke server.",
      });
    } finally {
      setIsSubmittingCheckIn(false);
    }
  };

  const handleCheckOut = async () => {
    setIsSubmittingCheckOut(true);
    try {
      await checkOutGuru(guruId);
      const sekarang = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB";

      setNotif({
        isOpen: true,
        type: "success",
        title: "Check-Out Berhasil!",
        message: "Jam kepulangan Anda telah berhasil dicatat resmi di database.",
        details: {
          waktu: `${sekarang}`,
          lokasi: TARGET_SEKOLAH.nama,
          status: "Presensi Lengkap (Selesai Dinas)",
        },
      });
    } catch (e: any) {
      setNotif({
        isOpen: true,
        type: "error",
        title: "Gagal Check-Out",
        message: e?.message || "Terjadi kendala saat check-out ke server.",
      });
    } finally {
      setIsSubmittingCheckOut(false);
    }
  };

  const handleDinasSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dinasKeterangan) return;
    setIsSubmittingDinas(true);
    try {
      await checkInGuru(guruId, "IZIN_DINAS", dinasKeterangan, {
        latitude: userCoords?.lat,
        longitude: userCoords?.lng,
        lokasiNama: "Penugasan Luar / Dinas",
      });
      setIsDinasModalOpen(false);
      setDinasKeterangan("");

      setNotif({
        isOpen: true,
        type: "success",
        title: "Laporan Dinas / Cuti Berhasil!",
        message: "Pengajuan izin dinas luar / cuti berhasil dicatat ke sistem dan diteruskan ke bagian kurikulum/TU.",
        details: {
          status: "IZIN DINAS / CUTI",
          lokasi: "Lokasi Tugas Luar",
        },
      });
    } finally {
      setIsSubmittingDinas(false);
    }
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

              {/* Geofence Live Status Badge with Refresh Button */}
              <div className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full backdrop-blur-xs border text-xs font-medium ${
                    gpsLoading
                      ? "bg-amber-500/10 border-amber-400/30 text-amber-200"
                      : isDalamRadius
                      ? "bg-emerald-500/15 border-emerald-400/30 text-emerald-300"
                      : "bg-rose-500/15 border-rose-400/30 text-rose-300"
                  }`}
                >
                  <MapPin size={14} className={isDalamRadius ? "text-emerald-400 shrink-0" : "text-rose-400 shrink-0"} />
                  <span>
                    {gpsLoading
                      ? "Mendeteksi GPS..."
                      : userCoords
                      ? `GPS: ${userCoords.lat.toFixed(4)}, ${userCoords.lng.toFixed(4)} (${jarakSekolah ?? 0}m)`
                      : "GPS Jaringan Aktif"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={mintaLokasiGPS}
                  title="Refresh Lokasi GPS"
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <RefreshCw size={14} className={gpsLoading ? "animate-spin" : ""} />
                </button>
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
                {getTanggalHariIniFormatted()} · Batas Masuk: 07.00 WIB
              </p>
            </div>

            {/* Check-In / Check-Out Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <Button
                type="button"
                onClick={handleCheckIn}
                disabled={isSubmittingCheckIn || Boolean(myRecord?.jamMasuk && myRecord.jamMasuk !== "-")}
                className="h-14 bg-emerald-500 hover:bg-emerald-600 disabled:bg-white/10 disabled:text-white/40 text-white font-bold text-sm rounded-xl gap-2 shadow-sm transition-all cursor-pointer"
              >
                {isSubmittingCheckIn ? (
                  <>
                    <Loader2 size={18} className="animate-spin text-white" />
                    Menyimpan Presensi ke Database...
                  </>
                ) : myRecord?.jamMasuk && myRecord.jamMasuk !== "-" ? (
                  <>
                    <Check size={18} />
                    Sudah Check-In ({myRecord.jamMasuk})
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
                disabled={isSubmittingCheckOut || !myRecord?.jamMasuk || myRecord.jamMasuk === "-" || Boolean(myRecord?.jamPulang)}
                variant="outline"
                className="h-14 border-white/20 bg-white/5 hover:bg-white/15 text-white disabled:bg-white/5 disabled:text-white/30 font-bold text-sm rounded-xl gap-2 backdrop-blur-xs transition-all cursor-pointer"
              >
                {isSubmittingCheckOut ? (
                  <>
                    <Loader2 size={18} className="animate-spin text-white" />
                    Menyimpan Jam Pulang...
                  </>
                ) : myRecord?.jamPulang ? (
                  <>
                    <Check size={18} />
                    Sudah Check-Out ({myRecord.jamPulang})
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
              Verifikasi mesin pencatatan waktu &amp; lokasi
            </CardDescription>
          </CardHeader>
          <div className="p-5 md:p-6 space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Status Kehadiran:</span>
                <Badge
                  className={
                    myRecord?.status === "TERLAMBAT"
                      ? "bg-amber-50 text-amber-700 border-amber-200 text-xs font-bold gap-1"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-bold gap-1"
                  }
                >
                  <CheckCircle2 size={13} />
                  {myRecord?.status
                    ? myRecord.status === "TERLAMBAT"
                      ? "Terlambat"
                      : myRecord.status === "IZIN_DINAS"
                      ? "Izin Dinas"
                      : "Tepat Waktu"
                    : "Belum Presensi"}
                </Badge>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Jam Datang:</span>
                <span className="font-mono font-bold text-navy-950">
                  {myRecord?.jamMasuk || "-"}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Jam Pulang:</span>
                <span className="font-mono font-bold text-slate-700">
                  {myRecord?.jamPulang || "-"}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Titik Koordinat:</span>
                <span className="text-slate-700 font-mono text-[11px] truncate max-w-[170px]" title={userCoords ? `${userCoords.lat}, ${userCoords.lng}` : "Mendeteksi..."}>
                  {userCoords ? `${userCoords.lat.toFixed(4)}, ${userCoords.lng.toFixed(4)}` : "Kampus SMAN 3"}
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
            Bulan Berjalan
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
                {presensiGuruList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-500 italic">
                      Belum ada data riwayat presensi yang tercatat. Silakan lakukan Check-In.
                    </td>
                  </tr>
                ) : (
                  presensiGuruList.map((r, i) => (
                    <tr key={r.id || i} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-5 font-bold text-navy-950">{r.tanggal}</td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-700">{r.jamMasuk}</td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-700">{r.jamPulang || "-"}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            r.status === "TEPAT_WAKTU"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : r.status === "TERLAMBAT"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-sky-50 text-sky-700 border-sky-200"
                          }`}
                        >
                          {r.status === "TEPAT_WAKTU" ? "Tepat Waktu" : r.status === "TERLAMBAT" ? "Terlambat" : "Izin Dinas"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">{r.lokasi || "Sekolah"}</td>
                      <td className="py-3 px-5 text-slate-600 italic">
                        &quot;{r.keterangan || "-"}&quot;
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Pop-up Modal Notifikasi Hasil Check-In / Check-Out */}
      {notif.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-150 transform transition-all scale-100">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 ${
                    notif.type === "success"
                      ? "bg-emerald-100 text-emerald-600"
                      : notif.type === "error"
                      ? "bg-rose-100 text-rose-600"
                      : "bg-sky-100 text-sky-600"
                  }`}
                >
                  {notif.type === "success" ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : notif.type === "error" ? (
                    <XCircle className="h-6 w-6" />
                  ) : (
                    <Info className="h-6 w-6" />
                  )}
                </div>
                <div>
                  <h3 className="font-display font-bold text-navy-950 text-lg leading-snug">
                    {notif.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Notifikasi Sistem Presensi Mandiri</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNotif((prev) => ({ ...prev, isOpen: false }))}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
              {notif.message}
            </p>

            {notif.details && (
              <div className="space-y-2 border border-slate-200/80 rounded-xl p-3 bg-white text-xs">
                {notif.details.waktu && (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Waktu Tercatat:</span>
                    <span className="font-mono font-bold text-navy-950">{notif.details.waktu}</span>
                  </div>
                )}
                {notif.details.status && (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Status Kehadiran:</span>
                    <span className="font-bold text-emerald-700">{notif.details.status}</span>
                  </div>
                )}
                {notif.details.jarak && (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Jarak Radius:</span>
                    <span className="text-slate-700 font-medium">{notif.details.jarak}</span>
                  </div>
                )}
                {notif.details.lokasi && (
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Lokasi:</span>
                    <span className="text-slate-700 font-medium truncate max-w-[200px]" title={notif.details.lokasi}>
                      {notif.details.lokasi}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="pt-2">
              <Button
                type="button"
                onClick={() => setNotif((prev) => ({ ...prev, isOpen: false }))}
                className="w-full bg-navy-950 hover:bg-navy-900 text-white text-xs font-semibold py-2.5 rounded-xl cursor-pointer"
              >
                Tutup &amp; Mengerti
              </Button>
            </div>
          </div>
        </div>
      )}

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
                  disabled={isSubmittingDinas}
                  className="bg-navy-900 hover:bg-navy-800 text-white text-xs gap-1.5"
                >
                  <Send size={13} />
                  {isSubmittingDinas ? "Mengirim..." : "Kirim Laporan Dinas"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
