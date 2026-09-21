export function EvidenceBlock({ evidence }: { evidence: string }) {
  if (!evidence) return null;
  return (
    <div className="mt-2 rounded-md border border-[var(--color-line)] bg-[var(--color-paper)] px-3 py-2">
      <div className="text-[10px] font-medium uppercase tracking-wide text-[var(--color-ink-faint)]">Evidence</div>
      <div className="mt-0.5 text-sm text-[var(--color-ink-soft)] break-words font-mono">{evidence}</div>
    </div>
  );
}
