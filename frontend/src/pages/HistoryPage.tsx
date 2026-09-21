import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Inbox, Loader2 } from "lucide-react";
import { fetchHistory } from "../lib/api";
import type { HistoryItem, RiskLevel } from "../types";
import { RiskBadge } from "../components/RiskBadge";

const FILTERS: { label: string; value: RiskLevel | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Low", value: "LOW" },
  { label: "Moderate", value: "MODERATE" },
  { label: "High", value: "HIGH" },
  { label: "Very High", value: "VERY_HIGH" },
];

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

export function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<RiskLevel | "ALL">("ALL");

  useEffect(() => {
    fetchHistory()
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesFilter = filter === "ALL" || item.riskLevel === filter;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        item.jobTitle?.toLowerCase().includes(q) ||
        item.companyName?.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [items, query, filter]);

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 sm:py-14">
      <h1 className="font-display text-2xl font-bold text-[var(--color-ink)]">History</h1>
      <p className="mt-2 text-sm text-[var(--color-ink-soft)]">Jobs you've checked, most recent first.</p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-faint)]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by role or company"
            className="w-full rounded-lg border border-[var(--color-line-strong)] bg-white py-2 pl-9 pr-3 text-sm focus:border-[var(--color-brand)] focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                filter === f.value
                  ? "border-[var(--color-brand)] bg-[var(--color-brand)] text-white"
                  : "border-[var(--color-line-strong)] text-[var(--color-ink-soft)] hover:bg-[var(--color-line)]/40"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-[var(--color-ink-faint)]">
            <Loader2 size={16} className="animate-spin" /> Loading history...
          </div>
        ) : filtered.length === 0 && items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-[var(--color-line-strong)] py-16 text-center">
            <Inbox size={22} className="text-[var(--color-ink-faint)]" />
            <p className="text-sm text-[var(--color-ink-soft)]">You haven't checked any jobs yet.</p>
            <Link to="/" className="mt-1 text-sm font-medium text-[var(--color-brand)] underline underline-offset-2">
              Analyze your first posting
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-12 text-center text-sm text-[var(--color-ink-faint)]">No results match your search.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-raised)]">
            {filtered.map((item, i) => (
              <Link
                key={item.id}
                to={`/result/${item.id}`}
                className={`flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-[var(--color-paper)] ${
                  i !== 0 ? "border-t border-[var(--color-line)]" : ""
                }`}
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-[var(--color-ink)]">{item.jobTitle || "Job posting"}</div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-[var(--color-ink-faint)]">
                    {item.companyName && <span className="truncate">{item.companyName}</span>}
                    <span>·</span>
                    <span>{formatDate(item.createdAt)}</span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="font-display text-sm font-semibold tabular-nums text-[var(--color-ink)]">{item.score}</span>
                  <RiskBadge level={item.riskLevel} size="sm" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
