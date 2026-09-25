import Link from "next/link";
import { CheckCheck } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-slate-50/50 px-4 py-10">
      <Link href="/login" className="mb-6 flex items-center gap-2.5">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-navy-900 text-white shadow-sm">
          <CheckCheck size={20} />
        </span>
        <span className="font-display text-2xl font-bold tracking-tight text-navy-950">
          Hadirin
        </span>
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
