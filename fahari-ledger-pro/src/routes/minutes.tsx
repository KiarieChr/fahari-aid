import { createFileRoute, useRouterState, useNavigate } from "@tanstack/react-router";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { apiCall } from "@/api/client";
import { MinutesLandingView } from "@/components/minutes/MinutesLandingView";
import { MinutesEditorView } from "@/components/minutes/MinutesEditorView";
import { MeetingFormModal } from "@/components/meetings/MeetingFormModal";
import type {
  MeetingListItem,
  MeetingTypeItem,
  FacilitatorItem,
  MeetingsFiltersLookup,
} from "@/components/meetings/types";

export interface MinutesSearchParams {
  meeting_id?: string;
  type_id?: string;
  month?: string;
  status?: string;
}

export const Route = createFileRoute("/minutes")({
  head: () => ({
    meta: [
      { title: "Meeting Minutes & Secretarial Records — J.E.N Church ERP" },
      {
        name: "description",
        content:
          "Official records, secretarial notes, resolution archives, and attendee documentation for church services.",
      },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): MinutesSearchParams => ({
    meeting_id: typeof s.meeting_id === "string" ? s.meeting_id : undefined,
    type_id: typeof s.type_id === "string" ? s.type_id : undefined,
    month: typeof s.month === "string" ? s.month : undefined,
    status: typeof s.status === "string" ? s.status : undefined,
  }),
  component: MinutesRouteComponent,
});

function MinutesRouteComponent() {
  const routerState = useRouterState();
  const searchParams = useMemo(() => {
    return (routerState.location.search || {}) as Record<string, string | undefined>;
  }, [routerState.location.search]);

  const meetingId = searchParams.meeting_id;

  // Metadata Lookups for New/Edit Meeting Modals
  const [types, setTypes] = useState<MeetingTypeItem[]>([]);
  const [facilitators, setFacilitators] = useState<FacilitatorItem[]>([]);
  const [meetingModalOpen, setMeetingModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<MeetingListItem | null>(null);

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

  return (
    <div className="space-y-6">
      {meetingId ? (
        <MinutesEditorView meetingId={meetingId} />
      ) : (
        <MinutesLandingView
          searchParams={searchParams}
          types={types}
          onOpenNewMeeting={() => {
            setEditingMeeting(null);
            setMeetingModalOpen(true);
          }}
          onOpenEditMeeting={(meeting) => {
            setEditingMeeting(meeting);
            setMeetingModalOpen(true);
          }}
        />
      )}

      {/* Shared New / Edit Meeting Modal */}
      <MeetingFormModal
        open={meetingModalOpen}
        onOpenChange={setMeetingModalOpen}
        meetingToEdit={editingMeeting}
        types={types}
        facilitators={facilitators}
        onSuccess={() => {
          fetchLookups();
        }}
      />
    </div>
  );
}
