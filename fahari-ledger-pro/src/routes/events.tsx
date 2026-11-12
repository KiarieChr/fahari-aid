import React, { useState, useEffect, useMemo, useCallback } from "react";
import { createFileRoute, useRouterState, useNavigate } from "@tanstack/react-router";
import { apiCall } from "@/api/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  LayoutGrid,
  Calendar as CalendarIcon,
  QrCode,
  Plus,
} from "lucide-react";
import { EventsHubView } from "@/components/events/EventsHubView";
import { EventCalendarView } from "@/components/events/EventCalendarView";
import { EventKioskLandingView } from "@/components/events/EventKioskLandingView";
import { EventDetailShell } from "@/components/events/EventDetailShell";
import { EventFormModal } from "@/components/events/EventFormModal";
import type { EventLookups, EventsSearchParams } from "@/components/events/types";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events & Programs — J.E.N Church ERP" },
      {
        name: "description",
        content:
          "Oversee church conferences, manage registration rosters, conduct kiosk check-in, and review attendance demographics.",
      },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): EventsSearchParams => ({
    view:
      s.view === "calendar"
        ? "calendar"
        : s.view === "kiosk"
        ? "kiosk"
        : s.view === "hub"
        ? "hub"
        : undefined,
    tab: ["details", "schedule", "registrations", "checkin", "analytics", "budget"].includes(s.tab as string)
      ? (s.tab as any)
      : undefined,
    eventId: typeof s.eventId === "string" ? s.eventId : undefined,
    id: typeof s.id === "string" ? s.id : undefined,
    q: typeof s.q === "string" ? s.q : undefined,
    type: typeof s.type === "string" ? s.type : undefined,
    status: typeof s.status === "string" ? s.status : undefined,
    branch: typeof s.branch === "string" ? s.branch : undefined,
    date_from: typeof s.date_from === "string" ? s.date_from : undefined,
    date_to: typeof s.date_to === "string" ? s.date_to : undefined,
    checked_in: typeof s.checked_in === "string" ? s.checked_in : undefined,
    category: typeof s.category === "string" ? s.category : undefined,
    gender: typeof s.gender === "string" ? s.gender : undefined,
    page: typeof s.page === "string" || typeof s.page === "number" ? String(s.page) : undefined,
  }),
  component: EventsRouteComponent,
});

function EventsRouteComponent() {
  const routerState = useRouterState();
  const navigate = useNavigate();

  const searchParams = useMemo(() => {
    return (routerState.location.search || {}) as EventsSearchParams;
  }, [routerState.location.search]);

  // Selected event ID (from search query: ?eventId=123 or ?id=123)
  const activeEventId = searchParams.eventId || searchParams.id || null;

  // Active view: hub | calendar | kiosk
  const activeView = searchParams.view || "hub";

  // Common Lookups
  const [lookups, setLookups] = useState<EventLookups | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Refresh trigger counter
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch Lookups
  useEffect(() => {
    let mounted = true;
    apiCall<EventLookups>("/events/lookups/")
      .then((res) => {
        if (mounted) setLookups(res);
      })
      .catch((err) => {
        console.error("Failed to fetch event lookups:", err);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Search updater helper
  const updateSearch = useCallback(
    (newParams: Partial<EventsSearchParams>) => {
      (navigate as any)({
        search: (prev: any) => ({
          ...prev,
          ...newParams,
        }),
      });
    },
    [navigate]
  );

  // Navigate to an event's detail page
  const handleSelectEvent = useCallback(
    (eventId: number, targetTab: string = "details") => {
      updateSearch({
        eventId: String(eventId),
        tab: targetTab as any,
      });
    },
    [updateSearch]
  );

  // Back from detail to hub
  const handleBackToHub = useCallback(() => {
    updateSearch({
      eventId: undefined,
      id: undefined,
      tab: undefined,
    });
  }, [updateSearch]);

  return (
    <div className="mx-auto w-full max-w-[1600px] animate-in fade-in duration-500 pb-12">
      {/* If an event is selected, render the EventDetailShell */}
      {activeEventId ? (
        <EventDetailShell
          key={activeEventId}
          eventId={activeEventId}
          searchParams={searchParams}
          lookups={lookups}
          onNavigate={updateSearch}
          onBackToHub={handleBackToHub}
        />
      ) : (
        /* Otherwise, render the Events Hub */
        <div className="space-y-6">
          <PageHeader
            title="Events & Programs"
            description="Oversee upcoming conferences, manage registration rosters, review attendance demographics, and operate check-in kiosks."
            actions={
              <div className="flex items-center gap-2.5">
                <Button
                  variant="outline"
                  onClick={() => updateSearch({ view: "kiosk" })}
                  className="h-10 rounded-xl text-xs font-medium border-border/80"
                >
                  <QrCode className="mr-2 h-4 w-4" />
                  Kiosk Desk
                </Button>
                <Button
                  onClick={() => setCreateModalOpen(true)}
                  className="h-10 rounded-xl bg-primary text-primary-foreground text-xs font-medium"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Event
                </Button>
              </div>
            }
          />

          {/* Sub-nav view switcher matching meetings sub-nav style */}
          <div className="flex items-center gap-2 border-b border-border/60 pb-3">
            <button
              onClick={() => updateSearch({ view: "hub" })}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeView === "hub"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              <span>Events Hub</span>
            </button>

            <button
              onClick={() => updateSearch({ view: "calendar" })}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeView === "calendar"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <CalendarIcon className="h-4 w-4" />
              <span>Calendar View</span>
            </button>

            <button
              onClick={() => updateSearch({ view: "kiosk" })}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeView === "kiosk"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <QrCode className="h-4 w-4" />
              <span>Check-in Kiosk</span>
            </button>
          </div>

          {/* Sub-views */}
          {activeView === "hub" && (
            <EventsHubView
              key={refreshKey}
              searchParams={searchParams}
              lookups={lookups}
              onNavigate={updateSearch}
              onOpenNewEvent={() => setCreateModalOpen(true)}
              onSelectEvent={(id) => handleSelectEvent(id, "details")}
            />
          )}

          {activeView === "calendar" && (
            <EventCalendarView
              onSelectEvent={(id) => handleSelectEvent(id, "details")}
            />
          )}

          {activeView === "kiosk" && (
            <EventKioskLandingView
              onSelectEventCheckin={(id: number) => handleSelectEvent(id, "checkin")}
            />
          )}
        </div>
      )}

      {/* New Event Modal */}
      <EventFormModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={() => {
          setRefreshKey((k) => k + 1);
        }}
        lookups={lookups}
      />
    </div>
  );
}
