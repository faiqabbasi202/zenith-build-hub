export const STATUS_LABEL: Record<string, string> = {
  newly_launched: "Newly launched",
  ongoing: "Ongoing",
  completed: "Completed",
  handed_over: "Handed over",
};

export function statusLabel(status?: string | null) {
  if (!status) return "";
  return STATUS_LABEL[status] ?? status;
}

export function pkr(millions?: number | string | null) {
  if (millions === null || millions === undefined || millions === "") return "—";
  const n = Number(millions);
  if (Number.isNaN(n)) return "—";
  if (n >= 1000) return `PKR ${(n / 1000).toFixed(2)} bn`;
  return `PKR ${n.toLocaleString("en-PK")} m`;
}

export function yearOf(date?: string | null) {
  if (!date) return "—";
  return new Date(date).getFullYear().toString();
}

export function longDate(date?: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function asList(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((v) => (typeof v === "string" ? v.trim() : String(v || "").trim()))
      .filter(Boolean);
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    // Try JSON parse if it looks like an array
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.map((v) => String(v || "").trim()).filter(Boolean);
        }
      } catch {
        // Fall back to splitting
      }
    }
    // Check for comma or newline separated values
    if (trimmed.includes(",") || trimmed.includes("\n")) {
      return trimmed
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter(Boolean);
    }
    // Single string or URL
    return [trimmed];
  }
  return [];
}

export function asObjects<T = Record<string, any>>(value: unknown): T[] {
  if (Array.isArray(value)) return value.filter((v) => v && typeof v === "object") as T[];
  if (typeof value === "string" && value.trim().startsWith("[") && value.trim().endsWith("]")) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.filter((v) => v && typeof v === "object") as T[];
    } catch {
      return [];
    }
  }
  return [];
}
