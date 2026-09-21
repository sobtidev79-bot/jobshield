// JobShield Risk Engine
// -----------------------------------------------------------------------
// Each rule inspects the submitted job data and, if triggered, returns a
// "signal" object describing what was found, why it matters, how much it
// contributes to the score, and the evidence that led to the flag.
//
// IMPORTANT: this is a heuristic, rule-based system. It looks for patterns
// that are *commonly* associated with scam postings. A high score is not
// proof of fraud, and a low score is not proof of legitimacy. The engine
// is intentionally transparent and easy to extend — add a rule, give it a
// weight, and it plugs into the scoring pipeline automatically.

const FREE_EMAIL_DOMAINS = [
  "gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "rediffmail.com",
  "aol.com", "icloud.com", "protonmail.com", "live.com", "yahoo.co.in",
  "mail.com", "zoho.com",
];

const URL_SHORTENERS = [
  "bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "is.gd", "cutt.ly",
  "rebrand.ly", "shorturl.at",
];

const GUARANTEE_PHRASES = [
  "100% guaranteed job", "guaranteed placement", "guaranteed selection",
  "no interview required", "selection is confirmed", "guaranteed offer",
  "100% job guarantee", "assured job", "guaranteed hire",
];

const URGENCY_PHRASES = [
  "limited seats", "apply within 24 hours", "hurry up", "only today",
  "immediate joining required", "act now", "offer expires today",
  "few slots left", "last date to apply is today", "urgently required",
  "apply immediately",
];

const PAYMENT_PHRASES = [
  "registration fee", "processing fee", "training fee", "security deposit",
  "refundable deposit", "pay to confirm", "activation fee", "kit fee",
  "documentation charge", "pay a fee", "one-time payment", "caution money",
];

const SENSITIVE_INFO_PHRASES = [
  "aadhaar", "aadhar number", "bank account number", "pan card number",
  "atm pin", "otp", "credit card number", "passport number", "cvv",
  "net banking password", "upi pin",
];

const VAGUE_COMPANY_PHRASES = [
  "reputed company", "leading mnc", "top company", "renowned organization",
  "confidential company", "well known company", "international client",
];

function extractEmailDomain(email) {
  if (!email) return null;
  const match = String(email).trim().match(/@([^\s@]+)$/);
  return match ? match[1].toLowerCase() : null;
}

function extractUrlDomain(url) {
  if (!url) return null;
  try {
    const withProtocol = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    const u = new URL(withProtocol);
    return u.hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
}

function containsAny(text, phrases) {
  if (!text) return [];
  const lower = text.toLowerCase();
  return phrases.filter((p) => lower.includes(p));
}

function findSalaryClaims(text) {
  if (!text) return [];
  // Matches patterns like "₹50,000/day", "50000 per week", "earn up to 1 lakh per month"
  const patterns = [
    /₹?\s?(\d[\d,]{3,})\s*(?:\/|per)\s*(day|week)/gi,
    /(\d+(?:\.\d+)?)\s*lakh[s]?\s*(?:\/|per)?\s*(month|week)?/gi,
    /earn\s+(?:up to\s+)?₹?\s?(\d[\d,]{3,})/gi,
  ];
  const hits = [];
  for (const re of patterns) {
    const matches = text.matchAll(re);
    for (const m of matches) hits.push(m[0].trim());
  }
  return hits;
}

/**
 * Each rule: (input) => signal | null
 * signal = { id, title, severity, scoreContribution, explanation, evidence, category }
 */
export const RULES = [
  // 1. Personal email instead of company domain
  function personalEmail({ recruiterEmail, companyName }) {
    const domain = extractEmailDomain(recruiterEmail);
    if (!domain) return null;
    if (FREE_EMAIL_DOMAINS.includes(domain)) {
      return {
        id: "personal_email",
        title: "Personal email address",
        severity: "medium",
        scoreContribution: 15,
        category: "Contact information",
        explanation:
          "The recruiter appears to be using a personal email provider instead of an address associated with a company domain. Legitimate recruiters usually contact candidates from a company-registered email address.",
        evidence: recruiterEmail,
      };
    }
    return null;
  },

  // 13. Recruiter contact mismatch (domain doesn't relate to company name)
  function contactMismatch({ recruiterEmail, companyName }) {
    const domain = extractEmailDomain(recruiterEmail);
    if (!domain || !companyName) return null;
    if (FREE_EMAIL_DOMAINS.includes(domain)) return null; // already covered
    const domainCore = domain.split(".")[0].replace(/[^a-z0-9]/gi, "");
    const nameCore = companyName.toLowerCase().replace(/[^a-z0-9]/gi, "");
    if (!nameCore || domainCore.length < 3) return null;
    const related = nameCore.includes(domainCore) || domainCore.includes(nameCore.slice(0, Math.min(6, nameCore.length)));
    if (!related) {
      return {
        id: "contact_mismatch",
        title: "Recruiter email doesn't match company name",
        severity: "medium",
        scoreContribution: 15,
        category: "Contact information",
        explanation:
          "The domain in the recruiter's email address doesn't appear to relate to the company name you entered. This can sometimes indicate the recruiter isn't actually affiliated with the company.",
        evidence: `Company: "${companyName}" — Email domain: "${domain}"`,
      };
    }
    return null;
  },

  // 2. Upfront payment / fee requests
  function upfrontFee({ jobDescription }) {
    const hits = containsAny(jobDescription, PAYMENT_PHRASES);
    if (hits.length > 0) {
      return {
        id: "upfront_fee",
        title: "Upfront payment or fee requested",
        severity: "high",
        scoreContribution: 30,
        category: "Payment requests",
        explanation:
          "The job description mentions a fee, deposit, or payment expected from the applicant. Legitimate employers do not typically ask candidates to pay to be hired, trained, or onboarded.",
        evidence: hits.slice(0, 3).join(", "),
      };
    }
    return null;
  },

  // 4. Sensitive info requested unusually early
  function sensitiveInfoEarly({ jobDescription }) {
    const hits = containsAny(jobDescription, SENSITIVE_INFO_PHRASES);
    if (hits.length > 0) {
      return {
        id: "sensitive_info",
        title: "Sensitive personal information requested",
        severity: "high",
        scoreContribution: 20,
        category: "Employer details",
        explanation:
          "The posting asks for sensitive personal or financial details (such as ID numbers or banking information) before any formal hiring process. This is unusual at the application stage.",
        evidence: hits.slice(0, 3).join(", "),
      };
    }
    return null;
  },

  // 5. Unrealistic salary
  function unrealisticSalary({ jobDescription }) {
    const hits = findSalaryClaims(jobDescription);
    if (hits.length > 0) {
      return {
        id: "unrealistic_salary",
        title: "Unusually high compensation claim",
        severity: "medium",
        scoreContribution: 15,
        category: "Compensation claims",
        explanation:
          "The posting advertises earnings that are notably high for the type of role or experience level described. Unusually generous pay is a common lure in scam postings, though some legitimate roles do pay well.",
        evidence: hits.slice(0, 2).join(", "),
      };
    }
    return null;
  },

  // 6. Guaranteed job language
  function guaranteedJob({ jobDescription }) {
    const hits = containsAny(jobDescription, GUARANTEE_PHRASES);
    if (hits.length > 0) {
      return {
        id: "guaranteed_job",
        title: '"Guaranteed job" language',
        severity: "medium",
        scoreContribution: 15,
        category: "Job description signals",
        explanation:
          'Phrases that promise a "guaranteed" offer or skip the interview process are a common pattern in scam listings, since legitimate hiring almost always involves some form of evaluation.',
        evidence: hits.slice(0, 2).join(", "),
      };
    }
    return null;
  },

  // 7. Urgency / pressure language
  function urgencyLanguage({ jobDescription }) {
    const hits = containsAny(jobDescription, URGENCY_PHRASES);
    if (hits.length > 0) {
      return {
        id: "urgency_language",
        title: "Urgency or pressure language",
        severity: "low",
        scoreContribution: 10,
        category: "Job description signals",
        explanation:
          "The listing uses language designed to make you act quickly (limited slots, tight deadlines). This kind of urgency is often used to discourage candidates from verifying details before responding.",
        evidence: hits.slice(0, 2).join(", "),
      };
    }
    return null;
  },

  // 8. Vague company information
  function vagueCompany({ jobDescription, companyName }) {
    const hits = containsAny(jobDescription, VAGUE_COMPANY_PHRASES);
    const noCompanyName = !companyName || companyName.trim().length < 2;
    if (hits.length > 0 || noCompanyName) {
      return {
        id: "vague_company",
        title: "Vague company information",
        severity: "low",
        scoreContribution: 10,
        category: "Employer details",
        explanation:
          "The posting doesn't clearly name the hiring company, or describes it only in generic terms (e.g. \"a reputed company\"). It's hard to verify an employer you can't identify.",
        evidence: hits.length > 0 ? hits.slice(0, 2).join(", ") : "No company name was provided.",
      };
    }
    return null;
  },

  // 9. Missing company website / 10. Suspicious domain (via job URL)
  function domainCheck({ jobUrl, companyName }) {
    if (!jobUrl) return null;
    const domain = extractUrlDomain(jobUrl);
    if (!domain) {
      return {
        id: "invalid_url",
        title: "Job link could not be read as a valid web address",
        severity: "low",
        scoreContribution: 10,
        category: "Suspicious external links",
        explanation:
          "The link you provided doesn't look like a standard web address, which makes it difficult to verify where it actually leads.",
        evidence: jobUrl,
      };
    }
    const isIp = /^\d{1,3}(\.\d{1,3}){3}$/.test(domain);
    const isShortener = URL_SHORTENERS.includes(domain);
    const suspiciousTld = /\.(xyz|top|club|work|click|link|info)$/i.test(domain);
    if (isIp || isShortener || suspiciousTld) {
      return {
        id: "suspicious_domain",
        title: "Suspicious link format",
        severity: "high",
        scoreContribution: 20,
        category: "Suspicious external links",
        explanation: isShortener
          ? "The job link uses a URL-shortening service, which hides the real destination. Scam postings sometimes use shorteners to disguise unofficial or unrelated websites."
          : isIp
          ? "The job link points to a raw numeric address rather than a named website, which is unusual for a legitimate company careers page."
          : "The job link uses a domain ending that is rarely used by established companies for their official career pages.",
        evidence: domain,
      };
    }
    // Loose check: does the domain relate to the company name at all?
    if (companyName) {
      const domainCore = domain.split(".")[0].replace(/[^a-z0-9]/gi, "");
      const nameCore = companyName.toLowerCase().replace(/[^a-z0-9]/gi, "");
      const related = nameCore.length > 2 && (domainCore.includes(nameCore.slice(0, Math.min(6, nameCore.length))) || nameCore.includes(domainCore.slice(0, Math.min(6, domainCore.length))));
      if (!related) {
        return {
          id: "url_company_mismatch",
          title: "Job link domain doesn't match company name",
          severity: "medium",
          scoreContribution: 15,
          category: "Employer details",
          explanation:
            "The website hosting this job posting doesn't appear to share a name with the company you entered. This is worth double-checking directly on the company's own site.",
          evidence: `Company: "${companyName}" — Link domain: "${domain}"`,
        };
      }
    }
    return null;
  },

  // 12. Poorly written / vague job description
  function vagueDescription({ jobDescription }) {
    if (!jobDescription) return null;
    const text = jobDescription.trim();
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const hasBulletOrStructure = /[-•\n]/.test(text);
    if (wordCount < 40 && !hasBulletOrStructure) {
      return {
        id: "vague_description",
        title: "Very brief or unstructured description",
        severity: "low",
        scoreContribution: 10,
        category: "Job description signals",
        explanation:
          "The job description is quite short and doesn't outline specific responsibilities, requirements, or qualifications. Genuine postings usually give candidates enough detail to judge role fit.",
        evidence: `${wordCount} words provided`,
      };
    }
    return null;
  },

  // 11. Not found on official careers page (cannot verify automatically)
  function careersPageUnverified({ jobUrl, companyName }) {
    if (!companyName) return null;
    // We deliberately do NOT scrape arbitrary sites. This is flagged as an
    // "unable to verify automatically" item that the user should check
    // themselves, rather than a scored risk signal.
    return {
      id: "careers_unverified",
      title: "Could not be automatically verified on the company's careers page",
      severity: "info",
      scoreContribution: 0,
      category: "Employer details",
      explanation:
        "JobShield doesn't browse external company websites on your behalf. We recommend checking this vacancy against the company's own official careers page before proceeding.",
      evidence: jobUrl ? `Provided link: ${jobUrl}` : "No job link was provided.",
      informational: true,
    };
  },
];

/**
 * Positive signals — reasons for some reassurance. These do not subtract
 * from the score (a scam can still include some "normal-looking" details);
 * they're shown separately so the user gets a balanced picture.
 */
export const POSITIVE_RULES = [
  function hasCompanyDomain({ recruiterEmail }) {
    const domain = extractEmailDomain(recruiterEmail);
    if (domain && !FREE_EMAIL_DOMAINS.includes(domain)) {
      return {
        id: "company_domain_email",
        title: "Recruiter is using a company-associated email",
        detail: `Email domain: ${domain}`,
      };
    }
    return null;
  },
  function hasWebsite({ jobUrl }) {
    if (jobUrl && extractUrlDomain(jobUrl)) {
      return {
        id: "has_link",
        title: "A job link was provided for reference",
        detail: extractUrlDomain(jobUrl),
      };
    }
    return null;
  },
  function detailedDescription({ jobDescription }) {
    if (!jobDescription) return null;
    const wordCount = jobDescription.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount >= 80) {
      return {
        id: "detailed_description",
        title: "Job description includes specific detail",
        detail: `${wordCount} words describing the role`,
      };
    }
    return null;
  },
  function noPaymentMentioned({ jobDescription }) {
    const hits = containsAny(jobDescription, PAYMENT_PHRASES);
    if (jobDescription && hits.length === 0) {
      return {
        id: "no_payment_language",
        title: "No payment or fee language detected",
        detail: "The description doesn't mention any upfront charges.",
      };
    }
    return null;
  },
  function companyNameProvided({ companyName }) {
    if (companyName && companyName.trim().length > 1) {
      return {
        id: "company_named",
        title: "A specific company name was provided",
        detail: companyName,
      };
    }
    return null;
  },
];

export const CHECKS_PERFORMED = [
  "Recruiter email domain analysis",
  "Payment and fee language detection",
  "Sensitive information request detection",
  "Compensation claim analysis",
  "Guaranteed-employment language detection",
  "Urgency and pressure language detection",
  "Company information completeness check",
  "Job link / domain pattern analysis",
  "Description length and structure review",
];
