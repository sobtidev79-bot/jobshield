import type { RiskLevel } from "../types";

const STYLES: Record<RiskLevel, { bg: string; fg: string; label: string }> = {
  LOW: { bg: "bg-[var(--color-success-bg)]", fg: "text-[var(--color-success)]", label: "Low Risk" },
  MODERATE: { bg: "bg-[var(--color-warning-bg)]", fg: "text-[var(--color-warning)]", label: "Moderate Risk" },
  HIGH: { bg: "bg-[var(--color-danger-bg)]", fg: "text-[var(--color-danger)]", label: "High Risk" },
  VERY_HIGH: { bg: "bg-[var(--color-danger-strong-bg)]", fg: "text-[var(--color-danger-strong)]", label: "Very High Risk" },
};

export function RiskBadge({ level, size = "md" }: { level: RiskLevel; size?: "sm" | "md" }) {
  const s = STYLES[level];
  const padding = size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${s.bg} ${s.fg} ${padding}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {s.label}
    </span>
  );
}
