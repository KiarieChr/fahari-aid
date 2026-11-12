import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: ReactNode;
}

export function AuthButton({
  loading,
  disabled,
  className,
  children,
  ...props
}: AuthButtonProps) {
  return (
    <button
      {...props}
      disabled={loading || disabled}
      className={cn(
        "group relative inline-flex h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-70",
        className,
      )}
    >
      <span
        className="pointer-events-none absolute inset-x-0 -bottom-px h-px"
        style={{ background: "var(--gradient-gold)" }}
      />
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      <span>{children}</span>
    </button>
  );
}
