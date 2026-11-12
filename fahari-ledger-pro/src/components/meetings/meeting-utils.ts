export function getSemanticStatusBadgeClass(status: string): string {
  const norm = (status || "").toLowerCase().trim();
  if (norm === "regular") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium";
  }
  if (norm === "irregular") {
    return "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium";
  }
  if (norm === "needs follow-up" || norm === "needs-followup" || norm === "followup") {
    return "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-medium";
  }
  return "border-border bg-muted/60 text-muted-foreground";
}

export function getDeterministicAvatarColor(identifier: number | string): string {
  const palette = [
    "bg-blue-600 text-white",
    "bg-indigo-600 text-white",
    "bg-purple-600 text-white",
    "bg-emerald-600 text-white",
    "bg-amber-600 text-white",
    "bg-rose-600 text-white",
    "bg-teal-600 text-white",
    "bg-cyan-600 text-white",
  ];
  let num = 0;
  if (typeof identifier === "number") {
    num = identifier;
  } else {
    for (let i = 0; i < (identifier || "").length; i++) {
      num += identifier.charCodeAt(i);
    }
  }
  return palette[Math.abs(num) % palette.length];
}

export function getInitials(name?: string | null): string {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function formatRelativeMinutes(minutesDiff: number): string {
  if (minutesDiff <= 0) return "+0 min";
  if (minutesDiff < 60) return `+${minutesDiff} min`;
  const hrs = Math.floor(minutesDiff / 60);
  const rem = minutesDiff % 60;
  return `+${hrs}h ${rem}m`;
}

export function formatTimeAgo(dateStr?: string | null): string {
  if (!dateStr) return "Never";
  const dt = new Date(dateStr);
  if (isNaN(dt.getTime())) return "Never";
  const diffMs = Date.now() - dt.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHrs = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHrs / 24);
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffDays < 1) {
    if (diffMin <= 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    return `${diffHrs}h ago`;
  }
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffWeeks === 1) return "1 week ago";
  if (diffWeeks < 8) return `${diffWeeks} weeks ago`;
  return dt.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export const BRAND_ACCENTS = [
  "var(--brand-primary)",
  "var(--brand-accent)",
  "hsl(215 25% 45%)",
  "hsl(280 40% 45%)",
];
