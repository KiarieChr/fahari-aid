import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: ReactNode;
  hint?: string;
}

export function AuthField({
  label,
  error,
  icon,
  hint,
  type = "text",
  className,
  id,
  ...props
}: AuthFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const isPassword = type === "password";
  const [reveal, setReveal] = useState(false);
  const effectiveType = isPassword ? (reveal ? "text" : "password") : type;

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={inputId}
        className="block text-xs font-semibold uppercase tracking-wide text-foreground/80"
      >
        {label}
      </label>
      <div
        className={cn(
          "group relative flex items-center rounded-xl border bg-card transition-all",
          "border-input shadow-[var(--shadow-soft)]",
          "focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/30",
          error && "border-destructive focus-within:border-destructive focus-within:ring-destructive/25",
        )}
      >
        {icon ? (
          <span className="pl-3.5 text-muted-foreground group-focus-within:text-primary">
            {icon}
          </span>
        ) : null}
        <input
          id={inputId}
          type={effectiveType}
          {...props}
          className={cn(
            "h-11 w-full bg-transparent px-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none",
            icon && "pl-2.5",
            isPassword && "pr-11",
            className,
          )}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setReveal((r) => !r)}
            className="absolute right-2 grid h-8 w-8 place-content-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            tabIndex={-1}
            aria-label={reveal ? "Hide password" : "Show password"}
          >
            {reveal ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        ) : null}
      </div>
      {error ? (
        <p className="text-xs font-medium text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
