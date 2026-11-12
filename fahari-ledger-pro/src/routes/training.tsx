import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, GraduationCap, ShieldCheck, Award, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/training")({
  head: () => ({
    meta: [
      { title: "Equipping & Training — J.E.N Church ERP" },
      { name: "description", content: "Discipleship tracks, module evaluations, and mentorship hub." },
    ],
  }),
  component: TrainingPage,
});

const TRACKS = [
  { id: "TRK-01", title: "Kingdom Foundations: New Believers Track", modulesCount: 6, enrolled: 54, completionRate: "88%", level: "Foundational" },
  { id: "TRK-02", title: "Character of a Minister: Leadership Equipping", modulesCount: 8, enrolled: 32, completionRate: "75%", level: "Intermediate" },
  { id: "TRK-03", title: "Spiritual Warfare & Intercession Mastery", modulesCount: 5, enrolled: 28, completionRate: "92%", level: "Advanced" },
];

function TrainingPage() {
  return (
    <div className="mx-auto w-full max-w-[1600px] animate-in fade-in duration-500">
      <PageHeader
        title="Equipping & Training (LMS)"
        description="Oversee discipleship curricula, mentor-mentee assignments, and module completion tracking."
        actions={
          <Button className="h-10 rounded-xl bg-primary text-primary-foreground">
            <BookOpen className="mr-2 h-4 w-4" /> New Training Track
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Learning Tracks</CardTitle>
            <GraduationCap className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display">6 Tracks</div>
            <p className="text-xs text-muted-foreground mt-1">Foundational to Senior Ministry</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Enrolled Trainees</CardTitle>
            <Award className="h-4 w-4 text-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display">114 Trainees</div>
            <p className="text-xs text-success mt-1">Actively submitting coursework</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mentorship Sessions</CardTitle>
            <ShieldCheck className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display">48 Logged</div>
            <p className="text-xs text-muted-foreground mt-1">By certified coaches & mentors</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold font-display">Active Learning Tracks</CardTitle>
          <CardDescription>Directly mapped to Django TrnLearningTracks and TrnLearningModules models.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {TRACKS.map((track) => (
              <div
                key={track.id}
                className="flex items-center justify-between p-4 rounded-xl border border-border/70 bg-card hover:bg-secondary/30 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{track.title}</span>
                    <Badge variant="secondary" className="text-[10px]">{track.level}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {track.modulesCount} Core Modules • {track.enrolled} Trainees Enrolled
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-bold text-success">{track.completionRate}</div>
                    <div className="text-xs text-muted-foreground">Avg Progress</div>
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
