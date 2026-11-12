import React, { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  Trash2,
  MoreVertical,
  Eye,
  FileDown,
  ShieldAlert,
  Loader2,
  Phone,
  Mail,
  MapPin,
  Heart,
  X,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { apiCall, ApiError } from "@/api/client";
import { downloadPdf } from "@/api/pdf";
import { getInitials } from "../event-utils";
import type { EventRegistrationItem } from "../types";

interface EventRegistrationsTabProps {
  eventId: number;
}

export function EventRegistrationsTab({ eventId }: EventRegistrationsTabProps) {
  const [registrations, setRegistrations] = useState<EventRegistrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const handleDownloadRegistrationsPdf = async () => {
    try {
      setDownloadingPdf(true);
      await downloadPdf(`/events/${eventId}/registrations/pdf/`, `event_registrations_${eventId}.pdf`);
      toast.success("Registrations PDF downloaded successfully");
    } catch (err: any) {
      toast.error(err?.message || "Failed to download registrations report");
    } finally {
      setDownloadingPdf(false);
    }
  };

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [checkedInFilter, setCheckedInFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [genderFilter, setGenderFilter] = useState<string>("all");

  // Register Modal state
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [registerStep, setRegisterStep] = useState<"form" | "token">("form");
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [createdAttendeeName, setCreatedAttendeeName] = useState<string>("");
  const [copiedToken, setCopiedToken] = useState(false);
  const [submittingReg, setSubmittingReg] = useState(false);

  // Detail offcanvas state
  const [offcanvasRegId, setOffcanvasRegId] = useState<number | null>(null);
  const [offcanvasDetail, setOffcanvasDetail] = useState<EventRegistrationItem | null>(null);
  const [loadingOffcanvas, setLoadingOffcanvas] = useState(false);

  // Delete dialog state
  const [regToDelete, setRegToDelete] = useState<EventRegistrationItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Form data for new registration
  const [regForm, setRegForm] = useState({
    names: "",
    gender: "Female",
    phone_no: "",
    residence: "",
    category: "General Member",
    travelling_from: "Nairobi",
    email: "",
    sponsorship: "Self",
    prayer: "",
    special_needs: "",
    guardian_telno: "",
    serve: false,
    attendees: "1",
  });

  // Debounce search input by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch registrations
  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    setPermissionDenied(false);
    try {
      const qp = new URLSearchParams();
      if (debouncedSearch.trim()) qp.set("q", debouncedSearch.trim());
      if (checkedInFilter !== "all") qp.set("is_checked_in", checkedInFilter === "checked_in" ? "true" : "false");
      if (categoryFilter !== "all") qp.set("category", categoryFilter);
      if (genderFilter !== "all") qp.set("gender", genderFilter);

      const res = await apiCall<{ results: EventRegistrationItem[]; count: number } | EventRegistrationItem[]>(
        `/events/${eventId}/registrations/?${qp.toString()}`
      );

      if (Array.isArray(res)) {
        setRegistrations(res);
        setTotalCount(res.length);
      } else {
        setRegistrations(res.results || []);
        setTotalCount(res.count || 0);
      }
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 403) {
        setPermissionDenied(true);
      } else {
        toast.error((err as Error)?.message || "Failed to load registrations.");
      }
    } finally {
      setLoading(false);
    }
  }, [eventId, debouncedSearch, checkedInFilter, categoryFilter, genderFilter]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  // Open detail offcanvas
  const openOffcanvas = async (regId: number) => {
    setOffcanvasRegId(regId);
    setLoadingOffcanvas(true);
    try {
      const detail = await apiCall<EventRegistrationItem>(`/events/${eventId}/registrations/${regId}/`);
      setOffcanvasDetail(detail);
    } catch (err: unknown) {
      toast.error((err as Error)?.message || "Failed to load attendee details.");
      setOffcanvasRegId(null);
    } finally {
      setLoadingOffcanvas(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.names.trim() || !regForm.phone_no.trim() || !regForm.residence.trim()) {
      toast.error("Please fill in all required fields (Name, Phone, Residence).");
      return;
    }

    setSubmittingReg(true);
    try {
      const res = await apiCall<EventRegistrationItem>(`/events/${eventId}/registrations/`, {
        method: "POST",
        body: {
          ...regForm,
          names: regForm.names.trim(),
          phone_no: regForm.phone_no.trim(),
          residence: regForm.residence.trim(),
          travelling_from: regForm.travelling_from.trim() || "Nairobi",
          email: regForm.email.trim() || null,
          prayer: regForm.prayer.trim() || null,
          special_needs: regForm.special_needs.trim() || null,
          guardian_telno: regForm.guardian_telno.trim() || null,
        },
      });

      setCreatedToken(res.qr_token || null);
      setCreatedAttendeeName(res.names);
      setRegisterStep("token");
      fetchRegistrations();
    } catch (err: unknown) {
      toast.error((err as Error)?.message || "Failed to register attendee.");
    } finally {
      setSubmittingReg(false);
    }
  };

  const handleDeleteRegistration = async () => {
    if (!regToDelete) return;
    if (regToDelete.is_checked_in) {
      toast.error("Cannot delete an attendee who is checked in. First undo their check-in from the Check-In desk.");
      setRegToDelete(null);
      return;
    }

    setDeleting(true);
    try {
      await apiCall(`/events/${eventId}/registrations/${regToDelete.id}/`, {
        method: "DELETE",
      });
      toast.success(`Registration for ${regToDelete.names} removed.`);
      setRegToDelete(null);
      if (offcanvasRegId === regToDelete.id) {
        setOffcanvasRegId(null);
      }
      fetchRegistrations();
    } catch (err: unknown) {
      toast.error((err as Error)?.message || "Failed to delete registration.");
    } finally {
      setDeleting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(true);
    toast.success("QR Token copied to clipboard.");
    setTimeout(() => setCopiedToken(false), 2000);
  };

  // Permission Denied Card
  if (permissionDenied) {
    return (
      <Card className="rounded-2xl border-border p-12 text-center max-w-lg mx-auto bg-card shadow-xs">
        <CardContent className="space-y-3 p-0">
          <div className="p-3 bg-amber-500/10 text-amber-600 rounded-2xl w-fit mx-auto">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h4 className="text-base font-bold font-display text-foreground">
            Restricted Attendance Access
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            You don&apos;t have permission to view registrations. Contact an administrator or leadership desk to request the <code className="text-foreground font-mono">view_event_registrations</code> privilege.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Active filters count
  const activeChips = [
    debouncedSearch ? { label: `Search: "${debouncedSearch}"`, clear: () => setSearchQuery("") } : null,
    checkedInFilter !== "all" ? { label: checkedInFilter === "checked_in" ? "Status: Checked In" : "Status: Not Checked In", clear: () => setCheckedInFilter("all") } : null,
    categoryFilter !== "all" ? { label: `Category: ${categoryFilter}`, clear: () => setCategoryFilter("all") } : null,
    genderFilter !== "all" ? { label: `Gender: ${genderFilter}`, clear: () => setGenderFilter("all") } : null,
  ].filter(Boolean) as { label: string; clear: () => void }[];

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Toolbar */}
      <div className="bg-card/70 backdrop-blur-md p-4 rounded-2xl border border-border shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search */}
          <div className="relative min-w-[240px] flex-1 max-w-md">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, phone, residence..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 rounded-xl text-xs bg-background"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Checked-in status pills */}
            <div className="flex items-center border border-border rounded-xl p-0.5 bg-background text-xs">
              <button
                type="button"
                onClick={() => setCheckedInFilter("all")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  checkedInFilter === "all" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setCheckedInFilter("checked_in")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  checkedInFilter === "checked_in" ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Checked In
              </button>
              <button
                type="button"
                onClick={() => setCheckedInFilter("pending")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  checkedInFilter === "pending" ? "bg-amber-500/15 text-amber-700 dark:text-amber-400" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Not Checked In
              </button>
            </div>

            {/* Gender Select */}
            <Select value={genderFilter} onValueChange={setGenderFilter}>
              <SelectTrigger className="w-28 h-9 rounded-xl text-xs bg-background">
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all" className="text-xs">All Genders</SelectItem>
                <SelectItem value="Female" className="text-xs">Female</SelectItem>
                <SelectItem value="Male" className="text-xs">Male</SelectItem>
              </SelectContent>
            </Select>

            {/* Export Registrations PDF Button */}
            <Button
              variant="outline"
              size="sm"
              disabled={downloadingPdf}
              onClick={handleDownloadRegistrationsPdf}
              className="rounded-xl h-9 text-xs gap-1.5 hover:bg-muted font-medium transition-colors"
            >
              {downloadingPdf ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <FileDown className="h-3.5 w-3.5 text-primary" />
              )}
              Export PDF
            </Button>

            {/* Register Attendee CTA */}
            <Button
              onClick={() => {
                setRegisterStep("form");
                setCreatedToken(null);
                setRegisterModalOpen(true);
              }}
              className="rounded-xl bg-[var(--brand-primary)] text-white hover:opacity-90 h-9 text-xs font-semibold gap-1.5"
            >
              <UserPlus className="h-4 w-4" /> Register Attendee
            </Button>
          </div>
        </div>

        {/* Active Filter Chips */}
        {activeChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/50 text-xs">
            <span className="text-muted-foreground font-semibold">Active filters:</span>
            {activeChips.map((chip, idx) => (
              <Badge
                key={idx}
                variant="secondary"
                className="rounded-lg gap-1.5 font-medium pl-2.5 pr-1.5 py-0.5 text-xs bg-muted hover:bg-muted"
              >
                {chip.label}
                <button type="button" onClick={chip.clear} className="text-muted-foreground hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setCheckedInFilter("all");
                setCategoryFilter("all");
                setGenderFilter("all");
              }}
              className="text-xs text-[var(--brand-primary)] hover:underline font-semibold ml-1"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Registrations Table Card */}
      <Card className="rounded-2xl border-border overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">Attendee</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Gender</th>
                <th className="py-3 px-4 text-center">Serving</th>
                <th className="py-3 px-4">Checked In</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-3.5 px-4"><Skeleton className="h-4 w-6 mx-auto rounded" /></td>
                    <td className="py-3.5 px-4"><Skeleton className="h-4 w-36 rounded" /></td>
                    <td className="py-3.5 px-4"><Skeleton className="h-4 w-24 rounded" /></td>
                    <td className="py-3.5 px-4"><Skeleton className="h-4 w-20 rounded" /></td>
                    <td className="py-3.5 px-4"><Skeleton className="h-4 w-14 rounded" /></td>
                    <td className="py-3.5 px-4"><Skeleton className="h-4 w-16 mx-auto rounded" /></td>
                    <td className="py-3.5 px-4"><Skeleton className="h-4 w-20 rounded" /></td>
                    <td className="py-3.5 px-4"><Skeleton className="h-4 w-8 ml-auto rounded" /></td>
                  </tr>
                ))
              ) : registrations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    <div className="max-w-xs mx-auto space-y-2">
                      <Users className="h-8 w-8 text-muted-foreground/50 mx-auto" />
                      <p className="font-semibold text-foreground">No registrations found</p>
                      <p className="text-xs">
                        {activeChips.length > 0
                          ? "Try adjusting search terms or filter selections."
                          : "Register the first attendee to get started."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                registrations.map((reg, idx) => (
                  <tr key={reg.id} className="hover:bg-muted/20 transition-colors">
                    {/* Index */}
                    <td className="py-3 px-4 text-center font-mono text-muted-foreground text-[11px]">
                      {idx + 1}
                    </td>

                    {/* Attendee Info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] font-bold text-[10px] flex items-center justify-center shrink-0">
                          {getInitials(reg.names)}
                        </div>
                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => openOffcanvas(reg.id)}
                            className="font-bold text-foreground hover:text-[var(--brand-primary)] transition-colors truncate block text-left"
                          >
                            {reg.names}
                          </button>
                          {reg.email && (
                            <span className="text-[11px] text-muted-foreground truncate block">
                              {reg.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="py-3 px-4">
                      <a
                        href={`tel:${reg.phone_no}`}
                        className="font-mono text-foreground hover:text-[var(--brand-primary)] hover:underline flex items-center gap-1"
                      >
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        {reg.phone_no}
                      </a>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="text-[10px] font-medium bg-muted/40">
                        {reg.category}
                      </Badge>
                    </td>

                    {/* Gender */}
                    <td className="py-3 px-4 capitalize text-muted-foreground">
                      {reg.gender}
                    </td>

                    {/* Serving */}
                    <td className="py-3 px-4 text-center">
                      {reg.serve ? (
                        <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 font-bold">
                          Serving
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-[11px]">—</span>
                      )}
                    </td>

                    {/* Checked In */}
                    <td className="py-3 px-4">
                      {reg.is_checked_in ? (
                        <div className="space-y-0.5">
                          <Badge variant="outline" className="text-[10px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 font-bold flex items-center gap-1 w-fit">
                            <CheckCircle2 className="h-3 w-3" /> Checked In
                          </Badge>
                          {reg.check_in_time && (
                            <span className="text-[10px] text-muted-foreground block">
                              {formatDistanceToNow(new Date(reg.check_in_time), { addSuffix: true })}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>

                    {/* Actions Menu */}
                    <td className="py-3 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg">
                            <MoreVertical className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl text-xs w-44">
                          <DropdownMenuItem onClick={() => openOffcanvas(reg.id)} className="gap-2">
                            <Eye className="h-3.5 w-3.5" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setRegToDelete(reg)}
                            className="gap-2 text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete Registration
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Register Attendee Modal (Two-Step: Form -> Token display) */}
      <Dialog open={registerModalOpen} onOpenChange={setRegisterModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl">
          {registerStep === "form" ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg font-bold font-display">
                  Register Program Attendee
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Fill in attendee contact and logistical requirements. A secure check-in QR token is generated automatically.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleRegisterSubmit} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Full Name <span className="text-destructive">*</span></Label>
                  <Input
                    placeholder="e.g., Sarah Wambui"
                    value={regForm.names}
                    onChange={(e) => setRegForm({ ...regForm, names: e.target.value })}
                    className="rounded-xl text-xs"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Phone Number <span className="text-destructive">*</span></Label>
                    <Input
                      placeholder="e.g., 0712345678"
                      value={regForm.phone_no}
                      onChange={(e) => setRegForm({ ...regForm, phone_no: e.target.value })}
                      className="rounded-xl text-xs font-mono"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Gender <span className="text-destructive">*</span></Label>
                    <Select value={regForm.gender} onValueChange={(val) => setRegForm({ ...regForm, gender: val })}>
                      <SelectTrigger className="rounded-xl text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="Female" className="text-xs">Female</SelectItem>
                        <SelectItem value="Male" className="text-xs">Male</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Residence / Estate <span className="text-destructive">*</span></Label>
                    <Input
                      placeholder="e.g., Rongai"
                      value={regForm.residence}
                      onChange={(e) => setRegForm({ ...regForm, residence: e.target.value })}
                      className="rounded-xl text-xs"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Category <span className="text-destructive">*</span></Label>
                    <Input
                      placeholder="e.g., Youth / General Member"
                      value={regForm.category}
                      onChange={(e) => setRegForm({ ...regForm, category: e.target.value })}
                      className="rounded-xl text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Travelling From</Label>
                    <Input
                      placeholder="e.g., Nairobi / Nakuru"
                      value={regForm.travelling_from}
                      onChange={(e) => setRegForm({ ...regForm, travelling_from: e.target.value })}
                      className="rounded-xl text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Email Address (Optional)</Label>
                    <Input
                      type="email"
                      placeholder="e.g., sarah@example.com"
                      value={regForm.email}
                      onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                      className="rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="serveCheckbox"
                    checked={regForm.serve}
                    onChange={(e) => setRegForm({ ...regForm, serve: e.target.checked })}
                    className="h-4 w-4 rounded border-border text-[var(--brand-primary)]"
                  />
                  <Label htmlFor="serveCheckbox" className="text-xs font-medium cursor-pointer">
                    Available to serve as volunteer / usher during program
                  </Label>
                </div>

                <DialogFooter className="pt-3 gap-2">
                  <Button type="button" variant="outline" onClick={() => setRegisterModalOpen(false)} className="rounded-xl text-xs">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submittingReg} className="rounded-xl bg-[var(--brand-primary)] text-white text-xs font-semibold">
                    {submittingReg && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                    Confirm Registration
                  </Button>
                </DialogFooter>
              </form>
            </>
          ) : (
            /* Step 2: QR Token Display */
            <div className="space-y-4 pt-2 text-center">
              <div className="h-12 w-12 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold font-display text-foreground">
                  Registration Confirmed!
                </h4>
                <p className="text-xs text-muted-foreground">
                  {createdAttendeeName} is now registered. Below is their unique check-in security token:
                </p>
              </div>

              {createdToken && (
                <div className="p-3 bg-muted rounded-xl border border-border flex items-center justify-between gap-2 max-w-sm mx-auto">
                  <span className="font-mono text-xs font-bold text-foreground break-all select-all">
                    {createdToken}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(createdToken)}
                    className="h-8 px-2 text-xs font-semibold gap-1 shrink-0"
                  >
                    {copiedToken ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedToken ? "Copied" : "Copy"}
                  </Button>
                </div>
              )}

              <p className="text-[11px] text-muted-foreground italic">
                QR image rendering and email ticket dispatch coming soon.
              </p>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  onClick={() => setRegisterModalOpen(false)}
                  className="rounded-xl bg-[var(--brand-primary)] text-white text-xs font-semibold w-full"
                >
                  Done
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Attendee Detail Offcanvas Sheet */}
      <Sheet open={Boolean(offcanvasRegId)} onOpenChange={(op) => !op && setOffcanvasRegId(null)}>
        <SheetContent className="w-full sm:max-w-md p-6 overflow-y-auto">
          {loadingOffcanvas || !offcanvasDetail ? (
            <div className="space-y-4 pt-8">
              <Skeleton className="h-12 w-12 rounded-full" />
              <Skeleton className="h-6 w-48 rounded" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
          ) : (
            <div className="space-y-6">
              <SheetHeader className="space-y-2 text-left">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] text-base font-extrabold flex items-center justify-center">
                    {getInitials(offcanvasDetail.names)}
                  </div>
                  <div>
                    <SheetTitle className="text-base font-bold font-display text-foreground">
                      {offcanvasDetail.names}
                    </SheetTitle>
                    <SheetDescription className="text-xs font-mono">
                      {offcanvasDetail.phone_no}
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              {/* Status Banner */}
              <div className="p-3 rounded-xl border border-border bg-muted/30 flex items-center justify-between text-xs">
                <span className="font-semibold text-muted-foreground">Attendance Status</span>
                {offcanvasDetail.is_checked_in ? (
                  <Badge variant="outline" className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 font-bold">
                    Checked In {offcanvasDetail.check_in_time && `(${formatDistanceToNow(new Date(offcanvasDetail.check_in_time), { addSuffix: true })})`}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20 font-bold">
                    Pending Check-In
                  </Badge>
                )}
              </div>

              {/* QR Token Box */}
              {offcanvasDetail.qr_token && (
                <div className="space-y-1.5 p-3 rounded-xl bg-muted/60 border border-border">
                  <span className="text-[11px] font-semibold text-muted-foreground block">
                    Security Check-in Token
                  </span>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-foreground break-all select-all">
                      {offcanvasDetail.qr_token}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(offcanvasDetail.qr_token!)}
                      className="h-7 px-2 text-xs"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Detail Breakdown */}
              <div className="space-y-3 text-xs divide-y divide-border/60">
                <div className="pt-2 flex justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-semibold">{offcanvasDetail.category}</span>
                </div>
                <div className="pt-2 flex justify-between">
                  <span className="text-muted-foreground">Gender</span>
                  <span className="font-semibold capitalize">{offcanvasDetail.gender}</span>
                </div>
                <div className="pt-2 flex justify-between">
                  <span className="text-muted-foreground">Residence</span>
                  <span className="font-semibold">{offcanvasDetail.residence}</span>
                </div>
                <div className="pt-2 flex justify-between">
                  <span className="text-muted-foreground">Travelling From</span>
                  <span className="font-semibold">{offcanvasDetail.travelling_from}</span>
                </div>
                <div className="pt-2 flex justify-between">
                  <span className="text-muted-foreground">Volunteer / Serving</span>
                  <span className="font-semibold">{offcanvasDetail.serve ? "Yes, Available" : "No"}</span>
                </div>
                {offcanvasDetail.email && (
                  <div className="pt-2 flex justify-between">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-semibold">{offcanvasDetail.email}</span>
                  </div>
                )}
                {offcanvasDetail.sponsorship && (
                  <div className="pt-2 flex justify-between">
                    <span className="text-muted-foreground">Sponsorship</span>
                    <span className="font-semibold capitalize">{offcanvasDetail.sponsorship}</span>
                  </div>
                )}
                {offcanvasDetail.special_needs && (
                  <div className="pt-2 space-y-1">
                    <span className="text-muted-foreground block">Special Needs / Assistance</span>
                    <p className="font-semibold text-foreground/90">{offcanvasDetail.special_needs}</p>
                  </div>
                )}
                {offcanvasDetail.prayer && (
                  <div className="pt-2 space-y-1">
                    <span className="text-muted-foreground block">Prayer Request</span>
                    <p className="font-semibold text-foreground/90 italic">&ldquo;{offcanvasDetail.prayer}&rdquo;</p>
                  </div>
                )}
              </div>

              {/* Sheet Footer */}
              <SheetFooter className="pt-6 border-t border-border flex flex-row justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOffcanvasRegId(null)}
                  className="rounded-xl text-xs flex-1"
                >
                  Close
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setRegToDelete(offcanvasDetail)}
                  className="rounded-xl text-xs flex-1"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                </Button>
              </SheetFooter>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={Boolean(regToDelete)} onOpenChange={(op) => !op && setRegToDelete(null)}>
        <AlertDialogContent className="rounded-2xl max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold font-display">
              Delete Attendee Registration?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs leading-relaxed">
              Are you sure you want to remove <span className="font-bold text-foreground">{regToDelete?.names}</span>?
              {regToDelete?.is_checked_in && (
                <span className="block mt-2 font-bold text-destructive">
                  Notice: This attendee is currently marked checked in. You must undo check-in before deleting.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRegistration}
              disabled={deleting || regToDelete?.is_checked_in}
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs font-semibold"
            >
              {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
