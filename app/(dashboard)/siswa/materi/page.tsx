"use client";

import { useState } from "react";
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
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function SiswaMateriPage() {
  const { daftarMateri, daftarMapel, currentUser } = useStore();
  const [search, setSearch] = useState("");
  const [filterMapel, setFilterMapel] = useState("SEMUA");

  const filtered = daftarMateri.filter((m) => {
    const matchSearch = m.judul.toLowerCase().includes(search.toLowerCase()) || m.guruNama.toLowerCase().includes(search.toLowerCase());
    const matchMapel = filterMapel === "SEMUA" || m.mapel === filterMapel;
    return matchSearch && matchMapel;
  });

  function getIcon(tipe: string) {
    switch (tipe) {
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
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-1">
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
          <div className="relative w-56">
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
            {daftarMapel.map((m) => (
              <option key={m.id} value={m.nama}>
                {m.nama}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((m) => (
          <Card key={m.id} className="border-border bg-white shadow-xs hover:border-navy-300 transition-all flex flex-col justify-between">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 border border-slate-200">
                  {getIcon(m.tipe)}
                </span>
                <Badge variant="outline" className="text-[10px] font-mono">
                  {m.tipe} &bull; {m.ukuranFile}
                </Badge>
              </div>

              <div>
                <Badge className="bg-navy-50 text-navy-800 border-navy-100 text-[10px] font-semibold mb-1">
                  {m.mapel}
                </Badge>
                <h3 className="font-bold text-sm text-navy-950 leading-snug">{m.judul}</h3>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>{m.guruNama}</span>
                <span>{m.tanggalUpload}</span>
              </div>
            </CardContent>

            <div className="border-t border-slate-100 p-3.5 bg-slate-50/50 flex items-center justify-end">
              <Button
                size="sm"
                onClick={() => alert("Mengunduh modul materi: " + m.judul)}
                className="h-8 bg-navy-900 hover:bg-navy-800 text-white rounded-xl text-xs gap-1.5 shadow-2xs font-semibold cursor-pointer"
              >
                <Download size={13} />
                Unduh Modul
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
