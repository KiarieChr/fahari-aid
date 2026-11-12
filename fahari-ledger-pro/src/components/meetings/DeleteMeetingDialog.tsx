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
import { apiCall, ApiError } from "@/api/client";
import { toast } from "sonner";
import { Loader2, AlertTriangle } from "lucide-react";
import type { MeetingListItem } from "./types";

interface DeleteMeetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meeting: MeetingListItem | null;
  onSuccess: () => void;
}

export function DeleteMeetingDialog({
  open,
  onOpenChange,
  meeting,
  onSuccess,
}: DeleteMeetingDialogProps) {
  const [deleting, setDeleting] = useState(false);

  if (!meeting) return null;

  const handleDelete = async () => {
    setDeleting(true);

    try {
      await apiCall(`/meetings/${meeting.id}/`, {
        method: "DELETE",
      });
      toast.success(`Meeting "${meeting.name}" deleted successfully.`);
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        // Attendance exists safety blocker
        const count = meeting.attendance_count || 1;
        toast.error(`Cannot delete — this meeting has ${count} attendance records.`);
      } else {
        toast.error(err instanceof Error ? err.message : "Failed to delete meeting.");
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive mb-1">
            <AlertTriangle className="h-5 w-5" />
            <DialogTitle>Delete Meeting</DialogTitle>
          </div>
          <DialogDescription className="text-foreground/90 font-medium pt-2">
            Delete "{meeting.name}"? This cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <p className="text-xs text-muted-foreground">
          All meeting schedule metadata will be permanently purged. If check-ins exist, deletion will be blocked by system safety constraints.
        </p>

        <DialogFooter className="gap-2 sm:gap-0 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Meeting"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
