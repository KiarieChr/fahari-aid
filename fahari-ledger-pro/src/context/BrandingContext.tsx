import React, { createContext, useContext, useEffect, useState } from "react";
import { apiCall } from "@/api/client";

export interface BrandingSettings {
  name: string;
  short_name: string;
  tagline: string | null;
  logo_url: string | null;
  logo_dark_url: string | null;
  favicon_url: string | null;
  primary_color: string;
  accent_color: string;
  secondary_color: string;
  currency_symbol: string;
  official_email: string | null;
  official_phone: string | null;
  physical_address: string | null;
}

export const defaultBranding: BrandingSettings = {
  name: "Jesus Enthroned Network",
  short_name: "J.E.N",
  tagline: "Enthroning Christ in all Spheres",
  logo_url: null,
  logo_dark_url: null,
  favicon_url: null,
  primary_color: "#1e3a8a",
  accent_color: "#d97706",
  secondary_color: "#0f172a",
  currency_symbol: "KSh",
  official_email: null,
  official_phone: null,
  physical_address: null,
};

interface BrandingContextValue {
  branding: BrandingSettings;
  isLoading: boolean;
  refetchBranding: () => Promise<void>;
}

const BrandingContext = createContext<BrandingContextValue | undefined>(undefined);

function applyBrandingToDom(data: BrandingSettings) {
  if (typeof document === "undefined") return;

  // 1. Set CSS custom properties on document.documentElement
  if (data.primary_color) {
    document.documentElement.style.setProperty("--brand-primary", data.primary_color);
  }
  if (data.accent_color) {
    document.documentElement.style.setProperty("--brand-accent", data.accent_color);
  }
  if (data.secondary_color) {
    document.documentElement.style.setProperty("--brand-secondary", data.secondary_color);
  }

  // 2. Set document.title
  if (data.short_name && data.name) {
    document.title = `${data.short_name} - ${data.name}`;
  }

  // 3. Apply the favicon defensively
  if (data.favicon_url) {
    let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = data.favicon_url;
  }
}

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const [branding, setBranding] = useState<BrandingSettings>(defaultBranding);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchBranding = async () => {
    try {
      // Ensure no Authorization header or 401 redirect is attached
      const data = await apiCall<BrandingSettings>("/branding/", {
        auth: false,
        skipRefresh: true,
      });
      if (data && typeof data === "object") {
        setBranding(data);
        applyBrandingToDom(data);
      }
    } catch (error) {
      console.warn("Failed to fetch branding from server, using default branding:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Apply defaults immediately to avoid flash of unstyled brand
    applyBrandingToDom(defaultBranding);
    fetchBranding();
  }, []);

  return (
    <BrandingContext.Provider value={{ branding, isLoading, refetchBranding: fetchBranding }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding(): BrandingContextValue {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error("useBranding must be used within a BrandingProvider");
  }
  return context;
}
