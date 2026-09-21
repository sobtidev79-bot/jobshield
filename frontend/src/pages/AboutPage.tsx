export function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-10 sm:py-14">
      <h1 className="font-display text-2xl font-bold text-[var(--color-ink)]">About JobShield</h1>
      <p className="mt-4 text-[15px] leading-relaxed text-[var(--color-ink-soft)]">
        JobShield does not guarantee that a job is legitimate or fraudulent. It's a tool for spotting
        patterns that are commonly associated with scam postings, so you can decide what to verify before
        you apply, share your details, or make a payment.
      </p>

      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold text-[var(--color-ink)]">What we check</h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-soft)]">
          Each analysis looks at the details you provide — the job description, an optional link, company
          name, and recruiter email — for a set of known warning signs: requests for upfront payment,
          unrealistic salary claims, personal email addresses standing in for a company domain, urgency
          language, vague company information, and a handful of others. Every signal we detect comes with
          a plain-language explanation and the specific evidence that triggered it.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-lg font-semibold text-[var(--color-ink)]">How risk scoring works</h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-soft)]">
          JobShield uses a transparent, rule-based scoring system — not a black-box AI model. Each detected
          signal contributes a fixed number of points based on how strongly it's associated with scam
          postings in general (for example, an upfront fee request contributes more than a vague company
          description). The points are added up into a score from 0–100, which maps to a risk level:
        </p>
        <div className="mt-4 overflow-hidden rounded-lg border border-[var(--color-line)]">
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-[var(--color-line)] bg-[var(--color-paper-raised)]">
                <td className="px-4 py-2.5 font-medium text-[var(--color-success)]">0–24</td>
                <td className="px-4 py-2.5 text-[var(--color-ink-soft)]">Low Risk</td>
              </tr>
              <tr className="border-b border-[var(--color-line)] bg-[var(--color-paper-raised)]">
                <td className="px-4 py-2.5 font-medium text-[var(--color-warning)]">25–49</td>
                <td className="px-4 py-2.5 text-[var(--color-ink-soft)]">Moderate Risk</td>
              </tr>
              <tr className="border-b border-[var(--color-line)] bg-[var(--color-paper-raised)]">
                <td className="px-4 py-2.5 font-medium text-[var(--color-danger)]">50–74</td>
                <td className="px-4 py-2.5 text-[var(--color-ink-soft)]">High Risk</td>
              </tr>
              <tr className="bg-[var(--color-paper-raised)]">
                <td className="px-4 py-2.5 font-medium text-[var(--color-danger-strong)]">75–100</td>
                <td className="px-4 py-2.5 text-[var(--color-ink-soft)]">Very High Risk</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-[var(--color-ink-faint)]">
          These thresholds are product heuristics based on common scam patterns — not proof of fraud. A
          low score doesn't confirm a job is genuine, and a high score doesn't confirm it's a scam.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-lg font-semibold text-[var(--color-ink)]">What you should verify yourself</h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-soft)]">
          JobShield doesn't browse company websites, verify identities, or contact recruiters on your
          behalf. Every result includes a short list of things worth checking independently — like looking
          the company up on its own careers page, or confirming a recruiter's identity through a public
          company channel. Those steps matter more than any single score.
        </p>
      </section>

      <section className="mt-8 mb-8">
        <h2 className="font-display text-lg font-semibold text-[var(--color-ink)]">Privacy</h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-soft)]">
          Please don't paste passwords, government ID numbers, banking details, or other sensitive
          documents into JobShield — we only need the details of the job posting itself. We store the job
          description, optional links, and the resulting analysis so you can revisit it in your history;
          we don't ask for or store identity documents.
        </p>
      </section>
    </div>
  );
}
