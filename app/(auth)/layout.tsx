import Link from "next/link";
import { CheckCheck } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-slate-50/70 antialiased flex flex-col justify-between">
      {/* Top Navigation Bar Standar SaaS */}
      <header className="w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/login" className="flex items-center gap-2.5 group">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-navy-900 text-white shadow-sm group-hover:scale-105 transition-transform">
              <CheckCheck size={19} />
            </span>
            <div className="flex flex-col">
              <span className="font-display text-xl font-bold tracking-tight text-navy-950 leading-none">
                Hadirin<span className="text-navy-600 font-semibold text-xs ml-1.5 px-2 py-0.5 rounded-full bg-navy-50 border border-navy-100 hidden sm:inline">EdTech SaaS</span>
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-3 text-xs sm:text-sm">
            <span className="text-slate-500 hidden sm:inline">Sudah punya akun?</span>
            <Link
              href="/login"
              className="font-medium text-navy-900 hover:text-navy-950 bg-slate-100 hover:bg-slate-200/80 px-3.5 py-1.5 rounded-xl transition-colors"
            >
              Masuk ke Portal
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        {children}
      </main>

      {/* Footer Standar SaaS */}
      <footer className="w-full border-t border-slate-200/60 bg-white/70 py-4 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} Hadirin Education Cloud Platform &bull; Platform Manajemen Sekolah Modern</span>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Keamanan 256-bit SSL</span>
            <span>&bull;</span>
            <span>Patuh UU PDP</span>
            <span>&bull;</span>
            <span>Uptime 99.9%</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
