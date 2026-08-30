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
  if (Array.isArray(value)) return value.filter((v) => typeof v === "string");
  return [];
}

export function asObjects<T = Record<string, any>>(value: unknown): T[] {
  if (Array.isArray(value)) return value.filter((v) => v && typeof v === "object") as T[];
  return [];
}
