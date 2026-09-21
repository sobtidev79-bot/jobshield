import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import type { RiskSignal } from "../types";
import { EvidenceBlock } from "./EvidenceBlock";

const SEVERITY_META = {
  high: { icon: AlertTriangle, color: "var(--color-danger-strong)", label: "Significant" },
  medium: { icon: AlertCircle, color: "var(--color-warning)", label: "Worth checking" },
  low: { icon: AlertCircle, color: "var(--color-ink-faint)", label: "Minor" },
  info: { icon: Info, color: "var(--color-ink-faint)", label: "For your information" },
};

export function RiskSignalCard({ signal }: { signal: RiskSignal }) {
  const meta = SEVERITY_META[signal.severity];
  const Icon = meta.icon;
  return (
    <div className="border-b border-[var(--color-line)] py-4 last:border-b-0">
      <div className="flex items-start gap-3">
        <Icon size={18} style={{ color: meta.color }} className="mt-0.5 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h4 className="font-medium text-[var(--color-ink)]">{signal.title}</h4>
            <span
              className="rounded-full px-2 py-0.5 text-[11px] font-medium"
              style={{ color: meta.color, backgroundColor: `color-mix(in srgb, ${meta.color} 12%, transparent)` }}
            >
              {meta.label}
            </span>
          </div>
          <p className="mt-1 text-sm leading-relaxed text-[var(--color-ink-soft)]">{signal.explanation}</p>
          <EvidenceBlock evidence={signal.evidence} />
        </div>
      </div>
    </div>
  );
}
