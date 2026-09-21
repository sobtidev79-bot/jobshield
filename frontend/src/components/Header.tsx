import { Link, useLocation } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

const NAV = [
  { to: "/", label: "Analyze" },
  { to: "/history", label: "History" },
  { to: "/about", label: "About" },
];

export function Header() {
  const location = useLocation();
  return (
    <header className="border-b border-[var(--color-line)] bg-[var(--color-paper)]/90 backdrop-blur-sm sticky top-0 z-20">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold text-[var(--color-brand)]">
          <ShieldCheck size={22} strokeWidth={2.2} />
          JobShield
        </Link>
        <nav className="flex items-center gap-1">
          {NAV.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-[var(--color-brand)] text-white"
                    : "text-[var(--color-ink-soft)] hover:bg-[var(--color-line)]/60"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
