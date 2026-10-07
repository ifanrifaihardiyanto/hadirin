"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, ChevronRight, LogOut, School, Mail, Phone, ShieldCheck, RefreshCw, UserCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api-client";

export default function ProfilPage() {
  const router = useRouter();
  const { currentUser, logout } = useStore();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState({
    nama: currentUser?.nama || "Budi Santoso, S.Pd",
    email: currentUser?.email || "budi.santoso@hadirin.sch.id",
    role: currentUser?.role || "GURU",
    telepon: "0812-3456-7890",
    sekolah: currentUser?.sekolah || "SMA Negeri 3 Unggulan",
    npsn: "20220412",
    mapel: ["Matematika", "Fisika Dasar"],
  });

  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const [meRes, sekolahRes] = await Promise.allSettled([
        api.getMe(),
        api.getProfilSekolah(),
      ]);

      if (meRes.status === "fulfilled" && meRes.value?.data) {
        const u = meRes.value.data;
        setUserData((prev) => ({
          ...prev,
          nama: u.nama || prev.nama,
          email: u.email || prev.email,
          role: u.role || prev.role,
        }));
      }

      if (sekolahRes.status === "fulfilled" && sekolahRes.value?.data) {
        const s = sekolahRes.value.data;
        setUserData((prev) => ({
          ...prev,
          sekolah: s.nama || prev.sekolah,
          npsn: s.npsn || prev.npsn,
        }));
      }
    } catch (err) {
      console.error("Gagal memuat profil pengguna:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const inisial = userData.nama
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <div className="w-full space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-navy-950 md:text-3xl">
            Profil Akun Pendidik
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Kelola informasi identitas akun pendidik dan preferensi sistem
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => loadData(true)}
          disabled={refreshing || loading}
          className="text-xs h-9 gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-50 w-fit"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin text-navy-600" : ""} />
          <span>Muat Ulang</span>
        </Button>
      </div>

      {/* Profile Banner */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs animate-pulse flex items-center gap-5">
          <div className="h-16 w-16 bg-slate-200 rounded-full"></div>
          <div className="space-y-2 flex-1">
            <div className="h-6 w-48 bg-slate-200 rounded"></div>
            <div className="h-4 w-72 bg-slate-100 rounded"></div>
          </div>
        </div>
      ) : (
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
                  {userData.nama}
                </p>
                <Badge variant="outline" className="border-white/20 bg-white/10 text-white text-[10px]">
                  {userData.role}
                </Badge>
              </div>
              <p className="text-xs text-navy-200">
                Mata Pelajaran: {userData.mapel.join(" · ")}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

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
                  <span className="text-sm font-medium text-navy-950">{userData.email}</span>
                </div>
              </div>
              <div className="flex items-center gap-3.5 p-4">
                <Phone size={18} className="text-navy-700" />
                <div>
                  <p className="text-xs text-muted-foreground">Nomor WhatsApp</p>
                  <span className="text-sm font-medium text-navy-950">{userData.telepon}</span>
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
                  <p className="text-sm font-medium text-navy-950">{userData.sekolah}</p>
                </div>
              </div>
              <div className="flex items-center gap-3.5 p-4">
                <ShieldCheck size={18} className="text-navy-700" />
                <div>
                  <p className="text-xs text-muted-foreground">NPSN</p>
                  <p className="font-mono text-sm font-semibold text-navy-950">{userData.npsn}</p>
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
          className="gap-2 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 cursor-pointer"
        >
          <LogOut size={16} />
          Keluar dari Sesi
        </Button>
      </div>
    </div>
  );
}
