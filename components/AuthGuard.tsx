"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useStore, type UserRole } from "@/lib/store";
import { Loader2, ShieldAlert } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser } = useStore();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Jalankan pemeriksaan sesi di browser (client-side)
    const checkAuth = () => {
      try {
        const token = localStorage.getItem("auth_token");
        const sessionUserStr = localStorage.getItem("hadirin_session_user");

        // Jika tidak ada token dan tidak ada session user -> Belum Login
        if (!token && !sessionUserStr) {
          setIsAuthorized(false);
          setIsChecking(false);
          router.replace("/login");
          return;
        }

        // Parse user role
        let userRole: UserRole = currentUser?.role || "guru";
        if (sessionUserStr) {
          try {
            const parsed = JSON.parse(sessionUserStr);
            if (parsed.role) userRole = parsed.role;
          } catch {
            // ignore
          }
        }

        // Cek permission role jika dibatasi
        if (allowedRoles && allowedRoles.length > 0) {
          const hasAccess = allowedRoles.includes(userRole);
          if (!hasAccess) {
            // Arahkan ke dashboard yang sesuai jika salah kamar
            if (userRole === "admin_sekolah" || userRole === "admin" || userRole === "tu" || userRole === "kepsek") {
              router.replace("/admin");
            } else if (userRole === "siswa") {
              router.replace("/siswa");
            } else if (userRole === "orang_tua") {
              router.replace("/ortu");
            } else if (userRole === "super_admin") {
              router.replace("/admin/saas");
            } else {
              router.replace("/");
            }
            return;
          }
        }

        // Role redirect jika pengguna yang sudah login mengakses root `/` tapi bukan guru
        if (pathname === "/") {
          if (userRole === "admin_sekolah" || userRole === "admin" || userRole === "tu" || userRole === "kepsek") {
            router.replace("/admin");
            return;
          } else if (userRole === "siswa") {
            router.replace("/siswa");
            return;
          } else if (userRole === "orang_tua") {
            router.replace("/ortu");
            return;
          } else if (userRole === "super_admin") {
            router.replace("/admin/saas");
            return;
          }
        }

        setIsAuthorized(true);
      } catch (err) {
        console.error("Auth check failed:", err);
        router.replace("/login");
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [pathname, router, allowedRoles, currentUser?.role]);

  if (isChecking) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50/80 p-4">
        <div className="flex flex-col items-center gap-3 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs max-w-xs w-full text-center animate-in fade-in duration-200">
          <div className="h-10 w-10 rounded-xl bg-navy-900 text-white flex items-center justify-center shadow-xs">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
          <div>
            <h4 className="font-semibold text-xs text-navy-950">Memverifikasi Sesi</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Memeriksa kredensial login Hadirin...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}

