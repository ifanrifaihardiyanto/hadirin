"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BookOpen,
  Download,
  FileText,
  Video,
  Presentation,
  File,
  Search,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
  FolderOpen
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface MateriItem {
  id: string | number;
  judul: string;
  mapel?: string;
  mata_pelajaran?: { nama: string };
  guruNama?: string;
  guru?: { nama: string };
  tipe?: string;
  ukuranFile?: string;
  tanggalUpload?: string;
  url?: string;
  deskripsi?: string;
}

export default function SiswaMateriPage() {
  const { currentUser } = useStore();

  const [materiList, setMateriList] = useState<MateriItem[]>([]);
  const [mapelList, setMapelList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [filterMapel, setFilterMapel] = useState("SEMUA");

  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const [materiRes, mapelRes] = await Promise.allSettled([
        api.getMateriList(),
        api.getMapelList(),
      ]);

      if (materiRes.status === "fulfilled" && materiRes.value?.data) {
        const raw = Array.isArray(materiRes.value.data) ? materiRes.value.data : [];
        if (raw.length > 0) {
          setMateriList(raw);
        } else {
          // Fallback materi
          setMateriList([
            {
              id: 1,
              judul: "Modul Lengkap: Persamaan Kuadrat & Fungsi Rasional",
              mapel: "Matematika Peminatan",
              guruNama: "Sari Wulandari, S.Pd",
              tipe: "PDF",
              ukuranFile: "2.4 MB",
              tanggalUpload: "22 Juli 2026",
            },
            {
              id: 2,
              judul: "Video Pembahasan: Dinamika Gerak Lurus & Gesekan",
              mapel: "Fisika",
              guruNama: "Budi Santoso, S.Pd",
              tipe: "VIDEO",
              ukuranFile: "45.0 MB",
              tanggalUpload: "20 Juli 2026",
            },
            {
              id: 3,
              judul: "Slide Presentasi: Analytical Exposition Texts Structure",
              mapel: "Bahasa Inggris",
              guruNama: "Rina Marlina, M.Pd",
              tipe: "SLIDE",
              ukuranFile: "5.1 MB",
              tanggalUpload: "19 Juli 2026",
            },
            {
              id: 4,
              judul: "Diktat Praktikum Algoritma dan Pemrograman Python",
              mapel: "Informatika",
              guruNama: "Hendra Setiawan, S.Kom",
              tipe: "PDF",
              ukuranFile: "3.8 MB",
              tanggalUpload: "18 Juli 2026",
            },
          ]);
        }
      }

      if (mapelRes.status === "fulfilled" && mapelRes.value?.data) {
        const rawMapel = Array.isArray(mapelRes.value.data) ? mapelRes.value.data : [];
        setMapelList(rawMapel);
      }
    } catch (err) {
      console.error("Gagal memuat materi ajar:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = materiList.filter((m) => {
    const mapelName = m.mata_pelajaran?.nama || m.mapel || "";
    const guruName = m.guru?.nama || m.guruNama || "";
    const matchSearch =
      m.judul.toLowerCase().includes(search.toLowerCase()) ||
      guruName.toLowerCase().includes(search.toLowerCase()) ||
      mapelName.toLowerCase().includes(search.toLowerCase());

    const matchMapel = filterMapel === "SEMUA" || mapelName === filterMapel;
    return matchSearch && matchMapel;
  });

  function getIcon(tipe?: string) {
    switch (tipe?.toUpperCase()) {
      case "PDF":
        return <FileText size={20} className="text-rose-600" />;
      case "VIDEO":
        return <Video size={20} className="text-blue-600" />;
      case "SLIDE":
        return <Presentation size={20} className="text-amber-600" />;
      default:
        return <File size={20} className="text-slate-600" />;
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-navy-900 text-white shadow-xs">
              <BookOpen size={19} />
            </span>
            <h1 className="font-display text-2xl font-bold tracking-tight text-navy-950 md:text-3xl">
              Materi &amp; Bahan Ajar
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Unduh modul belajar, ringkasan materi, dan video pembelajaran untuk kelas {currentUser?.jabatan?.split("(")[0] || "X IPA 1"}
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadData(true)}
            disabled={refreshing || loading}
            className="text-xs h-9 gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin text-navy-600" : ""} />
            <span>Muat Ulang</span>
          </Button>

          <div className="relative w-48 sm:w-56">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari materi..."
              className="h-9 pl-9 text-xs rounded-xl bg-white shadow-2xs"
            />
          </div>

          <select
            value={filterMapel}
            onChange={(e) => setFilterMapel(e.target.value)}
            className="h-9 rounded-xl border border-input bg-white px-3 text-xs text-slate-700 outline-none shadow-2xs font-medium"
          >
            <option value="SEMUA">Semua Mapel</option>
            {mapelList.map((m) => (
              <option key={m.id} value={m.nama}>
                {m.nama}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, idx) => (
            <Card key={`skel-materi-${idx}`} className="border-border bg-white shadow-xs p-5 animate-pulse space-y-4">
              <div className="flex justify-between items-center">
                <div className="h-10 w-10 bg-slate-200 rounded-xl"></div>
                <div className="h-5 w-20 bg-slate-200 rounded"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-28 bg-slate-200 rounded"></div>
                <div className="h-5 w-full bg-slate-200 rounded"></div>
                <div className="h-3.5 w-3/4 bg-slate-100 rounded"></div>
              </div>
              <div className="h-8 w-28 ml-auto bg-slate-200 rounded-xl pt-2"></div>
            </Card>
          ))
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-500 bg-white border border-dashed rounded-2xl">
            <FolderOpen className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-slate-700">Tidak ada materi ajar yang ditemukan</p>
            <p className="text-xs text-slate-400">Silakan sesuaikan kata kunci pencarian atau pilih mapel lain.</p>
          </div>
        ) : (
          filtered.map((m) => {
            const mapelNama = m.mata_pelajaran?.nama || m.mapel || "Mata Pelajaran";
            const guruNama = m.guru?.nama || m.guruNama || "Dewan Guru";
            const tipeFile = m.tipe || "PDF";
            const ukuran = m.ukuranFile || "3.5 MB";
            const tanggal = m.tanggalUpload || "Terbaru";

            return (
              <Card key={m.id} className="border-border bg-white shadow-xs hover:border-navy-300 transition-all flex flex-col justify-between">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 border border-slate-200">
                      {getIcon(tipeFile)}
                    </span>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {tipeFile} &bull; {ukuran}
                    </Badge>
                  </div>

                  <div>
                    <Badge className="bg-navy-50 text-navy-800 border-navy-100 text-[10px] font-semibold mb-1">
                      {mapelNama}
                    </Badge>
                    <h3 className="font-bold text-sm text-navy-950 leading-snug">{m.judul}</h3>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>{guruNama}</span>
                    <span>{tanggal}</span>
                  </div>
                </CardContent>

                <div className="border-t border-slate-100 p-3.5 bg-slate-50/50 flex items-center justify-end">
                  <Button
                    size="sm"
                    onClick={() => alert(`Mengunduh berkas modul pembelajaran: ${m.judul}`)}
                    className="h-8 bg-navy-900 hover:bg-navy-800 text-white rounded-xl text-xs gap-1.5 shadow-2xs font-semibold cursor-pointer"
                  >
                    <Download size={13} />
                    Unduh Modul
                  </Button>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
