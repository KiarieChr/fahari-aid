import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  CheckCircle2,
  Phone,
  MessageSquare,
  ExternalLink,
  ShieldAlert,
  ArrowUpDown,
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
  getDeterministicAvatarColor,
  getInitials,
  formatTimeAgo,
} from "./meeting-utils";
import type { IndividualAttendanceMember } from "./types";

interface AttendanceFollowupTabProps {
  members: IndividualAttendanceMember[];
  loading: boolean;
  onSelectMember: (memberId: number) => void;
}

export function AttendanceFollowupTab({
  members,
  loading,
  onSelectMember,
}: AttendanceFollowupTabProps) {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<"rate" | "last_attended" | "name">("rate");

  const sortedMembers = useMemo(() => {
    const list = [...members];
    if (sortBy === "rate") {
      list.sort((a, b) => a.attendance_rate - b.attendance_rate);
    } else if (sortBy === "last_attended") {
      list.sort((a, b) => {
        const timeA = a.last_attended ? new Date(a.last_attended).getTime() : 0;
        const timeB = b.last_attended ? new Date(b.last_attended).getTime() : 0;
        return timeA - timeB;
      });
    } else if (sortBy === "name") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [members, sortBy]);

  return (
    <div className="space-y-5">
      {/* Top Header: Count Pill + Sort Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 px-3 py-1 text-xs font-semibold"
          >
            <ShieldAlert className="mr-1.5 h-3.5 w-3.5" />
            {members.length} members below 50%
          </Badge>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            Pastoral follow-up recommended
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <ArrowUpDown className="h-3.5 w-3.5" />
            Sort by:
          </span>
          <Select
            value={sortBy}
            onValueChange={(val: "rate" | "last_attended" | "name") => setSortBy(val)}
          >
            <SelectTrigger className="w-36 h-8 text-xs bg-card/80">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rate" className="text-xs">Attendance Rate</SelectItem>
              <SelectItem value="last_attended" className="text-xs">Last Attended</SelectItem>
              <SelectItem value="name" className="text-xs">Member Name</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Cards Grid or Empty / Loading State */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="border-border/70 bg-card/60 p-4 space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-12 w-full rounded-lg" />
              <div className="flex gap-2">
                <Skeleton className="h-8 flex-1" />
                <Skeleton className="h-8 w-10" />
                <Skeleton className="h-8 w-10" />
              </div>
            </Card>
          ))}
        </div>
      ) : sortedMembers.length === 0 ? (
        <Card className="border-emerald-500/30 bg-emerald-500/5 p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-3">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h3 className="font-semibold text-foreground text-base">
            No members below 50% — pastoral quorum is healthy
          </h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
            Congregational engagement meets standard pastoral thresholds across active cell groups and ministries.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedMembers.map((member) => {
            const lastRelative = formatTimeAgo(member.last_attended);
            const rate = member.attendance_rate;

            const rateColor =
              rate < 25
                ? "text-rose-600 dark:text-rose-400"
                : rate < 40
                ? "text-orange-500"
                : "text-amber-500";

            return (
              <Card
                key={member.member_id}
                onClick={() => onSelectMember(member.member_id)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectMember(member.member_id);
                  }
                }}
                className="group relative cursor-pointer overflow-hidden border-border/70 bg-card/80 p-4 shadow-xs backdrop-blur-xs transition-all hover:border-gold/50 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${getDeterministicAvatarColor(
                        member.member_id
                      )}`}
                    >
                      {getInitials(member.name)}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-sm text-foreground truncate group-hover:text-gold transition-colors">
                        {member.name}
                      </span>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        #MEM-{member.member_id}
                      </span>
                    </div>
                  </div>

                  {member.cell_name && member.cell_name !== "Unassigned" ? (
                    <Badge variant="outline" className="text-[10px] shrink-0 border-border bg-card">
                      {member.cell_name}
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-[10px] shrink-0 border-amber-500/30 bg-amber-500/10 text-amber-600"
                    >
                      No cell assigned
                    </Badge>
                  )}
                </div>

                {/* KPI block: Attendance rate visual anchor */}
                <div className="my-4 rounded-xl border border-border/60 bg-muted/30 p-3 flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Attendance Rate
                    </span>
                    <span className={`font-display text-2xl font-bold tracking-tight ${rateColor}`}>
                      {rate}%
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Last Check-in
                    </span>
                    <span className="text-xs font-medium text-foreground">
                      {lastRelative}
                    </span>
                  </div>
                </div>

                {/* Contact Actions Row */}
                <div
                  className="flex items-center gap-2 pt-1 border-t border-border/60"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    asChild
                    size="sm"
                    style={{ backgroundColor: "var(--brand-primary)" }}
                    className="flex-1 h-8 text-xs text-white hover:opacity-95 shadow-xs"
                  >
                    <Link
                      to="/members"
                      search={{ view: "directory", member_id: String(member.member_id) }}
                    >
                      <ExternalLink className="mr-1.5 h-3 w-3" />
                      Open Follow-Up
                    </Link>
                  </Button>

                  {member.phone_no ? (
                    <>
                      <Button
                        asChild
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-border bg-background hover:bg-secondary"
                        title={`Call ${member.phone_no}`}
                      >
                        <a href={`tel:${member.phone_no}`}>
                          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        </a>
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-border bg-background hover:bg-secondary"
                        title={`SMS ${member.phone_no}`}
                      >
                        <a href={`sms:${member.phone_no}`}>
                          <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                        </a>
                      </Button>
                    </>
                  ) : null}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
