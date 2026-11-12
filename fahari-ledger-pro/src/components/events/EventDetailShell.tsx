import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { apiCall, ApiError } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Edit3,
  MoreVertical,
  Trash2,
  Share2,
  FileDown,
  LayoutGrid,
  CalendarClock,
  Users,
  UserCheck,
  BarChart3,
  DollarSign,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { downloadPdf } from "@/api/pdf";
import { EventOverviewTab } from "./tabs/EventOverviewTab";
import { EventScheduleTab } from "./tabs/EventScheduleTab";
import { EventRegistrationsTab } from "./tabs/EventRegistrationsTab";
import { EventCheckinTab } from "./tabs/EventCheckinTab";
import { EventAnalyticsTab } from "./tabs/EventAnalyticsTab";
import { EventFormModal } from "./EventFormModal";
import { formatEventDates, getEventTypeColor } from "./event-utils";
import type { EventDetail, EventLookups, EventsSearchParams } from "./types";

interface EventDetailShellProps {
  eventId: number | string;
  searchParams: EventsSearchParams;
  lookups: EventLookups | null;
  onNavigate: (params: Partial<EventsSearchParams>) => void;
  onBackToHub: () => void;
}

export function EventDetailShell({
  eventId,
  searchParams,
  lookups,
  onNavigate,
  onBackToHub,
}: EventDetailShellProps) {
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const handleDownloadAttendancePdf = async () => {
    try {
      setDownloadingPdf(true);
      await downloadPdf(`/events/${eventId}/attendance/pdf/`, `event_attendance_${eventId}.pdf`);
      toast.success("Attendance report downloaded successfully");
    } catch (err: any) {
      toast.error(err?.message || "Failed to download attendance report");
    } finally {
      setDownloadingPdf(false);
    }
  };

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const activeTab = searchParams.tab || "details";

  // Handle redirect if tab=budget in URL on mount
  useEffect(() => {
    if (searchParams.tab === "budget") {
      toast.info("Budget management coming soon");
      onNavigate({ tab: "details" });
    }
  }, [searchParams.tab, onNavigate]);

  // Fetch Event Details
  const fetchEventDetail = useCallback(async () => {
    setLoading(true);
    setNotFound(false);
    setError(null);
    try {
      const data = await apiCall<EventDetail>(`/events/${eventId}/`);
      setEvent(data);
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 404) {
        setNotFound(true);
      } else {
        console.error("Failed to load event details:", err);
        setError("Failed to load event details.");
      }
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchEventDetail();
  }, [fetchEventDetail]);

  // Handle Delete Event
  const handleDeleteEvent = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!event || deleting) return;

    setDeleting(true);
    try {
      await apiCall(`/events/${eventId}/`, {
        method: "DELETE",
      });
      toast.success(`Event "${event.ename}" deleted successfully`);
      setDeleteDialogOpen(false);
      onBackToHub();
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 409) {
        // Backend returns 409 with custom error message
        const conflictMsg =
          (err.data as any)?.error ||
          `Cannot delete — this event has ${event.registration_count || 0} registrations.`;
        toast.error(conflictMsg);
        // Keep the dialog open on conflict per spec
      } else {
        toast.error("Failed to delete event.");
      }
    } finally {
      setDeleting(false);
    }
  };

  // 404 State
  if (notFound) {
    return (
      <div className="py-16 text-center max-w-md mx-auto">
        <Card className="border-border/60 bg-card/60 backdrop-blur-sm p-10">
          <div className="w-14 h-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-bold font-display text-foreground">Event not found</h3>
          <p className="text-xs text-muted-foreground mt-1 mb-6">
            The event you are looking for does not exist or has been deleted.
          </p>
          <Button onClick={onBackToHub} className="rounded-xl h-9 text-xs">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
        </Card>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="py-16 text-center max-w-md mx-auto">
        <Card className="border-destructive/30 bg-destructive/5 p-8">
          <p className="text-sm font-medium text-destructive mb-4">{error}</p>
          <div className="flex justify-center gap-3">
            <Button variant="outline" size="sm" onClick={onBackToHub}>
              Back to Events
            </Button>
            <Button size="sm" onClick={fetchEventDetail}>
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const typeColor = event ? getEventTypeColor(event.type) : { bg: "", text: "", border: "" };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 3.1 Header */}
      <div className="space-y-4">
        {/* Back Link */}
        <div>
          <button
            onClick={onBackToHub}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Events Hub</span>
          </button>
        </div>

        {/* Main Header Banner */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-border/50">
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <div className="flex gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          ) : event ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl lg:text-3xl font-bold font-display text-foreground tracking-tight">
                  {event.ename}
                </h1>
                <Badge
                  variant="outline"
                  className={`text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    event.status === "published"
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
                      : "bg-secondary text-muted-foreground border-border"
                  }`}
                >
                  {event.status}
                </Badge>
                <Badge
                  variant="outline"
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${typeColor.bg} ${typeColor.text} ${typeColor.border}`}
                >
                  {event.type}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-medium text-foreground">
                    {formatEventDates(event.start_date, event.end_date)}
                  </span>
                  {event.start_time && (
                    <span className="text-muted-foreground font-mono">({event.start_time.slice(0, 5)})</span>
                  )}
                </span>
                {event.branch && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{event.branch}</span>
                  </span>
                )}
                {event.facilitator && (
                  <span className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">Facilitator:</span>
                    <span className="font-medium text-foreground">{event.facilitator}</span>
                  </span>
                )}
              </div>
            </div>
          ) : null}

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Export Attendance Report Button */}
            <Button
              variant="outline"
              size="sm"
              disabled={downloadingPdf}
              onClick={handleDownloadAttendancePdf}
              className="rounded-xl h-9 text-xs font-medium border-border/80 hover:bg-muted transition-colors"
            >
              {downloadingPdf ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <FileDown className="mr-1.5 h-3.5 w-3.5 text-primary" />
              )}
              Export Attendance Report
            </Button>

            {/* Edit Event Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditModalOpen(true)}
              className="rounded-xl h-9 text-xs font-medium border-border/80"
            >
              <Edit3 className="mr-1.5 h-3.5 w-3.5" />
              Edit Event
            </Button>

            {/* More Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl border border-border/60">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl p-1.5 shadow-lg">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div tabIndex={0} className="w-full cursor-not-allowed">
                        <DropdownMenuItem
                          disabled
                          className="text-xs rounded-lg opacity-50 cursor-not-allowed flex items-center gap-2"
                        >
                          <Share2 className="h-3.5 w-3.5" />
                          <span>Copy event link</span>
                        </DropdownMenuItem>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <p>Share link not yet available</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <DropdownMenuSeparator className="my-1" />

                <DropdownMenuItem
                  onClick={() => setDeleteDialogOpen(true)}
                  className="text-xs rounded-lg text-destructive focus:text-destructive focus:bg-destructive/10 flex items-center gap-2 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete event</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* 3.2 Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => onNavigate({ tab: "details" })}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              activeTab === "details"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary/70 text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => onNavigate({ tab: "schedule" })}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              activeTab === "schedule"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary/70 text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <CalendarClock className="h-3.5 w-3.5" />
            <span>Schedule</span>
          </button>

          <button
            onClick={() => onNavigate({ tab: "registrations" })}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              activeTab === "registrations"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary/70 text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Registrations</span>
          </button>

          <button
            onClick={() => onNavigate({ tab: "checkin" })}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              activeTab === "checkin"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary/70 text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span>Check-in</span>
          </button>

          <button
            onClick={() => onNavigate({ tab: "analytics" })}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              activeTab === "analytics"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary/70 text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Analytics</span>
          </button>

          {/* Budget Tab: Disabled pill with tooltip */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div tabIndex={0} className="cursor-not-allowed">
                  <button
                    disabled
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-secondary/30 text-muted-foreground/50 border border-transparent pointer-events-none shrink-0"
                  >
                    <DollarSign className="h-3.5 w-3.5" />
                    <span>Budget</span>
                  </button>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Budget management coming soon</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Tab Contents */}
      {loading ? (
        <div className="space-y-4 pt-4">
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      ) : event ? (
        <div>
          {activeTab === "details" && (
            <EventOverviewTab
              event={event}
              onEdit={() => setEditModalOpen(true)}
            />
          )}

          {activeTab === "schedule" && (
            <EventScheduleTab eventId={Number(eventId)} lookups={lookups} />
          )}

          {activeTab === "registrations" && (
            <EventRegistrationsTab eventId={Number(eventId)} />
          )}

          {activeTab === "checkin" && <EventCheckinTab eventId={Number(eventId)} />}

          {activeTab === "analytics" && <EventAnalyticsTab eventId={Number(eventId)} />}
        </div>
      ) : null}

      {/* Edit Event Modal */}
      {event && (
        <EventFormModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          onSuccess={() => {
            fetchEventDetail();
          }}
          lookups={lookups}
          eventToEdit={event}
        />
      )}

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold font-display">
              Delete Event?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Are you sure you want to permanently delete &quot;{event?.ename}&quot;?
              This action cannot be undone. If there are registered attendees, deletion will be blocked.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting} className="rounded-xl text-xs h-9">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={handleDeleteEvent}
              className="rounded-xl text-xs h-9 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {deleting ? "Deleting..." : "Delete Event"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
