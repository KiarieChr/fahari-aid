export function getEventTypeColor(type: string | null | undefined): { bg: string; text: string; border: string; bar: string } {
  const norm = (type || "").toLowerCase().trim();
  switch (norm) {
    case "conference":
      return {
        bg: "bg-[var(--brand-primary)]/10",
        text: "text-[var(--brand-primary)]",
        border: "border-[var(--brand-primary)]/20",
        bar: "bg-[var(--brand-primary)]",
      };
    case "retreat":
    case "camp":
      return {
        bg: "bg-[var(--brand-accent)]/15",
        text: "text-[var(--brand-accent)]",
        border: "border-[var(--brand-accent)]/30",
        bar: "bg-[var(--brand-accent)]",
      };
    case "youth":
      return {
        bg: "bg-emerald-500/10",
        text: "text-emerald-700 dark:text-emerald-400",
        border: "border-emerald-500/20",
        bar: "bg-emerald-500",
      };
    case "training":
    case "leadership":
      return {
        bg: "bg-indigo-500/10",
        text: "text-indigo-700 dark:text-indigo-400",
        border: "border-indigo-500/20",
        bar: "bg-indigo-500",
      };
    case "worship":
      return {
        bg: "bg-amber-500/10",
        text: "text-amber-700 dark:text-amber-400",
        border: "border-amber-500/20",
        bar: "bg-amber-500",
      };
    case "outreach":
      return {
        bg: "bg-sky-500/10",
        text: "text-sky-700 dark:text-sky-400",
        border: "border-sky-500/20",
        bar: "bg-sky-500",
      };
    default:
      return {
        bg: "bg-muted/40",
        text: "text-muted-foreground",
        border: "border-border",
        bar: "bg-muted-foreground/60",
      };
  }
}

export function getSessionTypeColor(sessionType: string | null | undefined): { bg: string; text: string; bar: string } {
  const norm = (sessionType || "").toLowerCase().trim();
  switch (norm) {
    case "worship":
      return { bg: "bg-amber-500/10", text: "text-amber-700 dark:text-amber-400", bar: "bg-amber-500" };
    case "teaching":
      return { bg: "bg-[var(--brand-primary)]/10", text: "text-[var(--brand-primary)]", bar: "bg-[var(--brand-primary)]" };
    case "prayer":
      return { bg: "bg-purple-500/10", text: "text-purple-700 dark:text-purple-400", bar: "bg-purple-500" };
    case "panel":
      return { bg: "bg-indigo-500/10", text: "text-indigo-700 dark:text-indigo-400", bar: "bg-indigo-500" };
    case "meal":
    case "break":
      return { bg: "bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-400", bar: "bg-emerald-500" };
    case "registration":
      return { bg: "bg-sky-500/10", text: "text-sky-700 dark:text-sky-400", bar: "bg-sky-500" };
    default:
      return { bg: "bg-muted/40", text: "text-muted-foreground", bar: "bg-muted-foreground/40" };
  }
}

export function formatEventDates(startDateStr: string, endDateStr: string): string {
  try {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    if (isNaN(start.getTime())) return startDateStr || "—";

    const sMonth = start.toLocaleDateString("en-US", { month: "short" });
    const sDay = start.getDate();
    const sYear = start.getFullYear();

    if (isNaN(end.getTime()) || start.toDateString() === end.toDateString()) {
      return `${sMonth} ${sDay}, ${sYear}`;
    }

    const eMonth = end.toLocaleDateString("en-US", { month: "short" });
    const eDay = end.getDate();
    const eYear = end.getFullYear();

    if (sYear === eYear && sMonth === eMonth) {
      return `${sMonth} ${sDay} – ${eDay}, ${sYear}`;
    } else if (sYear === eYear) {
      return `${sMonth} ${sDay} – ${eMonth} ${eDay}, ${sYear}`;
    }
    return `${sMonth} ${sDay}, ${sYear} – ${eMonth} ${eDay}, ${eYear}`;
  } catch {
    return startDateStr || "—";
  }
}

export function getInitials(name: string): string {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
