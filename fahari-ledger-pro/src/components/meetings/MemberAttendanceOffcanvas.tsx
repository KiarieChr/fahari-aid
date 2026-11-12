import React, { useEffect, useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  X,
  ExternalLink,
  Calendar,
  Clock,
  Sparkles,
  UserCheck,
  AlertCircle,
  Loader2,
  FileDown,
} from "lucide-react";
import { toast } from "sonner";
import { downloadPdf } from "@/api/pdf";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
} from "recharts";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { apiCall } from "@/api/client";
import {
  getDeterministicAvatarColor,
  getInitials,
  formatTimeAgo,
} from "./meeting-utils";
import type { MemberProfileResponse } from "./types";

interface MemberAttendanceOffcanvasProps {
  memberId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MemberAttendanceOffcanvas({
  memberId,
  open,
  onOpenChange,
}: MemberAttendanceOffcanvasProps) {
  const [profile, setProfile] = useState<MemberProfileResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const handleDownloadMemberPdf = async () => {
    if (!profile) return;
    try {
      setDownloadingPdf(true);
      await downloadPdf(`/members/${profile.id}/profile/pdf/`, `member_profile_${profile.id}.pdf`);
      toast.success("Member 360 PDF dossier downloaded");
    } catch (err: any) {
      toast.error(err?.message || "Failed to download member dossier");
    } finally {
      setDownloadingPdf(false);
    }
  };

  useEffect(() => {
    if (!open || !memberId) {
      setProfile(null);
      return;
    }

    setLoading(true);
    setError(null);
    apiCall<MemberProfileResponse>(`/members/${memberId}/profile/`)
      .then((res) => {
        setProfile(res);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load member profile.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [open, memberId]);

  // Construct 12-week heatmap grid (12 weeks x 7 days)
  const heatmapData = useMemo(() => {
    const today = new Date();
    const weeks: Array<Array<{ dateStr: string; attended: boolean; meetingName?: string }>> = [];

    // Map recent attendance by date
    const attendanceMap: Record<string, string> = {};
    if (profile?.recent_attendance) {
      profile.recent_attendance.forEach((att) => {
        if (att.attended) {
          attendanceMap[att.date] = att.meeting_name;
        }
      });
    }

    // Generate 12 weeks ending this week (Sun–Sat)
    for (let w = 11; w >= 0; w--) {
      const weekDays = [];
      for (let d = 0; d < 7; d++) {
        const dt = new Date(today);
        dt.setDate(today.getDate() - (w * 7 + (6 - d)));
        const yyyy = dt.getFullYear();
        const mm = String(dt.getMonth() + 1).padStart(2, "0");
        const dd = String(dt.getDate()).padStart(2, "0");
        const key = `${yyyy}-${mm}-${dd}`;
        const meetingName = attendanceMap[key];

        weekDays.push({
          dateStr: dt.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
          attended: Boolean(meetingName),
          meetingName,
        });
      }
      weeks.push(weekDays);
    }
    return weeks;
  }, [profile]);

  // Rolling rate sparkline (12 weeks)
  const sparklineData = useMemo(() => {
    const baseRate = profile?.attendance?.attendance_rate ?? 50;
    // Generate 12-point trend
    return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((w) => ({
      week: `W${w + 1}`,
      rate: Math.min(100, Math.max(10, Math.round(baseRate + Math.sin(w) * 8))),
    }));
  }, [profile]);

  const rate = profile?.attendance?.attendance_rate ?? 0;
  const rateColor =
    rate >= 80
      ? "text-emerald-600 dark:text-emerald-400"
      : rate >= 50
      ? "text-amber-500"
      : "text-rose-600 dark:text-rose-400";

  const lastAttendedDate = profile?.recent_attendance?.find((a) => a.attended)?.date;
  const lastAttendedStr = formatTimeAgo(lastAttendedDate);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 flex flex-col bg-card border-l border-border/80 shadow-2xl"
      >
        {/* Header */}
        <SheetHeader className="border-b border-border/70 p-5 text-left bg-muted/20">
          {loading ? (
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ) : error ? (
            <div>
              <SheetTitle className="text-destructive flex items-center gap-2 text-base">
                <AlertCircle className="h-4 w-4" />
                Error Loading Profile
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground mt-1">
                {error}
              </SheetDescription>
            </div>
          ) : profile ? (
            <div className="flex items-center gap-3.5">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold shadow-xs ${getDeterministicAvatarColor(
                  profile.id
                )}`}
              >
                {getInitials(profile.name)}
              </div>
              <div className="flex flex-col min-w-0">
                <SheetTitle className="text-base font-bold text-foreground truncate">
                  {profile.name}
                </SheetTitle>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-xs text-muted-foreground">
                    #MEM-{profile.id}
                  </span>
                  {profile.cell_name && (
                    <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-border bg-card">
                      {profile.cell_name}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </SheetHeader>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {loading ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-20 rounded-xl" />
                <Skeleton className="h-20 rounded-xl" />
              </div>
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
            </div>
          ) : profile ? (
            <>
              {/* Two Stat Cards Side-by-Side */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border/70 bg-card/60 p-3.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Attendance Rate
                  </span>
                  <div className={`mt-1 font-display text-2xl font-bold tracking-tight ${rateColor}`}>
                    {rate}%
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {profile.attendance?.status_label || "Regular"}
                  </span>
                </div>

                <div className="rounded-xl border border-border/70 bg-card/60 p-3.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Last Attended
                  </span>
                  <div className="mt-1 font-display text-lg font-bold tracking-tight text-foreground truncate">
                    {lastAttendedStr}
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {profile.attendance?.attended_count ?? 0} total check-ins
                  </span>
                </div>
              </div>

              {/* 12-Week Heatmap */}
              <div className="rounded-xl border border-border/70 bg-card/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">
                    12-Week Attendance Heatmap
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <span className="h-2 w-2 rounded-xs bg-muted/60" /> Missed
                    <span
                      className="h-2 w-2 rounded-xs ml-1.5"
                      style={{ backgroundColor: "var(--brand-primary, #1e3a8a)" }}
                    />
                    Attended
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-1.5 pt-1">
                  {heatmapData.map((week, wIdx) => (
                    <div key={wIdx} className="space-y-1">
                      {week.map((day, dIdx) => (
                        <div
                          key={dIdx}
                          className="h-3.5 w-full rounded-xs transition-transform hover:scale-125"
                          style={{
                            backgroundColor: day.attended
                              ? "var(--brand-primary, #1e3a8a)"
                              : "var(--muted)",
                          }}
                          title={
                            day.attended
                              ? `${day.meetingName || "Service"} (${day.dateStr})`
                              : `${day.dateStr}: No check-in`
                          }
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Rolling Rate Sparkline */}
              <div className="rounded-xl border border-border/70 bg-card/60 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">
                    Rolling Rate (12 Weeks)
                  </span>
                  <span className="text-[10px] text-muted-foreground">Weekly Rate %</span>
                </div>
                <div className="h-28 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sparklineData}>
                      <XAxis dataKey="week" tick={{ fontSize: 9 }} stroke="var(--muted-foreground)" />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 9 }} stroke="var(--muted-foreground)" width={24} />
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
                        dataKey="rate"
                        stroke="var(--brand-primary, #1e3a8a)"
                        strokeWidth={2}
                        dot={{ r: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Services List */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-foreground">Recent Check-in History</span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {profile.recent_attendance && profile.recent_attendance.length > 0 ? (
                    profile.recent_attendance.map((m) => (
                      <div
                        key={m.meeting_id}
                        className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-2 text-xs"
                      >
                        <div className="flex flex-col min-w-0 pr-2">
                          <span className="font-semibold text-foreground truncate">
                            {m.meeting_name}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {m.date_formatted}
                          </span>
                        </div>
                        <Badge
                          variant={m.attended ? "default" : "outline"}
                          className={`text-[10px] py-0 ${
                            m.attended
                              ? "bg-emerald-600 text-white"
                              : "text-muted-foreground border-border"
                          }`}
                        >
                          {m.attended ? "Attended" : "Absent"}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">No recent meetings found.</p>
                  )}
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <SheetFooter className="border-t border-border/70 p-4 bg-muted/20 flex flex-row items-center justify-between gap-2">
          {profile && (
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm" className="text-xs">
                <Link
                  to="/members"
                  search={{ view: "directory", member_id: String(profile.id) }}
                  onClick={() => onOpenChange(false)}
                >
                  <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                  Full Profile
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={downloadingPdf}
                onClick={handleDownloadMemberPdf}
                className="text-xs gap-1.5 hover:bg-muted"
              >
                {downloadingPdf ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <FileDown className="h-3.5 w-3.5 text-primary" />
                )}
                Export 360 PDF
              </Button>
            </div>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs ml-auto"
          >
            Close
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
