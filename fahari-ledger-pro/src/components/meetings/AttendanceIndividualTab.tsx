import React from "react";
import { useNavigate } from "@tanstack/react-router";
import { Users, X, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  getDeterministicAvatarColor,
  getInitials,
  getSemanticStatusBadgeClass,
  formatTimeAgo,
} from "./meeting-utils";
import type {
  IndividualAttendanceMember,
  MeetingsFiltersLookup,
} from "./types";

interface AttendanceIndividualTabProps {
  members: IndividualAttendanceMember[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  loading: boolean;
  searchParams: Record<string, string | undefined>;
  filtersLookup: MeetingsFiltersLookup;
  onSelectMember: (memberId: number) => void;
}

export function AttendanceIndividualTab({
  members,
  totalCount,
  currentPage,
  totalPages,
  loading,
  searchParams,
  filtersLookup,
  onSelectMember,
}: AttendanceIndividualTabProps) {
  const navigate = useNavigate();

  // Active filter chips
  const activeChips: Array<{ key: string; label: string; value: string }> = [];

  if (searchParams.cell_id && searchParams.cell_id !== "all") {
    const cName =
      filtersLookup.cells.find((c) => String(c.id) === searchParams.cell_id)?.name ||
      `Cell #${searchParams.cell_id}`;
    activeChips.push({ key: "cell_id", label: "Cell", value: cName });
  }

  if (searchParams.department_id && searchParams.department_id !== "all") {
    const dName =
      filtersLookup.departments.find((d) => String(d.id) === searchParams.department_id)?.name ||
      `Dept #${searchParams.department_id}`;
    activeChips.push({ key: "department_id", label: "Department", value: dName });
  }

  if (searchParams.gender && searchParams.gender !== "all") {
    activeChips.push({
      key: "gender",
      label: "Gender",
      value: searchParams.gender.charAt(0).toUpperCase() + searchParams.gender.slice(1),
    });
  }

  if (searchParams.status && searchParams.status !== "all") {
    activeChips.push({
      key: "status",
      label: "Status",
      value: searchParams.status,
    });
  }

  const removeFilter = (key: string) => {
    navigate({
      search: ((prev: any) => ({
        ...prev,
        [key]: undefined,
        page: undefined,
      })) as any,
    });
  };

  const clearAllFilters = () => {
    navigate({
      search: ((prev: any) => ({
        ...prev,
        cell_id: undefined,
        department_id: undefined,
        gender: undefined,
        status: undefined,
        page: undefined,
      })) as any,
    });
  };

  return (
    <div className="space-y-4">
      {/* Filter Summary Chips Bar */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-card/60 p-2.5">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider pl-1">
            Active Filters:
          </span>
          {activeChips.map((chip) => (
            <div
              key={chip.key}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background px-2.5 py-0.5 text-xs text-foreground shadow-xs"
            >
              <span className="text-muted-foreground">{chip.label}:</span>
              <span className="font-semibold">{chip.value}</span>
              <button
                onClick={() => removeFilter(chip.key)}
                className="ml-0.5 rounded-full p-0.5 hover:bg-secondary text-muted-foreground hover:text-foreground"
                aria-label={`Remove filter ${chip.label}`}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <button
            onClick={clearAllFilters}
            className="text-xs font-semibold text-gold hover:underline ml-auto pr-1"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Dense Table Card */}
      <Card className="border-border/70 bg-card/80 shadow-xs backdrop-blur-xs">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex items-center justify-between gap-4 py-2">
                  <Skeleton className="h-4 w-6" />
                  <Skeleton className="h-5 w-44" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ) : members.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <Users className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <h3 className="font-semibold text-foreground text-base">
                No members match the current filters
              </h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mb-4">
                Try widening your cell, department, or status filters to view records.
              </p>
              <Button variant="outline" size="sm" onClick={clearAllFilters}>
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/70 hover:bg-transparent">
                    <TableHead className="w-10 text-xs font-semibold">#</TableHead>
                    <TableHead className="text-xs font-semibold">Member</TableHead>
                    <TableHead className="text-xs font-semibold">Cell</TableHead>
                    <TableHead className="text-xs font-semibold">Department</TableHead>
                    <TableHead className="text-xs font-semibold">Attended / Total</TableHead>
                    <TableHead className="text-xs font-semibold text-center">Rate</TableHead>
                    <TableHead className="text-xs font-semibold text-center">Status</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Last Attended</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member, idx) => {
                    const rowNum = (currentPage - 1) * 20 + idx + 1;
                    const pct = Math.min(100, Math.max(0, member.attendance_rate));
                    const statusClass = getSemanticStatusBadgeClass(member.status_label);
                    const lastRelative = formatTimeAgo(member.last_attended);
                    const lastAbsolute = member.last_attended
                      ? new Date(member.last_attended).toLocaleString()
                      : "Never logged";

                    return (
                      <TableRow
                        key={member.member_id}
                        onClick={() => onSelectMember(member.member_id)}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onSelectMember(member.member_id);
                          }
                        }}
                        className="cursor-pointer transition-colors hover:bg-secondary/40 focus-visible:bg-secondary/50 focus-visible:outline-none"
                      >
                        <TableCell className="py-2.5 text-xs text-muted-foreground font-mono">
                          {rowNum}
                        </TableCell>

                        {/* Member avatar + name + ID */}
                        <TableCell className="py-2.5">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${getDeterministicAvatarColor(
                                member.member_id
                              )}`}
                            >
                              {getInitials(member.name)}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-semibold text-xs text-foreground truncate hover:text-gold transition-colors">
                                {member.name}
                              </span>
                              <span className="font-mono text-[10px] text-muted-foreground">
                                #MEM-{member.member_id}
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        {/* Cell pill */}
                        <TableCell className="py-2.5">
                          {member.cell_name && member.cell_name !== "Unassigned" ? (
                            <Badge variant="outline" className="text-[11px] font-normal border-border bg-card">
                              {member.cell_name}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">
                              Unassigned
                            </span>
                          )}
                        </TableCell>

                        {/* Department pill */}
                        <TableCell className="py-2.5">
                          <Badge variant="secondary" className="text-[11px] font-normal">
                            {member.department || "General"}
                          </Badge>
                        </TableCell>

                        {/* Mini bar + fraction */}
                        <TableCell className="py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-secondary">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${pct}%`,
                                  backgroundColor: "var(--brand-primary, #1e3a8a)",
                                }}
                              />
                            </div>
                            <span className="font-mono text-xs font-semibold text-foreground">
                              {member.attended_count}
                              <span className="text-muted-foreground font-normal">/{member.total_meetings}</span>
                            </span>
                          </div>
                        </TableCell>

                        {/* Colored Rate Number */}
                        <TableCell className="py-2.5 text-center">
                          <span
                            className="font-mono text-xs font-bold"
                            style={{
                              color:
                                pct >= 80
                                  ? "rgb(16, 185, 129)"
                                  : pct >= 50
                                  ? "rgb(217, 119, 6)"
                                  : "rgb(239, 68, 68)",
                            }}
                          >
                            {member.attendance_rate}%
                          </span>
                        </TableCell>

                        {/* Semantic Status Badge */}
                        <TableCell className="py-2.5 text-center">
                          <span
                            className={`inline-block rounded-md border px-2 py-0.5 text-[10px] uppercase tracking-wider ${statusClass}`}
                          >
                            {member.status_label}
                          </span>
                        </TableCell>

                        {/* Last Attended relative + title tooltip */}
                        <TableCell className="py-2.5 text-right text-xs" title={lastAbsolute}>
                          <span className="text-foreground">{lastRelative}</span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {!loading && members.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border/70 px-4 py-3 text-xs text-muted-foreground">
              <span>
                Showing {(currentPage - 1) * 20 + 1}–
                {Math.min(currentPage * 20, totalCount)} of {totalCount} records
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() =>
                    navigate({
                      search: ((prev: any) => ({
                        ...prev,
                        page: String(currentPage - 1),
                      })) as any,
                    })
                  }
                  className="h-7 text-xs"
                >
                  Previous
                </Button>
                <span className="px-2 font-medium text-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() =>
                    navigate({
                      search: ((prev: any) => ({
                        ...prev,
                        page: String(currentPage + 1),
                      })) as any,
                    })
                  }
                  className="h-7 text-xs"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
