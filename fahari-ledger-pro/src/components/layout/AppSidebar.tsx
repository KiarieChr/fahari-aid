import * as React from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  PanelLeftClose,
  PanelLeftOpen,
  Church,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { primaryModules, type PrimaryModule, type ContextualSubItem } from "./sidebar-config";
import { useBranding } from "@/context/BrandingContext";
import { apiCall } from "@/api/client";

export function AppSidebar() {
  const { branding } = useBranding();
  const isMobile = useIsMobile();
  const currentPath = useRouterState({ select: (s) => s.location.pathname });
  const currentSearch = useRouterState({ select: (s) => s.location.search }) as Record<string, string | undefined>;

  // Live follow-up badge count from /api/meetings/attendance/followup/
  const [followupCount, setFollowupCount] = React.useState<number>(0);

  React.useEffect(() => {
    let isMounted = true;
    apiCall<{ count: number }>("/meetings/attendance/followup/")
      .then((res) => {
        if (isMounted && res && typeof res.count === "number") {
          setFollowupCount(res.count);
        }
      })
      .catch(() => {
        // Silently ignore layout badge errors
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const getDynamicBadge = (item: ContextualSubItem) => {
    if (item.title === "Attendance & Tracking") {
      return followupCount > 0 ? `Care (${followupCount})` : undefined;
    }
    return item.badge;
  };

  // Determine active module based on current URL path
  const activeModuleFromPath = React.useMemo(() => {
    // Exact or longest prefix match
    const matching = primaryModules.find((m) =>
      m.id !== "dashboard" && m.matchPrefixes.some((prefix) => currentPath.startsWith(prefix))
    );
    return matching || primaryModules[0];
  }, [currentPath]);

  // User can click an icon rail to switch the displayed contextual panel
  const [selectedModuleId, setSelectedModuleId] = React.useState<string>(activeModuleFromPath.id);
  const [isSubpanelOpen, setIsSubpanelOpen] = React.useState<boolean>(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = React.useState<boolean>(false);

  // Sync selected module when navigating to a new path
  React.useEffect(() => {
    setSelectedModuleId(activeModuleFromPath.id);
  }, [activeModuleFromPath.id]);

  const activeModule = React.useMemo(() => {
    return primaryModules.find((m) => m.id === selectedModuleId) || primaryModules[0];
  }, [selectedModuleId]);

  // Helper to parse URL path and search params
  const parseUrl = (url: string, itemSearch?: Record<string, unknown>) => {
    const [targetPath, query] = url.split("?");
    const searchObj: Record<string, string> = {};
    if (query) {
      const params = new URLSearchParams(query);
      params.forEach((v, k) => {
        searchObj[k] = v;
      });
    }
    if (itemSearch) {
      Object.entries(itemSearch).forEach(([k, v]) => {
        if (v !== undefined) {
          searchObj[k] = String(v);
        }
      });
    }
    const hasSearch = Object.keys(searchObj).length > 0;
    return { pathname: targetPath, search: hasSearch ? searchObj : undefined };
  };

  // Helper to determine if a sub-item is active
  const isSubItemActive = (url: string, itemSearch?: Record<string, unknown>) => {
    const [targetPath, targetQuery] = url.split("?");

    const pathMatches =
      targetPath === "/"
        ? currentPath === "/"
        : currentPath === targetPath || currentPath.startsWith(targetPath + "/");

    if (!pathMatches) return false;

    const mergedTargetSearch: Record<string, string> = {};
    if (targetQuery) {
      const sp = new URLSearchParams(targetQuery);
      sp.forEach((v, k) => {
        mergedTargetSearch[k] = v;
      });
    }
    if (itemSearch) {
      Object.entries(itemSearch).forEach(([k, v]) => {
        if (v !== undefined) {
          mergedTargetSearch[k] = String(v);
        }
      });
    }

    // Special matching for /meetings per Phase 1.1:
    // view=meetings (or no view) -> Highlights Meetings Hub
    // view=attendance -> Highlights Attendance & Tracking
    // view=analytics -> Highlights Attendance Analytics
    if (currentPath === "/meetings") {
      const activeView = currentSearch?.view || "meetings";
      const targetView = mergedTargetSearch.view || "meetings";
      return activeView === targetView;
    }

    // Special matching for /minutes:
    // /minutes or /minutes?meeting_id=... highlights Meeting Minutes
    if (currentPath === "/minutes") {
      return targetPath === "/minutes";
    }

    if (Object.keys(mergedTargetSearch).length > 0) {
      for (const [key, val] of Object.entries(mergedTargetSearch)) {
        const currentVal = currentSearch?.[key];
        if (currentVal !== val) {
          return false;
        }
      }
      return true;
    }

    // Default route handling for /members without query params
    if (currentPath === "/members") {
      const activeView = currentSearch?.view || "analytics";
      return activeView === "analytics" && !currentSearch?.action && !currentSearch?.cell_id;
    }

    return true;
  };

  // Mobile drawer view
  if (isMobile) {
    return (
      <Sheet open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen}>
        <SheetContent side="left" className="w-[85vw] max-w-[320px] p-0 bg-sidebar text-sidebar-foreground">
          <SheetHeader className="border-b border-sidebar-border p-4 text-left">
            <SheetTitle className="flex items-center gap-2.5 text-base font-bold text-sidebar-foreground">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg shadow-glow overflow-hidden"
                style={{ background: "var(--brand-primary, var(--gradient-gold))" }}
              >
                {branding.logo_url ? (
                  <img src={branding.logo_url} alt={branding.name} className="h-6 w-6 object-contain" />
                ) : (
                  <span className="text-xs font-bold text-white">{branding.short_name}</span>
                )}
              </div>
              <span className="truncate">{branding.name}</span>
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col h-[calc(100vh-65px)] overflow-y-auto p-4 space-y-6">
            {primaryModules.map((module) => (
              <div key={module.id} className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold">
                  <module.icon className="h-4 w-4" />
                  <span>{module.title}</span>
                </div>
                <div className="pl-6 space-y-1">
                  {module.groups.flatMap((g) => g.items).map((item) => {
                    const active = isSubItemActive(item.url, item.search);
                    const { pathname: itemPath, search: itemSearch } = parseUrl(item.url, item.search);
                    const itemBadge = getDynamicBadge(item);
                    return (
                      <Link
                        key={item.title}
                        to={itemPath as any}
                        search={itemSearch as any}
                        onClick={() => setMobileDrawerOpen(false)}
                        className={cn(
                          "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                          active
                            ? "text-white font-semibold shadow-soft"
                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                        )}
                        style={active ? { backgroundColor: "var(--brand-primary)" } : undefined}
                      >
                        <span>{item.title}</span>
                        {itemBadge && (
                          <Badge variant="secondary" className="text-[10px] py-0 px-1.5 bg-gold/20 text-gold-foreground">
                            {itemBadge}
                          </Badge>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop Contextual Dual-Rail Layout
  return (
    <TooltipProvider delayDuration={150}>
      <aside className="sticky top-0 z-40 flex h-screen select-none">
        {/* ========================================================= */}
        {/* RAIL 1: Primary Module Rail (Fixed 68px width)            */}
        {/* ========================================================= */}
        <div className="flex w-[68px] min-w-[68px] flex-col items-center justify-between border-r border-sidebar-border bg-sidebar py-4 text-sidebar-foreground">
          {/* Top Brand Logo */}
          <div className="flex flex-col items-center gap-4">
            <Link to="/" className="group flex flex-col items-center focus:outline-none" title={branding.name}>
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl shadow-glow transition-transform group-hover:scale-105 overflow-hidden"
                style={{ background: "var(--brand-primary, var(--gradient-gold))" }}
              >
                {branding.logo_url ? (
                  <img src={branding.logo_url} alt={branding.name} className="h-9 w-9 object-contain" />
                ) : (
                  <span className="text-xs font-black text-white tracking-wider">{branding.short_name}</span>
                )}
              </div>
            </Link>

            <div className="h-px w-9 bg-sidebar-border my-1" />

            {/* Primary Modules Icons */}
            <nav className="flex flex-col items-center gap-1.5" aria-label="Primary modules">
              {primaryModules.map((module) => {
                const isSelected = selectedModuleId === module.id;
                const isCurrentRoute = activeModuleFromPath.id === module.id;

                return (
                  <Tooltip key={module.id}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedModuleId(module.id);
                          if (!isSubpanelOpen) {
                            setIsSubpanelOpen(true);
                          }
                        }}
                        className={cn(
                          "relative flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200 focus:outline-none",
                          isSelected
                            ? "bg-sidebar-accent text-gold shadow-sm font-bold ring-1 ring-gold/40"
                            : isCurrentRoute
                            ? "text-gold/90 hover:bg-sidebar-accent/50 hover:text-gold"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                        )}
                        aria-label={module.title}
                      >
                        <module.icon className="h-5 w-5" strokeWidth={isSelected ? 2.4 : 2} />

                        {/* Active vertical accent notch */}
                        {isSelected && (
                          <span className="absolute -left-1.5 top-2.5 h-6 w-1 rounded-r-full bg-gold shadow-glow" />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={12} className="bg-popover text-popover-foreground border shadow-elevated">
                      <div className="font-semibold">{module.title}</div>
                      <div className="text-[11px] text-muted-foreground">{module.description}</div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </nav>
          </div>

          {/* Bottom Rail User Indicator */}
          <div className="flex flex-col items-center gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/settings"
                  className="relative flex h-10 w-10 items-center justify-center rounded-xl text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
                >
                  <ShieldCheck className="h-5 w-5 text-gold" />
                  <span className="absolute bottom-1 right-1 h-2 w-2 rounded-full bg-success ring-2 ring-sidebar" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={12}>
                <div className="font-semibold">{branding.short_name} Operations</div>
                <div className="text-[11px] text-muted-foreground">Connected to Core</div>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RAIL 2: Contextual Module Sub-Panel (Collapsible 228px)   */}
        {/* ========================================================= */}
        <div
          className={cn(
            "flex flex-col border-r border-border/70 bg-sidebar-subpanel transition-all duration-300 ease-in-out overflow-hidden",
            isSubpanelOpen ? "w-[228px] opacity-100" : "w-0 opacity-0 border-r-0"
          )}
        >
          {/* Subpanel Header */}
          <div className="flex h-16 items-center justify-between border-b border-border/70 px-4">
            <div className="flex flex-col leading-tight overflow-hidden">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Module Navigation
              </span>
              <span className="truncate font-display text-sm font-bold text-foreground">
                {activeModule.title}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSubpanelOpen(false)}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              title="Collapse module navigation"
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          </div>

          {/* Subpanel Content Groups */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
            {activeModule.groups.map((group) => (
              <div key={group.heading} className="space-y-1.5">
                <div className="px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                  {group.heading}
                </div>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const active = isSubItemActive(item.url, item.search);
                    const { pathname: itemPath, search: itemSearch } = parseUrl(item.url, item.search);
                    const itemBadge = getDynamicBadge(item);
                    const SubIcon = item.icon;

                    return (
                      <Link
                        key={item.title}
                        to={itemPath as any}
                        search={itemSearch as any}
                        className={cn(
                          "group flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition-all duration-150",
                          active
                            ? "text-white font-semibold shadow-soft"
                            : "text-foreground/80 hover:bg-secondary/80 hover:text-foreground"
                        )}
                        style={active ? { backgroundColor: "var(--brand-primary)" } : undefined}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {SubIcon && (
                            <SubIcon
                              className={cn(
                                "h-3.5 w-3.5 shrink-0 transition-colors",
                                active ? "text-white" : "text-muted-foreground group-hover:text-foreground"
                              )}
                            />
                          )}
                          <span className="truncate">{item.title}</span>
                        </div>
                        {itemBadge && (
                          <span
                            className={cn(
                              "shrink-0 rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider",
                              active
                                ? "bg-white/20 text-white"
                                : "bg-gold/20 text-gold-foreground"
                            )}
                          >
                            {itemBadge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Subpanel Footer / System Badge */}
          <div className="border-t border-border/70 p-3 bg-secondary/30">
            <div className="flex items-center gap-2 rounded-lg bg-card/60 p-2 text-xs border border-border/40">
              <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
              <div className="flex flex-col min-w-0 leading-tight">
                <span className="font-semibold truncate text-[11px]">{branding.short_name} Operations</span>
                <span className="text-[10px] text-muted-foreground truncate">{branding.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Small Expand Button when Subpanel is collapsed */}
        {!isSubpanelOpen && (
          <button
            type="button"
            onClick={() => setIsSubpanelOpen(true)}
            className="group absolute left-[68px] top-4 z-50 flex h-8 w-5 items-center justify-center rounded-r-md border border-l-0 border-border bg-card text-muted-foreground shadow-soft hover:text-foreground focus:outline-none"
            title="Expand module navigation"
          >
            <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        )}
      </aside>
    </TooltipProvider>
  );
}
