import { Building2, Mail, Wallet, CreditCard, FileText } from "lucide-react";

const CATEGORIES = [
  { icon: Building2, title: "Employer details", desc: "Whether the company can be clearly identified and its details hold together." },
  { icon: Mail, title: "Contact information", desc: "Whether the recruiter's email matches the company they claim to represent." },
  { icon: Wallet, title: "Compensation claims", desc: "Whether the advertised pay is realistic for the role described." },
  { icon: CreditCard, title: "Payment requests", desc: "Whether you're being asked to pay a fee, deposit, or charge to proceed." },
  { icon: FileText, title: "Job description signals", desc: "Language patterns often used to pressure or rush applicants." },
];

export function CategoryOverview() {
  return (
    <div>
      <h2 className="font-display text-lg font-semibold text-[var(--color-ink)]">Things we check</h2>
      <div className="mt-4 grid gap-px overflow-hidden rounded-xl border border-[var(--color-line)] bg-[var(--color-line)] sm:grid-cols-2 lg:grid-cols-5">
        {CATEGORIES.map((c) => (
          <div key={c.title} className="bg-[var(--color-paper-raised)] p-4">
            <c.icon size={18} className="text-[var(--color-brand)]" />
            <h3 className="mt-2.5 text-sm font-medium text-[var(--color-ink)]">{c.title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-[var(--color-ink-faint)]">{c.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
