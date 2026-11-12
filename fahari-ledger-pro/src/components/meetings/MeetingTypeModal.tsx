import React, { useState } from "react";
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
import { apiCall, ApiError } from "@/api/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface MeetingTypeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function MeetingTypeModal({ open, onOpenChange, onSuccess }: MeetingTypeModalProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Meeting type name is required.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await apiCall("/meetings/types/", {
        method: "POST",
        body: { name: name.trim() },
      });
      toast.success("Meeting type created successfully.");
      setName("");
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      if (err instanceof ApiError && err.data && typeof err.data === "object") {
        const d = err.data as Record<string, string[] | string>;
        if (d.name) {
          setError(Array.isArray(d.name) ? d.name.join(", ") : String(d.name));
        } else {
          setError(err.message || "Failed to create meeting type.");
        }
      } else {
        setError(err instanceof Error ? err.message : "Failed to create meeting type.");
      }
      toast.error("Failed to create meeting type.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>New Meeting Type</DialogTitle>
            <DialogDescription>
              Add a new category classification for church services and gatherings.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="meeting-type-name">Category Name</Label>
            <Input
              id="meeting-type-name"
              placeholder="e.g., Youth Fellowship, Midweek Service"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              disabled={submitting}
              autoFocus
            />
            {error && <p className="text-xs font-medium text-destructive">{error}</p>}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
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
                  Creating...
                </>
              ) : (
                "Create Type"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
