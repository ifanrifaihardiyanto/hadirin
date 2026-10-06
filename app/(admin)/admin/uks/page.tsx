"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  HeartPulse,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Download,
  Activity,
  Pill,
  Stethoscope,
  Trash2,
  Edit,
  RefreshCw,
  Loader2,
} from "lucide-react";
import {
  RekamMedisSiswa,
  ObatUKS,
  daftarRekamMedisUKSAwal,
  daftarObatUKSAwal,
} from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";

export interface UKSKunjunganLive {
  id: string | number;
  siswaId: string | number;
  namaSiswa: string;
  kelas: string;
  tanggal: string;
  jam: string;
  kategoriKeluhan: string;
  keluhan: string;
  tindakan: string;
  obatDiberikan: string;
  kondisiAkhir: string;
  petugasUKS: string;
  status: "SEDANG_DIRAWAT" | "SELESAI" | string;
}

export default function ModulUKSPage() {
  const [daftarKunjunganUKS, setDaftarKunjunganUKS] = useState<UKSKunjunganLive[]>([]);
  const [daftarSiswa, setDaftarSiswa] = useState<any[]>([]);
  const [daftarRekamMedisUKS, setDaftarRekamMedisUKS] = useState<RekamMedisSiswa[]>(daftarRekamMedisUKSAwal);
  const [daftarObatUKS, setDaftarObatUKS] = useState<ObatUKS[]>(daftarObatUKSAwal);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [activeTab, setActiveTab] = useState<"KUNJUNGAN" | "REKAM_MEDIS" | "OBAT">("KUNJUNGAN");

  // Search & Filters for Kunjungan
  const [searchKunjungan, setSearchKunjungan] = useState("");
  const [filterKeluhan, setFilterKeluhan] = useState("SEMUA");
  const [filterStatusKunjungan, setFilterStatusKunjungan] = useState("SEMUA");

  // Search & Filters for Rekam Medis
  const [searchMedis, setSearchMedis] = useState("");
  const [filterKelasMedis, setFilterKelasMedis] = useState("SEMUA");
  const [filterStatusGizi, setFilterStatusGizi] = useState("SEMUA");

  // Search & Filters for Obat
  const [searchObat, setSearchObat] = useState("");
  const [filterKategoriObat, setFilterKategoriObat] = useState("SEMUA");

  // Modals
  const [showModalKunjungan, setShowModalKunjungan] = useState(false);
  const [showModalEditMedis, setShowModalEditMedis] = useState(false);
  const [selectedMedis, setSelectedMedis] = useState<RekamMedisSiswa | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Form State Kunjungan Baru
  const [formKunjungan, setFormKunjungan] = useState({
    siswaId: "",
    namaSiswa: "",
    kelas: "",
    jam: "09:30",
    kategoriKeluhan: "DEMAM",
    keluhan: "",
    tindakan: "Istirahat di ruang UKS dan diberikan obat sesuai keluhan",
    obatDiberikan: "Paracetamol 500mg",
    kondisiAkhir: "MEMBAIK_KEMBALI_KE_KELAS",
    petugasUKS: "drg. Ratna Sari & Tim PMR",
    status: "SEDANG_DIRAWAT",
  });

  const fetchData = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const [resUKS, resSiswa] = await Promise.all([
        api.getUKSList(),
        api.getSiswaList(),
      ]);

      const rawUKS = (resUKS as any)?.data || (resUKS as any) || [];
      const normalizedKunjungan: UKSKunjunganLive[] = Array.isArray(rawUKS)
        ? rawUKS.map((item: any) => ({
            id: item.id,
            siswaId: item.siswa_id || item.siswaId || "",
            namaSiswa: item.siswa?.nama || item.nama_siswa || item.namaSiswa || "Siswa",
            kelas: item.siswa?.kelas?.nama_kelas || item.kelas || "Kelas Umum",
            tanggal: item.tanggal || new Date().toISOString().split("T")[0],
            jam: item.jam || "09:00",
            kategoriKeluhan: item.kategori_keluhan || item.kategoriKeluhan || "DEMAM",
            keluhan: item.keluhan || "-",
            tindakan: item.tindakan || "-",
            obatDiberikan: item.obat_diberikan || item.obatDiberikan || "-",
            kondisiAkhir: item.kondisi_akhir || item.kondisiAkhir || "MEMBAIK_KEMBALI_KE_KELAS",
            petugasUKS: item.petugas_uks || item.petugasUKS || "Petugas UKS",
            status: item.status || "SELESAI",
          }))
        : [];
      setDaftarKunjunganUKS(normalizedKunjungan);

      const rawSiswa = (resSiswa as any)?.data || (resSiswa as any) || [];
      const siswasList = Array.isArray(rawSiswa) ? rawSiswa : [];
      setDaftarSiswa(siswasList);

      if (isManual) showToast("Data kunjungan UKS berhasil diperbarui.");
    } catch (err: any) {
      console.error("Gagal memuat data UKS:", err);
      showToast("Gagal memuat data UKS dari server.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // KPI Metrics Calculation
  const totalKunjungan = daftarKunjunganUKS.length;
  const sedangDirawat = daftarKunjunganUKS.filter((k) => k.status === "SEDANG_DIRAWAT").length;
  const totalRekamMedis = daftarRekamMedisUKS.length;
  const giziBaikCount = daftarRekamMedisUKS.filter((m) => m.statusGizi === "GIZI_BAIK").length;
  const rasioGiziBaik = totalRekamMedis > 0 ? Math.round((giziBaikCount / totalRekamMedis) * 100) : 100;
  const obatMenipis = daftarObatUKS.filter((o) => o.stok <= 10).length;

  // Filtered Kunjungan
  const filteredKunjungan = useMemo(() => {
    return daftarKunjunganUKS.filter((item) => {
      const matchSearch =
        item.namaSiswa.toLowerCase().includes(searchKunjungan.toLowerCase()) ||
        item.kelas.toLowerCase().includes(searchKunjungan.toLowerCase()) ||
        item.keluhan.toLowerCase().includes(searchKunjungan.toLowerCase()) ||
        item.petugasUKS.toLowerCase().includes(searchKunjungan.toLowerCase());
      const matchKeluhan = filterKeluhan === "SEMUA" || item.kategoriKeluhan === filterKeluhan;
      const matchStatus = filterStatusKunjungan === "SEMUA" || item.status === filterStatusKunjungan;
      return matchSearch && matchKeluhan && matchStatus;
    });
  }, [daftarKunjunganUKS, searchKunjungan, filterKeluhan, filterStatusKunjungan]);

  // Filtered Rekam Medis
  const filteredMedis = useMemo(() => {
    return daftarRekamMedisUKS.filter((item) => {
      const matchSearch =
        item.namaSiswa.toLowerCase().includes(searchMedis.toLowerCase()) ||
        item.kelas.toLowerCase().includes(searchMedis.toLowerCase()) ||
        item.riwayatAlergi.toLowerCase().includes(searchMedis.toLowerCase()) ||
        item.riwayatPenyakit.toLowerCase().includes(searchMedis.toLowerCase());
      const matchKelas = filterKelasMedis === "SEMUA" || item.kelas === filterKelasMedis;
      const matchGizi = filterStatusGizi === "SEMUA" || item.statusGizi === filterStatusGizi;
      return matchSearch && matchKelas && matchGizi;
    });
  }, [daftarRekamMedisUKS, searchMedis, filterKelasMedis, filterStatusGizi]);

  // Filtered Obat
  const filteredObat = useMemo(() => {
    return daftarObatUKS.filter((item) => {
      const matchSearch =
        item.namaObat.toLowerCase().includes(searchObat.toLowerCase()) ||
        item.kodeObat.toLowerCase().includes(searchObat.toLowerCase()) ||
        item.indikasi.toLowerCase().includes(searchObat.toLowerCase());
      const matchKategori = filterKategoriObat === "SEMUA" || item.kategori === filterKategoriObat;
      return matchSearch && matchKategori;
    });
  }, [daftarObatUKS, searchObat, filterKategoriObat]);

  // Handlers
  const handleSimpanKunjungan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formKunjungan.keluhan.trim()) return;

    // Tentukan siswaId yang valid
    const targetSiswa = daftarSiswa.find((s) => String(s.id) === String(formKunjungan.siswaId)) || daftarSiswa[0];
    const targetId = targetSiswa ? targetSiswa.id : 1;

    setIsSubmitting(true);
    try {
      await api.recordKunjunganUKS({
        siswa_id: targetId,
        keluhan: formKunjungan.keluhan.trim(),
        kategori_keluhan: formKunjungan.kategoriKeluhan,
        tindakan: formKunjungan.tindakan.trim(),
        obat_diberikan: formKunjungan.obatDiberikan.trim(),
        kondisi_akhir: formKunjungan.kondisiAkhir,
        petugas_uks: formKunjungan.petugasUKS.trim(),
      });

      showToast("Catatan kunjungan UKS berhasil disimpan.");
      setShowModalKunjungan(false);
      setFormKunjungan({
        siswaId: "",
        namaSiswa: "",
        kelas: "",
        jam: "09:30",
        kategoriKeluhan: "DEMAM",
        keluhan: "",
        tindakan: "Istirahat di ruang UKS dan diberikan obat sesuai keluhan",
        obatDiberikan: "Paracetamol 500mg",
        kondisiAkhir: "MEMBAIK_KEMBALI_KE_KELAS",
        petugasUKS: "drg. Ratna Sari & Tim PMR",
        status: "SEDANG_DIRAWAT",
      });
      fetchData();
    } catch (err: any) {
      console.error("Gagal simpan kunjungan UKS:", err);
      showToast("Gagal menyimpan kunjungan UKS.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEditMedis = (item: RekamMedisSiswa) => {
    setSelectedMedis(item);
    setShowModalEditMedis(true);
  };

  const handleUpdateMedisSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedis) return;

    // Recalculate BMI
    const tbMeter = selectedMedis.tinggiBadanCm / 100;
    const calcBmi = Number((selectedMedis.beratBadanKg / (tbMeter * tbMeter)).toFixed(1));
    let gizi: RekamMedisSiswa["statusGizi"] = "GIZI_BAIK";
    if (calcBmi < 18.5) gizi = "KURANG";
    else if (calcBmi >= 25 && calcBmi < 30) gizi = "BERLEBIH";
    else if (calcBmi >= 30) gizi = "OBESITAS";

    setDaftarRekamMedisUKS((prev) =>
      prev.map((m) =>
        m.id === selectedMedis.id
          ? {
              ...selectedMedis,
              bmi: calcBmi,
              statusGizi: gizi,
              terakhirPeriksa: new Date().toISOString().split("T")[0],
            }
          : m
      )
    );

    showToast("Rekam medis berhasil diperbarui.");
    setShowModalEditMedis(false);
  };

  const handleExportCSV = () => {
    const headers = [
      "ID",
      "Tanggal",
      "Jam",
      "Nama Siswa",
      "Kelas",
      "Kategori Keluhan",
      "Keluhan",
      "Tindakan Medis",
      "Obat Diberikan",
      "Kondisi Akhir",
      "Petugas UKS",
      "Status",
    ];

    const rows = daftarKunjunganUKS.map((k) => [
      k.id,
      k.tanggal,
      k.jam,
      `"${k.namaSiswa}"`,
      `"${k.kelas}"`,
      k.kategoriKeluhan,
      `"${k.keluhan.replace(/"/g, '""')}"`,
      `"${k.tindakan.replace(/"/g, '""')}"`,
      `"${k.obatDiberikan}"`,
      k.kondisiAkhir,
      `"${k.petugasUKS}"`,
      k.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_Kunjungan_UKS_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Laporan kunjungan UKS berhasil diekspor.");
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-2xl bg-navy-950 px-4 py-3 text-sm font-medium text-white shadow-2xl animate-in fade-in slide-in-from-top-4 border border-navy-800">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-1">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold tracking-tight text-navy-950 md:text-3xl flex items-center gap-2">
              <HeartPulse className="text-primary h-7 w-7" />
              Layanan UKS &amp; Rekam Medis
            </h1>
            <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-xs font-semibold">
              Klinik Sekolah Terpadu
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Monitoring kesehatan siswa, rekam kunjungan ruang UKS, dan logistik obat P3K live dari database Supabase.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchData(true)}
            disabled={isRefreshing || isLoading}
            className="gap-2 cursor-pointer shadow-xs"
          >
            <RefreshCw size={14} className={cn((isRefreshing || isLoading) && "animate-spin")} />
            <span>{isRefreshing ? "Memuat..." : "Refresh"}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={daftarKunjunganUKS.length === 0}
            className="gap-2 cursor-pointer"
          >
            <Download size={15} />
            Ekspor CSV
          </Button>

          <Button
            size="sm"
            className="bg-navy-900 hover:bg-navy-800 text-white gap-2 font-semibold shadow-xs cursor-pointer"
            onClick={() => {
              if (daftarSiswa.length > 0) {
                setFormKunjungan((prev) => ({
                  ...prev,
                  siswaId: String(daftarSiswa[0].id),
                  namaSiswa: daftarSiswa[0].nama,
                  kelas: daftarSiswa[0].kelas?.nama_kelas || "Kelas Umum",
                }));
              }
              setShowModalKunjungan(true);
            }}
          >
            <Plus size={16} />
            Catat Kunjungan UKS
          </Button>
        </div>
      </div>

      {/* 5 Real-time KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="border border-border bg-white shadow-xs animate-pulse">
              <div className="p-4 md:p-5 space-y-2">
                <div className="h-3 w-20 bg-slate-200 rounded" />
                <div className="h-7 w-16 bg-slate-200 rounded" />
                <div className="h-3 w-28 bg-slate-100 rounded" />
              </div>
            </Card>
          ))
        ) : (
          <>
            <Card className="border border-border bg-white shadow-xs">
              <div className="p-4 md:p-5">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Kunjungan Pasien
                </span>
                <p className="font-mono text-2xl md:text-3xl font-bold text-navy-950 mt-1">
                  {totalKunjungan} <span className="text-xs font-normal text-slate-400">Siswa</span>
                </p>
                <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                  <Clock size={12} className="text-primary" /> Rekap Bulan Ini
                </p>
              </div>
            </Card>

            <Card className="border border-border bg-white shadow-xs">
              <div className="p-4 md:p-5">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Sedang Dirawat
                </span>
                <p className="font-mono text-2xl md:text-3xl font-bold text-amber-700 mt-1">
                  {sedangDirawat} <span className="text-xs font-normal text-slate-400">Bed UKS</span>
                </p>
                <p className="text-[11px] text-amber-600 mt-1 font-semibold flex items-center gap-1">
                  ● Observasi Aktif
                </p>
              </div>
            </Card>

            <Card className="border border-border bg-white shadow-xs">
              <div className="p-4 md:p-5">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Rekam Medis Terdata
                </span>
                <p className="font-mono text-2xl md:text-3xl font-bold text-sky-800 mt-1">
                  {totalRekamMedis} <span className="text-xs font-normal text-slate-400">Profil</span>
                </p>
                <p className="text-[11px] text-sky-700 mt-1">Skrining TB/BB &amp; Gol. Darah</p>
              </div>
            </Card>

            <Card className="border border-border bg-white shadow-xs">
              <div className="p-4 md:p-5">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Status Gizi Seimbang
                </span>
                <p className="font-mono text-2xl md:text-3xl font-bold text-emerald-700 mt-1">
                  {rasioGiziBaik}%
                </p>
                <p className="text-[11px] text-emerald-700 mt-1 font-medium flex items-center gap-1">
                  <CheckCircle2 size={12} /> Indeks Massa Tubuh Normal
                </p>
              </div>
            </Card>

            <Card className="border border-border bg-white shadow-xs">
              <div className="p-4 md:p-5">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Stok P3K Menipis
                </span>
                <p className="font-mono text-2xl md:text-3xl font-bold text-rose-700 mt-1">
                  {obatMenipis} <span className="text-xs font-normal text-slate-400">Item</span>
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  {obatMenipis > 0 ? "Perlu restock segera" : "Persediaan obat aman"}
                </p>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-border space-x-2">
        <button
          onClick={() => setActiveTab("KUNJUNGAN")}
          className={`pb-3 px-4 text-xs md:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "KUNJUNGAN"
              ? "border-primary text-navy-950 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Activity size={16} />
          Buku Kunjungan &amp; Tindakan UKS ({daftarKunjunganUKS.length})
        </button>

        <button
          onClick={() => setActiveTab("REKAM_MEDIS")}
          className={`pb-3 px-4 text-xs md:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "REKAM_MEDIS"
              ? "border-primary text-navy-950 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Stethoscope size={16} />
          Rekam Medis &amp; Skrining Fisik ({daftarRekamMedisUKS.length})
        </button>

        <button
          onClick={() => setActiveTab("OBAT")}
          className={`pb-3 px-4 text-xs md:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "OBAT"
              ? "border-primary text-navy-950 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Pill size={16} />
          Stok Obat &amp; Kotak P3K ({daftarObatUKS.length})
        </button>
      </div>

      {/* TAB 1: BUKU KUNJUNGAN */}
      {activeTab === "KUNJUNGAN" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-border shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari siswa, kelas, keluhan, petugas..."
                value={searchKunjungan}
                onChange={(e) => setSearchKunjungan(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-primary"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                aria-label="Filter Keluhan"
                value={filterKeluhan}
                onChange={(e) => setFilterKeluhan(e.target.value)}
                className="text-xs p-2 rounded-xl border border-slate-200 focus:outline-hidden bg-white w-full sm:w-auto"
              >
                <option value="SEMUA">Semua Keluhan</option>
                <option value="DEMAM">Demam &amp; Meriang</option>
                <option value="SAKIT_PERUT_MAAG">Sakit Perut / Maag</option>
                <option value="LUKA_CEDERA">Luka &amp; Cedera Fisik</option>
                <option value="PUSING_MIGRAIN">Pusing / Migrain</option>
                <option value="PINGSAN_LEMAS">Pingsan / Lemas</option>
                <option value="ALERGI_ASMA">Alergi &amp; Asma</option>
              </select>

              <select
                aria-label="Filter Status Kunjungan"
                value={filterStatusKunjungan}
                onChange={(e) => setFilterStatusKunjungan(e.target.value)}
                className="text-xs p-2 rounded-xl border border-slate-200 focus:outline-hidden bg-white w-full sm:w-auto"
              >
                <option value="SEMUA">Semua Status</option>
                <option value="SEDANG_DIRAWAT">Sedang Dirawat di UKS</option>
                <option value="SELESAI">Selesai Ditangani</option>
              </select>
            </div>
          </div>

          <Card className="border border-border bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-border text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Waktu</th>
                    <th className="py-3.5 px-4">Pasien Siswa</th>
                    <th className="py-3.5 px-4">Kategori &amp; Gejala Keluhan</th>
                    <th className="py-3.5 px-4">Tindakan Medis &amp; Obat</th>
                    <th className="py-3.5 px-4">Hasil &amp; Kondisi</th>
                    <th className="py-3.5 px-4">Petugas UKS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {isLoading ? (
                    Array.from({ length: 4 }).map((_, idx) => (
                      <tr key={idx} className="animate-pulse">
                        <td className="py-3 px-4"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
                        <td className="py-3 px-4"><div className="h-4 w-32 bg-slate-200 rounded" /></td>
                        <td className="py-3 px-4"><div className="h-4 w-40 bg-slate-200 rounded" /></td>
                        <td className="py-3 px-4"><div className="h-4 w-36 bg-slate-200 rounded" /></td>
                        <td className="py-3 px-4"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
                        <td className="py-3 px-4"><div className="h-4 w-28 bg-slate-200 rounded" /></td>
                      </tr>
                    ))
                  ) : filteredKunjungan.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">
                        Tidak ada catatan kunjungan UKS yang sesuai filter.
                      </td>
                    </tr>
                  ) : (
                    filteredKunjungan.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="font-semibold text-navy-950 block">{item.jam} WIB</span>
                          <span className="text-[10px] text-slate-400">{item.tanggal}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-navy-950 block">{item.namaSiswa}</span>
                          <span className="text-[10px] text-slate-500">{item.kelas}</span>
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-semibold mb-1 ${
                              item.kategoriKeluhan === "DEMAM"
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : item.kategoriKeluhan === "LUKA_CEDERA"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-sky-50 text-sky-700 border-sky-200"
                            }`}
                          >
                            {item.kategoriKeluhan.replace(/_/g, " ")}
                          </Badge>
                          <p className="text-slate-600 leading-snug line-clamp-2">{item.keluhan}</p>
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <p className="text-slate-700 leading-snug font-medium">{item.tindakan}</p>
                          <span className="text-[10px] text-primary font-semibold block mt-0.5">
                            Obat: {item.obatDiberikan}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {item.status === "SEDANG_DIRAWAT" ? (
                            <Badge className="bg-amber-500 text-white text-[10px] font-semibold animate-pulse">
                              Sedang Observasi
                            </Badge>
                          ) : (
                            <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px]">
                              {item.kondisiAkhir.replace(/_/g, " ")}
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-medium whitespace-nowrap">
                          {item.petugasUKS}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: REKAM MEDIS */}
      {activeTab === "REKAM_MEDIS" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-border shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama siswa, alergi, penyakit..."
                value={searchMedis}
                onChange={(e) => setSearchMedis(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-primary"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                aria-label="Filter Kelas Rekam Medis"
                value={filterKelasMedis}
                onChange={(e) => setFilterKelasMedis(e.target.value)}
                className="text-xs p-2 rounded-xl border border-slate-200 focus:outline-hidden bg-white w-full sm:w-auto"
              >
                <option value="SEMUA">Semua Kelas</option>
                <option value="Kelas X IPA 1">Kelas X IPA 1</option>
                <option value="Kelas XI IPS 2">Kelas XI IPS 2</option>
                <option value="Kelas XII IPA 3">Kelas XII IPA 3</option>
              </select>

              <select
                aria-label="Filter Status Gizi"
                value={filterStatusGizi}
                onChange={(e) => setFilterStatusGizi(e.target.value)}
                className="text-xs p-2 rounded-xl border border-slate-200 focus:outline-hidden bg-white w-full sm:w-auto"
              >
                <option value="SEMUA">Semua Status Gizi</option>
                <option value="GIZI_BAIK">Gizi Baik (Normal)</option>
                <option value="KURANG">Gizi Kurang</option>
                <option value="BERLEBIH">Gizi Berlebih</option>
                <option value="OBESITAS">Obesitas</option>
              </select>
            </div>
          </div>

          <Card className="border border-border bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-border text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Nama Siswa</th>
                    <th className="py-3.5 px-4">Kelas</th>
                    <th className="py-3.5 px-4">TB / BB</th>
                    <th className="py-3.5 px-4">Gol. Darah &amp; BMI</th>
                    <th className="py-3.5 px-4">Riwayat Alergi</th>
                    <th className="py-3.5 px-4">Penyakit Khusus</th>
                    <th className="py-3.5 px-4">Kontak Darurat</th>
                    <th className="py-3.5 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredMedis.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-bold text-navy-950">{m.namaSiswa}</td>
                      <td className="py-3 px-4 text-slate-600">{m.kelas}</td>
                      <td className="py-3 px-4 font-mono font-medium">
                        {m.tinggiBadanCm} cm / {m.beratBadanKg} kg
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-navy-950 block">Gol. {m.golonganDarah}</span>
                        <Badge
                          variant="outline"
                          className={`text-[9px] font-semibold mt-0.5 ${
                            m.statusGizi === "GIZI_BAIK"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : "bg-rose-50 text-rose-800 border-rose-200"
                          }`}
                        >
                          BMI {m.bmi} ({m.statusGizi.replace(/_/g, " ")})
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs">{m.riwayatAlergi}</td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs">{m.riwayatPenyakit}</td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-navy-950 block">{m.namaOrtu}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{m.kontakDarurat}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEditMedis(m)}
                          className="h-7 w-7 p-0 cursor-pointer text-slate-600 hover:text-navy-950"
                        >
                          <Edit size={14} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: OBAT */}
      {activeTab === "OBAT" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-border shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama obat, indikasi..."
                value={searchObat}
                onChange={(e) => setSearchObat(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-primary"
              />
            </div>

            <select
              aria-label="Filter Kategori Obat"
              value={filterKategoriObat}
              onChange={(e) => setFilterKategoriObat(e.target.value)}
              className="text-xs p-2 rounded-xl border border-slate-200 focus:outline-hidden bg-white w-full sm:w-auto"
            >
              <option value="SEMUA">Semua Kategori</option>
              <option value="ANALGESIK">Analgesik &amp; Antipiretik</option>
              <option value="ANTASIDA">Antasida &amp; Lambung</option>
              <option value="ANTIHISTAMIN">Antihistamin &amp; Alergi</option>
              <option value="ANTISEPTIK">Antiseptik &amp; Luka</option>
              <option value="PERBAN_KASA">Perban &amp; Kasa</option>
              <option value="MINYAK_HANGAT">Minyak Hangat</option>
            </select>
          </div>

          <Card className="border border-border bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-border text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Kode &amp; Nama Obat</th>
                    <th className="py-3.5 px-4">Kategori</th>
                    <th className="py-3.5 px-4">Sisa Stok</th>
                    <th className="py-3.5 px-4">Satuan</th>
                    <th className="py-3.5 px-4">Tanggal Kedaluwarsa</th>
                    <th className="py-3.5 px-4">Indikasi Medis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredObat.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-bold text-navy-950">
                        {o.namaObat}
                        <span className="block text-[10px] text-slate-400 font-mono">{o.kodeObat}</span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-[10px]">
                          {o.kategori.replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold">
                        <span className={o.stok <= 10 ? "text-rose-600 font-bold" : "text-navy-950"}>
                          {o.stok}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{o.satuan}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">{o.kadaluarsa}</td>
                      <td className="py-3 px-4 text-slate-600 max-w-sm">{o.indikasi}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* MODAL 1: CATAT KUNJUNGAN BARU */}
      {showModalKunjungan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <Card className="w-full max-w-lg bg-white border border-border shadow-2xl max-h-[92vh] overflow-y-auto">
            <CardHeader className="border-b border-border py-4">
              <CardTitle className="text-base font-bold text-navy-950 flex items-center gap-2">
                <HeartPulse size={18} className="text-primary" />
                Catat Kunjungan Siswa ke Ruang UKS
              </CardTitle>
              <CardDescription className="text-xs">
                Dokumentasikan keluhan dan pertolongan pertama secara realtime.
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSimpanKunjungan}>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Pilih Pasien Siswa *</label>
                  {daftarSiswa.length > 0 ? (
                    <select
                      required
                      value={formKunjungan.siswaId}
                      onChange={(e) => {
                        const sId = e.target.value;
                        const s = daftarSiswa.find((item) => String(item.id) === String(sId));
                        setFormKunjungan({
                          ...formKunjungan,
                          siswaId: sId,
                          namaSiswa: s ? s.nama : "",
                          kelas: s?.kelas?.nama_kelas || "Kelas Umum",
                        });
                      }}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-hidden bg-white"
                    >
                      <option value="">-- Pilih Siswa dari Database --</option>
                      {daftarSiswa.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nama} ({s.kelas?.nama_kelas || "Tanpa Kelas"})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      placeholder="Nama lengkap siswa..."
                      value={formKunjungan.namaSiswa}
                      onChange={(e) => setFormKunjungan({ ...formKunjungan, namaSiswa: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-hidden"
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Kategori Gejala</label>
                    <select
                      value={formKunjungan.kategoriKeluhan}
                      onChange={(e) =>
                        setFormKunjungan({ ...formKunjungan, kategoriKeluhan: e.target.value })
                      }
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-hidden bg-white"
                    >
                      <option value="DEMAM">Demam &amp; Meriang</option>
                      <option value="SAKIT_PERUT_MAAG">Sakit Perut / Maag</option>
                      <option value="LUKA_CEDERA">Luka &amp; Cedera Fisik</option>
                      <option value="PUSING_MIGRAIN">Pusing / Migrain</option>
                      <option value="PINGSAN_LEMAS">Pingsan / Lemas</option>
                      <option value="ALERGI_ASMA">Alergi &amp; Asma</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Jam Masuk</label>
                    <input
                      type="text"
                      value={formKunjungan.jam}
                      onChange={(e) => setFormKunjungan({ ...formKunjungan, jam: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-hidden font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Detail Keluhan Pasien *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Deskripsikan gejala yang dirasakan siswa..."
                    value={formKunjungan.keluhan}
                    onChange={(e) => setFormKunjungan({ ...formKunjungan, keluhan: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Tindakan Pertolongan Pertama (P3K)</label>
                  <input
                    type="text"
                    value={formKunjungan.tindakan}
                    onChange={(e) => setFormKunjungan({ ...formKunjungan, tindakan: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Obat yang Diberikan</label>
                    <input
                      type="text"
                      value={formKunjungan.obatDiberikan}
                      onChange={(e) => setFormKunjungan({ ...formKunjungan, obatDiberikan: e.target.value })}
                      placeholder="Contoh: Paracetamol 500mg"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-hidden"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Petugas Penjaga UKS</label>
                    <input
                      type="text"
                      value={formKunjungan.petugasUKS}
                      onChange={(e) => setFormKunjungan({ ...formKunjungan, petugasUKS: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Kondisi Akhir / Rencana Tindak Lanjut</label>
                  <select
                    value={formKunjungan.kondisiAkhir}
                    onChange={(e) =>
                      setFormKunjungan({ ...formKunjungan, kondisiAkhir: e.target.value })
                    }
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-hidden bg-white"
                  >
                    <option value="MEMBAIK_KEMBALI_KE_KELAS">Membaik &amp; Kembali ke Kelas Mengikuti KBM</option>
                    <option value="ISTIRAHAT_DI_UKS">Sedang Istirahat / Observasi di Bed UKS</option>
                    <option value="DIJEMPUT_ORANG_TUA">Dijemput Orang Tua / Izin Pulang Istirahat</option>
                    <option value="DIRUJUK_PUSKESMAS">Dirujuk ke Puskesmas Pembina Terdekat</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isSubmitting}
                    onClick={() => setShowModalKunjungan(false)}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSubmitting}
                    className="bg-navy-900 hover:bg-navy-800 text-white font-semibold gap-1.5"
                  >
                    {isSubmitting && <Loader2 size={13} className="animate-spin" />}
                    <span>{isSubmitting ? "Menyimpan..." : "Simpan Catatan Kunjungan"}</span>
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}

      {/* MODAL 2: EDIT SKRINING FISIK */}
      {showModalEditMedis && selectedMedis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <Card className="w-full max-w-lg bg-white border border-border shadow-2xl">
            <CardHeader className="border-b border-border py-4">
              <CardTitle className="text-base font-bold text-navy-950 flex items-center gap-2">
                <Stethoscope size={18} className="text-primary" />
                Ukur Ulang Skrining Fisik &amp; Rekam Medis
              </CardTitle>
              <CardDescription className="text-xs">
                {selectedMedis.namaSiswa} ({selectedMedis.kelas})
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleUpdateMedisSubmit}>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Tinggi Badan (cm) *</label>
                    <input
                      type="number"
                      required
                      value={selectedMedis.tinggiBadanCm}
                      onChange={(e) =>
                        setSelectedMedis({ ...selectedMedis, tinggiBadanCm: Number(e.target.value) })
                      }
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-hidden font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Berat Badan (kg) *</label>
                    <input
                      type="number"
                      required
                      value={selectedMedis.beratBadanKg}
                      onChange={(e) =>
                        setSelectedMedis({ ...selectedMedis, beratBadanKg: Number(e.target.value) })
                      }
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-hidden font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Golongan Darah</label>
                    <select
                      value={selectedMedis.golonganDarah}
                      onChange={(e) =>
                        setSelectedMedis({ ...selectedMedis, golonganDarah: e.target.value as any })
                      }
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-hidden bg-white"
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="AB">AB</option>
                      <option value="O">O</option>
                      <option value="-">- (Belum Tahu)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Riwayat Alergi Makanan / Obat</label>
                  <input
                    type="text"
                    value={selectedMedis.riwayatAlergi}
                    onChange={(e) =>
                      setSelectedMedis({ ...selectedMedis, riwayatAlergi: e.target.value })
                    }
                    placeholder="Contoh: Alergi udang, debu dingin, penisilin..."
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Riwayat Penyakit Kronis / Khusus</label>
                  <input
                    type="text"
                    value={selectedMedis.riwayatPenyakit}
                    onChange={(e) =>
                      setSelectedMedis({ ...selectedMedis, riwayatPenyakit: e.target.value })
                    }
                    placeholder="Contoh: Asma saat berolahraga, maag, riwayat patah tulang..."
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Nama Wali / Ortu</label>
                    <input
                      type="text"
                      value={selectedMedis.namaOrtu}
                      onChange={(e) =>
                        setSelectedMedis({ ...selectedMedis, namaOrtu: e.target.value })
                      }
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-hidden"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Nomor WhatsApp Darurat</label>
                    <input
                      type="text"
                      value={selectedMedis.kontakDarurat}
                      onChange={(e) =>
                        setSelectedMedis({ ...selectedMedis, kontakDarurat: e.target.value })
                      }
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-hidden font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowModalEditMedis(false)}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                  >
                    Simpan Perubahan
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
