import AdminNavShell from "@/components/AdminNavShell";
import DashboardHeader from "@/components/DashboardHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full bg-slate-50/60">
      <AdminNavShell />
      <div className="flex flex-1 flex-col min-w-0">
        <DashboardHeader role="admin" />
        <main className="flex-1 w-full p-6 md:p-8 pb-24 md:pb-12">
          {children}
        </main>
      </div>
    </div>
  );
}
