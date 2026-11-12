import React, { useState, useEffect, useCallback, useMemo } from "react";
import { apiCall } from "@/api/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarDays,
  Plus,
  Search,
  Users,
  UserCheck,
  Ticket,
  Percent,
  X,
  ChevronRight,
  MapPin,
  Calendar,
  Sparkles,
} from "lucide-react";
import { formatEventDates, getEventTypeColor } from "./event-utils";
import type { EventItem, EventLookups, EventsSearchParams } from "./types";

interface EventsHubViewProps {
  searchParams: EventsSearchParams;
  lookups: EventLookups | null;
  onNavigate: (params: Partial<EventsSearchParams>) => void;
  onOpenNewEvent: () => void;
  onSelectEvent: (eventId: number) => void;
}

export function EventsHubView({
  searchParams,
  lookups,
  onNavigate,
  onOpenNewEvent,
  onSelectEvent,
}: EventsHubViewProps) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search input with 300ms debounce
  const [searchVal, setSearchVal] = useState(searchParams.q || "");

  useEffect(() => {
    setSearchVal(searchParams.q || "");
  }, [searchParams.q]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if ((searchParams.q || "") !== searchVal) {
        onNavigate({ q: searchVal || undefined, page: "1" });
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [searchVal, searchParams.q, onNavigate]);

  // Fetch events list
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchParams.q) params.set("q", searchParams.q);
      if (searchParams.type) params.set("type", searchParams.type);
      if (searchParams.status) params.set("status", searchParams.status);
      if (searchParams.branch) params.set("branch", searchParams.branch);
      if (searchParams.date_from) params.set("date_from", searchParams.date_from);
      if (searchParams.date_to) params.set("date_to", searchParams.date_to);
      if (searchParams.page) params.set("page", searchParams.page);

      const queryString = params.toString() ? `?${params.toString()}` : "";
      const res = await apiCall<{ count: number; results: EventItem[] } | EventItem[]>(
        `/events/${queryString}`
      );

      if (Array.isArray(res)) {
        setEvents(res);
        setTotalCount(res.length);
      } else {
        setEvents(res.results || []);
        setTotalCount(res.count || 0);
      }
    } catch (err) {
      console.error("Failed to load events:", err);
      setError("Failed to load events. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [
    searchParams.q,
    searchParams.type,
    searchParams.status,
    searchParams.branch,
    searchParams.date_from,
    searchParams.date_to,
    searchParams.page,
  ]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Calculate top KPI stats from fetched items
  const stats = useMemo(() => {
    const activePrograms = events.filter((e) => e.status === "published").length;
    const totalRegistrations = events.reduce((sum, e) => sum + (e.registrations_count ?? e.registration_count ?? 0), 0);
    const totalCheckedIn = events.reduce((sum, e) => sum + (e.attendance_count ?? e.checked_in_count ?? 0), 0);
    const overallRate =
      totalRegistrations > 0 ? ((totalCheckedIn / totalRegistrations) * 100).toFixed(1) : "0.0";

    return {
      activePrograms,
      totalRegistrations,
      totalCheckedIn,
      overallRate,
    };
  }, [events]);

  // Active filter chips
  const activeChips = useMemo(() => {
    const chips: { key: keyof EventsSearchParams; label: string }[] = [];
    if (searchParams.q) chips.push({ key: "q", label: `Search: "${searchParams.q}"` });
    if (searchParams.type) {
      const typeLabel = lookups?.types.find((t) => t === searchParams.type) || searchParams.type;
      chips.push({ key: "type", label: `Type: ${typeLabel}` });
    }
    if (searchParams.status) chips.push({ key: "status", label: `Status: ${searchParams.status}` });
    if (searchParams.date_from) chips.push({ key: "date_from", label: `From: ${searchParams.date_from}` });
    if (searchParams.date_to) chips.push({ key: "date_to", label: `To: ${searchParams.date_to}` });
    return chips;
  }, [searchParams, lookups]);

  const clearAllFilters = () => {
    onNavigate({
      q: undefined,
      type: undefined,
      status: undefined,
      date_from: undefined,
      date_to: undefined,
      page: "1",
    });
  };

  const removeChip = (key: keyof EventsSearchParams) => {
    onNavigate({ [key]: undefined, page: "1" });
  };

  return (
    <div className="space-y-6">
      {/* Top KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Programs</p>
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <p className="text-2xl font-bold font-display">{stats.activePrograms} Published</p>
              )}
              <p className="text-xs text-muted-foreground">Active church conferences & summits</p>
            </div>
            <div className="p-3 rounded-2xl bg-primary/10 text-primary">
              <CalendarDays className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Registrations</p>
              {loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className="text-2xl font-bold font-display">{stats.totalRegistrations} RSVPs</p>
              )}
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                {stats.totalCheckedIn} checked in
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-gold/15 text-gold-foreground">
              <Ticket className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Attendance Rate</p>
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <p className="text-2xl font-bold font-display">{stats.overallRate}%</p>
              )}
              <p className="text-xs text-muted-foreground">Checked in / registered ratio</p>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Percent className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter Toolbar */}
      <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Left: Search input */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events by title or venue..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="pl-9 h-10 rounded-xl bg-background"
              />
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Type Select */}
              <Select
                value={searchParams.type || "all"}
                onValueChange={(val) => onNavigate({ type: val === "all" ? undefined : val, page: "1" })}
              >
                <SelectTrigger className="w-[140px] h-10 rounded-xl bg-background text-xs">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {lookups?.types.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status Select */}
              <Select
                value={searchParams.status || "all"}
                onValueChange={(val) => onNavigate({ status: val === "all" ? undefined : val, page: "1" })}
              >
                <SelectTrigger className="w-[130px] h-10 rounded-xl bg-background text-xs">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>

              {/* Date From */}
              <Input
                type="date"
                value={searchParams.date_from || ""}
                onChange={(e) => onNavigate({ date_from: e.target.value || undefined, page: "1" })}
                className="w-[140px] h-10 rounded-xl bg-background text-xs"
                placeholder="From date"
              />

              {/* Date To */}
              <Input
                type="date"
                value={searchParams.date_to || ""}
                onChange={(e) => onNavigate({ date_to: e.target.value || undefined, page: "1" })}
                className="w-[140px] h-10 rounded-xl bg-background text-xs"
                placeholder="To date"
              />

              {/* New Event Button */}
              <Button
                onClick={onOpenNewEvent}
                className="h-10 rounded-xl bg-primary text-primary-foreground font-medium px-4 text-xs shrink-0 shadow-sm"
              >
                <Plus className="mr-1.5 h-4 w-4" />
                New Event
              </Button>
            </div>
          </div>

          {/* Active Chips & Clear All */}
          {activeChips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/40">
              <span className="text-xs text-muted-foreground font-medium mr-1">Active filters:</span>
              {activeChips.map((chip) => (
                <Badge
                  key={chip.key}
                  variant="secondary"
                  className="rounded-lg text-xs font-normal pl-2.5 pr-1.5 py-1 flex items-center gap-1.5 bg-secondary/80 border border-border/50"
                >
                  <span>{chip.label}</span>
                  <button
                    onClick={() => removeChip(chip.key)}
                    className="hover:text-destructive p-0.5 rounded focus:outline-none"
                    aria-label={`Remove filter ${chip.label}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}

              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="h-7 text-xs text-muted-foreground hover:text-foreground px-2"
              >
                Clear all
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Events Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-border/60 p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <Skeleton className="h-3 w-full rounded-full" />
              <div className="flex justify-between items-center pt-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-8 w-24 rounded-lg" />
              </div>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="border-destructive/30 bg-destructive/5 p-8 text-center">
          <p className="text-sm font-medium text-destructive">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchEvents} className="mt-3">
            Retry
          </Button>
        </Card>
      ) : events.length === 0 ? (
        <Card className="border-border/60 bg-card/60 backdrop-blur-sm p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-secondary/80 flex items-center justify-center mx-auto mb-4 text-muted-foreground">
            <CalendarDays className="h-7 w-7" />
          </div>
          <h4 className="font-semibold text-lg font-display text-foreground">No events yet</h4>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            No events found matching your criteria. Create your first event to get started.
          </p>
          <Button onClick={onOpenNewEvent} className="mt-5 rounded-xl h-9 text-xs">
            <Plus className="mr-1.5 h-4 w-4" />
            New Event
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {events.map((evt) => {
            const typeColor = getEventTypeColor(evt.type);
            const target = evt.target_attendees || 100;
            const regCount = evt.registrations_count ?? evt.registration_count ?? 0;
            const checkinCount = evt.attendance_count ?? evt.checked_in_count ?? 0;
            const progressPct = Math.min(100, Math.round((regCount / target) * 100));

            return (
              <div
                key={evt.id}
                tabIndex={0}
                role="button"
                aria-label={`Open event ${evt.ename}`}
                onClick={() => onSelectEvent(evt.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectEvent(evt.id);
                  }
                }}
                className="group relative rounded-2xl border border-border/70 bg-card/80 hover:bg-card hover:border-primary/40 hover:shadow-md transition-all duration-200 overflow-hidden text-left focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
              >
                {/* Top strip color-coded by type */}
                <div className={`h-1.5 w-full ${typeColor.bg}`} />

                <div className="p-5 space-y-4">
                  {/* Header Row: Title + Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-base font-display text-foreground group-hover:text-primary transition-colors truncate">
                          {evt.ename}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            evt.status === "published"
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
                              : "bg-secondary text-muted-foreground border-border"
                          }`}
                        >
                          {evt.status}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          {formatEventDates(evt.start_date, evt.end_date)}
                        </span>
                        {evt.branch && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                            {evt.branch}
                          </span>
                        )}
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${typeColor.bg} ${typeColor.text}`}>
                          {evt.type}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 p-2 rounded-xl bg-secondary/50 text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>

                  {/* Target attendees progress bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        Target: <span className="font-semibold text-foreground">{target}</span> attendees
                      </span>
                      <span className="font-semibold text-foreground">
                        {regCount} / {target} registered ({progressPct}%)
                      </span>
                    </div>

                    <div className="relative h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300 bg-primary"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Bottom Stats Footer */}
                  <div className="flex items-center justify-between pt-1 border-t border-border/40 text-xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
                      <UserCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>
                        Checked in:{" "}
                        <strong className="text-foreground">{checkinCount}</strong>
                      </span>
                    </div>

                    <span className="text-xs text-primary font-medium group-hover:underline flex items-center gap-1">
                      Manage Event →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
