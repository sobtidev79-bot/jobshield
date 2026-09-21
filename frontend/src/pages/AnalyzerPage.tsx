import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { analyzeJob } from "../lib/api";
import { JobInput } from "../components/JobInput";
import { CategoryOverview } from "../components/CategoryOverview";
import type { AnalyzeRequest } from "../types";

export function AnalyzerPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleSubmit(payload: AnalyzeRequest) {
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeJob(payload);
      navigate(`/result/${result.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't analyze this posting right now. Try again or paste the job description.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 sm:py-14">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
        <div className="lg:sticky lg:top-24">
          <p className="text-sm font-medium text-[var(--color-brand-soft)]">Check before you apply.</p>
          <h1 className="mt-3 font-display text-[2.1rem] font-bold leading-[1.15] text-[var(--color-ink)] sm:text-[2.5rem]">
            Not every job posting is what it looks like.
          </h1>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[var(--color-ink-soft)]">
            Check a job posting for common scam signals before you share your details or make a payment. Paste the description or link below — it takes about ten seconds.
          </p>
          <p className="mt-6 text-xs leading-relaxed text-[var(--color-ink-faint)] max-w-md">
            JobShield looks for patterns commonly seen in scam postings. It doesn't guarantee a job is fake or genuine — use it as one input alongside your own judgment.
          </p>
        </div>

        <JobInput onSubmit={handleSubmit} loading={loading} error={error} />
      </div>

      <div className="mt-16 sm:mt-20">
        <CategoryOverview />
      </div>
    </div>
  );
}
