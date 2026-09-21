export function VerificationSteps({ steps }: { steps: string[] }) {
  return (
    <ol className="space-y-3">
      {steps.map((step, i) => (
        <li key={i} className="flex gap-3 text-sm leading-relaxed">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand)] text-[11px] font-medium text-white">
            {i + 1}
          </span>
          <span className="text-[var(--color-ink-soft)]">{step}</span>
        </li>
      ))}
    </ol>
  );
}
