import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HeartHandshake, Users, CalendarCheck, Flame, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/cells")({
  head: () => ({
    meta: [
      { title: "Cell Ministry — J.E.N Church ERP" },
      { name: "description", content: "Home fellowship oversight, cell reports, and weekly attendance." },
    ],
  }),
  component: CellsPage,
});

const CELL_HUBS = [
  { id: "CELL-01", name: "Bethel Cell Fellowship", leader: "Elder John Mwangi", zone: "Nairobi North", membersCount: 18, attendanceRate: "92%", meetingDay: "Wednesday 6:00 PM" },
  { id: "CELL-02", name: "Zion Home Fellowship", leader: "Deaconess Mary Atieno", zone: "Nairobi West", membersCount: 14, attendanceRate: "86%", meetingDay: "Thursday 6:30 PM" },
  { id: "CELL-03", name: "Moriah Grace Cell", leader: "Pastor Daniel Kiprop", zone: "Kasarani Hub", membersCount: 22, attendanceRate: "95%", meetingDay: "Wednesday 6:00 PM" },
  { id: "CELL-04", name: "Shiloh Fellowship", leader: "Brother Kevin Omondi", zone: "Ruaraka", membersCount: 12, attendanceRate: "78%", meetingDay: "Tuesday 6:30 PM" },
];

function CellsPage() {
  return (
    <div className="mx-auto w-full max-w-[1600px] animate-in fade-in duration-500">
      <PageHeader
        title="Cell Ministry & Home Fellowships"
        description="Oversee weekly home fellowships, cell leaders, weekly meeting reports, and pastoral care."
        actions={
          <Button className="h-10 rounded-xl bg-primary text-primary-foreground">
            <HeartHandshake className="mr-2 h-4 w-4" /> New Cell Group
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Cells</CardTitle>
            <HeartHandshake className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display">24 Groups</div>
            <p className="text-xs text-muted-foreground mt-1">Across 6 regional church zones</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assigned Members</CardTitle>
            <Users className="h-4 w-4 text-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display">342 Members</div>
            <p className="text-xs text-muted-foreground mt-1">82% of congregational roster</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Weekly Attendance</CardTitle>
            <CalendarCheck className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display">89.4%</div>
            <p className="text-xs text-success mt-1">↑ 4.2% from prior cycle</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reports Logged</CardTitle>
            <Flame className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display">21 / 24</div>
            <p className="text-xs text-muted-foreground mt-1">Mid-week returns filed</p>
          </CardContent>
        </Card>
      </div>

      {/* Cell Groups List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold font-display">Cell Directory & Oversight</CardTitle>
          <CardDescription>Active home fellowships connected to Django Cell and CellReports models.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CELL_HUBS.map((cell) => (
              <div
                key={cell.id}
                className="flex items-center justify-between p-4 rounded-xl border border-border/70 bg-card hover:bg-secondary/40 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{cell.name}</span>
                    <Badge variant="secondary" className="text-[10px] bg-secondary text-secondary-foreground">{cell.zone}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Leader: <span className="font-medium text-foreground">{cell.leader}</span> • {cell.meetingDay}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-bold">{cell.membersCount} Members</div>
                    <div className="text-xs text-success font-medium">{cell.attendanceRate} Attendance</div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
