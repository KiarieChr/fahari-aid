import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  BookOpen,
  Calendar,
  Clock,
  Plus,
  MoreVertical,
  CheckCircle2,
  FileText,
  UserCheck,
  Edit,
  ArrowRight,
  Filter,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiCall } from "@/api/client";
import {
  BRAND_ACCENTS,
  getDeterministicAvatarColor,
  getInitials,
} from "@/components/meetings/meeting-utils";
import type { MeetingListItem, MeetingTypeItem } from "@/components/meetings/types";

interface MinutesLandingViewProps {
  searchParams: Record<string, string | undefined>;
  types: MeetingTypeItem[];
  onOpenNewMeeting: () => void;
  onOpenEditMeeting: (meeting: MeetingListItem) => void;
}

export function MinutesLandingView({
  searchParams,
  types,
  onOpenNewMeeting,
  onOpenEditMeeting,
}: MinutesLandingViewProps) {
  const navigate = useNavigate();

  const [meetings, setMeetings] = useState<MeetingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selectedType = searchParams.type_id || "all";
  const selectedStatus = searchParams.status || "all";
  const selectedMonth = searchParams.month || "";

  const fetchMinutesMeetings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qp = new URLSearchParams();
      if (selectedType && selectedType !== "all") qp.set("type_id", selectedType);
      if (selectedStatus === "has_minutes") qp.set("has_minutes", "true");
      if (selectedStatus === "no_minutes") qp.set("has_minutes", "false");
      if (selectedMonth) {
        qp.set("date_from", `${selectedMonth}-01`);
        // approximate month end
        qp.set("date_to", `${selectedMonth}-31`);
      }

      const res = await apiCall<{ results: MeetingListItem[] }>(
        `/meetings/minutes/list/?${qp.toString()}`
      );
      setMeetings(res.results || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load minutes list.");
    } finally {
      setLoading(false);
    }
  }, [selectedType, selectedStatus, selectedMonth]);

  useEffect(() => {
    fetchMinutesMeetings();
  }, [fetchMinutesMeetings]);

  const updateSearch = (patch: Record<string, string | undefined>) => {
    navigate({
      search: ((prev: any) => ({
        ...prev,
        ...patch,
      })) as any,
    });
  };

  const statusOptions = [
    { label: "All", value: "all" },
    { label: "Has minutes", value: "has_minutes" },
    { label: "No minutes", value: "no_minutes" },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Page Header (Glass card with BookOpen icon) */}
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-6 shadow-sm backdrop-blur-md">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white shadow-md"
              style={{ background: "var(--brand-primary, #1e3a8a)" }}
            >
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
                Meeting Minutes
              </h1>
              <p className="text-sm text-muted-foreground">
                Official records, secretarial notes, and resolution archives for all church sessions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start rounded-full border border-border/80 bg-background/80 px-3.5 py-1.5 text-xs font-semibold text-muted-foreground shadow-xs sm:self-auto">
            <FileText className="h-3.5 w-3.5 text-gold" />
            <span>Centralized Secretarial Records</span>
          </div>
        </div>
      </div>

      {/* 2. Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card/70 p-4 shadow-xs backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Type Select */}
          <div className="w-48">
            <Select
              value={selectedType}
              onValueChange={(val) => updateSearch({ type_id: val === "all" ? undefined : val })}
            >
              <SelectTrigger className="bg-background/80 h-9 text-xs">
                <SelectValue placeholder="All Meeting Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Meeting Types</SelectItem>
                {types.map((t) => (
                  <SelectItem key={t.id} value={String(t.id)} className="text-xs">
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Month Picker */}
          <div className="w-40">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => updateSearch({ month: e.target.value || undefined })}
              className="h-9 w-full rounded-md border border-input bg-background/80 px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Filter by month"
            />
          </div>
        </div>

        {/* Status Toggle Strip */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-semibold text-muted-foreground mr-1.5 uppercase tracking-wider">
            Status:
          </span>
          <div className="flex items-center gap-1">
            {statusOptions.map((opt) => {
              const active = selectedStatus === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() =>
                    updateSearch({ status: opt.value === "all" ? undefined : opt.value })
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

      {/* 3. Meeting Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="border-border/70 bg-card/60 p-5 space-y-4">
              <Skeleton className="h-3 w-full rounded-full" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex items-center gap-3 pt-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-28" />
              </div>
            </Card>
          ))}
        </div>
      ) : meetings.length === 0 ? (
        <Card className="border-border/70 bg-card/60 p-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/40 mb-3" />
          <h3 className="font-semibold text-foreground text-base">
            No meetings have minutes yet. Open a meeting to write the first one.
          </h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto mb-4">
            You can create a new meeting right here or browse upcoming church gatherings in Meetings Hub.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button
              onClick={onOpenNewMeeting}
              style={{ backgroundColor: "var(--brand-primary)" }}
              className="text-white hover:opacity-95 text-xs"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Create Meeting
            </Button>
            <Button asChild variant="outline" size="sm" className="text-xs">
              <Link to="/meetings" search={{ view: "meetings" } as any}>
                Meetings Hub
              </Link>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Card Position 1: Create New Meeting Card */}
          <button
            onClick={onOpenNewMeeting}
            className="group flex min-h-[170px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/80 bg-card/40 p-6 text-center transition-all hover:border-gold hover:bg-card/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-transform group-hover:scale-110 group-hover:text-gold">
              <Plus className="h-5 w-5" />
            </div>
            <span className="font-semibold text-sm text-foreground group-hover:text-gold transition-colors mt-3">
              Create a new meeting
            </span>
            <span className="text-xs text-muted-foreground mt-0.5">
              Schedule session & write minutes
            </span>
          </button>

          {/* Meeting Cards */}
          {meetings.map((meeting, idx) => {
            const stripColor = BRAND_ACCENTS[idx % BRAND_ACCENTS.length];
            const hasMinutes = meeting.has_minutes;

            const st = new Date(meeting.start_time);
            const dateStr = isNaN(st.getTime())
              ? "—"
              : st.toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });
            const timeStr = isNaN(st.getTime())
              ? ""
              : st.toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                });

            return (
              <div
                key={meeting.id}
                onClick={() =>
                  navigate({
                    search: { meeting_id: String(meeting.id) } as any,
                  })
                }
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navigate({
                      search: { meeting_id: String(meeting.id) } as any,
                    });
                  }
                }}
                className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border/70 bg-card/80 p-5 shadow-xs backdrop-blur-xs transition-all hover:border-border hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                {/* Color-coded top strip */}
                <div
                  className="absolute left-0 top-0 h-1.5 w-full"
                  style={{ backgroundColor: stripColor }}
                />

                <div className="flex items-start justify-between gap-3 pt-1">
                  <div className="space-y-1 min-w-0 flex-1">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                      {meeting.meeting_type_name || "General"}
                    </span>
                    <h3 className="font-semibold text-base text-foreground truncate group-hover:text-gold transition-colors">
                      {meeting.name}
                    </h3>
                  </div>

                  {/* Overflow menu */}
                  <div onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground -mr-1"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            navigate({
                              search: { meeting_id: String(meeting.id) } as any,
                            })
                          }
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Edit Minutes
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() =>
                            navigate({
                              to: "/meetings",
                              search: {
                                view: "attendance",
                                meeting_id: String(meeting.id),
                                tab: "overview",
                              } as any,
                            })
                          }
                        >
                          <UserCheck className="mr-2 h-4 w-4" />
                          View Attendance
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => onOpenEditMeeting(meeting)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Meeting
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{dateStr}</span>
                  <span>·</span>
                  <Clock className="h-3.5 w-3.5" />
                  <span>{timeStr}</span>
                </div>

                {/* Facilitator & Status Pill */}
                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${getDeterministicAvatarColor(
                        meeting.facilitator_id || meeting.facilitator_name || meeting.id
                      )}`}
                    >
                      {getInitials(meeting.facilitator_name)}
                    </div>
                    <span className="text-xs text-foreground truncate max-w-[120px]">
                      {meeting.facilitator_name || "Unassigned"}
                    </span>
                  </div>

                  <Badge
                    variant="outline"
                    className={`text-[10px] uppercase font-bold shrink-0 ${
                      hasMinutes
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "border-border bg-muted/40 text-muted-foreground"
                    }`}
                  >
                    {hasMinutes ? "Ready" : "Not written"}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
