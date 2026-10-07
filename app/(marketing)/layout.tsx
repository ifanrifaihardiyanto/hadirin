import Link from "next/link";
import { CheckCheck, GraduationCap, School, UserPlus, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-navy-900 text-white shadow-xs">
              <CheckCheck size={18} />
            </span>
            <span className="font-display text-xl font-bold tracking-tight text-navy-950">
              Hadirin
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <Link href="/harga" className="hover:text-navy-950 transition-colors flex items-center gap-1.5">
              <Tag size={13} /> Paket &amp; Biaya
            </Link>
            <Link href="/ppdb" className="hover:text-navy-950 transition-colors flex items-center gap-1.5">
              <UserPlus size={13} /> PPDB Online
            </Link>
            <Link href="/tracer" className="hover:text-navy-950 transition-colors flex items-center gap-1.5">
              <GraduationCap size={13} /> Tracer Study
            </Link>
          </nav>

          <div className="flex items-center gap-2.5">
            <Button variant="ghost" size="sm" asChild className="text-xs">
              <Link href="/login">Masuk Portal</Link>
            </Button>
            <Button size="sm" asChild className="bg-navy-900 hover:bg-navy-800 text-white text-xs">
              <Link href="/onboarding">Registrasi Sekolah</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border bg-white px-5 py-8 text-center text-xs text-muted-foreground space-y-2">
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-500">
          <Link href="/harga" className="hover:text-navy-900">Harga Lisensi</Link>
          <Link href="/ppdb" className="hover:text-navy-900">Portal PPDB</Link>
          <Link href="/tracer" className="hover:text-navy-900">Tracer Alumni</Link>
          <Link href="/login" className="hover:text-navy-900">Masuk Akun</Link>
        </div>
        <p className="text-[11px] text-slate-400">
          © {new Date().getFullYear()} Hadirin SaaS Education. Platform Sistem Informasi Sekolah &amp; Presensi Digital Terpadu.
        </p>
      </footer>
    </div>
  );
}
