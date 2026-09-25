import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "hadir"
    | "sakit"
    | "izin"
    | "alpha"
    | "navy";
}

function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const variants: Record<string, string> = {
    default:
      "border-transparent bg-navy-900 text-white shadow-xs",
    navy:
      "border-transparent bg-navy-100 text-navy-900 font-medium",
    secondary:
      "border-transparent bg-secondary text-secondary-foreground",
    destructive:
      "border-transparent bg-destructive text-destructive-foreground shadow-xs",
    outline: "text-foreground border-border",
    hadir:
      "border-transparent bg-emerald-50 text-emerald-700 font-medium",
    sakit:
      "border-transparent bg-amber-50 text-amber-700 font-medium",
    izin:
      "border-transparent bg-sky-50 text-sky-700 font-medium",
    alpha:
      "border-transparent bg-rose-50 text-rose-700 font-medium",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };

