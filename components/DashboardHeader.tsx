"use client";

import Link from "next/link";
import { Bell, Calendar, Search, User, ShieldCheck } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { HARI_INI, useStore } from "@/lib/store";
import { profilGuru, profilKepsek } from "@/lib/mock-data";

interface DashboardHeaderProps {
  role?: "guru" | "admin" | "tu" | "kepsek";
}

export default function DashboardHeader({ role = "guru" }: DashboardHeaderProps) {
  const { currentUser } = useStore();
  const isGuru = role === "guru" || currentUser?.role === "guru";
  const nama = currentUser?.nama || (isGuru ? profilGuru.nama : profilKepsek.nama);
  const jabatan = currentUser?.jabatan || (isGuru ? "Guru Pengajar" : "Kepala Sekolah");
  const inisial = nama
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-border bg-white/90 px-6 backdrop-blur-md md:px-8">
      {/* Left: Search or Breadcrumb */}
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 rounded-lg border border-border bg-slate-50/80 px-3 py-1.5 text-xs text-muted-foreground w-64 md:w-80">
          <Search size={14} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Cari kelas, siswa, atau jadwal..."
            className="w-full bg-transparent outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Right: Date, Notifications, User profile */}
      <div className="flex items-center gap-3 md:gap-4">
        <div className="hidden sm:flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-medium text-navy-950 shadow-2xs">
          <Calendar size={13} className="text-navy-700" />
          <span>Hari {HARI_INI}, 23 Juli 2026</span>
        </div>

        <button
          type="button"
          aria-label="Notifikasi"
          className="relative grid h-9 w-9 place-items-center rounded-lg border border-border bg-white text-navy-900 shadow-2xs transition-colors hover:bg-slate-50 hover:text-navy-950"
        >
          <Bell size={16} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>

        <div className="h-6 w-px bg-border" />

        <Link
          href={isGuru ? "/profil" : "/admin/pengaturan"}
          className="flex items-center gap-3 rounded-lg p-1 transition-colors hover:bg-slate-50"
        >
          <Avatar className="h-9 w-9 border border-navy-200">
            <AvatarFallback className="bg-navy-100 font-bold text-navy-900 text-xs">
              {inisial}
            </AvatarFallback>
          </Avatar>
          <div className="hidden text-left md:block">
            <p className="text-xs font-bold text-navy-950 leading-tight">
              {nama}
            </p>
            <p className="text-[11px] text-muted-foreground leading-tight">
              {isGuru ? "Guru Pengajar" : "Kepala Sekolah"}
            </p>
          </div>
        </Link>
      </div>
    </header>
  );
}

