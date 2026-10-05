"use client";

import { useState, useMemo } from "react";
import {
  HeartPulse,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  Users,
  Download,
  Phone,
  FileText,
  Activity,
  Pill,
  ShieldAlert,
  Printer,
  ChevronRight,
  TrendingUp,
  Stethoscope,
  Trash2,
  Edit,
  Smile,
  AlertTriangle,
} from "lucide-react";
import {
  useStore,
  KunjunganUKS,
  RekamMedisSiswa,
  ObatUKS,
} from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ModulUKSPage() {
  const {
    daftarKunjunganUKS,
    tambahKunjunganUKS,
    updateKunjunganUKS,
    hapusKunjunganUKS,
    daftarRekamMedisUKS,
    updateRekamMedisUKS,
    daftarObatUKS,
    updateStokObatUKS,
  } = useStore();

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

  // Form State Kunjungan Baru
  const [formKunjungan, setFormKunjungan] = useState<{
    namaSiswa: string;
    kelas: string;
    jam: string;
    kategoriKeluhan: KunjunganUKS["kategoriKeluhan"];
    keluhan: string;
    tindakan: string;
    obatDiberikan: string;
    kondisiAkhir: KunjunganUKS["kondisiAkhir"];
    petugasUKS: string;
    status: KunjunganUKS["status"];
  }>({
    namaSiswa: "",
    kelas: "Kelas X IPA 1",
    jam: "09:30",
    kategoriKeluhan: "DEMAM",
    keluhan: "",
    tindakan: "Istirahat di ruang UKS dan diberikan obat sesuai keluhan",
    obatDiberikan: "Paracetamol 500mg",
    kondisiAkhir: "MEMBAIK_KEMBALI_KE_KELAS",
    petugasUKS: "drg. Ratna Sari & Tim PMR",
    status: "SEDANG_DIRAWAT",
  });

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
  const handleSimpanKunjungan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formKunjungan.namaSiswa.trim() || !formKunjungan.keluhan.trim()) return;

    tambahKunjunganUKS({
      tanggal: new Date().toISOString().split("T")[0],
      jam: formKunjungan.jam,
      siswaId: `sis-${Date.now()}`,
      namaSiswa: formKunjungan.namaSiswa.trim(),
      kelas: formKunjungan.kelas,
      keluhan: formKunjungan.keluhan.trim(),
      kategoriKeluhan: formKunjungan.kategoriKeluhan,
      tindakan: formKunjungan.tindakan.trim(),
      obatDiberikan: formKunjungan.obatDiberikan.trim(),
      kondisiAkhir: formKunjungan.kondisiAkhir,
      petugasUKS: formKunjungan.petugasUKS.trim(),
      status: formKunjungan.status,
    });

    setShowModalKunjungan(false);
    setFormKunjungan({
      namaSiswa: "",
      kelas: "Kelas X IPA 1",
      jam: "09:30",
      kategoriKeluhan: "DEMAM",
      keluhan: "",
      tindakan: "Istirahat di ruang UKS dan diberikan obat sesuai keluhan",
      obatDiberikan: "Paracetamol 500mg",
      kondisiAkhir: "MEMBAIK_KEMBALI_KE_KELAS",
      petugasUKS: "drg. Ratna Sari & Tim PMR",
      status: "SEDANG_DIRAWAT",
    });
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

    updateRekamMedisUKS(selectedMedis.id, {
      ...selectedMedis,
      bmi: calcBmi,
      statusGizi: gizi,
      terakhirPeriksa: new Date().toISOString().split("T")[0],
    });

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
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
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
            Monitoring kesehatan siswa, riwayat alergi/penyakit, kunjungan ruang UKS, dan logistik obat P3K.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2">
            <Download size={15} />
            Ekspor Laporan CSV
          </Button>
          <Button
            size="sm"
            className="bg-navy-900 hover:bg-navy-800 text-white gap-2 font-semibold shadow-xs"
            onClick={() => setShowModalKunjungan(true)}
          >
            <Plus size={16} />
            Catat Kunjungan UKS
          </Button>
        </div>
      </div>

      {/* 5 Real-time KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
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
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-border space-x-2">
        <button
          onClick={() => setActiveTab("KUNJUNGAN")}
          className={`pb-3 px-4 text-xs md:text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
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
          className={`pb-3 px-4 text-xs md:text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
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
          className={`pb-3 px-4 text-xs md:text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === "OBAT"
              ? "border-primary text-navy-950 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Pill size={16} />
          Stok Obat &amp; Kotak P3K ({daftarObatUKS.length})
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: BUKU KUNJUNGAN & TINDAKAN PASIEN UKS              */}
      {/* ========================================================= */}
      {activeTab === "KUNJUNGAN" && (
        <div className="space-y-4">
          {/* Baris Pencarian & Filter */}
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

          {/* Tabel Kunjungan */}
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
                    <th className="py-3.5 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredKunjungan.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-400">
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
                            <Badge className="bg-emerald-600 text-white text-[10px] font-semibold">
                              {item.kondisiAkhir === "MEMBAIK_KEMBALI_KE_KELAS"
                                ? "Kembali ke Kelas"
                                : item.kondisiAkhir === "DIJEMPUT_ORANG_TUA"
                                ? "Dijemput Ortu"
                                : "Rujukan Medis"}
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                          {item.petugasUKS}
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            {item.status === "SEDANG_DIRAWAT" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-[10px] px-2 text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                                onClick={() =>
                                  updateKunjunganUKS(item.id, {
                                    status: "SELESAI",
                                    kondisiAkhir: "MEMBAIK_KEMBALI_KE_KELAS",
                                  })
                                }
                              >
                                Selesai / Pulang ke Kelas
                              </Button>
                            )}

                            {item.kondisiAkhir === "DIJEMPUT_ORANG_TUA" && (
                              <a
                                href={`https://wa.me/?text=${encodeURIComponent(
                                  `Halo Bapak/Ibu Wali Siswa ${item.namaSiswa} (${item.kelas}). Disampaikan dari Petugas UKS Sekolah bahwa ananda sedang beristirahat di ruang UKS dengan keluhan: "${item.keluhan}". Mohon dapat dijemput untuk istirahat di rumah.`
                                )}`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 w-7 p-0 text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                                  title="Kirim Notifikasi WhatsApp ke Wali"
                                >
                                  <Phone size={13} />
                                </Button>
                              </a>
                            )}

                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600"
                              onClick={() => hapusKunjunganUKS(item.id)}
                              title="Hapus Rekaman Kunjungan"
                            >
                              <Trash2 size={13} />
                            </Button>
                          </div>
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

      {/* ========================================================= */}
      {/* TAB 2: REKAM MEDIS & SKRINING FISIK SISWA (BMI/TB/BB)     */}
      {/* ========================================================= */}
      {activeTab === "REKAM_MEDIS" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-border shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari siswa, kelas, alergi, penyakit..."
                value={searchMedis}
                onChange={(e) => setSearchMedis(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-primary"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={filterKelasMedis}
                onChange={(e) => setFilterKelasMedis(e.target.value)}
                className="text-xs p-2 rounded-xl border border-slate-200 focus:outline-hidden bg-white w-full sm:w-auto"
              >
                <option value="SEMUA">Semua Rombel</option>
                <option value="Kelas X IPA 1">Kelas X IPA 1</option>
                <option value="Kelas X IPA 2">Kelas X IPA 2</option>
                <option value="Kelas XI IPS 1">Kelas XI IPS 1</option>
              </select>

              <select
                value={filterStatusGizi}
                onChange={(e) => setFilterStatusGizi(e.target.value)}
                className="text-xs p-2 rounded-xl border border-slate-200 focus:outline-hidden bg-white w-full sm:w-auto"
              >
                <option value="SEMUA">Semua Status Gizi</option>
                <option value="GIZI_BAIK">Gizi Baik (Normal)</option>
                <option value="KURANG">Berat Kurang (Underweight)</option>
                <option value="BERLEBIH">Kelebihan BB (Overweight)</option>
                <option value="OBESITAS">Obesitas</option>
              </select>
            </div>
          </div>

          <Card className="border border-border bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-border text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Nama Siswa &amp; Kelas</th>
                    <th className="py-3.5 px-4 text-center">Gol. Darah</th>
                    <th className="py-3.5 px-4">Fisik (TB / BB)</th>
                    <th className="py-3.5 px-4">Indeks BMI &amp; Status Gizi</th>
                    <th className="py-3.5 px-4">Riwayat Alergi</th>
                    <th className="py-3.5 px-4">Riwayat Kronis / Khusus</th>
                    <th className="py-3.5 px-4">Kontak Wali Darurat</th>
                    <th className="py-3.5 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredMedis.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-slate-400">
                        Tidak ada rekam medis siswa yang sesuai filter.
                      </td>
                    </tr>
                  ) : (
                    filteredMedis.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-bold text-navy-950 block">{item.namaSiswa}</span>
                          <span className="text-[10px] text-slate-500">{item.kelas}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="font-mono font-bold text-xs bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-md">
                            {item.golonganDarah}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="font-semibold text-navy-950 block">
                            {item.tinggiBadanCm} cm / {item.beratBadanKg} kg
                          </span>
                          <span className="text-[10px] text-slate-400">Cek: {item.terakhirPeriksa}</span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="font-mono font-bold text-navy-950 mr-1.5">{item.bmi}</span>
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-semibold ${
                              item.statusGizi === "GIZI_BAIK"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : item.statusGizi === "KURANG"
                                ? "bg-amber-50 text-amber-800 border-amber-200"
                                : "bg-rose-50 text-rose-800 border-rose-200"
                            }`}
                          >
                            {item.statusGizi.replace(/_/g, " ")}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <p className="text-slate-600 line-clamp-1">{item.riwayatAlergi}</p>
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <p className="text-slate-600 line-clamp-1">{item.riwayatPenyakit}</p>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="font-medium text-navy-950 block">{item.namaOrtu}</span>
                          <a
                            href={`https://wa.me/${item.kontakDarurat.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-emerald-700 hover:underline flex items-center gap-1 font-mono"
                          >
                            <Phone size={10} /> {item.kontakDarurat}
                          </a>
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-[11px] gap-1 px-2"
                            onClick={() => handleOpenEditMedis(item)}
                          >
                            <Edit size={12} />
                            Ukur Ulang
                          </Button>
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

      {/* ========================================================= */}
      {/* TAB 3: STOK OBAT & PERLENGKAPAN KOTAK P3K                 */}
      {/* ========================================================= */}
      {activeTab === "OBAT" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-border shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari obat, kode, kegunaan indikasi..."
                value={searchObat}
                onChange={(e) => setSearchObat(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-primary"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={filterKategoriObat}
                onChange={(e) => setFilterKategoriObat(e.target.value)}
                className="text-xs p-2 rounded-xl border border-slate-200 focus:outline-hidden bg-white w-full sm:w-auto"
              >
                <option value="SEMUA">Semua Kategori</option>
                <option value="ANALGESIK">Analgesik (Pereda Nyeri)</option>
                <option value="ANTASIDA">Antasida (Lambung &amp; Maag)</option>
                <option value="P3K_LUKA">P3K Luka Terbuka</option>
                <option value="MINYAK_OLES">Minyak Oles Hangat</option>
                <option value="ALAT_MEDIS">Alat Medis Digital</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredObat.map((obat) => {
              const isMenipis = obat.stok <= 10;

              return (
                <Card
                  key={obat.id}
                  className={`border transition-all flex flex-col justify-between ${
                    isMenipis ? "border-rose-300 bg-rose-50/20 shadow-xs" : "border-slate-200 bg-white"
                  }`}
                >
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[10px] text-slate-400 font-bold">
                        {obat.kodeObat}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-semibold ${
                          isMenipis
                            ? "bg-rose-50 text-rose-800 border-rose-200"
                            : "bg-emerald-50 text-emerald-800 border-emerald-200"
                        }`}
                      >
                        {isMenipis ? "Stok Menipis" : "Tersedia Aman"}
                      </Badge>
                    </div>

                    <CardTitle className="text-sm font-bold text-navy-950">
                      {obat.namaObat}
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {obat.indikasi}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="p-4 pt-1 space-y-3">
                    <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Sisa Stok Fisik:</span>
                        <span className="font-mono text-xl font-bold text-navy-950">
                          {obat.stok} <span className="text-xs font-normal text-slate-500">{obat.satuan}</span>
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Masa Berlaku:</span>
                        <span className="font-mono text-xs font-semibold text-slate-700">
                          s/d {obat.kadaluarsa}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs text-rose-700 hover:bg-rose-50 border-rose-200"
                        disabled={obat.stok <= 0}
                        onClick={() => updateStokObatUKS(obat.id, -1)}
                      >
                        -1 Pakai Pasien
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs text-emerald-700 hover:bg-emerald-50 border-emerald-200 font-semibold"
                        onClick={() => updateStokObatUKS(obat.id, 10)}
                      >
                        +10 Restock
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: CATAT KUNJUNGAN PASIEN UKS                      */}
      {/* ========================================================= */}
      {showModalKunjungan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <Card className="w-full max-w-lg bg-white border border-border shadow-2xl">
            <CardHeader className="border-b border-border py-4">
              <CardTitle className="text-base font-bold text-navy-950 flex items-center gap-2">
                <HeartPulse size={18} className="text-primary" />
                Catat Kunjungan Pasien Ruang UKS
              </CardTitle>
              <CardDescription className="text-xs">
                Pendataan keluhan siswa, tindakan pertolongan pertama, dan pemberian obat.
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSimpanKunjungan}>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Nama Siswa *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Muhammad Rayhan"
                      value={formKunjungan.namaSiswa}
                      onChange={(e) => setFormKunjungan({ ...formKunjungan, namaSiswa: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Rombel / Kelas *</label>
                    <select
                      value={formKunjungan.kelas}
                      onChange={(e) => setFormKunjungan({ ...formKunjungan, kelas: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-hidden bg-white"
                    >
                      <option value="Kelas X IPA 1">Kelas X IPA 1</option>
                      <option value="Kelas X IPA 2">Kelas X IPA 2</option>
                      <option value="Kelas XI IPS 1">Kelas XI IPS 1</option>
                      <option value="Kelas XII MIPA 1">Kelas XII MIPA 1</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Waktu Jam Masuk</label>
                    <input
                      type="text"
                      value={formKunjungan.jam}
                      onChange={(e) => setFormKunjungan({ ...formKunjungan, jam: e.target.value })}
                      placeholder="09:15"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-hidden font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Kategori Gejala</label>
                    <select
                      value={formKunjungan.kategoriKeluhan}
                      onChange={(e) =>
                        setFormKunjungan({ ...formKunjungan, kategoriKeluhan: e.target.value as any })
                      }
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-hidden bg-white"
                    >
                      <option value="DEMAM">Demam &amp; Meriang</option>
                      <option value="SAKIT_PERUT_MAAG">Sakit Perut / Maag</option>
                      <option value="LUKA_CEDERA">Luka / Cedera Fisik</option>
                      <option value="PUSING_MIGRAIN">Pusing / Migrain</option>
                      <option value="PINGSAN_LEMAS">Pingsan / Lemas</option>
                      <option value="ALERGI_ASMA">Alergi &amp; Asma</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Detail Keluhan Pasien *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Contoh: Mengeluh pusing berputar, pandangan kabur dan lemas saat upacara..."
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
                      setFormKunjungan({ ...formKunjungan, kondisiAkhir: e.target.value as any })
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
                    onClick={() => setShowModalKunjungan(false)}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-navy-900 hover:bg-navy-800 text-white font-semibold"
                  >
                    Simpan Catatan Kunjungan
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: EDIT SKRINING FISIK & REKAM MEDIS SISWA          */}
      {/* ========================================================= */}
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
