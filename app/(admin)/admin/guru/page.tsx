"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, GraduationCap, Plus, X, Mail, BookOpen, RefreshCw } from "lucide-react";
import { useStore, HARI_INI } from "@/lib/store";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

interface GuruItem {
  id: number | string;
  nama: string;
  email: string;
  telepon: string;
  nip?: string;
  mapel: string[];
}

export default function AdminGuruPage() {
  const { jadwal, absensiTersimpanHariIni } = useStore();
  const [guruList, setGuruList] = useState<GuruItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formTerbuka, setFormTerbuka] = useState(false);
  const [form, setForm] = useState({
    nama: "",
    email: "",
    telepon: "",
    mapel: "",
  });
  const [pesanSukses, setPesanSukses] = useState<string | null>(null);

  const fetchGuru = async () => {
    setLoading(true);
    try {
      const res = await api.getGuruList();
      if (res?.data) {
        const mapped: GuruItem[] = res.data.map((g: any) => ({
          id: g.id,
          nama: g.nama,
          email: g.email || "-",
          telepon: g.telepon || "0812-0000-0000",
          nip: g.nip,
          mapel: Array.isArray(g.mata_pelajarans) && g.mata_pelajarans.length > 0
            ? g.mata_pelajarans.map((m: any) => m.nama)
            : g.jabatan
            ? [g.jabatan]
            : ["Guru Pengampu"],
        }));
        setGuruList(mapped);
      }
    } catch (err: any) {
      console.warn("Gagal memuat dewan guru:", err?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuru();
  }, []);

  async function submitTambahGuru(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nama || !form.email) return;

    setSubmitting(true);
    try {
      const payload = {
        nama: form.nama,
        email: form.email,
        telepon: form.telepon || "0812-0000-0000",
        jabatan: form.mapel || "Guru Mata Pelajaran",
      };
      const res = await api.createGuru(payload);
      if (res?.data) {
        const newGuru: GuruItem = {
          id: res.data.id,
          nama: res.data.nama,
          email: res.data.email || form.email,
          telepon: res.data.telepon || form.telepon,
          mapel: form.mapel ? form.mapel.split(",").map((m) => m.trim()) : ["Guru Mata Pelajaran"],
        };
        setGuruList((prev) => [newGuru, ...prev]);
      } else {
        await fetchGuru();
      }
      setPesanSukses(`Guru ${form.nama} berhasil ditambahkan!`);
      setForm({ nama: "", email: "", telepon: "", mapel: "" });
      setFormTerbuka(false);
      setTimeout(() => setPesanSukses(null), 3500);
    } catch (err: any) {
      alert("Gagal menambahkan guru: " + (err?.message || "Terjadi kesalahan"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-navy-950 md:text-3xl">
            Manajemen Dewan Guru
          </h1>
          <p className="text-xs text-muted-foreground">
            Kelola data guru, kontak, dan penugasan mata pelajaran ({guruList.length} guru terdaftar)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchGuru}
            disabled={loading}
            className="text-xs h-9 gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            onClick={() => setFormTerbuka((v) => !v)}
            className="gap-1.5 bg-navy-900 text-white hover:bg-navy-800 text-xs h-9"
          >
            {formTerbuka ? <X size={16} /> : <Plus size={16} />}
            {formTerbuka ? "Tutup Formulir" : "Tambah Guru Baru"}
          </Button>
        </div>
      </div>

      {pesanSukses && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 text-xs font-medium text-emerald-800 animate-fade-up">
          ✓ {pesanSukses}
        </div>
      )}

      {/* Form Tambah Guru */}
      {formTerbuka && (
        <Card className="border-navy-200 shadow-sm animate-fade-up">
          <CardContent className="p-6">
            <form onSubmit={submitTambahGuru} className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-display text-base font-bold text-navy-950">
                  Formulir Tambah Guru Baru
                </h3>
                <span className="text-xs text-muted-foreground">
                  Data otomatis tersimpan di sistem
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-1.5">
                  <Label htmlFor="nama">Nama Lengkap &amp; Gelar</Label>
                  <Input
                    id="nama"
                    required
                    value={form.nama}
                    onChange={(e) => setForm({ ...form, nama: e.target.value })}
                    placeholder="Fitri Handayani, S.Pd."
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="mapel">Mata Pelajaran (koma)</Label>
                  <Input
                    id="mapel"
                    value={form.mapel}
                    onChange={(e) => setForm({ ...form, mapel: e.target.value })}
                    placeholder="Kimia, Biologi"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email">Alamat Email Resmi</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="fitri.handayani@sekolah.sch.id"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="telepon">Nomor WhatsApp</Label>
                  <Input
                    id="telepon"
                    value={form.telepon}
                    onChange={(e) => setForm({ ...form, telepon: e.target.value })}
                    placeholder="0812-3456-7890"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormTerbuka(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={submitting}
                  className="bg-navy-900 text-white hover:bg-navy-800"
                >
                  {submitting ? "Menyimpan..." : "Simpan Data Guru"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* List Guru */}
      <Card className="border border-border bg-white shadow-xs overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="divide-y divide-border">
              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3.5">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
              ))}
            </div>
          ) : guruList.length === 0 ? (
            <div className="p-10 text-center text-slate-500">
              <GraduationCap className="mx-auto h-10 w-10 text-slate-300 mb-2" />
              <p className="text-sm font-semibold">Belum ada data guru</p>
              <p className="text-xs text-slate-400 mt-1">Silakan tambahkan data guru menggunakan formulir di atas.</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {guruList.map((g) => {
                const kelasHariIni = jadwal.filter(
                  (j) => String(j.guruId) === String(g.id) && j.hari === HARI_INI
                );
                const kelasSelesai = kelasHariIni.filter((j) =>
                  absensiTersimpanHariIni.includes(j.id)
                ).length;
                const adaJadwal = kelasHariIni.length > 0;
                const selesai = adaJadwal && kelasSelesai === kelasHariIni.length;
                const progres = adaJadwal
                  ? Math.round((kelasSelesai / kelasHariIni.length) * 100)
                  : 0;

                return (
                  <li
                    key={g.id}
                    className="flex flex-col gap-3 p-4 hover:bg-slate-50/60 sm:flex-row sm:items-center sm:justify-between transition-colors"
                  >
                    <div className="flex items-start gap-3.5">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-navy-100 text-navy-800 shadow-2xs">
                        <GraduationCap size={18} />
                      </span>
                      <div>
                        <p className="text-sm font-bold text-navy-950">{g.nama}</p>
                        <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Mail size={12} /> {g.email}
                          </span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1">
                            <BookOpen size={12} /> {g.mapel.join(", ") || "Belum ada mapel"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:flex-col sm:items-end gap-1.5">
                      {adaJadwal ? (
                        selesai ? (
                          <Badge variant="hadir" className="gap-1 py-1">
                            <CheckCircle2 size={12} />
                            Selesai Presensi
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="font-mono text-xs">
                            {kelasSelesai}/{kelasHariIni.length} kelas
                          </Badge>
                        )
                      ) : (
                        <span className="text-xs text-slate-400">
                          Tidak ada jadwal hari {HARI_INI}
                        </span>
                      )}

                      {adaJadwal && (
                        <div className="w-24 sm:w-28">
                          <Progress
                            value={progres}
                            className="h-1.5"
                            indicatorClassName={selesai ? "bg-emerald-500" : "bg-amber-500"}
                          />
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
