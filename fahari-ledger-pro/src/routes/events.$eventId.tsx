import React, { useState, useEffect } from "react";
import { createFileRoute, useParams, useNavigate, useRouterState } from "@tanstack/react-router";
import { apiCall } from "@/api/client";
import { EventDetailShell } from "@/components/events/EventDetailShell";
import type { EventLookups, EventsSearchParams } from "@/components/events/types";

export const Route = createFileRoute("/events/$eventId" as any)({
  head: () => ({
    meta: [
      { title: "Event Workspace — J.E.N Church ERP" },
      { name: "description", content: "Event details, timetable schedule, attendee registrations, and kiosk check-in." },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): EventsSearchParams => ({
    tab: ["details", "schedule", "registrations", "checkin", "analytics", "budget"].includes(s.tab as string)
      ? (s.tab as any)
      : "details",
    q: typeof s.q === "string" ? s.q : undefined,
    category: typeof s.category === "string" ? s.category : undefined,
    gender: typeof s.gender === "string" ? s.gender : undefined,
    checked_in: typeof s.checked_in === "string" ? s.checked_in : undefined,
    page: typeof s.page === "string" || typeof s.page === "number" ? String(s.page) : undefined,
  }),
  component: EventDetailPageComponent,
});

function EventDetailPageComponent() {
  const params = useParams({ strict: false }) as { eventId?: string };
  const eventId = params.eventId || "";
  const navigate = useNavigate();
  const routerState = useRouterState();
  const searchParams = (routerState.location.search || {}) as EventsSearchParams;

  const [lookups, setLookups] = useState<EventLookups | null>(null);

  useEffect(() => {
    apiCall<EventLookups>("/events/lookups/")
      .then(setLookups)
      .catch((err) => console.error("Failed to load lookups in event detail route:", err));
  }, []);

  const handleNavigate = (newParams: Partial<EventsSearchParams>) => {
    (navigate as any)({
      search: (prev: any) => ({
        ...prev,
        ...newParams,
      }),
    });
  };

  const handleBackToHub = () => {
    navigate({
      to: "/events",
      search: { view: "hub" },
    });
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] animate-in fade-in duration-500 pb-12">
      <EventDetailShell
        eventId={eventId}
        searchParams={searchParams}
        lookups={lookups}
        onNavigate={handleNavigate}
        onBackToHub={handleBackToHub}
      />
    </div>
  );
}
