import React, { useState, useEffect } from "react";
import { toast } from "sonner";
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
import { Loader2 } from "lucide-react";
import { apiCall, ApiError } from "@/api/client";
import type { EventItem, EventDetail, EventLookups } from "./types";

interface EventFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventToEdit?: EventDetail | EventItem | null;
  lookups: EventLookups | null;
  onSuccess: (savedEvent: EventItem) => void;
}

export function EventFormModal({
  open,
  onOpenChange,
  eventToEdit,
  lookups,
  onSuccess,
}: EventFormModalProps) {
  const isEditing = Boolean(eventToEdit);

  const [formData, setFormData] = useState({
    ename: "",
    branch: "",
    start_date: "",
    end_date: "",
    start_time: "",
    type: "general",
    status: "draft",
    target_attendees: 100,
    facilitation_fee: "0.00",
    notes: "",
    image: "",
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (eventToEdit) {
      setFormData({
        ename: eventToEdit.ename || "",
        branch: eventToEdit.branch || "",
        start_date: eventToEdit.start_date ? eventToEdit.start_date.slice(0, 10) : "",
        end_date: eventToEdit.end_date ? eventToEdit.end_date.slice(0, 10) : "",
        start_time: eventToEdit.start_time || "",
        type: eventToEdit.type || "general",
        status: eventToEdit.status || "draft",
        target_attendees: eventToEdit.target_attendees || 100,
        facilitation_fee: eventToEdit.facilitation_fee || "0.00",
        notes: (eventToEdit as EventDetail).notes || "",
        image: eventToEdit.image || "",
      });
    } else {
      const today = new Date().toISOString().slice(0, 10);
      setFormData({
        ename: "",
        branch: lookups?.branches?.[0] || "Nairobi Main",
        start_date: today,
        end_date: today,
        start_time: "09:00",
        type: lookups?.types?.[0] || "conference",
        status: "draft",
        target_attendees: 100,
        facilitation_fee: "0.00",
        notes: "",
        image: "",
      });
    }
    setFieldErrors({});
  }, [eventToEdit, lookups, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const errors: Record<string, string> = {};
    if (!formData.ename.trim()) errors.ename = "Event title is required.";
    if (!formData.branch.trim()) errors.branch = "Branch is required.";
    if (!formData.start_date) errors.start_date = "Start date is required.";
    if (!formData.end_date) errors.end_date = "End date is required.";
    if (!formData.type) errors.type = "Event type is required.";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ename: formData.ename.trim(),
        branch: formData.branch.trim(),
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
        start_time: formData.start_time || null,
        type: formData.type,
        status: formData.status,
        target_attendees: Number(formData.target_attendees) || 100,
        facilitation_fee: formData.facilitation_fee || "0.00",
        notes: formData.notes.trim() || null,
        image: formData.image.trim() || null,
      };

      let result: EventItem;
      if (isEditing && eventToEdit) {
        result = await apiCall<EventItem>(`/events/${eventToEdit.id}/`, {
          method: "PATCH",
          body: payload,
        });
        toast.success(`Event "${result.ename}" updated successfully.`);
      } else {
        result = await apiCall<EventItem>("/events/", {
          method: "POST",
          body: payload,
        });
        toast.success(`Event "${result.ename}" created successfully.`);
      }

      onSuccess(result);
      onOpenChange(false);
    } catch (err: unknown) {
      if (err instanceof ApiError && err.data && typeof err.data === "object") {
        const serverErrors: Record<string, string> = {};
        for (const [key, val] of Object.entries(err.data as Record<string, unknown>)) {
          if (Array.isArray(val)) {
            serverErrors[key] = val.join(", ");
          } else if (typeof val === "string") {
            serverErrors[key] = val;
          }
        }
        setFieldErrors(serverErrors);
        toast.error("Please correct the form errors indicated below.");
      } else {
        toast.error((err as Error)?.message || "Failed to save event.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const typesList = lookups?.types?.length
    ? lookups.types
    : ["conference", "retreat", "youth", "training", "worship", "outreach", "general"];

  const statusesList = lookups?.statuses?.length
    ? lookups.statuses
    : ["draft", "published", "archived"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold font-display">
            {isEditing ? "Edit Event Program" : "Create New Event Program"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update schedule parameters, logistics, and target attendance capacity."
              : "Set up a new church conference, retreat, or ministry summit."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Event Title */}
          <div className="space-y-1.5">
            <Label htmlFor="ename" className="text-sm font-semibold">
              Event Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="ename"
              placeholder="e.g., Annual Kingdom Alignment Summit 2026"
              value={formData.ename}
              onChange={(e) => setFormData({ ...formData, ename: e.target.value })}
              className={`rounded-xl ${fieldErrors.ename ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
            {fieldErrors.ename && (
              <p className="text-xs font-medium text-destructive">{fieldErrors.ename}</p>
            )}
          </div>

          {/* Branch & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="branch" className="text-sm font-semibold">
                Branch Location <span className="text-destructive">*</span>
              </Label>
              <Input
                id="branch"
                placeholder="e.g., Nairobi Main"
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                className={`rounded-xl ${fieldErrors.branch ? "border-destructive" : ""}`}
              />
              {fieldErrors.branch && (
                <p className="text-xs font-medium text-destructive">{fieldErrors.branch}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="type" className="text-sm font-semibold">
                Event Category / Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.type}
                onValueChange={(val) => setFormData({ ...formData, type: val })}
              >
                <SelectTrigger id="type" className="rounded-xl capitalize">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {typesList.map((t) => (
                    <SelectItem key={t} value={t} className="capitalize">
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="start_date" className="text-sm font-semibold">
                Start Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="end_date" className="text-sm font-semibold">
                End Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="start_time" className="text-sm font-semibold">
                Start Time
              </Label>
              <Input
                id="start_time"
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="rounded-xl"
              />
            </div>
          </div>

          {/* Status & Target Attendees */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="status" className="text-sm font-semibold">
                Publication Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(val) => setFormData({ ...formData, status: val })}
              >
                <SelectTrigger id="status" className="rounded-xl capitalize">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {statusesList.map((st) => (
                    <SelectItem key={st} value={st} className="capitalize">
                      {st}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="target_attendees" className="text-sm font-semibold">
                Target Capacity
              </Label>
              <Input
                id="target_attendees"
                type="number"
                min="1"
                value={formData.target_attendees}
                onChange={(e) =>
                  setFormData({ ...formData, target_attendees: Number(e.target.value) || 0 })
                }
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="facilitation_fee" className="text-sm font-semibold">
                Facilitation Fee (KES)
              </Label>
              <Input
                id="facilitation_fee"
                type="number"
                step="0.01"
                min="0"
                value={formData.facilitation_fee}
                onChange={(e) => setFormData({ ...formData, facilitation_fee: e.target.value })}
                className="rounded-xl"
              />
            </div>
          </div>

          {/* Image URL text input */}
          <div className="space-y-1.5">
            <Label htmlFor="image" className="text-sm font-semibold">
              Banner / Poster Image URL
            </Label>
            <Input
              id="image"
              placeholder="https://example.com/images/banner.jpg"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="rounded-xl"
            />
            <p className="text-[11px] text-muted-foreground">
              Direct web image link. Centralized media upload will link in the Documents phase.
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-sm font-semibold">
              Event Description & Notes
            </Label>
            <Textarea
              id="notes"
              rows={3}
              placeholder="Program overview, venue directions, or ministry directives..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="rounded-xl"
            />
          </div>

          <DialogFooter className="pt-3 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-[var(--brand-primary)] text-white hover:opacity-90"
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Save Changes" : "Create Event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
