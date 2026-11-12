import { Link } from "@tanstack/react-router";
import { Users, CalendarCheck, ShieldCheck, Sparkles, Building2 } from "lucide-react";
import type { ReactNode } from "react";
import { useBranding } from "@/context/BrandingContext";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  const { branding } = useBranding();
  const {
    name = "Fahari ",
    short_name = "Fahari",
    logo_url = null,
    primary_color = "#1e3a8a",
    tagline = "Institution Management System",
  } = branding || {};

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-2">
      {/* Left brand panel */}
      <div
        className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between text-white p-12"
        style={{
          background: `linear-gradient(135deg, ${primary_color} 0%, #0f172a 100%)`,
        }}
      >
        {/* Decorative gradient orbs */}
        <div
          className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full opacity-25 blur-3xl bg-amber-400"
        />
        <div
          className="pointer-events-none absolute -bottom-40 -right-20 h-[28rem] w-[28rem] rounded-full opacity-20 blur-3xl bg-blue-400"
        />
        {/* Subtle grid pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Top Header Branding */}
        <div className="relative z-10 flex items-center gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md shadow-lg overflow-hidden">
            {logo_url ? (
              <img src={logo_url} alt="Logo" className="h-8 w-8 object-contain" />
            ) : (
              <Building2 className="h-6 w-6 text-white" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-display text-lg font-bold leading-none tracking-tight text-white uppercase truncate">
              {name}
            </p>
            {tagline && (
              <p className="mt-1 text-xs text-white/75 font-medium truncate">
                {tagline}
              </p>
            )}
          </div>
        </div>

        {/* Middle Value Proposition */}
        <div className="relative z-10 max-w-md my-auto py-8">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-medium text-white/90 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            Institution &amp; Community Portal
          </div>
          <h2 className="font-display text-3xl xl:text-4xl font-bold leading-tight tracking-tight text-white">
            Lead your institution with{" "}
            <span className="text-amber-300">purpose &amp; excellence.</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/80">
            A unified platform to manage members, coordinate events &amp; meetings, track attendance, and steward community resources seamlessly.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-3">
            {[
              {
                icon: Users,
                title: "Member & Group Directory",
                desc: "Centralized member records, family units & fellowship groups",
              },
              {
                icon: CalendarCheck,
                title: "Meetings, Events & Attendance",
                desc: "Kiosk check-ins, service schedules & attendance analytics",
              },
              {
                icon: ShieldCheck,
                title: "Stewardship & Governance",
                desc: "Role-based access, contributions & audit-ready records",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="flex items-start gap-3 rounded-xl border border-white/15 bg-white/5 p-3.5 backdrop-blur-sm transition-colors hover:bg-white/10"
              >
                <div className="grid h-8 w-8 shrink-0 place-content-center rounded-lg bg-white/10 text-amber-300">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white tracking-wide">{title}</p>
                  <p className="text-xs text-white/70 leading-normal mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Panel Footer */}
        <div className="relative z-10 flex items-center justify-between text-xs text-white/60">
          <p>© {new Date().getFullYear()} {name}. All rights reserved.</p>
          <span className="inline-block rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/75">
            Fahari Eklesia
          </span>
        </div>
      </div>

      {/* Right form panel */}
      <div className="relative flex flex-col bg-background">
        {/* Mobile brand header */}
        <div className="flex items-center justify-between px-6 py-5 lg:hidden border-b border-border/40">
          <Link to="/login" className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm overflow-hidden"
              style={{ backgroundColor: primary_color }}
            >
              {logo_url ? (
                <img src={logo_url} alt={name} className="h-7 w-7 object-contain" />
              ) : (
                <Building2 className="h-5 w-5" />
              )}
            </div>
            <div className="min-w-0">
              <span className="font-display text-sm font-bold tracking-tight block uppercase text-foreground truncate">
                {name}
              </span>
              {tagline && (
                <span className="text-[11px] text-muted-foreground block truncate max-w-[220px]">
                  {tagline}
                </span>
              )}
            </div>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-8 sm:px-10">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {title}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
            </div>

            {children}

            {footer ? <div className="mt-8">{footer}</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
