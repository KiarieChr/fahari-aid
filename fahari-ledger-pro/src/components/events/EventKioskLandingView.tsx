import React, { useState, useEffect, useMemo } from "react";
import { QrCode, Search, Calendar, MapPin, ArrowRight, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { apiCall } from "@/api/client";
import { formatEventDates, getEventTypeColor } from "./event-utils";
import type { EventItem } from "./types";

interface EventKioskLandingViewProps {
  onSelectEventCheckin: (eventId: number) => void;
}

export function EventKioskLandingView({ onSelectEventCheckin }: EventKioskLandingViewProps) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const res = await apiCall<{ results: EventItem[] } | EventItem[]>("/events/?status=published");
        const list = Array.isArray(res) ? res : res.results || [];
        setEvents(list);
      } catch (err) {
        console.error("Failed to fetch published events for kiosk:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return events;
    return events.filter(
      (ev) =>
        ev.ename.toLowerCase().includes(q) ||
        ev.branch.toLowerCase().includes(q) ||
        (ev.type && ev.type.toLowerCase().includes(q))
    );
  }, [events, searchTerm]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Hero Card */}
      <Card className="border-border bg-gradient-to-br from-card via-card to-[var(--brand-primary)]/5 rounded-3xl shadow-sm overflow-hidden">
        <CardContent className="p-8 sm:p-10 text-center space-y-4">
          <div className="inline-flex p-4 rounded-2xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] shadow-xs">
            <QrCode className="h-10 w-10" />
          </div>
          <div className="space-y-1.5 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-foreground">
              Day-of Check-In Kiosk
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Select an ongoing or published program to launch the fast manual search & attendance kiosk desk.
            </p>
          </div>

          <div className="max-w-md mx-auto pt-2">
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search published event name or branch..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 rounded-2xl bg-background/80 shadow-xs border-border"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Program Selection Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Available Published Programs ({filteredEvents.length})
          </h3>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <Card className="rounded-2xl border-dashed border-2 border-border p-10 text-center">
            <CardContent className="space-y-2 p-0">
              <Calendar className="h-10 w-10 text-muted-foreground mx-auto stroke-1" />
              <h4 className="font-bold text-foreground">No published events</h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {searchTerm
                  ? `No published programs match "${searchTerm}".`
                  : "Publish an event to open the kiosk desk."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEvents.map((ev) => {
              const typeStyle = getEventTypeColor(ev.type);
              return (
                <div
                  key={ev.id}
                  onClick={() => onSelectEventCheckin(ev.id)}
                  className="group relative p-5 rounded-2xl border border-border bg-card hover:bg-muted/30 hover:border-[var(--brand-primary)]/40 transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline" className={`text-[10px] font-semibold capitalize ${typeStyle.bg} ${typeStyle.text} border-transparent`}>
                        {ev.type || "general"}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 font-semibold">
                        Ready for Check-In
                      </Badge>
                    </div>

                    <h4 className="text-base font-bold text-foreground font-display group-hover:text-[var(--brand-primary)] transition-colors line-clamp-1">
                      {ev.ename}
                    </h4>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatEventDates(ev.start_date, ev.end_date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {ev.branch}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-between border-t border-border/50 mt-4 text-xs font-semibold text-muted-foreground group-hover:text-[var(--brand-primary)]">
                    <span>
                      {ev.attendance_count} / {ev.registrations_count} Checked In
                    </span>
                    <span className="inline-flex items-center gap-1 font-bold text-[var(--brand-primary)]">
                      Launch Kiosk <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
