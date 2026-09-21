import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, ListChecks } from "lucide-react";
import { fetchAnalysis } from "../lib/api";
import type { AnalysisResult } from "../types";
import { RiskScore } from "../components/RiskScore";
import { RiskSignalCard } from "../components/RiskSignalCard";
import { PositiveSignals } from "../components/PositiveSignals";
import { VerificationSteps } from "../components/VerificationSteps";

export function ResultPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchAnalysis(id)
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "We couldn't load this analysis."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 px-5 py-24 text-center">
        <Loader2 size={22} className="animate-spin text-[var(--color-brand)]" />
        <p className="text-sm text-[var(--color-ink-faint)]">Loading the analysis...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-24 text-center">
        <p className="text-sm text-[var(--color-danger)]">{error || "We couldn't find that analysis."}</p>
        <Link to="/" className="mt-4 inline-block text-sm font-medium text-[var(--color-brand)] underline underline-offset-2">
          Start a new check
        </Link>
      </div>
    );
  }

  const companyName = data.companyName || data.company_name;
  const jobTitle = data.jobTitle || data.job_title;

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:py-14">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-[var(--color-ink-faint)] hover:text-[var(--color-ink)]">
        <ArrowLeft size={15} /> Check another job
      </Link>

      <p className="mt-6 text-sm font-medium text-[var(--color-brand-soft)]">Job Safety Check</p>
      <div className="mt-1 flex flex-wrap items-baseline gap-x-2">
        <h1 className="font-display text-2xl font-bold text-[var(--color-ink)]">{jobTitle || "Job posting"}</h1>
        {companyName && <span className="text-[var(--color-ink-faint)]">· {companyName}</span>}
      </div>

      <div className="mt-7 rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-raised)] p-6 sm:p-7">
        <RiskScore score={data.score} level={data.riskLevel} />
        <p className="mt-5 border-t border-[var(--color-line)] pt-5 text-[15px] leading-relaxed text-[var(--color-ink-soft)]">
          {data.summary}
        </p>
      </div>

      {data.riskSignals.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-lg font-semibold text-[var(--color-ink)]">Key concerns</h2>
          <div className="mt-4 rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-raised)] px-5">
            {data.riskSignals.map((s) => (
              <RiskSignalCard key={s.id} signal={s} />
            ))}
          </div>
        </section>
      )}

      {data.infoSignals.length > 0 && (
        <section className="mt-6">
          <div className="rounded-xl border border-dashed border-[var(--color-line-strong)] px-5 py-4">
            {data.infoSignals.map((s) => (
              <p key={s.id} className="text-sm text-[var(--color-ink-faint)]">
                <span className="font-medium text-[var(--color-ink-soft)]">{s.title}.</span> {s.explanation}
              </p>
            ))}
          </div>
        </section>
      )}

      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold text-[var(--color-ink)]">Positive signals</h2>
        <div className="mt-4 rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-raised)] p-5">
          <PositiveSignals signals={data.positiveSignals} />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold text-[var(--color-ink)]">What you should verify</h2>
        <div className="mt-4 rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-raised)] p-5">
          <VerificationSteps steps={data.verificationSteps} />
        </div>
      </section>

      <section className="mt-10 mb-8">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-[var(--color-ink)]">
          <ListChecks size={18} className="text-[var(--color-ink-faint)]" />
          Analysis details
        </h2>
        <p className="mt-2 text-sm text-[var(--color-ink-faint)]">Checks performed on this posting:</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {data.checksPerformed.map((c) => (
            <span key={c} className="rounded-full border border-[var(--color-line)] bg-[var(--color-paper-raised)] px-3 py-1 text-xs text-[var(--color-ink-soft)]">
              {c}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
