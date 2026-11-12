import React, { useState, useEffect, useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { apiCall } from "@/api/client";
import { getEventTypeColor } from "./event-utils";
import type { EventItem } from "./types";

interface EventCalendarViewProps {
  onSelectEvent: (eventId: number) => void;
}

export function EventCalendarView({ onSelectEvent }: EventCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = useMemo(() => {
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [startDate, endDate]);

  useEffect(() => {
    let isCancelled = false;
    const fetchMonthEvents = async () => {
      setLoading(true);
      try {
        const fromStr = format(startDate, "yyyy-MM-dd");
        const toStr = format(endDate, "yyyy-MM-dd");
        const res = await apiCall<{ results: EventItem[] } | EventItem[]>(
          `/events/?date_from=${fromStr}&date_to=${toStr}`
        );
        if (!isCancelled) {
          const list = Array.isArray(res) ? res : res.results || [];
          setEvents(list);
        }
      } catch (err) {
        console.error("Failed to load month events:", err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    fetchMonthEvents();
    return () => {
      isCancelled = true;
    };
  }, [currentDate]);

  const prevMonth = () => setCurrentDate((d) => subMonths(d, 1));
  const nextMonth = () => setCurrentDate((d) => addMonths(d, 1));
  const today = () => setCurrentDate(new Date());

  const getEventsForDay = (day: Date) => {
    return events.filter((ev) => {
      try {
        const evStart = new Date(ev.start_date);
        const evEnd = new Date(ev.end_date);
        const target = new Date(day);
        target.setHours(0, 0, 0, 0);
        evStart.setHours(0, 0, 0, 0);
        evEnd.setHours(0, 0, 0, 0);
        return target >= evStart && target <= evEnd;
      } catch {
        return false;
      }
    });
  };

  const weekHeaders = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="space-y-4">
      {/* Month Navigation Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card/60 backdrop-blur-md p-4 rounded-2xl border border-border shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]">
            <CalendarIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-display text-foreground">
              {format(currentDate, "MMMM yyyy")}
            </h2>
            <p className="text-xs text-muted-foreground">
              Interactive timeline view across active program dates
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={today}
            className="rounded-xl text-xs font-semibold"
          >
            Today
          </Button>
          <div className="flex items-center border border-border rounded-xl overflow-hidden bg-background">
            <Button
              variant="ghost"
              size="icon"
              onClick={prevMonth}
              className="h-8 w-8 rounded-none hover:bg-muted"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={nextMonth}
              className="h-8 w-8 rounded-none hover:bg-muted"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-xs">
        {/* Weekday Labels */}
        <div className="grid grid-cols-7 border-b border-border bg-muted/40 text-center text-xs font-bold text-muted-foreground py-2.5">
          {weekHeaders.map((w) => (
            <div key={w}>{w}</div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-border/60">
          {days.map((day, idx) => {
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, new Date());
            const dayEvents = getEventsForDay(day);
            const overflow = dayEvents.length - 3;

            return (
              <div
                key={day.toISOString()}
                className={`min-h-[110px] sm:min-h-[125px] p-2 transition-colors flex flex-col justify-between ${
                  !isCurrentMonth ? "bg-muted/15 opacity-50" : "bg-card hover:bg-muted/10"
                } ${isToday ? "bg-[var(--brand-primary)]/5 font-bold" : ""}`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`inline-flex items-center justify-center text-xs font-semibold h-6 w-6 rounded-full ${
                      isToday
                        ? "bg-[var(--brand-primary)] text-white font-bold shadow-xs"
                        : "text-foreground"
                    }`}
                  >
                    {format(day, "d")}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {dayEvents.length} {dayEvents.length === 1 ? "event" : "events"}
                    </span>
                  )}
                </div>

                {/* Day Event Chips */}
                <div className="space-y-1 flex-1">
                  {loading ? (
                    idx % 3 === 0 && <Skeleton className="h-5 w-full rounded-md" />
                  ) : (
                    <>
                      {dayEvents.slice(0, 3).map((ev) => {
                        const style = getEventTypeColor(ev.type);
                        return (
                          <button
                            key={ev.id}
                            type="button"
                            onClick={() => onSelectEvent(ev.id)}
                            className={`w-full text-left px-2 py-1 rounded-md text-[11px] font-medium truncate flex items-center gap-1.5 transition-transform hover:scale-[1.02] ${style.bg} ${style.text} border ${style.border}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${style.bar}`} />
                            <span className="truncate">{ev.ename}</span>
                          </button>
                        );
                      })}
                      {overflow > 0 && (
                        <div className="text-[10px] font-semibold text-muted-foreground px-1 pt-0.5">
                          +{overflow} more
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
