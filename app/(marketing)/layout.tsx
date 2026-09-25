import Link from "next/link";
import { CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3.5">
          <Link href="/harga" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-navy-900 text-white shadow-xs">
              <CheckCheck size={18} />
            </span>
            <span className="font-display text-xl font-bold tracking-tight text-navy-950">
              Hadirin
            </span>
          </Link>
          <div className="flex items-center gap-2.5">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Masuk</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/onboarding">Daftar Sekolah</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border bg-white px-5 py-8 text-center text-xs text-muted-foreground">
        © 2026 Hadirin. Sistem Presensi Sekolah Modern Berbasis Presensi Pintar.
      </footer>
    </div>
  );
}
