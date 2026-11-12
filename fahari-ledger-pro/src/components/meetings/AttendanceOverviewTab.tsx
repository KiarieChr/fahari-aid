import React, { useMemo } from "react";
import {
  UserCheck,
  Trash2,
  Calendar,
  Clock,
  Sparkles,
  AlertCircle,
  Plus,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  getDeterministicAvatarColor,
  getInitials,
  formatRelativeMinutes,
} from "./meeting-utils";
import type { AttendanceRecord, MeetingListItem } from "./types";

interface AttendanceOverviewTabProps {
  meeting: MeetingListItem | null;
  attendances: AttendanceRecord[];
  loading: boolean;
  onOpenKiosk: () => void;
  onSelectMember: (memberId: number) => void;
  onRemoveAttendance: (attId: number) => void;
}

export function AttendanceOverviewTab({
  meeting,
  attendances,
  loading,
  onOpenKiosk,
  onSelectMember,
  onRemoveAttendance,
}: AttendanceOverviewTabProps) {
  // Compute check-in pace sparkline in 5-minute buckets
  const { paceData, isFuture } = useMemo(() => {
    if (!meeting || !meeting.start_time) return { paceData: [], isFuture: false };

    const startTime = new Date(meeting.start_time).getTime();
    const now = Date.now();

    if (startTime > now) {
      return { paceData: [], isFuture: true };
    }

    const endTime = meeting.end_time ? new Date(meeting.end_time).getTime() : now;
    const windowEnd = Math.max(startTime + 30 * 60 * 1000, Math.min(endTime, now));

    const bucketSize = 5 * 60 * 1000; // 5 minutes
    const buckets: Record<number, number> = {};

    for (let t = startTime; t <= windowEnd; t += bucketSize) {
      buckets[t] = 0;
    }

    attendances.forEach((att) => {
      const loginTime = new Date(att.login_time).getTime();
      if (loginTime >= startTime) {
        // Find bucket index
        const bucketKey = Math.floor((loginTime - startTime) / bucketSize) * bucketSize + startTime;
        if (buckets[bucketKey] !== undefined) {
          buckets[bucketKey] += 1;
        }
      }
    });

    const series = Object.entries(buckets).map(([timeMs, count], idx) => {
      const minuteOffset = Math.floor((Number(timeMs) - startTime) / 60000);
      return {
        bucket: `+${minuteOffset}m`,
        count,
        time: Number(timeMs),
      };
    });

    return { paceData: series, isFuture: false };
  }, [meeting, attendances]);

  if (!meeting) {
    return (
      <Card className="border-border/70 bg-card/60 p-12 text-center">
        <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
        <h3 className="font-semibold text-foreground text-base">Select a meeting</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
          Please select a meeting from the toolbar dropdown above to view check-ins and pace analytics.
        </p>
      </Card>
    );
  }

  const meetingStartTime = new Date(meeting.start_time).getTime();

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      {/* Left 2/3: Check-in Log Table */}
      <div className="xl:col-span-2 space-y-4">
        <Card className="border-border/70 bg-card/80 shadow-xs backdrop-blur-xs">
          <CardHeader className="border-b border-border/70 px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-foreground">
                  Check-in Log
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  {attendances.length} members checked into this session
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={onOpenKiosk}
                style={{ backgroundColor: "var(--brand-primary)" }}
                className="text-white hover:opacity-95 text-xs shadow-xs"
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Mark Check-in
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center justify-between gap-4 py-2">
                    <Skeleton className="h-4 w-8" />
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-6 w-6 rounded-full" />
                  </div>
                ))}
              </div>
            ) : attendances.length === 0 ? (
              <div className="p-10 text-center">
                <UserCheck className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
                <h4 className="font-medium text-foreground text-sm">
                  No one has checked in to this meeting yet
                </h4>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto mb-4">
                  Launch the live kiosk or search eligible members to record attendance check-ins.
                </p>
                <Button
                  size="sm"
                  onClick={onOpenKiosk}
                  style={{ backgroundColor: "var(--brand-primary)" }}
                  className="text-white hover:opacity-95 text-xs"
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Mark Attendance
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border/70 hover:bg-transparent">
                      <TableHead className="w-12 text-xs font-semibold">#</TableHead>
                      <TableHead className="text-xs font-semibold">Member</TableHead>
                      <TableHead className="text-xs font-semibold">Checked In</TableHead>
                      <TableHead className="text-xs font-semibold">Duration</TableHead>
                      <TableHead className="w-16 text-right text-xs font-semibold">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendances.map((att, idx) => {
                      const loginTime = new Date(att.login_time).getTime();
                      const minutesDiff = Math.max(
                        0,
                        Math.round((loginTime - meetingStartTime) / 60000)
                      );
                      const relativeStr = formatRelativeMinutes(minutesDiff);

                      // Duration since login till now
                      const minutesElapsed = Math.max(
                        0,
                        Math.round((Date.now() - loginTime) / 60000)
                      );
                      const durationStr =
                        minutesElapsed < 60
                          ? `${minutesElapsed}m`
                          : `${Math.floor(minutesElapsed / 60)}h ${minutesElapsed % 60}m`;

                      return (
                        <TableRow
                          key={att.id}
                          onClick={() => onSelectMember(att.member_id)}
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              onSelectMember(att.member_id);
                            }
                          }}
                          className="cursor-pointer transition-colors hover:bg-secondary/40 focus-visible:bg-secondary/50 focus-visible:outline-none"
                        >
                          <TableCell className="py-3 text-xs text-muted-foreground font-mono">
                            {idx + 1}
                          </TableCell>

                          <TableCell className="py-3">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${getDeterministicAvatarColor(
                                  att.member_id
                                )}`}
                              >
                                {getInitials(att.member_name)}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="font-semibold text-xs text-foreground truncate hover:text-gold transition-colors">
                                  {att.member_name}
                                </span>
                                <span className="text-[11px] text-muted-foreground truncate">
                                  {att.phone_no || "No phone"}
                                </span>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="py-3 text-xs">
                            <span className="font-mono font-medium text-foreground">
                              {relativeStr}
                            </span>
                            <span className="text-[10px] text-muted-foreground ml-1">
                              ({new Date(att.login_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})
                            </span>
                          </TableCell>

                          <TableCell className="py-3">
                            <Badge
                              variant="outline"
                              className="text-[10px] font-mono border-border bg-muted/40"
                            >
                              {durationStr}
                            </Badge>
                          </TableCell>

                          <TableCell
                            className="py-3 text-right"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onRemoveAttendance(att.id)}
                                    className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="left">Remove check-in</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right 1/3: Meeting Summary Card */}
      <div className="space-y-4">
        <Card className="border-border/70 bg-card/80 shadow-xs backdrop-blur-xs">
          <CardHeader className="border-b border-border/70 pb-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Session Summary
              </span>
              <Badge variant="secondary" className="text-[11px]">
                {meeting.meeting_type_name || "Service"}
              </Badge>
            </div>
            <CardTitle className="text-base font-bold text-foreground mt-1">
              {meeting.name}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-4 space-y-4">
            {/* Facilitator info */}
            <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 p-3">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${getDeterministicAvatarColor(
                  meeting.facilitator_id || meeting.facilitator_name || 0
                )}`}
              >
                {getInitials(meeting.facilitator_name)}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">
                  Facilitator
                </span>
                <span className="text-xs font-semibold text-foreground truncate">
                  {meeting.facilitator_name || "Unassigned"}
                </span>
              </div>
            </div>

            {/* Scheduled vs actual */}
            <div className="space-y-1 rounded-xl border border-border/60 bg-muted/20 p-3 text-xs">
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Scheduled Time:</span>
                <span className="font-medium text-foreground">
                  {new Date(meeting.start_time).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {meeting.end_time
                    ? ` – ${new Date(meeting.end_time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}`
                    : ""}
                </span>
              </div>
              <div className="flex justify-between items-center text-muted-foreground pt-1 border-t border-border/40">
                <span>First Check-in:</span>
                <span className="font-medium text-foreground">
                  {attendances.length > 0
                    ? new Date(
                        attendances[attendances.length - 1].login_time
                      ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : "No check-ins"}
                </span>
              </div>
            </div>

            {/* Check-in Pace Sparkline */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">
                  Check-in Pace
                </span>
                <span className="text-[10px] text-muted-foreground">5-min intervals</span>
              </div>

              {isFuture ? (
                <div className="rounded-xl border border-border/60 bg-muted/20 p-6 text-center text-xs text-muted-foreground">
                  <Clock className="mx-auto h-5 w-5 mb-1 text-muted-foreground/60" />
                  Not yet started
                </div>
              ) : paceData.length === 0 || attendances.length === 0 ? (
                <div className="rounded-xl border border-border/60 bg-muted/20 p-6 text-center text-xs text-muted-foreground">
                  No check-in pace data recorded
                </div>
              ) : (
                <div className="h-36 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={paceData}>
                      <XAxis
                        dataKey="bucket"
                        tick={{ fontSize: 9 }}
                        stroke="var(--muted-foreground)"
                        opacity={0.7}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 9 }}
                        stroke="var(--muted-foreground)"
                        opacity={0.7}
                        width={24}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "var(--popover)",
                          borderColor: "var(--border)",
                          borderRadius: "8px",
                          fontSize: "11px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="var(--brand-primary, #1e3a8a)"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
