import React from "react";
import { format } from "date-fns";
import {
  Users,
  CheckCircle2,
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  Edit,
  TrendingUp,
  Percent,
  FileText,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatEventDates, getEventTypeColor } from "../event-utils";
import type { EventDetail } from "../types";

interface EventOverviewTabProps {
  event: EventDetail;
  onEdit: () => void;
}

export function EventOverviewTab({ event, onEdit }: EventOverviewTabProps) {
  const typeStyle = getEventTypeColor(event.type);
  const regCount = event.registrations_count || 0;
  const targetCount = event.target_attendees || 1;
  const capacityPct = Math.min(Math.round((regCount / targetCount) * 100), 100);
  const attCount = event.attendance_count || 0;
  const attRate = regCount > 0 ? Math.round((attCount / regCount) * 100) : 0;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-in fade-in duration-300">
      {/* Left Column (2/3 on xl) */}
      <div className="xl:col-span-2 space-y-6">
        {/* Event Narrative & Description Card */}
        <Card className="rounded-2xl border-border shadow-xs overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-3 bg-muted/20 border-b border-border">
            <div>
              <CardTitle className="text-base font-bold font-display flex items-center gap-2">
                <FileText className="h-4 w-4 text-[var(--brand-primary)]" /> Program Scope & Notes
              </CardTitle>
              <CardDescription className="text-xs">
                Objectives, ministry context, and general directions
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="rounded-xl h-8 px-3 text-xs font-semibold gap-1.5"
            >
              <Edit className="h-3.5 w-3.5" /> Edit Details
            </Button>
          </CardHeader>
          <CardContent className="pt-5 space-y-4">
            {event.notes ? (
              <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                {event.notes}
              </p>
            ) : (
              <div className="py-6 text-center text-muted-foreground text-sm flex items-center justify-center gap-2">
                <AlertCircle className="h-4 w-4" /> No notes or description added for this event.
              </div>
            )}

            {/* Target Capacity & Progress */}
            <div className="pt-4 border-t border-border/60">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-muted-foreground">Attendee Capacity Allocation</span>
                <span className="font-bold text-foreground">
                  {regCount} / {event.target_attendees} registered ({capacityPct}%)
                </span>
              </div>
              <Progress value={capacityPct} className="h-2.5 rounded-full" />
            </div>

            {/* Budget Notice */}
            <div className="p-4 rounded-xl bg-muted/40 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-semibold text-muted-foreground block">Planned Budget</span>
                <span className="text-sm font-bold text-foreground">
                  KES {Number(event.total_budget || 0).toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground ml-2 italic">
                  (Budget not configured)
                </span>
              </div>
              <Badge variant="outline" className="text-xs bg-muted text-muted-foreground border-border w-fit">
                Financials Gated
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column (1/3 on xl) */}
      <div className="space-y-6">
        {/* Key Stats Card */}
        <Card className="rounded-2xl border-border shadow-xs overflow-hidden">
          <CardHeader className="pb-3 bg-muted/20 border-b border-border">
            <CardTitle className="text-base font-bold font-display flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[var(--brand-accent)]" /> Participation Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 divide-y divide-border/60">
            {/* Registrations */}
            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-medium text-muted-foreground block">Confirmed Registrations</span>
                  <span className="text-base font-bold text-foreground">{regCount} Attendees</span>
                </div>
              </div>
              <Badge variant="secondary" className="rounded-lg text-xs font-bold">
                {regCount}
              </Badge>
            </div>

            {/* Checked-In */}
            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-medium text-muted-foreground block">Checked-In Headcount</span>
                  <span className="text-base font-bold text-foreground">{attCount} On-Site</span>
                </div>
              </div>
              <Badge variant="outline" className="rounded-lg text-xs bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 font-bold">
                {attCount}
              </Badge>
            </div>

            {/* Attendance Rate */}
            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[var(--brand-accent)]/15 text-[var(--brand-accent)]">
                  <Percent className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-medium text-muted-foreground block">Turnout Velocity</span>
                  <span className="text-base font-bold text-foreground">{attRate}% of RSVPs</span>
                </div>
              </div>
              <span className="text-xs font-extrabold text-[var(--brand-accent)] font-display">
                {attRate}%
              </span>
            </div>

            {/* Facilitation Fee */}
            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <DollarSign className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-medium text-muted-foreground block">Facilitation Fee</span>
                  <span className="text-base font-bold text-foreground">
                    KES {Number(event.facilitation_fee || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Timetable Sessions count */}
            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-medium text-muted-foreground block">Program Sessions</span>
                  <span className="text-base font-bold text-foreground">{event.schedule_count} Sessions</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
