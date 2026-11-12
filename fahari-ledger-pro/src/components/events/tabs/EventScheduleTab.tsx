import React, { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  AlertCircle,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { apiCall, ApiError } from "@/api/client";
import { getSessionTypeColor, getInitials } from "../event-utils";
import type { EventScheduleItem, EventLookups } from "../types";

interface EventScheduleTabProps {
  eventId: number;
  lookups: EventLookups | null;
}

export function EventScheduleTab({ eventId, lookups }: EventScheduleTabProps) {
  const [schedules, setSchedules] = useState<EventScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<EventScheduleItem | null>(null);
  const [defaultDay, setDefaultDay] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);

  // Delete dialog states
  const [sessionToDelete, setSessionToDelete] = useState<EventScheduleItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    day_number: 1,
    start_time: "09:00",
    end_time: "10:30",
    title: "",
    description: "",
    speaker: "",
    session_type: "teaching",
    location: "",
    sort_order: 0,
  });

  const fetchSchedules = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiCall<EventScheduleItem[]>(`/events/${eventId}/schedule/`);
      setSchedules(Array.isArray(res) ? res : []);
    } catch (err: unknown) {
      setError((err as Error)?.message || "Failed to load event schedule.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [eventId]);

  // Group by day_number
  const groupedDays = useMemo(() => {
    const map = new Map<number, EventScheduleItem[]>();
    for (const s of schedules) {
      const d = s.day_number || 1;
      if (!map.has(d)) map.set(d, []);
      map.get(d)!.push(s);
    }
    // Sort sessions within each day
    for (const [day, list] of map.entries()) {
      list.sort((a, b) => {
        if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
        return a.start_time.localeCompare(b.start_time);
      });
    }
    return Array.from(map.entries()).sort(([a], [b]) => a - b);
  }, [schedules]);

  const openAddModal = (day = 1) => {
    setEditingSession(null);
    setDefaultDay(day);
    setFormData({
      day_number: day,
      start_time: "09:00",
      end_time: "10:30",
      title: "",
      description: "",
      speaker: "",
      session_type: "teaching",
      location: "",
      sort_order: (groupedDays.find(([d]) => d === day)?.[1]?.length || 0) * 10,
    });
    setModalOpen(true);
  };

  const openEditModal = (session: EventScheduleItem) => {
    setEditingSession(session);
    setFormData({
      day_number: session.day_number,
      start_time: session.start_time ? session.start_time.slice(0, 5) : "09:00",
      end_time: session.end_time ? session.end_time.slice(0, 5) : "10:30",
      title: session.title,
      description: session.description || "",
      speaker: session.speaker || "",
      session_type: session.session_type || "teaching",
      location: session.location || "",
      sort_order: session.sort_order || 0,
    });
    setModalOpen(true);
  };

  const handleSaveSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Session title is required.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        day_number: Number(formData.day_number) || 1,
        start_time: formData.start_time,
        end_time: formData.end_time,
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        speaker: formData.speaker.trim() || null,
        session_type: formData.session_type,
        location: formData.location.trim() || null,
        sort_order: Number(formData.sort_order) || 0,
      };

      if (editingSession) {
        await apiCall(`/events/${eventId}/schedule/${editingSession.id}/`, {
          method: "PATCH",
          body: payload,
        });
        toast.success(`Session "${payload.title}" updated.`);
      } else {
        await apiCall(`/events/${eventId}/schedule/`, {
          method: "POST",
          body: payload,
        });
        toast.success(`Session "${payload.title}" added to Day ${payload.day_number}.`);
      }

      setModalOpen(false);
      fetchSchedules();
    } catch (err: unknown) {
      toast.error((err as Error)?.message || "Failed to save session.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSession = async () => {
    if (!sessionToDelete) return;
    setDeleting(true);
    try {
      await apiCall(`/events/${eventId}/schedule/${sessionToDelete.id}/`, {
        method: "DELETE",
      });
      toast.success("Session deleted successfully.");
      setSessionToDelete(null);
      fetchSchedules();
    } catch (err: unknown) {
      toast.error((err as Error)?.message || "Failed to delete session.");
    } finally {
      setDeleting(false);
    }
  };

  const sessionTypeChoices = lookups?.session_types || [
    { value: "teaching", label: "Teaching / Word" },
    { value: "worship", label: "Praise & Worship" },
    { value: "prayer", label: "Prayer & Intercession" },
    { value: "panel", label: "Panel & Dialogue" },
    { value: "meal", label: "Meal / Hospitality" },
    { value: "break", label: "Tea / Health Break" },
    { value: "registration", label: "Registration / Check-In" },
    { value: "activity", label: "Interactive Workshop" },
    { value: "announcement", label: "Announcements" },
    { value: "other", label: "Other" },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2].map((i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-8 w-32 rounded-xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="rounded-2xl border-destructive/20 bg-destructive/5 p-8 text-center">
        <CardContent className="space-y-3 p-0">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
          <h4 className="font-bold text-destructive">Failed to load schedule</h4>
          <p className="text-xs text-muted-foreground">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchSchedules} className="rounded-xl">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card/60 backdrop-blur-md p-4 rounded-2xl border border-border shadow-xs">
        <div>
          <h3 className="text-base font-bold font-display text-foreground">
            Program Timetable ({schedules.length} {schedules.length === 1 ? "Session" : "Sessions"})
          </h3>
          <p className="text-xs text-muted-foreground">
            Multi-day conference schedule, speaker assignments, and track locations
          </p>
        </div>
        <Button
          onClick={() => openAddModal(groupedDays.length > 0 ? groupedDays[groupedDays.length - 1][0] : 1)}
          className="rounded-xl bg-[var(--brand-primary)] text-white hover:opacity-90 h-9 text-xs font-semibold gap-1.5"
        >
          <Plus className="h-4 w-4" /> Add Session
        </Button>
      </div>

      {/* Empty State */}
      {schedules.length === 0 ? (
        <Card className="rounded-2xl border-dashed border-2 border-border p-12 text-center">
          <CardContent className="space-y-3 p-0 max-w-sm mx-auto">
            <Calendar className="h-10 w-10 text-muted-foreground mx-auto stroke-1" />
            <h4 className="font-bold text-foreground">No sessions scheduled yet</h4>
            <p className="text-xs text-muted-foreground">
              Add the first session to build the day-by-day conference timetable.
            </p>
            <Button
              onClick={() => openAddModal(1)}
              className="rounded-xl bg-[var(--brand-primary)] text-white text-xs font-semibold"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Add First Session
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Days Grouping */
        <div className="space-y-8">
          {groupedDays.map(([dayNumber, sessions]) => (
            <div key={dayNumber} className="space-y-3">
              {/* Day Header Banner */}
              <div className="flex items-center justify-between border-b border-border pb-2 px-1">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[var(--brand-primary)]" />
                  <h4 className="text-sm font-extrabold uppercase tracking-wider text-foreground font-display">
                    Day {dayNumber}
                  </h4>
                  <Badge variant="secondary" className="text-[10px] font-bold rounded-md">
                    {sessions.length} {sessions.length === 1 ? "session" : "sessions"}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openAddModal(dayNumber)}
                  className="h-7 text-xs font-semibold text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10 rounded-lg gap-1"
                >
                  <Plus className="h-3.5 w-3.5" /> Add to Day {dayNumber}
                </Button>
              </div>

              {/* Day Sessions List */}
              <div className="space-y-2.5">
                {sessions.map((sess) => {
                  const typeColors = getSessionTypeColor(sess.session_type);
                  return (
                    <div
                      key={sess.id}
                      className="group relative flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border bg-card hover:bg-muted/20 transition-all shadow-xs gap-3 overflow-hidden"
                    >
                      {/* Left Type Bar */}
                      <span className={`absolute left-0 top-0 bottom-0 w-1.5 ${typeColors.bar}`} />

                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 pl-2 flex-1">
                        {/* Time Column */}
                        <div className="shrink-0 w-32 flex items-center gap-1.5 text-xs font-bold text-foreground">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>
                            {sess.start_time?.slice(0, 5)} – {sess.end_time?.slice(0, 5)}
                          </span>
                        </div>

                        {/* Title, Speaker & Meta */}
                        <div className="space-y-1 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h5 className="text-sm font-bold text-foreground font-display">
                              {sess.title}
                            </h5>
                            <Badge
                              variant="outline"
                              className={`text-[10px] font-semibold capitalize ${typeColors.bg} ${typeColors.text} border-transparent`}
                            >
                              {sess.session_type}
                            </Badge>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            {sess.speaker && (
                              <span className="flex items-center gap-1.5 font-medium text-foreground/80">
                                <span className="h-4 w-4 rounded-full bg-[var(--brand-primary)]/15 text-[var(--brand-primary)] text-[9px] font-extrabold flex items-center justify-center">
                                  {getInitials(sess.speaker)}
                                </span>
                                {sess.speaker}
                              </span>
                            )}
                            {sess.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {sess.location}
                              </span>
                            )}
                          </div>

                          {sess.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1 pt-0.5">
                              {sess.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1 self-end sm:self-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditModal(sess)}
                          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                          title="Edit Session"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSessionToDelete(sess)}
                          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive"
                          title="Delete Session"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Session Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold font-display">
              {editingSession ? "Edit Timetable Session" : "Add Timetable Session"}
            </DialogTitle>
            <DialogDescription>
              Configure time window, speaker, session type, and hall assignment.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveSession} className="space-y-4 pt-2">
            {/* Title */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                Session Title <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="e.g., Morning Exhortation & Prayer"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="rounded-xl"
              />
            </div>

            {/* Day & Session Type */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Day Number</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.day_number}
                  onChange={(e) =>
                    setFormData({ ...formData, day_number: Number(e.target.value) || 1 })
                  }
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Session Type</Label>
                <Select
                  value={formData.session_type}
                  onValueChange={(val) => setFormData({ ...formData, session_type: val })}
                >
                  <SelectTrigger className="rounded-xl text-xs capitalize">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {sessionTypeChoices.map((st) => (
                      <SelectItem key={st.value} value={st.value} className="text-xs">
                        {st.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Start and End Times */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Start Time</Label>
                <Input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">End Time</Label>
                <Input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  className="rounded-xl"
                />
              </div>
            </div>

            {/* Speaker & Location */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Speaker / Minister</Label>
                <Input
                  placeholder="e.g., Pastor David"
                  value={formData.speaker}
                  onChange={(e) => setFormData({ ...formData, speaker: e.target.value })}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Room / Location</Label>
                <Input
                  placeholder="e.g., Main Sanctuary"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="rounded-xl"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Description (Optional)</Label>
              <Textarea
                rows={2}
                placeholder="Key scripture, theme focus, or instructions..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="rounded-xl text-xs"
              />
            </div>

            <DialogFooter className="pt-2 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-[var(--brand-primary)] text-white text-xs font-semibold"
              >
                {submitting && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                {editingSession ? "Save Changes" : "Add Session"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={Boolean(sessionToDelete)}
        onOpenChange={(op) => !op && setSessionToDelete(null)}
      >
        <AlertDialogContent className="rounded-2xl max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold font-display">
              Delete Session?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Are you sure you want to remove &ldquo;{sessionToDelete?.title}&rdquo; from the timetable?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSession}
              disabled={deleting}
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs font-semibold"
            >
              {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
