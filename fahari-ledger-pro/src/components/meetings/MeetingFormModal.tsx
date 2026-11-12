import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import { apiCall, ApiError } from "@/api/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { MeetingListItem, MeetingTypeItem, FacilitatorItem } from "./types";

interface MeetingFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meetingToEdit?: MeetingListItem | null;
  types: MeetingTypeItem[];
  facilitators: FacilitatorItem[];
  onSuccess: () => void;
}

export function MeetingFormModal({
  open,
  onOpenChange,
  meetingToEdit,
  types,
  facilitators,
  onSuccess,
}: MeetingFormModalProps) {
  const isEditing = Boolean(meetingToEdit);

  const [name, setName] = useState("");
  const [meetingTypeId, setMeetingTypeId] = useState<string>("");
  const [facilitatorId, setFacilitatorId] = useState<string>("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [description, setDescription] = useState("");

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Helper to format ISO datetime to local input "YYYY-MM-DDTHH:mm"
  const toLocalInput = (iso?: string | null) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return "";
      const pad = (n: number) => String(n).padStart(2, "0");
      const yyyy = d.getFullYear();
      const mm = pad(d.getMonth() + 1);
      const dd = pad(d.getDate());
      const hh = pad(d.getHours());
      const min = pad(d.getMinutes());
      return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
    } catch {
      return "";
    }
  };

  useEffect(() => {
    if (open) {
      setFieldErrors({});
      if (meetingToEdit) {
        setName(meetingToEdit.name || "");
        const typeId =
          typeof meetingToEdit.meeting_type === "object" && meetingToEdit.meeting_type
            ? String(meetingToEdit.meeting_type.id)
            : meetingToEdit.meeting_type_name
            ? String(types.find((t) => t.name === meetingToEdit.meeting_type_name)?.id || "")
            : String(meetingToEdit.meeting_type || "");
        setMeetingTypeId(typeId);

        const facId =
          typeof meetingToEdit.facilitator === "object" && meetingToEdit.facilitator
            ? String(meetingToEdit.facilitator.id)
            : String(meetingToEdit.facilitator || "");
        setFacilitatorId(facId);

        setStartTime(toLocalInput(meetingToEdit.start_time));
        setEndTime(toLocalInput(meetingToEdit.end_time));
        setMeetingLink(meetingToEdit.meeting_link || "");
        setDescription(meetingToEdit.description || "");
      } else {
        setName("");
        setMeetingTypeId(types[0]?.id ? String(types[0].id) : "");
        setFacilitatorId(facilitators[0]?.id ? String(facilitators[0].id) : "");
        // Default start time: next hour
        const next = new Date();
        next.setMinutes(0, 0, 0);
        next.setHours(next.getHours() + 1);
        setStartTime(toLocalInput(next.toISOString()));
        const nextEnd = new Date(next);
        nextEnd.setHours(nextEnd.getHours() + 2);
        setEndTime(toLocalInput(nextEnd.toISOString()));
        setMeetingLink("");
        setDescription("");
      }
    }
  }, [open, meetingToEdit, types, facilitators]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!name.trim()) errors.name = "Meeting name is required.";
    if (!meetingTypeId) errors.meeting_type_id = "Meeting type is required.";
    if (!facilitatorId) errors.facilitator_id = "Facilitator is required.";
    if (!startTime) errors.start_time = "Start time is required.";

    if (startTime && endTime) {
      const st = new Date(startTime).getTime();
      const et = new Date(endTime).getTime();
      if (et <= st) {
        errors.end_time = "End time must be after start time.";
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    setFieldErrors({});

    const payload = {
      name: name.trim(),
      meeting_type_id: parseInt(meetingTypeId, 10),
      facilitator_id: parseInt(facilitatorId, 10),
      start_time: new Date(startTime).toISOString(),
      end_time: endTime ? new Date(endTime).toISOString() : null,
      meeting_link: meetingLink.trim() || null,
      description: description.trim() || null,
    };

    try {
      if (isEditing && meetingToEdit) {
        await apiCall(`/meetings/${meetingToEdit.id}/`, {
          method: "PATCH",
          body: payload,
        });
        toast.success("Meeting updated successfully.");
      } else {
        await apiCall("/meetings/", {
          method: "POST",
          body: payload,
        });
        toast.success("Meeting created successfully.");
      }
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      if (err instanceof ApiError && err.data && typeof err.data === "object") {
        const d = err.data as Record<string, string[] | string>;
        const parsed: Record<string, string> = {};
        for (const [k, v] of Object.entries(d)) {
          parsed[k] = Array.isArray(v) ? v.join(", ") : String(v);
        }
        setFieldErrors(parsed);
      }
      toast.error(isEditing ? "Failed to update meeting." : "Failed to create meeting.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Meeting" : "New Meeting"}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update meeting details, schedule, or facilitator assignment."
                : "Schedule a new congregational service, cell fellowship, or leadership session."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="meeting-name">Meeting Name *</Label>
              <Input
                id="meeting-name"
                placeholder="e.g., Sunday Worship Service"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: "" }));
                }}
                disabled={submitting}
              />
              {fieldErrors.name && (
                <p className="text-xs font-medium text-destructive">{fieldErrors.name}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="meeting-type">Meeting Type *</Label>
                <Select
                  value={meetingTypeId}
                  onValueChange={(val) => {
                    setMeetingTypeId(val);
                    if (fieldErrors.meeting_type_id) {
                      setFieldErrors((prev) => ({ ...prev, meeting_type_id: "" }));
                    }
                  }}
                  disabled={submitting}
                >
                  <SelectTrigger id="meeting-type">
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {types.map((t) => (
                      <SelectItem key={t.id} value={String(t.id)}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.meeting_type_id && (
                  <p className="text-xs font-medium text-destructive">
                    {fieldErrors.meeting_type_id}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="meeting-facilitator">Facilitator *</Label>
                <Select
                  value={facilitatorId}
                  onValueChange={(val) => {
                    setFacilitatorId(val);
                    if (fieldErrors.facilitator_id) {
                      setFieldErrors((prev) => ({ ...prev, facilitator_id: "" }));
                    }
                  }}
                  disabled={submitting}
                >
                  <SelectTrigger id="meeting-facilitator">
                    <SelectValue placeholder="Select facilitator..." />
                  </SelectTrigger>
                  <SelectContent>
                    {facilitators.map((f) => (
                      <SelectItem key={f.id} value={String(f.id)}>
                        {f.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.facilitator_id && (
                  <p className="text-xs font-medium text-destructive">
                    {fieldErrors.facilitator_id}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="meeting-start">Start Time *</Label>
                <Input
                  id="meeting-start"
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => {
                    setStartTime(e.target.value);
                    if (fieldErrors.start_time) {
                      setFieldErrors((prev) => ({ ...prev, start_time: "" }));
                    }
                  }}
                  disabled={submitting}
                />
                {fieldErrors.start_time && (
                  <p className="text-xs font-medium text-destructive">{fieldErrors.start_time}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="meeting-end">End Time (Optional)</Label>
                <Input
                  id="meeting-end"
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => {
                    setEndTime(e.target.value);
                    if (fieldErrors.end_time) {
                      setFieldErrors((prev) => ({ ...prev, end_time: "" }));
                    }
                  }}
                  disabled={submitting}
                />
                {fieldErrors.end_time && (
                  <p className="text-xs font-medium text-destructive">{fieldErrors.end_time}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="meeting-link">Meeting Link (Virtual / Online)</Label>
              <Input
                id="meeting-link"
                type="url"
                placeholder="https://zoom.us/j/... or Google Meet"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                disabled={submitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="meeting-desc">Description</Label>
              <Textarea
                id="meeting-desc"
                placeholder="Service order notes, sermon theme, or agenda..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                disabled={submitting}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              style={{ backgroundColor: "var(--brand-primary)" }}
              className="text-white hover:opacity-95"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "Schedule Meeting"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
