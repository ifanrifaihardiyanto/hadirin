import NavShell from "@/components/NavShell";
import DashboardHeader from "@/components/DashboardHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full bg-slate-50/60">
      <NavShell />
      <div className="flex flex-1 flex-col min-w-0">
        <DashboardHeader role="guru" />
        <main className="flex-1 w-full p-6 md:p-8 pb-24 md:pb-12">
          {children}
        </main>
      </div>
    </div>
  );
}
