"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Briefcase,
  GraduationCap,
  Search,
  Plus,
  ArrowLeft,
  Download,
  Building2,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  CheckCircle2,
  PieChart,
  Users,
  Compass,
  Edit,
  Trash2,
  ExternalLink,
  MessageSquare,
  Globe,
  Share2,
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
  type AlumniRecord,
} from "@/lib/store";
import { cn } from "@/lib/utils";

const TRACER_CONFIG: Record<
  AlumniRecord["statusTracer"],
  { label: string; badgeClass: string }
> = {
  KULIAH_PTN: {
    label: "Kuliah PTN",
    badgeClass: "bg-blue-100 text-blue-900 border-blue-200",
  },
  KULIAH_PTS: {
    label: "Kuliah PTS",
    badgeClass: "bg-teal-100 text-teal-900 border-teal-200",
  },
  STUDI_LUAR_NEGERI: {
    label: "Studi Luar Negeri",
    badgeClass: "bg-purple-100 text-purple-900 border-purple-200",
  },
  BEKERJA: {
    label: "Bekerja di Industri",
    badgeClass: "bg-emerald-100 text-emerald-900 border-emerald-200",
  },
  WIRAUSAHA: {
    label: "Wirausaha / Bisnis",
    badgeClass: "bg-amber-100 text-amber-900 border-amber-200",
  },
  MENCARI_KERJA: {
    label: "Mencari Kerja / Gap Year",
    badgeClass: "bg-slate-100 text-slate-800 border-slate-200",
  },
};

export default function AdminAlumniPage() {
  const {
    daftarAlumni,
    tambahAlumni,
    updateAlumni,
    hapusAlumni,
  } = useStore();

  const [activeTab, setActiveTab] = useState<"direktori" | "statistik" | "mentoring">("direktori");
  const [searchQuery, setSearchQuery] = useState("");
  const [tahunFilter, setTahunFilter] = useState<string>("SEMUA");
  const [statusFilter, setStatusFilter] = useState<string>("SEMUA");
  const [jurusanFilter, setJurusanFilter] = useState<string>("SEMUA");

  // Modals
  const [isTambahOpen, setTambahOpen] = useState(false);
  const [isEditOpen, setEditOpen] = useState(false);
  const [selectedAlumni, setSelectedAlumni] = useState<AlumniRecord | null>(null);

  // Form Tambah Alumni
  const [formAlumni, setFormAlumni] = useState({
    nisn: "",
    nama: "",
    gender: "L" as AlumniRecord["gender"],
    tahunLulus: 2024,
    jurusan: "MIPA" as AlumniRecord["jurusan"],
    statusTracer: "KULIAH_PTN" as AlumniRecord["statusTracer"],
    instansiAtauKampus: "",
    posisiAtauJurusan: "",
    email: "",
    telepon: "",
    kotaDomisili: "",
    kesanPesan: "",
    bersediaMentoring: true,
  });

  // KPIs
  const totalAlumni = daftarAlumni.length;

  const totalKuliah = useMemo(
    () =>
      daftarAlumni.filter(
        (a) =>
          a.statusTracer === "KULIAH_PTN" ||
          a.statusTracer === "KULIAH_PTS" ||
          a.statusTracer === "STUDI_LUAR_NEGERI"
      ).length,
    [daftarAlumni]
  );

  const totalBekerja = useMemo(
    () => daftarAlumni.filter((a) => a.statusTracer === "BEKERJA").length,
    [daftarAlumni]
  );

  const totalWirausaha = useMemo(
    () => daftarAlumni.filter((a) => a.statusTracer === "WIRAUSAHA").length,
    [daftarAlumni]
  );

  const totalMentor = useMemo(
    () => daftarAlumni.filter((a) => a.bersediaMentoring).length,
    [daftarAlumni]
  );

  // Filtered Alumni
  const alumniFiltered = useMemo(() => {
    return daftarAlumni.filter((a) => {
      const matchSearch =
        searchQuery === "" ||
        a.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.nisn.includes(searchQuery) ||
        a.instansiAtauKampus.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.posisiAtauJurusan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.kotaDomisili.toLowerCase().includes(searchQuery.toLowerCase());

      const matchTahun =
        tahunFilter === "SEMUA" || String(a.tahunLulus) === tahunFilter;

      const matchStatus =
        statusFilter === "SEMUA" || a.statusTracer === statusFilter;

      const matchJurusan =
        jurusanFilter === "SEMUA" || a.jurusan === jurusanFilter;

      return matchSearch && matchTahun && matchStatus && matchJurusan;
    });
  }, [daftarAlumni, searchQuery, tahunFilter, statusFilter, jurusanFilter]);

  // Submit Tambah Alumni
  const handleSimpanAlumni = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAlumni.nama.trim() || !formAlumni.instansiAtauKampus.trim()) return;

    tambahAlumni({
      ...formAlumni,
      nisn: formAlumni.nisn.trim() || `00${Math.floor(10000000 + Math.random() * 90000000)}`,
      tahunLulus: Number(formAlumni.tahunLulus) || new Date().getFullYear(),
    });

    setFormAlumni({
      nisn: "",
      nama: "",
      gender: "L",
      tahunLulus: 2024,
      jurusan: "MIPA",
      statusTracer: "KULIAH_PTN",
      instansiAtauKampus: "",
      posisiAtauJurusan: "",
      email: "",
      telepon: "",
      kotaDomisili: "",
      kesanPesan: "",
      bersediaMentoring: true,
    });
    setTambahOpen(false);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      "NISN",
      "Nama Alumni",
      "Gender",
      "Tahun Lulus",
      "Jurusan SMA",
      "Status Tracer",
      "Kampus / Instansi Perusahaan",
      "Program Studi / Posisi Jabatan",
      "Email",
      "Nomor Telepon",
      "Kota Domisili",
      "Bersedia Mentoring",
      "Kesan & Pesan",
    ];

    const rows = daftarAlumni.map((a) => [
      `"${a.nisn}"`,
      `"${a.nama}"`,
      `"${a.gender}"`,
      a.tahunLulus,
      `"${a.jurusan}"`,
      `"${TRACER_CONFIG[a.statusTracer]?.label || a.statusTracer}"`,
      `"${a.instansiAtauKampus}"`,
      `"${a.posisiAtauJurusan}"`,
      `"${a.email}"`,
      `"${a.telepon}"`,
      `"${a.kotaDomisili}"`,
      a.bersediaMentoring ? "YA" : "TIDAK",
      `"${a.kesanPesan || ""}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Tracer_Study_Alumni_${new Date().toISOString().split("T")[0]}.csv`);
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
              Tracer Study & Karir
            </Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-emerald-600" />
            Alumni & Penelusuran Karir (Tracer Study)
          </h1>
          <p className="text-sm text-muted-foreground">
            Database kelulusan siswa, pemetaan studi lanjut (PTN/PTS/Luar Negeri), dunia kerja & wirausaha, serta jaringan mentoring adik kelas.
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
            size="sm"
            onClick={() => setTambahOpen(true)}
            className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
          >
            <Plus className="h-4 w-4" />
            Tambah Data Alumni
          </Button>
        </div>
      </div>

      {/* KPI METRICS */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <Card className="border border-border/60 shadow-xs">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-medium">Total Alumni Terekam</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold tracking-tight text-foreground">{totalAlumni}</span>
              <span className="text-xs text-muted-foreground">lulusan</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-xs">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-medium">Studi Lanjut Perguruan Tinggi</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold tracking-tight text-blue-700">{totalKuliah}</span>
              <span className="text-xs text-muted-foreground">
                ({Math.round((totalKuliah / (totalAlumni || 1)) * 100)}%)
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-xs">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-medium">Bekerja di Industri</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold tracking-tight text-emerald-700">{totalBekerja}</span>
              <span className="text-xs text-muted-foreground">
                ({Math.round((totalBekerja / (totalAlumni || 1)) * 100)}%)
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-xs">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-medium">Wirausaha / Bisnis</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold tracking-tight text-amber-700">{totalWirausaha}</span>
              <span className="text-xs text-muted-foreground">
                ({Math.round((totalWirausaha / (totalAlumni || 1)) * 100)}%)
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-xs col-span-2 md:col-span-1">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-medium">Siap Jadi Mentor</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold tracking-tight text-purple-700">{totalMentor}</span>
              <span className="text-xs text-muted-foreground">alumni aktif</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab("direktori")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
            activeTab === "direktori"
              ? "border-emerald-600 text-emerald-700 font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <GraduationCap className="h-4 w-4" />
          Direktori Alumni ({daftarAlumni.length})
        </button>

        <button
          onClick={() => setActiveTab("statistik")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
            activeTab === "statistik"
              ? "border-emerald-600 text-emerald-700 font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <PieChart className="h-4 w-4" />
          Analisis Daya Serap & Tracer
        </button>

        <button
          onClick={() => setActiveTab("mentoring")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
            activeTab === "mentoring"
              ? "border-emerald-600 text-emerald-700 font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Sparkles className="h-4 w-4" />
          Jaringan Mentoring Siswa ({totalMentor})
        </button>
      </div>

      {/* TAB 1: DIREKTORI ALUMNI */}
      {activeTab === "direktori" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-card p-3 rounded-lg border border-border">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama, kampus, perusahaan, domisili..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-sm h-9"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                aria-label="Filter Tahun Lulus"
                value={tahunFilter}
                onChange={(e) => setTahunFilter(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs focus:ring-1 focus:ring-ring"
              >
                <option value="SEMUA">Semua Angkatan</option>
                <option value="2024">Lulusan 2024</option>
                <option value="2023">Lulusan 2023</option>
                <option value="2022">Lulusan 2022</option>
                <option value="2021">Lulusan 2021</option>
              </select>

              <select
                aria-label="Filter Status Tracer"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs focus:ring-1 focus:ring-ring"
              >
                <option value="SEMUA">Semua Status Karir</option>
                <option value="KULIAH_PTN">Kuliah PTN</option>
                <option value="KULIAH_PTS">Kuliah PTS</option>
                <option value="STUDI_LUAR_NEGERI">Studi Luar Negeri</option>
                <option value="BEKERJA">Bekerja di Industri</option>
                <option value="WIRAUSAHA">Wirausaha / Bisnis</option>
              </select>

              <select
                aria-label="Filter Jurusan"
                value={jurusanFilter}
                onChange={(e) => setJurusanFilter(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs focus:ring-1 focus:ring-ring"
              >
                <option value="SEMUA">Semua Jurusan</option>
                <option value="MIPA">MIPA</option>
                <option value="IPS">IPS</option>
                <option value="BAHASA">Bahasa</option>
              </select>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-xs font-semibold uppercase text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-4 py-3">Alumni & Angkatan</th>
                    <th className="px-4 py-3">Status Karir / Studi</th>
                    <th className="px-4 py-3">Kampus / Instansi & Posisi</th>
                    <th className="px-4 py-3">Kontak & Domisili</th>
                    <th className="px-4 py-3">Mentoring</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {alumniFiltered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground text-sm">
                        Tidak ada data alumni yang cocok dengan pencarian.
                      </td>
                    </tr>
                  ) : (
                    alumniFiltered.map((a) => {
                      const TracerConf = TRACER_CONFIG[a.statusTracer];

                      return (
                        <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="font-semibold text-foreground">{a.nama}</div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <span>Lulus {a.tahunLulus}</span>
                              <span>•</span>
                              <Badge variant="outline" className="text-[10px] py-0 px-1">
                                {a.jurusan}
                              </Badge>
                              <span>•</span>
                              <span className="font-mono text-[11px]">{a.nisn}</span>
                            </div>
                            {a.kesanPesan && (
                              <p className="text-[11px] text-muted-foreground line-clamp-1 italic mt-0.5">
                                "{a.kesanPesan}"
                              </p>
                            )}
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap">
                            <Badge
                              variant="outline"
                              className={cn("text-xs font-semibold", TracerConf?.badgeClass)}
                            >
                              {TracerConf?.label || a.statusTracer}
                            </Badge>
                          </td>

                          <td className="px-4 py-3">
                            <div className="font-semibold text-foreground flex items-center gap-1.5">
                              <Building2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                              {a.instansiAtauKampus}
                            </div>
                            <div className="text-xs text-muted-foreground ml-5">
                              {a.posisiAtauJurusan}
                            </div>
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap text-xs">
                            <div className="flex items-center gap-1.5 text-foreground">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              {a.kotaDomisili}
                            </div>
                            <div className="text-muted-foreground text-[11px] mt-0.5">
                              {a.telepon} • {a.email}
                            </div>
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap">
                            {a.bersediaMentoring ? (
                              <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs">
                                Mentor Aktif
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </td>

                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {a.telepon && (
                                <a
                                  href={`https://wa.me/${a.telepon.replace(/[^0-9]/g, "")}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="h-7 px-2 inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 rounded-md"
                                  title="Hubungi WhatsApp"
                                >
                                  <Phone className="h-3 w-3" />
                                  WA
                                </a>
                              )}

                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedAlumni(a);
                                  setEditOpen(true);
                                }}
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                                title="Edit Alumni"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>

                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  if (confirm(`Hapus data alumni ${a.nama}?`)) {
                                    hapusAlumni(a.id);
                                  }
                                }}
                                className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                                title="Hapus Alumni"
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

      {/* TAB 2: ANALISIS DAYA SERAP */}
      {activeTab === "statistik" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border border-border/70 shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-emerald-600" />
                  Distribusi Outcome Kelulusan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Kuliah Perguruan Tinggi Negeri (PTN)", count: daftarAlumni.filter((a) => a.statusTracer === "KULIAH_PTN").length, color: "bg-blue-600" },
                  { label: "Kuliah Perguruan Tinggi Swasta (PTS)", count: daftarAlumni.filter((a) => a.statusTracer === "KULIAH_PTS").length, color: "bg-teal-600" },
                  { label: "Studi Luar Negeri (International)", count: daftarAlumni.filter((a) => a.statusTracer === "STUDI_LUAR_NEGERI").length, color: "bg-purple-600" },
                  { label: "Bekerja di Industri & Perusahaan", count: daftarAlumni.filter((a) => a.statusTracer === "BEKERJA").length, color: "bg-emerald-600" },
                  { label: "Wirausaha / Rintis Bisnis", count: daftarAlumni.filter((a) => a.statusTracer === "WIRAUSAHA").length, color: "bg-amber-600" },
                  { label: "Mencari Kerja / Gap Year", count: daftarAlumni.filter((a) => a.statusTracer === "MENCARI_KERJA").length, color: "bg-slate-400" },
                ].map((item) => {
                  const pct = Math.round((item.count / (totalAlumni || 1)) * 100);
                  return (
                    <div key={item.label} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-foreground font-medium">{item.label}</span>
                        <span className="text-muted-foreground">{item.count} alumni ({pct}%)</span>
                      </div>
                      <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all", item.color)}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="border border-border/70 shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-emerald-600" />
                  Top Kampus & Instansi Alumni
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {daftarAlumni.map((a) => (
                  <div
                    key={a.id}
                    className="p-2.5 rounded-lg border border-border/80 bg-muted/20 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-foreground">{a.instansiAtauKampus}</div>
                      <div className="text-muted-foreground text-[11px]">{a.posisiAtauJurusan}</div>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {a.nama} ({a.tahunLulus})
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 3: JARINGAN MENTORING */}
      {activeTab === "mentoring" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {daftarAlumni
              .filter((a) => a.bersediaMentoring)
              .map((mentor) => (
                <Card key={mentor.id} className="border border-border/70 shadow-xs hover:border-purple-300 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-[10px] mb-1">
                          Mentor Karir & Studi
                        </Badge>
                        <CardTitle className="text-base font-bold text-foreground">
                          {mentor.nama}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">Alumni {mentor.tahunLulus} • {mentor.jurusan}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs">
                    <div className="p-2.5 bg-muted/40 rounded-lg space-y-1">
                      <div className="font-semibold text-foreground">{mentor.instansiAtauKampus}</div>
                      <div className="text-muted-foreground text-[11px]">{mentor.posisiAtauJurusan}</div>
                      <div className="text-muted-foreground text-[11px] flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {mentor.kotaDomisili}
                      </div>
                    </div>

                    {mentor.kesanPesan && (
                      <p className="text-muted-foreground italic text-[11px] line-clamp-2">
                        "{mentor.kesanPesan}"
                      </p>
                    )}

                    <div className="pt-2 border-t border-border flex items-center justify-between">
                      <span className="text-[11px] text-emerald-700 font-medium">Siap Berbagi Pengalaman</span>
                      {mentor.telepon && (
                        <a
                          href={`https://wa.me/${mentor.telepon.replace(/[^0-9]/g, "")}?text=Halo%20Kak%20${encodeURIComponent(mentor.nama)},%20kami%20dari%20sekolah%20ingin%20mengundang%20sharing%20session`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-7 px-2.5 inline-flex items-center gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-md"
                        >
                          <Phone className="h-3 w-3" />
                          Hubungi Mentor
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* MODAL TAMBAH ALUMNI */}
      <Dialog open={isTambahOpen} onOpenChange={setTambahOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Briefcase className="h-5 w-5 text-emerald-600" />
              Pencatatan Data Alumni Baru
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSimpanAlumni} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground">Nama Lengkap Alumni *</label>
                <Input
                  required
                  placeholder="Nama lengkap..."
                  value={formAlumni.nama}
                  onChange={(e) => setFormAlumni({ ...formAlumni, nama: e.target.value })}
                  className="mt-1 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">NISN (Nomor Induk Siswa Nasional)</label>
                <Input
                  placeholder="00xxxxxxx"
                  value={formAlumni.nisn}
                  onChange={(e) => setFormAlumni({ ...formAlumni, nisn: e.target.value })}
                  className="mt-1 text-sm font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground">Gender</label>
                <select
                  value={formAlumni.gender}
                  onChange={(e) =>
                    setFormAlumni({
                      ...formAlumni,
                      gender: e.target.value as AlumniRecord["gender"],
                    })
                  }
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Tahun Kelulusan</label>
                <Input
                  type="number"
                  required
                  value={formAlumni.tahunLulus}
                  onChange={(e) =>
                    setFormAlumni({
                      ...formAlumni,
                      tahunLulus: Number(e.target.value) || 2024,
                    })
                  }
                  className="mt-1 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Jurusan SMA</label>
                <select
                  value={formAlumni.jurusan}
                  onChange={(e) =>
                    setFormAlumni({
                      ...formAlumni,
                      jurusan: e.target.value as AlumniRecord["jurusan"],
                    })
                  }
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="MIPA">MIPA</option>
                  <option value="IPS">IPS</option>
                  <option value="BAHASA">Bahasa</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground">Status Tracer Study Terkini</label>
                <select
                  value={formAlumni.statusTracer}
                  onChange={(e) =>
                    setFormAlumni({
                      ...formAlumni,
                      statusTracer: e.target.value as AlumniRecord["statusTracer"],
                    })
                  }
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="KULIAH_PTN">Kuliah PTN</option>
                  <option value="KULIAH_PTS">Kuliah PTS</option>
                  <option value="STUDI_LUAR_NEGERI">Studi Luar Negeri</option>
                  <option value="BEKERJA">Bekerja di Industri</option>
                  <option value="WIRAUSAHA">Wirausaha / Bisnis</option>
                  <option value="MENCARI_KERJA">Mencari Kerja / Gap Year</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Nama Kampus / Perusahaan *</label>
                <Input
                  required
                  placeholder="Contoh: Institut Teknologi Bandung (ITB)"
                  value={formAlumni.instansiAtauKampus}
                  onChange={(e) =>
                    setFormAlumni({ ...formAlumni, instansiAtauKampus: e.target.value })
                  }
                  className="mt-1 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground">Program Studi / Posisi Jabatan</label>
                <Input
                  placeholder="Contoh: Teknik Informatika / Software Engineer"
                  value={formAlumni.posisiAtauJurusan}
                  onChange={(e) =>
                    setFormAlumni({ ...formAlumni, posisiAtauJurusan: e.target.value })
                  }
                  className="mt-1 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Kota Domisili</label>
                <Input
                  placeholder="Contoh: Bandung / Jakarta Selatan"
                  value={formAlumni.kotaDomisili}
                  onChange={(e) =>
                    setFormAlumni({ ...formAlumni, kotaDomisili: e.target.value })
                  }
                  className="mt-1 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground">Email</label>
                <Input
                  type="email"
                  placeholder="alumni@email.com"
                  value={formAlumni.email}
                  onChange={(e) => setFormAlumni({ ...formAlumni, email: e.target.value })}
                  className="mt-1 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Nomor Telepon / WhatsApp</label>
                <Input
                  placeholder="0812-xxxx-xxxx"
                  value={formAlumni.telepon}
                  onChange={(e) => setFormAlumni({ ...formAlumni, telepon: e.target.value })}
                  className="mt-1 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">Kesan & Pesan untuk Sekolah</label>
              <textarea
                rows={2}
                placeholder="Pesan motivasi atau saran pengembangan fasilitas..."
                value={formAlumni.kesanPesan}
                onChange={(e) =>
                  setFormAlumni({ ...formAlumni, kesanPesan: e.target.value })
                }
                className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="mentoringCheck"
                checked={formAlumni.bersediaMentoring}
                onChange={(e) =>
                  setFormAlumni({ ...formAlumni, bersediaMentoring: e.target.checked })
                }
                className="rounded border-input text-emerald-600 focus:ring-emerald-500 h-4 w-4"
              />
              <label htmlFor="mentoringCheck" className="text-xs font-medium text-foreground cursor-pointer">
                Bersedia menjadi mentor / narasumber karir bagi siswa aktif sekolah
              </label>
            </div>

            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setTambahOpen(false)}>
                Batal
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Simpan Data Alumni
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL EDIT ALUMNI */}
      <Dialog open={isEditOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Edit className="h-5 w-5 text-emerald-600" />
              Edit Data Alumni
            </DialogTitle>
          </DialogHeader>

          {selectedAlumni && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground">Nama Alumni</label>
                <Input
                  value={selectedAlumni.nama}
                  onChange={(e) => setSelectedAlumni({ ...selectedAlumni, nama: e.target.value })}
                  className="mt-1 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Status Tracer Study</label>
                <select
                  value={selectedAlumni.statusTracer}
                  onChange={(e) =>
                    setSelectedAlumni({
                      ...selectedAlumni,
                      statusTracer: e.target.value as AlumniRecord["statusTracer"],
                    })
                  }
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="KULIAH_PTN">Kuliah PTN</option>
                  <option value="KULIAH_PTS">Kuliah PTS</option>
                  <option value="STUDI_LUAR_NEGERI">Studi Luar Negeri</option>
                  <option value="BEKERJA">Bekerja di Industri</option>
                  <option value="WIRAUSAHA">Wirausaha / Bisnis</option>
                  <option value="MENCARI_KERJA">Mencari Kerja / Gap Year</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Kampus / Perusahaan</label>
                <Input
                  value={selectedAlumni.instansiAtauKampus}
                  onChange={(e) =>
                    setSelectedAlumni({ ...selectedAlumni, instansiAtauKampus: e.target.value })
                  }
                  className="mt-1 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Posisi / Jurusan</label>
                <Input
                  value={selectedAlumni.posisiAtauJurusan}
                  onChange={(e) =>
                    setSelectedAlumni({ ...selectedAlumni, posisiAtauJurusan: e.target.value })
                  }
                  className="mt-1 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground">Kota Domisili</label>
                  <Input
                    value={selectedAlumni.kotaDomisili}
                    onChange={(e) =>
                      setSelectedAlumni({ ...selectedAlumni, kotaDomisili: e.target.value })
                    }
                    className="mt-1 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground">Nomor Telepon</label>
                  <Input
                    value={selectedAlumni.telepon}
                    onChange={(e) =>
                      setSelectedAlumni({ ...selectedAlumni, telepon: e.target.value })
                    }
                    className="mt-1 text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editMentorCheck"
                  checked={selectedAlumni.bersediaMentoring}
                  onChange={(e) =>
                    setSelectedAlumni({ ...selectedAlumni, bersediaMentoring: e.target.checked })
                  }
                  className="rounded border-input text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <label htmlFor="editMentorCheck" className="text-xs font-medium text-foreground cursor-pointer">
                  Bersedia menjadi mentor karir
                </label>
              </div>

              <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                  Batal
                </Button>
                <Button
                  onClick={() => {
                    if (selectedAlumni) {
                      updateAlumni(selectedAlumni.id, selectedAlumni);
                      setEditOpen(false);
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
