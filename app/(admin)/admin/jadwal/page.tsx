"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import {
  CalendarPlus,
  Download,
  FileText,
  Trash2,
  Search,
  ChevronDown,
  Check,
  Users,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import {
  useStore,
  HARI,
  SLOT_WAKTU,
  JAM_PER_SLOT,
  TARGET_JAM_MINGGU,
  cekBentrok,
  type SlotWaktu,
  type JadwalEntry,
} from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

function labelSlot(s: SlotWaktu) {
  return `${s.mulai}–${s.selesai}`;
}

export default function AdminJadwalPage() {
  const { daftarGuru, daftarKelas, jadwal, tambahJadwal, hapusJadwal } = useStore();

  const [guruAktifId, setGuruAktifId] = useState<string>(() => daftarGuru[0]?.id ?? "g1");
  const guruAktif = daftarGuru.find((g) => g.id === guruAktifId) ?? daftarGuru[0];

  const [mapel, setMapel] = useState<string>(() => guruAktif?.mapel[0] ?? "Matematika");
  const [kelas, setKelas] = useState<string>(() => daftarKelas[0]?.nama ?? "X IPA 1");
  const [hari, setHari] = useState<string>(HARI[0]);
  const [slotIndex, setSlotIndex] = useState<number>(0);
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [pesanSukses, setPesanSukses] = useState<string | null>(null);

  // Konfirmasi Hapus Jadwal Modal State
  const [jadwalAkanDihapus, setJadwalAkanDihapus] = useState<JadwalEntry | null>(null);

  function konfirmasiHapus() {
    if (!jadwalAkanDihapus) return;
    const mapelHapus = jadwalAkanDihapus.mapel;
    const kelasHapus = jadwalAkanDihapus.kelas;
    hapusJadwal(jadwalAkanDihapus.id);
    setJadwalAkanDihapus(null);
    setPesanSukses(`Jadwal ${mapelHapus} (${kelasHapus}) berhasil dihapus.`);
    setTimeout(() => setPesanSukses(null), 3000);
  }

  // Search & Combobox Dropdown State
  const [dropdownBuka, setDropdownBuka] = useState(false);
  const [cariGuru, setCariGuru] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownBuka(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentIndex = daftarGuru.findIndex((g) => g.id === (guruAktif?.id ?? ""));

  function keGuruSebelumnya() {
    if (daftarGuru.length === 0) return;
    const prevIdx = (currentIndex - 1 + daftarGuru.length) % daftarGuru.length;
    gantiGuruAktif(daftarGuru[prevIdx].id);
  }

  function keGuruBerikutnya() {
    if (daftarGuru.length === 0) return;
    const nextIdx = (currentIndex + 1) % daftarGuru.length;
    gantiGuruAktif(daftarGuru[nextIdx].id);
  }

  const guruTersaring = useMemo(() => {
    if (!cariGuru.trim()) return daftarGuru;
    const q = cariGuru.toLowerCase();
    return daftarGuru.filter(
      (g) =>
        g.nama.toLowerCase().includes(q) ||
        g.mapel.some((m) => m.toLowerCase().includes(q))
    );
  }, [daftarGuru, cariGuru]);

  const jadwalGuruAktif = useMemo(
    () => jadwal.filter((j) => j.guruId === (guruAktif?.id ?? "")),
    [jadwal, guruAktif]
  );

  function jamMingguGuru(id: string) {
    return jadwal.filter((j) => j.guruId === id).length * JAM_PER_SLOT;
  }

  const jamMinggu = jamMingguGuru(guruAktif?.id ?? "");
  const progres = Math.min(100, Math.round((jamMinggu / TARGET_JAM_MINGGU) * 100));
  const kurang = Math.max(0, TARGET_JAM_MINGGU - jamMinggu);

  function gantiGuruAktif(id: string) {
    setGuruAktifId(id);
    const g = daftarGuru.find((x) => x.id === id);
    if (g) {
      setMapel(g.mapel[0] ?? "");
    }
    setPesanError(null);
  }

  function pilihSelDariGrid(hariSel: string, idx: number) {
    setHari(hariSel);
    setSlotIndex(idx);
    setPesanError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!guruAktif || !mapel || !kelas) return;

    const slot = SLOT_WAKTU[slotIndex];
    const bentrok = cekBentrok(jadwal, {
      guruId: guruAktif.id,
      kelas,
      hari,
      jamMulai: slot.mulai,
    });

    if (bentrok) {
      setPesanError(bentrok);
      return;
    }

    tambahJadwal({
      guruId: guruAktif.id,
      mapel,
      kelas,
      hari,
      jamMulai: slot.mulai,
      jamSelesai: slot.selesai,
    });

    setPesanError(null);
    setPesanSukses(`Jadwal ${mapel} (${kelas}) berhasil ditambahkan!`);
    setTimeout(() => setPesanSukses(null), 3000);
  }

  async function unduhXLSX() {
    const XLSX = await import("xlsx");
    const rows: string[][] = [["Hari", ...SLOT_WAKTU.map(labelSlot)]];
    HARI.forEach((h) => {
      const baris = [h];
      SLOT_WAKTU.forEach((slot) => {
        const entry = jadwalGuruAktif.find(
          (j) => j.hari === h && j.jamMulai === slot.mulai
        );
        baris.push(entry ? `${entry.mapel} — ${entry.kelas}` : "");
      });
      rows.push(baris);
    });
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws["!cols"] = [{ wch: 10 }, ...SLOT_WAKTU.map(() => ({ wch: 22 }))];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Jadwal");
    XLSX.writeFile(
      wb,
      `jadwal-${(guruAktif?.nama ?? "guru").replace(/\s+/g, "-")}.xlsx`
    );
  }

  async function unduhPDF() {
    const { default: jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;

    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(14);
    doc.text(`Jadwal Mengajar — ${guruAktif?.nama ?? ""}`, 14, 15);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(
      `${jamMinggu} jam / minggu (Target wajib: ${TARGET_JAM_MINGGU} jam)`,
      14,
      21
    );

    const head = [["Hari", ...SLOT_WAKTU.map(labelSlot)]];
    const body = HARI.map((h) => [
      h,
      ...SLOT_WAKTU.map((slot) => {
        const entry = jadwalGuruAktif.find(
          (j) => j.hari === h && j.jamMulai === slot.mulai
        );
        return entry ? `${entry.mapel}\n${entry.kelas}` : "";
      }),
    ]);

    autoTable(doc, {
      head,
      body,
      startY: 27,
      styles: { fontSize: 8, halign: "center", cellPadding: 3 },
      headStyles: { fillColor: [15, 41, 66] },
    });

    doc.save(`jadwal-${(guruAktif?.nama ?? "guru").replace(/\s+/g, "-")}.pdf`);
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-navy-950 md:text-3xl">
          Penjadwalan Mengajar
        </h1>
        <p className="text-xs text-muted-foreground">
          Kelola bagan jadwal pelajaran per guru secara terstruktur dan terintegrasi
        </p>
      </div>

      {/* Selector Toolbar - User-friendly Combobox for Long Teacher Lists */}
      <div className="rounded-xl border border-border bg-white p-3.5 shadow-2xs">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-navy-950 shrink-0">
              <Users size={16} className="text-navy-700" />
              <span>Pilih Guru:</span>
            </div>

            {/* Searchable Dropdown Combobox */}
            <div className="relative flex-1 min-w-[260px] max-w-md" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownBuka((v) => !v)}
                className="flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-slate-50/80 px-3 py-2 text-left text-xs transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-navy-900/20"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy-900 text-[10px] font-bold text-white">
                    {guruAktif?.nama.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-navy-950">{guruAktif?.nama}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{guruAktif?.mapel.join(", ")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={jamMinggu >= TARGET_JAM_MINGGU ? "hadir" : "alpha"} className="text-[10px] py-0 px-1.5 font-mono">
                    {jamMinggu} jam
                  </Badge>
                  <ChevronDown size={14} className={`text-slate-500 transition-transform ${dropdownBuka ? "rotate-180" : ""}`} />
                </div>
              </button>

              {/* Popover Dropdown List with Live Filter */}
              {dropdownBuka && (
                <div className="absolute left-0 top-full z-50 mt-1.5 w-full min-w-[320px] sm:min-w-[380px] rounded-xl border border-border bg-white p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in-0 zoom-in-95">
                  <div className="relative mb-2">
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      autoFocus
                      value={cariGuru}
                      onChange={(e) => setCariGuru(e.target.value)}
                      placeholder="Ketik nama guru atau mata pelajaran..."
                      className="w-full rounded-lg border border-border bg-slate-50/80 py-1.5 pl-8 pr-3 text-xs text-navy-950 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-navy-900"
                    />
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 pr-1">
                    {guruTersaring.length === 0 ? (
                      <div className="py-6 text-center text-xs text-muted-foreground">
                        Tidak ada guru yang sesuai dengan pencarian &quot;{cariGuru}&quot;
                      </div>
                    ) : (
                      guruTersaring.map((g) => {
                        const jam = jamMingguGuru(g.id);
                        const cukup = jam >= TARGET_JAM_MINGGU;
                        const aktif = g.id === guruAktif?.id;

                        return (
                          <button
                            key={g.id}
                            type="button"
                            onClick={() => {
                              gantiGuruAktif(g.id);
                              setDropdownBuka(false);
                              setCariGuru("");
                            }}
                            className={`flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                              aktif
                                ? "bg-navy-50 font-semibold text-navy-950 ring-1 ring-inset ring-navy-900/20"
                                : "hover:bg-slate-50 text-slate-700"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                                  aktif ? "bg-navy-900 text-white" : "bg-slate-200 text-slate-700"
                                }`}
                              >
                                {g.nama.slice(0, 2).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-navy-950 font-medium">{g.nama}</p>
                                <p className="truncate text-[11px] text-muted-foreground">
                                  {g.mapel.join(", ")}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 text-right">
                              <div className="text-right">
                                <span className="font-mono text-[11px] font-bold text-navy-900 block">
                                  {jam}j
                                </span>
                                <span className={`text-[10px] font-medium ${cukup ? "text-emerald-600" : "text-amber-600"}`}>
                                  {cukup ? "Tercapai" : `Kurang ${TARGET_JAM_MINGGU - jam}j`}
                                </span>
                              </div>
                              {aktif && <Check size={15} className="text-navy-900 shrink-0" />}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>

                  <div className="mt-2 border-t border-border pt-2 px-1 text-[11px] text-muted-foreground flex justify-between items-center">
                    <span>Menampilkan {guruTersaring.length} dari {daftarGuru.length} guru</span>
                    {cariGuru && (
                      <button
                        type="button"
                        onClick={() => setCariGuru("")}
                        className="text-navy-700 hover:underline text-[10px]"
                      >
                        Reset Filter
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Prev / Next Buttons */}
            <div className="flex items-center gap-1 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={keGuruSebelumnya}
                title="Guru Sebelumnya"
              >
                <ChevronLeft size={14} />
              </Button>
              <span className="text-[11px] text-muted-foreground px-1 font-mono font-medium">
                {currentIndex + 1} / {daftarGuru.length}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={keGuruBerikutnya}
                title="Guru Berikutnya"
              >
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>

          {/* Quick Info / Export Button Group */}
          <div className="flex items-center gap-2 shrink-0 border-t lg:border-t-0 pt-2 lg:pt-0 border-border">
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Total <strong className="text-navy-950 font-bold">{daftarGuru.length}</strong> guru terdaftar
            </span>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <Button
              size="sm"
              variant="outline"
              onClick={unduhXLSX}
              className="h-8 text-xs gap-1.5 text-navy-900 hover:bg-navy-50"
            >
              <Download size={13} />
              <span>Excel</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={unduhPDF}
              className="h-8 text-xs gap-1.5 text-navy-900 hover:bg-navy-50"
            >
              <FileText size={13} />
              <span>PDF</span>
            </Button>
          </div>
        </div>
      </div>

      {guruAktif && (
        <>
          {/* Card Progres Target Guru Aktif */}
          <Card className="border-none bg-gradient-to-r from-navy-950 via-navy-900 to-navy-800 text-white shadow-md">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <Badge
                    variant="outline"
                    className="border-white/20 bg-white/10 text-white font-medium text-[11px]"
                  >
                    Guru Terpilih
                  </Badge>
                  <h2 className="font-display text-xl font-bold mt-1 text-white md:text-2xl">
                    {guruAktif.nama}
                  </h2>
                  <p className="font-mono text-sm text-navy-200 mt-0.5">
                    {jamMinggu} / {TARGET_JAM_MINGGU} jam wajib ({progres}%)
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={unduhXLSX}
                    className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                  >
                    <Download size={14} className="mr-1.5" />
                    Excel (.xlsx)
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={unduhPDF}
                    className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                  >
                    <FileText size={14} className="mr-1.5" />
                    PDF
                  </Button>
                </div>
              </div>

              <div className="mt-4">
                <Progress
                  value={progres}
                  className="h-2 bg-white/20"
                  indicatorClassName={
                    progres >= 100 ? "bg-emerald-400" : "bg-amber-400"
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Tabel Grid Jadwal Full Width */}
          <Card className="border-border bg-white shadow-xs overflow-hidden">
            <CardHeader className="border-b border-border py-4 px-6">
              <CardTitle className="text-base font-bold text-navy-950">
                Matriks Jadwal Mingguan
              </CardTitle>
              <CardDescription className="text-xs">
                Klik kotak kosong untuk mengisi jadwal atau klik ikon hapus untuk membatalkan
              </CardDescription>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-sm">
                <thead>
                  <tr className="bg-navy-50/70 text-xs text-navy-900 border-b border-border">
                    <th className="w-28 border-r border-border px-4 py-3 text-left font-bold">
                      Hari
                    </th>
                    {SLOT_WAKTU.map((slot, i) => (
                      <th
                        key={i}
                        className="px-4 py-3 text-center font-bold"
                      >
                        {labelSlot(slot)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {HARI.map((h) => (
                    <tr key={h} className="hover:bg-slate-50/40">
                      <td className="border-r border-border bg-slate-50/60 px-4 py-3 font-semibold text-navy-950 text-xs">
                        {h}
                      </td>
                      {SLOT_WAKTU.map((slot, i) => {
                        const entry = jadwalGuruAktif.find(
                          (j) => j.hari === h && j.jamMulai === slot.mulai
                        );
                        return (
                          <td key={i} className="p-2 text-center align-middle">
                            {entry ? (
                              <div className="group relative rounded-lg border border-navy-200 bg-navy-50/90 p-2.5 text-left shadow-2xs">
                                <p className="font-bold text-xs text-navy-950">
                                  {entry.mapel}
                                </p>
                                <p className="text-[11px] font-medium text-navy-600">
                                  {entry.kelas}
                                </p>
                                <button
                                  type="button"
                                  onClick={() => setJadwalAkanDihapus(entry)}
                                  aria-label="Hapus jadwal"
                                  className="absolute -right-1.5 -top-1.5 hidden h-5 w-5 place-items-center rounded-full bg-rose-600 text-white shadow-xs group-hover:grid"
                                >
                                  <Trash2 size={11} />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => pilihSelDariGrid(h, i)}
                                className="grid h-12 w-full place-items-center rounded-lg border border-dashed border-slate-200 text-slate-300 transition-colors hover:border-navy-400 hover:bg-navy-50/40 hover:text-navy-700"
                                title={`Tambahkan di ${h} ${labelSlot(slot)}`}
                              >
                                +
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Notification Messages */}
          {pesanSukses && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5 text-xs font-medium text-emerald-800 animate-fade-up">
              ✓ {pesanSukses}
            </div>
          )}

          {pesanError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs font-medium text-rose-800 animate-fade-up">
              ✕ {pesanError}
            </div>
          )}

          {/* Form Tambah Slot Jadwal */}
          <Card className="border-border bg-white shadow-xs">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center gap-2 border-b border-border pb-3">
                  <CalendarPlus size={18} className="text-navy-800" />
                  <h3 className="font-display text-base font-bold text-navy-950">
                    Tambah Jam Mengajar untuk {guruAktif.nama}
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="mapelSelect">Mata Pelajaran</Label>
                    <select
                      id="mapelSelect"
                      value={mapel}
                      onChange={(e) => setMapel(e.target.value)}
                      className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none focus:border-navy-600"
                    >
                      {(guruAktif.mapel ?? []).map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="kelasSelect">Kelas Sasaran</Label>
                    <select
                      id="kelasSelect"
                      value={kelas}
                      onChange={(e) => setKelas(e.target.value)}
                      className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none focus:border-navy-600"
                    >
                      {daftarKelas.map((k) => (
                        <option key={k.id} value={k.nama}>
                          {k.nama}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="hariSelect">Hari</Label>
                    <select
                      id="hariSelect"
                      value={hari}
                      onChange={(e) => setHari(e.target.value)}
                      className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none focus:border-navy-600"
                    >
                      {HARI.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="slotSelect">Jam Pelajaran</Label>
                    <select
                      id="slotSelect"
                      value={slotIndex}
                      onChange={(e) => setSlotIndex(Number(e.target.value))}
                      className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none focus:border-navy-600"
                    >
                      {SLOT_WAKTU.map((slot, i) => (
                        <option key={i} value={i}>
                          {labelSlot(slot)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-border">
                  <Button
                    type="submit"
                    className="gap-2 bg-navy-900 text-white hover:bg-navy-800"
                  >
                    <CalendarPlus size={16} />
                    Tambahkan ke Jadwal
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </>
      )}

      {/* Modal Konfirmasi Hapus Jadwal */}
      <Dialog
        open={!!jadwalAkanDihapus}
        onOpenChange={(open) => {
          if (!open) setJadwalAkanDihapus(null);
        }}
      >
        <DialogContent
          onClose={() => setJadwalAkanDihapus(null)}
          className="sm:max-w-md"
        >
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              <AlertTriangle size={20} />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-base font-bold text-navy-950">
                Konfirmasi Hapus Jadwal
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Apakah Anda yakin ingin menghapus jadwal mengajar berikut? Tindakan ini tidak dapat dibatalkan.
              </DialogDescription>
            </div>
          </div>

          {jadwalAkanDihapus && (
            <div className="mt-4 rounded-lg border border-border bg-slate-50/80 p-3.5 text-xs space-y-2">
              <div className="flex justify-between items-center py-0.5">
                <span className="text-muted-foreground">Guru:</span>
                <span className="font-semibold text-navy-950">{guruAktif?.nama}</span>
              </div>
              <div className="flex justify-between items-center py-0.5 border-t border-slate-200/60">
                <span className="text-muted-foreground">Mata Pelajaran:</span>
                <span className="font-semibold text-navy-950">{jadwalAkanDihapus.mapel}</span>
              </div>
              <div className="flex justify-between items-center py-0.5 border-t border-slate-200/60">
                <span className="text-muted-foreground">Kelas:</span>
                <Badge variant="outline" className="font-bold text-navy-900 bg-white">
                  {jadwalAkanDihapus.kelas}
                </Badge>
              </div>
              <div className="flex justify-between items-center py-0.5 border-t border-slate-200/60">
                <span className="text-muted-foreground">Waktu Mengajar:</span>
                <span className="font-semibold text-navy-900 font-mono">
                  {jadwalAkanDihapus.hari}, {jadwalAkanDihapus.jamMulai}–{jadwalAkanDihapus.jamSelesai}
                </span>
              </div>
            </div>
          )}

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setJadwalAkanDihapus(null)}
              className="w-full sm:w-auto text-xs"
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={konfirmasiHapus}
              className="w-full sm:w-auto text-xs gap-1.5 bg-rose-600 text-white hover:bg-rose-700"
            >
              <Trash2 size={13} />
              <span>Ya, Hapus Jadwal</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
