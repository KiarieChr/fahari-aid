import React, { useState, useEffect } from "react";
import { apiCall } from "@/api/client";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Users,
  UserCheck,
  UserX,
  Percent,
  FileDown,
  BarChart3,
  PieChart as PieChartIcon,
  MapPin,
  HeartHandshake,
  Info,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { downloadPdf } from "@/api/pdf";
import type { EventDemographics } from "../types";

interface EventAnalyticsTabProps {
  eventId: number | string;
}

export function EventAnalyticsTab({ eventId }: EventAnalyticsTabProps) {
  const [data, setData] = useState<EventDemographics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const handleDownloadAnalyticsPdf = async () => {
    try {
      setDownloadingPdf(true);
      await downloadPdf(`/events/${eventId}/analytics/pdf/`, `event_analytics_${eventId}.pdf`);
      toast.success("Event analytics PDF downloaded successfully");
    } catch (err: any) {
      toast.error(err?.message || "Failed to download analytics report");
    } finally {
      setDownloadingPdf(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    apiCall<EventDemographics>(`/events/${eventId}/analytics/demographics/`)
      .then((res) => {
        if (isMounted) setData(res);
      })
      .catch((err) => {
        console.error("Failed to load demographics analytics:", err);
        if (isMounted) setError("Failed to load attendance demographics.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [eventId]);

  const noShowCount = Math.max(0, (data?.total_registrations ?? 0) - (data?.total_attended ?? 0));

  const hasData =
    data &&
    (data.total_registrations > 0 ||
      data.gender_distribution?.some((g) => g.count > 0) ||
      data.category_distribution?.some((c) => c.count > 0) ||
      data.top_residences?.some((r) => r.count > 0));

  // Colors using CSS variables / semantic theme tokens
  const primaryColor = "hsl(var(--primary))";
  const accentColor = "hsl(var(--accent-foreground))";
  const donutColors = ["hsl(var(--primary))", "hsl(var(--muted-foreground))"];
  const genderColors = ["hsl(var(--primary))", "hsl(var(--gold))", "hsl(var(--muted-foreground))"];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Action Bar with centralized PDF notice */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <div>
          <h3 className="text-lg font-bold font-display text-foreground">Demographic & Attendance Analytics</h3>
          <p className="text-xs text-muted-foreground">
            Attendance patterns, attendee demographics, and ministry servant distribution.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          disabled={downloadingPdf}
          onClick={handleDownloadAnalyticsPdf}
          className="rounded-xl h-9 text-xs font-medium border-border/80 hover:bg-muted transition-colors"
        >
          {downloadingPdf ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FileDown className="mr-2 h-4 w-4 text-primary" />
          )}
          Download report (PDF)
        </Button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Registered</p>
              {loading ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                <p className="text-2xl font-bold font-display">{data?.total_registrations ?? 0}</p>
              )}
            </div>
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Checked In</p>
              {loading ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                <p className="text-2xl font-bold font-display text-emerald-600 dark:text-emerald-400">
                  {data?.total_attended ?? 0}
                </p>
              )}
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <UserCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Attendance Rate</p>
              {loading ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                <p className="text-2xl font-bold font-display">
                  {data?.attendance_rate !== undefined ? `${data.attendance_rate.toFixed(1)}%` : "0.0%"}
                </p>
              )}
            </div>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Percent className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">No-Show Count</p>
              {loading ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                <p className="text-2xl font-bold font-display text-amber-600 dark:text-amber-400">{noShowCount}</p>
              )}
            </div>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <UserX className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-border/60">
              <CardHeader className="p-5">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-3 w-56 mt-1" />
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <Skeleton className="h-64 w-full rounded-xl" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="border-destructive/30 bg-destructive/5 p-8 text-center">
          <p className="text-sm font-medium text-destructive">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setLoading(true);
              apiCall<EventDemographics>(`/events/${eventId}/analytics/demographics/`)
                .then(setData)
                .catch(() => setError("Failed to reload."))
                .finally(() => setLoading(false));
            }}
            className="mt-3"
          >
            Retry
          </Button>
        </Card>
      ) : !hasData ? (
        <Card className="border-border/60 bg-card/60 backdrop-blur-sm p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-secondary/80 flex items-center justify-center mx-auto mb-3 text-muted-foreground">
            <BarChart3 className="h-6 w-6" />
          </div>
          <h4 className="font-semibold text-base text-foreground">No demographic data yet</h4>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Once attendees register and check in, demographic distributions and breakdown metrics will appear here.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gender Breakdown (Horizontal BarChart) */}
          <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
            <CardHeader className="p-5 pb-2">
              <CardTitle className="text-base font-bold font-display flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span>Gender Breakdown</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Distribution of registered attendees by identified gender
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-2">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={data.gender_distribution || []}
                    margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} horizontal={false} />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                    <YAxis dataKey="gender" type="category" tick={{ fontSize: 12 }} width={70} />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "0.75rem",
                        fontSize: "0.75rem",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "0.75rem" }} />
                    <Bar dataKey="count" name="Attendees" fill="var(--brand-primary, #6366f1)" radius={[0, 6, 6, 0]}>
                      {(data.gender_distribution || []).map((_, index) => (
                        <Cell key={`gender-cell-${index}`} fill={genderColors[index % genderColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Category Breakdown (BarChart) */}
          <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
            <CardHeader className="p-5 pb-2">
              <CardTitle className="text-base font-bold font-display flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                <span>Attendee Categories</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Registration classifications and member participant segments
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-2">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.category_distribution || []}
                    margin={{ top: 10, right: 20, left: 0, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                    <XAxis
                      dataKey="category"
                      angle={-20}
                      textAnchor="end"
                      height={40}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "0.75rem",
                        fontSize: "0.75rem",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "0.75rem" }} />
                    <Bar
                      dataKey="count"
                      name="Registrations"
                      fill="var(--brand-accent, #ec4899)"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Residence Top 10 (Horizontal BarChart) */}
          <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
            <CardHeader className="p-5 pb-2">
              <CardTitle className="text-base font-bold font-display flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Top 10 Residences</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Geographic residency distribution of registered attendees
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-2">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={data.top_residences || []}
                    margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} horizontal={false} />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                    <YAxis dataKey="residence" type="category" tick={{ fontSize: 11 }} width={90} />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "0.75rem",
                        fontSize: "0.75rem",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "0.75rem" }} />
                    <Bar dataKey="count" name="Residents" fill="var(--brand-primary, #6366f1)" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Serving Split (Two-Segment Donut) */}
          <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
            <CardHeader className="p-5 pb-2">
              <CardTitle className="text-base font-bold font-display flex items-center gap-2">
                <HeartHandshake className="h-4 w-4 text-primary" />
                <span>Serving Ministry Split</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Volunteers and active departmental servers vs attendees
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-2">
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={(data.serving_breakdown || []).map((s) => ({
                        name: s.serve ? "Serving" : "Not Serving",
                        value: s.count,
                      }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      <Cell fill="var(--brand-primary, #6366f1)" />
                      <Cell fill="hsl(var(--muted-foreground))" opacity={0.4} />
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "0.75rem",
                        fontSize: "0.75rem",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "0.75rem" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Financials Placeholder */}
      <div className="flex items-center gap-2 p-3.5 rounded-xl border border-border/60 bg-secondary/30 text-xs text-muted-foreground">
        <Info className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span>Financial analytics will be available when budget management is enabled.</span>
      </div>
    </div>
  );
}
