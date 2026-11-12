import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { apiCall, ApiError } from "@/api/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  UserCheck,
  Percent,
  Clock,
  Search,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Phone,
} from "lucide-react";
import { getInitials } from "../event-utils";
import type { EventCheckinStatus, EventRegistrationItem } from "../types";

interface SessionFeedItem {
  registrationId: number;
  names: string;
  phone_no: string;
  timestamp: Date;
}

interface EventCheckinTabProps {
  eventId: number | string;
}

export function EventCheckinTab({ eventId }: EventCheckinTabProps) {
  const [status, setStatus] = useState<EventCheckinStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);

  const [eligibleList, setEligibleList] = useState<EventRegistrationItem[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [undoingId, setUndoingId] = useState<number | null>(null);

  // Inline feedback messages: { regId: { type: 'success' | 'conflict' | 'error', message: string } }
  const [inlineFeedback, setInlineFeedback] = useState<{
    type: "success" | "conflict" | "error";
    message: string;
  } | null>(null);

  // Client-side session check-in feed
  const [sessionFeed, setSessionFeed] = useState<SessionFeedItem[]>([]);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debounce search input (250ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim().toLowerCase());
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Autofocus search input on mount
  useEffect(() => {
    const focusTimer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
    return () => clearTimeout(focusTimer);
  }, []);

  // Fetch status
  const loadStatus = useCallback(async () => {
    try {
      const data = await apiCall<EventCheckinStatus>(`/events/${eventId}/checkin/status/`);
      setStatus(data);
    } catch (err) {
      console.error("Failed to load checkin status:", err);
    } finally {
      setStatusLoading(false);
    }
  }, [eventId]);

  // Fetch eligible attendees (checked_in=false)
  const loadEligible = useCallback(async () => {
    setListLoading(true);
    setListError(null);
    try {
      const res = await apiCall<{ results?: EventRegistrationItem[]; count?: number } | EventRegistrationItem[]>(
        `/events/${eventId}/registrations/?checked_in=false`
      );
      const items = Array.isArray(res) ? res : res.results || [];
      setEligibleList(items);
    } catch (err) {
      console.error("Failed to load eligible list:", err);
      setListError("Failed to load eligible attendees for check-in.");
    } finally {
      setListLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadStatus();
    loadEligible();
  }, [loadStatus, loadEligible]);

  // Filtered eligible list
  const filteredEligible = useMemo(() => {
    if (!debouncedQuery) return eligibleList;
    return eligibleList.filter(
      (item) =>
        item.names.toLowerCase().includes(debouncedQuery) ||
        item.phone_no.toLowerCase().includes(debouncedQuery) ||
        (item.residence && item.residence.toLowerCase().includes(debouncedQuery))
    );
  }, [eligibleList, debouncedQuery]);

  // Perform Check In
  const handleCheckIn = async (reg: EventRegistrationItem) => {
    if (processingId) return;
    setProcessingId(reg.id);
    setInlineFeedback(null);

    try {
      await apiCall(`/events/${eventId}/checkin/`, {
        method: "POST",
        body: { registration_id: reg.id },
      });

      // Remove from eligible list
      setEligibleList((prev) => prev.filter((item) => item.id !== reg.id));

      // Add to session feed
      setSessionFeed((prev) => [
        {
          registrationId: reg.id,
          names: reg.names,
          phone_no: reg.phone_no,
          timestamp: new Date(),
        },
        ...prev,
      ]);

      // Inline success feedback banner
      setInlineFeedback({
        type: "success",
        message: `✓ ${reg.names} checked in`,
      });

      // Clear search query after enter or click
      setSearchQuery("");
      searchInputRef.current?.focus();

      // Refresh status silently
      loadStatus();
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 409) {
        // Already checked in
        setInlineFeedback({
          type: "conflict",
          message: `${reg.names} is already checked in`,
        });
        // Remove from eligible list since it's already checked in
        setEligibleList((prev) => prev.filter((item) => item.id !== reg.id));
        loadStatus();
      } else {
        setInlineFeedback({
          type: "error",
          message: `Failed to check in ${reg.names}`,
        });
      }
    } finally {
      setProcessingId(null);
    }
  };

  // Keyboard Enter on search input checks in the top result
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && filteredEligible.length > 0) {
      e.preventDefault();
      handleCheckIn(filteredEligible[0]);
    }
  };

  // Perform Undo
  const handleUndo = async (feedItem: SessionFeedItem) => {
    if (undoingId) return;
    setUndoingId(feedItem.registrationId);

    try {
      await apiCall(`/events/${eventId}/checkin/${feedItem.registrationId}/`, {
        method: "DELETE",
      });

      // Remove from session feed
      setSessionFeed((prev) => prev.filter((item) => item.registrationId !== feedItem.registrationId));

      // Reload eligible list
      loadEligible();

      setInlineFeedback({
        type: "success",
        message: `Restored check-in for ${feedItem.names}`,
      });

      // Refresh status
      loadStatus();
    } catch (err) {
      console.error("Failed to undo check-in:", err);
      setInlineFeedback({
        type: "error",
        message: `Failed to undo check-in for ${feedItem.names}`,
      });
    } finally {
      setUndoingId(null);
    }
  };

  // Relative time helper
  const getRelativeTime = (date: Date) => {
    const diffSeconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (diffSeconds < 45) return "Just now";
    const minutes = Math.floor(diffSeconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Registered</p>
              {statusLoading ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                <p className="text-2xl font-bold font-display">
                  {status?.total_registered ?? (status as any)?.registered ?? 0}
                </p>
              )}
            </div>
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Checked In</p>
              {statusLoading ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                <p className="text-2xl font-bold font-display text-emerald-600 dark:text-emerald-400">
                  {status?.total_checked_in ?? (status as any)?.checked_in ?? 0}
                </p>
              )}
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <UserCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Attendance Rate</p>
              {statusLoading ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                <p className="text-2xl font-bold font-display">
                  {status?.attendance_rate !== undefined ? `${status.attendance_rate.toFixed(1)}%` : "0.0%"}
                </p>
              )}
            </div>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Percent className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Last Check-in</p>
              {statusLoading ? (
                <Skeleton className="h-7 w-20" />
              ) : (
                <p className="text-sm font-semibold text-foreground">
                  {status?.recent_checkins?.[0]?.check_in_time
                    ? new Date(status.recent_checkins[0].check_in_time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : (status as any)?.last_check_in
                    ? new Date((status as any).last_check_in).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—"}
                </p>
              )}
            </div>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inline Feedback Banner */}
      {inlineFeedback && (
        <div
          className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
            inlineFeedback.type === "success"
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
              : inlineFeedback.type === "conflict"
              ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20"
              : "bg-destructive/10 text-destructive border-destructive/20"
          }`}
        >
          {inlineFeedback.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          <span>{inlineFeedback.message}</span>
        </div>
      )}

      {/* Two Column Layout on xl */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left: Search + Eligible Attendee List (8 cols) */}
        <div className="xl:col-span-7 space-y-4">
          <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
            <CardHeader className="p-4 pb-3 border-b border-border/50">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <CardTitle className="text-base font-bold font-display flex items-center gap-2">
                  <span>Eligible Attendees</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                    {filteredEligible.length}
                  </span>
                </CardTitle>
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    ref={searchInputRef}
                    placeholder="Search attendee by name, phone... (Enter to check in)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="pl-9 h-9 rounded-xl bg-background text-sm"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {listLoading ? (
                <div className="divide-y divide-border/40 p-4 space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-1.5">
                          <Skeleton className="h-4 w-36" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                      <Skeleton className="h-8 w-24 rounded-lg" />
                    </div>
                  ))}
                </div>
              ) : listError ? (
                <div className="p-8 text-center text-sm text-destructive">
                  <p>{listError}</p>
                  <Button variant="outline" size="sm" onClick={loadEligible} className="mt-3">
                    Retry
                  </Button>
                </div>
              ) : filteredEligible.length === 0 ? (
                <div className="p-10 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-secondary/70 flex items-center justify-center mx-auto mb-3 text-muted-foreground">
                    {searchQuery ? <Search className="h-6 w-6" /> : <UserCheck className="h-6 w-6" />}
                  </div>
                  <h4 className="font-semibold text-sm text-foreground">
                    {searchQuery
                      ? `No eligible members match "${searchQuery}"`
                      : "All attendees are checked in."}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                    {searchQuery
                      ? "Try searching with a different name spelling or mobile number."
                      : "Every registered participant has successfully processed check-in for this event."}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border/40 max-h-[560px] overflow-y-auto">
                  {filteredEligible.map((attendee) => {
                    const isProcessing = processingId === attendee.id;
                    return (
                      <div
                        key={attendee.id}
                        className="flex items-center justify-between p-3.5 hover:bg-secondary/30 transition-colors gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center border border-primary/20">
                            {getInitials(attendee.names)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-foreground truncate">{attendee.names}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                              <span className="flex items-center gap-1 font-mono">
                                <Phone className="h-3 w-3" />
                                {attendee.phone_no}
                              </span>
                              {attendee.residence && (
                                <>
                                  <span>•</span>
                                  <span className="truncate">{attendee.residence}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          disabled={isProcessing}
                          onClick={() => handleCheckIn(attendee)}
                          className="h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs px-3.5 shrink-0"
                        >
                          {isProcessing ? "Checking..." : "Check In"}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Session Check-In Feed (5 cols) */}
        <div className="xl:col-span-5 space-y-4">
          <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
            <CardHeader className="p-4 pb-3 border-b border-border/50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold font-display flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-500" />
                  <span>Session Feed</span>
                </CardTitle>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                  {sessionFeed.length} checked in this session
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {sessionFeed.length === 0 ? (
                <div className="p-10 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-secondary/70 flex items-center justify-center mx-auto mb-3 text-muted-foreground">
                    <Clock className="h-6 w-6" />
                  </div>
                  <h4 className="font-semibold text-sm text-foreground">No check-ins yet</h4>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                    Check in attendees from the eligible list to record them in this kiosk session.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border/40 max-h-[560px] overflow-y-auto">
                  {sessionFeed.map((item) => {
                    const isUndoing = undoingId === item.registrationId;
                    return (
                      <div
                        key={item.registrationId}
                        className="flex items-center justify-between p-3.5 hover:bg-secondary/20 transition-colors gap-3 animate-in fade-in duration-200"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-8 w-8 shrink-0 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center">
                            ✓
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-foreground truncate">{item.names}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{getRelativeTime(item.timestamp)}</span>
                              <span>•</span>
                              <span className="font-mono">{item.phone_no}</span>
                            </div>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={isUndoing}
                          onClick={() => handleUndo(item)}
                          title="Undo check-in"
                          className="h-8 px-2.5 rounded-lg text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <RotateCcw className={`h-3.5 w-3.5 mr-1 ${isUndoing ? "animate-spin" : ""}`} />
                          Undo
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
