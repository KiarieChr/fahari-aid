import React from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Calendar,
  Filter,
  Download,
  UserCheck,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MeetingsFiltersLookup, MeetingListItem } from "./types";

interface AttendanceToolbarProps {
  searchParams: Record<string, string | undefined>;
  filtersLookup: MeetingsFiltersLookup;
  meetings: MeetingListItem[];
  onOpenKiosk: () => void;
  onExportCsv: () => void;
}

export function AttendanceToolbar({
  searchParams,
  filtersLookup,
  meetings,
  onOpenKiosk,
  onExportCsv,
}: AttendanceToolbarProps) {
  const navigate = useNavigate();

  const selectedMeetingId = searchParams.meeting_id || "";
  const selectedCellId = searchParams.cell_id || "all";
  const selectedDeptId = searchParams.department_id || "all";
  const selectedGender = searchParams.gender || "all";
  const currentStatus = searchParams.status || "all";

  const handleUpdate = (patch: Record<string, string | undefined>) => {
    navigate({
      search: ((prev: any) => ({
        ...prev,
        ...patch,
        page: undefined, // Reset page on filter changes
      })) as any,
    });
  };

  const statusOptions = [
    { label: "All", value: "all" },
    { label: "Regular", value: "regular" },
    { label: "Irregular", value: "irregular" },
    { label: "Needs Follow-up", value: "needs follow-up" },
  ];

  return (
    <div className="rounded-2xl border border-border/70 bg-card/70 p-4 shadow-xs backdrop-blur-md space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* 1. Meeting Select */}
          <div className="w-full sm:w-64">
            <Select
              value={selectedMeetingId}
              onValueChange={(val) => handleUpdate({ meeting_id: val || undefined })}
            >
              <SelectTrigger className="bg-background/80 h-9 text-xs">
                <Calendar className="mr-2 h-3.5 w-3.5 text-gold shrink-0" />
                <SelectValue placeholder="Select Meeting..." />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {meetings.map((m) => (
                  <SelectItem key={m.id} value={String(m.id)} className="text-xs">
                    {m.name} ({new Date(m.start_time).toLocaleDateString(undefined, { month: "short", day: "numeric" })})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 2. Cell Select */}
          <div className="w-36">
            <Select
              value={selectedCellId}
              onValueChange={(val) => handleUpdate({ cell_id: val === "all" ? undefined : val })}
            >
              <SelectTrigger className="bg-background/80 h-9 text-xs">
                <SelectValue placeholder="Cell Group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Cells</SelectItem>
                {filtersLookup.cells.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)} className="text-xs">
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 3. Department Select */}
          <div className="w-40">
            <Select
              value={selectedDeptId}
              onValueChange={(val) =>
                handleUpdate({ department_id: val === "all" ? undefined : val })
              }
            >
              <SelectTrigger className="bg-background/80 h-9 text-xs">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Departments</SelectItem>
                {filtersLookup.departments.map((d) => (
                  <SelectItem key={d.id} value={String(d.id)} className="text-xs">
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 4. Gender Select */}
          <div className="w-28">
            <Select
              value={selectedGender}
              onValueChange={(val) => handleUpdate({ gender: val === "all" ? undefined : val })}
            >
              <SelectTrigger className="bg-background/80 h-9 text-xs">
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Gender</SelectItem>
                <SelectItem value="male" className="text-xs">Male</SelectItem>
                <SelectItem value="female" className="text-xs">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Right CTA Actions: Export CSV + Mark Attendance */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onExportCsv}
            className="h-9 border-border bg-background/80 text-xs hover:bg-secondary/80"
          >
            <Download className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
            Export CSV
          </Button>

          <Button
            size="sm"
            onClick={onOpenKiosk}
            disabled={!selectedMeetingId}
            style={{ backgroundColor: "var(--brand-primary)" }}
            className="h-9 text-xs text-white hover:opacity-95 shadow-xs disabled:opacity-50"
            title={!selectedMeetingId ? "Select a meeting first" : undefined}
          >
            <UserCheck className="mr-1.5 h-3.5 w-3.5" />
            Mark Attendance
          </Button>
        </div>
      </div>

      {/* Status Pill Toggle Strip */}
      <div className="flex items-center gap-1.5 pt-1 border-t border-border/50">
        <span className="text-[11px] font-semibold text-muted-foreground mr-1.5 uppercase tracking-wider">
          Status:
        </span>
        <div className="flex flex-wrap items-center gap-1">
          {statusOptions.map((opt) => {
            const active = currentStatus.toLowerCase() === opt.value.toLowerCase();
            return (
              <button
                key={opt.value}
                onClick={() =>
                  handleUpdate({
                    status: opt.value === "all" ? undefined : opt.value,
                  })
                }
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-all ${
                  active
                    ? "bg-foreground text-background font-semibold shadow-xs"
                    : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
