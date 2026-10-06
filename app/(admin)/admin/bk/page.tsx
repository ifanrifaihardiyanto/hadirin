"use client";

import { useState, useEffect } from "react";
import {
  HeartHandshake,
  ShieldAlert,
  Award,
  Calendar,
  Clock,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Printer,
  X,
  Plus,
  UserCheck,
  UserX,
  Send,
  BadgeAlert,
  RefreshCw,
} from "lucide-react";
import { useStore, type KasusBK, type StatusKasusBK, type KategoriBK } from "@/lib/store";
import { api } from "@/lib/api-client";
import { getTanggalHariIniFormatted } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const KATEGORI_CONFIG: Record<
  KategoriBK,
  { label: string; className: string }
> = {
  ABSENSI_TINGGI: {
    label: "Absensi / Alpha Tinggi",
    className: "bg-rose-50 text-rose-700 border-rose-200",
  },
  KEDISIPLINAN: {
    label: "Kedisiplinan & Tata Tertib",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  PRESTASI: {
    label: "Prestasi & Karakter Positif",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  KONSELING_PRIBADI: {
    label: "Konseling Masalah Pribadi",
    className: "bg-sky-50 text-sky-700 border-sky-200",
  },
};

const STATUS_CONFIG: Record<
  StatusKasusBK,
  { label: string; className: string; icon: typeof CheckCircle2 }
> = {
  DALAM_PEMBINAAN: {
    label: "Dalam Pembinaan BK",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Clock,
  },
  PANGGILAN_ORTU: {
    label: "Panggilan Orang Tua",
    className: "bg-rose-50 text-rose-700 border-rose-200 font-bold",
    icon: AlertTriangle,
  },
  PERINGATAN_KERAS: {
    label: "Surat Peringatan (SP)",
    className: "bg-red-100 text-red-900 border-red-300 font-bold",
    icon: BadgeAlert,
  },
  SELESAI: {
    label: "Tuntas / Terselesaikan",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
  },
};

export default function AdminBKPage() {
  const [bkList, setBkList] = useState<KasusBK[]>([]);
  const [siswaList, setSiswaList] = useState<{ id: number; nama: string; nis: string; kelas?: string }[]>([]);
  const [kelasList, setKelasList] = useState<{ id: number; nama: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [search, setSearch] = useState("");
  const [filterKategori, setFilterKategori] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [suratPanggilanTarget, setSuratPanggilanTarget] = useState<KasusBK | null>(null);

  // Form State Tambah Kasus
  const [formData, setFormData] = useState({
    namaSiswa: "",
    nis: "",
    kelas: "X IPA 1",
    kategori: "ABSENSI_TINGGI" as KategoriBK,
    poin: -10,
    deskripsi: "",
    tindakan: "",
    status: "DALAM_PEMBINAAN" as StatusKasusBK,
    guruBK: "Dra. Endang Rahayu, M.Pd (Koord. BK)",
    waliKelas: "Sari Wulandari, S.Pd",
  });

  const fetchBK = async () => {
    setLoading(true);
    try {
      const [resBK, resSiswa, resKelas] = await Promise.all([
        api.getKasusBKList().catch(() => ({ data: [] })),
        api.getSiswaList().catch(() => ({ data: [] })),
        api.getKelasList().catch(() => ({ data: [] })),
      ]);

      const siswas = (resSiswa?.data || []).map((s: any) => ({
        id: s.id,
        nama: s.nama,
        nis: s.nis || "",
        kelas: s.kelas?.nama || "",
      }));
      setSiswaList(siswas);

      const kelases = (resKelas?.data || []).map((k: any) => ({
        id: k.id,
        nama: k.nama,
      }));
      setKelasList(kelases);

      if (resBK?.data) {
        const mapped: KasusBK[] = resBK.data.map((k: any) => ({
          id: String(k.id),
          namaSiswa: k.siswa?.nama || "Siswa",
          nis: k.siswa?.nis || "24001",
          kelas: k.siswa?.kelas?.nama || "X IPA 1",
          kategori: (k.kategori || "ABSENSI_TINGGI") as KategoriBK,
          poin: Number(k.poin || 0),
          deskripsi: k.deskripsi || "-",
          tindakan: k.tindakan || "-",
          status: (k.status || "DALAM_PEMBINAAN") as StatusKasusBK,
          guruBK: k.guru_b_k?.nama || "Dra. Endang Rahayu, M.Pd (Koord. BK)",
          waliKelas: k.siswa?.kelas?.wali_guru?.nama || "Wali Kelas",
          tanggalKasus: k.tanggal_kasus || getTanggalHariIniFormatted(),
          nomorSuratPanggilan: k.nomor_surat_panggilan,
          jadwalPanggilanOrtu: k.jadwal_panggilan_ortu,
        }));
        setBkList(mapped);
      }
    } catch (err: any) {
      console.warn("Gagal memuat catatan BK:", err?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBK();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: StatusKasusBK, tindakan: string) => {
    try {
      await api.updateKasusBKStatus(id, { status: newStatus, tindakan });
      setBkList((prev) =>
        prev.map((k) => (k.id === id ? { ...k, status: newStatus, tindakan } : k))
      );
    } catch (err: any) {
      alert("Gagal memperbarui status: " + (err?.message || "Terjadi kesalahan"));
    }
  };

  const filtered = bkList.filter((k) => {
    const matchSearch =
      k.namaSiswa.toLowerCase().includes(search.toLowerCase()) ||
      k.nis.includes(search) ||
      k.kelas.toLowerCase().includes(search.toLowerCase()) ||
      k.deskripsi.toLowerCase().includes(search.toLowerCase());
    const matchKat = filterKategori === "ALL" || k.kategori === filterKategori;
    const matchStat = filterStatus === "ALL" || k.status === filterStatus;
    return matchSearch && matchKat && matchStat;
  });

  const totalKasus = bkList.length;
  const panggilanOrtuCount = bkList.filter((k) => k.status === "PANGGILAN_ORTU").length;
  const dalamPembinaanCount = bkList.filter((k) => k.status === "DALAM_PEMBINAAN").length;
  const prestasiCount = bkList.filter((k) => k.kategori === "PRESTASI").length;

  const handleSubmitNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaSiswa || !formData.deskripsi) return;

    setSubmitting(true);
    try {
      const matchedSiswa = siswaList.find(
        (s) =>
          s.nama.toLowerCase() === formData.namaSiswa.toLowerCase() ||
          s.nis === formData.nis
      );

      const suratNomor =
        formData.status === "PANGGILAN_ORTU"
          ? `421.3/0${Math.floor(100 + Math.random() * 900)}/SMA.03/BK/VII/2026`
          : undefined;
      const jadwalOrtu =
        formData.status === "PANGGILAN_ORTU"
          ? "Senin, 28 Juli 2026 pukul 09.00 WIB di Ruang BK"
          : undefined;

      const payload = {
        siswa_id: matchedSiswa?.id || siswaList[0]?.id || 1,
        kategori: formData.kategori,
        poin: formData.poin,
        deskripsi: formData.deskripsi,
        tindakan: formData.tindakan || undefined,
        status: formData.status,
        nomor_surat_panggilan: suratNomor,
        jadwal_panggilan_ortu: jadwalOrtu,
      };

      const res = await api.createKasusBK(payload);
      const newEntry: KasusBK = {
        id: String(res?.data?.id || Date.now()),
        ...formData,
        tanggalKasus: getTanggalHariIniFormatted(),
        nomorSuratPanggilan: suratNomor,
        jadwalPanggilanOrtu: jadwalOrtu,
      };

      setBkList((prev) => [newEntry, ...prev]);
      setIsModalOpen(false);
      setFormData({
        namaSiswa: "",
        nis: "",
        kelas: "X IPA 1",
        kategori: "ABSENSI_TINGGI",
        poin: -10,
        deskripsi: "",
        tindakan: "",
        status: "DALAM_PEMBINAAN",
        guruBK: "Dra. Endang Rahayu, M.Pd (Koord. BK)",
        waliKelas: "Sari Wulandari, S.Pd",
      });
    } catch (err: any) {
      alert("Gagal menyimpan catatan BK: " + (err?.message || "Terjadi kesalahan"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold tracking-tight text-navy-950 md:text-3xl">
              Bimbingan Konseling &amp; Kedisiplinan Siswa
            </h1>
            <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-medium">
              Layanan BK
            </Badge>
          </div>
          <p className="text-sm text-slate-500">
            Monitoring siswa berisiko absensi, buku catatan kasus, poin tata tertib, dan penerbitan surat panggilan orang tua.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchBK}
            disabled={loading}
            className="text-xs h-9 gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-navy-900 hover:bg-navy-800 text-white gap-2 font-medium shadow-xs text-xs h-9"
          >
            <Plus className="h-4 w-4" />
            Catat Kasus / Pembinaan Baru
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-slate-200/80 bg-white shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Catatan Kasus
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-50 text-navy-700">
              <HeartHandshake className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="font-display text-3xl font-bold tracking-tight text-navy-950">
              {loading ? <Skeleton className="h-8 w-16" /> : totalKasus}
            </div>
            <p className="mt-1 text-xs text-slate-500">Siswa tercatat semester ini</p>
          </CardContent>
        </Card>

        <Card className="border border-rose-200 bg-rose-50/60 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-700">
              Panggilan Orang Tua
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="font-display text-3xl font-bold tracking-tight text-rose-900">
              {loading ? <Skeleton className="h-8 w-16" /> : panggilanOrtuCount}
            </div>
            <p className="mt-1 text-xs text-rose-700 font-medium">Perlu surat resmi &amp; mediasi</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Dalam Pembinaan
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="font-display text-3xl font-bold tracking-tight text-amber-700">
              {loading ? <Skeleton className="h-8 w-16" /> : dalamPembinaanCount}
            </div>
            <p className="mt-1 text-xs text-slate-500">Konseling berkala aktif</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Prestasi &amp; Apresiasi
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <Award className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="font-display text-3xl font-bold tracking-tight text-emerald-700">
              {loading ? <Skeleton className="h-8 w-16" /> : prestasiCount}
            </div>
            <p className="mt-1 text-xs text-emerald-600 font-medium">Poin penghargaan karakter</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border border-slate-200/80 bg-white shadow-xs">
        <CardContent className="p-5 pt-5 sm:p-6 sm:pt-6 space-y-3.5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama siswa, NIS, kelas, atau deskripsi kasus..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filterKategori}
                onChange={(e) => setFilterKategori(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="ALL">Semua Kategori</option>
                <option value="ABSENSI_TINGGI">Absensi / Alpha Tinggi</option>
                <option value="KEDISIPLINAN">Kedisiplinan</option>
                <option value="PRESTASI">Prestasi &amp; Apresiasi</option>
                <option value="KONSELING_PRIBADI">Konseling Pribadi</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="ALL">Semua Status</option>
                <option value="PANGGILAN_ORTU">Panggilan Orang Tua</option>
                <option value="DALAM_PEMBINAAN">Dalam Pembinaan</option>
                <option value="PERINGATAN_KERAS">Surat Peringatan</option>
                <option value="SELESAI">Tuntas / Selesai</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kasus List Cards */}
      <div className="space-y-4">
        {loading ? (
          [1, 2, 3].map((n) => (
            <Card key={n} className="border border-slate-200/80 bg-white p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
              <Skeleton className="h-16 w-full rounded-lg" />
              <div className="flex justify-between items-center pt-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-8 w-32 rounded-md" />
              </div>
            </Card>
          ))
        ) : filtered.length === 0 ? (
          <Card className="border border-slate-200/80 bg-white shadow-xs p-10 text-center">
            <HeartHandshake className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-3 text-base font-semibold text-slate-800">
              Tidak ada catatan kasus BK
            </h3>
            <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
              Semua siswa berada dalam kondisi presensi dan kedisiplinan yang baik.
            </p>
          </Card>
        ) : (
          filtered.map((k) => {
            const katCfg = KATEGORI_CONFIG[k.kategori] || KATEGORI_CONFIG.ABSENSI_TINGGI;
            const statCfg = STATUS_CONFIG[k.status] || STATUS_CONFIG.DALAM_PEMBINAAN;
            const StatIcon = statCfg.icon;
            const isNegative = k.poin < 0;

            return (
              <Card
                key={k.id}
                className="border border-slate-200/80 bg-white shadow-xs hover:border-slate-300 transition-colors"
              >
                <CardContent className="p-5 pt-5 sm:p-6 sm:pt-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3 flex-1">
                      {/* Top Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className="bg-navy-100 text-navy-800 font-bold border-navy-200">
                          {k.kelas}
                        </Badge>
                        <span className="text-sm font-bold text-navy-950">
                          {k.namaSiswa}
                        </span>
                        <span className="text-xs text-slate-400">NIS: {k.nis}</span>
                        <div
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${katCfg.className}`}
                        >
                          {katCfg.label}
                        </div>
                        <div
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statCfg.className}`}
                        >
                          <StatIcon className="h-3.5 w-3.5" />
                          {statCfg.label}
                        </div>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded ${
                            isNegative
                              ? "bg-rose-100 text-rose-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {k.poin > 0 ? `+${k.poin}` : k.poin} Poin
                        </span>
                      </div>

                      {/* Deskripsi Masalah */}
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/70 text-xs space-y-1.5">
                        <p className="text-slate-800">
                          <strong className="text-navy-950">Catatan Kejadian / Perilaku: </strong>
                          {k.deskripsi}
                        </p>
                        <p className="text-slate-700">
                          <strong className="text-navy-950">Tindakan / Solusi BK: </strong>
                          {k.tindakan}
                        </p>
                      </div>

                      {/* Meta Information */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          Tanggal: {k.tanggalKasus}
                        </span>
                        <span>Guru BK: {k.guruBK}</span>
                        <span>Wali Kelas: {k.waliKelas}</span>
                        {k.nomorSuratPanggilan && (
                          <span className="text-rose-700 font-semibold">
                            Surat Panggilan: {k.nomorSuratPanggilan}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap lg:flex-col items-center lg:items-end gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                      {k.status === "PANGGILAN_ORTU" && (
                        <Button
                          size="sm"
                          onClick={() => setSuratPanggilanTarget(k)}
                          className="bg-rose-700 hover:bg-rose-800 text-white gap-1.5 text-xs font-medium shadow-xs"
                        >
                          <Printer className="h-3.5 w-3.5" />
                          Cetak Surat Panggilan Ortu
                        </Button>
                      )}

                      {k.status !== "SELESAI" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleUpdateStatus(
                              k.id,
                              "SELESAI",
                              "Siswa telah menyelesaikan konseling dan berkomitmen memperbaiki absensi."
                            )
                          }
                          className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-xs gap-1.5 font-medium"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Tandai Kasus Selesai
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Modal Input Kasus Baru */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4 my-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-display font-bold text-navy-950 text-lg">
                  Catat Kasus / Pembinaan Siswa
                </h3>
                <p className="text-xs text-slate-500">
                  Input data pelanggaran, bimbingan konseling, atau penghargaan prestasi siswa
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNew} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Nama Siswa *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Farhan Maulana"
                    value={formData.namaSiswa}
                    onChange={(e) => setFormData({ ...formData, namaSiswa: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    NIS Siswa
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 24009"
                    value={formData.nis}
                    onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Kelas Siswa
                  </label>
                  <select
                    value={formData.kelas}
                    onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {kelasList.map((k) => (
                      <option key={k.id} value={k.nama}>
                        {k.nama}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Kategori Kasus
                  </label>
                  <select
                    value={formData.kategori}
                    onChange={(e) =>
                      setFormData({ ...formData, kategori: e.target.value as KategoriBK })
                    }
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="ABSENSI_TINGGI">Absensi / Alpha Tinggi</option>
                    <option value="KEDISIPLINAN">Kedisiplinan &amp; Tata Tertib</option>
                    <option value="PRESTASI">Prestasi &amp; Apresiasi</option>
                    <option value="KONSELING_PRIBADI">Konseling Pribadi</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Poin (Positif/Negatif)
                  </label>
                  <input
                    type="number"
                    value={formData.poin}
                    onChange={(e) => setFormData({ ...formData, poin: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Status Kasus
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as StatusKasusBK })
                    }
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="DALAM_PEMBINAAN">Dalam Pembinaan BK</option>
                    <option value="PANGGILAN_ORTU">Panggilan Orang Tua</option>
                    <option value="PERINGATAN_KERAS">Surat Peringatan (SP)</option>
                    <option value="SELESAI">Tuntas / Selesai</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Deskripsi Masalah / Kejadian *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Deskripsikan kronologi atau catatan perilaku siswa..."
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Tindakan &amp; Rekomendasi Solusi BK
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Pemanggilan orang tua, konseling tatap muka, penugasan mandiri..."
                  value={formData.tindakan}
                  onChange={(e) => setFormData({ ...formData, tindakan: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={submitting}
                  className="bg-navy-900 hover:bg-navy-800 text-white font-medium shadow-xs"
                >
                  {submitting ? "Menyimpan..." : "Simpan Catatan BK"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Format Cetak Resmi Surat Panggilan Orang Tua (Kop Surat Sekolah) */}
      {suratPanggilanTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full p-8 space-y-6 my-8">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="font-display font-bold text-navy-950 text-xl">
                  Pratinjau Surat Panggilan Orang Tua Resmi
                </h3>
                <p className="text-xs text-slate-500">
                  Dokumen resmi layanan Bimbingan Konseling (BK) berkop dinas
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => window.print()}
                  className="bg-navy-900 hover:bg-navy-800 text-white gap-2 font-medium"
                >
                  <Printer className="h-4 w-4" />
                  Cetak / Simpan PDF
                </Button>
                <button
                  onClick={() => setSuratPanggilanTarget(null)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* LEMBAR SURAT RESMI */}
            <div className="border border-slate-300 p-8 rounded-lg bg-white text-slate-900 space-y-6 font-serif">
              {/* KOP RESMI */}
              <div className="text-center border-b-2 border-double border-slate-900 pb-4 font-sans">
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

              {/* Data Surat */}
              <div className="flex justify-between text-xs font-sans">
                <div>
                  <p><strong>Nomor</strong> : {suratPanggilanTarget.nomorSuratPanggilan || "421.3/089/SMA.03/BK/VII/2026"}</p>
                  <p><strong>Lampiran</strong> : -</p>
                  <p><strong>Perihal</strong> : <u>Permohonan Kehadiran Orang Tua / Wali Murid</u></p>
                </div>
                <div className="text-right">
                  <p>Bogor, 24 Juli 2026</p>
                  <p>Kepada Yth.</p>
                  <p><strong>Bapak/Ibu Orang Tua / Wali Murid</strong></p>
                  <p>dari: <strong>{suratPanggilanTarget.namaSiswa}</strong> ({suratPanggilanTarget.kelas})</p>
                  <p>di Tempat</p>
                </div>
              </div>

              {/* Isi Surat */}
              <div className="text-xs leading-relaxed space-y-3">
                <p>Dengan hormat,</p>
                <p>
                  Sehubungan dengan perkembangan kedisiplinan dan absensi belajar putra/putri Bapak/Ibu di SMA Negeri 3 Contoh:
                </p>
                <div className="bg-slate-50 p-3 rounded border border-slate-200 font-sans">
                  <p><strong>Nama Siswa</strong> : {suratPanggilanTarget.namaSiswa}</p>
                  <p><strong>NIS</strong> : {suratPanggilanTarget.nis}</p>
                  <p><strong>Kelas</strong> : {suratPanggilanTarget.kelas}</p>
                  <p><strong>Keterangan Masalah</strong> : {suratPanggilanTarget.deskripsi}</p>
                </div>
                <p>
                  Maka dengan ini kami mengharapkan kehadiran Bapak/Ibu pada:
                </p>
                <div className="pl-6 space-y-1 font-sans font-semibold">
                  <p>Hari / Tanggal : {suratPanggilanTarget.jadwalPanggilanOrtu || "Jumat, 25 Juli 2026"}</p>
                  <p>Pukul : 09.00 WIB s/d Selesai</p>
                  <p>Tempat : Ruang Bimbingan Konseling (BK) SMA Negeri 3 Contoh</p>
                  <p>Menghadap : Guru Pembimbing BK &amp; Wali Kelas</p>
                </div>
                <p>
                  Mengingat pentingnya hal tersebut demi kelancaran proses pendidikan ananda, kami sangat mengharapkan kehadiran Bapak/Ibu tepat pada waktunya.
                </p>
                <p>
                  Demikian surat permohonan ini kami sampaikan, atas perhatian dan kerja sama yang baik kami ucapkan terima kasih.
                </p>
              </div>

              {/* Tanda Tangan */}
              <div className="grid grid-cols-2 pt-6 text-xs text-center font-sans">
                <div>
                  <p>Mengetahui,</p>
                  <p className="font-semibold">Kepala SMA Negeri 3 Contoh</p>
                  <div className="h-16" />
                  <p className="font-bold underline">Drs. Hendra Wijaya, M.Pd</p>
                  <p className="text-slate-600">NIP. 19680315 199412 1 002</p>
                </div>
                <div>
                  <p>Bogor, 24 Juli 2026</p>
                  <p className="font-semibold">Koordinator Bimbingan Konseling</p>
                  <div className="h-16" />
                  <p className="font-bold underline">{suratPanggilanTarget.guruBK}</p>
                  <p className="text-slate-600">NIP. 19750918 200212 2 003</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
