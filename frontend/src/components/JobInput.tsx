import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import type { AnalyzeRequest } from "../types";

interface Props {
  onSubmit: (payload: AnalyzeRequest) => void;
  loading: boolean;
  error: string | null;
}

type Tab = "description" | "url";

export function JobInput({ onSubmit, loading, error }: Props) {
  const [tab, setTab] = useState<Tab>("description");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [recruiterEmail, setRecruiterEmail] = useState("");
  const [touched, setTouched] = useState(false);

  const isEmpty = tab === "description" ? description.trim().length === 0 : url.trim().length === 0;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (isEmpty) return;
    onSubmit({
      job_description: tab === "description" ? description : undefined,
      job_url: tab === "url" ? url : description ? undefined : url || undefined,
      company_name: companyName || undefined,
      recruiter_email: recruiterEmail || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-raised)] p-5 sm:p-7 shadow-[0_1px_0_rgba(0,0,0,0.02)]">
      <div className="inline-flex rounded-lg bg-[var(--color-paper)] p-1 border border-[var(--color-line)]" role="tablist" aria-label="Job input method">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "description"}
          onClick={() => setTab("description")}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
            tab === "description" ? "bg-[var(--color-brand)] text-white" : "text-[var(--color-ink-soft)]"
          }`}
        >
          Job description
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "url"}
          onClick={() => setTab("url")}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
            tab === "url" ? "bg-[var(--color-brand)] text-white" : "text-[var(--color-ink-soft)]"
          }`}
        >
          Job URL
        </button>
      </div>

      <div className="mt-4">
        {tab === "description" ? (
          <div>
            <label htmlFor="job-description" className="mb-1.5 block text-sm font-medium text-[var(--color-ink)]">
              Paste the job description
            </label>
            <textarea
              id="job-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={7}
              placeholder="Paste the full job posting text here, including responsibilities, requirements, and any contact details..."
              className="w-full resize-y rounded-lg border border-[var(--color-line-strong)] bg-white px-3.5 py-3 text-sm leading-relaxed text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:border-[var(--color-brand)] focus:outline-none"
            />
          </div>
        ) : (
          <div>
            <label htmlFor="job-url" className="mb-1.5 block text-sm font-medium text-[var(--color-ink)]">
              Job posting link
            </label>
            <input
              id="job-url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/careers/frontend-intern"
              className="w-full rounded-lg border border-[var(--color-line-strong)] bg-white px-3.5 py-2.5 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:border-[var(--color-brand)] focus:outline-none"
            />
            <p className="mt-1.5 text-xs text-[var(--color-ink-faint)]">
              We check the link's format and pattern — we don't visit or scrape the page.
            </p>
          </div>
        )}
        {touched && isEmpty && (
          <p className="mt-1.5 text-xs text-[var(--color-danger)]">
            {tab === "description" ? "Paste a job description to continue." : "Enter a job link to continue."}
          </p>
        )}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="company-name" className="mb-1.5 block text-sm font-medium text-[var(--color-ink)]">
            Company name <span className="font-normal text-[var(--color-ink-faint)]">(optional)</span>
          </label>
          <input
            id="company-name"
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="e.g. Acme Technologies"
            className="w-full rounded-lg border border-[var(--color-line-strong)] bg-white px-3.5 py-2.5 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:border-[var(--color-brand)] focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="recruiter-email" className="mb-1.5 block text-sm font-medium text-[var(--color-ink)]">
            Recruiter email <span className="font-normal text-[var(--color-ink-faint)]">(optional)</span>
          </label>
          <input
            id="recruiter-email"
            type="text"
            value={recruiterEmail}
            onChange={(e) => setRecruiterEmail(e.target.value)}
            placeholder="e.g. hr@company.com"
            className="w-full rounded-lg border border-[var(--color-line-strong)] bg-white px-3.5 py-2.5 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:border-[var(--color-brand)] focus:outline-none"
          />
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-[var(--color-danger)]/30 bg-[var(--color-danger-bg)] px-3.5 py-2.5 text-sm text-[var(--color-danger)]">
          {error}
        </div>
      )}

      <div className="mt-5 flex flex-col-reverse items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-[var(--color-ink-faint)] max-w-sm">
          Don't paste passwords, ID numbers, or banking details — JobShield only needs the posting details.
        </p>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[var(--color-brand)] px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? "Checking the details..." : "Analyze this job"}
        </button>
      </div>
    </form>
  );
}
