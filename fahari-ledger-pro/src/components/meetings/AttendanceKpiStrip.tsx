import React from "react";
import { Users, UserCheck, UserX, TrendingUp, TrendingDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { AttendanceSummary } from "./types";

interface AttendanceKpiStripProps {
  summary: AttendanceSummary | null;
  loading: boolean;
  deltaPct?: number | null;
}

export function AttendanceKpiStrip({
  summary,
  loading,
  deltaPct,
}: AttendanceKpiStripProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-border/70 bg-card/60 p-4 shadow-xs space-y-3"
          >
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    );
  }

  const totalMembers = summary?.total_members ?? 0;
  const attended = summary?.attended ?? 0;
  const absent = summary?.absent ?? Math.max(0, totalMembers - attended);
  const rate = summary?.attendance_pct ?? 0;

  const cards = [
    {
      label: "TOTAL MEMBERS",
      value: totalMembers.toLocaleString(),
      subtext: "Active congregational directory",
      icon: Users,
    },
    {
      label: "ATTENDED",
      value: attended.toLocaleString(),
      subtext: "Logged session check-ins",
      icon: UserCheck,
    },
    {
      label: "ABSENT",
      value: absent.toLocaleString(),
      subtext: "Unrecorded congregants",
      icon: UserX,
    },
    {
      label: "ATTENDANCE RATE",
      value: `${rate}%`,
      isRate: true,
      delta: deltaPct,
      subtext: "Congregational participation",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/70 p-4 shadow-xs backdrop-blur-md transition-all hover:bg-card/90"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {card.label}
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                <Icon className="h-3.5 w-3.5" />
              </div>
            </div>

            <div className="mt-2 flex items-baseline gap-2">
              <span
                className="font-display text-3xl font-bold tracking-tight"
                style={card.isRate ? { color: "var(--brand-primary)" } : { color: "var(--foreground)" }}
              >
                {card.value}
              </span>
            </div>

            <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              {card.delta !== undefined && card.delta !== null ? (
                <span
                  className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.2 text-[10px] font-semibold ${
                    card.delta >= 0
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {card.delta >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {card.delta > 0 ? `+${card.delta}%` : `${card.delta}%`}
                </span>
              ) : null}
              <span className="truncate text-[11px]">{card.subtext}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
