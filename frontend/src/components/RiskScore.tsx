import type { RiskLevel } from "../types";
import { RiskBadge } from "./RiskBadge";

const ZONES: { level: RiskLevel; from: number; to: number }[] = [
  { level: "LOW", from: 0, to: 25 },
  { level: "MODERATE", from: 25, to: 50 },
  { level: "HIGH", from: 50, to: 75 },
  { level: "VERY_HIGH", from: 75, to: 100 },
];

const ZONE_COLOR: Record<RiskLevel, string> = {
  LOW: "var(--color-success)",
  MODERATE: "var(--color-warning)",
  HIGH: "var(--color-danger)",
  VERY_HIGH: "var(--color-danger-strong)",
};

export function RiskScore({ score, level }: { score: number; level: RiskLevel }) {
  const clamped = Math.max(0, Math.min(100, score));
  return (
    <div>
      <div className="flex items-end gap-4">
        <div className="font-display text-6xl font-bold leading-none tabular-nums" style={{ color: ZONE_COLOR[level] }}>
          {clamped}
        </div>
        <div className="pb-1.5">
          <div className="text-xs uppercase tracking-wide text-[var(--color-ink-faint)] mb-1.5">out of 100</div>
          <RiskBadge level={level} />
        </div>
      </div>

      <div className="mt-5 relative">
        <div className="flex h-2 w-full overflow-hidden rounded-full">
          {ZONES.map((z) => (
            <div
              key={z.level}
              style={{ width: `${z.to - z.from}%`, backgroundColor: ZONE_COLOR[z.level], opacity: 0.35 }}
            />
          ))}
        </div>
        <div
          className="absolute -top-1 h-4 w-[3px] rounded-full bg-[var(--color-ink)] transition-[left] duration-300"
          style={{ left: `${clamped}%` }}
          aria-hidden="true"
        />
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] text-[var(--color-ink-faint)]">
        <span>Low</span>
        <span>Moderate</span>
        <span>High</span>
        <span>Very High</span>
      </div>
    </div>
  );
}
