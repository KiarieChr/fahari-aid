import React, { useState } from "react";
import { useBranding } from "@/context/BrandingContext";
import { DocumentUniformHeader } from "./DocumentUniformHeader";
import { downloadPdf, fetchPdfBlob } from "@/api/pdf";
import {
  FileText,
  Users,
  Calendar,
  BarChart3,
  Clock,
  Sparkles,
  Download,
  Printer,
  CheckCircle2,
  Sliders,
  Eye,
  RotateCw,
  Loader2,
  FileCheck,
  Building,
  Shield,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export type DocumentTypeKey =
  | "member_profile"
  | "event_attendance"
  | "event_schedule"
  | "event_demographics"
  | "meeting_minutes"
  | "assimilation_summary";

interface DocumentMeta {
  key: DocumentTypeKey;
  title: string;
  category: string;
  icon: React.ElementType;
  description: string;
  backendEndpoint: string;
  recommendedOrientation: "portrait" | "landscape";
  refCodePrefix: string;
}

const DOCUMENT_REGISTRY: DocumentMeta[] = [
  {
    key: "member_profile",
    title: "Member 360 Dossier & Ministry Record",
    category: "Membership",
    icon: Users,
    description: "Full ecclesiastical profile, cell assignment, attendance velocity, and giving status.",
    backendEndpoint: "/members/1/profile/pdf/",
    recommendedOrientation: "portrait",
    refCodePrefix: "MEM-360",
  },
  {
    key: "event_attendance",
    title: "Event Registration & Attendance Roll",
    category: "Events",
    icon: Calendar,
    description: "Official check-in rosters, registration tallies, and check-in time verification.",
    backendEndpoint: "/events/1/attendance/pdf/",
    recommendedOrientation: "portrait",
    refCodePrefix: "EVT-ATT",
  },
  {
    key: "event_schedule",
    title: "Event Schedule & Session Timetable",
    category: "Events",
    icon: Clock,
    description: "Multi-day session timetable, speaker assignments, room allocations, and hours.",
    backendEndpoint: "/events/1/schedule/pdf/",
    recommendedOrientation: "landscape",
    refCodePrefix: "EVT-SCH",
  },
  {
    key: "event_demographics",
    title: "Event Demographics & Audience Intelligence",
    category: "Analytics",
    icon: BarChart3,
    description: "Gender breakdown, member category percentages, and residential distribution graphs.",
    backendEndpoint: "/events/1/analytics/pdf/",
    recommendedOrientation: "portrait",
    refCodePrefix: "EVT-ANA",
  },
  {
    key: "meeting_minutes",
    title: "Official Meeting Minutes & Attendance",
    category: "Governance",
    icon: FileText,
    description: "Official record of secretarial minutes, attendee roll call, and board resolutions.",
    backendEndpoint: "/meetings/1/minutes/pdf/",
    recommendedOrientation: "portrait",
    refCodePrefix: "MTG-MIN",
  },
  {
    key: "assimilation_summary",
    title: "Assimilation & Follow-up Pipeline Summary",
    category: "Assimilation",
    icon: Sparkles,
    description: "New converts, baptismal candidates, follow-up progress, and integration KPIs.",
    backendEndpoint: "/assimilation/reports/pdf/",
    recommendedOrientation: "portrait",
    refCodePrefix: "ASM-REP",
  },
];

export function DocumentStudioView() {
  const { branding } = useBranding();

  // Selection & Orientation State
  const [selectedDocKey, setSelectedDocKey] = useState<DocumentTypeKey>("event_attendance");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");

  // Header Design Customization State
  const [styleVariant, setStyleVariant] = useState<"executive" | "classic" | "minimal">("executive");
  const [classification, setClassification] = useState<string>("OFFICIAL INSTITUTIONAL RECORD");
  const [showLogo, setShowLogo] = useState<boolean>(true);
  const [showTagline, setShowTagline] = useState<boolean>(true);
  const [showContacts, setShowContacts] = useState<boolean>(true);
  const [showSubbar, setShowSubbar] = useState<boolean>(true);

  // Download / Testing State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    status: "idle" | "success" | "error";
    bytes?: number;
    filename?: string;
    message?: string;
  }>({ status: "idle" });

  const activeDoc = DOCUMENT_REGISTRY.find((d) => d.key === selectedDocKey) || DOCUMENT_REGISTRY[0];

  // Test real PDF generation via backend
  const handleTestBackendPdf = async (targetOrientation: "portrait" | "landscape" = orientation) => {
    try {
      setIsGenerating(true);
      setTestResult({ status: "idle" });

      const res = await fetchPdfBlob(activeDoc.backendEndpoint, targetOrientation, false);
      setTestResult({
        status: "success",
        bytes: res.blob.size,
        filename: res.filename,
        message: `Generated ${targetOrientation.toUpperCase()} PDF successfully (${(res.blob.size / 1024).toFixed(1)} KB).`,
      });
      toast.success(`PDF rendered successfully in ${targetOrientation} mode!`);
    } catch (err: any) {
      setTestResult({
        status: "error",
        message: err?.message || "Failed to generate PDF from Django backend.",
      });
      toast.error(err?.message || "PDF generation test failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadActiveDoc = async () => {
    try {
      setIsGenerating(true);
      await downloadPdf(
        activeDoc.backendEndpoint,
        `${activeDoc.key}_${orientation}.pdf`,
        orientation
      );
      toast.success(`Downloaded ${activeDoc.title} (${orientation})`);
    } catch (err: any) {
      toast.error(err?.message || "Download failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero */}
      <div className="rounded-2xl border border-border/60 bg-gradient-to-r from-card to-secondary/30 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="outline" className="text-[11px] font-bold text-primary border-primary/20 bg-primary/5">
              <Building className="h-3 w-3 mr-1" />
              Document Studio & Layout Inspector
            </Badge>
            <Badge variant="secondary" className="text-[11px] font-medium">
              WeasyPrint 70 • Live Preview
            </Badge>
          </div>
          <h2 className="text-xl font-bold font-display text-foreground">
            Uniform Institutional Header & Document Previewer
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-2xl">
            Design and inspect the standardized institutional masthead across all official church documents.
            Toggle between <strong>Portrait (A4)</strong> and <strong>Landscape (A4)</strong> to verify real-world alignment and layout balance.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleTestBackendPdf(orientation)}
            disabled={isGenerating}
            className="rounded-xl text-xs gap-1.5 font-medium hover:bg-muted"
          >
            {isGenerating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <FileCheck className="h-3.5 w-3.5 text-primary" />
            )}
            Test Backend Render
          </Button>
          <Button
            size="sm"
            onClick={handleDownloadActiveDoc}
            disabled={isGenerating}
            className="rounded-xl text-xs gap-1.5 font-bold bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            {isGenerating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            Export PDF ({orientation === "portrait" ? "Portrait" : "Landscape"})
          </Button>
        </div>
      </div>

      {/* Backend Engine Verification Alert (if test was run) */}
      {testResult.status !== "idle" && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
            testResult.status === "success"
              ? "bg-emerald-50/70 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-300"
              : "bg-rose-50/70 border-rose-200 text-rose-800 dark:bg-rose-950/30 dark:border-rose-800 dark:text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2 font-medium">
            {testResult.status === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            ) : (
              <Shield className="h-4 w-4 text-rose-600 shrink-0" />
            )}
            <span>{testResult.message}</span>
            {testResult.filename && (
              <span className="font-mono text-[11px] opacity-80">({testResult.filename})</span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTestResult({ status: "idle" })}
            className="h-6 text-[10px] px-2"
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Main Studio Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Document & Header Controls (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Orientation Selector Card */}
          <Card className="rounded-2xl border-border/60 shadow-xs">
            <CardHeader className="p-4 pb-3">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <RotateCw className="h-3.5 w-3.5 text-primary" />
                Sheet Orientation
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOrientation("portrait")}
                  className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                    orientation === "portrait"
                      ? "border-primary bg-primary/5 text-primary ring-2 ring-primary/20"
                      : "border-border/60 hover:bg-muted/50 text-foreground"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">Portrait</span>
                    <div className="h-5 w-3.5 border-2 border-current rounded-xs shrink-0" />
                  </div>
                  <span className="text-[10.5px] text-muted-foreground">
                    A4: 210 × 297 mm
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setOrientation("landscape")}
                  className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                    orientation === "landscape"
                      ? "border-primary bg-primary/5 text-primary ring-2 ring-primary/20"
                      : "border-border/60 hover:bg-muted/50 text-foreground"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">Landscape</span>
                    <div className="h-3.5 w-5 border-2 border-current rounded-xs shrink-0" />
                  </div>
                  <span className="text-[10.5px] text-muted-foreground">
                    A4: 297 × 210 mm
                  </span>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Document Picker Card */}
          <Card className="rounded-2xl border-border/60 shadow-xs">
            <CardHeader className="p-4 pb-3">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-primary" />
                Select Document to Inspect ({DOCUMENT_REGISTRY.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2">
              {DOCUMENT_REGISTRY.map((doc) => {
                const Icon = doc.icon;
                const isSelected = doc.key === selectedDocKey;
                return (
                  <button
                    key={doc.key}
                    type="button"
                    onClick={() => {
                      setSelectedDocKey(doc.key);
                      setOrientation(doc.recommendedOrientation);
                    }}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary/30"
                        : "border-border/50 hover:bg-muted/40 text-muted-foreground"
                    }`}
                  >
                    <div
                      className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? "bg-primary text-white" : "bg-muted text-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold truncate ${isSelected ? "text-primary" : "text-foreground"}`}>
                          {doc.title}
                        </span>
                        <Badge variant="outline" className="text-[9px] px-1 py-0 uppercase">
                          {doc.recommendedOrientation}
                        </Badge>
                      </div>
                      <p className="text-[10.5px] text-muted-foreground line-clamp-1 mt-0.5">
                        {doc.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          {/* Header Design Elements Card */}
          <Card className="rounded-2xl border-border/60 shadow-xs">
            <CardHeader className="p-4 pb-3">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Sliders className="h-3.5 w-3.5 text-primary" />
                Header Design Options
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3.5">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Header Masthead Style</Label>
                <Select
                  value={styleVariant}
                  onValueChange={(val: any) => setStyleVariant(val)}
                >
                  <SelectTrigger className="h-8 rounded-lg text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="executive">Executive Modern (Split Logo & Contacts)</SelectItem>
                    <SelectItem value="classic">Classic Centered (Ceremonial)</SelectItem>
                    <SelectItem value="minimal">Minimal Compact</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Classification Level</Label>
                <Select
                  value={classification}
                  onValueChange={(val) => setClassification(val)}
                >
                  <SelectTrigger className="h-8 rounded-lg text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OFFICIAL INSTITUTIONAL RECORD">OFFICIAL INSTITUTIONAL RECORD</SelectItem>
                    <SelectItem value="CONFIDENTIAL • PASTORAL CARE">CONFIDENTIAL • PASTORAL CARE</SelectItem>
                    <SelectItem value="BOARD GOVERNANCE DOCUMENT">BOARD GOVERNANCE DOCUMENT</SelectItem>
                    <SelectItem value="PUBLIC REGISTRATION ROLL">PUBLIC REGISTRATION ROLL</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border-t pt-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">Show Institutional Logo</span>
                  <Switch checked={showLogo} onCheckedChange={setShowLogo} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">Show Tagline / Motto</span>
                  <Switch checked={showTagline} onCheckedChange={setShowTagline} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">Show Official Contacts</span>
                  <Switch checked={showContacts} onCheckedChange={setShowContacts} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">Show Divider Sub-bar</span>
                  <Switch checked={showSubbar} onCheckedChange={setShowSubbar} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Visual Sheet Previewer (8 Cols) */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold text-foreground">
                Document Sheet Preview: <span className="text-primary">{activeDoc.title}</span>
              </span>
            </div>
            <div className="text-[11px] text-muted-foreground flex items-center gap-2">
              <span className="capitalize font-semibold text-foreground">{orientation} Sheet</span>
              <span>•</span>
              <span>A4 Dimensions</span>
            </div>
          </div>

          {/* The Physical Paper Container */}
          <div className="w-full overflow-x-auto p-4 md:p-6 bg-slate-900/5 dark:bg-slate-950/60 rounded-3xl border border-border/50 flex justify-center shadow-inner">
            <div
              className={`bg-white text-slate-900 shadow-2xl rounded-sm transition-all duration-300 p-6 md:p-8 flex flex-col justify-between border border-slate-200/90 ${
                orientation === "portrait"
                  ? "w-full max-w-[620px] min-h-[840px]"
                  : "w-full max-w-[880px] min-h-[580px]"
              }`}
              style={{
                aspectRatio: orientation === "portrait" ? "210 / 297" : "297 / 210",
              }}
            >
              {/* Header Zone */}
              <div>
                <DocumentUniformHeader
                  orientation={orientation}
                  title={activeDoc.title}
                  subtitle={activeDoc.description}
                  refCode={`${activeDoc.refCodePrefix}-${new Date().getFullYear()}-001`}
                  classification={classification}
                  styleVariant={styleVariant}
                  showLogo={showLogo}
                  showTagline={showTagline}
                  showContacts={showContacts}
                  showSubbar={showSubbar}
                />

                {/* Simulated Document Body Content based on active document */}
                <div className="mt-4 space-y-4 text-slate-700">
                  {/* KPI Bar */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
                      <div className="text-lg font-black text-slate-900">142</div>
                      <div className="text-[9.5px] uppercase font-bold text-slate-400 tracking-wider">
                        Registered Total
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
                      <div className="text-lg font-black text-emerald-600">118</div>
                      <div className="text-[9.5px] uppercase font-bold text-slate-400 tracking-wider">
                        Checked In
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
                      <div className="text-lg font-black text-primary">83.1%</div>
                      <div className="text-[9.5px] uppercase font-bold text-slate-400 tracking-wider">
                        Attendance Rate
                      </div>
                    </div>
                  </div>

                  {/* Sample Document Table */}
                  <div className="rounded-lg border border-slate-200 overflow-hidden">
                    <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <span>Roster Entry &amp; Classification</span>
                      <span>Verified Status</span>
                    </div>
                    <table className="w-full text-[10.5px] text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 font-semibold text-[10px]">
                          <th className="p-2">#</th>
                          <th className="p-2">Full Name</th>
                          <th className="p-2">Phone / Contact</th>
                          <th className="p-2">Category</th>
                          <th className="p-2 text-right">Time / Check-in</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr>
                          <td className="p-2 text-slate-400">01</td>
                          <td className="p-2 font-bold text-slate-800">Pastor David Karanja</td>
                          <td className="p-2 text-slate-500">+254 712 345 678</td>
                          <td className="p-2">Ordained Minister</td>
                          <td className="p-2 text-right">
                            <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-emerald-100 text-emerald-800">
                              08:45 AM
                            </span>
                          </td>
                        </tr>
                        <tr className="bg-slate-50/30">
                          <td className="p-2 text-slate-400">02</td>
                          <td className="p-2 font-bold text-slate-800">Grace Wambui Mwangi</td>
                          <td className="p-2 text-slate-500">+254 722 987 654</td>
                          <td className="p-2">Worship Ministry</td>
                          <td className="p-2 text-right">
                            <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-emerald-100 text-emerald-800">
                              09:02 AM
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2 text-slate-400">03</td>
                          <td className="p-2 font-bold text-slate-800">Samuel Otieno Okello</td>
                          <td className="p-2 text-slate-500">+254 733 112 233</td>
                          <td className="p-2">Cell Leader</td>
                          <td className="p-2 text-right">
                            <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-emerald-100 text-emerald-800">
                              09:14 AM
                            </span>
                          </td>
                        </tr>
                        <tr className="bg-slate-50/30">
                          <td className="p-2 text-slate-400">04</td>
                          <td className="p-2 font-bold text-slate-800">Mercy Chebet Korir</td>
                          <td className="p-2 text-slate-500">+254 701 445 566</td>
                          <td className="p-2">General Assembly</td>
                          <td className="p-2 text-right">
                            <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-amber-100 text-amber-800">
                              Registered (Absent)
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Resolutions / Notes Excerpt */}
                  <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 text-[10.5px] leading-relaxed">
                    <strong className="text-slate-800 font-semibold block mb-1">
                      Administrative Certification:
                    </strong>
                    This document represents an authenticated administrative record extracted from the{" "}
                    <strong>{branding.name}</strong> digital management system. Generated with high cryptographic integrity and validated against active governance logs.
                  </div>
                </div>
              </div>

              {/* Running Footer matching @page footer */}
              <div className="pt-4 mt-6 border-t border-slate-200 flex items-center justify-between text-[9px] text-slate-400 font-medium">
                <span>{branding.short_name} • Official Institutional Record</span>
                <span>Page 1 of 1</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
