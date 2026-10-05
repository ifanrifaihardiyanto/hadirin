"use client";

import { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Briefcase,
  Building2,
  CheckCircle2,
  Send,
  Heart,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  ChevronLeft,
  Users,
} from "lucide-react";
import { useStore, AlumniRecord } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function TracerStudyPublicPage() {
  const { tambahAlumni, daftarAlumni } = useStore();

  const [formData, setFormData] = useState({
    nisn: "",
    nama: "",
    gender: "L" as "L" | "P",
    tahunLulus: 2024,
    jurusan: "MIPA" as "MIPA" | "IPS" | "BAHASA",
    statusTracer: "KULIAH_PTN" as AlumniRecord["statusTracer"],
    instansiAtauKampus: "",
    posisiAtauJurusan: "",
    email: "",
    telepon: "",
    kotaDomisili: "",
    kesanPesan: "",
    bersediaMentoring: true,
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama.trim() || !formData.instansiAtauKampus.trim() || !formData.telepon.trim()) {
      setErrorMsg("Mohon lengkapi Nama Lengkap, Kampus/Instansi, dan Nomor WhatsApp Anda.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    setTimeout(() => {
      tambahAlumni({
        nisn: formData.nisn.trim() || `00${Math.floor(10000000 + Math.random() * 90000000)}`,
        nama: formData.nama.trim(),
        gender: formData.gender,
        tahunLulus: Number(formData.tahunLulus),
        jurusan: formData.jurusan,
        statusTracer: formData.statusTracer,
        instansiAtauKampus: formData.instansiAtauKampus.trim(),
        posisiAtauJurusan: formData.posisiAtauJurusan.trim() || "Alumni",
        email: formData.email.trim() || "alumni@hadirin.sch.id",
        telepon: formData.telepon.trim(),
        kotaDomisili: formData.kotaDomisili.trim() || "Indonesia",
        kesanPesan: formData.kesanPesan.trim(),
        bersediaMentoring: formData.bersediaMentoring,
      });

      setSubmitting(false);
      setIsSubmitted(true);
    }, 600);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 md:py-12 space-y-8">
      {/* Hero Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          <GraduationCap size={15} />
          Ikatan Alumni &amp; Pusat Karir Sekolah
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-navy-950">
          Kuesioner Tracer Study Alumni
        </h1>
        <p className="text-sm md:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Bantu almamater memetakan capaian lulusan, akreditasi sekolah, serta bangun jejaring bimbingan karir bagi adik kelas yang akan melanjutkan kuliah maupun bekerja.
        </p>
      </div>

      {isSubmitted ? (
        <Card className="border border-emerald-200 bg-white shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-gradient-to-r from-emerald-800 to-teal-800 p-8 text-white text-center space-y-3">
            <div className="mx-auto w-16 h-16 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
              <CheckCircle2 size={36} className="text-emerald-300" />
            </div>
            <h2 className="font-display text-2xl font-bold tracking-tight">
              Terima Kasih, {formData.nama}!
            </h2>
            <p className="text-xs md:text-sm text-emerald-100 max-w-md mx-auto">
              Data tracer study Anda telah berhasil direkam ke dalam database almamater sekolah.
            </p>
          </div>

          <CardContent className="p-6 md:p-8 space-y-6">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 text-xs">
              <h3 className="font-bold text-navy-950 text-sm flex items-center gap-2">
                <Sparkles size={16} className="text-primary" />
                Ringkasan Rekam Jejak Karir:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-600">
                <div>
                  <span className="text-slate-400 block text-[10px]">Tahun Angkatan Lulus:</span>
                  <strong className="text-navy-950">Angkatan {formData.tahunLulus} ({formData.jurusan})</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Status Saat Ini:</span>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 text-xs">
                    {formData.statusTracer.replace(/_/g, " ")}
                  </Badge>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Kampus / Perusahaan:</span>
                  <strong className="text-navy-950">{formData.instansiAtauKampus}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Program Studi / Posisi:</span>
                  <strong className="text-navy-950">{formData.posisiAtauJurusan || "-"}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Kota Domisili:</span>
                  <strong className="text-navy-950">{formData.kotaDomisili || "-"}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Partisipasi Mentoring:</span>
                  <strong className={formData.bersediaMentoring ? "text-emerald-700" : "text-slate-500"}>
                    {formData.bersediaMentoring ? "✓ Bersedia Jadi Mentor Adik Kelas" : "Belum Bersedia"}
                  </strong>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsSubmitted(false);
                  setFormData({
                    nisn: "",
                    nama: "",
                    gender: "L",
                    tahunLulus: 2024,
                    jurusan: "MIPA",
                    statusTracer: "KULIAH_PTN",
                    instansiAtauKampus: "",
                    posisiAtauJurusan: "",
                    email: "",
                    telepon: "",
                    kotaDomisili: "",
                    kesanPesan: "",
                    bersediaMentoring: true,
                  });
                }}
              >
                Isi Formulir Baru
              </Button>
              <Link href="/harga">
                <Button className="bg-navy-900 hover:bg-navy-800 text-white gap-2 text-xs">
                  Kembali ke Beranda
                  <ArrowRight size={14} />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={handleSubmit}>
          <Card className="border border-border bg-white shadow-md">
            <CardHeader className="border-b border-border p-6">
              <CardTitle className="text-lg font-bold text-navy-950 flex items-center gap-2">
                <Briefcase size={20} className="text-primary" />
                Formulir Pendataan Alumni
              </CardTitle>
              <CardDescription className="text-xs">
                Informasi Anda dijamin kerahasiaannya dan hanya digunakan untuk keperluan akreditasi sekolah &amp; bimbingan karir almamater.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 md:p-8 space-y-6">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                  {errorMsg}
                </div>
              )}

              {/* Bagian 1: Data Identitas Siswa */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-navy-900 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-navy-900 text-white text-[10px]">1</span>
                  Identitas Alumni Saat di Sekolah
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Nama Lengkap (Sesuai Ijazah) *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Muhammad Rayhan"
                      value={formData.nama}
                      onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-primary focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">NISN / Nomor Induk Siswa</label>
                    <input
                      type="text"
                      placeholder="Contoh: 0031245678 (opsional)"
                      value={formData.nisn}
                      onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-primary focus:outline-hidden font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Tahun Kelulusan *</label>
                      <select
                        value={formData.tahunLulus}
                        onChange={(e) => setFormData({ ...formData, tahunLulus: Number(e.target.value) })}
                        className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-primary focus:outline-hidden bg-white"
                      >
                        {[2024, 2023, 2022, 2021, 2020, 2019, 2018].map((y) => (
                          <option key={y} value={y}>
                            Lulus {y}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Peminatan / Jurusan *</label>
                      <select
                        value={formData.jurusan}
                        onChange={(e) => setFormData({ ...formData, jurusan: e.target.value as any })}
                        className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-primary focus:outline-hidden bg-white"
                      >
                        <option value="MIPA">MIPA / IPA</option>
                        <option value="IPS">IPS / Sosial</option>
                        <option value="BAHASA">Bahasa &amp; Budaya</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Jenis Kelamin</label>
                    <div className="flex items-center gap-4 pt-2">
                      <label className="flex items-center gap-2 text-xs cursor-pointer">
                        <input
                          type="radio"
                          name="gender"
                          checked={formData.gender === "L"}
                          onChange={() => setFormData({ ...formData, gender: "L" })}
                          className="accent-primary"
                        />
                        Laki-laki
                      </label>
                      <label className="flex items-center gap-2 text-xs cursor-pointer">
                        <input
                          type="radio"
                          name="gender"
                          checked={formData.gender === "P"}
                          onChange={() => setFormData({ ...formData, gender: "P" })}
                          className="accent-primary"
                        />
                        Perempuan
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bagian 2: Aktivitas Karir Saat Ini */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-bold text-navy-900 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-navy-900 text-white text-[10px]">2</span>
                  Aktivitas Karir &amp; Pendidikan Lanjutan Saat Ini
                </h3>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Status Aktivitas Utama *</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { val: "KULIAH_PTN", label: "Kuliah di PTN" },
                      { val: "KULIAH_PTS", label: "Kuliah di PTS" },
                      { val: "STUDI_LUAR_NEGERI", label: "Kuliah Luar Negeri" },
                      { val: "BEKERJA", label: "Bekerja di Perusahaan" },
                      { val: "WIRAUSAHA", label: "Wirausaha / Bisnis" },
                      { val: "MENCARI_KERJA", label: "Mencari Kerja / Gap Year" },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => setFormData({ ...formData, statusTracer: opt.val as any })}
                        className={`p-3 text-left rounded-xl border text-xs font-medium transition-all ${
                          formData.statusTracer === opt.val
                            ? "bg-navy-900 text-white border-navy-900 font-bold shadow-xs"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Nama Perguruan Tinggi / Nama Perusahaan / Usaha *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: ITB / BCA / Shopee / Kafe Sendiri"
                      value={formData.instansiAtauKampus}
                      onChange={(e) => setFormData({ ...formData, instansiAtauKampus: e.target.value })}
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-primary focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Program Studi / Jabatan Karir</label>
                    <input
                      type="text"
                      placeholder="Contoh: Teknik Informatika / Software Engineer"
                      value={formData.posisiAtauJurusan}
                      onChange={(e) => setFormData({ ...formData, posisiAtauJurusan: e.target.value })}
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-primary focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Kota Domisili Sekarang</label>
                    <input
                      type="text"
                      placeholder="Contoh: Bandung / Jakarta Selatan / Yogyakarta"
                      value={formData.kotaDomisili}
                      onChange={(e) => setFormData({ ...formData, kotaDomisili: e.target.value })}
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-primary focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Bagian 3: Kontak & Kesediaan Mentoring */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-bold text-navy-900 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-navy-900 text-white text-[10px]">3</span>
                  Kontak &amp; Kesediaan Berbagi Pengalaman
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Nomor WhatsApp Aktif *</label>
                    <input
                      type="tel"
                      required
                      placeholder="Contoh: 0812-3456-7890"
                      value={formData.telepon}
                      onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-primary focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Alamat Email Aktif</label>
                    <input
                      type="email"
                      placeholder="Contoh: rayhan@gmail.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-primary focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Pesan &amp; Masukan untuk Almamater / Adik Kelas</label>
                  <textarea
                    rows={3}
                    placeholder="Tuliskan saran perbaikan kurikulum, fasilitas, atau kata-kata motivasi untuk adik kelas..."
                    value={formData.kesanPesan}
                    onChange={(e) => setFormData({ ...formData, kesanPesan: e.target.value })}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-primary focus:outline-hidden"
                  />
                </div>

                <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="mentoring"
                    checked={formData.bersediaMentoring}
                    onChange={(e) => setFormData({ ...formData, bersediaMentoring: e.target.checked })}
                    className="mt-1 h-4 w-4 rounded accent-primary cursor-pointer"
                  />
                  <label htmlFor="mentoring" className="text-xs text-emerald-950 cursor-pointer space-y-0.5">
                    <span className="font-bold block">
                      Saya bersedia dihubungi sekolah sebagai Mentor / Narasumber Karir Adik Kelas
                    </span>
                    <span className="text-slate-600 block text-[11px]">
                      Membagikan tips lolos SNBP/SNBT, bimbingan beasiswa, atau wawasan dunia industri profesional.
                    </span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 px-6"
                >
                  <Send size={15} />
                  {submitting ? "Menyimpan Data..." : "Kirim Jawaban Tracer Study"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      )}

      {/* Footer Info Box */}
      <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-2">
        <ShieldCheck size={16} className="text-emerald-600" />
        Sistem Penjaminan Mutu &amp; Akreditasi Sekolah · Hadirin School SaaS Cloud
      </div>
    </div>
  );
}
