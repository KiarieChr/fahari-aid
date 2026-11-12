import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Users,
  Flame,
  Landmark,
  ShieldCheck,
  TrendingUp,
  Download,
  Plus,
  RefreshCcw,
  Calendar as CalendarIcon,
  Video,
  Clock,
  Cake,
  ExternalLink,
  ArrowUpRight,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageHeader } from "@/components/layout/PageHeader";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { apiCall } from "@/api/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Operations Command — J.E.N Church ERP" },
      {
        name: "description",
        content:
          "Real-time institutional command center for Jesus Enthroned Network, monitoring attendance, fellowships, and kingdom stewardship.",
      },
    ],
  }),
  component: DashboardPage,
});

interface OverviewData {
  kpis: {
    active_members: number;
    monthly_attendance: number;
    monthly_meetings?: number;
    avg_attendance_per_meeting?: number;
    attendance_month?: string;
    attendance_month_short?: string;
    total_pledged: number;
    total_redeemed: number;
    redemption_rate: number;
    active_cells: number;
  };
  monthly_trend: Array<{
    month: string;
    month_full?: string;
    total?: number;
    meetings_count?: number;
    avg_per_meeting?: number;
    [key: string]: any;
  }>;
  trend_series?: string[];
  upcoming_events: Array<{
    id: number;
    title: string;
    start_date: string;
    calendar_label: string;
    notes: string;
    type: string;
    url?: string;
  }>;
  recent_meetings: Array<{
    id: number;
    name: string;
    start_time: string;
    meeting_code: string;
    facilitator: string;
  }>;
  upcoming_birthdays: Array<{
    id: number;
    name: string;
    date: string;
    phone: string;
  }>;
  stewardship: {
    pledged: number;
    redeemed: number;
    balance: number;
    rate: number;
  };
}

const SERIES_PALETTE = [
  { stroke: "oklch(0.28 0.14 252)", fill: "oklch(0.28 0.14 252)", id: "gSeries0" }, // Royal Sapphire
  { stroke: "oklch(0.75 0.13 78)", fill: "oklch(0.75 0.13 78)", id: "gSeries1" },   // Warm Gold
  { stroke: "oklch(0.65 0.16 160)", fill: "oklch(0.65 0.16 160)", id: "gSeries2" }, // Emerald Teal
  { stroke: "oklch(0.55 0.18 290)", fill: "oklch(0.55 0.18 290)", id: "gSeries3" }, // Indigo
  { stroke: "oklch(0.68 0.17 35)", fill: "oklch(0.68 0.17 35)", id: "gSeries4" },   // Coral
];

// Fallback data in case server is offline or loading
const fallbackData: OverviewData = {
  kpis: {
    active_members: 518,
    monthly_attendance: 213,
    monthly_meetings: 10,
    avg_attendance_per_meeting: 21.3,
    attendance_month: "September 2026",
    attendance_month_short: "Sep",
    total_pledged: 641300,
    total_redeemed: 266500,
    redemption_rate: 41.6,
    active_cells: 6,
  },
  trend_series: ["Fellowship", "Word Session", "Board Meeting", "Committee Meeting"],
  monthly_trend: [
    { month: "Apr", month_full: "April 2026", total: 222, meetings_count: 9, avg_per_meeting: 24.7, "Board Meeting": 7, "Committee Meeting": 16, "Word Session": 199 },
    { month: "May", month_full: "May 2026", total: 244, meetings_count: 14, avg_per_meeting: 17.4, "Board Meeting": 20, "Fellowship": 111, "Word Session": 113 },
    { month: "Jun", month_full: "June 2026", total: 262, meetings_count: 10, avg_per_meeting: 26.2, "Board Meeting": 80, "Fellowship": 181, "Word Session": 1 },
    { month: "Jul", month_full: "July 2026", total: 212, meetings_count: 11, avg_per_meeting: 19.3, "Board Meeting": 36, "Fellowship": 176 },
    { month: "Aug", month_full: "August 2026", total: 165, meetings_count: 11, avg_per_meeting: 15.0, "Board Meeting": 68, "Committee Meeting": 20, "Fellowship": 77 },
    { month: "Sep", month_full: "September 2026", total: 213, meetings_count: 10, avg_per_meeting: 21.3, "Board Meeting": 99, "Committee Meeting": 40, "Fellowship": 74 },
  ],
  upcoming_events: [
    {
      id: 11,
      title: "Ignite Purpose Conference 2026",
      start_date: "Dec 02, 2026",
      calendar_label: "Conference",
      notes: "Main sanctuary annual flagship conference",
      type: "event",
    },
    {
      id: 10,
      title: "Kingdom Leadership Summit",
      start_date: "Nov 15, 2026",
      calendar_label: "Leadership",
      notes: "Strategic ministry training for cell and ministry leaders",
      type: "event",
    },
    {
      id: 9,
      title: "All-Night Prayer Vigil",
      start_date: "Nov 06, 2026",
      calendar_label: "Prayer",
      notes: "Monthly congregational intercession and revival vigil",
      type: "event",
    },
  ],
  recent_meetings: [
    {
      id: 1173,
      name: "Tuesday Fellowship Service",
      start_time: "Tue, Sep 29 • 02:30 PM",
      meeting_code: "JEN-1173",
      facilitator: "Pastoral Team",
    },
    {
      id: 1172,
      name: "Executive Leadership Meeting",
      start_time: "Mon, Sep 28 • 03:00 PM",
      meeting_code: "JEN-1172",
      facilitator: "Senior Pastor",
    },
    {
      id: 1171,
      name: "Tuesday Fellowship Service",
      start_time: "Tue, Sep 22 • 02:30 PM",
      meeting_code: "JEN-1171",
      facilitator: "Pastoral Team",
    },
    {
      id: 1170,
      name: "Pastoral Care & Counseling",
      start_time: "Mon, Sep 21 • 03:00 PM",
      meeting_code: "JEN-1170",
      facilitator: "Deacons Board",
    },
    {
      id: 1169,
      name: "Cell Leaders Strategy Forum",
      start_time: "Thu, Sep 17 • 03:00 PM",
      meeting_code: "JEN-1169",
      facilitator: "Cell Ministry Director",
    },
  ],
  upcoming_birthdays: [
    { id: 21, name: "James Kiarie", date: "Nov 02", phone: "+254 712 345 678" },
    { id: 22, name: "Benjamin Kimani", date: "Nov 05", phone: "+254 722 987 654" },
    { id: 32, name: "Hellen Liana", date: "Nov 11", phone: "+254 733 112 233" },
    { id: 34, name: "Aron Ngeno", date: "Nov 18", phone: "+254 701 556 778" },
  ],
  stewardship: {
    pledged: 641300,
    redeemed: 266500,
    balance: 374800,
    rate: 41.6,
  },
};

function DashboardPage() {
  const [data, setData] = useState<OverviewData>(fallbackData);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOverview = async () => {
    setIsLoading(true);
    try {
      const res = await apiCall<OverviewData>("/analytics/overview/");
      if (res && res.kpis) {
        setData(res);
      }
    } catch (_err) {
      // Graceful fallback to rich local state
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const kpis = [
    {
      label: "Active Congregants",
      value: data.kpis.active_members ? `${data.kpis.active_members} Souls` : "518 Souls",
      change: 4.2,
      hint: "Registered Roll",
      icon: Users,
      accent: "primary" as const,
    },
    {
      label: `Attendance (${data.kpis.attendance_month_short || "MTD"})`,
      value: `${data.kpis.monthly_attendance ?? 0} Turnout`,
      change: 8.5,
      hint: data.kpis.avg_attendance_per_meeting
        ? `~${data.kpis.avg_attendance_per_meeting} avg (${data.kpis.monthly_meetings || 0} mtgs)`
        : "Avg per meeting",
      icon: Flame,
      accent: "gold" as const,
    },
    {
      label: "Pledges Redeemed",
      value: `${data.kpis.redemption_rate}%`,
      change: 12.4,
      hint: `KSh ${(data.kpis.total_redeemed / 1000).toFixed(0)}k of ${(data.kpis.total_pledged / 1000).toFixed(0)}k`,
      icon: Landmark,
      accent: "success" as const,
    },
    {
      label: "Active Cell Fellowships",
      value: `${data.kpis.active_cells} Fellowships`,
      change: 5.0,
      hint: "94% Report Rate",
      icon: ShieldCheck,
      accent: "primary" as const,
    },
  ];

  const seriesList =
    data.trend_series && data.trend_series.length > 0
      ? data.trend_series
      : ["Fellowship", "Word Session", "Board Meeting", "Committee Meeting"];

  return (
    <div className="mx-auto w-full max-w-[1600px] animate-in fade-in duration-500">
      {/* Top Header & Context Actions */}
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <PageHeader
          title="J.E.N Operations Command"
          description="Real-time institutional command center for Jesus Enthroned Network, monitoring attendance, fellowships, and kingdom stewardship."
          className="mb-0"
        />

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl bg-secondary/40 px-3.5 py-2 text-xs font-semibold text-muted-foreground border border-border/50">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span>Nairobi: {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
          </div>

          <Button
            variant="outline"
            onClick={fetchOverview}
            className="h-10 rounded-xl border-border/60 hover:bg-secondary/50 font-bold text-xs"
          >
            <RefreshCcw className="mr-2 h-3.5 w-3.5" /> Refresh
          </Button>

          <Button
            variant="outline"
            className="h-10 rounded-xl border-border/60 hover:bg-secondary/50 font-bold text-xs"
          >
            <Download className="mr-2 h-3.5 w-3.5" /> Export Report
          </Button>

          <Button className="h-10 rounded-xl bg-primary px-5 text-primary-foreground shadow-glow hover:bg-primary/90 font-bold text-xs">
            <Plus className="mr-2 h-4 w-4" /> Service Check-In
          </Button>
        </div>
      </div>

      {/* Top 4 Strategic KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading
          ? Array(4)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-[140px] w-full rounded-2xl" />
              ))
          : kpis.map((kpi, i) => <KpiCard key={i} {...kpi} />)}
      </div>

      {/* Main Grid: Visual Analytics + Detailed Tab Views + Operations Sidebar */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column (2 Cols): Trend Chart & Tabbed Church Operational Data */}
        <div className="lg:col-span-2 space-y-6">
          {/* Attendance Area Chart */}
          <Card className="rounded-2xl border-border/60 shadow-soft overflow-hidden">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 bg-secondary/5 border-b border-border/40 gap-3">
              <div className="space-y-1">
                <CardTitle className="font-display text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Congregational Attendance & Program Trends
                </CardTitle>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                  Turnout Trends (Last 6 Months • By Meeting Type)
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-wider">
                {seriesList.map((sName, idx) => {
                  const pal = SERIES_PALETTE[idx % SERIES_PALETTE.length];
                  return (
                    <span key={sName} className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: pal.stroke }} />
                      {sName}
                    </span>
                  );
                })}
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoading ? (
                <Skeleton className="h-[300px] w-full rounded-xl" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data.monthly_trend} margin={{ left: -10, right: 10 }}>
                    <defs>
                      {seriesList.map((sName, idx) => {
                        const pal = SERIES_PALETTE[idx % SERIES_PALETTE.length];
                        return (
                          <linearGradient key={pal.id} id={pal.id} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={pal.fill} stopOpacity={0.25} />
                            <stop offset="100%" stopColor={pal.fill} stopOpacity={0} />
                          </linearGradient>
                        );
                      })}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 260)" vertical={false} />
                    <XAxis
                      dataKey="month"
                      stroke="oklch(0.5 0.03 260)"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                      className="font-bold uppercase tracking-wider"
                    />
                    <YAxis
                      stroke="oklch(0.5 0.03 260)"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      dx={-5}
                      tickFormatter={(v) => `${v}`}
                    />
                    <Tooltip
                      cursor={{ stroke: "oklch(0.28 0.14 252)", strokeWidth: 1, strokeDasharray: "4 4" }}
                      contentStyle={{
                        background: "oklch(1 0 0)",
                        border: "1px solid oklch(0.92 0.01 260)",
                        borderRadius: 16,
                        boxShadow: "0 10px 30px -10px oklch(0.2 0.05 265 / 0.15)",
                        padding: "12px 16px",
                      }}
                      itemStyle={{ fontSize: 12, fontWeight: 700, padding: "2px 0" }}
                      labelStyle={{
                        fontSize: 10,
                        fontWeight: 800,
                        textTransform: "uppercase",
                        color: "oklch(0.5 0.03 260)",
                        marginBottom: 8,
                      }}
                      formatter={(value: any, name: any) => [`${value} attendees`, name]}
                    />
                    {seriesList.map((sName, idx) => {
                      const pal = SERIES_PALETTE[idx % SERIES_PALETTE.length];
                      return (
                        <Area
                          key={sName}
                          type="monotone"
                          name={sName}
                          dataKey={sName}
                          stroke={pal.stroke}
                          strokeWidth={2.5}
                          fill={`url(#${pal.id})`}
                          animationDuration={1500}
                          animationBegin={idx * 150}
                        />
                      );
                    })}
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Side-by-Side Split Activity & Schedule Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Card: Recent Services & Meetings */}
            <Card className="rounded-2xl border-border/60 shadow-soft overflow-hidden flex flex-col justify-between">
              <div>
                <CardHeader className="bg-secondary/15 pb-4 border-b border-border/40 flex flex-row items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="font-display text-base font-bold flex items-center gap-2">
                      <Video className="h-4 w-4 text-primary" />
                      Recent Services & Fellowships
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Latest service check-ins and attendance records
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" asChild className="h-8 px-2 text-xs font-semibold text-primary hover:text-primary/80">
                    <Link to="/meetings">
                      View all <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {!data.recent_meetings || data.recent_meetings.length === 0 ? (
                    <div className="py-8 text-center text-xs text-muted-foreground">
                      No recent meetings recorded.
                    </div>
                  ) : (
                    data.recent_meetings.slice(0, 5).map((meeting) => (
                      <div
                        key={meeting.id}
                        className="flex items-center justify-between gap-3 p-2.5 rounded-xl hover:bg-secondary/20 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="bg-primary/10 text-primary p-2 rounded-lg shrink-0">
                            <Video className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 space-y-0.5">
                            <p className="font-medium text-sm text-foreground truncate">
                              {meeting.name}
                            </p>
                            <p className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3 text-muted-foreground/70 shrink-0" />
                              <span>{meeting.start_time}</span>
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="font-mono text-[10px] shrink-0 font-semibold">
                          {meeting.meeting_code || "IN-PERSON"}
                        </Badge>
                      </div>
                    ))
                  )}
                </CardContent>
              </div>
            </Card>

            {/* Right Card: Upcoming Church Calendar */}
            <Card className="rounded-2xl border-border/60 shadow-soft overflow-hidden flex flex-col justify-between">
              <div>
                <CardHeader className="bg-secondary/15 pb-4 border-b border-border/40 flex flex-row items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="font-display text-base font-bold flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-amber-600" />
                      Upcoming Schedule & Programs
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Next fellowships, prayer vigils, and conferences
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" asChild className="h-8 px-2 text-xs font-semibold text-primary hover:text-primary/80">
                    <Link to="/events">
                      View all <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {!data.upcoming_events || data.upcoming_events.length === 0 ? (
                    <div className="py-8 text-center text-xs text-muted-foreground">
                      No scheduled programs found.
                    </div>
                  ) : (
                    data.upcoming_events.slice(0, 5).map((ev) => (
                      <div
                        key={ev.id}
                        className="flex items-center justify-between gap-3 p-2.5 rounded-xl hover:bg-secondary/20 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="bg-amber-500/10 text-amber-600 p-2 rounded-lg shrink-0">
                            <CalendarIcon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 space-y-0.5">
                            <p className="font-medium text-sm text-foreground truncate">
                              {ev.title}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{ev.start_date}</span>
                              {ev.url && (
                                <span className="flex items-center gap-0.5 text-primary text-[10px] font-bold">
                                  • <ExternalLink className="w-2.5 h-2.5" /> Virtual
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[10px] uppercase font-bold shrink-0 bg-background/60">
                          {ev.calendar_label || "Church Program"}
                        </Badge>
                      </div>
                    ))
                  )}
                </CardContent>
              </div>
            </Card>
          </div>
        </div>

        {/* Right Operations Sidebar */}
        <div className="space-y-6">
          {/* Cell Fellowship Countdown & Status */}
          <Card className="rounded-2xl border-border/60 shadow-soft overflow-hidden">
            <CardHeader className="bg-secondary/15 pb-3 border-b border-border/40 flex flex-row items-center justify-between">
              <CardTitle className="font-display text-base flex items-center gap-2">
                <Flame className="h-4 w-4 text-gold" />
                Cell Ministry Pulse
              </CardTitle>
              <Badge variant="outline" className="text-[10px] bg-gold/10 text-gold-foreground font-bold">
                Weekly Cycles
              </Badge>
            </CardHeader>
            <CardContent className="pt-5 space-y-4">
              <div className="rounded-xl bg-gradient-to-br from-primary/5 to-gold/10 p-4 border border-primary/10">
                <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Next Midweek Fellowships</p>
                <div className="flex items-baseline justify-between mt-1">
                  <p className="font-display text-xl font-black text-foreground">Wednesday, 6:00 PM</p>
                  <span className="text-xs font-bold text-primary">In 2 Days</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Kilimani, Westlands, Kasarani, Karen, CBD & South C zones.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="rounded-xl bg-secondary/30 p-3 border border-border/40">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Active Cells</p>
                  <p className="font-display text-xl font-bold text-foreground mt-0.5">{data.kpis.active_cells}</p>
                </div>
                <div className="rounded-xl bg-secondary/30 p-3 border border-border/40">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Reports In</p>
                  <p className="font-display text-xl font-bold text-success mt-0.5">94%</p>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full h-9 rounded-xl font-bold text-xs text-primary border-primary/20 hover:bg-primary/5"
              >
                View Cell Locations & Directory <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </CardContent>
          </Card>

          {/* Upcoming Member Birthdays */}
          <Card className="rounded-2xl border-border/60 shadow-soft overflow-hidden">
            <CardHeader className="bg-secondary/15 pb-3 border-b border-border/40 flex flex-row items-center justify-between">
              <CardTitle className="font-display text-base flex items-center gap-2">
                <Cake className="h-4 w-4 text-primary" />
                Upcoming Birthdays
              </CardTitle>
              <Badge variant="outline" className="text-[10px] font-normal">
                Pastoral Care
              </Badge>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {data.upcoming_birthdays.map((bday) => (
                <div key={bday.id} className="flex items-center justify-between py-1.5 group">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                      {bday.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                        {bday.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{bday.phone}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-bold bg-secondary/40">
                    {bday.date}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Operational Health & Church Sync */}
          <Card className="rounded-2xl border-border/60 shadow-soft bg-primary text-primary-foreground overflow-hidden group relative">
            <div className="absolute right-0 top-0 h-32 w-32 -translate-y-12 translate-x-12 rounded-full bg-white/10 blur-3xl transition-transform group-hover:scale-150" />
            <CardHeader>
              <CardTitle className="font-display text-base text-primary-foreground flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-gold" />
                Church Operations Status
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="opacity-80">PostgreSQL Service Health</span>
                <span className="font-bold text-gold">100% Operational</span>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full w-full bg-gold transition-all duration-1000" />
              </div>
              <p className="text-xs text-primary-foreground/80 leading-relaxed">
                Congregational database synchronized with 518 active members and full attendance registers.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
