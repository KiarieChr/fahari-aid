import React from "react";
import { useBranding } from "@/context/BrandingContext";
import { Building, MapPin, Phone, Mail, ShieldCheck } from "lucide-react";

export interface DocumentUniformHeaderProps {
  orientation?: "portrait" | "landscape";
  title?: string;
  subtitle?: string;
  refCode?: string;
  classification?: string;
  issuedAt?: string | Date;
  showLogo?: boolean;
  showTagline?: boolean;
  showContacts?: boolean;
  showSubbar?: boolean;
  styleVariant?: "executive" | "classic" | "minimal";
  customBranding?: {
    name?: string;
    short_name?: string;
    tagline?: string;
    logo_url?: string | null;
    primary_color?: string;
    accent_color?: string;
    secondary_color?: string;
    official_email?: string | null;
    official_phone?: string | null;
    physical_address?: string | null;
    currency_symbol?: string;
  };
}

export function DocumentUniformHeader({
  orientation = "portrait",
  title,
  subtitle,
  refCode,
  classification = "OFFICIAL INSTITUTIONAL RECORD",
  issuedAt = new Date(),
  showLogo = true,
  showTagline = true,
  showContacts = true,
  showSubbar = true,
  styleVariant = "executive",
  customBranding,
}: DocumentUniformHeaderProps) {
  const { branding: contextBranding } = useBranding();

  const brand = {
    name: customBranding?.name ?? contextBranding.name ?? "Jesus Enthroned Network",
    short_name: customBranding?.short_name ?? contextBranding.short_name ?? "J.E.N",
    tagline: customBranding?.tagline ?? contextBranding.tagline ?? "Enthroning Christ in all Spheres",
    logo_url: customBranding?.logo_url !== undefined ? customBranding.logo_url : contextBranding.logo_url,
    primary_color: customBranding?.primary_color ?? contextBranding.primary_color ?? "#1e3a8a",
    accent_color: customBranding?.accent_color ?? contextBranding.accent_color ?? "#d97706",
    secondary_color: customBranding?.secondary_color ?? contextBranding.secondary_color ?? "#0f172a",
    official_email: customBranding?.official_email ?? contextBranding.official_email,
    official_phone: customBranding?.official_phone ?? contextBranding.official_phone,
    physical_address: customBranding?.physical_address ?? contextBranding.physical_address,
    currency_symbol: customBranding?.currency_symbol ?? contextBranding.currency_symbol ?? "KES",
  };

  const formattedDate = typeof issuedAt === "string" ? issuedAt : issuedAt.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const isLandscape = orientation === "landscape";

  return (
    <header className="w-full text-slate-800 select-none font-sans border-b pb-3 mb-4 transition-all">
      {/* 1. Master Dual-Color Top Stripe */}
      <div
        className="w-full h-1.5 rounded-full mb-3 shadow-xs"
        style={{
          background: `linear-gradient(90deg, ${brand.primary_color} 0%, ${brand.accent_color} 75%, ${brand.secondary_color} 100%)`,
        }}
      />

      {/* 2. Main Institutional Masthead */}
      <div
        className={`flex ${
          styleVariant === "classic"
            ? "flex-col items-center text-center gap-2"
            : "items-center justify-between gap-4"
        }`}
      >
        {/* Left / Center Identity Block */}
        <div
          className={`flex items-center gap-3.5 ${
            styleVariant === "classic" ? "flex-col items-center text-center" : "text-left"
          }`}
        >
          {showLogo && (
            <div className="shrink-0">
              {brand.logo_url ? (
                <img
                  src={brand.logo_url}
                  alt={brand.name}
                  className="h-12 w-auto max-w-[80px] object-contain drop-shadow-xs"
                />
              ) : (
                <div
                  className="h-11 w-11 rounded-xl flex items-center justify-center font-black text-white text-base shadow-sm"
                  style={{ backgroundColor: brand.primary_color }}
                >
                  {brand.short_name.slice(0, 3).toUpperCase()}
                </div>
              )}
            </div>
          )}

          <div>
            <h1
              className={`font-black uppercase tracking-tight leading-tight ${
                isLandscape ? "text-lg lg:text-xl" : "text-base lg:text-lg"
              }`}
              style={{ color: brand.primary_color }}
            >
              {brand.name}
            </h1>
            {showTagline && brand.tagline && (
              <p className="text-[11px] font-medium italic text-slate-500 mt-0.5">
                {brand.tagline}
              </p>
            )}
          </div>
        </div>

        {/* Right Contacts / Official Registry */}
        {showContacts && styleVariant !== "classic" && (
          <div className="shrink-0 text-right text-[10.5px] leading-relaxed text-slate-500 flex flex-col items-end">
            {brand.physical_address && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                <span>{brand.physical_address}</span>
              </div>
            )}
            {brand.official_phone && (
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3 text-slate-400 shrink-0" />
                <span>{brand.official_phone}</span>
              </div>
            )}
            {brand.official_email && (
              <div className="flex items-center gap-1">
                <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                <span>{brand.official_email}</span>
              </div>
            )}
            <div className="text-[10px] font-semibold text-slate-700 mt-0.5">
              Ref: <span className="font-mono text-slate-600">{refCode || `JENC-${new Date().getFullYear()}-DOC`}</span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Official Divider Sub-Bar */}
      {showSubbar && (
        <div className="mt-3 py-1.5 px-3 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between text-[10.5px] shadow-2xs">
          <div className="flex items-center gap-2">
            <span
              className="text-[9.5px] font-bold text-white uppercase px-2 py-0.5 rounded tracking-wider flex items-center gap-1 shadow-2xs"
              style={{ backgroundColor: brand.primary_color }}
            >
              <ShieldCheck className="h-3 w-3" />
              {classification}
            </span>
            <span className="text-slate-500 font-medium">
              Currency: <strong className="text-slate-700">{brand.currency_symbol}</strong>
            </span>
          </div>

          <div className="text-slate-500 font-medium text-[10px]">
            Issued: <span className="font-semibold text-slate-700">{formattedDate}</span>
          </div>
        </div>
      )}

      {/* 4. Document Specific Headline (if provided) */}
      {(title || subtitle) && (
        <div className="mt-3.5">
          {title && (
            <h2
              className={`font-bold tracking-tight ${isLandscape ? "text-base" : "text-sm"}`}
              style={{ color: brand.secondary_color }}
            >
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">{subtitle}</p>
          )}
        </div>
      )}
    </header>
  );
}
