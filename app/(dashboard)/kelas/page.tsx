"use client";

import { CalendarClock, Users, BookOpen } from "lucide-react";
import { useStore, CURRENT_GURU_ID } from "@/lib/store";
import { kelasSeluruhSekolah } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function KelasPage() {
  const { jadwal } = useStore();

  const jadwalGuru = jadwal.filter((j) => j.guruId === CURRENT_GURU_ID);

  const dikelompokkan = new Map<
    string,
    { kelas: string; mapel: string; jadwal: { hari: string; jam: string }[] }
  >();

  for (const j of jadwalGuru) {
    const key = `${j.kelas}__${j.mapel}`;
    const existing = dikelompokkan.get(key);
    const jamTeks = `${j.jamMulai}–${j.jamSelesai}`;
    if (existing) {
      existing.jadwal.push({ hari: j.hari, jam: jamTeks });
    } else {
      dikelompokkan.set(key, {
        kelas: j.kelas,
        mapel: j.mapel,
        jadwal: [{ hari: j.hari, jam: jamTeks }],
      });
    }
  }

  const daftarKelas = Array.from(dikelompokkan.values());

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-navy-950 md:text-3xl">
            Daftar Kelas Ajar
          </h1>
          <p className="text-xs text-muted-foreground">
            {daftarKelas.length} kelas diampu pada semester ini
          </p>
        </div>
      </div>

      {daftarKelas.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Belum ada jadwal mengajar. Hubungi admin sekolah untuk membuat jadwal.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {daftarKelas.map((k) => {
            const infoSekolah = kelasSeluruhSekolah.find(
              (s) => s.kelas === k.kelas
            );
            return (
              <Card
                key={`${k.kelas}-${k.mapel}`}
                className="border border-border transition-all duration-200 hover:border-navy-300 hover:shadow-xs"
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
                    {infoSekolah && (
                      <Badge variant="navy" className="font-mono text-xs">
                        {infoSekolah.rataKehadiran}% Presensi
                      </Badge>
                    )}
                  </div>

                  {infoSekolah && (
                    <div className="mt-3.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Users size={13} className="text-slate-400" />
                      <span>{infoSekolah.jumlahSiswa} siswa terdaftar</span>
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border pt-3">
                    {k.jadwal.map((j, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 rounded-md border border-border bg-slate-50 px-2 py-1 text-[11px] font-medium text-navy-800"
                      >
                        <CalendarClock size={11} className="text-navy-500" />
                        {j.hari} · {j.jam}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
