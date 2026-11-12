import React from "react";
import { Link } from "@tanstack/react-router";
import {
  Activity,
  Users,
  ShieldAlert,
  BarChart3,
} from "lucide-react";

interface AttendanceSubNavProps {
  currentTab: string;
  searchParams: Record<string, string | undefined>;
}

export function AttendanceSubNav({
  currentTab,
  searchParams,
}: AttendanceSubNavProps) {
  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: Activity,
    },
    {
      id: "individual",
      label: "Individual Tracking",
      icon: Users,
    },
    {
      id: "followup",
      label: "Follow-up Needed",
      icon: ShieldAlert,
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
    },
  ];

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = (currentTab || "overview") === tab.id;

        // Build target search params preserving meeting_id, cell_id, etc.
        const targetSearch = {
          ...searchParams,
          view: "attendance",
          tab: tab.id,
        };

        return (
          <Link
            key={tab.id}
            to="/meetings"
            search={targetSearch as any}
            className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              isActive
                ? "text-white shadow-sm"
                : "border border-border/60 bg-card/60 text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
            }`}
            style={
              isActive
                ? {
                    background:
                      "linear-gradient(135deg, var(--brand-primary, #1e3a8a) 0%, var(--brand-accent, #d97706) 100%)",
                  }
                : undefined
            }
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
