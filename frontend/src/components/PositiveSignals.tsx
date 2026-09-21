import { Check } from "lucide-react";
import type { PositiveSignal } from "../types";

export function PositiveSignals({ signals }: { signals: PositiveSignal[] }) {
  if (signals.length === 0) {
    return (
      <p className="text-sm text-[var(--color-ink-faint)]">
        We didn't find any specific reassuring details in what was provided — that isn't necessarily a bad sign, it just means there's less here to go on.
      </p>
    );
  }
  return (
    <ul className="space-y-2.5">
      {signals.map((s) => (
        <li key={s.id} className="flex items-start gap-2.5 text-sm">
          <Check size={16} className="mt-0.5 shrink-0 text-[var(--color-success)]" />
          <span>
            <span className="text-[var(--color-ink)]">{s.title}</span>
            <span className="text-[var(--color-ink-faint)]"> — {s.detail}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
