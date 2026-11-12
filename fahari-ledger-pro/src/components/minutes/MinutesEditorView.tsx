import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Calendar,
  Clock,
  UserCheck,
  FileText,
  Save,
  Download,
  AlertCircle,
  Eye,
  Edit3,
  Loader2,
  Bold,
  Italic,
  List,
  Heading,
  Quote,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { downloadPdf } from "@/api/pdf";
import { apiCall, ApiError } from "@/api/client";
import {
  getDeterministicAvatarColor,
  getInitials,
  formatRelativeMinutes,
  formatTimeAgo,
} from "@/components/meetings/meeting-utils";
import type {
  MeetingListItem,
  AttendanceRecord,
  MeetingMinutesPayload,
} from "@/components/meetings/types";

interface MinutesEditorViewProps {
  meetingId: string;
}

export function MinutesEditorView({ meetingId }: MinutesEditorViewProps) {
  const navigate = useNavigate();

  const [meeting, setMeeting] = useState<MeetingListItem | null>(null);
  const [attendees, setAttendees] = useState<AttendanceRecord[]>([]);
  const [minutesData, setMinutesData] = useState<MeetingMinutesPayload | null>(null);

  const [content, setContent] = useState("");
  const [initialContent, setInitialContent] = useState("");
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const handleDownloadPdf = async () => {
    try {
      setDownloadingPdf(true);
      await downloadPdf(`/meetings/${meetingId}/minutes/pdf/`, `meeting_minutes_${meetingId}.pdf`);
      toast.success("Meeting minutes PDF downloaded successfully");
    } catch (err: any) {
      toast.error(err?.message || "Failed to download minutes PDF");
    } finally {
      setDownloadingPdf(false);
    }
  };

  // Unsaved changes dialog
  const [discardModalOpen, setDiscardModalOpen] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  const isDirty = content !== initialContent;

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Fetch meeting details, attendees, and minutes
  const loadMeetingData = useCallback(async () => {
    setLoading(true);
    setNotFound(false);
    try {
      const [mRes, attRes, minRes] = await Promise.all([
        apiCall<MeetingListItem>(`/meetings/${meetingId}/`),
        apiCall<AttendanceRecord[]>(`/meetings/${meetingId}/attendance/`),
        apiCall<MeetingMinutesPayload>(`/meetings/${meetingId}/minutes/`),
      ]);

      setMeeting(mRes);
      setAttendees(attRes || []);
      setMinutesData(minRes);

      const existingMinutes = minRes?.minutes || "";
      setContent(existingMinutes);
      setInitialContent(existingMinutes);
      setLastSavedTime(minRes?.updated_at || null);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setNotFound(true);
      } else {
        toast.error("Failed to load meeting minutes.");
      }
    } finally {
      setLoading(false);
    }
  }, [meetingId]);

  useEffect(() => {
    loadMeetingData();
  }, [loadMeetingData]);

  // Window beforeunload prompt if dirty
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Save minutes
  const handleSaveMinutes = async () => {
    if (!isDirty || saving) return;
    setSaving(true);
    setSaveError(null);

    try {
      const res = await apiCall<MeetingMinutesPayload>(`/meetings/${meetingId}/minutes/`, {
        method: "PUT",
        body: { minutes: content },
      });

      setMinutesData(res);
      setInitialContent(content);
      setLastSavedTime(res.updated_at || new Date().toISOString());
      toast.success("Minutes saved successfully.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save minutes.";
      setSaveError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // Discard changes
  const handleDiscard = () => {
    setContent(initialContent);
    setSaveError(null);
  };

  // Safe navigation with dirty state check
  const handleBackToMinutes = () => {
    if (isDirty) {
      setPendingNavigation("/minutes");
      setDiscardModalOpen(true);
    } else {
      navigate({ to: "/minutes", search: {} as any });
    }
  };

  // Formatting helpers for markdown textarea
  const insertFormatting = (prefix: string, suffix: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const replacement = prefix + (selectedText || "text") + suffix;

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + replacement.length - suffix.length);
    }, 50);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <Skeleton className="h-96 rounded-2xl" />
          <Skeleton className="xl:col-span-2 h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (notFound || !meeting) {
    return (
      <Card className="border-border/70 bg-card/60 p-12 text-center max-w-lg mx-auto mt-12">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-3" />
        <h3 className="font-semibold text-foreground text-lg">Meeting not found</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto mb-6">
          The requested meeting minutes record does not exist or has been deleted.
        </p>
        <Button asChild variant="outline" size="sm">
          <Link to="/minutes" search={{} as any}>
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to minutes
          </Link>
        </Button>
      </Card>
    );
  }

  const meetingStartTime = new Date(meeting.start_time).getTime();
  const dateStr = new Date(meeting.start_time).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const timeStr = new Date(meeting.start_time).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBackToMinutes}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Back to meeting minutes
        </Button>

        <Badge
          variant="outline"
          className="text-xs font-mono font-medium border-border bg-card"
        >
          #{meeting.meeting_code || `MTG-${meeting.id}`}
        </Badge>
      </div>

      {/* Two-Column Layout (stacked below xl) */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Left Column (Context): Context Card + Attendees List */}
        <div className="space-y-4">
          {/* Meeting Context Card */}
          <Card className="border-border/70 bg-card/80 shadow-xs backdrop-blur-xs">
            <CardHeader className="border-b border-border/70 pb-3">
              <div className="flex items-start justify-between gap-2">
                <Badge variant="secondary" className="text-[10px] uppercase font-bold">
                  {meeting.meeting_type_name || "General"}
                </Badge>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={downloadingPdf}
                  onClick={handleDownloadPdf}
                  className="h-8 text-xs border-border hover:bg-muted font-medium transition-colors"
                >
                  {downloadingPdf ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Download className="mr-1.5 h-3.5 w-3.5 text-primary" />
                  )}
                  Export PDF
                </Button>
              </div>

              <CardTitle className="text-base font-bold text-foreground mt-2">
                {meeting.name}
              </CardTitle>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-1.5 text-foreground font-medium">
                  <Calendar className="h-3.5 w-3.5 text-gold shrink-0" />
                  <span>{dateStr}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground pl-5">
                  <Clock className="h-3 w-3 shrink-0" />
                  <span>{timeStr}</span>
                </div>
              </div>

              {/* Facilitator badge */}
              <div className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-muted/20 p-2.5">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${getDeterministicAvatarColor(
                    meeting.facilitator_id || meeting.facilitator_name || meeting.id
                  )}`}
                >
                  {getInitials(meeting.facilitator_name)}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Facilitator
                  </span>
                  <span className="text-xs font-semibold text-foreground truncate">
                    {meeting.facilitator_name || "Unassigned"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendees List Card */}
          <Card className="border-border/70 bg-card/80 shadow-xs backdrop-blur-xs">
            <CardHeader className="border-b border-border/70 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-foreground">
                  Session Attendance
                </CardTitle>
                <Badge
                  variant="secondary"
                  className="text-xs font-semibold px-2 py-0.5 bg-secondary text-foreground"
                >
                  {attendees.length} attendees
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-3">
              {attendees.length === 0 ? (
                <div className="p-6 text-center text-xs space-y-2">
                  <UserCheck className="mx-auto h-8 w-8 text-muted-foreground/40" />
                  <p className="font-semibold text-foreground">No check-ins yet</p>
                  <p className="text-muted-foreground">
                    Congregational check-ins for this session have not been recorded.
                  </p>
                  <Button
                    asChild
                    variant="link"
                    size="sm"
                    className="text-xs text-gold hover:underline p-0 h-auto"
                  >
                    <Link
                      to="/meetings"
                      search={{
                        view: "attendance",
                        meeting_id: String(meeting.id),
                        tab: "overview",
                      } as any}
                    >
                      Mark Attendance →
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="max-h-[360px] overflow-y-auto space-y-2 pr-1">
                  {attendees.map((att) => {
                    const loginTime = new Date(att.login_time).getTime();
                    const diff = Math.max(0, Math.round((loginTime - meetingStartTime) / 60000));
                    const rel = formatRelativeMinutes(diff);

                    return (
                      <div
                        key={att.id}
                        className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 p-2.5 text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${getDeterministicAvatarColor(
                              att.member_id
                            )}`}
                          >
                            {getInitials(att.member_name)}
                          </div>
                          <span className="font-semibold text-foreground truncate">
                            {att.member_name}
                          </span>
                        </div>
                        <span className="font-mono text-[11px] text-muted-foreground shrink-0 pl-2">
                          {rel}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (Editor): Toolbar, Textarea/Preview, Sticky Save Bar */}
        <div className="xl:col-span-2 space-y-4">
          <Card className="border-border/70 bg-card/80 shadow-xs backdrop-blur-xs flex flex-col min-h-[580px]">
            {/* Editor Toolbar Header */}
            <CardHeader className="border-b border-border/70 p-4 flex flex-row items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={viewMode === "edit" ? "default" : "outline"}
                  onClick={() => setViewMode("edit")}
                  style={viewMode === "edit" ? { backgroundColor: "var(--brand-primary)" } : undefined}
                  className="h-8 text-xs font-semibold"
                >
                  <Edit3 className="mr-1.5 h-3.5 w-3.5" />
                  Write
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={viewMode === "preview" ? "default" : "outline"}
                  onClick={() => setViewMode("preview")}
                  style={viewMode === "preview" ? { backgroundColor: "var(--brand-primary)" } : undefined}
                  className="h-8 text-xs font-semibold"
                >
                  <Eye className="mr-1.5 h-3.5 w-3.5" />
                  Preview
                </Button>
              </div>

              {/* Markdown Helpers */}
              {viewMode === "edit" && (
                <div className="flex items-center gap-1 border-l border-border/60 pl-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={() => insertFormatting("**", "**")}
                    title="Bold"
                  >
                    <Bold className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={() => insertFormatting("*", "*")}
                    title="Italic"
                  >
                    <Italic className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={() => insertFormatting("### ")}
                    title="Heading"
                  >
                    <Heading className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={() => insertFormatting("- ")}
                    title="Bullet List"
                  >
                    <List className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={() => insertFormatting("> ")}
                    title="Quote"
                  >
                    <Quote className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </CardHeader>

            {/* Error Banner */}
            {saveError && (
              <div className="mx-4 mt-4 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{saveError}</span>
              </div>
            )}

            {/* Textarea or Preview Body */}
            <CardContent className="p-4 flex-1 flex flex-col">
              {viewMode === "edit" ? (
                <Textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Record meeting discussions, pastorate announcements, congregational matters, and adopted resolutions..."
                  className="flex-1 w-full min-h-[380px] text-sm font-sans bg-transparent border-0 focus-visible:ring-0 resize-none p-2 leading-relaxed"
                />
              ) : (
                <div className="flex-1 min-h-[380px] rounded-xl border border-border/60 bg-muted/10 p-5 text-sm leading-relaxed overflow-y-auto space-y-3">
                  {content.trim() ? (
                    <div className="whitespace-pre-wrap font-sans text-foreground">
                      {content}
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic text-xs">
                      No minutes content written yet. Switch to Write mode to compose minutes.
                    </p>
                  )}
                </div>
              )}
            </CardContent>

            {/* Sticky Save Bar */}
            <div className="sticky bottom-0 z-10 border-t border-border/70 bg-card/95 backdrop-blur-md p-4 flex items-center justify-between rounded-b-2xl">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>
                  {lastSavedTime
                    ? `Last saved ${formatTimeAgo(lastSavedTime)}`
                    : "Not yet saved to server"}
                </span>
                {isDirty && (
                  <Badge variant="outline" className="text-[10px] text-amber-500 border-amber-500/30 bg-amber-500/10">
                    Unsaved edits
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!isDirty || saving}
                  onClick={handleDiscard}
                  className="text-xs"
                >
                  Discard changes
                </Button>

                <Button
                  type="button"
                  size="sm"
                  disabled={!isDirty || saving}
                  onClick={handleSaveMinutes}
                  style={{ backgroundColor: "var(--brand-primary)" }}
                  className="text-white hover:opacity-95 text-xs shadow-xs min-w-[120px]"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-1.5 h-3.5 w-3.5" />
                      Save minutes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Discard Confirmation Modal */}
      <Dialog open={discardModalOpen} onOpenChange={setDiscardModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Discard Unsaved Minutes?</DialogTitle>
            <DialogDescription>
              You have unsaved changes in the minutes editor. If you navigate away, all recent edits will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDiscardModalOpen(false)}
            >
              Keep Editing
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                setDiscardModalOpen(false);
                if (pendingNavigation) {
                  navigate({ to: pendingNavigation as any, search: {} as any });
                }
              }}
            >
              Discard Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
