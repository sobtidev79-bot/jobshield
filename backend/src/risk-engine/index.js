import { RULES, POSITIVE_RULES, CHECKS_PERFORMED } from "./rules.js";

const SEVERITY_WEIGHT = { high: 3, medium: 2, low: 1, info: 0 };

function levelFromScore(score) {
  if (score >= 75) return "VERY_HIGH";
  if (score >= 50) return "HIGH";
  if (score >= 25) return "MODERATE";
  return "LOW";
}

const LEVEL_LABEL = {
  LOW: "Low Risk",
  MODERATE: "Moderate Risk",
  HIGH: "High Risk",
  VERY_HIGH: "Very High Risk",
};

const LEVEL_SUMMARY = {
  LOW: "We didn't find major warning signals in what you shared, but this isn't proof that the employer is legitimate. It's still worth doing a quick independent check.",
  MODERATE: "We found a few details worth a closer look before you move forward. None of them are conclusive on their own.",
  HIGH: "We found several signals that deserve verification before you proceed. Please avoid sharing sensitive information or making any payment until you've confirmed these independently.",
  VERY_HIGH: "This posting shows a significant number of signals commonly associated with job scams. We'd strongly recommend independently verifying the employer before taking any further action.",
};

/**
 * Runs the full rule-based analysis over a submitted job.
 * @param {{jobDescription?: string, jobUrl?: string, companyName?: string, recruiterEmail?: string}} input
 */
export function analyzeJob(input) {
  const normalized = {
    jobDescription: (input.jobDescription || "").trim(),
    jobUrl: (input.jobUrl || "").trim(),
    companyName: (input.companyName || "").trim(),
    recruiterEmail: (input.recruiterEmail || "").trim(),
  };

  const rawSignals = RULES.map((rule) => rule(normalized)).filter(Boolean);

  // Scored signals contribute to the number; informational ones are shown
  // but don't move the score (e.g. "we can't verify this automatically").
  const scoredSignals = rawSignals.filter((s) => !s.informational);
  const infoSignals = rawSignals.filter((s) => s.informational);

  const rawScore = scoredSignals.reduce((sum, s) => sum + s.scoreContribution, 0);
  const score = Math.max(0, Math.min(100, rawScore));
  const riskLevel = levelFromScore(score);

  const positiveSignals = POSITIVE_RULES
    .map((rule) => rule(normalized))
    .filter(Boolean);

  // Sort concerns by severity so the most serious appear first.
  const riskSignals = [...scoredSignals].sort(
    (a, b) => (SEVERITY_WEIGHT[b.severity] ?? 0) - (SEVERITY_WEIGHT[a.severity] ?? 0)
  );

  const verificationSteps = buildVerificationSteps(riskSignals, normalized);

  return {
    score,
    riskLevel,
    riskLevelLabel: LEVEL_LABEL[riskLevel],
    summary: LEVEL_SUMMARY[riskLevel],
    riskSignals,
    infoSignals,
    positiveSignals,
    verificationSteps,
    checksPerformed: CHECKS_PERFORMED,
  };
}

function buildVerificationSteps(riskSignals, input) {
  const steps = [
    "Open the company's official website independently (don't rely on a link sent to you).",
    "Look for the same vacancy listed on the company's own careers page.",
    "Contact the company through publicly listed contact information, not just the recruiter's details.",
  ];

  const hasPayment = riskSignals.some((s) => s.id === "upfront_fee");
  const hasSensitive = riskSignals.some((s) => s.id === "sensitive_info");
  const hasPersonalEmail = riskSignals.some((s) => s.id === "personal_email" || s.id === "contact_mismatch");
  const hasDomain = riskSignals.some((s) => ["suspicious_domain", "url_company_mismatch", "invalid_url"].includes(s.id));

  if (hasPayment) steps.push("Do not pay any application, training, registration, or deposit fee.");
  if (hasSensitive) steps.push("Do not share ID numbers, banking details, or one-time passwords during the application stage.");
  if (hasPersonalEmail) steps.push("Ask the recruiter to confirm their identity through an official company channel.");
  if (hasDomain) steps.push("Check the domain age and ownership of the job link before trusting it (e.g. via a WHOIS lookup).");

  steps.push("Trust your judgment — if something feels off, it's reasonable to pause and ask more questions.");
  return steps;
}
