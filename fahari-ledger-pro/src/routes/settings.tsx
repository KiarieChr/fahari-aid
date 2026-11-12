import { createFileRoute } from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
import {
  Building,
  Palette,
  Shield,
  Landmark,
  Sparkles,
  Check,
  RefreshCw,
  Image,
  Eye,
  Phone,
  Mail,
  MapPin,
  Loader2,
  DollarSign,
  Undo2,
  Save,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { DocumentStudioView } from "@/components/documents/DocumentStudioView";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiCall } from "@/api/client";
import { useBranding, defaultBranding, type BrandingSettings } from "@/context/BrandingContext";
import { BrandingImageUploadField } from "@/components/settings/BrandingImageUploadField";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings & Administration — J.E.N Church ERP" },
      {
        name: "description",
        content: "Configure runtime church institution branding, financial periods, and system security governance.",
      },
    ],
  }),
  component: SettingsPage,
});

interface AdminBrandingResponse extends BrandingSettings {
  id?: number;
  updated_at?: string;
  updated_by?: string | null;
}

const presetPalettes = [
  {
    name: "Royal Sapphire & Warm Gold (Official)",
    primary: "#1e3a8a",
    accent: "#d97706",
    secondary: "#0f172a",
  },
  {
    name: "Cathedral Crimson & Deep Gold",
    primary: "#991b1b",
    accent: "#d97706",
    secondary: "#18181b",
  },
  {
    name: "Kingdom Emerald & Bronze",
    primary: "#065f46",
    accent: "#b45309",
    secondary: "#0f172a",
  },
  {
    name: "Imperial Violet & Amber",
    primary: "#4c1d95",
    accent: "#f59e0b",
    secondary: "#18181b",
  },
];

function SettingsPage() {
  const { branding: currentContextBranding, refetchBranding } = useBranding();

  // Form State
  const [formData, setFormData] = useState<BrandingSettings>(defaultBranding);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("branding");
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  // Financial dummy settings for Tab 2
  const [fiscalYear, setFiscalYear] = useState<string>("january");
  const [loanRate, setLoanRate] = useState<number>(13);
  const [savingsRate, setSavingsRate] = useState<number>(7);

  // Security dummy settings for Tab 3
  const [securitySettings, setSecuritySettings] = useState({
    twoFactor: true,
    auditLogging: true,
    smsNotifications: true,
    emailDigest: false,
  });

  // Fetch current administrative branding from Django backend
  const loadAdminBranding = async () => {
    setIsLoading(true);
    try {
      const res = await apiCall<AdminBrandingResponse>("/admin/branding/");
      if (res && res.name) {
        setFormData({
          name: res.name || defaultBranding.name,
          short_name: res.short_name || defaultBranding.short_name,
          tagline: res.tagline || defaultBranding.tagline,
          logo_url: res.logo_url || null,
          logo_dark_url: res.logo_dark_url || null,
          favicon_url: res.favicon_url || null,
          primary_color: res.primary_color || defaultBranding.primary_color,
          accent_color: res.accent_color || defaultBranding.accent_color,
          secondary_color: res.secondary_color || defaultBranding.secondary_color,
          currency_symbol: res.currency_symbol || defaultBranding.currency_symbol,
          official_email: res.official_email || null,
          official_phone: res.official_phone || null,
          physical_address: res.physical_address || null,
        });
        if (res.updated_at) {
          setLastSavedTime(new Date(res.updated_at).toLocaleString());
        }
      }
    } catch (_err) {
      // Fall back to context branding
      setFormData(currentContextBranding);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminBranding();
  }, []);

  const handleChange = (field: keyof BrandingSettings, value: string | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Submit Branding Updates to Backend
  const handleSaveBranding = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      const res = await apiCall<AdminBrandingResponse>("/admin/branding/", {
        method: "PATCH",
        body: {
          name: formData.name.trim(),
          short_name: formData.short_name.trim(),
          tagline: formData.tagline ? formData.tagline.trim() : null,
          logo_url: formData.logo_url ? formData.logo_url.trim() : null,
          logo_dark_url: formData.logo_dark_url ? formData.logo_dark_url.trim() : null,
          favicon_url: formData.favicon_url ? formData.favicon_url.trim() : null,
          primary_color: formData.primary_color.trim(),
          accent_color: formData.accent_color.trim(),
          secondary_color: formData.secondary_color.trim(),
          currency_symbol: formData.currency_symbol.trim(),
          official_email: formData.official_email ? formData.official_email.trim() : null,
          official_phone: formData.official_phone ? formData.official_phone.trim() : null,
          physical_address: formData.physical_address ? formData.physical_address.trim() : null,
        },
      });

      if (res) {
        toast.success("Church institution branding updated successfully!");
        setLastSavedTime(new Date().toLocaleString());
        // Trigger global runtime update across TopNavbar, AppSidebar, and document title
        await refetchBranding();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update branding settings.";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setFormData(defaultBranding);
    toast.info("Preset default branding restored in form. Click 'Save Changes' to persist.");
  };

  const handleApplyPalette = (p: typeof presetPalettes[0]) => {
    setFormData((prev) => ({
      ...prev,
      primary_color: p.primary,
      accent_color: p.accent,
      secondary_color: p.secondary,
    }));
    toast.success(`Applied ${p.name} palette`);
  };

  return (
    <div className="mx-auto w-full max-w-[1400px] animate-in fade-in duration-300 pb-12">
      {/* Page Header */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <PageHeader
          title="Settings & Administration"
          description="Configure church institution identity, runtime branding palette, financial base currency, and security governance."
          className="mb-0"
        />

        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className="h-9 px-3 text-xs font-semibold bg-primary/10 text-primary border-primary/20 flex items-center gap-1.5"
          >
            <Building className="h-3.5 w-3.5" />
            Active: <strong className="ml-0.5">{formData.short_name}</strong>
          </Badge>
          <Button
            onClick={() => handleSaveBranding()}
            disabled={isSaving || isLoading}
            className="h-9 px-4 rounded-xl bg-primary text-primary-foreground font-bold shadow-glow hover:bg-primary/90 flex items-center gap-2"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Tabs Layout */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="h-11 rounded-xl bg-secondary/50 p-1 border border-border/60">
          <TabsTrigger value="branding" className="rounded-lg text-xs font-bold gap-2 px-4">
            <Palette className="h-4 w-4" />
            Church Identity & Branding
          </TabsTrigger>
          <TabsTrigger value="documents" className="rounded-lg text-xs font-bold gap-2 px-4">
            <FileText className="h-4 w-4" />
            Document Studio &amp; Header
          </TabsTrigger>
          <TabsTrigger value="financial" className="rounded-lg text-xs font-bold gap-2 px-4">
            <Landmark className="h-4 w-4" />
            Financial & Accounting
          </TabsTrigger>
          <TabsTrigger value="security" className="rounded-lg text-xs font-bold gap-2 px-4">
            <Shield className="h-4 w-4" />
            Security & Governance
          </TabsTrigger>
        </TabsList>

        {/* ===================================================================== */}
        {/* TAB 1: CHURCH IDENTITY & BRANDING                                     */}
        {/* ===================================================================== */}
        <TabsContent value="branding" className="space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-56 rounded-2xl" />
                <Skeleton className="h-64 rounded-2xl" />
                <Skeleton className="h-56 rounded-2xl" />
              </div>
              <Skeleton className="h-96 rounded-2xl" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left 8 Columns: Form Fields */}
              <div className="lg:col-span-8 space-y-6">
                {/* Section 1: Institution Names & Tagline */}
                <Card className="rounded-2xl border-border/60 shadow-soft">
                  <CardHeader className="bg-secondary/15 pb-4 border-b border-border/40">
                    <CardTitle className="font-display text-base flex items-center gap-2 text-primary">
                      <Building className="h-4 w-4 text-gold" />
                      Institution Name & Identity
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Primary denomination or church ministry name reflected across the portal, login screen, and reports.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 grid gap-4">
                    <div className="grid gap-1.5">
                      <Label htmlFor="inst-name" className="text-xs font-bold uppercase tracking-wider">
                        Full Institution Name
                      </Label>
                      <Input
                        id="inst-name"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        placeholder="e.g., Jesus Enthroned Network"
                        className="h-10 rounded-xl border-border/60 font-semibold"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="grid gap-1.5">
                        <Label htmlFor="short-name" className="text-xs font-bold uppercase tracking-wider">
                          Short Name / Acronym
                        </Label>
                        <Input
                          id="short-name"
                          value={formData.short_name}
                          onChange={(e) => handleChange("short_name", e.target.value)}
                          placeholder="e.g., J.E.N"
                          className="h-10 rounded-xl border-border/60 font-bold"
                        />
                      </div>
                      <div className="grid sm:col-span-2 gap-1.5">
                        <Label htmlFor="tagline" className="text-xs font-bold uppercase tracking-wider">
                          Ministry Tagline / Vision
                        </Label>
                        <Input
                          id="tagline"
                          value={formData.tagline || ""}
                          onChange={(e) => handleChange("tagline", e.target.value)}
                          placeholder="e.g., Enthroning Christ in all Spheres"
                          className="h-10 rounded-xl border-border/60"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Section 2: Color Palette Customization */}
                <Card className="rounded-2xl border-border/60 shadow-soft">
                  <CardHeader className="bg-secondary/15 pb-4 border-b border-border/40 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="font-display text-base flex items-center gap-2 text-primary">
                        <Palette className="h-4 w-4 text-gold" />
                        Live Theme Color System
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Configured colors update the CSS custom properties dynamically across all pages without rebuilding.
                      </CardDescription>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleResetDefaults}
                      className="h-8 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <Undo2 className="h-3.5 w-3.5 mr-1" /> Defaults
                    </Button>
                  </CardHeader>

                  <CardContent className="pt-6 space-y-5">
                    {/* Color Inputs Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Primary Brand Color */}
                      <div className="rounded-xl border border-border/60 p-3.5 bg-secondary/10 space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-bold uppercase">Primary Color</Label>
                          <span
                            className="h-4 w-4 rounded-full border border-border shadow-sm shrink-0"
                            style={{ backgroundColor: formData.primary_color }}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={formData.primary_color}
                            onChange={(e) => handleChange("primary_color", e.target.value)}
                            className="h-9 w-10 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                          />
                          <Input
                            value={formData.primary_color}
                            onChange={(e) => handleChange("primary_color", e.target.value)}
                            className="h-9 rounded-lg font-mono text-xs uppercase"
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground block">
                          Main brand buttons, headers & icons
                        </span>
                      </div>

                      {/* Accent Gold Color */}
                      <div className="rounded-xl border border-border/60 p-3.5 bg-secondary/10 space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-bold uppercase">Accent Color</Label>
                          <span
                            className="h-4 w-4 rounded-full border border-border shadow-sm shrink-0"
                            style={{ backgroundColor: formData.accent_color }}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={formData.accent_color}
                            onChange={(e) => handleChange("accent_color", e.target.value)}
                            className="h-9 w-10 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                          />
                          <Input
                            value={formData.accent_color}
                            onChange={(e) => handleChange("accent_color", e.target.value)}
                            className="h-9 rounded-lg font-mono text-xs uppercase"
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground block">
                          Highlights, badges & progress indicators
                        </span>
                      </div>

                      {/* Secondary Color */}
                      <div className="rounded-xl border border-border/60 p-3.5 bg-secondary/10 space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-bold uppercase">Secondary Color</Label>
                          <span
                            className="h-4 w-4 rounded-full border border-border shadow-sm shrink-0"
                            style={{ backgroundColor: formData.secondary_color }}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={formData.secondary_color}
                            onChange={(e) => handleChange("secondary_color", e.target.value)}
                            className="h-9 w-10 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                          />
                          <Input
                            value={formData.secondary_color}
                            onChange={(e) => handleChange("secondary_color", e.target.value)}
                            className="h-9 rounded-lg font-mono text-xs uppercase"
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground block">
                          Sidebar, dark background & card trims
                        </span>
                      </div>
                    </div>

                    {/* Presets Selector */}
                    <div className="pt-2 border-t border-border/40">
                      <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                        Curated Cathedral Palettes
                      </Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {presetPalettes.map((p) => (
                          <button
                            key={p.name}
                            type="button"
                            onClick={() => handleApplyPalette(p)}
                            className="flex items-center justify-between p-2.5 rounded-xl border border-border/50 bg-secondary/20 hover:bg-secondary/40 text-left transition-all group"
                          >
                            <span className="text-xs font-semibold group-hover:text-primary transition-colors truncate max-w-[220px]">
                              {p.name}
                            </span>
                            <div className="flex items-center gap-1 shrink-0 ml-2">
                              <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: p.primary }} />
                              <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: p.accent }} />
                              <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: p.secondary }} />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Section 3: Logos & Digital Assets */}
                <Card className="rounded-2xl border-border/60 shadow-soft">
                  <CardHeader className="bg-secondary/15 pb-4 border-b border-border/40">
                    <CardTitle className="font-display text-base flex items-center gap-2 text-primary">
                      <Image className="h-4 w-4 text-gold" />
                      Logos & Digital Assets
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Provide public image URLs or CDN links for your church insignia, crest, or dark-mode icons.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 grid gap-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <BrandingImageUploadField
                        label="Primary Logo (Light Mode)"
                        description="Displayed on light sidebars, headers, and official documents."
                        assetType="logo"
                        value={formData.logo_url}
                        onChange={(url) => handleChange("logo_url", url)}
                        recommendedSize="PNG, SVG, or WebP. Transparent background recommended."
                      />
                      <BrandingImageUploadField
                        label="Dark Mode Logo"
                        description="Inverted or light contrast logo for dark interfaces."
                        assetType="logo_dark"
                        value={formData.logo_dark_url}
                        onChange={(url) => handleChange("logo_dark_url", url)}
                        recommendedSize="White or bright monochrome insignia recommended."
                      />
                    </div>

                    <BrandingImageUploadField
                      label="Browser Tab Favicon"
                      description="Shown in browser tabs, shortcuts, and mobile bookmarks."
                      assetType="favicon"
                      value={formData.favicon_url}
                      onChange={(url) => handleChange("favicon_url", url)}
                      recommendedSize="ICO, PNG, or SVG. Recommended: 32x32px or 64x64px."
                    />
                  </CardContent>
                </Card>

                {/* Section 4: Contact & Headquarters Details */}
                <Card className="rounded-2xl border-border/60 shadow-soft">
                  <CardHeader className="bg-secondary/15 pb-4 border-b border-border/40">
                    <CardTitle className="font-display text-base flex items-center gap-2 text-primary">
                      <MapPin className="h-4 w-4 text-gold" />
                      Official Church Contact & Secretariat
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Official ministry contact info rendered on member receipts, offering statements, and pastoral letters.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 grid gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="grid gap-1.5">
                        <Label htmlFor="official-email" className="text-xs font-bold uppercase tracking-wider">
                          Official Email Address
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="official-email"
                            type="email"
                            value={formData.official_email || ""}
                            onChange={(e) => handleChange("official_email", e.target.value)}
                            placeholder="admin@jenchurch.org"
                            className="pl-9 h-10 rounded-xl border-border/60"
                          />
                        </div>
                      </div>
                      <div className="grid gap-1.5">
                        <Label htmlFor="official-phone" className="text-xs font-bold uppercase tracking-wider">
                          Official Telephone
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="official-phone"
                            value={formData.official_phone || ""}
                            onChange={(e) => handleChange("official_phone", e.target.value)}
                            placeholder="+254 700 000 000"
                            className="pl-9 h-10 rounded-xl border-border/60"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-1.5">
                      <Label htmlFor="physical-address" className="text-xs font-bold uppercase tracking-wider">
                        Cathedral / Physical Address
                      </Label>
                      <Input
                        id="physical-address"
                        value={formData.physical_address || ""}
                        onChange={(e) => handleChange("physical_address", e.target.value)}
                        placeholder="e.g., Kilimani Sanctuary, Nairobi, Kenya"
                        className="h-10 rounded-xl border-border/60"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right 4 Columns: Live Interactive Brand Preview */}
              <div className="lg:col-span-4 space-y-6">
                <Card className="rounded-2xl border-border/60 shadow-soft sticky top-20 overflow-hidden">
                  <CardHeader className="bg-secondary/20 pb-3 border-b border-border/40">
                    <CardTitle className="font-display text-sm flex items-center gap-2 text-primary">
                      <Eye className="h-4 w-4 text-gold" />
                      Real-Time Interface Preview
                    </CardTitle>
                    <CardDescription className="text-[11px]">
                      Preview how your changes will render live across the portal.
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="p-4 space-y-5">
                    {/* Simulated Navigation Bar */}
                    <div className="rounded-xl border border-border/60 bg-card p-3 shadow-sm space-y-3">
                      <div className="text-[10px] uppercase font-bold text-muted-foreground">
                        Navbar & Brand Banner
                      </div>
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-11 w-11 items-center justify-center rounded-xl shadow-glow overflow-hidden shrink-0"
                          style={{ backgroundColor: formData.primary_color }}
                        >
                          {formData.logo_url ? (
                            <img src={formData.logo_url} alt="Logo" className="h-8 w-8 object-contain" />
                          ) : (
                            <span className="text-xs font-black text-white tracking-wider">
                              {formData.short_name || "J.E.N"}
                            </span>
                          )}
                        </div>
                        <div className="leading-tight overflow-hidden">
                          <h4 className="font-bold text-sm text-foreground truncate">
                            {formData.name || "Jesus Enthroned Network"}
                          </h4>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {formData.tagline || "Enthroning Christ in all Spheres"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Simulated Primary & Accent Badges */}
                    <div className="space-y-2">
                      <div className="text-[10px] uppercase font-bold text-muted-foreground">
                        Styled Action Elements
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-sm transition-transform active:scale-95"
                          style={{ backgroundColor: formData.primary_color }}
                        >
                          Primary Action
                        </button>
                        <span
                          className="px-2.5 py-1 rounded-lg text-xs font-bold text-white"
                          style={{ backgroundColor: formData.accent_color }}
                        >
                          Accent Highlight
                        </span>
                        <span
                          className="px-2.5 py-1 rounded-lg text-xs font-bold text-white"
                          style={{ backgroundColor: formData.secondary_color }}
                        >
                          Secondary
                        </span>
                      </div>
                    </div>

                    {/* Currency Demonstration */}
                    <div className="rounded-xl border border-border/50 bg-secondary/15 p-3 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                        Base Financial Currency
                      </span>
                      <div className="font-display font-black text-lg text-foreground flex items-center gap-1.5">
                        <DollarSign className="h-4 w-4 text-gold" />
                        <span>{formData.currency_symbol || "KSh"} 1,450,000</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        Applies to cell returns, pledges, and congregational offerings.
                      </p>
                    </div>

                    {/* Last Sync Timestamp */}
                    <div className="pt-2 border-t border-border/40 text-[11px] text-muted-foreground flex items-center justify-between">
                      <span>Server Sync:</span>
                      <span className="font-medium text-foreground">
                        {lastSavedTime || "Active"}
                      </span>
                    </div>

                    {/* Save Button */}
                    <Button
                      onClick={() => handleSaveBranding()}
                      disabled={isSaving}
                      className="w-full rounded-xl font-bold bg-primary text-primary-foreground shadow-glow hover:bg-primary/90 h-10 flex items-center justify-center gap-2"
                    >
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      {isSaving ? "Publishing to Portal..." : "Apply & Publish Branding"}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ===================================================================== */}
        {/* TAB 2: FINANCIAL & ACCOUNTING                                         */}
        {/* ===================================================================== */}
        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="rounded-2xl border-border/60 shadow-soft">
              <CardHeader className="bg-secondary/15 pb-4 border-b border-border/40">
                <CardTitle className="font-display text-base flex items-center gap-2 text-primary">
                  <Landmark className="h-4 w-4 text-gold" />
                  Congregational Currency & Fiscal Year
                </CardTitle>
                <CardDescription className="text-xs">
                  Set the institutional currency and reporting period for church accounting and member offerings.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 grid gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label className="text-xs font-bold uppercase">Base Currency</Label>
                    <Select
                      value={formData.currency_symbol}
                      onValueChange={(val) => handleChange("currency_symbol", val)}
                    >
                      <SelectTrigger className="h-10 rounded-xl border-border/60">
                        <SelectValue placeholder="Select Currency" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="KSh">KSh — Kenyan Shilling</SelectItem>
                        <SelectItem value="KES">KES — Kenyan Shilling (ISO)</SelectItem>
                        <SelectItem value="UGX">UGX — Ugandan Shilling</SelectItem>
                        <SelectItem value="TZS">TZS — Tanzanian Shilling</SelectItem>
                        <SelectItem value="USD">USD — US Dollar ($)</SelectItem>
                        <SelectItem value="GBP">GBP — British Pound (£)</SelectItem>
                        <SelectItem value="EUR">EUR — Euro (€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-1.5">
                    <Label className="text-xs font-bold uppercase">Fiscal Year Start</Label>
                    <Select value={fiscalYear} onValueChange={setFiscalYear}>
                      <SelectTrigger className="h-10 rounded-xl border-border/60">
                        <SelectValue placeholder="Select Month" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="january">January (Calendar Year)</SelectItem>
                        <SelectItem value="april">April</SelectItem>
                        <SelectItem value="july">July (Government Year)</SelectItem>
                        <SelectItem value="october">October</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="grid gap-1.5">
                    <Label className="text-xs font-bold uppercase">Default Benevolence / Loan Rate (%)</Label>
                    <Input
                      type="number"
                      value={loanRate}
                      onChange={(e) => setLoanRate(Number(e.target.value))}
                      step={0.1}
                      className="h-10 rounded-xl border-border/60 font-semibold"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label className="text-xs font-bold uppercase">Welfare / Savings Rate (%)</Label>
                    <Input
                      type="number"
                      value={savingsRate}
                      onChange={(e) => setSavingsRate(Number(e.target.value))}
                      step={0.1}
                      className="h-10 rounded-xl border-border/60 font-semibold"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    onClick={() => handleSaveBranding()}
                    disabled={isSaving}
                    className="rounded-xl font-bold bg-primary text-primary-foreground shadow-glow hover:bg-primary/90 h-10 px-5"
                  >
                    Save Financial Currency
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/60 shadow-soft">
              <CardHeader className="bg-secondary/15 pb-4 border-b border-border/40">
                <CardTitle className="font-display text-base flex items-center gap-2 text-primary">
                  <Sparkles className="h-4 w-4 text-gold" />
                  Offering & Giving Categories
                </CardTitle>
                <CardDescription className="text-xs">
                  Active church giving streams managed in the ledger.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-3">
                {[
                  { name: "Tithes & First Fruits", status: "Active", code: "ACC-101" },
                  { name: "Sunday Congregational Offering", status: "Active", code: "ACC-102" },
                  { name: "Weekly Cell Fellowship Returns", status: "Active", code: "ACC-103" },
                  { name: "Sanctuary Building Pledge", status: "Active", code: "ACC-104" },
                  { name: "Missions & Evangelism Fund", status: "Active", code: "ACC-105" },
                ].map((item) => (
                  <div
                    key={item.code}
                    className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-secondary/10"
                  >
                    <div>
                      <span className="font-semibold text-xs text-foreground block">{item.name}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">{item.code}</span>
                    </div>
                    <Badge variant="outline" className="bg-success/10 text-success border-success/30 text-[10px] font-bold">
                      {item.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ===================================================================== */}
        {/* TAB 3: SECURITY & GOVERNANCE                                          */}
        {/* ===================================================================== */}
        <TabsContent value="security" className="space-y-6">
          <Card className="rounded-2xl border-border/60 shadow-soft">
            <CardHeader className="bg-secondary/15 pb-4 border-b border-border/40">
              <CardTitle className="font-display text-base flex items-center gap-2 text-primary">
                <Shield className="h-4 w-4 text-gold" />
                Security, Access Control & Audit Governance
              </CardTitle>
              <CardDescription className="text-xs">
                Manage pastoral access tiers, multi-factor authentication, and action audit logs.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 grid gap-4">
              {[
                {
                  id: "twoFactor",
                  title: "Two-Factor Authentication (OTP)",
                  description: "Require one-time passcode for pastoral staff and deacons during login.",
                  value: securitySettings.twoFactor,
                },
                {
                  id: "auditLogging",
                  title: "Immutable Pastoral Action Audit Log",
                  description: "Record every intervention, cell return update, and member record modification.",
                  value: securitySettings.auditLogging,
                },
                {
                  id: "smsNotifications",
                  title: "Automated Member SMS Follow-Up",
                  description: "Dispatch automated SMS welcoming first-time visitors and cell meeting reminders.",
                  value: securitySettings.smsNotifications,
                },
                {
                  id: "emailDigest",
                  title: "Weekly Leadership Executive Digest",
                  description: "Send weekly attendance summary and cell return completion rates to Senior Pastors.",
                  value: securitySettings.emailDigest,
                },
              ].map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-border/60 bg-secondary/10 hover:bg-secondary/20 transition-colors"
                >
                  <div className="space-y-0.5 pr-4">
                    <span className="text-sm font-semibold text-foreground block">{item.title}</span>
                    <span className="text-xs text-muted-foreground block">{item.description}</span>
                  </div>
                  <Switch
                    checked={item.value}
                    onCheckedChange={(checked) =>
                      setSecuritySettings((prev) => ({ ...prev, [item.id]: checked }))
                    }
                  />
                </div>
              ))}

              <div className="pt-4 flex justify-end">
                <Button
                  onClick={() => toast.success("Security preferences saved successfully.")}
                  className="rounded-xl font-bold bg-primary text-primary-foreground shadow-glow hover:bg-primary/90 h-10 px-5"
                >
                  Save Governance Policies
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===================================================================== */}
        {/* TAB 4: DOCUMENT STUDIO & UNIFORM HEADER                               */}
        {/* ===================================================================== */}
        <TabsContent value="documents" className="space-y-6">
          <DocumentStudioView />
        </TabsContent>
      </Tabs>
    </div>
  );
}
