import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  UserCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  X,
  Loader2,
  Sparkles,
} from "lucide-react";
import { apiCall, ApiError } from "@/api/client";
import {
  getDeterministicAvatarColor,
  getInitials,
} from "./meeting-utils";
import type { EligibleMember, MeetingListItem, AttendanceRecord } from "./types";

interface KioskSessionItem {
  id: number;
  member_id: number;
  member_name: string;
  phone_no?: string;
  login_time: string;
  checkedInAt: Date;
}

interface CheckInKioskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meeting: MeetingListItem | null;
  onCheckInSuccess: (record: AttendanceRecord) => void;
}

export function CheckInKioskModal({
  open,
  onOpenChange,
  meeting,
  onCheckInSuccess,
}: CheckInKioskModalProps) {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [eligibleList, setEligibleList] = useState<EligibleMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkingInId, setCheckingInId] = useState<number | null>(null);

  // Modal-local session feed & inline banner feedback
  const [sessionFeed, setSessionFeed] = useState<KioskSessionItem[]>([]);
  const [inlineFeedback, setInlineFeedback] = useState<string | null>(null);
  const [rowErrors, setRowErrors] = useState<Record<number, string>>({});

  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Debounce search query 250ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 250);
    return () => clearTimeout(handler);
  }, [query]);

  // Fetch eligible members when modal opens or query changes
  const fetchEligible = useCallback(async () => {
    if (!meeting || !open) return;
    setLoading(true);
    try {
      const qParam = debouncedQuery.trim()
        ? `?q=${encodeURIComponent(debouncedQuery.trim())}`
        : "";
      const res = await apiCall<EligibleMember[]>(
        `/meetings/${meeting.id}/attendance/eligible/${qParam}`
      );
      setEligibleList(res || []);
    } catch {
      // Handled silently
    } finally {
      setLoading(false);
    }
  }, [meeting, debouncedQuery, open]);

  useEffect(() => {
    fetchEligible();
  }, [fetchEligible]);

  // Reset or focus input on open
  useEffect(() => {
    if (open) {
      setQuery("");
      setDebouncedQuery("");
      setInlineFeedback(null);
      setRowErrors({});
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  // Handle single check in
  const handleCheckIn = async (member: EligibleMember) => {
    if (!meeting || checkingInId !== null) return;
    setCheckingInId(member.member_id);

    try {
      const res = await apiCall<AttendanceRecord>(`/meetings/${meeting.id}/attendance/`, {
        method: "POST",
        body: { member_id: member.member_id },
      });

      // Inline success toast inside kiosk
      setInlineFeedback(`✓ ${member.member_name} checked in`);
      setTimeout(() => setInlineFeedback(null), 3000);

      // Slide row out of eligible list
      setEligibleList((prev) => prev.filter((m) => m.member_id !== member.member_id));

      // Slide into session feed at top
      setSessionFeed((prev) => [
        {
          id: res.id,
          member_id: member.member_id,
          member_name: member.member_name,
          phone_no: member.phone_no,
          login_time: res.login_time,
          checkedInAt: new Date(),
        },
        ...prev,
      ]);

      // Inform parent so table updates
      onCheckInSuccess(res);
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        // Duplicate check in
        setRowErrors((prev) => ({
          ...prev,
          [member.member_id]: "Already checked in",
        }));
        // Remove row after brief display
        setTimeout(() => {
          setEligibleList((prev) => prev.filter((m) => m.member_id !== member.member_id));
        }, 1200);
      } else {
        setRowErrors((prev) => ({
          ...prev,
          [member.member_id]: "Check-in failed",
        }));
      }
    } finally {
      setCheckingInId(null);
      searchInputRef.current?.focus();
    }
  };

  // Enter key in search input checks in top result
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (eligibleList.length > 0 && checkingInId === null) {
        handleCheckIn(eligibleList[0]);
      }
    }
  };

  if (!meeting) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[94vw] max-w-[1080px] h-[88vh] max-h-[820px] p-0 flex flex-col bg-background border border-border shadow-2xl overflow-hidden rounded-2xl"
      >
        {/* Kiosk Header */}
        <DialogHeader className="border-b border-border/80 px-6 py-4 flex flex-row items-center justify-between bg-muted/20">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
              style={{ backgroundColor: "var(--brand-primary, #1e3a8a)" }}
            >
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-xl font-bold text-foreground">
                  Check-in Kiosk
                </DialogTitle>
                <Badge
                  variant="outline"
                  className="text-[10px] uppercase font-bold border-gold/40 text-gold bg-gold/10"
                >
                  Live Session
                </Badge>
              </div>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {meeting.name} ·{" "}
                {new Date(meeting.start_time).toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </DialogDescription>
            </div>
          </div>

          {/* Modal Inline Toast Notification */}
          {inlineFeedback && (
            <div className="animate-in fade-in slide-in-from-top-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 shadow-sm">
              <CheckCircle2 className="h-4 w-4" />
              <span>{inlineFeedback}</span>
            </div>
          )}
        </DialogHeader>

        {/* Two Zones Side by Side (Stack on < md) */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/80 overflow-hidden">
          {/* Zone 1 (Left): Search & Eligible Members */}
          <div className="flex flex-col h-full overflow-hidden p-6 space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="kiosk-search-input"
                className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >
                Scan or Search Member (Press Enter to Check In)
              </label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="kiosk-search-input"
                  ref={searchInputRef}
                  placeholder="Type member name or phone..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="h-12 pl-11 text-base bg-card/80 border-border focus-visible:ring-gold"
                  autoFocus
                />
              </div>
            </div>

            {/* Eligible Results List */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-2">
              {loading ? (
                <div className="space-y-2 pt-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-xl border border-border/60 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                      <Skeleton className="h-9 w-24 rounded-lg" />
                    </div>
                  ))}
                </div>
              ) : eligibleList.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center p-6 border border-dashed border-border/80 rounded-xl">
                  <UserCheck className="h-8 w-8 text-muted-foreground/40 mb-2" />
                  <p className="text-sm font-semibold text-foreground">
                    {debouncedQuery.trim()
                      ? `No eligible members match "${debouncedQuery.trim()}"`
                      : "All members already checked in"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {debouncedQuery.trim()
                      ? "Check the spelling or try searching by phone number."
                      : "There are no pending unrecorded active members for this meeting."}
                  </p>
                </div>
              ) : (
                eligibleList.map((member, idx) => {
                  const isTop = idx === 0 && Boolean(debouncedQuery.trim());
                  const isBusy = checkingInId === member.member_id;
                  const rowErr = rowErrors[member.member_id];

                  return (
                    <div
                      key={member.member_id}
                      className={`flex items-center justify-between rounded-xl border p-3 transition-all ${
                        isTop
                          ? "border-gold/60 bg-gold/5 shadow-xs ring-1 ring-gold/40"
                          : "border-border/70 bg-card/70 hover:bg-card hover:border-border"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${getDeterministicAvatarColor(
                            member.member_id
                          )}`}
                        >
                          {getInitials(member.member_name)}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-sm text-foreground truncate">
                            {member.member_name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {member.phone_no || "No phone listed"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {rowErr ? (
                          <span className="text-xs font-bold text-destructive animate-pulse">
                            {rowErr}
                          </span>
                        ) : null}

                        <Button
                          size="sm"
                          disabled={isBusy || checkingInId !== null}
                          onClick={() => handleCheckIn(member)}
                          style={{ backgroundColor: "var(--brand-primary)" }}
                          className="h-9 px-4 text-xs text-white hover:opacity-95 shadow-xs"
                        >
                          {isBusy ? (
                            <>
                              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                              Checking in...
                            </>
                          ) : (
                            <>
                              <UserCheck className="mr-1.5 h-3.5 w-3.5" />
                              Check in
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Zone 2 (Right): Session Feed */}
          <div className="flex flex-col h-full overflow-hidden p-6 space-y-4 bg-muted/10">
            <div className="flex items-center justify-between pb-2 border-b border-border/70">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Session Feed
              </span>
              <Badge
                variant="secondary"
                className="text-xs font-semibold px-2.5 py-0.5 bg-secondary text-foreground"
              >
                {sessionFeed.length} checked in this session
              </Badge>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-2">
              {sessionFeed.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center p-6 border border-dashed border-border/80 rounded-xl">
                  <Clock className="h-8 w-8 text-muted-foreground/40 mb-2" />
                  <p className="text-sm font-semibold text-foreground">
                    No check-ins in this session yet
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                    Members checked in through this kiosk window will appear here in real-time.
                  </p>
                </div>
              ) : (
                sessionFeed.map((item) => {
                  const secondsAgo = Math.max(
                    0,
                    Math.floor((Date.now() - item.checkedInAt.getTime()) / 1000)
                  );
                  const relativeStr =
                    secondsAgo < 60
                      ? "Just now"
                      : `${Math.floor(secondsAgo / 60)} min ago`;

                  return (
                    <div
                      key={item.id}
                      className="animate-in fade-in slide-in-from-right-4 duration-300 flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${getDeterministicAvatarColor(
                            item.member_id
                          )}`}
                        >
                          {getInitials(item.member_name)}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-xs text-foreground truncate">
                            {item.member_name}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {item.phone_no || "Member"}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" />
                          {relativeStr}
                        </span>
                        <span className="text-[10px] text-muted-foreground block">
                          {item.checkedInAt.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border/80 px-6 py-3.5 flex items-center justify-between bg-muted/20">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            Close Kiosk
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onOpenChange(false);
              navigate({
                to: "/meetings",
                search: {
                  view: "attendance",
                  meeting_id: String(meeting.id),
                  tab: "overview",
                } as any,
              });
            }}
            className="text-xs font-semibold text-gold hover:text-gold"
          >
            View Meeting Attendance
            <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
