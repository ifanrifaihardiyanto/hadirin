import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "navy";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
}

const variants: Record<string, string> = {
  default:
    "bg-navy-900 text-white shadow-xs hover:bg-navy-800 active:scale-[0.98]",
  navy:
    "bg-navy-900 text-white shadow-xs hover:bg-navy-800 active:scale-[0.98]",
  destructive:
    "bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90 active:scale-[0.98]",
  outline:
    "border border-border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground active:scale-[0.98]",
  secondary:
    "bg-navy-50 text-navy-900 shadow-xs hover:bg-navy-100 active:scale-[0.98]",
  ghost:
    "hover:bg-accent hover:text-accent-foreground",
  link:
    "text-navy-700 underline-offset-4 hover:underline",
};

const sizes: Record<string, string> = {
  default: "h-10 px-4 py-2 text-sm",
  sm: "h-8 rounded-md px-3 text-xs",
  lg: "h-11 rounded-lg px-8 text-base",
  icon: "h-9 w-9",
};

export function buttonVariants({
  variant = "default",
  size = "default",
  className,
}: {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  className?: string;
} = {}) {
  return cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    className
  );
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      asChild = false,
      children,
      ...props
    },
    ref
  ) => {
    const classes = buttonVariants({ variant, size, className });

    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<{ className?: string }>;
      return React.cloneElement(child, {
        className: cn(classes, child.props.className),
        ...props,
      });
    }

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
