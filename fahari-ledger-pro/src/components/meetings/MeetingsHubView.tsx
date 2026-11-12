import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Calendar,
  Plus,
  Search,
  Copy,
  Edit,
  Trash2,
  BookOpen,
  UserCheck,
  MoreVertical,
  Flame,
  ArrowRight,
  ExternalLink,
  Layers,
  Clock,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { apiCall } from "@/api/client";
import {
  BRAND_ACCENTS,
  getDeterministicAvatarColor,
  getInitials,
} from "./meeting-utils";
import { MeetingFormModal } from "./MeetingFormModal";
import { MeetingTypeModal } from "./MeetingTypeModal";
import { DeleteMeetingDialog } from "./DeleteMeetingDialog";
import type {
  MeetingListItem,
  MeetingTypeItem,
  FacilitatorItem,
  MeetingsFiltersLookup,
} from "./types";

interface MeetingsHubViewProps {
  searchParams: Record<string, string | undefined>;
}

export function MeetingsHubView({ searchParams }: MeetingsHubViewProps) {
  const navigate = useNavigate();

  const currentTypeId = searchParams.type_id || "";
  const currentSearchQuery = searchParams.q || "";
  const currentPage = parseInt(searchParams.page || "1", 10);

  const [types, setTypes] = useState<MeetingTypeItem[]>([]);
  const [facilitators, setFacilitators] = useState<FacilitatorItem[]>([]);
  const [meetings, setMeetings] = useState<MeetingListItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(20);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search input with 300ms debounce
  const [searchInput, setSearchInput] = useState(currentSearchQuery);

  // Modals state
  const [meetingModalOpen, setMeetingModalOpen] = useState(false);
  const [typeModalOpen, setTypeModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<MeetingListItem | null>(null);
  const [deletingMeeting, setDeletingMeeting] = useState<MeetingListItem | null>(null);

  // Sync search input when URL changes
  useEffect(() => {
    setSearchInput(currentSearchQuery);
  }, [currentSearchQuery]);

  // Debounce search update to URL
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== currentSearchQuery) {
        navigate({
          search: ((prev: any) => ({
            ...prev,
            q: searchInput.trim() ? searchInput.trim() : undefined,
            page: undefined,
          })) as any,
        });
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput, currentSearchQuery, navigate]);

  // Load lookup data (types, facilitators)
  const fetchLookups = useCallback(async () => {
    try {
      const [typesRes, filtersRes] = await Promise.all([
        apiCall<MeetingTypeItem[]>("/meetings/types/"),
        apiCall<MeetingsFiltersLookup>("/meetings/filters/"),
      ]);
      setTypes(typesRes || []);
      setFacilitators(filtersRes.facilitators || []);
    } catch {
      // Handled silently
    }
  }, []);

  useEffect(() => {
    fetchLookups();
  }, [fetchLookups]);

  // Fetch meetings list
  const fetchMeetings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (currentSearchQuery) queryParams.set("q", currentSearchQuery);
      if (currentTypeId) queryParams.set("type_id", currentTypeId);
      if (currentPage > 1) queryParams.set("page", String(currentPage));

      const res = await apiCall<{ count: number; results: MeetingListItem[] }>(
        `/meetings/?${queryParams.toString()}`
      );
      setMeetings(res.results || []);
      setTotalCount(res.count || 0);
      setPageSize(20);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load meetings.");
    } finally {
      setLoading(false);
    }
  }, [currentSearchQuery, currentTypeId, currentPage]);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  const handleRefresh = () => {
    fetchLookups();
    fetchMeetings();
  };

  const handleCopyLink = (link: string | null) => {
    if (!link) return;
    navigator.clipboard.writeText(link);
    toast.success("Meeting link copied to clipboard.");
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  // Today's formatted date string
  const todayFormatted = useMemo(() => {
    return new Date().toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, []);

  return (
    <div className="space-y-6">
      {/* 1. Page Header (glass card matching /members?view=analytics) */}
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-6 shadow-sm backdrop-blur-md">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white shadow-md"
              style={{ background: "var(--brand-primary, #1e3a8a)" }}
            >
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
                Meetings Hub
              </h1>
              <p className="text-sm text-muted-foreground">
                Comprehensive directory for church services, leadership sessions, and cell gatherings.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start rounded-full border border-border/80 bg-background/80 px-3.5 py-1.5 text-xs font-semibold text-muted-foreground shadow-xs sm:self-auto">
            <Clock className="h-3.5 w-3.5 text-gold" />
            <span>{todayFormatted}</span>
          </div>
        </div>
      </div>

      {/* 2. Toolbar row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            onClick={() => {
              setEditingMeeting(null);
              setMeetingModalOpen(true);
            }}
            style={{ backgroundColor: "var(--brand-primary)" }}
            className="text-white hover:opacity-95 shadow-xs"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            New Meeting
          </Button>

          <Button
            variant="outline"
            onClick={() => setTypeModalOpen(true)}
            className="border-border bg-card/80 hover:bg-secondary/80"
          >
            <Layers className="mr-1.5 h-4 w-4 text-muted-foreground" />
            New Meeting Type
          </Button>

          <Button
            asChild
            variant="outline"
            className="border-border bg-card/80 hover:bg-secondary/80"
          >
            <Link to="/cells">
              <Flame className="mr-1.5 h-4 w-4 text-amber-500" />
              Cell Groups
            </Link>
          </Button>
        </div>

        <div className="relative w-full max-w-xs sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search meetings..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 bg-card/80"
          />
        </div>
      </div>

      {/* 3. Category Strip (dynamic grid, <= 90px tall cards) */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Meeting Categories
          </span>
          {currentTypeId && (
            <button
              onClick={() =>
                navigate({
                  search: ((prev: any) => ({ ...prev, type_id: undefined, page: undefined })) as any,
                })
              }
              className="text-xs font-medium text-gold hover:underline"
            >
              Clear Category Filter
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {types.map((type, idx) => {
            const isSelected = String(type.id) === currentTypeId;
            const accentColor = BRAND_ACCENTS[idx % BRAND_ACCENTS.length];

            return (
              <button
                key={type.id}
                onClick={() =>
                  navigate({
                    search: ((prev: any) => ({
                      ...prev,
                      type_id: isSelected ? undefined : String(type.id),
                      page: undefined,
                    })) as any,
                  })
                }
                className={`group relative flex h-[88px] flex-col justify-between rounded-xl border p-3 text-left transition-all duration-150 ${
                  isSelected
                    ? "border-gold/60 bg-gold/10 shadow-sm ring-1 ring-gold/40"
                    : "border-border/70 bg-card/70 hover:border-border hover:bg-card hover:shadow-xs"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="truncate text-xs font-semibold text-foreground group-hover:text-gold">
                    {type.name}
                  </span>
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: accentColor }}
                  />
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="font-display text-2xl font-bold tracking-tight text-foreground">
                    {type.meeting_count ?? 0}
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase">meetings</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Meetings Table */}
      <Card className="border-border/70 bg-card/80 shadow-xs backdrop-blur-xs">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between gap-4 py-3">
                  <Skeleton className="h-5 w-44" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="h-5 w-16" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <AlertCircle className="h-10 w-10 text-destructive mb-2" />
              <p className="font-medium text-foreground">Failed to load meetings</p>
              <p className="text-xs text-muted-foreground mt-1 mb-4">{error}</p>
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                Retry
              </Button>
            </div>
          ) : meetings.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground mb-3">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-foreground text-base">No meetings yet</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mb-4">
                {currentSearchQuery || currentTypeId
                  ? "No meetings match your filter parameters. Try clearing your filters."
                  : "No services or meetings have been scheduled yet. Create your first church gathering to start tracking check-ins."}
              </p>
              <Button
                onClick={() => {
                  setEditingMeeting(null);
                  setMeetingModalOpen(true);
                }}
                style={{ backgroundColor: "var(--brand-primary)" }}
                className="text-white hover:opacity-95"
              >
                <Plus className="mr-1.5 h-4 w-4" />
                New Meeting
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/70 hover:bg-transparent">
                    <TableHead className="font-semibold text-xs">Meeting</TableHead>
                    <TableHead className="font-semibold text-xs">Type</TableHead>
                    <TableHead className="font-semibold text-xs">Facilitator</TableHead>
                    <TableHead className="font-semibold text-xs">Schedule</TableHead>
                    <TableHead className="font-semibold text-xs text-center">Attendance</TableHead>
                    <TableHead className="w-[80px] text-right font-semibold text-xs">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {meetings.map((meeting) => {
                    const st = new Date(meeting.start_time);
                    const dateFormatted = isNaN(st.getTime())
                      ? "—"
                      : st.toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        });
                    const timeRange = isNaN(st.getTime())
                      ? ""
                      : st.toLocaleTimeString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                        });

                    return (
                      <TableRow
                        key={meeting.id}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setEditingMeeting(meeting);
                            setMeetingModalOpen(true);
                          }
                        }}
                        className="group transition-colors hover:bg-secondary/40 focus-visible:bg-secondary/50 focus-visible:outline-none"
                      >
                        {/* 1. Meeting Name + code */}
                        <TableCell className="py-3 font-medium">
                          <div className="flex flex-col">
                            <span className="font-semibold text-foreground group-hover:text-gold transition-colors">
                              {meeting.name}
                            </span>
                            <span className="font-mono text-[11px] text-muted-foreground">
                              {meeting.meeting_code || `#MTG-${meeting.id}`}
                            </span>
                          </div>
                        </TableCell>

                        {/* 2. Type pill */}
                        <TableCell className="py-3">
                          <Badge variant="secondary" className="text-[11px] font-normal">
                            {meeting.meeting_type_name || "General"}
                          </Badge>
                        </TableCell>

                        {/* 3. Facilitator avatar + name */}
                        <TableCell className="py-3">
                          <div className="flex items-center gap-2">
                            <div
                              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${getDeterministicAvatarColor(
                                meeting.facilitator_id || meeting.facilitator_name || meeting.id
                              )}`}
                            >
                              {getInitials(meeting.facilitator_name || "Leader")}
                            </div>
                            <span className="text-xs text-foreground truncate max-w-[150px]">
                              {meeting.facilitator_name || "Unassigned"}
                            </span>
                          </div>
                        </TableCell>

                        {/* 4. Schedule */}
                        <TableCell className="py-3">
                          <div className="flex flex-col text-xs">
                            <span className="font-medium text-foreground">{dateFormatted}</span>
                            <span className="text-[11px] text-muted-foreground">{timeRange}</span>
                          </div>
                        </TableCell>

                        {/* 5. Attendance Actionable Pill */}
                        <TableCell className="py-3 text-center">
                          <Link
                            to="/meetings"
                            search={{
                              view: "attendance",
                              meeting_id: String(meeting.id),
                              tab: "overview",
                            } as any}
                            className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-2.5 py-0.5 text-xs font-semibold text-gold-foreground hover:bg-gold/20 transition-colors"
                          >
                            <UserCheck className="h-3 w-3 text-gold" />
                            <span>{meeting.attendance_count}</span>
                          </Link>
                        </TableCell>

                        {/* 6. Actions Dropdown */}
                        <TableCell className="py-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
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
                                onClick={() => {
                                  setEditingMeeting(meeting);
                                  setMeetingModalOpen(true);
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Meeting
                              </DropdownMenuItem>

                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div>
                                      <DropdownMenuItem
                                        disabled={!meeting.meeting_link}
                                        onClick={() => handleCopyLink(meeting.meeting_link)}
                                      >
                                        <Copy className="mr-2 h-4 w-4" />
                                        Copy Meeting Link
                                      </DropdownMenuItem>
                                    </div>
                                  </TooltipTrigger>
                                  {!meeting.meeting_link && (
                                    <TooltipContent side="left">
                                      No online meeting link configured
                                    </TooltipContent>
                                  )}
                                </Tooltip>
                              </TooltipProvider>

                              <DropdownMenuItem
                                onClick={() =>
                                  navigate({
                                    to: "/minutes",
                                    search: { meeting_id: String(meeting.id) } as any,
                                  })
                                }
                              >
                                <BookOpen className="mr-2 h-4 w-4" />
                                Meeting Minutes
                              </DropdownMenuItem>

                              {meeting.attendance_count === 0 && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => setDeletingMeeting(meeting)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Meeting
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && totalCount > pageSize && (
            <div className="flex items-center justify-between border-t border-border/70 px-4 py-3 text-xs text-muted-foreground">
              <span>
                Showing {(currentPage - 1) * pageSize + 1}–
                {Math.min(currentPage * pageSize, totalCount)} of {totalCount} meetings
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

      {/* Modals */}
      <MeetingFormModal
        open={meetingModalOpen}
        onOpenChange={setMeetingModalOpen}
        meetingToEdit={editingMeeting}
        types={types}
        facilitators={facilitators}
        onSuccess={handleRefresh}
      />

      <MeetingTypeModal
        open={typeModalOpen}
        onOpenChange={setTypeModalOpen}
        onSuccess={handleRefresh}
      />

      <DeleteMeetingDialog
        open={Boolean(deletingMeeting)}
        onOpenChange={(open) => {
          if (!open) setDeletingMeeting(null);
        }}
        meeting={deletingMeeting}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
