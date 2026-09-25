"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Search,
  CheckCheck,
  RotateCcw,
  Users,
  Calendar,
  Clock,
  Save,
  Check,
  FileText,
  BookOpen,
} from "lucide-react";
import { useStore, type Ketercapaian } from "@/lib/store";
import { type StatusKey, type Siswa } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

const statusConfig: Record<
  StatusKey,
  {
    label: string;
    activeClass: string;
    inactiveClass: string;
    badgeVariant: "hadir" | "sakit" | "izin" | "alpha";
  }
> = {
  H: {
    label: "Hadir",
    activeClass: "bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-600/20 font-bold",
    inactiveClass: "border-border bg-white text-slate-600 hover:border-emerald-300 hover:bg-emerald-50/60",
    badgeVariant: "hadir",
  },
  S: {
    label: "Sakit",
    activeClass: "bg-amber-500 text-white border-amber-500 shadow-xs ring-2 ring-amber-500/20 font-bold",
    inactiveClass: "border-border bg-white text-slate-600 hover:border-amber-300 hover:bg-amber-50/60",
    badgeVariant: "sakit",
  },
  I: {
    label: "Izin",
    activeClass: "bg-sky-600 text-white border-sky-600 shadow-xs ring-2 ring-sky-600/20 font-bold",
    inactiveClass: "border-border bg-white text-slate-600 hover:border-sky-300 hover:bg-sky-50/60",
    badgeVariant: "izin",
  },
  A: {
    label: "Alpha",
    activeClass: "bg-rose-600 text-white border-rose-600 shadow-xs ring-2 ring-rose-600/20 font-bold",
    inactiveClass: "border-border bg-white text-slate-600 hover:border-rose-300 hover:bg-rose-50/60",
    badgeVariant: "alpha",
  },
};

export default function AbsensiPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { jadwal, ambilDataSiswa, simpanAbsensi, simpanJurnal, currentUser, daftarGuru } = useStore();

  const jadwalItem = jadwal.find((j) => j.id === id) ?? {
    id,
    kelas: "X IPA 1",
    mapel: "Matematika",
    hari: "Kamis",
    jamMulai: "07.00",
    jamSelesai: "08.30",
    guruId: "g1",
  };

  const [siswa, setSiswa] = useState<Siswa[]>(() => ambilDataSiswa(id));
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | StatusKey>("ALL");
  const [materiPokok, setMateriPokok] = useState("Bab 1: SPLTV & Metode Eliminasi-Substitusi");
  const [tujuanPembelajaran, setTujuanPembelajaran] = useState("Siswa mampu memodelkan masalah kontekstual ke dalam SPLTV");
  const [ketercapaian, setKetercapaian] = useState<Ketercapaian>("TERCAPAI");
  const [catatan, setCatatan] = useState("KBM berjalan kondusif, seluruh kelompok menyelesaikan LKPD tepat waktu.");
  const [stamped, setStamped] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const filtered = useMemo(() => {
    return siswa.filter((s) => {
      const matchQuery =
        s.nama.toLowerCase().includes(query.toLowerCase()) ||
        s.nis.includes(query);
      const matchStatus = statusFilter === "ALL" || s.status === statusFilter;
      return matchQuery && matchStatus;
    });
  }, [siswa, query, statusFilter]);

  const ringkasan = useMemo(() => {
    const count: Record<StatusKey, number> = { H: 0, S: 0, I: 0, A: 0 };
    siswa.forEach((s) => {
      if (s.status) count[s.status] += 1;
    });
    return count;
  }, [siswa]);

  const totalSiswa = siswa.length;
  const persenKehadiran =
    totalSiswa > 0 ? Math.round((ringkasan.H / totalSiswa) * 100) : 0;
  const totalTidakHadir = ringkasan.S + ringkasan.I + ringkasan.A;

  function tandai(siswaId: string, status: StatusKey) {
    setSiswa((prev) =>
      prev.map((s) => (s.id === siswaId ? { ...s, status } : s))
    );
    setStamped(`${siswaId}-${status}`);
    window.setTimeout(() => setStamped(null), 320);
  }

  function setSemuaHadir() {
    setSiswa((prev) => prev.map((s) => ({ ...s, status: "H" as StatusKey })));
  }

  function resetDefault() {
    setSiswa(ambilDataSiswa(id));
    setStatusFilter("ALL");
    setQuery("");
  }

  function handleSimpan() {
    simpanAbsensi(id, siswa);

    const guru = daftarGuru.find((g) => g.id === (jadwalItem.guruId || currentUser?.id));
    simpanJurnal({
      jadwalId: id,
      guruId: jadwalItem.guruId || currentUser?.id || "g1",
      guruNama: guru?.nama || currentUser?.nama || "Sari Wulandari, S.Pd",
      kelas: jadwalItem.kelas,
      mapel: jadwalItem.mapel,
      hari: jadwalItem.hari,
      jamMulai: jadwalItem.jamMulai,
      jamSelesai: jadwalItem.jamSelesai,
      tanggal: `${jadwalItem.hari}, 24 Juli 2026`,
      materiPokok: materiPokok || `Materi Pokok ${jadwalItem.mapel}`,
      tujuanPembelajaran: tujuanPembelajaran || "Mencapai tujuan capaian pembelajaran (TP)",
      catatanKejadian: catatan || "KBM berjalan tertib dan lancar.",
      ketercapaian: ketercapaian,
      hadir: ringkasan.H,
      sakit: ringkasan.S,
      izin: ringkasan.I,
      alpha: ringkasan.A,
      totalSiswa: totalSiswa,
    });

    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      router.push("/jurnal");
    }, 1200);
  }

  return (
    <div className="w-full space-y-6">
      {/* Top Navigation & Session Hero Banner */}
      <div className="flex flex-col gap-4">
        <div>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="group mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-navy-700 hover:text-navy-950 transition-colors"
          >
            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
            <span>Kembali ke Jadwal Mengajar</span>
          </button>
        </div>

        {/* Hero Card */}
        <Card className="border-border bg-white shadow-xs overflow-hidden">
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl font-bold tracking-tight text-navy-950">
                  {jadwalItem.mapel}
                </h1>
                <Badge variant="navy" className="text-xs px-2.5 py-0.5 font-bold">
                  Kelas {jadwalItem.kelas}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Calendar size={13} className="text-navy-700" />
                  Hari {jadwalItem.hari}
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 font-mono">
                  <Clock size={13} className="text-navy-700" />
                  {jadwalItem.jamMulai} – {jadwalItem.jamSelesai} WIB
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <Users size={13} className="text-navy-700" />
                  {totalSiswa} Siswa Terdaftar
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={setSemuaHadir}
                className="gap-1.5 text-xs font-semibold text-emerald-700 border-emerald-200 hover:bg-emerald-50"
              >
                <CheckCheck size={15} />
                <span>Tandai Semua Hadir</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetDefault}
                className="gap-1.5 text-xs text-muted-foreground hover:text-navy-950 hover:bg-slate-100"
              >
                <RotateCcw size={14} />
                <span>Reset</span>
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Two-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Student Roster (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="border-border bg-white shadow-xs">
            {/* Filter & Search Bar */}
            <CardHeader className="border-b border-border p-4 sm:p-5 space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {/* Search Box */}
                <div className="relative flex-1 min-w-[240px]">
                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Cari siswa berdasarkan nama atau NIS..."
                    className="pl-9 h-9 text-xs bg-slate-50/70 border-border focus:bg-white"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground hover:text-navy-950"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="text-xs text-muted-foreground">
                  Menampilkan <strong className="text-navy-950">{filtered.length}</strong> dari {totalSiswa} siswa
                </div>
              </div>

              {/* Status Segmented Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setStatusFilter("ALL")}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                    statusFilter === "ALL"
                      ? "bg-navy-900 text-white font-semibold shadow-xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Semua ({totalSiswa})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("H")}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                    statusFilter === "H"
                      ? "bg-emerald-600 text-white font-semibold shadow-xs"
                      : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                  }`}
                >
                  Hadir ({ringkasan.H})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("S")}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                    statusFilter === "S"
                      ? "bg-amber-500 text-white font-semibold shadow-xs"
                      : "bg-amber-50 text-amber-800 hover:bg-amber-100"
                  }`}
                >
                  Sakit ({ringkasan.S})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("I")}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                    statusFilter === "I"
                      ? "bg-sky-600 text-white font-semibold shadow-xs"
                      : "bg-sky-50 text-sky-800 hover:bg-sky-100"
                  }`}
                >
                  Izin ({ringkasan.I})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("A")}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                    statusFilter === "A"
                      ? "bg-rose-600 text-white font-semibold shadow-xs"
                      : "bg-rose-50 text-rose-800 hover:bg-rose-100"
                  }`}
                >
                  Alpha ({ringkasan.A})
                </button>
              </div>
            </CardHeader>

            {/* Student Attendance List */}
            <CardContent className="p-0">
              <ul className="divide-y divide-border">
                {filtered.map((s, index) => (
                  <li
                    key={s.id}
                    className="flex flex-col gap-3 p-3.5 sm:flex-row sm:items-center sm:justify-between hover:bg-slate-50/70 transition-colors"
                  >
                    {/* Left: Info Siswa */}
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono text-xs text-muted-foreground w-6 text-right shrink-0">
                        #{String(index + 1).padStart(2, "0")}
                      </span>
                      <Avatar className="h-9 w-9 shrink-0 border border-border">
                        <AvatarFallback className="bg-navy-100 text-navy-900 text-xs font-bold">
                          {s.nama
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold text-navy-950">
                            {s.nama}
                          </p>
                          {s.status ? (
                            <Badge
                              variant={statusConfig[s.status].badgeVariant}
                              className="text-[10px] py-0 px-1.5 shrink-0 hidden sm:inline-flex"
                            >
                              {statusConfig[s.status].label}
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-[10px] py-0 px-1.5 shrink-0 hidden sm:inline-flex text-muted-foreground"
                            >
                              Belum Diisi
                            </Badge>
                          )}
                        </div>
                        <p className="font-mono text-[11px] text-muted-foreground">
                          NIS {s.nis}
                        </p>
                      </div>
                    </div>

                    {/* Right: Tactile Segmented Attendance Buttons */}
                    <div className="flex items-center justify-end gap-1.5 shrink-0 pl-9 sm:pl-0">
                      {(Object.keys(statusConfig) as StatusKey[]).map((key) => {
                        const active = s.status === key;
                        const isStamping = stamped === `${s.id}-${key}`;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => tandai(s.id, key)}
                            aria-pressed={active}
                            aria-label={`${s.nama} ${statusConfig[key].label}`}
                            className={`h-9 min-w-[50px] sm:min-w-[64px] rounded-lg border px-2 text-xs font-medium transition-all duration-150 flex items-center justify-center gap-1 ${
                              isStamping ? "scale-95" : ""
                            } ${
                              active
                                ? statusConfig[key].activeClass
                                : statusConfig[key].inactiveClass
                            }`}
                          >
                            <span>{key}</span>
                            <span className="hidden sm:inline text-[11px] font-normal">
                              {statusConfig[key].label}
                            </span>
                            {active && <Check size={13} className="shrink-0 stroke-[3]" />}
                          </button>
                        );
                      })}
                    </div>
                  </li>
                ))}

                {filtered.length === 0 && (
                  <li className="py-12 text-center text-sm text-muted-foreground">
                    <p className="font-medium text-navy-900">Tidak ada siswa ditemukan</p>
                    <p className="text-xs mt-1">Coba sesuaikan kata kunci pencarian atau filter status.</p>
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Sticky Summary & Primary CTA (4 Cols) */}
        <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-20">
          {/* Card Ringkasan Status Live */}
          <Card className="border-border bg-white shadow-xs">
            <CardHeader className="border-b border-border py-3.5 px-5">
              <CardTitle className="text-sm font-bold text-navy-950 flex items-center justify-between">
                <span>Ringkasan Kehadiran</span>
                <span className="font-mono text-xs text-muted-foreground font-normal">
                  {totalSiswa} Siswa
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              {/* Progress Kehadiran Persentase */}
              <div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Tingkat Kehadiran</span>
                  <span className="font-mono text-2xl font-bold text-navy-950">
                    {persenKehadiran}%
                  </span>
                </div>
                <Progress
                  value={persenKehadiran}
                  className="h-2.5 mt-2 bg-slate-100"
                  indicatorClassName={
                    persenKehadiran >= 90
                      ? "bg-emerald-600"
                      : persenKehadiran >= 75
                      ? "bg-amber-500"
                      : "bg-rose-600"
                  }
                />
              </div>

              {/* 4 Detail Status Grid */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3">
                  <span className="text-[11px] font-medium text-emerald-800 block">Hadir</span>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="font-mono text-2xl font-bold text-emerald-700">
                      {ringkasan.H}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-mono">
                      {totalSiswa ? Math.round((ringkasan.H / totalSiswa) * 100) : 0}%
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3">
                  <span className="text-[11px] font-medium text-amber-800 block">Sakit</span>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="font-mono text-2xl font-bold text-amber-700">
                      {ringkasan.S}
                    </span>
                    <span className="text-[10px] text-amber-600 font-mono">
                      {totalSiswa ? Math.round((ringkasan.S / totalSiswa) * 100) : 0}%
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-sky-200 bg-sky-50/70 p-3">
                  <span className="text-[11px] font-medium text-sky-800 block">Izin</span>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="font-mono text-2xl font-bold text-sky-700">
                      {ringkasan.I}
                    </span>
                    <span className="text-[10px] text-sky-600 font-mono">
                      {totalSiswa ? Math.round((ringkasan.I / totalSiswa) * 100) : 0}%
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3">
                  <span className="text-[11px] font-medium text-rose-800 block">Alpha</span>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="font-mono text-2xl font-bold text-rose-700">
                      {ringkasan.A}
                    </span>
                    <span className="text-[10px] text-rose-600 font-mono">
                      {totalSiswa ? Math.round((ringkasan.A / totalSiswa) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Form Input Jurnal Mengajar (Kurikulum Merdeka) */}
              <div className="pt-3 border-t border-border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <BookOpen size={14} className="text-primary" />
                    <span className="text-xs font-bold text-navy-950">
                      Jurnal Mengajar Digital
                    </span>
                  </div>
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] py-0 px-1 font-medium">
                    Kurikulum Merdeka
                  </Badge>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 block">
                    Materi Pokok / Pembahasan
                  </label>
                  <input
                    type="text"
                    value={materiPokok}
                    onChange={(e) => setMateriPokok(e.target.value)}
                    placeholder="Contoh: Metode Eliminasi & Substitusi SPLTV"
                    className="w-full rounded-lg border border-border bg-slate-50/60 px-2.5 py-1.5 text-xs text-navy-950 placeholder:text-muted-foreground outline-none focus:border-navy-600 focus:bg-white transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 block">
                    Tujuan Pembelajaran (TP)
                  </label>
                  <input
                    type="text"
                    value={tujuanPembelajaran}
                    onChange={(e) => setTujuanPembelajaran(e.target.value)}
                    placeholder="Contoh: Siswa mampu memodelkan masalah ke bentuk SPLTV"
                    className="w-full rounded-lg border border-border bg-slate-50/60 px-2.5 py-1.5 text-xs text-navy-950 placeholder:text-muted-foreground outline-none focus:border-navy-600 focus:bg-white transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 block">
                    Ketercapaian Target KBM
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { id: "TERCAPAI", label: "Tercapai", color: "text-emerald-700 bg-emerald-50 border-emerald-300" },
                      { id: "PENGUATAN", label: "Penguatan", color: "text-amber-700 bg-amber-50 border-amber-300" },
                      { id: "REMEDIAL", label: "Remedial", color: "text-rose-700 bg-rose-50 border-rose-300" },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setKetercapaian(t.id as Ketercapaian)}
                        className={`py-1 px-1.5 text-[10px] font-bold rounded-md border text-center transition-all ${
                          ketercapaian === t.id
                            ? `${t.color} ring-1 ring-offset-1 ring-navy-400 font-extrabold shadow-2xs`
                            : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="catatanPertemuan"
                    className="text-[11px] font-semibold text-slate-700 flex items-center gap-1"
                  >
                    <FileText size={12} className="text-slate-400" />
                    <span>Catatan Refleksi / Kejadian Siswa</span>
                  </label>
                  <textarea
                    id="catatanPertemuan"
                    rows={2}
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    placeholder="Contoh: Siswa aktif, 2 anak perlu bimbingan mandiri..."
                    className="w-full rounded-lg border border-border bg-slate-50/60 p-2 text-xs text-navy-950 placeholder:text-muted-foreground outline-none focus:border-navy-600 focus:bg-white transition-colors resize-none"
                  />
                </div>
              </div>

              {/* Main CTA Submit Button */}
              <div className="pt-2">
                <Button
                  onClick={handleSimpan}
                  className="w-full h-11 bg-navy-900 text-white hover:bg-navy-800 font-semibold shadow-md gap-2 text-xs"
                >
                  <Save size={15} />
                  <span>
                    {totalTidakHadir > 0
                      ? `Simpan Presensi (${ringkasan.H} Hadir, ${totalTidakHadir} Absen)`
                      : "Simpan Presensi (Semua Hadir)"}
                  </span>
                </Button>
                <p className="text-[11px] text-muted-foreground text-center mt-2">
                  Data langsung tercatat ke buku rekapitulasi sekolah.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Floating Success Toast */}
      {saved && (
        <div className="fixed inset-x-0 bottom-8 z-50 mx-auto flex w-fit max-w-md animate-fade-up items-center gap-2.5 rounded-full bg-navy-950 px-5 py-3 text-xs font-medium text-white shadow-2xl">
          <CheckCircle2 size={17} className="text-emerald-400 shrink-0" />
          <span>Presensi pertemuan berhasil disimpan! Mengalihkan ke beranda...</span>
        </div>
      )}
    </div>
  );
}
