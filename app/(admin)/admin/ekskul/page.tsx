"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Trophy,
  Users,
  Search,
  Plus,
  ArrowLeft,
  Download,
  CheckCircle2,
  Clock,
  Calendar,
  Building,
  User,
  Trash2,
  Edit,
  Award,
  Sparkles,
  Phone,
  FileText,
  Printer,
  Compass,
  Check,
  ChevronRight,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  useStore,
  type Ekstrakurikuler,
  type AnggotaEkskul,
} from "@/lib/store";
import { cn } from "@/lib/utils";

const KATEGORI_CONFIG: Record<
  Ekstrakurikuler["kategori"],
  { label: string; badgeClass: string }
> = {
  WAJIB: {
    label: "Wajib Nasional",
    badgeClass: "bg-blue-100 text-blue-900 border-blue-200",
  },
  OLAHRAGA: {
    label: "Olahraga & Prestasi",
    badgeClass: "bg-orange-100 text-orange-900 border-orange-200",
  },
  KEPEMIMPINAN: {
    label: "Kepemimpinan & Bela Negara",
    badgeClass: "bg-emerald-100 text-emerald-900 border-emerald-200",
  },
  SAINS_IPTEK: {
    label: "Sains & Teknologi",
    badgeClass: "bg-purple-100 text-purple-900 border-purple-200",
  },
  SENI_BUDAYA: {
    label: "Seni & Budaya",
    badgeClass: "bg-pink-100 text-pink-900 border-pink-200",
  },
  KEAGAMAAN: {
    label: "Kerohanian & Agama",
    badgeClass: "bg-teal-100 text-teal-900 border-teal-200",
  },
};

const PREDIKAT_CONFIG: Record<
  AnggotaEkskul["predikatNilai"],
  { label: string; badgeClass: string }
> = {
  SANGAT_BAIK: {
    label: "Sangat Baik (A)",
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  BAIK: {
    label: "Baik (B)",
    badgeClass: "bg-blue-100 text-blue-800 border-blue-200",
  },
  CUKUP: {
    label: "Cukup (C)",
    badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
  },
  KURANG: {
    label: "Kurang (D)",
    badgeClass: "bg-rose-100 text-rose-800 border-rose-200",
  },
};

export default function AdminEkskulPage() {
  const {
    daftarEkskul,
    tambahEkskul,
    updateEkskul,
    hapusEkskul,
    daftarAnggotaEkskul,
    tambahAnggotaEkskul,
    hapusAnggotaEkskul,
    updateNilaiEkskul,
    daftarSiswaInduk,
  } = useStore();

  const [activeTab, setActiveTab] = useState<"katalog" | "anggota" | "jadwal">("katalog");
  const [searchQuery, setSearchQuery] = useState("");
  const [kategoriFilter, setKategoriFilter] = useState<string>("SEMUA");
  const [ekskulFilter, setEkskulFilter] = useState<string>("SEMUA");
  const [predikatFilter, setPredikatFilter] = useState<string>("SEMUA");

  // Modals
  const [isTambahEkskulOpen, setTambahEkskulOpen] = useState(false);
  const [isTambahAnggotaOpen, setTambahAnggotaOpen] = useState(false);
  const [isNilaiOpen, setNilaiOpen] = useState(false);
  const [isEditEkskulOpen, setEditEkskulOpen] = useState(false);
  const [isCetakOpen, setCetakOpen] = useState(false);

  // Selected items
  const [selectedEkskul, setSelectedEkskul] = useState<Ekstrakurikuler | null>(null);
  const [selectedAnggota, setSelectedAnggota] = useState<AnggotaEkskul | null>(null);

  // Form Tambah Ekskul
  const [formEkskul, setFormEkskul] = useState({
    nama: "",
    kategori: "OLAHRAGA" as Ekstrakurikuler["kategori"],
    pembina: "",
    kontakPembina: "",
    hariLatihan: "Jumat",
    jamMulai: "15:30",
    jamSelesai: "17:00",
    lokasiLatihan: "Lapangan Utama",
    kuotaMaksimal: 30,
    deskripsi: "",
    prestasiTerbaru: "",
  });

  // Form Tambah Anggota
  const [formAnggota, setFormAnggota] = useState({
    ekskulId: "",
    siswaId: "",
    jabatan: "ANGGOTA" as AnggotaEkskul["jabatan"],
  });

  // Form Nilai Anggota
  const [formNilai, setFormNilai] = useState({
    predikatNilai: "BAIK" as AnggotaEkskul["predikatNilai"],
    kehadiranPersen: 90,
    catatanPembina: "",
  });

  // KPIs
  const totalEkskul = daftarEkskul.length;
  const totalAnggota = daftarAnggotaEkskul.length;
  const avgKehadiran = useMemo(() => {
    if (daftarAnggotaEkskul.length === 0) return 0;
    const sum = daftarAnggotaEkskul.reduce((acc, a) => acc + a.kehadiranPersen, 0);
    return Math.round(sum / daftarAnggotaEkskul.length);
  }, [daftarAnggotaEkskul]);
  const totalPrestasi = useMemo(
    () => daftarEkskul.filter((e) => Boolean(e.prestasiTerbaru)).length,
    [daftarEkskul]
  );

  // Filtered Ekskul
  const ekskulFiltered = useMemo(() => {
    return daftarEkskul.filter((e) => {
      const matchSearch =
        searchQuery === "" ||
        e.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.pembina.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.lokasiLatihan.toLowerCase().includes(searchQuery.toLowerCase());

      const matchKategori =
        kategoriFilter === "SEMUA" || e.kategori === kategoriFilter;

      return matchSearch && matchKategori;
    });
  }, [daftarEkskul, searchQuery, kategoriFilter]);

  // Filtered Anggota
  const anggotaFiltered = useMemo(() => {
    return daftarAnggotaEkskul.filter((a) => {
      const matchSearch =
        searchQuery === "" ||
        a.namaSiswa.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.nisn.includes(searchQuery) ||
        a.namaEkskul.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.kelas.toLowerCase().includes(searchQuery.toLowerCase());

      const matchEkskul =
        ekskulFilter === "SEMUA" || a.ekskulId === ekskulFilter;

      const matchPredikat =
        predikatFilter === "SEMUA" || a.predikatNilai === predikatFilter;

      return matchSearch && matchEkskul && matchPredikat;
    });
  }, [daftarAnggotaEkskul, searchQuery, ekskulFilter, predikatFilter]);

  // Submit Tambah Ekskul
  const handleSimpanEkskul = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEkskul.nama.trim() || !formEkskul.pembina.trim()) return;

    tambahEkskul({
      ...formEkskul,
      kuotaMaksimal: Number(formEkskul.kuotaMaksimal) || 30,
    });

    setFormEkskul({
      nama: "",
      kategori: "OLAHRAGA",
      pembina: "",
      kontakPembina: "",
      hariLatihan: "Jumat",
      jamMulai: "15:30",
      jamSelesai: "17:00",
      lokasiLatihan: "Lapangan Utama",
      kuotaMaksimal: 30,
      deskripsi: "",
      prestasiTerbaru: "",
    });
    setTambahEkskulOpen(false);
  };

  // Submit Tambah Anggota
  const handleSimpanAnggota = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAnggota.ekskulId || !formAnggota.siswaId) return;

    const targetEkskul = daftarEkskul.find((e) => e.id === formAnggota.ekskulId);
    const targetSiswa = daftarSiswaInduk.find((s) => s.id === formAnggota.siswaId);
    if (!targetEkskul || !targetSiswa) return;

    // Cek apakah sudah terdaftar
    const sudahAda = daftarAnggotaEkskul.some(
      (a) => a.ekskulId === targetEkskul.id && a.siswaId === targetSiswa.id
    );
    if (sudahAda) {
      alert("Siswa sudah terdaftar di kegiatan ekskul ini!");
      return;
    }

    tambahAnggotaEkskul({
      ekskulId: targetEkskul.id,
      namaEkskul: targetEkskul.nama,
      siswaId: targetSiswa.id,
      namaSiswa: targetSiswa.nama,
      nisn: targetSiswa.nisn,
      kelas: targetSiswa.kelas,
      jabatan: formAnggota.jabatan,
      predikatNilai: "BAIK",
      kehadiranPersen: 85,
      catatanPembina: "Aktif mengikuti sesi latihan mingguan.",
    });

    setTambahAnggotaOpen(false);
  };

  // Submit Nilai Anggota
  const handleSimpanNilai = () => {
    if (!selectedAnggota) return;
    updateNilaiEkskul(
      selectedAnggota.id,
      formNilai.predikatNilai,
      Number(formNilai.kehadiranPersen) || 80,
      formNilai.catatanPembina
    );
    setNilaiOpen(false);
    setSelectedAnggota(null);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      "Nama Siswa",
      "NISN",
      "Kelas",
      "Nama Ekskul",
      "Jabatan",
      "Kehadiran (%)",
      "Predikat Nilai",
      "Catatan Pembina Rapor",
    ];

    const rows = daftarAnggotaEkskul.map((a) => [
      `"${a.namaSiswa}"`,
      `"${a.nisn}"`,
      `"${a.kelas}"`,
      `"${a.namaEkskul}"`,
      `"${a.jabatan}"`,
      a.kehadiranPersen,
      `"${PREDIKAT_CONFIG[a.predikatNilai]?.label || a.predikatNilai}"`,
      `"${a.catatanPembina || ""}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Rekap_Nilai_Ekskul_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Kembali ke Dashboard
            </Link>
            <span className="text-muted-foreground">•</span>
            <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-800 border-emerald-200">
              Pengembangan Diri & Prestasi
            </Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Trophy className="h-6 w-6 text-emerald-600" />
            Ekstrakurikuler & Pengembangan Bakat Siswa
          </h1>
          <p className="text-sm text-muted-foreground">
            Direktori kegiatan ekskul, rotasi jadwal latihan mingguan, absensi keanggotaan, serta sinkronisasi nilai rapor Kurikulum Merdeka.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="gap-1.5 text-xs shadow-xs"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (daftarEkskul.length > 0 && daftarSiswaInduk.length > 0) {
                setFormAnggota({
                  ekskulId: daftarEkskul[0].id,
                  siswaId: daftarSiswaInduk[0].id,
                  jabatan: "ANGGOTA",
                });
              }
              setTambahAnggotaOpen(true);
            }}
            className="gap-1.5 text-xs bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border-emerald-200"
          >
            <Users className="h-3.5 w-3.5" />
            Daftarkan Anggota
          </Button>

          <Button
            size="sm"
            onClick={() => setTambahEkskulOpen(true)}
            className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
          >
            <Plus className="h-4 w-4" />
            Tambah Ekskul Baru
          </Button>
        </div>
      </div>

      {/* KPI METRICS */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card className="border border-border/60 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Kegiatan Ekskul Aktif</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold tracking-tight text-foreground">{totalEkskul}</span>
                <span className="text-xs text-muted-foreground">cabang kegiatan</span>
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-sky-50 text-sky-700">
              <Compass className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Anggota Siswa</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold tracking-tight text-emerald-700">{totalAnggota}</span>
                <span className="text-xs text-muted-foreground">peserta terdaftar</span>
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Rata-rata Kehadiran</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold tracking-tight text-blue-700">{avgKehadiran}%</span>
                <span className="text-xs text-muted-foreground">disiplin latihan</span>
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-700">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Prestasi & Kejuaraan</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold tracking-tight text-amber-700">{totalPrestasi}</span>
                <span className="text-xs text-muted-foreground">penghargaan terekam</span>
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-50 text-amber-700">
              <Award className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab("katalog")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
            activeTab === "katalog"
              ? "border-emerald-600 text-emerald-700 font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Trophy className="h-4 w-4" />
          Katalog & Kegiatan ({daftarEkskul.length})
        </button>

        <button
          onClick={() => setActiveTab("anggota")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
            activeTab === "anggota"
              ? "border-emerald-600 text-emerald-700 font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Award className="h-4 w-4" />
          Anggota & Nilai E-Rapor ({daftarAnggotaEkskul.length})
        </button>

        <button
          onClick={() => setActiveTab("jadwal")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
            activeTab === "jadwal"
              ? "border-emerald-600 text-emerald-700 font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Calendar className="h-4 w-4" />
          Jadwal Latihan Mingguan
        </button>
      </div>

      {/* TAB 1: KATALOG EKSKUL */}
      {activeTab === "katalog" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-card p-3 rounded-lg border border-border">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari ekskul, pembina, tempat latihan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-sm h-9"
              />
            </div>

            <select
              aria-label="Filter Kategori Ekskul"
              value={kategoriFilter}
              onChange={(e) => setKategoriFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs focus:ring-1 focus:ring-ring"
            >
              <option value="SEMUA">Semua Kategori</option>
              <option value="WAJIB">Wajib Nasional</option>
              <option value="OLAHRAGA">Olahraga & Prestasi</option>
              <option value="KEPEMIMPINAN">Kepemimpinan & Bela Negara</option>
              <option value="SAINS_IPTEK">Sains & Teknologi</option>
              <option value="SENI_BUDAYA">Seni & Budaya</option>
              <option value="KEAGAMAAN">Kerohanian & Agama</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ekskulFiltered.map((ekskul) => {
              const anggotaCount = daftarAnggotaEkskul.filter((a) => a.ekskulId === ekskul.id).length;
              const KategoriConf = KATEGORI_CONFIG[ekskul.kategori];
              const persentaseKuota = Math.round((anggotaCount / (ekskul.kuotaMaksimal || 1)) * 100);

              return (
                <Card key={ekskul.id} className="border border-border/70 shadow-xs hover:border-emerald-300 transition-colors flex flex-col justify-between">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Badge
                          variant="outline"
                          className={cn("text-[10px] mb-1.5 font-medium", KategoriConf?.badgeClass)}
                        >
                          {KategoriConf?.label || ekskul.kategori}
                        </Badge>
                        <CardTitle className="text-base font-bold text-foreground">
                          {ekskul.nama}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedEkskul(ekskul);
                            setEditEkskulOpen(true);
                          }}
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                          title="Edit Ekskul"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm(`Yakin ingin menghapus ${ekskul.nama}?`)) {
                              hapusEkskul(ekskul.id);
                            }
                          }}
                          className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                          title="Hapus Ekskul"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-2 text-xs">
                      {ekskul.deskripsi && (
                        <p className="text-muted-foreground line-clamp-2">
                          {ekskul.deskripsi}
                        </p>
                      )}

                      <div className="p-2.5 bg-muted/40 rounded-lg space-y-1.5">
                        <div className="flex items-center justify-between text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-emerald-600" />
                            Pembina:
                          </span>
                          <span className="font-semibold text-foreground">{ekskul.pembina}</span>
                        </div>
                        <div className="flex items-center justify-between text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                            Jadwal:
                          </span>
                          <span className="font-medium text-foreground">
                            {ekskul.hariLatihan}, {ekskul.jamMulai} - {ekskul.jamSelesai}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Building className="h-3.5 w-3.5 text-emerald-600" />
                            Lokasi:
                          </span>
                          <span className="font-medium text-foreground truncate max-w-[150px]">
                            {ekskul.lokasiLatihan}
                          </span>
                        </div>
                      </div>

                      {ekskul.prestasiTerbaru && (
                        <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 flex items-start gap-1.5">
                          <Award className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                          <span className="text-[11px] font-medium leading-tight">
                            {ekskul.prestasiTerbaru}
                          </span>
                        </div>
                      )}

                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-muted-foreground">Kapasitas Anggota</span>
                          <span className="font-medium">
                            {anggotaCount} / {ekskul.kuotaMaksimal} siswa ({persentaseKuota}%)
                          </span>
                        </div>
                        <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              persentaseKuota > 90
                                ? "bg-rose-500"
                                : persentaseKuota > 60
                                ? "bg-emerald-500"
                                : "bg-sky-500"
                            )}
                            style={{ width: `${Math.min(100, persentaseKuota)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEkskulFilter(ekskul.id);
                          setActiveTab("anggota");
                        }}
                        className="text-xs h-7 px-2.5 text-emerald-700 hover:text-emerald-800"
                      >
                        Lihat Anggota ({anggotaCount})
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => {
                          setFormAnggota({
                            ekskulId: ekskul.id,
                            siswaId: daftarSiswaInduk[0]?.id || "",
                            jabatan: "ANGGOTA",
                          });
                          setTambahAnggotaOpen(true);
                        }}
                        className="text-xs h-7 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        Tambah Siswa
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: ANGGOTA & NILAI E-RAPOR */}
      {activeTab === "anggota" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-card p-3 rounded-lg border border-border">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari siswa, NISN, kelas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-sm h-9"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                aria-label="Filter Ekskul"
                value={ekskulFilter}
                onChange={(e) => setEkskulFilter(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs focus:ring-1 focus:ring-ring"
              >
                <option value="SEMUA">Semua Ekskul</option>
                {daftarEkskul.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nama}
                  </option>
                ))}
              </select>

              <select
                aria-label="Filter Predikat Nilai"
                value={predikatFilter}
                onChange={(e) => setPredikatFilter(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs focus:ring-1 focus:ring-ring"
              >
                <option value="SEMUA">Semua Predikat</option>
                <option value="SANGAT_BAIK">Sangat Baik (A)</option>
                <option value="BAIK">Baik (B)</option>
                <option value="CUKUP">Cukup (C)</option>
                <option value="KURANG">Kurang (D)</option>
              </select>

              <Button
                size="sm"
                onClick={() => {
                  if (daftarEkskul.length > 0 && daftarSiswaInduk.length > 0) {
                    setFormAnggota({
                      ekskulId: daftarEkskul[0].id,
                      siswaId: daftarSiswaInduk[0].id,
                      jabatan: "ANGGOTA",
                    });
                  }
                  setTambahAnggotaOpen(true);
                }}
                className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Plus className="h-4 w-4" />
                Daftarkan Siswa
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-xs font-semibold uppercase text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-4 py-3">Siswa & Kelas</th>
                    <th className="px-4 py-3">Kegiatan Ekskul</th>
                    <th className="px-4 py-3">Jabatan</th>
                    <th className="px-4 py-3">Presensi Latihan</th>
                    <th className="px-4 py-3">Predikat E-Rapor</th>
                    <th className="px-4 py-3">Catatan Pembina</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {anggotaFiltered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground text-sm">
                        Tidak ada data anggota siswa yang cocok dengan filter.
                      </td>
                    </tr>
                  ) : (
                    anggotaFiltered.map((a) => {
                      const PredikatConf = PREDIKAT_CONFIG[a.predikatNilai];

                      return (
                        <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="font-semibold text-foreground">{a.namaSiswa}</div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <span className="font-mono">{a.nisn}</span>
                              <span>•</span>
                              <Badge variant="outline" className="text-[10px] py-0 px-1">
                                {a.kelas}
                              </Badge>
                            </div>
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="font-medium text-foreground">{a.namaEkskul}</span>
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[10px]",
                                a.jabatan === "KETUA"
                                  ? "bg-amber-50 text-amber-900 border-amber-300 font-bold"
                                  : a.jabatan === "WAKIL" || a.jabatan === "SEKRETARIS" || a.jabatan === "BENDAHARA"
                                  ? "bg-sky-50 text-sky-900 border-sky-300"
                                  : "bg-muted text-muted-foreground"
                              )}
                            >
                              {a.jabatan}
                            </Badge>
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold">{a.kehadiranPersen}%</span>
                              <div className="w-16 bg-muted h-1.5 rounded-full overflow-hidden">
                                <div
                                  className={cn(
                                    "h-full rounded-full",
                                    a.kehadiranPersen >= 90
                                      ? "bg-emerald-500"
                                      : a.kehadiranPersen >= 75
                                      ? "bg-blue-500"
                                      : "bg-amber-500"
                                  )}
                                  style={{ width: `${a.kehadiranPersen}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap">
                            <Badge
                              variant="outline"
                              className={cn("text-xs font-semibold", PredikatConf?.badgeClass)}
                            >
                              {PredikatConf?.label || a.predikatNilai}
                            </Badge>
                          </td>

                          <td className="px-4 py-3">
                            <div className="text-xs text-muted-foreground line-clamp-1 italic max-w-xs">
                              {a.catatanPembina || "Belum ada catatan evaluasi"}
                            </div>
                          </td>

                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedAnggota(a);
                                  setFormNilai({
                                    predikatNilai: a.predikatNilai,
                                    kehadiranPersen: a.kehadiranPersen,
                                    catatanPembina: a.catatanPembina || "",
                                  });
                                  setNilaiOpen(true);
                                }}
                                className="h-7 text-xs px-2 gap-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border-emerald-200"
                                title="Input Nilai Rapor"
                              >
                                <Award className="h-3 w-3" />
                                Nilai
                              </Button>

                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  if (confirm(`Keluarkan ${a.namaSiswa} dari ${a.namaEkskul}?`)) {
                                    hapusAnggotaEkskul(a.id);
                                  }
                                }}
                                className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                                title="Keluarkan Anggota"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: JADWAL LATIHAN MINGGUAN */}
      {activeTab === "jadwal" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"].map((hari) => {
              const sesiHariIni = daftarEkskul.filter((e) => e.hariLatihan.toLowerCase() === hari.toLowerCase());

              return (
                <Card key={hari} className="border border-border/70 shadow-xs">
                  <CardHeader className="p-3.5 pb-2 bg-muted/30 border-b border-border">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-emerald-600" />
                        Hari {hari}
                      </CardTitle>
                      <Badge variant="outline" className="text-[10px]">
                        {sesiHariIni.length} Sesi
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3.5 space-y-2.5">
                    {sesiHariIni.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic py-3 text-center">
                        Tidak ada agenda latihan terjadwal.
                      </p>
                    ) : (
                      sesiHariIni.map((e) => (
                        <div
                          key={e.id}
                          className="p-2.5 rounded-lg border border-border/80 bg-card hover:border-emerald-300 transition-colors space-y-1 text-xs"
                        >
                          <div className="flex items-center justify-between font-semibold text-foreground">
                            <span>{e.nama}</span>
                            <span className="text-emerald-700 font-mono text-[11px]">
                              {e.jamMulai} - {e.jamSelesai}
                            </span>
                          </div>
                          <div className="text-muted-foreground flex items-center gap-1 text-[11px]">
                            <Building className="h-3 w-3 text-muted-foreground" />
                            {e.lokasiLatihan}
                          </div>
                          <div className="text-muted-foreground flex items-center gap-1 text-[11px]">
                            <User className="h-3 w-3 text-muted-foreground" />
                            Pembina: {e.pembina}
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL TAMBAH EKSKUL */}
      <Dialog open={isTambahEkskulOpen} onOpenChange={setTambahEkskulOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Trophy className="h-5 w-5 text-emerald-600" />
              Pendaftaran Kegiatan Ekstrakurikuler Baru
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSimpanEkskul} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground">Nama Ekstrakurikuler *</label>
                <Input
                  required
                  placeholder="Contoh: Robotika & IoT Club"
                  value={formEkskul.nama}
                  onChange={(e) => setFormEkskul({ ...formEkskul, nama: e.target.value })}
                  className="mt-1 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Kategori Kegiatan</label>
                <select
                  value={formEkskul.kategori}
                  onChange={(e) =>
                    setFormEkskul({
                      ...formEkskul,
                      kategori: e.target.value as Ekstrakurikuler["kategori"],
                    })
                  }
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="WAJIB">Wajib Nasional</option>
                  <option value="OLAHRAGA">Olahraga & Prestasi</option>
                  <option value="KEPEMIMPINAN">Kepemimpinan & Bela Negara</option>
                  <option value="SAINS_IPTEK">Sains & Teknologi</option>
                  <option value="SENI_BUDAYA">Seni & Budaya</option>
                  <option value="KEAGAMAAN">Kerohanian & Agama</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground">Guru Pembina / Pelatih *</label>
                <Input
                  required
                  placeholder="Nama pembina..."
                  value={formEkskul.pembina}
                  onChange={(e) => setFormEkskul({ ...formEkskul, pembina: e.target.value })}
                  className="mt-1 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Nomor Kontak WhatsApp</label>
                <Input
                  placeholder="0812-xxxx-xxxx"
                  value={formEkskul.kontakPembina}
                  onChange={(e) => setFormEkskul({ ...formEkskul, kontakPembina: e.target.value })}
                  className="mt-1 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground">Hari Latihan</label>
                <select
                  value={formEkskul.hariLatihan}
                  onChange={(e) => setFormEkskul({ ...formEkskul, hariLatihan: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="Senin">Senin</option>
                  <option value="Selasa">Selasa</option>
                  <option value="Rabu">Rabu</option>
                  <option value="Kamis">Kamis</option>
                  <option value="Jumat">Jumat</option>
                  <option value="Sabtu">Sabtu</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Jam Mulai</label>
                <Input
                  type="time"
                  value={formEkskul.jamMulai}
                  onChange={(e) => setFormEkskul({ ...formEkskul, jamMulai: e.target.value })}
                  className="mt-1 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Jam Selesai</label>
                <Input
                  type="time"
                  value={formEkskul.jamSelesai}
                  onChange={(e) => setFormEkskul({ ...formEkskul, jamSelesai: e.target.value })}
                  className="mt-1 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground">Lokasi / Tempat Latihan</label>
                <Input
                  placeholder="Lapangan Utama / Lab Komputer"
                  value={formEkskul.lokasiLatihan}
                  onChange={(e) => setFormEkskul({ ...formEkskul, lokasiLatihan: e.target.value })}
                  className="mt-1 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Kuota Maksimal Siswa</label>
                <Input
                  type="number"
                  min="5"
                  value={formEkskul.kuotaMaksimal}
                  onChange={(e) =>
                    setFormEkskul({ ...formEkskul, kuotaMaksimal: Number(e.target.value) || 30 })
                  }
                  className="mt-1 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">Prestasi Terbaru / Catatan Penghargaan</label>
              <Input
                placeholder="Contoh: Juara 1 Tingkat Kota 2024"
                value={formEkskul.prestasiTerbaru}
                onChange={(e) => setFormEkskul({ ...formEkskul, prestasiTerbaru: e.target.value })}
                className="mt-1 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">Deskripsi / Visi Kegiatan</label>
              <textarea
                rows={2}
                placeholder="Tujuan pembinaan karakter siswa..."
                value={formEkskul.deskripsi}
                onChange={(e) => setFormEkskul({ ...formEkskul, deskripsi: e.target.value })}
                className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm"
              />
            </div>

            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setTambahEkskulOpen(false)}>
                Batal
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Simpan Ekskul
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL DAFTARKAN ANGGOTA */}
      <Dialog open={isTambahAnggotaOpen} onOpenChange={setTambahAnggotaOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Users className="h-5 w-5 text-emerald-600" />
              Pendaftaran Anggota Siswa
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSimpanAnggota} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground">Pilih Ekstrakurikuler *</label>
              <select
                required
                value={formAnggota.ekskulId}
                onChange={(e) => setFormAnggota({ ...formAnggota, ekskulId: e.target.value })}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {daftarEkskul.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nama} ({e.hariLatihan})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">Pilih Siswa Induk *</label>
              <select
                required
                value={formAnggota.siswaId}
                onChange={(e) => setFormAnggota({ ...formAnggota, siswaId: e.target.value })}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {daftarSiswaInduk.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nama} ({s.kelas}) - NISN: {s.nisn}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">Jabatan Kepengurusan</label>
              <select
                value={formAnggota.jabatan}
                onChange={(e) =>
                  setFormAnggota({
                    ...formAnggota,
                    jabatan: e.target.value as AnggotaEkskul["jabatan"],
                  })
                }
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="ANGGOTA">Anggota Biasa</option>
                <option value="KETUA">Ketua Ekskul</option>
                <option value="WAKIL">Wakil Ketua</option>
                <option value="SEKRETARIS">Sekretaris</option>
                <option value="BENDAHARA">Bendahara</option>
              </select>
            </div>

            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setTambahAnggotaOpen(false)}>
                Batal
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Daftarkan Siswa
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL PENILAIAN E-RAPOR */}
      <Dialog open={isNilaiOpen} onOpenChange={setNilaiOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Award className="h-5 w-5 text-emerald-600" />
              Penilaian E-Rapor Ekstrakurikuler
            </DialogTitle>
          </DialogHeader>

          {selectedAnggota && (
            <div className="space-y-4">
              <div className="p-3 bg-muted/50 rounded-lg space-y-1 text-xs">
                <div className="font-semibold text-foreground text-sm">
                  {selectedAnggota.namaSiswa} ({selectedAnggota.kelas})
                </div>
                <div className="text-muted-foreground">
                  Kegiatan: <span className="font-medium text-foreground">{selectedAnggota.namaEkskul}</span>
                </div>
                <div className="text-muted-foreground">
                  Jabatan: <span className="font-medium">{selectedAnggota.jabatan}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground">Predikat Nilai Rapor</label>
                  <select
                    value={formNilai.predikatNilai}
                    onChange={(e) =>
                      setFormNilai({
                        ...formNilai,
                        predikatNilai: e.target.value as AnggotaEkskul["predikatNilai"],
                      })
                    }
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="SANGAT_BAIK">Sangat Baik (A)</option>
                    <option value="BAIK">Baik (B)</option>
                    <option value="CUKUP">Cukup (C)</option>
                    <option value="KURANG">Kurang (D)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground">Persentase Presensi (%)</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={formNilai.kehadiranPersen}
                    onChange={(e) =>
                      setFormNilai({
                        ...formNilai,
                        kehadiranPersen: Number(e.target.value) || 0,
                      })
                    }
                    className="mt-1 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Deskripsi / Catatan Pembina (Untuk Buku Rapor)</label>
                <textarea
                  rows={3}
                  value={formNilai.catatanPembina}
                  onChange={(e) =>
                    setFormNilai({ ...formNilai, catatanPembina: e.target.value })
                  }
                  className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm"
                />
              </div>

              <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={() => setNilaiOpen(false)}>
                  Batal
                </Button>
                <Button onClick={handleSimpanNilai} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Simpan Nilai Rapor
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* MODAL EDIT EKSKUL */}
      <Dialog open={isEditEkskulOpen} onOpenChange={setEditEkskulOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Edit className="h-5 w-5 text-emerald-600" />
              Edit Kegiatan Ekstrakurikuler
            </DialogTitle>
          </DialogHeader>

          {selectedEkskul && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground">Nama Ekskul</label>
                <Input
                  value={selectedEkskul.nama}
                  onChange={(e) => setSelectedEkskul({ ...selectedEkskul, nama: e.target.value })}
                  className="mt-1 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground">Guru Pembina</label>
                  <Input
                    value={selectedEkskul.pembina}
                    onChange={(e) => setSelectedEkskul({ ...selectedEkskul, pembina: e.target.value })}
                    className="mt-1 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground">Kontak WhatsApp</label>
                  <Input
                    value={selectedEkskul.kontakPembina}
                    onChange={(e) => setSelectedEkskul({ ...selectedEkskul, kontakPembina: e.target.value })}
                    className="mt-1 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Tempat / Lokasi Latihan</label>
                <Input
                  value={selectedEkskul.lokasiLatihan}
                  onChange={(e) => setSelectedEkskul({ ...selectedEkskul, lokasiLatihan: e.target.value })}
                  className="mt-1 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Prestasi Terbaru</label>
                <Input
                  value={selectedEkskul.prestasiTerbaru || ""}
                  onChange={(e) => setSelectedEkskul({ ...selectedEkskul, prestasiTerbaru: e.target.value })}
                  className="mt-1 text-sm"
                />
              </div>

              <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={() => setEditEkskulOpen(false)}>
                  Batal
                </Button>
                <Button
                  onClick={() => {
                    if (selectedEkskul) {
                      updateEkskul(selectedEkskul.id, selectedEkskul);
                      setEditEkskulOpen(false);
                    }
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Simpan Perubahan
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
