import { Bell, Search, ChevronDown, LogOut, User, Settings as SettingsIcon } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getStoredUser, logout, type AuthUser } from "@/api/auth";
import { useBranding } from "@/context/BrandingContext";

export function TopNavbar() {
  const { branding } = useBranding();
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
    const handleStorage = () => setUser(getStoredUser());
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const defaultInitials = (branding.short_name || "JN").slice(0, 2).toUpperCase();
  const fullName = user
    ? [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username || user.email || `${branding.short_name} Member`
    : `${branding.short_name} Member`;

  const roleDisplay = user?.role || (user?.is_staff ? "Administrator" : "Member");

  const initials = user
    ? (user.first_name && user.last_name
        ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
        : user.first_name
        ? user.first_name.slice(0, 2).toUpperCase()
        : user.email
        ? user.email.slice(0, 2).toUpperCase()
        : defaultInitials)
    : defaultInitials;

  const handleSignOut = async () => {
    await logout();
    navigate({ to: "/login" });
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-card/80 px-4 backdrop-blur-md md:px-6">
      <SidebarTrigger className="text-muted-foreground hover:text-foreground" />

      <div className="relative ml-2 hidden max-w-md flex-1 md:block">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search members, meetings, giving, accounts…"
          className="h-10 rounded-lg border-border/60 bg-secondary/50 pl-9 text-sm focus-visible:ring-primary/30"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-lg">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive ring-2 ring-card" />
        </Button>

        <div className="mx-1 hidden h-8 w-px bg-border md:block" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 rounded-lg p-1.5 pr-3 transition-colors hover:bg-secondary">
              <Avatar className="h-9 w-9 border-2 border-gold/40">
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left leading-tight md:block">
                <div className="text-sm font-semibold max-w-[140px] truncate">{fullName}</div>
                <div className="text-xs text-muted-foreground max-w-[140px] truncate">{roleDisplay}</div>
              </div>
              <ChevronDown className="hidden h-4 w-4 text-muted-foreground md:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="truncate">{fullName}</span>
                <span className="text-xs font-normal text-muted-foreground truncate">
                  {user?.email || "user@example.com"}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" /> Profile
              <Badge className="ml-auto bg-gold/20 text-gold-foreground hover:bg-gold/20">
                Pro
              </Badge>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <SettingsIcon className="mr-2 h-4 w-4" /> Preferences
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
