import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string;
  change: number;
  hint?: string;
  icon: LucideIcon;
  accent?: "primary" | "gold" | "success" | "destructive";
}

const accentStyles: Record<NonNullable<KpiCardProps["accent"]>, string> = {
  primary: "bg-primary/10 text-primary",
  gold: "bg-gold/15 text-gold-foreground",
  success: "bg-success/15 text-success",
  destructive: "bg-destructive/10 text-destructive",
};

export function KpiCard({
  label,
  value,
  change,
  hint,
  icon: Icon,
  accent = "primary",
}: KpiCardProps) {
  const positive = change >= 0;
  return (
    <Card className="group relative overflow-hidden rounded-2xl border-border/60 p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-elevated">
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/5 blur-2xl transition-all group-hover:bg-primary/10" />
      
      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/80">
            {label}
          </p>
          <p className="font-display text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">
            {value}
          </p>
        </div>
        <div className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full transition-transform group-hover:scale-110 group-hover:rotate-3",
          accentStyles[accent]
        )}>
          <Icon className="h-6 w-6" strokeWidth={2} />
        </div>
      </div>
      
      <div className="mt-6 flex items-center gap-2.5 relative z-10">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold transition-colors",
            positive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
          )}
        >
          {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {positive ? "+" : ""}{change}%
        </span>
        {hint && <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{hint}</span>}
      </div>
    </Card>
  );
}
