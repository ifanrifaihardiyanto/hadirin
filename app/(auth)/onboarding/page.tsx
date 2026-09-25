"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  User,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const steps = ["Data Sekolah", "Admin Sekolah", "Paket", "Selesai"];
const jenjangOptions = ["SD", "SMP", "SMA", "SMK", "Madrasah (MI/MTs/MA)"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  const [sekolah, setSekolah] = useState({
    nama: "",
    npsn: "",
    jenjang: "SMA",
    jumlahSiswa: "",
  });

  const [admin, setAdmin] = useState({
    nama: "",
    email: "",
    whatsapp: "",
  });

  const [paket, setPaket] = useState<"trial" | "berbayar">("trial");

  function lanjut() {
    setStep((s) => Math.min(s + 1, steps.length - 1));
  }

  function kembali() {
    setStep((s) => Math.max(s - 1, 0));
  }

  return (
    <Card className="border-border bg-white shadow-md">
      <CardContent className="p-6 md:p-7">
        {/* Step Indicator */}
        <div className="mb-6 flex items-center gap-2">
          {steps.map((label, i) => (
            <div key={label} className="flex flex-1 items-center gap-1.5">
              <div
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-full font-mono text-xs font-bold transition-colors ${
                  i < step
                    ? "bg-navy-900 text-white"
                    : i === step
                    ? "bg-navy-100 text-navy-950 ring-2 ring-navy-900 ring-offset-2"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {i < step ? <CheckCircle2 size={15} /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 rounded-full ${
                    i < step ? "bg-navy-900" : "bg-slate-100"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {step === 0 && (
          <div className="space-y-4 animate-fade-up">
            <div className="flex items-center gap-2.5 border-b border-border pb-3">
              <Building2 size={18} className="text-navy-900" />
              <div>
                <h2 className="font-display text-lg font-bold text-navy-950">
                  Data Identitas Sekolah
                </h2>
                <p className="text-xs text-muted-foreground">
                  Masukkan profil dasar institusi pendidikan Anda
                </p>
              </div>
            </div>

            <div className="space-y-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="namaSekolah">Nama Sekolah</Label>
                <Input
                  id="namaSekolah"
                  value={sekolah.nama}
                  onChange={(e) =>
                    setSekolah({ ...sekolah, nama: e.target.value })
                  }
                  placeholder="SMA Negeri 3 Contoh"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="npsn">NPSN (Nomor Pokok Sekolah Nasional)</Label>
                <Input
                  id="npsn"
                  value={sekolah.npsn}
                  onChange={(e) =>
                    setSekolah({ ...sekolah, npsn: e.target.value })
                  }
                  placeholder="20123456"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="jenjang">Jenjang</Label>
                  <select
                    id="jenjang"
                    value={sekolah.jenjang}
                    onChange={(e) =>
                      setSekolah({ ...sekolah, jenjang: e.target.value })
                    }
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none focus:border-navy-600"
                  >
                    {jenjangOptions.map((j) => (
                      <option key={j} value={j}>
                        {j}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="jumlahSiswa">Perkiraan Siswa</Label>
                  <Input
                    id="jumlahSiswa"
                    value={sekolah.jumlahSiswa}
                    onChange={(e) =>
                      setSekolah({ ...sekolah, jumlahSiswa: e.target.value })
                    }
                    placeholder="450"
                    inputMode="numeric"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4 animate-fade-up">
            <div className="flex items-center gap-2.5 border-b border-border pb-3">
              <User size={18} className="text-navy-900" />
              <div>
                <h2 className="font-display text-lg font-bold text-navy-950">
                  Data Penanggung Jawab / Admin
                </h2>
                <p className="text-xs text-muted-foreground">
                  Akun utama untuk mengelola master guru dan jadwal pelajaran
                </p>
              </div>
            </div>

            <div className="space-y-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="namaAdmin">Nama Lengkap &amp; Gelar</Label>
                <Input
                  id="namaAdmin"
                  value={admin.nama}
                  onChange={(e) => setAdmin({ ...admin, nama: e.target.value })}
                  placeholder="Hendra Wijaya, M.Pd."
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="emailAdmin">Email Dinas / Pribadi</Label>
                <Input
                  id="emailAdmin"
                  type="email"
                  value={admin.email}
                  onChange={(e) => setAdmin({ ...admin, email: e.target.value })}
                  placeholder="hendra.wijaya@sman3contoh.sch.id"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="whatsappAdmin">Nomor WhatsApp Aktif</Label>
                <Input
                  id="whatsappAdmin"
                  value={admin.whatsapp}
                  onChange={(e) =>
                    setAdmin({ ...admin, whatsapp: e.target.value })
                  }
                  placeholder="0812-3456-7890"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-fade-up">
            <div>
              <h2 className="font-display text-lg font-bold text-navy-950">
                Pilih Opsi Layanan
              </h2>
              <p className="text-xs text-muted-foreground">
                Mulai dengan masa percobaan gratis tanpa komitmen kartu kredit
              </p>
            </div>

            <div className="space-y-3">
              <div
                onClick={() => setPaket("trial")}
                className={`cursor-pointer rounded-xl border p-4 transition-all duration-150 ${
                  paket === "trial"
                    ? "border-navy-900 bg-navy-50/70 shadow-xs ring-1 ring-navy-900"
                    : "border-border bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-navy-950">
                    Trial Gratis 1 Semester
                  </span>
                  <Badge variant="hadir">Gratis</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Seluruh fitur presensi guru, dashboard analitik, dan cetak jadwal aktif penuh.
                </p>
              </div>

              <div
                onClick={() => setPaket("berbayar")}
                className={`cursor-pointer rounded-xl border p-4 transition-all duration-150 ${
                  paket === "berbayar"
                    ? "border-navy-900 bg-navy-50/70 shadow-xs ring-1 ring-navy-900"
                    : "border-border bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-navy-950">
                    Paket Berlangganan Tahunan
                  </span>
                  <span className="font-mono text-xs font-semibold text-navy-800">
                    Rp 15.000 / siswa / thn
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Termasuk notifikasi WhatsApp otomatis ke orang tua murid dan integrasi rapor.
                </p>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col items-center py-4 text-center animate-fade-up">
            <span className="mb-3.5 grid h-14 w-14 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 size={32} />
            </span>
            <h2 className="font-display text-xl font-bold text-navy-950">
              Pendaftaran Selesai!
            </h2>
            <p className="mt-1.5 max-w-sm text-xs text-muted-foreground">
              {sekolah.nama || "Sekolah Anda"} telah berhasil didaftarkan ke platform Hadirin. Anda dapat langsung mencoba portal guru dan admin sekarang.
            </p>
            <Button
              onClick={() => router.push("/")}
              className="mt-6 w-full bg-navy-900 text-white hover:bg-navy-800"
            >
              Mulai Eksplorasi Aplikasi
            </Button>
          </div>
        )}

        {step < 3 && (
          <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={kembali}
              disabled={step === 0}
              className="gap-1.5"
            >
              <ArrowLeft size={14} />
              Kembali
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={lanjut}
              className="gap-1.5 bg-navy-900 text-white hover:bg-navy-800"
            >
              Lanjut
              <ArrowRight size={14} />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
