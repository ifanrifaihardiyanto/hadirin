"use client";

import { useEffect, useState } from "react";
import { CalendarClock, Users, BookOpen, RefreshCw, AlertCircle } from "lucide-react";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface JadwalApiItem {
  id: number;
  hari: string;
  jam_mulai: string;
  jam_selesai: string;
  ruangan?: string;
  kelas?: {
    id: number;
    nama: string;
    tingkat: string;
    jurusan: string;
  };
  mapel?: {
    id: number;
    nama: string;
    kode: string;
  };
}

interface KelasGrouped {
  kelasId: number;
  kelas: string;
  mapel: string;
  ruangan: string;
  jadwal: { hari: string; jam: string }[];
}

export default function KelasPage() {
  const { currentUser } = useStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [daftarKelas, setDaftarKelas] = useState<KelasGrouped[]>([]);

  // On-demand fetch dari endpoint GET /api/v1/jadwal
  const loadJadwalKelas = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getJadwalList();
      const rawJadwal: JadwalApiItem[] = res?.data || [];

      // Kelompokkan jadwal per kelas dan mata pelajaran
      const dikelompokkan = new Map<string, KelasGrouped>();

      for (const j of rawJadwal) {
        const kelasNama = j.kelas?.nama || "Kelas X";
        const mapelNama = j.mapel?.nama || "Mata Pelajaran";
        const key = `${kelasNama}__${mapelNama}`;
        const jamTeks = `${j.jam_mulai?.substring(0, 5) || "07:00"}–${j.jam_selesai?.substring(0, 5) || "08:30"}`;

        const existing = dikelompokkan.get(key);
        if (existing) {
          existing.jadwal.push({ hari: j.hari, jam: jamTeks });
        } else {
          dikelompokkan.set(key, {
            kelasId: j.kelas?.id || 1,
            kelas: kelasNama,
            mapel: mapelNama,
            ruangan: j.ruangan || "R-101",
            jadwal: [{ hari: j.hari, jam: jamTeks }],
          });
        }
      }

      setDaftarKelas(Array.from(dikelompokkan.values()));
    } catch (err: any) {
      console.warn("Gagal memuat jadwal kelas:", err?.message);
      setError("Gagal memuat data kelas dari server database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJadwalKelas();
  }, []);

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-1">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold tracking-tight text-navy-950 md:text-3xl">
              Daftar Kelas Ajar
            </h1>
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-semibold">
              Data Real-Time Database
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {loading ? "Memuat jadwal kelas..." : `${daftarKelas.length} kelas diampu oleh ${currentUser?.nama || "Guru"} semester ini`}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadJadwalKelas}
          disabled={loading}
          className="border-slate-200 text-xs gap-1.5 cursor-pointer shadow-2xs w-fit"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          Muat Ulang
        </Button>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-2xs">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-28 rounded" />
                    <Skeleton className="h-3 w-16 rounded" />
                  </div>
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <Skeleton className="h-3 w-32 rounded" />
              <div className="border-t border-slate-100 pt-3 flex gap-2">
                <Skeleton className="h-6 w-24 rounded-md" />
                <Skeleton className="h-6 w-24 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <Card className="border-destructive/20 bg-rose-50/50">
          <CardContent className="py-8 text-center text-sm text-destructive flex flex-col items-center gap-2">
            <AlertCircle size={24} />
            <p>{error}</p>
            <Button size="sm" variant="outline" onClick={loadJadwalKelas} className="mt-2 text-xs">
              Coba Lagi
            </Button>
          </CardContent>
        </Card>
      ) : daftarKelas.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Belum ada jadwal mengajar yang tercatat di database untuk akun ini.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {daftarKelas.map((k) => (
            <Card
              key={`${k.kelas}-${k.mapel}`}
              className="border border-border transition-all duration-200 hover:border-navy-300 hover:shadow-xs bg-white rounded-2xl overflow-hidden"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-navy-50 text-navy-800">
                      <BookOpen size={18} />
                    </span>
                    <div>
                      <p className="font-display text-base font-bold text-navy-950">
                        {k.mapel}
                      </p>
                      <p className="text-xs font-semibold text-navy-600">
                        {k.kelas}
                      </p>
                    </div>
                  </div>
                  <Badge variant="navy" className="font-mono text-xs">
                    Ruang {k.ruangan}
                  </Badge>
                </div>

                <div className="mt-3.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users size={13} className="text-slate-400" />
                  <span>Kurikulum Merdeka · Aktif</span>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border pt-3">
                  {k.jadwal.map((j, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 rounded-md border border-border bg-slate-50 px-2 py-1 text-[11px] font-medium text-navy-800"
                    >
                      <CalendarClock size={11} className="text-navy-500" />
                      {j.hari} · {j.jam} WIB
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
