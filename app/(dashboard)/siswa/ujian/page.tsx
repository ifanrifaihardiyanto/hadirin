"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Laptop,
  Clock,
  CheckCircle2,
  AlertCircle,
  Award,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  HelpCircle,
  ArrowRight,
  Printer,
  Sparkles,
  FileText,
  Calendar,
  Lock,
  RotateCcw,
  BookOpen,
  RefreshCw,
} from "lucide-react";
import { useStore, UjianCBT } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";

interface SoalItem {
  id: number;
  nomor: number;
  pertanyaan: string;
  wacana?: string;
  opsi: { label: string; teks: string }[];
  kunci: string;
}

const BANK_SOAL_MOCK: Record<string, SoalItem[]> = {
  "cbt-1": [
    {
      id: 1,
      nomor: 1,
      pertanyaan: "Himpunan penyelesaian dari persamaan kuadrat x² - 5x + 6 = 0 adalah...",
      wacana: "Perhatikan bentuk umum persamaan kuadrat ax² + bx + c = 0 dengan pemfaktoran aljabar standar.",
      opsi: [
        { label: "A", teks: "{1, 6}" },
        { label: "B", teks: "{2, 3}" },
        { label: "C", teks: "{-2, -3}" },
        { label: "D", teks: "{-1, -6}" },
        { label: "E", teks: "{3, 5}" },
      ],
      kunci: "B",
    },
    {
      id: 2,
      nomor: 2,
      pertanyaan: "Nilai diskriminan dari fungsi kuadrat f(x) = 2x² - 4x + 3 adalah...",
      wacana: "Rumus diskriminan fungsi kuadrat adalah D = b² - 4ac.",
      opsi: [
        { label: "A", teks: "-8" },
        { label: "B", teks: "8" },
        { label: "C", teks: "-40" },
        { label: "D", teks: "40" },
        { label: "E", teks: "0" },
      ],
      kunci: "A",
    },
    {
      id: 3,
      nomor: 3,
      pertanyaan: "Jika f(x) = 3x - 2 dan g(x) = x² + 1, maka nilai dari komposisi fungsi (g ∘ f)(2) adalah...",
      wacana: "Komposisi fungsi (g ∘ f)(x) = g(f(x)). Hitung f(2) terlebih dahulu.",
      opsi: [
        { label: "A", teks: "12" },
        { label: "B", teks: "15" },
        { label: "C", teks: "17" },
        { label: "D", teks: "21" },
        { label: "E", teks: "25" },
      ],
      kunci: "C",
    },
    {
      id: 4,
      nomor: 4,
      pertanyaan: "Bentuk sederhana dari (2³ × 2⁴) / 2² adalah...",
      wacana: "Sifat eksponensial: aᵐ × aⁿ = aᵐ⁺ⁿ dan aᵐ / aⁿ = aᵐ⁻ⁿ.",
      opsi: [
        { label: "A", teks: "2⁴" },
        { label: "B", teks: "2⁵" },
        { label: "C", teks: "2⁶" },
        { label: "D", teks: "2⁷" },
        { label: "E", teks: "2⁸" },
      ],
      kunci: "B",
    },
    {
      id: 5,
      nomor: 5,
      pertanyaan: "Diketahui segitiga siku-siku ABC dengan sudut siku di B. Jika panjang AB = 6 cm dan BC = 8 cm, maka panjang sisi miring AC adalah...",
      wacana: "Gunakan teorema Pythagoras: AC² = AB² + BC².",
      opsi: [
        { label: "A", teks: "9 cm" },
        { label: "B", teks: "10 cm" },
        { label: "C", teks: "12 cm" },
        { label: "D", teks: "14 cm" },
        { label: "E", teks: "15 cm" },
      ],
      kunci: "B",
    },
  ],
  default: [
    {
      id: 1,
      nomor: 1,
      pertanyaan: "Manakah pernyataan berikut yang paling tepat mengenai karakteristik berpikir komputasional dalam literasi digital?",
      wacana: "Berpikir komputasional (computational thinking) melibatkan proses abstraksi, dekomposisi masalah, pengenalan pola, dan perancangan algoritma.",
      opsi: [
        { label: "A", teks: "Hanya berfokus pada kemampuan menulis sintaks bahasa pemrograman tingkat rendah" },
        { label: "B", teks: "Metode pemecahan masalah kompleks menjadi bagian terstruktur dan logis" },
        { label: "C", teks: "Menghafal konfigurasi perangkat keras komputer tanpa pengujian aplikasi" },
        { label: "D", teks: "Mengoperasikan spreadsheet tanpa pemahaman formula matematika" },
        { label: "E", teks: "Membatasi komunikasi hanya pada perangkat keras berbasis mainframe" },
      ],
      kunci: "B",
    },
    {
      id: 2,
      nomor: 2,
      pertanyaan: "Fungsi utama protokol HTTPS pada komunikasi website modern sekolah adalah...",
      wacana: "Keamanan data pengguna saat pertukaran paket data melalui jaringan internet publik.",
      opsi: [
        { label: "A", teks: "Mempercepat transfer video tanpa kompresi" },
        { label: "B", teks: "Mengenkripsi lalu lintas data antara klien dan server guna mencegah intersepsi data" },
        { label: "C", teks: "Menghapus cache browser secara otomatis tiap jam" },
        { label: "D", teks: "Mematikan koneksi internet jika terjadi error server" },
        { label: "E", teks: "Mengganti domain sekolah menjadi alamat IP statis secara acak" },
      ],
      kunci: "B",
    },
    {
      id: 3,
      nomor: 3,
      pertanyaan: "Algoritma pencarian biner (Binary Search) mensyaratkan kumpulan data berada dalam kondisi...",
      wacana: "Binary Search membagi dua ruang pencarian secara rekursif pada setiap iterasi.",
      opsi: [
        { label: "A", teks: "Acak tidak beraturan" },
        { label: "B", teks: "Telah terurut (sorted)" },
        { label: "C", teks: "Hanya berisikan bilangan bulat negatif" },
        { label: "D", teks: "Memiliki duplikasi data lebih dari 50%" },
        { label: "E", teks: "Berukuran tepat pangkat dua" },
      ],
      kunci: "B",
    },
  ],
};

export default function SiswaUjianPage() {
  const { daftarUjianCBT, daftarHasilCBT, submitHasilCBT, currentUser } = useStore();

  const namaSiswa = currentUser?.nama || "Ahmad Fadillah";
  const nisnSiswa = "0071239821";
  const kelasSiswa = currentUser?.jabatan || "Kelas X IPA 1";

  const [loadingCBT, setLoadingCBT] = useState(true);
  const [refreshingCBT, setRefreshingCBT] = useState(false);
  const [liveUjianList, setLiveUjianList] = useState<UjianCBT[]>([]);

  // Load CBT data from API
  const loadCBTData = async (isSilent = false) => {
    if (!isSilent) setLoadingCBT(true);
    else setRefreshingCBT(true);

    try {
      const res = await api.getCBTUjianList();
      const raw = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      if (raw.length > 0) {
        setLiveUjianList(raw.map((item: any) => ({
          id: String(item.id),
          judul: item.judul || "Ujian CBT",
          mapel: item.mapel?.nama || item.mata_pelajaran?.nama || item.mapel || "Mata Pelajaran",
          tingkatKelas: item.tingkat_kelas || item.kelas?.nama || "Kelas X",
          jenisUjian: item.jenis_ujian || "PTS",
          durasiMenit: Number(item.durasi_menit) || 60,
          jumlahSoal: Number(item.jumlah_soal) || 20,
          kkm: Number(item.kkm) || 75,
          tanggalPelaksanaan: item.tanggal_pelaksanaan || "2026-07-24",
          jamMulai: item.jam_mulai || "08:00",
          jamSelesai: item.jam_selesai || "09:00",
          tokenUjian: item.token_ujian || "CBT2026",
          status: item.status || "AKTIF",
        })));
      } else {
        setLiveUjianList(daftarUjianCBT);
      }
    } catch (err) {
      console.error("Gagal memuat ujian CBT:", err);
      setLiveUjianList(daftarUjianCBT);
    } finally {
      setLoadingCBT(false);
      setRefreshingCBT(false);
    }
  };

  useEffect(() => {
    loadCBTData();
  }, []);

  // State navigasi alur ujian: "LIST" | "EXAM" | "RESULT"
  const [examStep, setExamStep] = useState<"LIST" | "EXAM" | "RESULT">("LIST");
  const [selectedUjian, setSelectedUjian] = useState<UjianCBT | null>(null);

  // Modal input token
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [inputToken, setInputToken] = useState("");
  const [tokenError, setTokenError] = useState("");

  // Exam runtime state
  const [soalList, setSoalList] = useState<SoalItem[]>([]);
  const [currentSoalIndex, setCurrentSoalIndex] = useState(0);
  const [jawabanUser, setJawabanUser] = useState<Record<number, string>>({});
  const [raguRagu, setRaguRagu] = useState<Record<number, boolean>>({});
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [showConfirmFinishModal, setShowConfirmFinishModal] = useState(false);

  // Exam result state
  const [skorAkhir, setSkorAkhir] = useState<{
    nilai: number;
    benar: number;
    salah: number;
    totalSoal: number;
    kkm: number;
    statusKelulusan: "LULUS" | "REMEDIAL";
    durasiMenitPakai: number;
  } | null>(null);

  // Timer countdown hook
  useEffect(() => {
    if (examStep !== "EXAM" || secondsRemaining <= 0) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishExam(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examStep, secondsRemaining]);

  const formatTimer = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleOpenTokenModal = (ujian: UjianCBT) => {
    setSelectedUjian(ujian);
    setInputToken("");
    setTokenError("");
    setShowTokenModal(true);
  };

  const handleStartExam = () => {
    if (!selectedUjian) return;

    if (inputToken.trim().toUpperCase() !== selectedUjian.tokenUjian.toUpperCase()) {
      setTokenError(`Token salah! Token resmi pengawas ujian adalah: "${selectedUjian.tokenUjian}"`);
      return;
    }

    // Load soal bank
    const list = BANK_SOAL_MOCK[selectedUjian.id] || BANK_SOAL_MOCK.default;
    setSoalList(list);
    setCurrentSoalIndex(0);
    setJawabanUser({});
    setRaguRagu({});
    setSecondsRemaining(selectedUjian.durasiMenit * 60);
    setShowTokenModal(false);
    setExamStep("EXAM");
  };

  const handleSelectOpsi = (opsiLabel: string) => {
    const currentSoal = soalList[currentSoalIndex];
    if (!currentSoal) return;
    setJawabanUser((prev) => ({
      ...prev,
      [currentSoal.id]: opsiLabel,
    }));
  };

  const handleToggleRagu = () => {
    const currentSoal = soalList[currentSoalIndex];
    if (!currentSoal) return;
    setRaguRagu((prev) => ({
      ...prev,
      [currentSoal.id]: !prev[currentSoal.id],
    }));
  };

  const handleFinishExam = (forced = false) => {
    if (!selectedUjian) return;

    let benar = 0;
    soalList.forEach((s) => {
      if (jawabanUser[s.id] === s.kunci) {
        benar++;
      }
    });

    const totalSoal = soalList.length;
    const salah = totalSoal - benar;
    const nilai = Math.round((benar / totalSoal) * 100);
    const lulus = nilai >= selectedUjian.kkm;
    const durasiPakai = Math.max(1, Math.round((selectedUjian.durasiMenit * 60 - secondsRemaining) / 60));

    const resultData = {
      nilai,
      benar,
      salah,
      totalSoal,
      kkm: selectedUjian.kkm,
      statusKelulusan: (lulus ? "LULUS" : "REMEDIAL") as "LULUS" | "REMEDIAL",
      durasiMenitPakai: durasiPakai,
    };

    setSkorAkhir(resultData);

    // Kirim ke backend database
    api.submitCBTHasil({
      ujian_id: selectedUjian.id,
      siswa_id: currentUser?.id || 1,
      jawaban_benar: benar,
      jawaban_salah: salah,
      total_soal: totalSoal,
    }).catch((err) => {
      console.warn("Gagal submit hasil CBT ke server (offline fallback active):", err);
    });

    // Save to global store
    submitHasilCBT({
      ujianId: selectedUjian.id,
      siswaId: currentUser?.id || "sis-001",
      namaSiswa: namaSiswa,
      nisn: nisnSiswa,
      kelas: kelasSiswa,
      nilai: nilai,
      statusKelulusan: resultData.statusKelulusan,
      waktuMulai: selectedUjian.jamMulai,
      waktuSelesai: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      statusPengerjaan: "SELESAI",
      jawabanBenar: benar,
      jawabanSalah: salah,
    });

    setShowConfirmFinishModal(false);
    setExamStep("RESULT");
  };

  // Cek apakah siswa sudah pernah mengerjakan ujian tertentu
  const hasilSiswaMap = useMemo(() => {
    const map: Record<string, typeof daftarHasilCBT[0]> = {};
    daftarHasilCBT.forEach((h) => {
      if (h.namaSiswa === namaSiswa) {
        map[h.ujianId] = h;
      }
    });
    return map;
  }, [daftarHasilCBT, namaSiswa]);

  // Statistik navigasi soal
  const statsPengerjaan = useMemo(() => {
    let dijawab = 0;
    let ragu = 0;
    let belum = 0;

    soalList.forEach((s) => {
      const isAnswered = !!jawabanUser[s.id];
      const isRagu = !!raguRagu[s.id];
      if (isRagu) ragu++;
      if (isAnswered) dijawab++;
      else belum++;
    });

    return { dijawab, ragu, belum };
  }, [soalList, jawabanUser, raguRagu]);

  // ==========================================
  // VIEW 1: DAFTAR UJIAN CBT
  // ==========================================
  if (examStep === "LIST") {
    return (
      <div className="w-full max-w-7xl mx-auto space-y-6">
        {/* Header Portal */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-1">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold tracking-tight text-navy-950 md:text-3xl flex items-center gap-2">
                <Laptop className="text-primary h-7 w-7" />
                CBT &amp; Ujian Online Siswa
              </h1>
              <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-xs font-semibold">
                Sesi Ujian Aktif
              </Badge>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              {namaSiswa} · {kelasSiswa} · NISN: {nisnSiswa}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadCBTData(true)}
              disabled={refreshingCBT || loadingCBT}
              className="text-xs h-9 gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw size={14} className={refreshingCBT ? "animate-spin text-navy-600" : ""} />
              <span>Muat Ulang</span>
            </Button>

            <Link href="/siswa">
              <Button variant="outline" size="sm" className="gap-2 h-9 text-xs">
                <ChevronLeft size={16} />
                Kembali ke Portal
              </Button>
            </Link>
          </div>
        </div>

        {/* Petunjuk Ujian Card */}
        <Card className="border border-sky-200 bg-gradient-to-r from-sky-50/90 via-sky-50/50 to-white shadow-xs">
          <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-sky-600 text-white shrink-0 mt-0.5">
                <ShieldAlert size={20} />
              </div>
              <div className="space-y-1 text-xs text-sky-950">
                <h3 className="font-bold text-sm text-navy-950">
                  Tata Tertib &amp; Panduan Computer-Based Test (CBT)
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  1. Masukkan token ujian yang dibagikan oleh bapak/ibu guru pengawas ruangan.
                  <br />
                  2. Waktu hitung mundur ujian akan berjalan otomatis saat tombol &quot;Mulai Kerjakan&quot; ditekan.
                  <br />
                  3. Pastikan koneksi internet stabil. Lembar jawaban tersimpan otomatis secara real-time.
                </p>
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-2">
              <Badge variant="outline" className="bg-white border-sky-200 text-sky-800 text-xs py-1.5 px-3">
                Server CBT: Hadirin Cloud Engine v2.4
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Daftar Jadwal Ujian Tersedia */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-navy-950 flex items-center gap-2">
            <Calendar size={18} className="text-primary" />
            Jadwal Ujian Aktif &amp; Simulasi Belajar
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {loadingCBT ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <Card key={`skel-cbt-${idx}`} className="border-border bg-white shadow-xs p-5 animate-pulse space-y-4">
                  <div className="flex justify-between">
                    <div className="h-5 w-16 bg-slate-200 rounded"></div>
                    <div className="h-5 w-24 bg-slate-200 rounded"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-5 w-3/4 bg-slate-200 rounded"></div>
                    <div className="h-3.5 w-1/2 bg-slate-100 rounded"></div>
                  </div>
                  <div className="h-24 w-full bg-slate-100 rounded-xl"></div>
                  <div className="h-9 w-full bg-slate-200 rounded-xl"></div>
                </Card>
              ))
            ) : liveUjianList.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-500 bg-white border border-dashed rounded-2xl">
                <Laptop className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="font-semibold text-slate-700">Tidak ada jadwal ujian aktif saat ini</p>
                <p className="text-xs text-slate-400">Silakan hubungi proktor atau wali kelas Anda.</p>
              </div>
            ) : (
              liveUjianList.map((ujian) => {
              const hasilSiswa = hasilSiswaMap[ujian.id];
              const isSelesai = !!hasilSiswa && hasilSiswa.statusPengerjaan === "SELESAI";

              return (
                <Card
                  key={ujian.id}
                  className={`border transition-all flex flex-col justify-between ${
                    isSelesai
                      ? "border-emerald-200 bg-white"
                      : ujian.status === "AKTIF"
                      ? "border-primary/40 bg-white hover:border-primary shadow-xs"
                      : "border-slate-200 bg-slate-50/60 opacity-80"
                  }`}
                >
                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-mono font-bold ${
                          ujian.jenisUjian === "PTS"
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : ujian.jenisUjian === "PAS"
                            ? "bg-rose-50 text-rose-800 border-rose-200"
                            : "bg-sky-50 text-sky-800 border-sky-200"
                        }`}
                      >
                        {ujian.jenisUjian}
                      </Badge>

                      {isSelesai ? (
                        <Badge className="bg-emerald-600 text-white text-[11px] gap-1">
                          <CheckCircle2 size={12} /> Selesai Dikerjakan
                        </Badge>
                      ) : ujian.status === "AKTIF" ? (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[11px] font-semibold animate-pulse">
                          ● Sesi Dibuka
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-slate-500 text-[11px]">
                          Jadwal Selesai
                        </Badge>
                      )}
                    </div>

                    <CardTitle className="text-base font-bold text-navy-950 line-clamp-2 leading-snug">
                      {ujian.judul}
                    </CardTitle>
                    <CardDescription className="text-xs font-medium text-slate-500 mt-1">
                      {ujian.mapel} · {ujian.tingkatKelas}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="p-5 pt-0 space-y-4">
                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">Durasi Ujian:</span>
                        <span className="font-semibold text-navy-900 flex items-center gap-1 mt-0.5">
                          <Clock size={12} className="text-primary" /> {ujian.durasiMenit} Menit
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">Beban Soal:</span>
                        <span className="font-semibold text-navy-900 flex items-center gap-1 mt-0.5">
                          <BookOpen size={12} className="text-primary" /> {ujian.jumlahSoal} Butir (PG)
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">Standar KKM:</span>
                        <span className="font-semibold text-navy-900 mt-0.5 block">{ujian.kkm} Poin</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">Waktu Sesi:</span>
                        <span className="font-semibold text-navy-900 mt-0.5 block">
                          {ujian.jamMulai} - {ujian.jamSelesai}
                        </span>
                      </div>
                    </div>

                    {isSelesai ? (
                      <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-emerald-800 font-semibold block">Skor Ujian Anda:</span>
                          <span className="font-mono text-2xl font-black text-emerald-900">
                            {hasilSiswa.nilai} <span className="text-xs font-normal text-slate-600">/ 100</span>
                          </span>
                        </div>
                        <Badge
                          className={
                            hasilSiswa.statusKelulusan === "LULUS"
                              ? "bg-emerald-600 text-white text-xs"
                              : "bg-rose-600 text-white text-xs"
                          }
                        >
                          {hasilSiswa.statusKelulusan}
                        </Badge>
                      </div>
                    ) : (
                      <div className="pt-1">
                        <Button
                          className="w-full bg-navy-900 hover:bg-navy-800 text-white font-semibold gap-2 shadow-xs"
                          disabled={ujian.status !== "AKTIF"}
                          onClick={() => handleOpenTokenModal(ujian)}
                        >
                          <Lock size={15} />
                          Masuk &amp; Kerjakan Ujian
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
          </div>
        </div>

        {/* Modal Validasi Token Ujian */}
        {showTokenModal && selectedUjian && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <Card className="w-full max-w-md bg-white border border-border shadow-2xl">
              <CardHeader className="border-b border-border py-4">
                <CardTitle className="text-base font-bold text-navy-950 flex items-center gap-2">
                  <Lock size={18} className="text-primary" />
                  Konfirmasi Token Ujian CBT
                </CardTitle>
                <CardDescription className="text-xs">
                  {selectedUjian.judul} ({selectedUjian.mapel})
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Nama Siswa:</span>
                    <strong className="text-navy-950">{namaSiswa}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">NISN:</span>
                    <strong className="text-navy-950 font-mono">{nisnSiswa}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Alokasi Waktu:</span>
                    <strong className="text-emerald-700">{selectedUjian.durasiMenit} Menit Penuh</strong>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-navy-900 block">
                    Masukkan 6 Digit Token Resmi Pengawas:
                  </label>
                  <input
                    type="text"
                    value={inputToken}
                    onChange={(e) => {
                      setInputToken(e.target.value.toUpperCase());
                      setTokenError("");
                    }}
                    placeholder={`Contoh: ${selectedUjian.tokenUjian}`}
                    className="w-full text-center tracking-widest font-mono text-xl font-bold py-3 px-4 rounded-xl border-2 border-slate-300 focus:border-primary focus:outline-hidden bg-slate-50 uppercase"
                    maxLength={10}
                    autoFocus
                  />
                  <p className="text-[11px] text-slate-500 text-center">
                    Petunjuk Simulasi: Token pengawas sesi ini adalah{" "}
                    <strong className="font-mono text-primary font-bold">{selectedUjian.tokenUjian}</strong>
                  </p>
                  {tokenError && (
                    <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-lg font-medium">
                      {tokenError}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                  <Button variant="outline" size="sm" onClick={() => setShowTokenModal(false)}>
                    Batal
                  </Button>
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 px-5"
                    onClick={handleStartExam}
                  >
                    Mulai Kerjakan
                    <ArrowRight size={16} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // VIEW 2: RUANG UJIAN CBT AKTIF (EXAM ROOM)
  // ==========================================
  if (examStep === "EXAM" && selectedUjian) {
    const currentSoal = soalList[currentSoalIndex];
    const isLastSoal = currentSoalIndex === soalList.length - 1;
    const isFirstSoal = currentSoalIndex === 0;

    const isTimerWarning = secondsRemaining < 300; // < 5 menit

    return (
      <div className="w-full max-w-7xl mx-auto space-y-4">
        {/* CBT Sticky Header Engine */}
        <header className="sticky top-2 z-40 bg-navy-950 text-white rounded-2xl shadow-xl border border-navy-800 p-4 transition-all">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/20 text-emerald-400 border border-emerald-500/30">
                <Laptop size={22} />
              </div>
              <div>
                <h1 className="text-sm md:text-base font-bold text-white tracking-tight flex items-center gap-2">
                  {selectedUjian.judul}
                  <Badge className="bg-sky-500/20 text-sky-300 border-sky-400/30 text-[10px]">
                    {selectedUjian.kodeUjian}
                  </Badge>
                </h1>
                <p className="text-xs text-navy-300">
                  {namaSiswa} ({nisnSiswa}) · {kelasSiswa}
                </p>
              </div>
            </div>

            {/* Live Countdown Clock */}
            <div className="flex items-center justify-between md:justify-end gap-4">
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-mono font-black text-lg md:text-xl transition-all ${
                  isTimerWarning
                    ? "bg-rose-600/30 text-rose-300 border-rose-500 animate-pulse"
                    : "bg-navy-900 text-emerald-400 border-navy-700"
                }`}
              >
                <Clock size={18} className={isTimerWarning ? "text-rose-400" : "text-emerald-400"} />
                <span>{formatTimer(secondsRemaining)}</span>
              </div>

              <Button
                variant="destructive"
                size="sm"
                className="font-bold text-xs shadow-xs"
                onClick={() => setShowConfirmFinishModal(true)}
              >
                Selesaikan Ujian
              </Button>
            </div>
          </div>
        </header>

        {/* Layout Utama CBT: Kiri Soal, Kanan Nomor Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Kolom Soal Utama (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <Card className="border border-border bg-white shadow-xs">
              {/* Header Nomor Soal & Flag Ragu-ragu */}
              <div className="border-b border-border p-4 sm:px-6 flex items-center justify-between bg-slate-50/50 rounded-t-xl">
                <div className="flex items-center gap-2">
                  <Badge variant="navy" className="text-xs font-bold px-3 py-1">
                    Soal No. {currentSoalIndex + 1}
                  </Badge>
                  <span className="text-xs text-slate-400 font-medium">dari {soalList.length} Soal</span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleRagu}
                  className={`text-xs font-semibold gap-2 border transition-all ${
                    raguRagu[currentSoal?.id]
                      ? "bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <HelpCircle size={15} className={raguRagu[currentSoal?.id] ? "text-amber-700" : "text-slate-400"} />
                  {raguRagu[currentSoal?.id] ? "Ditandai Ragu-Ragu" : "Ragu-Ragu"}
                </Button>
              </div>

              {/* Konten Pertanyaan */}
              <CardContent className="p-6 md:p-8 space-y-6">
                {/* Wacana Stimulus jika ada */}
                {currentSoal?.wacana && (
                  <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-200 text-xs text-sky-950 space-y-1">
                    <span className="font-bold text-sky-900 uppercase tracking-wider text-[10px] block">
                      Stimulus / Petunjuk Soal:
                    </span>
                    <p className="leading-relaxed">{currentSoal.wacana}</p>
                  </div>
                )}

                {/* Teks Pertanyaan */}
                <div className="text-base font-semibold text-navy-950 leading-relaxed">
                  {currentSoal?.pertanyaan}
                </div>

                {/* Pilihan Opsi Jawaban Radio */}
                <div className="space-y-3 pt-2">
                  {currentSoal?.opsi.map((opsi) => {
                    const isSelected = jawabanUser[currentSoal.id] === opsi.label;

                    return (
                      <button
                        key={opsi.label}
                        type="button"
                        onClick={() => handleSelectOpsi(opsi.label)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-4 ${
                          isSelected
                            ? "border-primary bg-emerald-50/70 shadow-xs"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
                        }`}
                      >
                        <span
                          className={`grid h-8 w-8 place-items-center rounded-lg font-mono font-bold text-sm shrink-0 transition-all ${
                            isSelected
                              ? "bg-primary text-white"
                              : "bg-slate-100 text-slate-700 border border-slate-300"
                          }`}
                        >
                          {opsi.label}
                        </span>
                        <span
                          className={`text-sm leading-relaxed mt-1 font-medium ${
                            isSelected ? "text-navy-950 font-semibold" : "text-slate-700"
                          }`}
                        >
                          {opsi.teks}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>

              {/* Footer Tombol Navigasi Soal */}
              <div className="border-t border-border p-4 sm:px-6 flex items-center justify-between bg-slate-50/50 rounded-b-xl">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isFirstSoal}
                  onClick={() => setCurrentSoalIndex((prev) => Math.max(0, prev - 1))}
                  className="gap-2 text-xs font-semibold"
                >
                  <ChevronLeft size={16} />
                  Soal Sebelumnya
                </Button>

                {isLastSoal ? (
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 text-xs px-5 shadow-xs"
                    onClick={() => setShowConfirmFinishModal(true)}
                  >
                    <CheckCircle2 size={16} />
                    Selesai &amp; Kumpulkan
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="bg-navy-900 hover:bg-navy-800 text-white font-semibold gap-2 text-xs px-5"
                    onClick={() => setCurrentSoalIndex((prev) => Math.min(soalList.length - 1, prev + 1))}
                  >
                    Soal Selanjutnya
                    <ChevronRight size={16} />
                  </Button>
                )}
              </div>
            </Card>
          </div>

          {/* Kolom Lembar Nomor Soal (1 col) */}
          <div className="space-y-4">
            <Card className="border border-border bg-white shadow-xs">
              <CardHeader className="p-4 pb-3 border-b border-border">
                <CardTitle className="text-sm font-bold text-navy-950 flex items-center gap-2">
                  <Laptop size={16} className="text-primary" />
                  Lembar Nomor Soal
                </CardTitle>
                <CardDescription className="text-[11px]">
                  Terjawab: {statsPengerjaan.dijawab}/{soalList.length} · Ragu: {statsPengerjaan.ragu}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-4 space-y-4">
                {/* Legend Warna */}
                <div className="grid grid-cols-3 gap-1.5 text-[10px] text-slate-600 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-sm bg-emerald-600 shrink-0" />
                    <span>Terjawab</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-sm bg-amber-400 shrink-0" />
                    <span>Ragu</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-sm bg-slate-200 shrink-0" />
                    <span>Kosong</span>
                  </div>
                </div>

                {/* Grid Nomor Tombol */}
                <div className="grid grid-cols-5 gap-2">
                  {soalList.map((s, idx) => {
                    const isCurrent = idx === currentSoalIndex;
                    const isAnswered = !!jawabanUser[s.id];
                    const isRagu = !!raguRagu[s.id];

                    let colorClass = "bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200";
                    if (isRagu) {
                      colorClass = "bg-amber-400 text-amber-950 font-bold border-amber-500 shadow-xs";
                    } else if (isAnswered) {
                      colorClass = "bg-emerald-600 text-white font-bold border-emerald-700 shadow-xs";
                    }

                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setCurrentSoalIndex(idx)}
                        className={`h-10 rounded-lg text-xs font-mono font-bold transition-all border flex flex-col items-center justify-center relative ${colorClass} ${
                          isCurrent ? "ring-2 ring-navy-950 ring-offset-2 scale-105" : ""
                        }`}
                      >
                        <span>{idx + 1}</span>
                        {isAnswered && (
                          <span className="text-[9px] -mt-1 font-sans opacity-90">{jawabanUser[s.id]}</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2">
                  <Button
                    variant="outline"
                    className="w-full text-xs font-bold text-rose-700 border-rose-200 hover:bg-rose-50"
                    onClick={() => setShowConfirmFinishModal(true)}
                  >
                    Kumpulkan Ujian Sekarang
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Modal Konfirmasi Pengumpulan Ujian */}
        {showConfirmFinishModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <Card className="w-full max-w-md bg-white border border-border shadow-2xl">
              <CardHeader className="border-b border-border py-4">
                <CardTitle className="text-base font-bold text-navy-950 flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-600" />
                  Konfirmasi Pengumpulan Lembar Jawaban
                </CardTitle>
                <CardDescription className="text-xs">
                  Pastikan seluruh jawaban Anda telah ditinjau kembali dengan teliti.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                    <span className="text-[10px] text-emerald-800 font-semibold block">Terjawab:</span>
                    <span className="font-mono text-xl font-black text-emerald-900">{statsPengerjaan.dijawab}</span>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <span className="text-[10px] text-amber-800 font-semibold block">Ragu-ragu:</span>
                    <span className="font-mono text-xl font-black text-amber-900">{statsPengerjaan.ragu}</span>
                  </div>
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-3">
                    <span className="text-[10px] text-rose-800 font-semibold block">Belum Diisi:</span>
                    <span className="font-mono text-xl font-black text-rose-900">{statsPengerjaan.belum}</span>
                  </div>
                </div>

                {statsPengerjaan.belum > 0 && (
                  <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 p-3 rounded-xl flex items-center gap-2">
                    <AlertCircle size={16} className="shrink-0" />
                    Terdapat {statsPengerjaan.belum} butir soal yang belum Anda jawab!
                  </p>
                )}

                <p className="text-xs text-slate-600 text-center leading-relaxed">
                  Setelah mengumpulkan, sesi ujian Anda akan ditutup dan nilai akan langsung diproses oleh server CBT.
                </p>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                  <Button variant="outline" size="sm" onClick={() => setShowConfirmFinishModal(false)}>
                    Kembali Periksa
                  </Button>
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 px-5"
                    onClick={() => handleFinishExam(false)}
                  >
                    Ya, Kumpulkan Jawaban
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // VIEW 3: HASIL & SKOR UJIAN INSTAN
  // ==========================================
  if (examStep === "RESULT" && skorAkhir && selectedUjian) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <Card className="border border-border bg-white shadow-lg overflow-hidden">
          {/* Header Banner */}
          <div
            className={`p-6 md:p-8 text-white ${
              skorAkhir.statusKelulusan === "LULUS"
                ? "bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800"
                : "bg-gradient-to-r from-rose-800 via-rose-700 to-orange-800"
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <Badge className="bg-white/20 text-white border-white/30 text-xs font-semibold mb-2">
                  Hasil Evaluasi CBT Online
                </Badge>
                <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">
                  {skorAkhir.statusKelulusan === "LULUS"
                    ? "Selamat! Anda Dinyatakan Lulus Ujian"
                    : "Perlu Peningkatan / Mengikuti Remedial"}
                </h1>
                <p className="text-xs text-emerald-100">
                  {selectedUjian.judul} · {selectedUjian.mapel}
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-xs p-4 rounded-2xl border border-white/20 text-center shrink-0">
                <span className="text-[11px] text-emerald-100 uppercase font-semibold block tracking-wider">
                  Nilai Akhir Ujian
                </span>
                <span className="font-mono text-4xl md:text-5xl font-black text-white">{skorAkhir.nilai}</span>
                <span className="text-xs text-white/80 block mt-1">Standar KKM: {skorAkhir.kkm}</span>
              </div>
            </div>
          </div>

          <CardContent className="p-6 md:p-8 space-y-6">
            {/* 4 Kartu Metrik Rincian */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                <span className="text-[11px] text-slate-500 font-semibold block">Total Butir Soal</span>
                <span className="font-mono text-2xl font-bold text-navy-950 mt-1 block">
                  {skorAkhir.totalSoal} Soal
                </span>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                <span className="text-[11px] text-emerald-700 font-semibold block">Jawaban Benar</span>
                <span className="font-mono text-2xl font-bold text-emerald-900 mt-1 block">
                  {skorAkhir.benar} Soal
                </span>
              </div>
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-center">
                <span className="text-[11px] text-rose-700 font-semibold block">Jawaban Salah</span>
                <span className="font-mono text-2xl font-bold text-rose-900 mt-1 block">
                  {skorAkhir.salah} Soal
                </span>
              </div>
              <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 text-center">
                <span className="text-[11px] text-sky-700 font-semibold block">Waktu Selesai</span>
                <span className="font-mono text-2xl font-bold text-sky-900 mt-1 block">
                  {skorAkhir.durasiMenitPakai} Menit
                </span>
              </div>
            </div>

            {/* Identitas Peserta Resmi */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3 text-xs">
              <h3 className="font-bold text-navy-950 text-sm flex items-center gap-2">
                <Award size={16} className="text-primary" />
                Bukti Verifikasi Pengerjaan Siswa
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-600">
                <div>
                  <span className="text-slate-400 block text-[10px]">Nama Peserta Didik:</span>
                  <strong className="text-navy-950">{namaSiswa}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">NISN / Nomor Induk:</span>
                  <strong className="text-navy-950 font-mono">{nisnSiswa}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Kelas &amp; Rombel:</span>
                  <strong className="text-navy-950">{kelasSiswa}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Kode Dokumen Ujian:</span>
                  <strong className="text-navy-950 font-mono">{selectedUjian.kodeUjian}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Waktu Pengumpulan:</span>
                  <strong className="text-navy-950">
                    {new Date().toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}{" "}
                    (Tepat Waktu)
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Status Integrasi:</span>
                  <strong className="text-emerald-700">Tersinkron ke Guru Pengampu &amp; E-Rapor</strong>
                </div>
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border">
              <Button
                variant="outline"
                className="gap-2 text-xs font-semibold w-full sm:w-auto"
                onClick={() => window.print()}
              >
                <Printer size={16} />
                Cetak Lembar Nilai
              </Button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="gap-2 text-xs font-semibold w-full sm:w-auto"
                  onClick={() => setExamStep("LIST")}
                >
                  <RotateCcw size={16} />
                  Kembali ke Daftar Ujian
                </Button>
                <Link href="/siswa" className="w-full sm:w-auto">
                  <Button className="bg-navy-900 hover:bg-navy-800 text-white gap-2 text-xs font-semibold w-full">
                    Kembali ke Beranda Siswa
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
