"use client";

import { Bell, ChevronRight, LogOut, School, Mail, Phone, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { profilGuru } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function ProfilPage() {
  const router = useRouter();
  const inisial = profilGuru.nama
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

  function handleLogout() {
    router.push("/login");
  }

  return (
    <div className="w-full space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-navy-950 md:text-3xl">
          Profil Akun Guru
        </h1>
        <p className="text-xs text-muted-foreground">
          Kelola informasi identitas akun pendidik dan preferensi sistem
        </p>
      </div>

      {/* Profile Banner */}
      <Card className="border-none bg-gradient-to-r from-navy-950 via-navy-900 to-navy-800 text-white shadow-md">
        <CardContent className="flex items-center gap-5 p-6 md:p-7">
          <Avatar className="h-16 w-16 border-2 border-white/20 bg-white/10">
            <AvatarFallback className="bg-transparent font-display text-2xl font-bold text-white">
              {inisial}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <p className="font-display text-xl font-bold text-white md:text-2xl">
                {profilGuru.nama}
              </p>
              <Badge variant="outline" className="border-white/20 bg-white/10 text-white text-[10px]">
                Guru Pengajar
              </Badge>
            </div>
            <p className="text-xs text-navy-200">
              Mata Pelajaran: {profilGuru.mapel.join(" · ")}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Kontak */}
        <section className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-navy-900/60">
            Kontak Pribadi
          </h2>
          <Card className="border-border bg-white shadow-xs">
            <CardContent className="divide-y divide-border p-0">
              <div className="flex items-center gap-3.5 p-4">
                <Mail size={18} className="text-navy-700" />
                <div>
                  <p className="text-xs text-muted-foreground">Email Resmi</p>
                  <span className="text-sm font-medium text-navy-950">{profilGuru.email}</span>
                </div>
              </div>
              <div className="flex items-center gap-3.5 p-4">
                <Phone size={18} className="text-navy-700" />
                <div>
                  <p className="text-xs text-muted-foreground">Nomor WhatsApp</p>
                  <span className="text-sm font-medium text-navy-950">{profilGuru.telepon}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Instansi */}
        <section className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-navy-900/60">
            Instansi Pendidikan
          </h2>
          <Card className="border-border bg-white shadow-xs">
            <CardContent className="divide-y divide-border p-0">
              <div className="flex items-center gap-3.5 p-4">
                <School size={18} className="text-navy-700" />
                <div>
                  <p className="text-xs text-muted-foreground">Nama Sekolah</p>
                  <p className="text-sm font-medium text-navy-950">{profilGuru.sekolah}</p>
                </div>
              </div>
              <div className="flex items-center gap-3.5 p-4">
                <ShieldCheck size={18} className="text-navy-700" />
                <div>
                  <p className="text-xs text-muted-foreground">NPSN</p>
                  <p className="font-mono text-sm font-semibold text-navy-950">{profilGuru.npsn}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      <div className="pt-2">
        <Button
          variant="outline"
          onClick={handleLogout}
          className="gap-2 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
        >
          <LogOut size={16} />
          Keluar dari Sesi
        </Button>
      </div>
    </div>
  );
}
